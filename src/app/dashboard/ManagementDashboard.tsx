import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Store,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  FileCheck2,
  Calendar,
  Filter,
  Download,
  Building2,
  Video,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
  BarChart3,
  Scale,
  RefreshCw,
  Eye,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useAuth } from "@/lib/AuthContext";

// ==========================================
// DEMO / PROTOTYPE DATASETS
// ==========================================

// 1. Monthly Network Revenue & EBITDA Run-Rate (12 Months)
const REVENUE_TREND_DATA = [
  { month: "Nov '25", actualRevenue: 6.4, targetRevenue: 6.2, priorYear: 5.4, ebitda: 0.96 },
  { month: "Dec '25", actualRevenue: 7.1, targetRevenue: 6.8, priorYear: 5.9, ebitda: 1.08 },
  { month: "Jan '26", actualRevenue: 6.8, targetRevenue: 6.9, priorYear: 5.7, ebitda: 1.02 },
  { month: "Feb '26", actualRevenue: 7.2, targetRevenue: 7.0, priorYear: 6.1, ebitda: 1.10 },
  { month: "Mar '26", actualRevenue: 7.6, targetRevenue: 7.3, priorYear: 6.4, ebitda: 1.15 },
  { month: "Apr '26", actualRevenue: 7.4, targetRevenue: 7.4, priorYear: 6.3, ebitda: 1.12 },
  { month: "May '26", actualRevenue: 7.9, targetRevenue: 7.6, priorYear: 6.7, ebitda: 1.20 },
  { month: "Jun '26", actualRevenue: 8.1, targetRevenue: 7.8, priorYear: 6.9, ebitda: 1.22 },
  { month: "Jul '26", actualRevenue: 8.4, targetRevenue: 8.0, priorYear: 7.1, ebitda: 1.28 },
  { month: "Aug '26", actualRevenue: 8.8, targetRevenue: 8.2, priorYear: 7.4, ebitda: 1.34 },
  { month: "Sep '26", actualRevenue: 8.3, targetRevenue: 8.4, priorYear: 7.2, ebitda: 1.25 },
  { month: "Oct '26", actualRevenue: 8.6, targetRevenue: 8.5, priorYear: 7.5, ebitda: 1.30 },
];

// 2. Sales Volume (Transactions in thousands) & Average Order Value (AOV in ₹)
const SALES_VOLUME_DATA = [
  { week: "W-38", cocoTxn: 84, focoTxn: 42, aov: 485 },
  { week: "W-39", cocoTxn: 86, focoTxn: 43, aov: 492 },
  { week: "W-40", cocoTxn: 89, focoTxn: 45, aov: 510 },
  { week: "W-41", cocoTxn: 85, focoTxn: 41, aov: 498 },
  { week: "W-42", cocoTxn: 91, focoTxn: 46, aov: 518 },
  { week: "W-43", cocoTxn: 94, focoTxn: 48, aov: 524 },
  { week: "W-44", cocoTxn: 92, focoTxn: 47, aov: 515 },
  { week: "W-45", cocoTxn: 96, focoTxn: 49, aov: 532 },
];

// 3. Category Compliance Scores over 6 Months (%)
const COMPLIANCE_TREND_DATA = [
  { month: "May", hygiene: 89, operational: 88, process: 86, staff: 85, overall: 87 },
  { month: "Jun", hygiene: 90, operational: 89, process: 87, staff: 86, overall: 88 },
  { month: "Jul", hygiene: 87, operational: 86, process: 85, staff: 84, overall: 85 },
  { month: "Aug", hygiene: 91, operational: 89, process: 88, staff: 87, overall: 89 },
  { month: "Sep", hygiene: 88, operational: 87, process: 86, staff: 86, overall: 86 },
  { month: "Oct", hygiene: 90, operational: 88, process: 88, staff: 87, overall: 87 },
];

// 4. Network Risk Distribution (148 Outlets)
const RISK_DISTRIBUTION_DATA = [
  { tier: "Low (0-20)", outlets: 84, percentage: 56.8, fill: "#10b981", desc: "Optimal operations" },
  { tier: "Moderate (21-40)", outlets: 42, percentage: 28.4, fill: "#3b82f6", desc: "Standard variation" },
  { tier: "Elevated (41-60)", outlets: 14, percentage: 9.5, fill: "#f59e0b", desc: "Active monitoring" },
  { tier: "High (61-80)", outlets: 6, percentage: 4.0, fill: "#ef4444", desc: "Audit trigger active" },
  { tier: "Critical (81-100)", outlets: 2, percentage: 1.3, fill: "#7f1d1d", desc: "Immediate intervention" },
];

