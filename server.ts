import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { DEMO_USERS, ROLE_PERMISSIONS } from "./src/lib/auth-constants";
import { signAuthToken, verifyAuthToken } from "./src/lib/server-auth";
import { requireAuth, requireRole, requireOutletAccess, AuthenticatedRequest } from "./src/middleware/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Mock outlet database for demonstration & authorization testing
const OUTLETS_MOCK = [
  {
    outletId: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    operatingModel: "FOCO",
    status: "ACTIVE",
    manager: "Pooja Verma",
    assignedUserEmail: "franchise.lucknow@aurafoods.com",
    monthlyRevenue: "₹58.4 Lakh",
    complianceScore: "74%",
    riskScore: 68,
    riskLevel: "High",
  },
  {
    outletId: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    operatingModel: "COCO",
    status: "ACTIVE",
    manager: "Sanjay Dixit",
    assignedUserEmail: "franchise.noida@aurafoods.com",
    monthlyRevenue: "₹72.1 Lakh",
    complianceScore: "81%",
    riskScore: 54,
    riskLevel: "Elevated",
  },
  {
    outletId: "OUT-019",
    name: "Connaught Place Inner",
    city: "Delhi",
    operatingModel: "COCO",
    status: "ACTIVE",
    manager: "Ramesh Mehra",
    assignedUserEmail: "franchise.delhi@aurafoods.com",
    monthlyRevenue: "₹94.2 Lakh",
    complianceScore: "96%",
    riskScore: 16,
    riskLevel: "Low",
  },
  {
    outletId: "OUT-114",
    name: "Koramangala 5th Block",
    city: "Bengaluru",
    operatingModel: "FOCO",
    status: "ACTIVE",
    manager: "Anita Rao",
    assignedUserEmail: "franchise.blr@aurafoods.com",
    monthlyRevenue: "₹81.0 Lakh",
    complianceScore: "83%",
    riskScore: 47,
    riskLevel: "Elevated",
  },
];

// ==========================================
// AUTHENTICATION API ROUTES
// ==========================================

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({
      error: "Invalid email or password. Please select or check demo credentials.",
    });
  }

  const token = signAuthToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    assignedOutletId: user.assignedOutletId,
    assignedOutletName: user.assignedOutletName,
    companyId: user.companyId,
  });

  // Set HTTP-only cookie
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedOutletId: user.assignedOutletId,
      assignedOutletName: user.assignedOutletName,
      companyId: user.companyId,
      permissions: ROLE_PERMISSIONS[user.role],
    },
  });
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("auth_token");
  return res.json({ success: true, message: "Logged out successfully." });
});

// GET /api/auth/me
app.get("/api/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json({
    user: {
      ...req.user,
      permissions: ROLE_PERMISSIONS[req.user.role],
    },
  });
});

// GET /api/auth/demo-users
app.get("/api/auth/demo-users", (req, res) => {
  const sanitized = DEMO_USERS.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    assignedOutletId: u.assignedOutletId,
    assignedOutletName: u.assignedOutletName,
    demoPassword: u.passwordHash,
  }));
  return res.json(sanitized);
});

// ==========================================
// PROTECTED OUTLET & OPERATIONS API ROUTES
// ==========================================

// GET /api/outlets: Lists outlets with role-based filtering
app.get("/api/outlets", requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  // Franchise role only gets their assigned outlet
  if (user.role === "FRANCHISE") {
    const assigned = OUTLETS_MOCK.filter(
      (o) => o.outletId === user.assignedOutletId
    );
    return res.json({
      outlets: assigned,
      restricted: true,
      reason: `Franchise user restricted to assigned outlet (${user.assignedOutletId})`,
    });
  }

  // Admin, Owner, Officer get all outlets
  return res.json({
    outlets: OUTLETS_MOCK,
    restricted: false,
  });
});

// GET /api/outlets/:outletId: Strictly protected by requireOutletAccess
app.get(
  "/api/outlets/:outletId",
  requireAuth,
  requireOutletAccess,
  (req: AuthenticatedRequest, res) => {
    const { outletId } = req.params;
    const outlet = OUTLETS_MOCK.find(
      (o) => o.outletId.toLowerCase() === outletId.toLowerCase()
    );

    if (!outlet) {
      return res.status(404).json({ error: `Outlet ${outletId} not found.` });
    }

    return res.json({
      outlet,
      authorizedUser: {
        email: req.user!.email,
        role: req.user!.role,
      },
    });
  }
);

// POST /api/outlets/:outletId/sales: Submit sales (FRANCHISE and ADMIN only; OWNER strictly forbidden)
app.post(
  "/api/outlets/:outletId/sales",
  requireAuth,
  requireOutletAccess,
  (req: AuthenticatedRequest, res) => {
    const user = req.user!;

    if (user.role === "OWNER") {
      return res.status(403).json({
        error:
          "Permission Denied: Owners have executive read-only access and cannot edit outlet operational data.",
      });
    }

    if (user.role === "OFFICER") {
      return res.status(403).json({
        error: "Permission Denied: Compliance officers cannot submit sales.",
      });
    }

    const { date, quantity, revenue, productId } = req.body;
    return res.json({
      success: true,
      message: `Sale recorded for outlet ${req.params.outletId}`,
      record: {
        outletId: req.params.outletId,
        date: date || new Date().toISOString(),
        quantity,
        revenue,
        productId,
        submittedBy: user.email,
      },
    });
  }
);

// POST /api/compliance/verify: Officer and Admin only
app.post(
  "/api/compliance/verify",
  requireAuth,
  requireRole("OFFICER", "ADMIN"),
  (req: AuthenticatedRequest, res) => {
    const { observationId, decision, comments } = req.body;
    return res.json({
      success: true,
      message: `Observation ${observationId} marked as ${decision}`,
      officer: req.user!.email,
      auditTimestamp: new Date().toISOString(),
      comments,
    });
  }
);

// GET /api/reports/financials: Owner and Admin only
app.get(
  "/api/reports/financials",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  (req: AuthenticatedRequest, res) => {
    return res.json({
      organization: "Aura Foods Enterprise",
      annualRevenue: "₹84.6 Cr",
      ebitda: "₹12.8 Cr",
      ebitdaMargin: "15.1%",
      totalOutlets: 148,
      confidential: true,
      accessedBy: req.user!.email,
    });
  }
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function startServer() {
  // If running in Vercel serverless environment, do not start local HTTP listener
  if (process.env.VERCEL === "1") {
    return;
  }

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
export { app };
