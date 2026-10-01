import { DEMO_USERS } from "../src/lib/auth";

const BASE_URL = "http://localhost:3000";

async function runRbacTests() {
  console.log("==================================================");
  console.log("    ROLE-BASED ACCESS CONTROL (RBAC) TEST SUITE   ");
  console.log("==================================================");

  const tokens: Record<string, string> = {};

  // 1. Test Login for all 4 Roles
  console.log("\n[TEST 1] Testing Authentication for all 4 Roles:");
  for (const user of DEMO_USERS) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: user.passwordHash }),
    });

    if (!res.ok) {
      throw new Error(`Failed to login as ${user.role} (${user.email})`);
    }

    const json = await res.json();
    tokens[user.role] = json.token;
    console.log(`  ✓ Login successful as [${user.role}] - ${user.name}`);
  }

  // 2. Test Invalid Login
  console.log("\n[TEST 2] Testing Invalid Credentials Rejection:");
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@aurafoods.com", password: "wrongpassword" }),
  });
  if (badLoginRes.status === 401) {
    console.log("  ✓ Correctly returned 401 Unauthorized for invalid password");
  } else {
    throw new Error(`Expected 401 for bad login, got ${badLoginRes.status}`);
  }

  // 3. Test Requirement 6: Franchise URL Tamper Prevention
  console.log("\n[TEST 3] Testing Requirement 6: Franchise Outlet Isolation:");
  const franchiseToken = tokens["FRANCHISE"];

  // 3a. Franchisee accesses their assigned outlet (OUT-042)
  const allowedOutletRes = await fetch(`${BASE_URL}/api/outlets/OUT-042`, {
    headers: { Authorization: `Bearer ${franchiseToken}` },
  });
  if (allowedOutletRes.ok) {
    console.log("  ✓ Franchisee accessed assigned outlet OUT-042 (200 OK)");
  } else {
    throw new Error(`Failed to access assigned outlet OUT-042: ${allowedOutletRes.status}`);
  }

  // 3b. Franchisee attempts to access another outlet by changing URL (OUT-089)
  const forbiddenOutletRes = await fetch(`${BASE_URL}/api/outlets/OUT-089`, {
    headers: { Authorization: `Bearer ${franchiseToken}` },
  });
  if (forbiddenOutletRes.status === 403) {
    const errJson = await forbiddenOutletRes.json();
    console.log(`  ✓ Blocked URL tamper to OUT-089: 403 Forbidden ("${errJson.error}")`);
  } else {
    throw new Error(`Expected 403 Forbidden for unauthorized outlet access, got ${forbiddenOutletRes.status}`);
  }

  // 4. Test Executive Owner Operational Edit Restriction
  console.log("\n[TEST 4] Testing Owner Operational Edit Restriction:");
  const ownerToken = tokens["OWNER"];
  const ownerEditRes = await fetch(`${BASE_URL}/api/outlets/OUT-042/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ownerToken}`,
    },
    body: JSON.stringify({ quantity: 10, revenue: 5000, productId: "PRD-101" }),
  });

  if (ownerEditRes.status === 403) {
    const errJson = await ownerEditRes.json();
    console.log(`  ✓ Owner blocked from operational edit: 403 Forbidden ("${errJson.error}")`);
  } else {
    throw new Error(`Expected 403 Forbidden for owner editing sales, got ${ownerEditRes.status}`);
  }

  // 5. Test Franchisee Submitting Sales to Assigned Outlet
  console.log("\n[TEST 5] Testing Franchisee Operational Submission:");
  const franchiseSubmitRes = await fetch(`${BASE_URL}/api/outlets/OUT-042/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${franchiseToken}`,
    },
    body: JSON.stringify({ quantity: 20, revenue: 12000, productId: "PRD-101" }),
  });

  if (franchiseSubmitRes.ok) {
    console.log("  ✓ Franchisee submitted sales for assigned outlet OUT-042 (200 OK)");
  } else {
    throw new Error(`Failed franchisee sales submission: ${franchiseSubmitRes.status}`);
  }

  // 6. Test Financial Reports (Owner & Admin Only)
  console.log("\n[TEST 6] Testing Financial Reports Authorization (Owner & Admin):");
  const ownerReportRes = await fetch(`${BASE_URL}/api/reports/financials`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  if (ownerReportRes.ok) {
    console.log("  ✓ Owner authorized to view confidential financials (200 OK)");
  } else {
    throw new Error(`Owner could not access financials: ${ownerReportRes.status}`);
  }

  const officerReportRes = await fetch(`${BASE_URL}/api/reports/financials`, {
    headers: { Authorization: `Bearer ${tokens["OFFICER"]}` },
  });
  if (officerReportRes.status === 403) {
    console.log("  ✓ Officer denied access to executive financials (403 Forbidden)");
  } else {
    throw new Error(`Officer unexpectedly accessed financials: ${officerReportRes.status}`);
  }

  console.log("\n==================================================");
  console.log("   ALL RBAC & AUTHENTICATION TESTS PASSED 100%!   ");
  console.log("==================================================");
}

runRbacTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