// 5. High-Risk Outlets List
const HIGH_RISK_OUTLETS = [
  {
    code: "OUT-131",
    name: "Banjara Hills Road 12",
    city: "Hyderabad",
    model: "FOCO",
    manager: "K. Venkatesh",
    riskScore: 76,
    riskLevel: "High",
    compliance: "69%",
    triggers: "Food safety audit non-conformance · 4 critical observations",
    auditDate: "2026-09-28",
    status: "Action Required",
  },
  {
    code: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    model: "FOCO",
    manager: "Pooja Verma",
    riskScore: 68,
    riskLevel: "High",
    compliance: "74%",
    triggers: "CCTV hygiene flag · Inventory discrepancy (58 kg cheese base)",
    auditDate: "2026-09-29",
    status: "Review Required",
  },
  {
    code: "OUT-055",
    name: "FC Road Corner",
    city: "Pune",
    model: "COCO",
    manager: "Rahul Deshmukh",
    riskScore: 62,
    riskLevel: "High",
    compliance: "71%",
    triggers: "Cold-chain temperature deviation · Staff uniform violation",
    auditDate: "2026-09-27",
    status: "Audit Pending",
  },
  {
    code: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    model: "COCO",
    manager: "Sanjay Dixit",
    riskScore: 54,
    riskLevel: "Elevated",
    compliance: "81%",
    triggers: "Sales velocity drop -28% YoY · Peer baseline normal",
    auditDate: "2026-09-30",
    status: "Under Review",
  },
  {
    code: "OUT-073",
    name: "MI Road Heritage",
    city: "Jaipur",
    model: "FOCO",
    manager: "Mahesh Sharma",
    riskScore: 52,
    riskLevel: "Elevated",
    compliance: "79%",
    triggers: "Supply invoice quantity mismatch · 2 pending CAPAs",
    auditDate: "2026-09-25",
    status: "Verification Pending",
  },
  {
    code: "OUT-114",
    name: "Koramangala 5th Block",
    city: "Bengaluru",
    model: "FOCO",
    manager: "Anita Rao",
    riskScore: 47,
    riskLevel: "Elevated",
    compliance: "83%",
    triggers: "Customer complaint surge (4 in 24h) · Unverified CCTV frame",
    auditDate: "2026-10-01",
    status: "Active Monitoring",
  },
];

// 6. Underperforming Outlets (Sales Target Gap)
const UNDERPERFORMING_OUTLETS = [
  {
    code: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    model: "COCO",
    manager: "Sanjay Dixit",
    targetRevenue: "₹85.0 L",
    actualRevenue: "₹61.2 L",
    gapPercentage: -28.0,
    aov: "₹440",
    varianceTrend: "Declining (3 wks)",
  },
  {
    code: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    model: "FOCO",
    manager: "Pooja Verma",
    targetRevenue: "₹70.0 L",
    actualRevenue: "₹54.4 L",
    gapPercentage: -22.3,
    aov: "₹465",
    varianceTrend: "Volatile",
  },
  {
    code: "OUT-098",
    name: "Civil Lines North",
    city: "Kanpur",
    model: "FOCO",
    manager: "Gaurav Agarwal",
    targetRevenue: "₹45.0 L",
    actualRevenue: "₹36.8 L",
    gapPercentage: -18.2,
    aov: "₹410",
    varianceTrend: "Stabilizing",
  },
  {
    code: "OUT-067",
    name: "Assi Ghat Crossing",
    city: "Varanasi",
    model: "FOCO",
    manager: "Vivek Pandey",
    targetRevenue: "₹40.0 L",
    actualRevenue: "₹33.5 L",
    gapPercentage: -16.2,
    aov: "₹395",
    varianceTrend: "Declining (1 wk)",
  },
  {
    code: "OUT-104",
    name: "Cyber City Hub",
    city: "Gurgaon",
    model: "COCO",
    manager: "Deepak Chawla",
    targetRevenue: "₹90.0 L",
    actualRevenue: "₹78.2 L",
    gapPercentage: -13.1,
    aov: "₹560",
    varianceTrend: "Recovering",
  },
];

