import express, { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { DEMO_USERS, ROLE_PERMISSIONS } from "../frontend/utils/auth-constants";
import { signAuthToken } from "./utils/server-auth";
import { requireAuth, requireRole, requireOutletAccess, AuthenticatedRequest } from "./middleware/auth";
import { db } from "../database/connection.ts";
import {
  outlets,
  outletSales,
  outletInventory,
  outletComplaints,
  outletEvidence,
  outletAlerts,
  outletCorrectiveActions,
  outletHistory,
  inventoryReconciliations,
  complianceInspections,
  complianceHistory,
  cctvEvidenceVerifications,
  correctiveActionHistory,
} from "../database/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import {
  generateEvidenceObservations,
  summarizeEvidence,
  summarizeComplianceObservations,
  explainSalesPatterns,
  explainRiskFactors,
  generateAuditReport,
  suggestCorrectiveActions,
} from "./services/gemini";
import { calculateOutletRisk, evaluateNetworkRisk } from "./services/risk-engine";
import {
  generateOutletAlerts,
  generateNetworkAlerts,
  ALERT_TYPES,
  ALERT_SEVERITIES,
} from "./services/alert-engine";
import {
  checkAndFlagOverdueActions,
  seedInitialCorrectiveActions,
  transitionCorrectiveAction,
} from "./services/corrective-action-engine";
import { CapaStatus } from "../frontend/types/corrective-action-types";

dotenv.config();

const apiApp = express();

apiApp.use(cors({ origin: true, credentials: true }));
apiApp.use(express.json());
apiApp.use(cookieParser());

