import { pgTable, serial, text, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table (Linked to Auth UID)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("FRANCHISE"), // ADMIN, OWNER, OFFICER, FRANCHISE
  assignedOutletId: text("assigned_outlet_id"),
  assignedOutletName: text("assigned_outlet_name"),
  companyId: text("company_id").default("cmp-universal-01"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Outlets Table (Core entity for Outlet Management)
export const outlets = pgTable("outlets", {
  id: serial("id").primaryKey(),
  outletId: text("outlet_id").notNull().unique(), // e.g. 'OUT-042'
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  address: text("address").notNull(),
  operatingModel: text("operating_model").notNull(), // 'COCO' | 'FOCO'
  status: text("status").notNull().default("Active"), // 'Active' | 'Under Audit' | 'Grace Period' | 'Notice Issued' | 'Critical Escalation'
  assignedFranchiseUser: text("assigned_franchise_user").notNull(),
  assignedFranchiseEmail: text("assigned_franchise_email").notNull(),
  manager: text("manager").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  openedDate: text("opened_date").notNull(),
  complianceScore: integer("compliance_score").notNull().default(85),
  riskScore: integer("risk_score").notNull().default(15),
  revenueMonthly: numeric("revenue_monthly").notNull().default("0"),
  ebitdaMargin: numeric("ebitda_margin").notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. Sales Table
export const outletSales = pgTable("outlet_sales", {
  id: serial("id").primaryKey(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  date: text("date").notNull(),
  productName: text("product_name").notNull().default("Signature Truffle Burger Meal"),
  category: text("category").notNull().default("Burgers & Meals"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price").notNull().default("350"),
  netSales: numeric("net_sales").notNull(),
  grossSales: numeric("gross_sales").notNull(),
  orderCount: integer("order_count").notNull().default(1),
  avgTicket: numeric("avg_ticket").notNull().default("350"),
  paymentMode: text("payment_mode").notNull().default("UPI"), // 'UPI' | 'Cash' | 'Card'
  cashCollection: numeric("cash_collection").notNull().default("0"),
  upiCollection: numeric("upi_collection").notNull().default("0"),
  cardCollection: numeric("card_collection").notNull().default("0"),
  posSettled: boolean("pos_settled").notNull().default(true),
  notes: text("notes"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. Inventory Table
export const outletInventory = pgTable("outlet_inventory", {
  id: serial("id").primaryKey(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  stockQuantity: numeric("stock_quantity").notNull(),
  unit: text("unit").notNull(),
  reorderLevel: numeric("reorder_level").notNull(),
  unitCost: numeric("unit_cost").notNull(),
  variancePct: numeric("variance_pct").notNull().default("0"),
  status: text("status").notNull().default("In Stock"), // 'In Stock' | 'Low Stock' | 'Critical Shortage'
  lastAudited: text("last_audited").notNull(),
});

// 4b. Inventory Reconciliations Table (Stock-Sales Reconciliation)
export const inventoryReconciliations = pgTable("inventory_reconciliations", {
  id: serial("id").primaryKey(),
  reconciliationId: text("reconciliation_id").notNull().unique(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  itemName: text("item_name").notNull(),
  category: text("category").notNull().default("Raw Meat & Ingredients"),
  unit: text("unit").notNull().default("units"),
  openingStock: numeric("opening_stock").notNull(),
  companySupply: numeric("company_supply").notNull(), // Received Stock
  recordedSales: numeric("recorded_sales").notNull(), // Sold Quantity
  expectedClosingStock: numeric("expected_closing_stock").notNull(),
  actualPhysicalStock: numeric("actual_physical_stock").notNull(),
  variance: numeric("variance").notNull(),
  variancePercentage: numeric("variance_percentage").notNull(),
  reviewStatus: text("review_status").notNull().default("Normal"), // 'Normal' | 'Discrepancy Detected — Requires Review' | 'Reviewed & Resolved'
  hasDiscrepancy: boolean("has_discrepancy").notNull().default(false),
  alertMessage: text("alert_message"),
  periodDate: text("period_date").notNull(),
  notes: text("notes"),
  reconciledBy: text("reconciled_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 5. Complaints Table
export const outletComplaints = pgTable("outlet_complaints", {
  id: serial("id").primaryKey(),
  complaintId: text("complaint_id").notNull().unique(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  customerName: text("customer_name").notNull(),
  category: text("category").notNull(),
  severity: text("severity").notNull(), // 'Low' | 'Medium' | 'High' | 'Critical'
  description: text("description").notNull(),
  status: text("status").notNull().default("Open"), // 'Open' | 'Investigating' | 'Resolved'
  reportedAt: text("reported_at").notNull(),
});

// 6. Evidence Table
export const outletEvidence = pgTable("outlet_evidence", {
  id: serial("id").primaryKey(),
  evidenceId: text("evidence_id").notNull().unique(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  title: text("title").notNull(),
  category: text("category").notNull(),
  verified: boolean("verified").notNull().default(true),
  aiFlag: text("ai_flag"),
  officerNotes: text("officer_notes"),
  timestamp: text("timestamp").notNull(),
});

// 7. Alerts Table
export const outletAlerts = pgTable("outlet_alerts", {
  id: serial("id").primaryKey(),
  alertId: text("alert_id").notNull().unique(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  type: text("type").notNull().default("Operational deviations"),
  severity: text("severity").notNull(), // 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL'
  priority: text("priority").notNull().default("Routine monitoring"),
  category: text("category").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("NEW"), // 'NEW' | 'REVIEWED' | 'IN_PROGRESS' | 'RESOLVED'
  riskScore: integer("risk_score"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdDate: text("created_date").notNull(),
  timestamp: text("timestamp").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// 8. Corrective Actions (CAPA) Table
export const outletCorrectiveActions = pgTable("outlet_corrective_actions", {
  id: serial("id").primaryKey(),
  actionId: text("action_id").notNull().unique(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  title: text("title").notNull(),
  assignedTo: text("assigned_to").notNull(),
  dueDate: text("due_date").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull().default("Pending"), // 'Pending' | 'In Progress' | 'Verified & Closed'
  resolutionNotes: text("resolution_notes"),
});

// 9. Audit History Table
export const outletHistory = pgTable("outlet_history", {
  id: serial("id").primaryKey(),
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  auditDate: text("audit_date").notNull(),
  auditorName: text("auditor_name").notNull(),
  score: integer("score").notNull(),
  status: text("status").notNull(),
  summary: text("summary").notNull(),
});

// 10. Compliance Inspections & Observations Table
export const complianceInspections = pgTable("compliance_inspections", {
  id: serial("id").primaryKey(),
  inspectionId: text("inspection_id").notNull().unique(), // e.g. INS-2026-042
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  title: text("title").notNull(),
  category: text("category").notNull(), // Hygiene, Service Quality, Operational Standards, Staff Compliance, Safety-related visible checks, Store Cleanliness, Process Adherence
  severity: text("severity").notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  status: text("status").notNull().default("OPEN"), // OPEN, UNDER_REVIEW, VERIFIED, REJECTED, RESOLVED
  observation: text("observation").notNull(),
  evidenceDescription: text("evidence_description"),
  evidenceAttachment: text("evidence_attachment"), // Photo, scan or telemetry attachment label/url
  evidenceType: text("evidence_type").default("Photo & Observation Log"),
  assignedReviewer: text("assigned_reviewer").notNull(), // Assigned Officer
  assignedReviewerEmail: text("assigned_reviewer_email"),
  inspectorName: text("inspector_name").notNull(),
  inspectionDate: text("inspection_date").notNull(),
  dueDate: text("due_date"),
  resolutionNotes: text("resolution_notes"),
  resolvedAt: text("resolved_at"),
  scoreImpact: integer("score_impact").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

// 11. Compliance Audit History Table
export const complianceHistory = pgTable("compliance_history", {
  id: serial("id").primaryKey(),
  inspectionId: text("inspection_id").notNull().references(() => complianceInspections.inspectionId),
  action: text("action").notNull(), // CREATED, STATUS_CHANGE, REVIEWER_ASSIGNED, EVIDENCE_ATTACHED, RESOLUTION_ADDED
  previousStatus: text("previous_status"),
  newStatus: text("new_status"),
  changedBy: text("changed_by").notNull(),
  notes: text("notes"),
  timestamp: text("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 12. CCTV Evidence Verifications Table
export const cctvEvidenceVerifications = pgTable("cctv_evidence_verifications", {
  id: serial("id").primaryKey(),
  verificationId: text("verification_id").notNull().unique(), // e.g. VER-2026-901
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  videoName: text("video_name").notNull(),
  videoDurationSeconds: numeric("video_duration_seconds").notNull(),
  cameraLabel: text("camera_label").notNull().default("Prep Counter CAM-01"),
  totalFramesExtracted: integer("total_frames_extracted").notNull().default(5),
  timestampsJson: text("timestamps_json").notNull(), // JSON array of selected timestamps
  framesJson: text("frames_json").notNull(), // JSON array of frames metadata + dataURLs
  aiObservationsJson: text("ai_observations_json").notNull(), // AI provisional observations
  officerDecision: text("officer_decision").notNull(), // 'CONFIRMED' | 'REJECTED' | 'MODIFIED'
  officerNotes: text("officer_notes").notNull(),
  complianceCategory: text("compliance_category").notNull(),
  complianceSeverity: text("compliance_severity").notNull().default("LOW"),
  verifiedBy: text("verified_by").notNull(),
  verifiedAt: text("verified_at").notNull(),
  inspectionId: text("inspection_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 13. Explainable Risk Assessments Table
export const outletRiskAssessments = pgTable("outlet_risk_assessments", {
  id: serial("id").primaryKey(),
  assessmentId: text("assessment_id").notNull().unique(), // e.g. RSK-2026-042
  outletId: text("outlet_id").notNull().references(() => outlets.outletId),
  score: integer("score").notNull(), // 0–100 deterministic
  level: text("level").notNull(), // 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical'
  factorSalesAnomalies: numeric("factor_sales_anomalies").notNull(), // 0-100 (30% weight)
  factorCompliance: numeric("factor_compliance").notNull(), // 0-100 (20% weight)
  factorComplaints: numeric("factor_complaints").notNull(), // 0-100 (20% weight)
  factorEvidence: numeric("factor_evidence").notNull(), // 0-100 (15% weight)
  factorOperational: numeric("factor_operational").notNull(), // 0-100 (10% weight)
  factorInventory: numeric("factor_inventory").notNull(), // 0-100 (5% weight)
  contributingFactorsJson: text("contributing_factors_json").notNull(), // JSON array of breakdown factors
  explanation: text("explanation").notNull(), // Explainable explanation
  assessedAt: text("assessed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const outletsRelations = relations(outlets, ({ many }) => ({
  sales: many(outletSales),
  inventory: many(outletInventory),
  complaints: many(outletComplaints),
  evidence: many(outletEvidence),
  alerts: many(outletAlerts),
  correctiveActions: many(outletCorrectiveActions),
  history: many(outletHistory),
  inspections: many(complianceInspections),
}));