// 7. Recent Multi-Tier Alerts Feed
interface AlertItem {
  id: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "ELEVATED" | "MODERATE";
  outletCode: string;
  outletName: string;
  city: string;
  message: string;
  timestamp: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "ALT-2026-101",
    type: "CCTV_REVIEW_REQUIRED",
    severity: "CRITICAL",
    outletCode: "OUT-042",
    outletName: "Hazratganj Flagship",
    city: "Lucknow",
    message: "Camera 02: Staff handling food without mandatory hairnet & gloves between 14:15 - 14:32",
    timestamp: "12 mins ago",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-102",
    type: "INVENTORY_MISMATCH",
    severity: "HIGH",
    outletCode: "OUT-042",
    outletName: "Hazratganj Flagship",
    city: "Lucknow",
    message: "Reconciliation discrepancy: 58 units variance in premium mozzarella base batch #MZ-901",
    timestamp: "45 mins ago",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-103",
    type: "SALES_ANOMALY",
    severity: "HIGH",
    outletCode: "OUT-089",
    outletName: "Sector 18 Market",
    city: "Noida",
    message: "Daily sales revenue dropped 34% below 4-week moving baseline with standard store footfall",
    timestamp: "2 hours ago",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-104",
    type: "HIGH_COMPLAINT_VOLUME",
    severity: "ELEVATED",
    outletCode: "OUT-114",
    outletName: "Koramangala 5th Block",
    city: "Bengaluru",
    message: "4 order delay and billing complaints registered via QR feedback in under 120 minutes",
    timestamp: "3 hours ago",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-105",
    type: "COMPLIANCE_VIOLATION",
    severity: "ELEVATED",
    outletCode: "OUT-131",
    outletName: "Banjara Hills Road 12",
    city: "Hyderabad",
    message: "Mandatory municipal health inspection certificate due date elapsed without renewal upload",
    timestamp: "5 hours ago",
    status: "ACTIVE",
  },
  {
    id: "ALT-2026-106",
    type: "UNRESOLVED_ACTION",
    severity: "MODERATE",
    outletCode: "OUT-055",
    outletName: "FC Road Corner",
    city: "Pune",
    message: "CAPA-2026-081 deadline exceeded: Chiller condenser calibration report overdue by 48 hours",
    timestamp: "1 day ago",
    status: "ACTIVE",
  },
];

// 8. Performance Across All 11 Required Cities
const CITY_PERFORMANCE_DATA = [
  { city: "Lucknow", outlets: 18, revenue: "₹9.8 Cr", compliance: 81, riskScore: 34, dominantModel: "FOCO", growth: "+14.2%" },
  { city: "Delhi", outlets: 26, revenue: "₹17.4 Cr", compliance: 94, riskScore: 16, dominantModel: "COCO", growth: "+18.9%" },
  { city: "Noida", outlets: 14, revenue: "₹8.2 Cr", compliance: 85, riskScore: 29, dominantModel: "COCO", growth: "+11.5%" },
  { city: "Gurgaon", outlets: 16, revenue: "₹11.6 Cr", compliance: 91, riskScore: 19, dominantModel: "COCO", growth: "+21.0%" },
  { city: "Kanpur", outlets: 10, revenue: "₹4.9 Cr", compliance: 82, riskScore: 32, dominantModel: "FOCO", growth: "+8.4%" },
  { city: "Jaipur", outlets: 12, revenue: "₹6.2 Cr", compliance: 86, riskScore: 26, dominantModel: "FOCO", growth: "+15.1%" },
  { city: "Varanasi", outlets: 8, revenue: "₹3.8 Cr", compliance: 80, riskScore: 35, dominantModel: "FOCO", growth: "+9.2%" },
  { city: "Mumbai", outlets: 18, revenue: "₹13.2 Cr", compliance: 92, riskScore: 18, dominantModel: "COCO", growth: "+19.8%" },
  { city: "Pune", outlets: 10, revenue: "₹6.4 Cr", compliance: 84, riskScore: 28, dominantModel: "COCO", growth: "+13.7%" },
  { city: "Bengaluru", outlets: 12, revenue: "₹8.7 Cr", compliance: 88, riskScore: 23, dominantModel: "FOCO", growth: "+17.6%" },
  { city: "Hyderabad", outlets: 14, revenue: "₹9.4 Cr", compliance: 83, riskScore: 27, dominantModel: "FOCO", growth: "+16.3%" },
];