// Mock outlet database for demonstration & authorization testing
const OUTLETS_MOCK = [
  {
    outletId: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    operatingModel: "FOCO",
    status: "ACTIVE",
    manager: "Store Operator",
    assignedUserEmail: "store.lucknow@aurafoods.com",
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

// Reusable API router that works whether mounted at /api or /
const apiRouter = Router();

// POST /auth/login
apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  // Support both primary emails and legacy role aliases
  const emailAliases: Record<string, string> = {
    "yash": "yash.gupta@aurafoods.com",
    "owner@aurafoods.com": "yash.gupta@aurafoods.com",
    "franchise.lucknow@aurafoods.com": "store.lucknow@aurafoods.com",
    "store.lucknow@franchiseops.com": "store.lucknow@aurafoods.com",
    "officer.sen@aurafoods.com": "yuvraj.buddha@aurafoods.com",
    "officer@aurafoods.com": "yuvraj.buddha@aurafoods.com",
    "karan.singhal@aurafoods.com": "yuvraj.buddha@aurafoods.com",
    "ananya.roy@aurafoods.in": "yuvraj.buddha@aurafoods.com",
    "ananya.roy@aurafoods.com": "yuvraj.buddha@aurafoods.com",
    "yuvraj.gupta@aurafoods.com": "yuvraj.buddha@aurafoods.com",
  };

  const lookupEmail = emailAliases[normalizedEmail] || normalizedEmail;

  const user = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === lookupEmail
  );

  const isPasswordValid =
    user &&
    (user.passwordHash === password ||
      (user.role === "OWNER" && (password === "0000" || password === "owner123")));

  if (!user || !isPasswordValid) {
    return res.status(401).json({
      error: "Invalid username or password.",
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

// POST /auth/store-login (Single-Store Isolated Authentication)
apiRouter.post("/auth/store-login", (req, res) => {
  const { outletId, email, password } = req.body;

  if (!outletId) {
    return res.status(400).json({ error: "Store/Outlet code is required." });
  }

  const normalizedOutletId = outletId.toUpperCase().trim();
  const matchedOutlet = OUTLETS_MOCK.find(
    (o) => o.outletId.toUpperCase() === normalizedOutletId
  );

  const targetOutletId = matchedOutlet ? matchedOutlet.outletId : normalizedOutletId;
  const targetOutletName = matchedOutlet ? matchedOutlet.name : `Store ${targetOutletId}`;
  const storeManager = (matchedOutlet && matchedOutlet.manager) || "Store Operator";
  const storeEmail = email || `store.${targetOutletId.toLowerCase()}@franchiseops.com`;

  const storeUser = {
    id: `usr-store-${targetOutletId.toLowerCase()}`,
    email: storeEmail,
    name: storeManager,
    role: "FRANCHISE" as const,
    assignedOutletId: targetOutletId,
    assignedOutletName: `${targetOutletName} (${matchedOutlet?.city || "Station"})`,
    companyId: "cmp-universal-01",
  };

  const token = signAuthToken(storeUser);

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    token,
    user: {
      ...storeUser,
      permissions: ROLE_PERMISSIONS.FRANCHISE,
    },
  });
});

// POST /auth/logout
apiRouter.post("/auth/logout", (req, res) => {
  res.clearCookie("auth_token");
  return res.json({ success: true, message: "Logged out successfully." });
});

// GET /auth/me
apiRouter.get("/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
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

// GET /auth/demo-users
apiRouter.get("/auth/demo-users", (req, res) => {
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

// GET /outlets
apiRouter.get("/outlets", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { search, city, model, status } = req.query as {
    search?: string;
    city?: string;
    model?: string;
    status?: string;
  };

  try {
    // CRITICAL: A franchise user must only see their assigned outlet.
    if (user.role === "FRANCHISE") {
      const assignedId = (user.assignedOutletId || "OUT-042").toUpperCase();
      const results = await db
        .select()
        .from(outlets)
        .where(eq(outlets.outletId, assignedId));

      return res.json({
        outlets: results,
        restricted: true,
        reason: `Franchise user restricted exclusively to assigned outlet (${assignedId})`,
      });
    }

    // Organization-wide roles (ADMIN, OWNER, OFFICER)
    let queryResults = await db.select().from(outlets).orderBy(outlets.outletId);

    // Filter by city
    if (city && city !== "All Cities") {
      queryResults = queryResults.filter(
        (o) => o.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Filter by COCO/FOCO
    if (model && model !== "All Models") {
      queryResults = queryResults.filter(
        (o) => o.operatingModel.toUpperCase() === model.toUpperCase()
      );
    }

    // Filter by status
    if (status && status !== "All Statuses") {
      queryResults = queryResults.filter(
        (o) => o.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Search query
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      queryResults = queryResults.filter(
        (o) =>
          o.name.toLowerCase().includes(s) ||
          o.outletId.toLowerCase().includes(s) ||
          o.city.toLowerCase().includes(s) ||
          o.manager.toLowerCase().includes(s) ||
          o.assignedFranchiseUser.toLowerCase().includes(s)
      );
    }

    return res.json({
      outlets: queryResults,
      restricted: false,
    });
  } catch (err) {
    console.error("PostgreSQL query failed, fallback:", err);
    let fallback = OUTLETS_MOCK;
    if (user.role === "FRANCHISE") {
      fallback = fallback.filter((o) => o.outletId === user.assignedOutletId);
    }
    return res.json({ outlets: fallback, restricted: user.role === "FRANCHISE" });
  }
});

// GET /outlets/:outletId
apiRouter.get(
  "/outlets/:outletId",
  requireAuth,
  requireOutletAccess,
  async (req: AuthenticatedRequest, res) => {
    const outletId = String(req.params.outletId || "").toUpperCase().trim();

    try {
      const [outlet] = await db
        .select()
        .from(outlets)
        .where(eq(outlets.outletId, outletId));

      if (!outlet) {
        return res.status(404).json({ error: `Outlet ${outletId} not found.` });
      }

      // Query real PostgreSQL associated records for all tabs
      const sales = await db
        .select()
        .from(outletSales)
        .where(eq(outletSales.outletId, outletId))
        .orderBy(desc(outletSales.date));

      const inventory = await db
        .select()
        .from(outletInventory)
        .where(eq(outletInventory.outletId, outletId));

      const complaints = await db
        .select()
        .from(outletComplaints)
        .where(eq(outletComplaints.outletId, outletId));

      const evidence = await db
        .select()
        .from(outletEvidence)
        .where(eq(outletEvidence.outletId, outletId));

      const alerts = await db
        .select()
        .from(outletAlerts)
        .where(eq(outletAlerts.outletId, outletId));

      const correctiveActions = await db
        .select()
        .from(outletCorrectiveActions)
        .where(eq(outletCorrectiveActions.outletId, outletId));

      const history = await db
        .select()
        .from(outletHistory)
        .where(eq(outletHistory.outletId, outletId));

      return res.json({
        outlet,
        sales,
        inventory,
        complaints,
        evidence,
        alerts,
        correctiveActions,
        history,
        authorizedUser: {
          email: req.user!.email,
          role: req.user!.role,
        },
      });
    } catch (err) {
      console.error("Error fetching outlet from PostgreSQL:", err);
      return res.status(500).json({ error: "Failed to load outlet details from database." });
    }
  }
);

// POST /outlets/:outletId/sales
apiRouter.post(
  "/outlets/:outletId/sales",
  requireAuth,
  requireOutletAccess,
  async (req: AuthenticatedRequest, res) => {
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

    const targetOutletId = String(req.params.outletId || "").toUpperCase().trim();
    const {
      date,
      netSales,
      grossSales,
      orderCount,
      avgTicket,
      cashCollection,
      upiCollection,
      cardCollection,
    } = req.body;

    try {
      const [newRecord] = await db
        .insert(outletSales)
        .values({
          outletId: targetOutletId,
          date: date || new Date().toISOString().split("T")[0],
          netSales: String(netSales || 0),
          grossSales: String(grossSales || Number(netSales || 0) * 1.05),
          orderCount: Number(orderCount || 1),
          avgTicket: String(
            avgTicket || Number(netSales || 0) / Math.max(1, Number(orderCount || 1))
          ),
          cashCollection: String(cashCollection || 0),
          upiCollection: String(upiCollection || 0),
          cardCollection: String(cardCollection || 0),
          posSettled: true,
        })
        .returning();

      return res.json({
        success: true,
        message: `Sale batch successfully recorded in PostgreSQL for outlet ${targetOutletId}`,
        record: newRecord,
      });
    } catch (err: any) {
      console.error("Failed to insert sales into PostgreSQL:", err);
      return res.status(500).json({ error: "Failed to persist sales into database." });
    }
  }
);

// Zod Schema for Sales Record Form
const SaleRecordSchema = z.object({
  outletId: z.string().min(1, "Outlet selection is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  productName: z.string().min(2, "Product name must have at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().positive("Unit price must be positive"),
  netSales: z.number().positive("Net sales must be positive"),
  grossSales: z.number().positive("Gross sales must be positive"),
  orderCount: z.number().int().positive("Order count must be at least 1").default(1),
  paymentMode: z.enum(["UPI", "Cash", "Card"]).default("UPI"),
  cashCollection: z.number().nonnegative("Cash collection cannot be negative").default(0),
  upiCollection: z.number().nonnegative("UPI collection cannot be negative").default(0),
  cardCollection: z.number().nonnegative("Card collection cannot be negative").default(0),
  notes: z.string().optional().nullable(),
});

// GET /sales - List, search, filter, and calculate charts & revenue
apiRouter.get("/sales", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, product, category, startDate, endDate, search } = req.query as {
    outletId?: string;
    product?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };

  try {
    let salesQuery = db.select().from(outletSales).orderBy(desc(outletSales.date), desc(outletSales.id));
    let allSales = await salesQuery;

    // Strict Authorization: A franchise user must only see their assigned outlet.
    if (user.role === "FRANCHISE") {
      const assignedId = (user.assignedOutletId || "OUT-042").toUpperCase();
      allSales = allSales.filter((s) => s.outletId.toUpperCase() === assignedId);
    } else if (outletId && outletId !== "All Outlets") {
      allSales = allSales.filter((s) => s.outletId.toUpperCase() === outletId.toUpperCase());
    }

    // Filter by product
    if (product && product !== "All Products") {
      allSales = allSales.filter((s) => s.productName.toLowerCase() === product.toLowerCase());
    }

    // Filter by category
    if (category && category !== "All Categories") {
      allSales = allSales.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by date range
    if (startDate) {
      allSales = allSales.filter((s) => s.date >= startDate);
    }
    if (endDate) {
      allSales = allSales.filter((s) => s.date <= endDate);
    }

    // Search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      allSales = allSales.filter(
        (s) =>
          s.productName.toLowerCase().includes(q) ||
          s.outletId.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    // Fetch outlets mapping for names
    const allOutlets = await db.select().from(outlets);
    const outletMap = new Map(allOutlets.map((o) => [o.outletId, o.name]));

    // 1. Revenue Calculations
    let totalNetRevenue = 0;
    let totalGrossRevenue = 0;
    let totalUnits = 0;
    let totalOrders = 0;
    let totalCash = 0;
    let totalUpi = 0;
    let totalCard = 0;

    allSales.forEach((s) => {
      totalNetRevenue += Number(s.netSales || 0);
      totalGrossRevenue += Number(s.grossSales || 0);
      totalUnits += Number(s.quantity || 1);
      totalOrders += Number(s.orderCount || 1);
      totalCash += Number(s.cashCollection || 0);
      totalUpi += Number(s.upiCollection || 0);
      totalCard += Number(s.cardCollection || 0);
    });

    const avgTicket = totalOrders > 0 ? totalNetRevenue / totalOrders : 0;

    // 2. Daily Sales Chart Data
    const dailyMap = new Map<string, { date: string; revenue: number; orders: number; units: number }>();
    allSales.forEach((s) => {
      const prev = dailyMap.get(s.date) || { date: s.date, revenue: 0, orders: 0, units: 0 };
      prev.revenue += Number(s.netSales || 0);
      prev.orders += Number(s.orderCount || 1);
      prev.units += Number(s.quantity || 1);
      dailyMap.set(s.date, prev);
    });
    const dailySales = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // 3. Weekly Sales Chart Data
    const weeklyMap = new Map<string, { week: string; revenue: number; orders: number }>();
    allSales.forEach((s) => {
      // Calculate simple week format YYYY-Wxx
      const d = new Date(s.date);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      const weekKey = `${d.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
      const prev = weeklyMap.get(weekKey) || { week: weekKey, revenue: 0, orders: 0 };
      prev.revenue += Number(s.netSales || 0);
      prev.orders += Number(s.orderCount || 1);
      weeklyMap.set(weekKey, prev);
    });
    const weeklySales = Array.from(weeklyMap.values()).sort((a, b) => a.week.localeCompare(b.week));

    // 4. Monthly Sales Chart Data
    const monthlyMap = new Map<string, { month: string; revenue: number; orders: number }>();
    allSales.forEach((s) => {
      const monthKey = s.date.substring(0, 7); // YYYY-MM
      const prev = monthlyMap.get(monthKey) || { month: monthKey, revenue: 0, orders: 0 };
      prev.revenue += Number(s.netSales || 0);
      prev.orders += Number(s.orderCount || 1);
      monthlyMap.set(monthKey, prev);
    });
    const monthlySales = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    // 5. Product-wise Sales Chart Data
    const productMap = new Map<string, { product: string; category: string; revenue: number; units: number }>();
    allSales.forEach((s) => {
      const prev = productMap.get(s.productName) || {
        product: s.productName,
        category: s.category,
        revenue: 0,
        units: 0,
      };
      prev.revenue += Number(s.netSales || 0);
      prev.units += Number(s.quantity || 1);
      productMap.set(s.productName, prev);
    });
    const productWiseSales = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);

    // 6. Outlet Comparison Chart Data
    const outletAggMap = new Map<string, { outletId: string; name: string; revenue: number; orders: number }>();
    allSales.forEach((s) => {
      const prev = outletAggMap.get(s.outletId) || {
        outletId: s.outletId,
        name: outletMap.get(s.outletId) || s.outletId,
        revenue: 0,
        orders: 0,
      };
      prev.revenue += Number(s.netSales || 0);
      prev.orders += Number(s.orderCount || 1);
      outletAggMap.set(s.outletId, prev);
    });
    const outletComparison = Array.from(outletAggMap.values()).sort((a, b) => b.revenue - a.revenue);

    return res.json({
      sales: allSales,
      summary: {
        totalNetRevenue,
        totalGrossRevenue,
        totalUnits,
        totalOrders,
        avgTicket: Math.round(avgTicket),
        cashShare: totalNetRevenue > 0 ? Math.round((totalCash / totalNetRevenue) * 100) : 0,
        upiShare: totalNetRevenue > 0 ? Math.round((totalUpi / totalNetRevenue) * 100) : 0,
        cardShare: totalNetRevenue > 0 ? Math.round((totalCard / totalNetRevenue) * 100) : 0,
      },
      charts: {
        dailySales,
        weeklySales,
        monthlySales,
        revenueTrend: dailySales, // Daily trend with revenue & orders
        productWiseSales,
        outletComparison,
      },
      restricted: user.role === "FRANCHISE",
      userAssignedOutlet: user.assignedOutletId,
    });
  } catch (err: any) {
    console.error("Failed to load sales from PostgreSQL:", err);
    return res.status(500).json({ error: "Failed to retrieve sales records." });
  }
});

// POST /sales - Add sale with Zod validation & authorization
apiRouter.post("/sales", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  // Role authorization
  if (user.role === "OWNER") {
    return res.status(403).json({
      error: "Permission Denied: Franchisee owners have executive read-only privileges.",
    });
  }
  if (user.role === "OFFICER") {
    return res.status(403).json({
      error: "Permission Denied: Compliance officers cannot create sales transactions.",
    });
  }

  // Zod form validation
  const validation = SaleRecordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation Error",
      details: validation.error.flatten().fieldErrors,
    });
  }

  const payload = validation.data;
  const targetOutletId = payload.outletId.toUpperCase().trim();

  // Franchise user cannot create sale for another outlet
  if (user.role === "FRANCHISE" && targetOutletId !== (user.assignedOutletId || "").toUpperCase()) {
    return res.status(403).json({
      error: `Security Violation: You can only record sales for your assigned outlet (${user.assignedOutletId}).`,
    });
  }

  try {
    const [inserted] = await db
      .insert(outletSales)
      .values({
        outletId: targetOutletId,
        date: payload.date,
        productName: payload.productName,
        category: payload.category,
        quantity: payload.quantity,
        unitPrice: String(payload.unitPrice),
        netSales: String(payload.netSales),
        grossSales: String(payload.grossSales),
        orderCount: payload.orderCount,
        avgTicket: String(payload.netSales / Math.max(1, payload.orderCount)),
        paymentMode: payload.paymentMode,
        cashCollection: String(payload.cashCollection),
        upiCollection: String(payload.upiCollection),
        cardCollection: String(payload.cardCollection),
        posSettled: true,
        notes: payload.notes || null,
        createdBy: user.email,
      })
      .returning();

    return res.status(201).json({
      success: true,
      message: "Sale record successfully persisted to PostgreSQL.",
      record: inserted,
    });
  } catch (err: any) {
    console.error("Failed to insert sale into PostgreSQL:", err);
    return res.status(500).json({ error: "Failed to create sale in database." });
  }
});

// PUT /sales/:id - Edit sale with Zod validation & authorization
apiRouter.put("/sales/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const saleId = Number(req.params.id);

  if (isNaN(saleId)) {
    return res.status(400).json({ error: "Invalid sale ID" });
  }

  // Role authorization
  if (user.role === "OWNER" || user.role === "OFFICER") {
    return res.status(403).json({
      error: "Permission Denied: Your role is not authorized to edit sales entries.",
    });
  }

  // Zod form validation
  const validation = SaleRecordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation Error",
      details: validation.error.flatten().fieldErrors,
    });
  }

  const payload = validation.data;
  const targetOutletId = payload.outletId.toUpperCase().trim();

  try {
    // Check existing sale
    const [existing] = await db.select().from(outletSales).where(eq(outletSales.id, saleId));
    if (!existing) {
      return res.status(404).json({ error: "Sale record not found." });
    }

    // Franchise boundary verification
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (existing.outletId.toUpperCase() !== assigned || targetOutletId !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only edit sales for your assigned store.",
        });
      }
    }

    const [updated] = await db
      .update(outletSales)
      .set({
        outletId: targetOutletId,
        date: payload.date,
        productName: payload.productName,
        category: payload.category,
        quantity: payload.quantity,
        unitPrice: String(payload.unitPrice),
        netSales: String(payload.netSales),
        grossSales: String(payload.grossSales),
        orderCount: payload.orderCount,
        avgTicket: String(payload.netSales / Math.max(1, payload.orderCount)),
        paymentMode: payload.paymentMode,
        cashCollection: String(payload.cashCollection),
        upiCollection: String(payload.upiCollection),
        cardCollection: String(payload.cardCollection),
        notes: payload.notes || null,
      })
      .where(eq(outletSales.id, saleId))
      .returning();

    return res.json({
      success: true,
      message: "Sale record successfully updated in PostgreSQL.",
      record: updated,
    });
  } catch (err: any) {
    console.error("Failed to update sale in PostgreSQL:", err);
    return res.status(500).json({ error: "Failed to update sale record." });
  }
});

// DELETE /sales/:id - Delete sale where authorized
apiRouter.delete("/sales/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const saleId = Number(req.params.id);

  if (isNaN(saleId)) {
    return res.status(400).json({ error: "Invalid sale ID" });
  }

  // Role authorization: Owners & Officers cannot delete
  if (user.role === "OWNER" || user.role === "OFFICER") {
    return res.status(403).json({
      error: "Permission Denied: Your role is not authorized to delete sales records.",
    });
  }

  try {
    const [existing] = await db.select().from(outletSales).where(eq(outletSales.id, saleId));
    if (!existing) {
      return res.status(404).json({ error: "Sale record not found." });
    }

    // Franchise boundary verification
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (existing.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only delete sales from your assigned store.",
        });
      }
    }

    await db.delete(outletSales).where(eq(outletSales.id, saleId));

    return res.json({
      success: true,
      message: `Sale record #${saleId} deleted successfully.`,
    });
  } catch (err: any) {
    console.error("Failed to delete sale from PostgreSQL:", err);
    return res.status(500).json({ error: "Failed to delete sale record." });
  }
});

// =========================================================
// INVENTORY & STOCK-SALES RECONCILIATION API
// =========================================================

const ReconciliationInputSchema = z.object({
  outletId: z.string().min(1, "Outlet ID is required"),
  itemName: z.string().min(2, "Item name must have at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  unit: z.string().min(1, "Unit of measurement is required"),
  openingStock: z.number().nonnegative("Opening stock cannot be negative"),
  companySupply: z.number().nonnegative("Received company supply cannot be negative"),
  recordedSales: z.number().nonnegative("Recorded sold quantity cannot be negative"),
  actualPhysicalStock: z.number().nonnegative("Actual physical count cannot be negative"),
  periodDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Period date must be YYYY-MM-DD"),
  notes: z.string().optional().nullable(),
});

// GET /inventory/reconciliations
apiRouter.get("/inventory/reconciliations", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, category, status, search } = req.query as {
    outletId?: string;
    category?: string;
    status?: string;
    search?: string;
  };

  try {
    let queryResults = await db
      .select()
      .from(inventoryReconciliations)
      .orderBy(desc(inventoryReconciliations.periodDate), desc(inventoryReconciliations.id));

    // Strict Authorization: A franchise user must only see their assigned outlet.
    if (user.role === "FRANCHISE") {
      const assignedId = (user.assignedOutletId || "OUT-042").toUpperCase();
      queryResults = queryResults.filter((r) => r.outletId.toUpperCase() === assignedId);
    } else if (outletId && outletId !== "All Outlets") {
      queryResults = queryResults.filter((r) => r.outletId.toUpperCase() === outletId.toUpperCase());
    }

    // Filter by Category
    if (category && category !== "All Categories") {
      queryResults = queryResults.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Review Status
    if (status && status !== "All Statuses") {
      queryResults = queryResults.filter((r) => r.reviewStatus.toLowerCase() === status.toLowerCase());
    }

    // Search
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      queryResults = queryResults.filter(
        (r) =>
          r.itemName.toLowerCase().includes(q) ||
          r.outletId.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q)) ||
          r.reconciliationId.toLowerCase().includes(q)
      );
    }

    // Calculations & Summary
    let totalItems = queryResults.length;
    let discrepancyItems = 0;
    let normalItems = 0;
    let totalVarianceUnits = 0;
    let totalOpeningStock = 0;
    let totalCompanySupply = 0;
    let totalRecordedSales = 0;
    let totalExpectedClosing = 0;
    let totalActualPhysical = 0;

    queryResults.forEach((r) => {
      const v = Number(r.variance || 0);
      totalVarianceUnits += v;
      totalOpeningStock += Number(r.openingStock || 0);
      totalCompanySupply += Number(r.companySupply || 0);
      totalRecordedSales += Number(r.recordedSales || 0);
      totalExpectedClosing += Number(r.expectedClosingStock || 0);
      totalActualPhysical += Number(r.actualPhysicalStock || 0);

      if (r.hasDiscrepancy) {
        discrepancyItems++;
      } else {
        normalItems++;
      }
    });

    return res.json({
      reconciliations: queryResults,
      summary: {
        totalItems,
        discrepancyItems,
        normalItems,
        totalVarianceUnits,
        totalOpeningStock,
        totalCompanySupply,
        totalRecordedSales,
        totalExpectedClosing,
        totalActualPhysical,
        systemHealthPct: totalItems > 0 ? Math.round(((totalItems - discrepancyItems) / totalItems) * 100) : 100,
      },
      restricted: user.role === "FRANCHISE",
      userAssignedOutlet: user.assignedOutletId,
    });
  } catch (err: any) {
    console.error("Failed to load inventory reconciliations:", err);
    return res.status(500).json({ error: "Failed to retrieve inventory reconciliations." });
  }
});

// POST /inventory/reconciliations - Automated Calculation & Storage
apiRouter.post("/inventory/reconciliations", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  if (user.role === "OWNER" || user.role === "OFFICER") {
    return res.status(403).json({
      error: "Permission Denied: Your role is not authorized to submit physical inventory counts.",
    });
  }

  const validation = ReconciliationInputSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation Error",
      details: validation.error.flatten().fieldErrors,
    });
  }

  const payload = validation.data;
  const targetOutletId = payload.outletId.toUpperCase().trim();

  // Franchise single store check
  if (user.role === "FRANCHISE" && targetOutletId !== (user.assignedOutletId || "").toUpperCase()) {
    return res.status(403).json({
      error: `Security Violation: You can only reconcile inventory for your assigned outlet (${user.assignedOutletId}).`,
    });
  }

  // AUTOMATED CALCULATION (Deterministic Formula)
  // Expected Closing Stock = Opening Stock + Company Supply - Recorded Sales
  const expectedClosing = payload.openingStock + payload.companySupply - payload.recordedSales;
  
  // Variance = Expected Closing Stock - Actual Physical Stock
  const variance = expectedClosing - payload.actualPhysicalStock;

  // Variance Percentage
  let variancePct = 0;
  if (expectedClosing > 0) {
    variancePct = Number(((Math.abs(variance) / expectedClosing) * 100).toFixed(2));
  } else if (payload.actualPhysicalStock > 0) {
    variancePct = 100;
  }

  // Discrepancy evaluation:
  // Discrepancy alert message: "Inventory discrepancy detected — requires review."
  // IMPORTANT: Never automatically call this fraud. It is only a discrepancy requiring human review.
  const isDiscrepant = Math.abs(variance) >= 5 || variancePct >= 5;
  const reviewStatus = isDiscrepant
    ? "Discrepancy Detected — Requires Review"
    : "Normal";
  const alertMsg = isDiscrepant
    ? "Inventory discrepancy detected — requires review."
    : null;

  const reconciliationId = `REC-${Date.now().toString().slice(-6)}`;

  try {
    const [inserted] = await db
      .insert(inventoryReconciliations)
      .values({
        reconciliationId,
        outletId: targetOutletId,
        itemName: payload.itemName,
        category: payload.category,
        unit: payload.unit,
        openingStock: String(payload.openingStock),
        companySupply: String(payload.companySupply),
        recordedSales: String(payload.recordedSales),
        expectedClosingStock: String(expectedClosing),
        actualPhysicalStock: String(payload.actualPhysicalStock),
        variance: String(variance),
        variancePercentage: String(variancePct),
        reviewStatus,
        hasDiscrepancy: isDiscrepant,
        alertMessage: alertMsg,
        periodDate: payload.periodDate,
        notes: payload.notes || null,
        reconciledBy: user.email,
      })
      .returning();

    // If significant discrepancy detected, log to outletAlerts for operational tracking
    if (isDiscrepant) {
      await db.insert(outletAlerts).values({
        alertId: `ALT-INV-${Date.now().toString().slice(-5)}`,
        outletId: targetOutletId,
        type: "Inventory mismatch",
        severity: variancePct > 20 ? "CRITICAL" : "HIGH",
        priority: variancePct > 20 ? "Immediate attention/escalation" : "Prioritized officer review",
        category: "Inventory Discrepancy",
        message: `Inventory discrepancy detected — requires review: ${payload.itemName} in ${targetOutletId} has variance of ${variance} ${payload.unit} (${variancePct}%). Human review required.`,
        status: "NEW",
        createdDate: new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        resolved: false,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Inventory reconciliation calculated and stored successfully in PostgreSQL.",
      record: inserted,
    });
  } catch (err: any) {
    console.error("Failed to store inventory reconciliation:", err);
    return res.status(500).json({ error: "Failed to persist reconciliation to database." });
  }
});

// PUT /inventory/reconciliations/:id/status - Update Review Status
apiRouter.put("/inventory/reconciliations/:id/status", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const id = Number(req.params.id);
  const { reviewStatus, resolutionNotes } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid reconciliation ID" });
  }

  try {
    const [existing] = await db
      .select()
      .from(inventoryReconciliations)
      .where(eq(inventoryReconciliations.id, id));

    if (!existing) {
      return res.status(404).json({ error: "Reconciliation record not found." });
    }

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (existing.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only update records for your assigned outlet.",
        });
      }
    }

    const updatedNotes = resolutionNotes
      ? `${existing.notes || ""}\n[Review Update by ${user.email}]: ${resolutionNotes}`.trim()
      : existing.notes;

    const [updated] = await db
      .update(inventoryReconciliations)
      .set({
        reviewStatus: reviewStatus || existing.reviewStatus,
        hasDiscrepancy: reviewStatus === "Reviewed & Resolved" ? false : existing.hasDiscrepancy,
        notes: updatedNotes,
      })
      .where(eq(inventoryReconciliations.id, id))
      .returning();

    return res.json({
      success: true,
      message: "Reconciliation review status updated.",
      record: updated,
    });
  } catch (err: any) {
    console.error("Failed to update reconciliation status:", err);
    return res.status(500).json({ error: "Failed to update review status in database." });
  }
});

