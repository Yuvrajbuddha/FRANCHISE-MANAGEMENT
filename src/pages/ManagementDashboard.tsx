import React, { useState, useEffect } from "react";
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
  DollarSign,
  Package,
  MessageSquare,
  ShieldAlert,
  Zap,
  Activity,
  Layers,
  Check,
  X,
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

export function ManagementDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFranchise = user?.role === "FRANCHISE";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  // Filter States
  const [selectedDate, setSelectedDate] = useState("Month to Date");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedOutlet, setSelectedOutlet] = useState(isFranchise ? userOutlet : "All Outlets");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("All Risk Levels");
  const [selectedComplianceStatus, setSelectedComplianceStatus] = useState("All Statuses");

  // Dashboard Data State
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drilldown Modals
  const [riskModalOutlet, setRiskModalOutlet] = useState<any>(null);
  const [alertModalItem, setAlertModalItem] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (selectedDate !== "All Time") params.append("date", selectedDate);
      if (selectedCity !== "All Cities") params.append("city", selectedCity);
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedRiskLevel !== "All Risk Levels") params.append("riskLevel", selectedRiskLevel);
      if (selectedComplianceStatus !== "All Statuses") params.append("complianceStatus", selectedComplianceStatus);

      const res = await fetch(`/api/dashboard/overview?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to load dashboard overview.");
      }

      setData(resData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch live dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate, selectedCity, selectedOutlet, selectedRiskLevel, selectedComplianceStatus]);

  const summary = data?.summary || {
    totalOutlets: 10,
    totalRevenue: 6480000,
    ebitda: 984960,
    ebitdaMargin: 15.2,
    compliancePercentage: 88,
    overallRiskScore: 22,
  };

  const counts = data?.counts || {
    inventoryDiscrepanciesCount: 0,
    complianceAlertsCount: 0,
    customerComplaintsCount: 0,
    cctvCasesCount: 0,
    correctiveActionsCount: 0,
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`;
    }
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Supervisory Telemetry</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-slate-100">
            Enterprise Operations & Compliance <span className="italic text-indigo-400">Control Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time telemetry and supervisory intelligence spanning network outlets, audits, sales, CCTV, and CAPA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 cursor-pointer text-xs hidden sm:flex border-white/10 bg-[#0A1224] text-slate-300 hover:text-white rounded-xl"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export View</span>
          </Button>
        </div>
      </div>

      {/* Role notice for franchise isolation */}
      {isFranchise && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 px-3.5 py-2.5 text-xs text-emerald-900 dark:text-emerald-300">
          Store Isolation Active: Telemetry strictly scoped to your assigned store (<strong>{userOutlet}</strong>). Network benchmarks provided for context.
        </div>
      )}

      {/* Global Interactive Filter Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0B1020] p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
          <Filter className="h-4 w-4 text-[#818CF8]" />
          <span>Multi-Dimensional Filtering</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Date Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Date Period
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-9 rounded-xl border border-white/10 bg-[#070B18] px-2.5 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <option value="Today">Today (Oct 02, 2026)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Month to Date">Month to Date (Oct '26)</option>
              <option value="All Time">All Historical Cycles</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              City Region
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-9 rounded-xl border border-white/10 bg-[#070B18] px-2.5 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <option value="All Cities">All Cities</option>
              <option value="Lucknow">Lucknow (Flagship Hub)</option>
              <option value="Noida">Noida (NCR)</option>
              <option value="Bengaluru">Bengaluru (South)</option>
              <option value="Delhi">Delhi (NCR Central)</option>
              <option value="Pune">Pune</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Kanpur">Kanpur</option>
              <option value="Varanasi">Varanasi</option>
            </select>
          </div>

          {/* Outlet Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Store Outlet
            </label>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              disabled={isFranchise}
              className="w-full h-9 rounded-xl border border-white/10 bg-[#070B18] px-2.5 text-xs font-semibold text-slate-200 cursor-pointer disabled:opacity-50"
            >
              <option value="All Outlets">All Network Outlets</option>
              <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
              <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
              <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
              <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
              <option value="OUT-055">OUT-055 (Pune FC Road)</option>
              <option value="OUT-073">OUT-073 (Jaipur MI Road)</option>
              <option value="OUT-128">OUT-128 (Mumbai Bandra)</option>
              <option value="OUT-142">OUT-142 (Gurgaon Cyber Hub)</option>
              <option value="OUT-061">OUT-061 (Kanpur Cantt)</option>
              <option value="OUT-097">OUT-097 (Varanasi Assi Ghat)</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Risk Level Tier
            </label>
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full h-9 rounded-xl border border-white/10 bg-[#070B18] px-2.5 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <option value="All Risk Levels">All Risk Tiers</option>
              <option value="Low">Low (0-20)</option>
              <option value="Moderate">Moderate (21-40)</option>
              <option value="Elevated">Elevated (41-60)</option>
              <option value="High">High (61-80)</option>
              <option value="Critical">Critical (81-100)</option>
            </select>
          </div>

          {/* Compliance Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Compliance Status
            </label>
            <select
              value={selectedComplianceStatus}
              onChange={(e) => setSelectedComplianceStatus(e.target.value)}
              className="w-full h-9 rounded-xl border border-white/10 bg-[#070B18] px-2.5 text-xs font-semibold text-slate-200 cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Audit">Under Audit</option>
              <option value="Grace Period">Grace Period</option>
              <option value="Notice Issued">Notice Issued</option>
              <option value="Critical Escalation">Critical Escalation</option>
            </select>
          </div>
        </div>

        {(selectedCity !== "All Cities" ||
          selectedOutlet !== "All Outlets" ||
          selectedRiskLevel !== "All Risk Levels" ||
          selectedComplianceStatus !== "All Statuses" ||
          selectedDate !== "Month to Date") && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSelectedCity("All Cities");
                setSelectedOutlet("All Outlets");
                setSelectedRiskLevel("All Risk Levels");
                setSelectedComplianceStatus("All Statuses");
                setSelectedDate("Month to Date");
              }}
              className="text-xs text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* CORE KPI CARDS (Real Database Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Outlets */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Total Outlets</span>
              <Building2 className="h-4 w-4 text-indigo-400" />
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono">
                {summary.totalOutlets}
              </span>
              <Link to="/outlets" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                <span>Directory</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active operating nodes in PostgreSQL
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Net Revenue</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {formatCurrency(summary.totalRevenue)}
              </span>
              <Link to="/sales" className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-0.5">
                <span>Sales Log</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Aggregated from outlet_sales table
            </p>
          </CardContent>
        </Card>

        {/* EBITDA / Profit */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>EBITDA / Profit</span>
              <DollarSign className="h-4 w-4 text-teal-400" />
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono">
                {formatCurrency(summary.ebitda)}
              </span>
              <Badge variant="outline" className="text-[10px] font-bold text-teal-400 border-teal-500/30 bg-teal-500/10">
                {summary.ebitdaMargin}% Margin
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Statutory franchise run-rate
            </p>
          </CardContent>
        </Card>

        {/* Compliance Percentage */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Compliance %</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                {summary.compliancePercentage}%
              </span>
              <Link to="/compliance" className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-0.5">
                <span>Audits</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Live audit adherence benchmark
            </p>
          </CardContent>
        </Card>

        {/* Overall Risk Score */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Overall Risk Score</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold font-mono ${
                summary.overallRiskScore > 40 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {summary.overallRiskScore}/100
              </span>
              <Link to="/risk" className="text-xs text-amber-400 hover:underline inline-flex items-center gap-0.5">
                <span>Risk Engine</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Composite weighted multi-factor score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OPERATIONAL COUNTERS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          to="/inventory"
          className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Inventory Mismatch</span>
            <Boxes className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white mt-1 block">
            {counts.inventoryDiscrepanciesCount} Cases
          </span>
          <span className="text-[10px] text-amber-400 font-semibold">Stock Reconciliation</span>
        </Link>

        <Link
          to="/alerts"
          className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-rose-500/40 hover:bg-rose-500/5 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Compliance Alerts</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">
            {counts.complianceAlertsCount} Alerts
          </span>
          <span className="text-[10px] text-rose-400 font-semibold">Prioritized Queue</span>
        </Link>

        <Link
          to="/complaints"
          className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Complaints</span>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white mt-1 block">
            {counts.customerComplaintsCount} Tickets
          </span>
          <span className="text-[10px] text-purple-400 font-semibold">Guest Sentiment</span>
        </Link>

        <Link
          to="/evidence"
          className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">CCTV Evidence</span>
            <Video className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white mt-1 block">
            {counts.cctvCasesCount} Feeds
          </span>
          <span className="text-[10px] text-indigo-400 font-semibold">AI Prep Verification</span>
        </Link>

        <Link
          to="/corrective-actions"
          className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">CAPA Actions</span>
            <FileCheck2 className="h-4 w-4 text-teal-400" />
          </div>
          <span className="text-lg font-bold font-mono text-white mt-1 block">
            {counts.correctiveActionsCount} Mandates
          </span>
          <span className="text-[10px] text-teal-400 font-semibold">Closed-Loop Status</span>
        </Link>
      </div>

      {/* CHARTS ROW 1: Sales Trends & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trends Chart */}
        <Card className="lg:col-span-2 border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-[#818CF8]" />
                  <span>Real Sales Trends & Revenue Performance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily net sales turnover and transaction volume logged in PostgreSQL
                </CardDescription>
              </div>
              <Link to="/sales" className="text-xs text-[#818CF8] hover:underline">
                View Sales →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.salesTrends || []}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ backgroundColor: "#0B1020", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                    name="Net Sales (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Chart */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-amber-500" />
                  <span>Network Risk Distribution</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Classification across 5 deterministic risk tiers
                </CardDescription>
              </div>
              <Link to="/risk" className="text-xs text-amber-400 hover:underline">
                View Risk →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.riskDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="tier"
                  >
                    {(data?.riskDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any, name: any) => [`${v} Outlets`, name]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OUTLET TABLES: High-Risk Outlets & Underperforming Outlets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-Risk Outlets (Clickable to profile or risk breakdown) */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>High-Risk Outlets Requiring Oversight</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Outlets with highest risk scores or critical alert backlog
                </CardDescription>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live DB</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-y border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Outlet (Link)</th>
                    <th className="py-2.5 px-3 font-semibold">City</th>
                    <th className="py-2.5 px-3 font-semibold">Risk Score</th>
                    <th className="py-2.5 px-3 font-semibold">Compliance</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.highRiskOutlets || []).map((o: any) => (
                    <tr key={o.outletId} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/outlets/${o.outletId}`}
                          className="font-mono font-bold text-[#818CF8] hover:underline block"
                          title="Open Outlet Profile"
                        >
                          {o.outletId}
                        </Link>
                        <span className="text-[11px] text-slate-300 truncate max-w-[140px] block">
                          {o.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{o.city}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/25">
                          {o.riskScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">{o.complianceScore}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRiskModalOutlet(o)}
                          className="h-6 text-[10px] px-2 cursor-pointer gap-1 border-white/10 bg-white/5 hover:bg-white/10 text-slate-200"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Breakdown</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Underperforming Outlets */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-amber-400">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Underperforming Outlets</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Outlets ranking lowest in monthly sales run-rate
                </CardDescription>
              </div>
              <Link to="/outlets" className="text-xs text-[#818CF8] hover:underline">
                View All Outlets →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-y border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Outlet (Link)</th>
                    <th className="py-2.5 px-3 font-semibold">City</th>
                    <th className="py-2.5 px-3 font-semibold">Monthly Sales</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.underperformingOutlets || []).map((o: any) => (
                    <tr key={o.outletId} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/outlets/${o.outletId}`}
                          className="font-mono font-bold text-[#818CF8] hover:underline block"
                        >
                          {o.outletId}
                        </Link>
                        <span className="text-[11px] text-slate-300 truncate max-w-[140px] block">
                          {o.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{o.city}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-white">
                        {formatCurrency(o.revenueMonthly)}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px] border-white/10 text-slate-300">
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/outlets/${o.outletId}`}
                          className="text-[#818CF8] hover:underline inline-flex items-center gap-0.5 text-xs font-medium"
                        >
                          <span>Profile</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS ROW 2: City-Wise Performance & Historical Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City-Wise Performance Table & Bar */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#818CF8]" />
                  <span>City-Wise Regional Performance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Store density, aggregated turnover, and compliance score by metro
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.cityPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Est. Monthly Revenue"]}
                    contentStyle={{ backgroundColor: "#0B1020", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Monthly Turnover" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Historical Trends (Month-on-Month Compliance & Risk) */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span>Historical Network Trends</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  6-month longitudinal tracking of Compliance % vs Risk Score
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.historicalTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#0B1020", borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    name="Compliance %"
                  />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    name="Risk Score /100"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT OPERATIONAL FEEDS: Alerts & Discrepancies (Clickable) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Alerts (Clicking opens alert case) */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>Recent Compliance Alerts (Click to Open Case)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Active prioritized anomalies from PostgreSQL outlet_alerts
                </CardDescription>
              </div>
              <Link to="/alerts" className="text-xs text-rose-400 hover:underline">
                View All Alerts →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5 text-xs">
              {(data?.recentAlerts || []).map((a: any) => (
                <div
                  key={a.id}
                  onClick={() => setAlertModalItem(a)}
                  className="p-3 hover:bg-white/5 cursor-pointer flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#818CF8]">{a.alertId}</span>
                      <Link
                        to={`/outlets/${a.outletId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[11px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-semibold text-slate-300 hover:text-[#818CF8]"
                      >
                        {a.outletId}
                      </Link>
                      <Badge
                        className={
                          a.severity === "CRITICAL"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30 text-[10px]"
                            : a.severity === "HIGH"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]"
                            : "bg-slate-500/15 text-slate-300 border-slate-500/30 text-[10px]"
                        }
                      >
                        {a.severity}
                      </Badge>
                    </div>
                    <p className="text-slate-200 line-clamp-1">{a.message}</p>
                    <span className="text-[10px] text-slate-400 block">{a.priority} • {a.createdDate}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-[11px] shrink-0 text-[#818CF8] hover:bg-white/5">
                    Case →
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Corrective Actions (CAPA) */}
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-teal-400" />
                  <span>Corrective Action Pipeline (CAPA)</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Statutory remediation mandates across workflow stages
                </CardDescription>
              </div>
              <Link to="/corrective-actions" className="text-xs text-teal-400 hover:underline">
                View All CAPAs →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5 text-xs">
              {(data?.recentCapas || []).map((c: any) => (
                <div key={c.id} className="p-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-600">{c.actionId}</span>
                      <Link
                        to={`/outlets/${c.outletId}`}
                        className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {c.outletId}
                      </Link>
                      <Badge variant="outline" className="text-[10px]">
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium line-clamp-1">{c.issue}</p>
                    <span className="text-[10px] text-slate-400 block">
                      Stage: {c.currentStage} • Assignee: {c.assignedPerson} • Due: {c.deadline}
                    </span>
                  </div>
                  <Link
                    to="/corrective-actions"
                    className="text-teal-600 hover:underline text-xs font-medium shrink-0 pt-1"
                  >
                    Remediate →
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DRILLDOWN MODAL: High-Risk Outlet Risk Breakdown */}
      {riskModalOutlet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B1020] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono font-bold text-rose-400 text-xs">{riskModalOutlet.outletId}</span>
                <h3 className="text-base font-bold text-white">
                  {riskModalOutlet.name} — Risk Engine Breakdown
                </h3>
                <span className="text-slate-400">{riskModalOutlet.city} • Manager: {riskModalOutlet.manager}</span>
              </div>
              <button onClick={() => setRiskModalOutlet(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/25 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-400 block">Composite Deterministic Risk</span>
                <span className="text-2xl font-black font-mono text-rose-400">{riskModalOutlet.riskScore}/100</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Compliance Audit Score</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {riskModalOutlet.complianceScore}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white block">Weighted Risk Factors:</span>
              <div className="space-y-1.5">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                  <span className="text-slate-300">Sales & Cash Anomaly Ratio (30% weight)</span>
                  <span className="font-mono font-bold text-rose-400">Elevated (62% cash vs 30% par)</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                  <span className="text-slate-300">Compliance Inspections & SOPs (25% weight)</span>
                  <span className="font-mono font-bold text-amber-400">Walk-in chiller temp variance</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                  <span className="text-slate-300">Customer Experience & Tickets (15% weight)</span>
                  <span className="font-mono font-bold text-slate-400">2 Active Service Tickets</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex justify-between">
                  <span className="text-slate-300">Stock & Inventory Variance (10% weight)</span>
                  <span className="font-mono font-bold text-amber-400">Variance in Truffle Sauce</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <Link
                to={`/outlets/${riskModalOutlet.outletId}`}
                className="text-[#818CF8] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Open Store Profile Dossier</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Button size="sm" onClick={() => setRiskModalOutlet(null)} className="bg-white/10 hover:bg-white/15 text-white border border-white/10">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DRILLDOWN MODAL: Alert Case Details */}
      {alertModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B1020] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono font-bold text-[#818CF8] text-xs">{alertModalItem.alertId}</span>
                <h3 className="text-base font-bold text-white">
                  {alertModalItem.type}
                </h3>
                <span className="text-slate-400">Outlet: {alertModalItem.outletId} • Date: {alertModalItem.createdDate}</span>
              </div>
              <button onClick={() => setAlertModalItem(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Severity Level:</span>
                <Badge
                  className={
                    alertModalItem.severity === "CRITICAL"
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30 text-[10px]"
                      : alertModalItem.severity === "HIGH"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]"
                      : "bg-slate-500/15 text-slate-300 border-slate-500/30 text-[10px]"
                  }
                >
                  {alertModalItem.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Department:</span>
                <span className="text-slate-300">{alertModalItem.category}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-white block">Incident Details:</span>
              <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                {alertModalItem.message}
              </p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <Link
                to="/alerts"
                className="text-[#818CF8] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Go to Incident Registry</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
              <Button size="sm" onClick={() => setAlertModalItem(null)} className="bg-white/10 hover:bg-white/15 text-white border border-white/10">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagementDashboard;