// 9. Outlet Comparison Database
const OUTLET_COMPARISON_CATALOG = [
  {
    code: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    model: "FOCO",
    status: "ACTIVE",
    manager: "Pooja Verma",
    revenue: "₹54.4 L",
    ebitdaMargin: "13.8%",
    compliance: "74%",
    riskScore: 68,
    riskLevel: "High",
    inventoryVariance: "-58 units",
    openCAPA: 3,
    avgCustomerRating: 4.1,
  },
  {
    code: "OUT-019",
    name: "Connaught Place Inner",
    city: "Delhi",
    model: "COCO",
    status: "ACTIVE",
    manager: "Ramesh Mehra",
    revenue: "₹94.2 L",
    ebitdaMargin: "17.4%",
    compliance: "96%",
    riskScore: 16,
    riskLevel: "Low",
    inventoryVariance: "-2 units",
    openCAPA: 0,
    avgCustomerRating: 4.8,
  },
  {
    code: "OUT-114",
    name: "Koramangala 5th Block",
    city: "Bengaluru",
    model: "FOCO",
    status: "ACTIVE",
    manager: "Anita Rao",
    revenue: "₹81.0 L",
    ebitdaMargin: "15.2%",
    compliance: "83%",
    riskScore: 47,
    riskLevel: "Elevated",
    inventoryVariance: "-14 units",
    openCAPA: 2,
    avgCustomerRating: 4.3,
  },
  {
    code: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    model: "COCO",
    status: "ACTIVE",
    manager: "Sanjay Dixit",
    revenue: "₹61.2 L",
    ebitdaMargin: "12.1%",
    compliance: "81%",
    riskScore: 54,
    riskLevel: "Elevated",
    inventoryVariance: "-22 units",
    openCAPA: 1,
    avgCustomerRating: 4.2,
  },
  {
    code: "OUT-104",
    name: "Cyber City Hub",
    city: "Gurgaon",
    model: "COCO",
    status: "ACTIVE",
    manager: "Deepak Chawla",
    revenue: "₹78.2 L",
    ebitdaMargin: "16.8%",
    compliance: "91%",
    riskScore: 19,
    riskLevel: "Low",
    inventoryVariance: "-4 units",
    openCAPA: 0,
    avgCustomerRating: 4.7,
  },
];