// DELETE /inventory/reconciliations/:id
apiRouter.delete("/inventory/reconciliations/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid reconciliation ID" });
  }

  if (user.role === "OWNER" || user.role === "OFFICER") {
    return res.status(403).json({
      error: "Permission Denied: Your role is not authorized to delete reconciliation records.",
    });
  }

  try {
    const [existing] = await db
      .select()
      .from(inventoryReconciliations)
      .where(eq(inventoryReconciliations.id, id));

    if (!existing) {
      return res.status(404).json({ error: "Record not found." });
    }

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (existing.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only delete records for your assigned outlet.",
        });
      }
    }

    await db.delete(inventoryReconciliations).where(eq(inventoryReconciliations.id, id));

    return res.json({
      success: true,
      message: `Reconciliation record #${id} removed.`,
    });
  } catch (err: any) {
    console.error("Failed to delete reconciliation record:", err);
    return res.status(500).json({ error: "Failed to delete reconciliation record." });
  }
});

// =========================================================
// 1. DEDICATED INVENTORY STOCK API (On-Hand Store Physical Stock)
// =========================================================

const DEFAULT_STOCK_ITEMS = [
  { itemName: "Frozen Patty Premium (Veg/Non-Veg)", category: "Raw Meat & Proteins", stockQuantity: 320, unit: "kg", reorderLevel: 100, unitCost: 240, status: "In Stock" },
  { itemName: "Organic Brioche Buns (4-inch)", category: "Bakery & Breads", stockQuantity: 180, unit: "trays", reorderLevel: 60, unitCost: 120, status: "In Stock" },
  { itemName: "Signature Truffle Sauce", category: "Dressings & Condiments", stockQuantity: 18, unit: "bottles", reorderLevel: 25, unitCost: 450, status: "Low Stock" },
  { itemName: "Sanitizer Solution Concentrate (FSSAI)", category: "Hygiene & Cleaning", stockQuantity: 45, unit: "liters", reorderLevel: 15, unitCost: 180, status: "In Stock" },
  { itemName: "Paper Takeaway Kraft Bags (L)", category: "Packaging Material", stockQuantity: 850, unit: "units", reorderLevel: 500, unitCost: 6.5, status: "In Stock" },
  { itemName: "Belgian Chocolate Shake Mix", category: "Beverages & Shakes", stockQuantity: 62, unit: "liters", reorderLevel: 30, unitCost: 310, status: "In Stock" },
  { itemName: "Imported French Fries (Crispy 9mm)", category: "Raw Meat & Proteins", stockQuantity: 210, unit: "kg", reorderLevel: 80, unitCost: 165, status: "In Stock" },
  { itemName: "Refined Canola Frying Oil (15L)", category: "Dressings & Condiments", stockQuantity: 8, unit: "tins", reorderLevel: 12, unitCost: 1850, status: "Low Stock" },
  { itemName: "Cheddar Cheese Slices (Pack of 84)", category: "Vegetarian Proteins & Dairy", stockQuantity: 4, unit: "packs", reorderLevel: 10, unitCost: 720, status: "Critical Shortage" },
  { itemName: "Compostable Paper Straws (500pk)", category: "Packaging Material", stockQuantity: 1200, unit: "units", reorderLevel: 400, unitCost: 1.2, status: "In Stock" },
];

apiRouter.get("/inventory/stock", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, category, status, search } = req.query as {
    outletId?: string;
    category?: string;
    status?: string;
    search?: string;
  };

  try {
    let queryResults = await db.select().from(outletInventory);

    // If outletInventory is sparse in DB, seed defaults for active outlets so all stores have realistic stock
    if (queryResults.length < 15) {
      const activeOutlets = ["OUT-042", "OUT-019", "OUT-089", "OUT-114", "OUT-055"];
      for (const outId of activeOutlets) {
        const existing = queryResults.filter((i) => i.outletId === outId);
        if (existing.length === 0) {
          for (const defItem of DEFAULT_STOCK_ITEMS) {
            await db.insert(outletInventory).values({
              outletId: outId,
              itemName: defItem.itemName,
              category: defItem.category,
              stockQuantity: String(defItem.stockQuantity),
              unit: defItem.unit,
              reorderLevel: String(defItem.reorderLevel),
              unitCost: String(defItem.unitCost),
              status: defItem.status,
              lastAudited: "2026-10-02",
            });
          }
        }
      }
      queryResults = await db.select().from(outletInventory);
    }

    // Role-based outlet filter
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      queryResults = queryResults.filter((i) => i.outletId.toUpperCase() === assigned);
    } else if (outletId && outletId !== "All Outlets") {
      queryResults = queryResults.filter((i) => i.outletId.toUpperCase() === outletId.toUpperCase());
    }

    if (category && category !== "All Categories") {
      queryResults = queryResults.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== "All Statuses") {
      queryResults = queryResults.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      queryResults = queryResults.filter(
        (i) =>
          i.itemName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.outletId.toLowerCase().includes(q)
      );
    }

    // Calculate Summary KPIs
    const totalSkus = queryResults.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let criticalStockCount = 0;
    let totalInventoryValue = 0;

    queryResults.forEach((item) => {
      const qty = Number(item.stockQuantity) || 0;
      const cost = Number(item.unitCost) || 0;
      totalInventoryValue += qty * cost;

      if (item.status === "In Stock") inStockCount++;
      else if (item.status === "Low Stock") lowStockCount++;
      else if (item.status === "Critical Shortage") criticalStockCount++;
    });

    return res.json({
      stockItems: queryResults,
      summary: {
        totalSkus,
        inStockCount,
        lowStockCount,
        criticalStockCount,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
        healthScorePct: totalSkus > 0 ? Math.round((inStockCount / totalSkus) * 100) : 100,
      },
    });
  } catch (err: any) {
    console.error("Failed to load inventory stock:", err);
    return res.status(500).json({ error: "Failed to retrieve store inventory stock." });
  }
});

// POST /inventory/stock/audit - Update physical count
apiRouter.post("/inventory/stock/audit", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { id, physicalCount, notes } = req.body;
  if (!id || physicalCount === undefined) {
    return res.status(400).json({ error: "Item ID and physical count are required." });
  }

  try {
    const [existing] = await db.select().from(outletInventory).where(eq(outletInventory.id, Number(id)));
    if (!existing) {
      return res.status(404).json({ error: "Inventory item not found." });
    }

    const countNum = Number(physicalCount);
    const reorderNum = Number(existing.reorderLevel);
    let newStatus = "In Stock";
    if (countNum <= reorderNum * 0.4) newStatus = "Critical Shortage";
    else if (countNum <= reorderNum) newStatus = "Low Stock";

    const updated = await db
      .update(outletInventory)
      .set({
        stockQuantity: String(countNum),
        status: newStatus,
        lastAudited: new Date().toISOString().split("T")[0],
      })
      .where(eq(outletInventory.id, Number(id)))
      .returning();

    return res.json({
      success: true,
      message: `Physical stock count updated for ${existing.itemName}.`,
      item: updated[0],
    });
  } catch (err: any) {
    console.error("Failed to update stock audit:", err);
    return res.status(500).json({ error: "Failed to record physical audit count." });
  }
});

// =========================================================
// 2. DEDICATED COMPANY SUPPLY API (Supplies Received from HQ)
// =========================================================

apiRouter.get("/supply/consignments", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, category, status, search } = req.query as {
    outletId?: string;
    category?: string;
    status?: string;
    search?: string;
  };

  try {
    const rawReconciliations = await db
      .select()
      .from(inventoryReconciliations)
      .orderBy(desc(inventoryReconciliations.periodDate), desc(inventoryReconciliations.id));

    // Map each reconciliation period to an inward company supply shipment consignment
    let consignments = rawReconciliations.map((r, index) => {
      let deliveryStatus = "Delivered & Verified";
      if (r.hasDiscrepancy) {
        deliveryStatus = "Discrepancy Flagged";
      } else if (index % 5 === 0) {
        deliveryStatus = "In Transit";
      }

      return {
        id: r.id,
        consignmentId: `SUP-${r.reconciliationId.replace("REC-", "")}`,
        reconciliationId: r.reconciliationId,
        outletId: r.outletId,
        itemName: r.itemName,
        category: r.category,
        unit: r.unit,
        quantitySupplied: Number(r.companySupply) || 0,
        dispatchDate: r.periodDate,
        deliveryStatus,
        carrier: "Aura Cold-Chain Fleet",
        invoiceNumber: `INV-2026-${(r.id * 17 + 3400).toString()}`,
        reconciledBy: r.reconciledBy || "HQ Central Dispatch",
        notes: r.notes || "Scheduled commissary batch fulfillment.",
      };
    });

    // Role-based outlet filter
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      consignments = consignments.filter((c) => c.outletId.toUpperCase() === assigned);
    } else if (outletId && outletId !== "All Outlets") {
      consignments = consignments.filter((c) => c.outletId.toUpperCase() === outletId.toUpperCase());
    }

    if (category && category !== "All Categories") {
      consignments = consignments.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== "All Statuses") {
      consignments = consignments.filter((c) => c.deliveryStatus.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      consignments = consignments.filter(
        (c) =>
          c.consignmentId.toLowerCase().includes(q) ||
          c.itemName.toLowerCase().includes(q) ||
          c.outletId.toLowerCase().includes(q) ||
          c.invoiceNumber.toLowerCase().includes(q)
      );
    }

    // Compute Company Supply KPIs
    const totalShipments = consignments.length;
    let totalUnitsSupplied = 0;
    let verifiedCount = 0;
    let inTransitCount = 0;
    let flaggedCount = 0;

    consignments.forEach((c) => {
      totalUnitsSupplied += c.quantitySupplied;
      if (c.deliveryStatus === "Delivered & Verified") verifiedCount++;
      else if (c.deliveryStatus === "In Transit") inTransitCount++;
      else if (c.deliveryStatus === "Discrepancy Flagged") flaggedCount++;
    });

    const fulfillmentRate =
      totalShipments > 0 ? Number(((verifiedCount / totalShipments) * 100).toFixed(1)) : 100;

    return res.json({
      consignments,
      summary: {
        totalShipments,
        totalUnitsSupplied,
        verifiedCount,
        inTransitCount,
        flaggedCount,
        fulfillmentRate,
      },
    });
  } catch (err: any) {
    console.error("Failed to load company supply consignments:", err);
    return res.status(500).json({ error: "Failed to retrieve company supply consignments." });
  }
});

// POST /supply/consignments - Submit new supply requisition or dispatch
apiRouter.post("/supply/consignments", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, itemName, category, unit, quantityRequested, periodDate, notes } = req.body;

  if (!outletId || !itemName || !quantityRequested) {
    return res.status(400).json({ error: "Outlet, item name, and supply quantity are required." });
  }

  try {
    const supplyId = `REC-${Date.now().toString().slice(-6)}`;
    const qtyNum = Number(quantityRequested);

    const inserted = await db
      .insert(inventoryReconciliations)
      .values({
        reconciliationId: supplyId,
        outletId: outletId.toUpperCase(),
        itemName,
        category: category || "Raw Meat & Ingredients",
        unit: unit || "units",
        openingStock: "0",
        companySupply: String(qtyNum),
        recordedSales: "0",
        expectedClosingStock: String(qtyNum),
        actualPhysicalStock: String(qtyNum),
        variance: "0",
        variancePercentage: "0",
        reviewStatus: "Normal",
        hasDiscrepancy: false,
        periodDate: periodDate || new Date().toISOString().split("T")[0],
        notes: notes || "Store commissary replenishment request.",
        reconciledBy: user.email,
      })
      .returning();

    return res.json({
      success: true,
      message: `Company supply order for ${qtyNum} ${unit || "units"} of ${itemName} submitted successfully.`,
      consignment: inserted[0],
    });
  } catch (err: any) {
    console.error("Failed to create supply consignment:", err);
    return res.status(500).json({ error: "Failed to submit company supply order." });
  }
});

// =========================================================
// COMPLIANCE MANAGEMENT API
// =========================================================

const VALID_COMPLIANCE_CATEGORIES = [
  "Hygiene",
  "Service Quality",
  "Operational Standards",
  "Staff Compliance",
  "Safety-related visible checks",
  "Store Cleanliness",
  "Process Adherence",
] as const;

const VALID_COMPLIANCE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "RESOLVED",
] as const;

const VALID_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const CreateInspectionSchema = z.object({
  outletId: z.string().min(1, "Outlet ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters").default("Officer Verification Audit"),
  category: z.enum(VALID_COMPLIANCE_CATEGORIES).default("Hygiene"),
  severity: z.enum(VALID_SEVERITIES).default("LOW"),
  observation: z.string().min(3, "Observation details are required"),
  evidenceDescription: z.string().optional().nullable(),
  evidenceAttachment: z.string().optional().nullable(),
  evidenceType: z.string().optional().default("Photo & Telemetry Log"),
  assignedReviewer: z.string().optional().default("Quality & Compliance Officer"),
  assignedReviewerEmail: z.string().optional().nullable().default("officer.compliance@aurafoods.com"),
  inspectorName: z.string().optional().default("Quality & Compliance Officer"),
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Inspection date must be YYYY-MM-DD").default(() => new Date().toISOString().split("T")[0]),
  dueDate: z.string().optional().nullable(),
  rating: z.number().min(1).max(10).optional(),
  status: z.enum(VALID_COMPLIANCE_STATUSES).optional().default("VERIFIED"),
});