export function ManagementDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [timeRange, setTimeRange] = useState("FY 2026-Q3");
  const [selectedModel, setSelectedModel] = useState<"ALL" | "COCO" | "FOCO">("ALL");
  const [selectedCityFilter, setSelectedCityFilter] = useState("All Cities");
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Outlet Comparison state (Picking 2 outlets to compare side-by-side)
  const [compareOutletA, setCompareOutletA] = useState("OUT-042");
  const [compareOutletB, setCompareOutletB] = useState("OUT-019");

  const outletA = OUTLET_COMPARISON_CATALOG.find((o) => o.code === compareOutletA) || OUTLET_COMPARISON_CATALOG[0];
  const outletB = OUTLET_COMPARISON_CATALOG.find((o) => o.code === compareOutletB) || OUTLET_COMPARISON_CATALOG[1];

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === "ACTIVE" ? "ACKNOWLEDGED" : "RESOLVED" } : a))
    );
  };

  return (
    <div className="space-y-6">
      {/* Prototype Data Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>
            <strong>PROTOTYPE / DEMO ENVIRONMENT:</strong> Displaying consolidated multi-unit telemetry across 148 franchise units with deterministic explainable risk scores.
          </span>
        </div>
        <div className="mt-1 sm:mt-0 flex items-center gap-2">
          <Badge variant="outline" className="bg-white text-[10px] font-mono border-indigo-200 text-indigo-700">
            Aura Foods Enterprise v2.4
          </Badge>
          <span className="text-[11px] text-indigo-600 font-medium">Synced: Just now</span>
        </div>
      </div>

      {/* Executive Command Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Executive Management & Operations Control
            </h1>
            <span className="hidden md:inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {user?.role} Scope
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            Real-time financial run-rates, quality compliance inspections, CCTV audits, and supply chain health.
          </p>
        </div>

        {/* Global Filters & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Operating Model Selector */}
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs dark:border-slate-800 dark:bg-slate-900">
            {(["ALL", "COCO", "FOCO"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  selectedModel === m
                    ? "bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="FY 2026-Q3">FY 2026-Q3</option>
            <option value="Year to Date">Year to Date (YTD)</option>
            <option value="Trailing 12M">Trailing 12M</option>
          </select>

          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Dossier</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: CORE 5 KPI CARDS (WITH EXACT REQUESTED VALUES) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* KPI 1: Total Outlets */}
        <Card className="hover:border-slate-300 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Outlets
              </span>
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                148
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3" /> +12 YoY
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
              <span>112 COCO · 36 FOCO</span>
              <span className="text-emerald-700 font-mono font-medium">98.6% Active</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Gross Revenue */}
        <Card className="hover:border-slate-300 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gross Revenue
              </span>
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                ₹84.6 Cr
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="h-3 w-3" /> +18.4%
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
              <span>Target: ₹82.0 Cr</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">103.1% to Target</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: EBITDA */}
        <Card className="hover:border-slate-300 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                System EBITDA
              </span>
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                ₹12.8 Cr
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">
                15.1% Margin
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
              <span>Benchmark: 14.5%</span>
              <span className="text-blue-700 font-mono font-medium">+60 bps Expansion</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Compliance Index */}
        <Card className="hover:border-slate-300 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compliance Index
              </span>
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                87%
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">
                HQ Compliant
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
              <span>1,240 audits logged</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">Target 90%</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: Overall Risk Score */}
        <Card className="hover:border-slate-300 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Risk Score
              </span>
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                24<span className="text-sm font-normal text-slate-400">/100</span>
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200 font-semibold">
                Low Risk Tier
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
              <span>Deterministic Engine</span>
              <span className="text-emerald-600 font-medium">Stable (-3 QoQ)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: REVENUE TREND & SALES TREND CHARTS (RECHARTS) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Revenue Trend (12 Months Run-rate: Actual vs Target vs Prior Year) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                1. Network Revenue Trend (12-Month Run-rate)
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly gross revenue vs corporate budget & prior year baseline (₹ Crores)
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono text-slate-500">₹84.6 Cr YTD</span>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="targetRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}Cr`} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `₹${val} Cr`,
                      name === "actualRevenue"
                        ? "Actual Revenue"
                        : name === "targetRevenue"
                        ? "Target Budget"
                        : "Prior Year Actual",
                    ]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", color: "#fff", fontSize: "11px" }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                  />
                  <Area
                    type="monotone"
                    name="Actual Revenue"
                    dataKey="actualRevenue"
                    stroke="#0f172a"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#actualRevGrad)"
                  />
                  <Line
                    type="monotone"
                    name="Target Budget"
                    dataKey="targetRevenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    name="Prior Year"
                    dataKey="priorYear"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Sales & Transaction Volume Trend (COCO vs FOCO Transactions & AOV) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. Sales Velocity & Transaction Volumes
              </CardTitle>
              <CardDescription className="text-xs">
                Weekly transaction volume (thousands) by operating model & Average Order Value (₹ AOV)
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">AOV: ₹532</span>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SALES_VOLUME_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === "aov" ? `₹${val}` : `${val},000 tickets`,
                      name === "cocoTxn" ? "COCO Transactions" : name === "focoTxn" ? "FOCO Transactions" : "Average Order Value",
                    ]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", color: "#fff", fontSize: "11px" }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="rect"
                    wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                  />
                  <Bar yAxisId="left" dataKey="cocoTxn" name="COCO Tickets" fill="#0f172a" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="left" dataKey="focoTxn" name="FOCO Tickets" fill="#64748b" radius={[3, 3, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="aov" name="AOV (₹)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: COMPLIANCE TREND & RISK DISTRIBUTION */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 3: Compliance Trend by Inspection Category (2 Cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                3. Quality Compliance Index by Operational Category (%)
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly pass rate across Hygiene, Operational SOPs, Process Adherence, and Staff Compliance
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] bg-slate-50 font-mono">
              Network Avg: 87%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COMPLIANCE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[75, 100]} stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, "Pass Rate"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", color: "#fff", fontSize: "11px" }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                  />
                  <Line type="monotone" name="Hygiene & Sanitation" dataKey="hygiene" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" name="Operational Standards" dataKey="operational" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" name="Process Adherence" dataKey="process" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} />
                  <Line type="monotone" name="Staff Compliance" dataKey="staff" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: Risk Distribution (1 Col) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
              4. Network Risk Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Segmentation across 148 outlets by computed score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Visual Risk Distribution Bar */}
            <div className="space-y-2 pt-1">
              {RISK_DISTRIBUTION_DATA.map((tier) => (
                <div key={tier.tier} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.fill }} />
                      {tier.tier}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {tier.outlets} units ({tier.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${tier.percentage}%`, backgroundColor: tier.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200 mb-0.5">
                <Info className="h-3.5 w-3.5 text-slate-500" />
                <span>Deterministic Scoring Engine:</span>
              </div>
              <p>Risk is computed across sales velocity deviations, stock reconciliation variances, and verified CCTV compliance observations.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* SECTION 4: HIGH-RISK OUTLETS & UNDERPERFORMING OUTLETS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Table 5: High-Risk Outlets Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>5. High-Risk Outlets (Immediate Attention)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Outlets scoring above threshold risk triggering supervisory audits
              </CardDescription>
            </div>
            <Link to="/risk" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-2.5">Outlet Code</th>
                    <th className="px-3 py-2.5">Outlet / City</th>
                    <th className="px-3 py-2.5 text-right">Risk Score</th>
                    <th className="px-3 py-2.5">Key Trigger</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {HIGH_RISK_OUTLETS.map((outlet) => (
                    <tr key={outlet.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        <Link to={`/outlets/${outlet.code}`} className="hover:underline">
                          {outlet.code}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{outlet.name}</div>
                        <div className="text-[10px] text-slate-400">{outlet.city} · {outlet.model}</div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            outlet.riskScore >= 70
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {outlet.riskScore}/100
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-[11px] max-w-[180px] truncate" title={outlet.triggers}>
                        {outlet.triggers}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => navigate(`/outlets/${outlet.code}`)}
                        >
                          Dossier
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Table 6: Underperforming Outlets Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span>6. Underperforming Outlets (Sales Target Lag)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Operating units with negative variance against quarterly revenue plan
              </CardDescription>
            </div>
            <Link to="/sales" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
              Sales ledger <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-2.5">Outlet Code</th>
                    <th className="px-3 py-2.5">Name / Model</th>
                    <th className="px-3 py-2.5 text-right">Target</th>
                    <th className="px-3 py-2.5 text-right">Actual</th>
                    <th className="px-3 py-2.5 text-right">Variance</th>
                    <th className="px-4 py-2.5">Velocity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {UNDERPERFORMING_OUTLETS.map((outlet) => (
                    <tr key={outlet.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        <Link to={`/outlets/${outlet.code}`} className="hover:underline">
                          {outlet.code}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{outlet.name}</div>
                        <div className="text-[10px] text-slate-400">{outlet.city} · {outlet.model}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-500">{outlet.targetRevenue}</td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {outlet.actualRevenue}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-red-600">
                        {outlet.gapPercentage}%
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">{outlet.varianceTrend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* SECTION 5: RECENT ALERTS FEED (INTERACTIVE ACKNOWLEDGE) */}
      {/* ======================================================== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>7. Live System Alerts & Operational Flags</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Automated anomaly detection across sales, inventory balances, CCTV vision, and compliance deadlines
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Active: <strong>{alerts.filter((a) => a.status === "ACTIVE").length}</strong>
            </span>
            <Link to="/alerts" className="text-xs text-indigo-600 hover:underline">
              View alert history
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  alert.status === "RESOLVED"
                    ? "bg-slate-50/40 opacity-60"
                    : alert.severity === "CRITICAL"
                    ? "bg-red-50/30"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="pt-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : alert.severity === "HIGH"
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : alert.severity === "ELEVATED"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                        {alert.type}
                      </span>
                      <span className="text-slate-400">·</span>
                      <Link
                        to={`/outlets/${alert.outletCode}`}
                        className="font-bold text-slate-900 hover:underline font-mono"
                      >
                        {alert.outletCode} ({alert.outletName}, {alert.city})
                      </Link>
                      <span className="text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] px-2.5"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    {alert.status === "ACTIVE"
                      ? "Acknowledge"
                      : alert.status === "ACKNOWLEDGED"
                      ? "Resolve"
                      : "Resolved"}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-[11px] px-2.5"
                    onClick={() => navigate(`/outlets/${alert.outletCode}`)}
                  >
                    Investigate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* SECTION 6: CITY-WISE PERFORMANCE MATRIX (ALL 11 CITIES) */}
      {/* ======================================================== */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>8. City-Wise Territory Performance (11 Metro Markets)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Consolidated footprint, aggregate revenue run-rate, compliance score, and average risk by city
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-slate-500">148 Outlets Total</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900">
                <tr>
                  <th className="px-5 py-3">City / Market</th>
                  <th className="px-4 py-3 text-right">Outlets</th>
                  <th className="px-4 py-3 text-right">Gross Revenue</th>
                  <th className="px-4 py-3 text-right">Avg Compliance</th>
                  <th className="px-4 py-3 text-right">Avg Risk Score</th>
                  <th className="px-4 py-3">Dominant Model</th>
                  <th className="px-4 py-3 text-right">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {CITY_PERFORMANCE_DATA.map((city) => (
                  <tr key={city.city} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-600" />
                      <span>{city.city}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {city.outlets}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {city.revenue}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          city.compliance >= 90
                            ? "text-emerald-700"
                            : city.compliance >= 84
                            ? "text-blue-700"
                            : "text-amber-700"
                        }`}
                      >
                        {city.compliance}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          city.riskScore <= 20
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : city.riskScore <= 30
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {city.riskScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {city.dominantModel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-600">
                      {city.growth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* SECTION 7: INTERACTIVE OUTLET COMPARISON TOOL */}
      {/* ======================================================== */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scale className="h-4 w-4 text-indigo-600" />
                <span>9. Side-by-Side Outlet Comparative Matrix</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Benchmark operating metrics, margins, risk profiles, and stock variances between network units
              </CardDescription>
            </div>

            {/* Selectors for comparison */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Compare:</span>
              <select
                value={compareOutletA}
                onChange={(e) => setCompareOutletA(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-mono font-medium text-slate-800 cursor-pointer"
              >
                {OUTLET_COMPARISON_CATALOG.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} - {o.city}
                  </option>
                ))}
              </select>

              <span className="text-xs text-slate-400 font-bold">vs</span>

              <select
                value={compareOutletB}
                onChange={(e) => setCompareOutletB(e.target.value)}
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-mono font-medium text-slate-800 cursor-pointer"
              >
                {OUTLET_COMPARISON_CATALOG.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.code} - {o.city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column A */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">{outletA.code}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{outletA.model}</Badge>
                  </div>
                  <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300">{outletA.name}, {outletA.city}</h3>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => navigate(`/outlets/${outletA.code}`)}>
                  View Dossier
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Monthly Revenue</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{outletA.revenue}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">EBITDA Margin</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{outletA.ebitdaMargin}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Compliance Index</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{outletA.compliance}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Risk Score</span>
                  <span className={`font-mono font-bold text-sm ${outletA.riskScore > 50 ? "text-red-600" : "text-emerald-600"}`}>
                    {outletA.riskScore}/100 ({outletA.riskLevel})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Inventory Discrepancy: <strong className="font-mono text-red-600">{outletA.inventoryVariance}</strong></span>
                <span>Active CAPA: <strong className="font-mono">{outletA.openCAPA}</strong></span>
                <span>Rating: <strong className="font-mono">★ {outletA.avgCustomerRating}</strong></span>
              </div>
            </div>

            {/* Column B */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">{outletB.code}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{outletB.model}</Badge>
                  </div>
                  <h3 className="font-semibold text-xs text-slate-700 dark:text-slate-300">{outletB.name}, {outletB.city}</h3>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => navigate(`/outlets/${outletB.code}`)}>
                  View Dossier
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Monthly Revenue</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{outletB.revenue}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">EBITDA Margin</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{outletB.ebitdaMargin}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Compliance Index</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{outletB.compliance}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Risk Score</span>
                  <span className={`font-mono font-bold text-sm ${outletB.riskScore > 50 ? "text-red-600" : "text-emerald-600"}`}>
                    {outletB.riskScore}/100 ({outletB.riskLevel})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Inventory Discrepancy: <strong className="font-mono text-red-600">{outletB.inventoryVariance}</strong></span>
                <span>Active CAPA: <strong className="font-mono">{outletB.openCAPA}</strong></span>
                <span>Rating: <strong className="font-mono">★ {outletB.avgCustomerRating}</strong></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ManagementDashboard;