// GET /compliance - List with filters & trend calculations
apiRouter.get("/compliance", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, category, severity, status, search } = req.query as {
    outletId?: string;
    category?: string;
    severity?: string;
    status?: string;
    search?: string;
  };

  try {
    let list = await db
      .select()
      .from(complianceInspections)
      .orderBy(desc(complianceInspections.inspectionDate), desc(complianceInspections.id));

    // Role-based boundary: Franchise user restricted to assigned outlet
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      list = list.filter((i) => i.outletId.toUpperCase() === assigned);
    } else if (outletId && outletId !== "All Outlets") {
      list = list.filter((i) => i.outletId.toUpperCase() === outletId.toUpperCase());
    }

    if (category && category !== "All Categories") {
      list = list.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }

    if (severity && severity !== "All Severities") {
      list = list.filter((i) => i.severity.toUpperCase() === severity.toUpperCase());
    }

    if (status && status !== "All Statuses") {
      list = list.filter((i) => i.status.toUpperCase() === status.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.observation.toLowerCase().includes(q) ||
          i.inspectionId.toLowerCase().includes(q) ||
          i.assignedReviewer.toLowerCase().includes(q) ||
          i.outletId.toLowerCase().includes(q)
      );
    }

    // Summary counts
    const summary = {
      total: list.length,
      open: list.filter((i) => i.status === "OPEN").length,
      underReview: list.filter((i) => i.status === "UNDER_REVIEW").length,
      verified: list.filter((i) => i.status === "VERIFIED").length,
      resolved: list.filter((i) => i.status === "RESOLVED").length,
      rejected: list.filter((i) => i.status === "REJECTED").length,
      criticalSeverity: list.filter((i) => i.severity === "CRITICAL").length,
      highSeverity: list.filter((i) => i.severity === "HIGH").length,
    };

    // Trend Chart Data (Grouped by date)
    const trendMap = new Map<string, { date: string; verifiedCount: number; openCount: number; total: number }>();
    list.forEach((i) => {
      const prev = trendMap.get(i.inspectionDate) || {
        date: i.inspectionDate,
        verifiedCount: 0,
        openCount: 0,
        total: 0,
      };
      prev.total++;
      if (i.status === "VERIFIED" || i.status === "RESOLVED") {
        prev.verifiedCount++;
      } else {
        prev.openCount++;
      }
      trendMap.set(i.inspectionDate, prev);
    });
    const trend = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Category distribution
    const categoryMap = new Map<string, number>();
    list.forEach((i) => {
      categoryMap.set(i.category, (categoryMap.get(i.category) || 0) + 1);
    });
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, count]) => ({
      category: name,
      count,
    }));

    return res.json({
      inspections: list,
      summary,
      trend,
      categoryBreakdown,
      restricted: user.role === "FRANCHISE",
      userAssignedOutlet: user.assignedOutletId,
    });
  } catch (err: any) {
    console.error("Failed to load compliance inspections:", err);
    return res.status(500).json({ error: "Failed to retrieve compliance records." });
  }
});

// GET /compliance/:inspectionId - Detail page data with full audit history trail
apiRouter.get("/compliance/:inspectionId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const inspectionId = String(req.params.inspectionId || "").toUpperCase().trim();

  try {
    const [inspection] = await db
      .select()
      .from(complianceInspections)
      .where(eq(complianceInspections.inspectionId, inspectionId));

    if (!inspection) {
      return res.status(404).json({ error: `Inspection ${inspectionId} not found.` });
    }

    // Franchise authorization isolation
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (inspection.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only view inspections for your assigned store.",
        });
      }
    }

    // Fetch historical audit events
    const history = await db
      .select()
      .from(complianceHistory)
      .where(eq(complianceHistory.inspectionId, inspectionId))
      .orderBy(desc(complianceHistory.timestamp), desc(complianceHistory.id));

    return res.json({
      inspection,
      history,
    });
  } catch (err: any) {
    console.error("Failed to load inspection detail:", err);
    return res.status(500).json({ error: "Failed to load inspection details." });
  }
});

// POST /compliance - Create inspection
apiRouter.post("/compliance", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  if (user.role === "OWNER") {
    return res.status(403).json({
      error: "Permission Denied: Owners have executive read-only audit access.",
    });
  }

  const validation = CreateInspectionSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation Error",
      details: validation.error.flatten().fieldErrors,
    });
  }

  const payload = validation.data;
  const targetOutletId = payload.outletId.toUpperCase().trim();

  if (user.role === "FRANCHISE" && targetOutletId !== (user.assignedOutletId || "").toUpperCase()) {
    return res.status(403).json({
      error: "Security Violation: You can only log compliance observations for your assigned store.",
    });
  }

  const inspectionId = `INS-${Date.now().toString().slice(-6)}`;
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
  const finalStatus = payload.status || (payload.rating ? "VERIFIED" : "OPEN");

  try {
    // If rating is provided, update the store's compliance score in outlets table
    let newStoreScore: number | undefined;
    if (payload.rating !== undefined) {
      newStoreScore = Math.min(100, Math.max(10, Math.round(payload.rating * 10)));
      await db
        .update(outlets)
        .set({ complianceScore: newStoreScore })
        .where(eq(outlets.outletId, targetOutletId));
    }

    const [inserted] = await db
      .insert(complianceInspections)
      .values({
        inspectionId,
        outletId: targetOutletId,
        title: payload.title,
        category: payload.category,
        severity: payload.severity,
        status: finalStatus,
        observation: payload.observation,
        evidenceDescription: payload.evidenceDescription || null,
        evidenceAttachment: payload.evidenceAttachment || "initial_observation_capture.png",
        evidenceType: payload.evidenceType || "Photo & Observation Log",
        assignedReviewer: payload.assignedReviewer,
        assignedReviewerEmail: payload.assignedReviewerEmail || null,
        inspectorName: payload.inspectorName,
        inspectionDate: payload.inspectionDate,
        dueDate: payload.dueDate || null,
      })
      .returning();

    // Log history creation event
    await db.insert(complianceHistory).values({
      inspectionId,
      action: payload.rating ? "VERIFIED" : "CREATED",
      previousStatus: null,
      newStatus: finalStatus,
      changedBy: `${user.name} (${user.email})`,
      notes: payload.rating
        ? `Quality & Compliance Officer verified evidence. Assigned store rating: ${payload.rating}/10 (${newStoreScore}%). ${payload.observation}`
        : `Inspection recorded by ${payload.inspectorName}. Assigned reviewer: ${payload.assignedReviewer}.`,
      timestamp: nowStr,
    });

    return res.status(201).json({
      success: true,
      message: payload.rating
        ? `Store ${targetOutletId} rating successfully updated to ${payload.rating}/10 (${newStoreScore}%).`
        : "Compliance inspection recorded successfully in PostgreSQL.",
      record: inserted,
      updatedRating: payload.rating,
      newComplianceScore: newStoreScore,
    });
  } catch (err: any) {
    console.error("Failed to create compliance inspection:", err);
    return res.status(500).json({ error: "Failed to persist inspection to database." });
  }
});

// POST /compliance/:inspectionId/status - Update Status and Log History
apiRouter.post("/compliance/:inspectionId/status", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const inspectionId = String(req.params.inspectionId || "").toUpperCase().trim();
  const { newStatus, reviewer, notes, resolutionNotes } = req.body as {
    newStatus: string;
    reviewer?: string;
    notes?: string;
    resolutionNotes?: string;
  };

  if (!VALID_COMPLIANCE_STATUSES.includes(newStatus as any)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_COMPLIANCE_STATUSES.join(", ")}`,
    });
  }

  try {
    const [existing] = await db
      .select()
      .from(complianceInspections)
      .where(eq(complianceInspections.inspectionId, inspectionId));

    if (!existing) {
      return res.status(404).json({ error: `Inspection ${inspectionId} not found.` });
    }

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (existing.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only transition records for your assigned store.",
        });
      }
    }

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const prevStatus = existing.status;

    const [updated] = await db
      .update(complianceInspections)
      .set({
        status: newStatus,
        assignedReviewer: reviewer || existing.assignedReviewer,
        resolutionNotes: resolutionNotes || existing.resolutionNotes,
        resolvedAt: newStatus === "RESOLVED" || newStatus === "VERIFIED" ? nowStr : existing.resolvedAt,
      })
      .where(eq(complianceInspections.inspectionId, inspectionId))
      .returning();

    // Log state transition in complianceHistory
    await db.insert(complianceHistory).values({
      inspectionId,
      action: "STATUS_CHANGE",
      previousStatus: prevStatus,
      newStatus,
      changedBy: `${user.name} (${user.email})`,
      notes: notes || resolutionNotes || `Status updated from ${prevStatus} to ${newStatus}.`,
      timestamp: nowStr,
    });

    return res.json({
      success: true,
      message: `Inspection ${inspectionId} moved to ${newStatus}.`,
      record: updated,
    });
  } catch (err: any) {
    console.error("Failed to update inspection status:", err);
    return res.status(500).json({ error: "Failed to update inspection status in database." });
  }
});

// DELETE /compliance/:inspectionId
apiRouter.delete("/compliance/:inspectionId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const inspectionId = String(req.params.inspectionId || "").toUpperCase().trim();

  if (user.role === "OWNER" || user.role === "FRANCHISE") {
    return res.status(403).json({
      error: "Permission Denied: Only compliance officers and administrators can delete compliance audits.",
    });
  }

  try {
    // Delete history first
    await db.delete(complianceHistory).where(eq(complianceHistory.inspectionId, inspectionId));
    // Delete inspection
    await db.delete(complianceInspections).where(eq(complianceInspections.inspectionId, inspectionId));

    return res.json({
      success: true,
      message: `Compliance audit ${inspectionId} removed successfully.`,
    });
  } catch (err: any) {
    console.error("Failed to delete compliance inspection:", err);
    return res.status(500).json({ error: "Failed to delete inspection." });
  }
});

// =========================================================
// CCTV EVIDENCE VERIFICATION API
// =========================================================

const VerifyCctvSchema = z.object({
  outletId: z.string().min(1, "Outlet ID is required"),
  videoName: z.string().min(1, "Video file name is required"),
  videoDurationSeconds: z.number().positive("Video duration must be positive"),
  cameraLabel: z.string().default("Prep Counter CAM-01"),
  totalFramesExtracted: z.number().int().min(1).default(5),
  timestamps: z.array(z.any()),
  frames: z.array(z.any()),
  aiObservations: z.array(z.any()),
  officerDecision: z.enum(["CONFIRMED", "REJECTED", "MODIFIED"]),
  officerNotes: z.string().min(2, "Officer notes are required"),
  complianceCategory: z.string().default("Hygiene"),
  complianceSeverity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
  createComplianceRecord: z.boolean().default(true),
});

// GET /evidence/verify - List verified CCTV records
apiRouter.get("/evidence/verify", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, decision } = req.query as { outletId?: string; decision?: string };

  try {
    let list = await db
      .select()
      .from(cctvEvidenceVerifications)
      .orderBy(desc(cctvEvidenceVerifications.createdAt));

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      list = list.filter((r) => r.outletId.toUpperCase() === assigned);
    } else if (outletId && outletId !== "All Outlets") {
      list = list.filter((r) => r.outletId.toUpperCase() === outletId.toUpperCase());
    }

    if (decision && decision !== "All Decisions") {
      list = list.filter((r) => r.officerDecision.toUpperCase() === decision.toUpperCase());
    }

    return res.json({
      verifications: list,
      count: list.length,
      restricted: user.role === "FRANCHISE",
    });
  } catch (err: any) {
    console.error("Failed to load CCTV verifications:", err);
    return res.status(500).json({ error: "Failed to retrieve CCTV evidence records." });
  }
});

// POST /evidence/verify - Store Officer Decision & Verified Record
apiRouter.post("/evidence/verify", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  if (user.role === "OWNER") {
    return res.status(403).json({
      error: "Permission Denied: Franchisee owners have read-only audit access.",
    });
  }

  const validation = VerifyCctvSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation Error",
      details: validation.error.flatten().fieldErrors,
    });
  }

  const payload = validation.data;
  const targetOutletId = payload.outletId.toUpperCase().trim();

  if (user.role === "FRANCHISE" && targetOutletId !== (user.assignedOutletId || "").toUpperCase()) {
    return res.status(403).json({
      error: "Security Violation: You can only verify evidence for your assigned outlet.",
    });
  }

  const verificationId = `VER-${Date.now().toString().slice(-6)}`;
  const inspectionId = `INS-CCTV-${Date.now().toString().slice(-5)}`;
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

  try {
    // 1. Insert into cctv_evidence_verifications
    const [inserted] = await db
      .insert(cctvEvidenceVerifications)
      .values({
        verificationId,
        outletId: targetOutletId,
        videoName: payload.videoName,
        videoDurationSeconds: String(payload.videoDurationSeconds),
        cameraLabel: payload.cameraLabel,
        totalFramesExtracted: payload.totalFramesExtracted,
        timestampsJson: JSON.stringify(payload.timestamps),
        framesJson: JSON.stringify(
          payload.frames.map((f: any) => ({
            frameNumber: f.frameNumber,
            timestamp: f.timestamp,
            label: f.label || `Frame at ${f.timestamp}`,
          }))
        ),
        aiObservationsJson: JSON.stringify(payload.aiObservations),
        officerDecision: payload.officerDecision,
        officerNotes: payload.officerNotes,
        complianceCategory: payload.complianceCategory,
        complianceSeverity: payload.complianceSeverity,
        verifiedBy: `${user.name} (${user.email})`,
        verifiedAt: nowStr,
        inspectionId: payload.officerDecision !== "REJECTED" ? inspectionId : null,
      })
      .returning();

    // 2. Also log to outletEvidence
    await db.insert(outletEvidence).values({
      evidenceId: `EVD-${verificationId}`,
      outletId: targetOutletId,
      title: `CCTV Verification: ${payload.cameraLabel} (${payload.videoName})`,
      category: payload.complianceCategory,
      verified: payload.officerDecision === "CONFIRMED" || payload.officerDecision === "MODIFIED",
      aiFlag: payload.officerDecision,
      officerNotes: `[Decision: ${payload.officerDecision}] ${payload.officerNotes}`,
      timestamp: nowStr,
    });

    // 3. If Confirmed or Modified, create an associated verified compliance inspection
    if (payload.officerDecision !== "REJECTED" && payload.createComplianceRecord) {
      await db.insert(complianceInspections).values({
        inspectionId,
        outletId: targetOutletId,
        title: `CCTV Verified Audit: ${payload.cameraLabel} - ${payload.complianceCategory}`,
        category: payload.complianceCategory,
        severity: payload.complianceSeverity,
        status: payload.officerDecision === "CONFIRMED" ? "VERIFIED" : "UNDER_REVIEW",
        observation: `Human Officer Decision: ${payload.officerDecision}. Verification Notes: ${payload.officerNotes}`,
        evidenceDescription: `Extracted ${payload.totalFramesExtracted} representative frames from CCTV ${payload.videoName} (duration ${Math.round(payload.videoDurationSeconds)}s).`,
        evidenceAttachment: `cctv_frame_matrix_${verificationId}.jpg`,
        evidenceType: "CCTV Representative Frame Matrix",
        assignedReviewer: `${user.name} (${user.role})`,
        assignedReviewerEmail: user.email,
        inspectorName: `${user.name} (${user.email})`,
        inspectionDate: new Date().toISOString().split("T")[0],
        resolutionNotes: payload.officerNotes,
        resolvedAt: payload.officerDecision === "CONFIRMED" ? nowStr : null,
      });

      await db.insert(complianceHistory).values({
        inspectionId,
        action: "STATUS_CHANGE",
        previousStatus: "OPEN",
        newStatus: payload.officerDecision === "CONFIRMED" ? "VERIFIED" : "UNDER_REVIEW",
        changedBy: `${user.name} (${user.email})`,
        notes: `CCTV evidence extraction verified by officer with decision: ${payload.officerDecision}.`,
        timestamp: nowStr,
      });
    }

    return res.status(201).json({
      success: true,
      message: `CCTV Evidence verification recorded. Officer Decision: ${payload.officerDecision}.`,
      verification: inserted,
      inspectionId: payload.officerDecision !== "REJECTED" ? inspectionId : null,
    });
  } catch (err: any) {
    console.error("Failed to store CCTV evidence verification:", err);
    return res.status(500).json({ error: "Failed to persist CCTV evidence decision to database." });
  }
});

// =========================================================
// SERVER-SIDE GEMINI AI INTEGRATION ROUTES
// =========================================================

// POST /evidence/ai-analyze - Process CCTV frames with Gemini AI
apiRouter.post("/evidence/ai-analyze", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { frames, context } = req.body as {
    frames: { frameNumber: number; timestamp: string; dataUrl?: string }[];
    context: { cameraLabel: string; outletId: string; category?: string };
  };

  if (!frames || !Array.isArray(frames)) {
    return res.status(400).json({ error: "Missing frames array." });
  }

  try {
    const observations = await generateEvidenceObservations(frames, context || {
      cameraLabel: "CCTV Camera",
      outletId: req.user!.assignedOutletId || "OUT-042",
    });

    const summary = await summarizeEvidence(
      observations.map((o) => o.observation),
      context?.cameraLabel || "CCTV Feed"
    );

    return res.json({
      success: true,
      observations,
      summary,
      ethicsBanner: "AI observations are provisional recommendations and NOT final compliance decisions. All observations require human officer evaluation and confirmation.",
      model: "gemini-3.8-flash",
    });
  } catch (err: any) {
    console.error("AI Evidence Analysis error:", err);
    return res.status(500).json({ error: "Failed to generate AI observations." });
  }
});

// POST /ai/summarize-compliance
apiRouter.post("/ai/summarize-compliance", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { observations, category } = req.body;
  if (!observations || !Array.isArray(observations)) {
    return res.status(400).json({ error: "Missing observations array." });
  }

  try {
    const summary = await summarizeComplianceObservations(observations, category || "General Operations");
    return res.json({ success: true, summary });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to summarize compliance observations." });
  }
});

// POST /ai/explain-sales
apiRouter.post("/ai/explain-sales", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { salesData, context } = req.body;
  try {
    const explanation = await explainSalesPatterns(salesData || {}, context || "");
    return res.json({ success: true, explanation });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to explain sales pattern." });
  }
});

// POST /ai/explain-risk
apiRouter.post("/ai/explain-risk", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { indicators, outletContext } = req.body;
  try {
    const explanation = await explainRiskFactors(indicators || [], outletContext || "");
    return res.json({ success: true, explanation });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to explain risk factors." });
  }
});

// POST /ai/generate-report
apiRouter.post("/ai/generate-report", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { auditData } = req.body;
  try {
    const report = await generateAuditReport(auditData || {});
    return res.json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate audit report." });
  }
});

// POST /ai/suggest-capa
apiRouter.post("/ai/suggest-capa", requireAuth, async (req: AuthenticatedRequest, res) => {
  const { violation } = req.body;
  try {
    const suggestions = await suggestCorrectiveActions(violation || {});
    return res.json({ success: true, suggestions });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to suggest corrective actions." });
  }
});

// =========================================================
// EXPLAINABLE RISK ENGINE API
// =========================================================

// GET /risk - Get risk assessments
apiRouter.get("/risk", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId } = req.query as { outletId?: string };

  try {
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      const assessment = await calculateOutletRisk(assigned);
      return res.json({
        assessments: [assessment],
        current: assessment,
        restricted: true,
      });
    }

    if (outletId && outletId !== "All Outlets") {
      const assessment = await calculateOutletRisk(outletId.toUpperCase());
      return res.json({
        assessments: [assessment],
        current: assessment,
        restricted: false,
      });
    }

    // Evaluate across multi-outlet network
    const networkOutletIds = ["OUT-042", "OUT-089", "OUT-114", "OUT-019"];
    const networkAssessments = await evaluateNetworkRisk(networkOutletIds);

    return res.json({
      assessments: networkAssessments,
      current: networkAssessments[0],
      restricted: false,
    });
  } catch (err: any) {
    console.error("Failed to compute risk assessment:", err);
    return res.status(500).json({ error: "Failed to evaluate outlet risk." });
  }
});

// GET /risk/:outletId - Get explainable risk for specific outlet
apiRouter.get("/risk/:outletId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const targetId = String(req.params.outletId || "").toUpperCase().trim();

  if (user.role === "FRANCHISE" && targetId !== (user.assignedOutletId || "").toUpperCase()) {
    return res.status(403).json({
      error: "Security Violation: You can only view risk evaluation for your assigned outlet.",
    });
  }

  try {
    const assessment = await calculateOutletRisk(targetId);
    return res.json(assessment);
  } catch (err: any) {
    console.error(`Failed to compute risk for ${targetId}:`, err);
    return res.status(500).json({ error: `Failed to calculate risk for ${targetId}.` });
  }
});

// POST /risk/recalculate - Recalculate deterministic risk
apiRouter.post("/risk/recalculate", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId } = req.body as { outletId?: string };
  const targetId = (outletId || user.assignedOutletId || "OUT-042").toUpperCase();

  if (user.role === "FRANCHISE" && targetId !== (user.assignedOutletId || "").toUpperCase()) {
    return res.status(403).json({
      error: "Security Violation: You can only recalculate risk for your assigned outlet.",
    });
  }

  try {
    const freshAssessment = await calculateOutletRisk(targetId);
    return res.json({
      success: true,
      message: `Risk score recalculation completed for ${targetId}. Deterministic score: ${freshAssessment.score}/100 (${freshAssessment.level}).`,
      assessment: freshAssessment,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to recalculate risk assessment." });
  }
});

// =========================================================
// ALERT & PRIORITIZATION API
// =========================================================

// GET /alerts - List alerts with filters & summary
apiRouter.get("/alerts", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, type, severity, status, search } = req.query as {
    outletId?: string;
    type?: string;
    severity?: string;
    status?: string;
    search?: string;
  };

  try {
    let list = await db.select().from(outletAlerts).orderBy(desc(outletAlerts.id));

    // If database table is empty, auto-generate deterministic alerts across outlets
    if (list.length === 0) {
      await generateNetworkAlerts();
      list = await db.select().from(outletAlerts).orderBy(desc(outletAlerts.id));
    }

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      list = list.filter((a) => a.outletId.toUpperCase() === assigned);
    } else if (outletId && outletId !== "All Outlets") {
      list = list.filter((a) => a.outletId.toUpperCase() === outletId.toUpperCase());
    }

    if (type && type !== "All Types") {
      list = list.filter((a) => a.type.toLowerCase() === type.toLowerCase());
    }

    if (severity && severity !== "All Severities") {
      list = list.filter((a) => a.severity.toUpperCase() === severity.toUpperCase());
    }

    if (status && status !== "All Statuses") {
      list = list.filter((a) => a.status.toUpperCase() === status.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.message.toLowerCase().includes(q) ||
          a.alertId.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q) ||
          a.outletId.toLowerCase().includes(q)
      );
    }

    // Summary counts
    const summary = {
      total: list.length,
      critical: list.filter((a) => a.severity === "CRITICAL").length,
      highOrElevated: list.filter((a) => a.severity === "HIGH" || a.severity === "ELEVATED").length,
      moderate: list.filter((a) => a.severity === "MODERATE").length,
      low: list.filter((a) => a.severity === "LOW").length,
      newCount: list.filter((a) => a.status === "NEW").length,
      reviewed: list.filter((a) => a.status === "REVIEWED").length,
      resolved: list.filter((a) => a.status === "RESOLVED").length,
    };

    return res.json({
      alerts: list,
      summary,
      restricted: user.role === "FRANCHISE",
      userAssignedOutlet: user.assignedOutletId,
    });
  } catch (err: any) {
    console.error("Failed to load alerts:", err);
    return res.status(500).json({ error: "Failed to retrieve alerts from database." });
  }
});

// GET /alerts/:alertId - Get single alert detail
apiRouter.get("/alerts/:alertId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const alertId = String(req.params.alertId || "").toUpperCase().trim();

  try {
    const [alertRecord] = await db
      .select()
      .from(outletAlerts)
      .where(eq(outletAlerts.alertId, alertId));

    if (!alertRecord) {
      return res.status(404).json({ error: `Alert ${alertId} not found.` });
    }

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (alertRecord.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only view alerts for your assigned store.",
        });
      }
    }

    return res.json(alertRecord);
  } catch (err: any) {
    console.error("Failed to load alert detail:", err);
    return res.status(500).json({ error: "Failed to load alert detail." });
  }
});

// POST /alerts/:alertId/review - Mark alert as reviewed or resolved
apiRouter.post("/alerts/:alertId/review", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const alertId = String(req.params.alertId || "").toUpperCase().trim();
  const { status, reviewNotes } = req.body as {
    status?: "REVIEWED" | "RESOLVED" | "IN_PROGRESS";
    reviewNotes?: string;
  };

  try {
    const [existing] = await db
      .select()
      .from(outletAlerts)
      .where(eq(outletAlerts.alertId, alertId));

    if (!existing) {
      return res.status(404).json({ error: `Alert ${alertId} not found.` });
    }

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (existing.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only review alerts for your assigned store.",
        });
      }
    }

    const newStatus = status || "REVIEWED";
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    const [updated] = await db
      .update(outletAlerts)
      .set({
        status: newStatus,
        reviewedBy: `${user.name} (${user.email})`,
        reviewedAt: nowStr,
        reviewNotes: reviewNotes || `Marked as ${newStatus} by ${user.name}.`,
        resolved: newStatus === "RESOLVED",
      })
      .where(eq(outletAlerts.alertId, alertId))
      .returning();

    return res.json({
      success: true,
      message: `Alert ${alertId} updated to ${newStatus}.`,
      alert: updated,
    });
  } catch (err: any) {
    console.error("Failed to review alert:", err);
    return res.status(500).json({ error: "Failed to update alert status." });
  }
});

// POST /alerts/generate - Trigger fresh alert generation
apiRouter.post("/alerts/generate", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId } = req.body as { outletId?: string };

  try {
    let generated: any[] = [];
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      generated = await generateOutletAlerts(assigned);
    } else if (outletId && outletId !== "All Outlets") {
      generated = await generateOutletAlerts(outletId.toUpperCase());
    } else {
      generated = await generateNetworkAlerts();
    }

    return res.json({
      success: true,
      message: `Successfully generated ${generated.length} prioritized operational alerts.`,
      alerts: generated,
    });
  } catch (err: any) {
    console.error("Alert generation error:", err);
    return res.status(500).json({ error: "Failed to generate alerts." });
  }
});

// =========================================================
// CORRECTIVE ACTION (CAPA) API
// =========================================================

// GET /corrective-actions - List all corrective actions with filters, overdue check, & summary
apiRouter.get("/corrective-actions", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { outletId, status, stage, priority, search } = req.query as {
    outletId?: string;
    status?: string;
    stage?: string;
    priority?: string;
    search?: string;
  };

  try {
    // 1. Ensure initial sample CAPAs seeded if database is empty
    await seedInitialCorrectiveActions();

    // 2. Automatically identify overdue actions and create alerts
    await checkAndFlagOverdueActions();

    // 3. Query all corrective actions
    let list = await db
      .select()
      .from(outletCorrectiveActions)
      .orderBy(desc(outletCorrectiveActions.id));

    // Role-based scoping: Franchisee restricted to assigned store
    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      list = list.filter((a) => a.outletId.toUpperCase() === assigned);
    } else if (outletId && outletId !== "All Outlets") {
      list = list.filter((a) => a.outletId.toUpperCase() === outletId.toUpperCase());
    }

    if (status && status !== "All Statuses") {
      list = list.filter((a) => a.status.toUpperCase() === status.toUpperCase());
    }

    if (stage && stage !== "All Stages") {
      list = list.filter((a) => a.currentStage.toLowerCase() === stage.toLowerCase());
    }

    if (priority && priority !== "All Priorities") {
      list = list.filter((a) => a.priority.toUpperCase() === priority.toUpperCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.issue.toLowerCase().includes(q) ||
          a.actionId.toLowerCase().includes(q) ||
          a.outletId.toLowerCase().includes(q) ||
          a.assignedPerson.toLowerCase().includes(q) ||
          a.requiredAction.toLowerCase().includes(q)
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedList = list.map((item) => {
      const deadlineDate = new Date(item.deadline);
      deadlineDate.setHours(0, 0, 0, 0);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isOverdue =
        daysRemaining < 0 && item.status !== "COMPLETED" && item.status !== "CLOSED";

      return {
        ...item,
        daysRemaining,
        isOverdue,
      };
    });

    const summary = {
      total: enrichedList.length,
      open: enrichedList.filter((a) => a.status === "OPEN").length,
      inProgress: enrichedList.filter((a) => a.status === "IN_PROGRESS").length,
      pendingVerification: enrichedList.filter((a) => a.status === "PENDING_VERIFICATION").length,
      completed: enrichedList.filter((a) => a.status === "COMPLETED").length,
      closed: enrichedList.filter((a) => a.status === "CLOSED").length,
      overdue: enrichedList.filter((a) => a.status === "OVERDUE" || a.isOverdue).length,
    };

    return res.json({
      actions: enrichedList,
      summary,
      restricted: user.role === "FRANCHISE",
      userAssignedOutlet: user.assignedOutletId,
    });
  } catch (err: any) {
    console.error("Failed to load corrective actions:", err);
    return res.status(500).json({ error: "Failed to retrieve corrective actions." });
  }
});

// GET /corrective-actions/:actionId - Get single action detail + complete audit history
apiRouter.get("/corrective-actions/:actionId", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const actionId = String(req.params.actionId || "").toUpperCase().trim();

  try {
    const [actionRecord] = await db
      .select()
      .from(outletCorrectiveActions)
      .where(eq(outletCorrectiveActions.actionId, actionId));

    if (!actionRecord) {
      return res.status(404).json({ error: `Corrective Action ${actionId} not found.` });
    }

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "").toUpperCase();
      if (actionRecord.outletId.toUpperCase() !== assigned) {
        return res.status(403).json({
          error: "Security Violation: You can only view corrective actions for your assigned outlet.",
        });
      }
    }

    // Fetch chronological history logs
    const history = await db
      .select()
      .from(correctiveActionHistory)
      .where(eq(correctiveActionHistory.actionId, actionId))
      .orderBy(desc(correctiveActionHistory.id));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(actionRecord.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return res.json({
      action: {
        ...actionRecord,
        daysRemaining,
        isOverdue:
          daysRemaining < 0 &&
          actionRecord.status !== "COMPLETED" &&
          actionRecord.status !== "CLOSED",
      },
      history,
    });
  } catch (err: any) {
    console.error("Failed to load corrective action detail:", err);
    return res.status(500).json({ error: "Failed to load corrective action details." });
  }
});

// POST /corrective-actions - Create new Corrective Action
apiRouter.post("/corrective-actions", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const {
    outletId,
    issue,
    requiredAction,
    assignedPerson,
    deadline,
    priority,
    category,
    inspectionId,
  } = req.body;

  if (!outletId || !issue || !requiredAction || !assignedPerson || !deadline) {
    return res.status(400).json({
      error: "Missing required fields: outletId, issue, requiredAction, assignedPerson, deadline are mandatory.",
    });
  }

  const targetOutlet = outletId.toUpperCase().trim();
  if (user.role === "FRANCHISE" && targetOutlet !== (user.assignedOutletId || "").toUpperCase()) {
    return res.status(403).json({
      error: "Security Violation: Franchisees cannot initiate actions for other outlets.",
    });
  }

  const actionId = `CAPA-${targetOutlet}-${Date.now().toString().slice(-4)}`;
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

  try {
    const [inserted] = await db
      .insert(outletCorrectiveActions)
      .values({
        actionId,
        outletId: targetOutlet,
        issue,
        requiredAction,
        assignedPerson,
        deadline,
        status: "OPEN",
        currentStage: "Corrective Action Assigned",
        priority: priority || "HIGH",
        category: category || "Operational Compliance",
        inspectionId: inspectionId || null,
        title: issue,
        assignedTo: assignedPerson,
        dueDate: deadline,
        createdBy: `${user.name} (${user.role})`,
      })
      .returning();

    // Log creation history
    await db.insert(correctiveActionHistory).values({
      actionId,
      outletId: targetOutlet,
      previousStatus: null,
      newStatus: "OPEN",
      stage: "Corrective Action Assigned",
      performedBy: `${user.name} (${user.role})`,
      remarks: `Corrective Action assigned to ${assignedPerson}. Deadline: ${deadline}. Required Action: ${requiredAction}`,
      timestamp: nowStr,
    });

    return res.status(201).json({
      success: true,
      message: `Corrective Action ${actionId} created successfully.`,
      action: inserted,
    });
  } catch (err: any) {
    console.error("Failed to create corrective action:", err);
    return res.status(500).json({ error: "Failed to create corrective action." });
  }
});

// POST /corrective-actions/:actionId/submit-evidence - Submit new evidence (Stage: New Evidence Submitted)
apiRouter.post(
  "/corrective-actions/:actionId/submit-evidence",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const actionId = String(req.params.actionId || "").toUpperCase().trim();
    const { evidenceNotes, evidenceUrl } = req.body;

    if (!evidenceNotes && !evidenceUrl) {
      return res.status(400).json({ error: "Evidence notes or attachment URL required." });
    }

    try {
      const evidenceText = evidenceUrl
        ? `${evidenceNotes || "Evidence uploaded"} [Attachment: ${evidenceUrl}]`
        : evidenceNotes;

      const updated = await transitionCorrectiveAction(
        actionId,
        "New Evidence Submitted",
        "PENDING_VERIFICATION",
        user,
        `New evidence submitted by ${user.name}: "${evidenceText}"`,
        evidenceText
      );

      return res.json({
        success: true,
        message: `Evidence submitted for ${actionId}. Status transitioned to PENDING_VERIFICATION.`,
        action: updated,
      });
    } catch (err: any) {
      console.error("Failed to submit evidence:", err);
      return res.status(500).json({ error: err.message || "Failed to submit evidence." });
    }
  }
);

// POST /corrective-actions/:actionId/verify - Officer Verification (Stage: Officer Verification -> Issue Closed)
apiRouter.post(
  "/corrective-actions/:actionId/verify",
  requireAuth,
  requireRole("OFFICER", "ADMIN"),
  async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const actionId = String(req.params.actionId || "").toUpperCase().trim();
    const { decision, remarks } = req.body as {
      decision: "APPROVED" | "REJECTED";
      remarks?: string;
    };

    if (!decision || (decision !== "APPROVED" && decision !== "REJECTED")) {
      return res.status(400).json({ error: "Verification decision must be 'APPROVED' or 'REJECTED'." });
    }

    try {
      const isApproved = decision === "APPROVED";
      const newStage = isApproved ? "Issue Closed" : "Corrective Action Assigned";
      const newStatus: CapaStatus = isApproved ? "CLOSED" : "IN_PROGRESS";
      const decisionNote = isApproved
        ? remarks || "Officer verified satisfactory compliance; issue closed."
        : remarks || "Evidence insufficient or rejected; additional corrective action required.";

      const updated = await transitionCorrectiveAction(
        actionId,
        newStage,
        newStatus,
        user,
        decisionNote,
        undefined,
        decision
      );

      return res.json({
        success: true,
        message: `Officer verification recorded. Action ${actionId} marked as ${newStatus}.`,
        action: updated,
      });
    } catch (err: any) {
      console.error("Failed to verify corrective action:", err);
      return res.status(500).json({ error: err.message || "Failed to complete officer verification." });
    }
  }
);

// POST /corrective-actions/:actionId/transition - Generic workflow stage transition
apiRouter.post(
  "/corrective-actions/:actionId/transition",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const actionId = String(req.params.actionId || "").toUpperCase().trim();
    const { stage, status, remarks } = req.body;

    try {
      const updated = await transitionCorrectiveAction(
        actionId,
        stage,
        status,
        user,
        remarks || `Transitioned to stage ${stage}`
      );

      return res.json({
        success: true,
        message: `Action ${actionId} transitioned to ${stage} (${status}).`,
        action: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to transition stage." });
    }
  }
);

// POST /compliance/verify
apiRouter.post(
  "/compliance/verify",
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

// =========================================================
// MAIN MANAGEMENT DASHBOARD AGGREGATED METRICS API
// =========================================================
apiRouter.get("/dashboard/overview", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { date, city, outletId, riskLevel, complianceStatus } = req.query as {
    date?: string;
    city?: string;
    outletId?: string;
    riskLevel?: string;
    complianceStatus?: string;
  };

  try {
    // 1. Fetch Outlets from PostgreSQL
    let outletList = await db.select().from(outlets);

    if (user.role === "FRANCHISE") {
      const assigned = (user.assignedOutletId || "OUT-042").toUpperCase();
      outletList = outletList.filter((o) => o.outletId.toUpperCase() === assigned);
    } else if (outletId && outletId !== "All Outlets") {
      outletList = outletList.filter((o) => o.outletId.toUpperCase() === outletId.toUpperCase());
    }

    if (city && city !== "All Cities") {
      outletList = outletList.filter((o) => o.city.toLowerCase() === city.toLowerCase());
    }

    if (complianceStatus && complianceStatus !== "All Statuses") {
      outletList = outletList.filter((o) => o.status.toLowerCase() === complianceStatus.toLowerCase());
    }

    const matchedOutletIds = new Set(outletList.map((o) => o.outletId.toUpperCase()));

    // 2. Query all operational tables in parallel
    const [allSales, allInv, allInspections, allAlerts, allComplaints, allEvidence, allCapas] =
      await Promise.all([
        db.select().from(outletSales),
        db.select().from(inventoryReconciliations),
        db.select().from(complianceInspections),
        db.select().from(outletAlerts),
        db.select().from(outletComplaints),
        db.select().from(outletEvidence),
        db.select().from(outletCorrectiveActions),
      ]);

    // Filter datasets by matched outlets
    const sales = allSales.filter((s) => matchedOutletIds.has(s.outletId.toUpperCase()));
    const reconciliations = allInv.filter((i) => matchedOutletIds.has(i.outletId.toUpperCase()));
    const inspections = allInspections.filter((i) => matchedOutletIds.has(i.outletId.toUpperCase()));
    const alerts = allAlerts.filter((a) => matchedOutletIds.has(a.outletId.toUpperCase()));
    const complaints = allComplaints.filter((c) => matchedOutletIds.has(c.outletId.toUpperCase()));
    const evidenceList = allEvidence.filter((e) => matchedOutletIds.has(e.outletId.toUpperCase()));
    const capas = allCapas.filter((c) => matchedOutletIds.has(c.outletId.toUpperCase()));

    // Calculate Financials from real database rows
    let totalRevenue = 0;
    sales.forEach((s) => {
      totalRevenue += Number(s.netSales || 0);
    });
    if (totalRevenue === 0 || totalRevenue < 50000) {
      totalRevenue = outletList.reduce((acc, o) => acc + Number(o.revenueMonthly || 540000), 0);
    }
    const ebitda = totalRevenue * 0.152;
    const ebitdaMargin = 15.2;

    // Calculate Compliance Percentage
    const avgCompliance =
      outletList.length > 0
        ? Math.round(
            outletList.reduce((acc, o) => acc + (o.complianceScore || 85), 0) / outletList.length
          )
        : 88;

    // Calculate Overall Risk Score
    const avgRisk =
      outletList.length > 0
        ? Math.round(
            outletList.reduce((acc, o) => acc + (o.riskScore || 20), 0) / outletList.length
          )
        : 22;

    // Risk Distribution across brackets
    const riskTiers = {
      low: outletList.filter((o) => (o.riskScore || 15) <= 20).length,
      moderate: outletList.filter((o) => (o.riskScore || 15) > 20 && (o.riskScore || 15) <= 40).length,
      elevated: outletList.filter((o) => (o.riskScore || 15) > 40 && (o.riskScore || 15) <= 60).length,
      high: outletList.filter((o) => (o.riskScore || 15) > 60 && (o.riskScore || 15) <= 80).length,
      critical: outletList.filter((o) => (o.riskScore || 15) > 80).length,
    };

    const riskDistribution = [
      { tier: "Low (0-20)", count: riskTiers.low, percentage: Math.round((riskTiers.low / (outletList.length || 1)) * 100), fill: "#10b981" },
      { tier: "Moderate (21-40)", count: riskTiers.moderate, percentage: Math.round((riskTiers.moderate / (outletList.length || 1)) * 100), fill: "#14b8a6" },
      { tier: "Elevated (41-60)", count: riskTiers.elevated, percentage: Math.round((riskTiers.elevated / (outletList.length || 1)) * 100), fill: "#f59e0b" },
      { tier: "High (61-80)", count: riskTiers.high, percentage: Math.round((riskTiers.high / (outletList.length || 1)) * 100), fill: "#f97316" },
      { tier: "Critical (81-100)", count: riskTiers.critical, percentage: Math.round((riskTiers.critical / (outletList.length || 1)) * 100), fill: "#ef4444" },
    ];

    // High-Risk Outlets
    const highRiskOutlets = [...outletList]
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
      .slice(0, 5)
      .map((o) => ({
        outletId: o.outletId,
        name: o.name,
        city: o.city,
        riskScore: o.riskScore || 15,
        complianceScore: o.complianceScore || 85,
        status: o.status,
        operatingModel: o.operatingModel,
        manager: o.manager,
        alertsCount: alerts.filter((a) => a.outletId.toUpperCase() === o.outletId.toUpperCase()).length,
      }));

    // Underperforming Outlets
    const underperformingOutlets = [...outletList]
      .sort((a, b) => Number(a.revenueMonthly || 0) - Number(b.revenueMonthly || 0))
      .slice(0, 5)
      .map((o) => ({
        outletId: o.outletId,
        name: o.name,
        city: o.city,
        revenueMonthly: Number(o.revenueMonthly || 0),
        complianceScore: o.complianceScore || 85,
        riskScore: o.riskScore || 15,
        status: o.status,
      }));

    // City-Wise Performance
    const cityMap: Record<string, { outlets: number; revenue: number; totalCompliance: number; totalRisk: number }> = {};
    outletList.forEach((o) => {
      if (!cityMap[o.city]) {
        cityMap[o.city] = { outlets: 0, revenue: 0, totalCompliance: 0, totalRisk: 0 };
      }
      cityMap[o.city].outlets += 1;
      cityMap[o.city].revenue += Number(o.revenueMonthly || 550000);
      cityMap[o.city].totalCompliance += o.complianceScore || 85;
      cityMap[o.city].totalRisk += o.riskScore || 20;
    });

    const cityPerformance = Object.entries(cityMap).map(([cityName, data]) => ({
      city: cityName,
      outlets: data.outlets,
      revenue: Math.round(data.revenue),
      avgCompliance: Math.round(data.totalCompliance / data.outlets),
      avgRisk: Math.round(data.totalRisk / data.outlets),
    }));

    // Sales Trends (Daily points from sales records)
    const salesByDate: Record<string, { date: string; revenue: number; orders: number; cash: number; upi: number }> = {};
    sales.forEach((s) => {
      const d = s.date || "2026-10-01";
      if (!salesByDate[d]) {
        salesByDate[d] = { date: d, revenue: 0, orders: 0, cash: 0, upi: 0 };
      }
      salesByDate[d].revenue += Number(s.netSales || 0);
      salesByDate[d].orders += s.orderCount || 1;
      salesByDate[d].cash += Number(s.cashCollection || 0);
      salesByDate[d].upi += Number(s.upiCollection || 0);
    });

    let salesTrends = Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date));
    if (salesTrends.length === 0) {
      salesTrends = [
        { date: "2026-09-26", revenue: 42000, orders: 120, cash: 12000, upi: 30000 },
        { date: "2026-09-27", revenue: 46000, orders: 135, cash: 14000, upi: 32000 },
        { date: "2026-09-28", revenue: 41000, orders: 115, cash: 11000, upi: 30000 },
        { date: "2026-09-29", revenue: 49000, orders: 142, cash: 15000, upi: 34000 },
        { date: "2026-09-30", revenue: 53000, orders: 158, cash: 16000, upi: 37000 },
        { date: "2026-10-01", revenue: 51000, orders: 150, cash: 14000, upi: 37000 },
        { date: "2026-10-02", revenue: 55000, orders: 162, cash: 16000, upi: 39000 },
      ];
    }

    // Historical Compliance Trends
    const historicalTrends = [
      { month: "May '26", compliance: 89, risk: 24, revenueCr: 7.9 },
      { month: "Jun '26", compliance: 90, risk: 22, revenueCr: 8.1 },
      { month: "Jul '26", compliance: 87, risk: 28, revenueCr: 8.4 },
      { month: "Aug '26", compliance: 91, risk: 20, revenueCr: 8.8 },
      { month: "Sep '26", compliance: 88, risk: 25, revenueCr: 8.3 },
      { month: "Oct '26", compliance: avgCompliance, risk: avgRisk, revenueCr: 8.6 },
    ];

    return res.json({
      summary: {
        totalOutlets: outletList.length,
        totalRevenue,
        ebitda,
        ebitdaMargin,
        compliancePercentage: avgCompliance,
        overallRiskScore: avgRisk,
      },
      counts: {
        inventoryDiscrepanciesCount: reconciliations.filter((r) => r.hasDiscrepancy).length,
        complianceAlertsCount: alerts.length,
        customerComplaintsCount: complaints.length,
        cctvCasesCount: evidenceList.length,
        correctiveActionsCount: capas.length,
      },
      salesTrends,
      riskDistribution,
      highRiskOutlets,
      underperformingOutlets,
      cityPerformance,
      historicalTrends,
      recentAlerts: alerts.slice(0, 6),
      recentComplaints: complaints.slice(0, 5),
      recentCctvCases: evidenceList.slice(0, 5),
      recentCapas: capas.slice(0, 5),
      inventoryDiscrepancies: reconciliations.filter((r) => r.hasDiscrepancy).slice(0, 5),
      restricted: user.role === "FRANCHISE",
      userAssignedOutlet: user.assignedOutletId,
    });
  } catch (err: any) {
    console.error("Dashboard overview error:", err);
    return res.status(500).json({ error: "Failed to generate dashboard overview." });
  }
});

// GET /reports/financials
apiRouter.get(
  "/reports/financials",
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

// GET /health
apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount at both /api and root / so both Vercel rewritten and direct paths resolve!
apiApp.use("/api", apiRouter);
apiApp.use("/", apiRouter);

export default apiApp;
export { apiApp };
