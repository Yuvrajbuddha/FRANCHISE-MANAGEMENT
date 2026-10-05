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
  Lock,
  Camera,
  FileVideo,
  Users,
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
import { useAuth } from "@/context/AuthContext";
import { STORES_MAP, ALL_NETWORK_STORES } from "@/utils/stores-data";
import {
  loadCctvSubmissions,
  loadPhotosForStore,
  CctvSubmission,
  GeneratedPhoto,
} from "@/services/cctvEvidenceStore";

export function ManagementDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role detection
  const role = user?.role || "OFFICER";
  const isOwner = role === "OWNER";
  const isFranchise = role === "FRANCHISE";
  const isOfficer = role === "OFFICER" || role === "ADMIN";

  const userOutlet = (user?.assignedOutletId || "OUT-042").toUpperCase();
  const matchedStore = STORES_MAP[userOutlet];
  const storeName =
    matchedStore?.name || user?.assignedOutletName || `Store ${userOutlet}`;

  // CCTV Evidence Store integration
  const [cctvSubmissions, setCctvSubmissions] = useState<CctvSubmission[]>(
    loadCctvSubmissions
  );
  const storeSubmission =
    cctvSubmissions.find((s) => s.storeId.toUpperCase() === userOutlet) ||
    cctvSubmissions[0];
  const storePhotos = loadPhotosForStore(userOutlet);

  // Filter States
  const [selectedDate, setSelectedDate] = useState("Month to Date");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedOutlet, setSelectedOutlet] = useState(
    isFranchise ? userOutlet : "All Outlets"
  );
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("All Risk Levels");
  const [selectedComplianceStatus, setSelectedComplianceStatus] =
    useState("All Statuses");

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

      // Force outletId isolation for Store role
      if (isFranchise) {
        params.append("outletId", userOutlet);
      } else if (selectedOutlet !== "All Outlets") {
        params.append("outletId", selectedOutlet);
      }

      if (selectedRiskLevel !== "All Risk Levels")
        params.append("riskLevel", selectedRiskLevel);
      if (selectedComplianceStatus !== "All Statuses")
        params.append("complianceStatus", selectedComplianceStatus);

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
    setCctvSubmissions(loadCctvSubmissions());
  }, [
    selectedDate,
    selectedCity,
    selectedOutlet,
    selectedRiskLevel,
    selectedComplianceStatus,
    userOutlet,
    isFranchise,
  ]);

  const summary = data?.summary || {
    totalOutlets: 10,
    totalRevenue: 6480000,
    ebitda: 984960,
    ebitdaMargin: 15.2,
    compliancePercentage: 88,
    overallRiskScore: 22,
  };

  const counts = data?.counts || {
    inventoryDiscrepanciesCount: 3,
    complianceAlertsCount: 4,
    customerComplaintsCount: 6,
    cctvCasesCount: cctvSubmissions.length,
    correctiveActionsCount: 4,
  };

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} L`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const verifiedSubmissions = cctvSubmissions.filter((s) => s.status === "Verified");
  const pendingSubmissions = cctvSubmissions.filter((s) => s.status !== "Verified");

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16">
      {/* ======================================================== */}
      {/* 1. ROLE-ADAPTIVE HEADER CARD                             */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/60 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-700 flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            {isOwner && <span>CORE OVERVIEW · FRANCHISEE OWNER PORTAL</span>}
            {isFranchise && <span>CORE OVERVIEW · STORE OPERATIONAL UNIT</span>}
            {isOfficer && <span>CORE OVERVIEW · QUALITY & COMPLIANCE CONSOLE</span>}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {isOwner && "Franchise Business & Store Performance Overview"}
            {isFranchise && `${storeName} — Store Daily Overview & Inspection Status`}
            {isOfficer && "Network Audit, Store Evidence & Compliance Overview"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {isOwner &&
              "Enterprise overview spanning your assigned franchise stores, revenue performance, stock health, and statutory compliance ratings."}
            {isFranchise &&
              "Operational metrics, daily CCTV submission status, extracted evidence photos, and statutory compliance ratings for your outlet."}
            {isOfficer &&
              "Supervisory compliance queue, store CCTV submissions requiring verification, extracted photo evidence, statutory ratings, and audit workflows."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-3 py-1 font-mono font-semibold">
              Franchisee Owner
            </Badge>
          )}
          {isFranchise && (
            <Badge className="bg-teal-100 text-teal-800 border-teal-300 text-xs px-3 py-1 font-mono font-semibold">
              Store Operator · {userOutlet}
            </Badge>
          )}
          {isOfficer && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs px-3 py-1 font-mono font-semibold">
              Quality & Compliance Officer
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 cursor-pointer text-xs hidden sm:flex border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export View</span>
          </Button>
        </div>
      </div>

      {/* Role notice for store isolation */}
      {isFranchise && (
        <div className="rounded-xl border border-teal-500/30 bg-teal-50/80 p-3.5 text-xs text-teal-950 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-700 shrink-0" />
            <span>
              <strong>Store Isolation Active:</strong> Telemetry strictly scoped to your assigned store (
              <strong>{userOutlet} — {storeName}</strong>). Network financials and other stores' private data are restricted.
            </span>
          </div>
          <Link
            to="/login/store"
            className="text-[11px] font-semibold text-teal-700 hover:underline shrink-0"
          >
            Switch Store →
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FILTER BAR (ROLE-AWARE)                               */}
      {/* ======================================================== */}
      {!isFranchise && (
        <div className="rounded-2xl border border-indigo-500/25 bg-[#0B1020] p-4 shadow-sm space-y-3">
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
                <option value="Today">Today (Oct 04, 2026)</option>
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
                className="w-full h-9 rounded-xl border border-white/10 bg-[#070B18] px-2.5 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <option value="All Outlets">All Network Outlets</option>
                {ALL_NETWORK_STORES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Level Filter (Officer & Admin only) */}
            {isOfficer && (
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
            )}

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
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CORE KPI CARDS (STRICTLY ROLE-BASED)                  */}
      {/* ======================================================== */}

      {/* --- FRANCHISEE OWNER KPIS --- */}
      {isOwner && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <p className="text-[11px] text-slate-500 mt-1">Assigned franchise stores</p>
            </CardContent>
          </Card>

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
                  <span>Sales</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Net sales turnover</p>
            </CardContent>
          </Card>

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
              <p className="text-[11px] text-slate-500 mt-1">Franchise run-rate</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Compliance Benchmark</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {summary.compliancePercentage}%
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Verified
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Average store score</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Physical Stock</span>
                <Boxes className="h-4 w-4 text-amber-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">
                  36 SKUs
                </span>
                <Link to="/inventory" className="text-xs text-amber-400 hover:underline inline-flex items-center gap-0.5">
                  <span>Inventory</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Healthy stock holding</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- STORE ROLE KPIS (SCOPED STRICTLY TO THEIR OWN STORE) --- */}
      {isFranchise && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Store Identity</span>
                <Store className="h-4 w-4 text-teal-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-white font-mono">
                  {userOutlet}
                </span>
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-[10px]">
                  {matchedStore?.model || "FOCO"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {matchedStore?.name} · {matchedStore?.city}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Daily CCTV Submission</span>
                <Video className="h-4 w-4 text-indigo-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-white font-mono">
                  {storeSubmission?.status || "Pending"}
                </span>
                <Link to="/evidence" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  <span>CCTV Portal</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {storeSubmission?.photosCount || 8} Frames Extracted
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Store Compliance Rating</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {storeSubmission?.finalRating ? `${storeSubmission.finalRating} / 10` : "88%"}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                  <Lock className="h-3 w-3" />
                  <span>Officer Verified</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Statutory compliance score</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Physical Stock Count</span>
                <Boxes className="h-4 w-4 text-amber-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">
                  36 SKUs
                </span>
                <Link to="/inventory" className="text-xs text-amber-400 hover:underline inline-flex items-center gap-0.5">
                  <span>Inventory</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Store on-hand stock</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- QUALITY & COMPLIANCE OFFICER KPIS --- */}
      {isOfficer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Stores in Audit Scope</span>
                <Building2 className="h-4 w-4 text-indigo-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {summary.totalOutlets}
                </span>
                <Link to="/compliance" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  <span>Audit Queue</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Supervised stores</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>CCTV Submissions</span>
                <Video className="h-4 w-4 text-purple-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-purple-400 font-mono">
                  {cctvSubmissions.length}
                </span>
                <Link to="/compliance" className="text-xs text-purple-400 hover:underline inline-flex items-center gap-0.5">
                  <span>Review All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Surveillance recordings</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Verified Inspections</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                  {verifiedSubmissions.length}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Certified
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Final ratings submitted</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Pending Officer Review</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">
                  {pendingSubmissions.length}
                </span>
                <Link to="/compliance" className="text-xs text-amber-400 hover:underline inline-flex items-center gap-0.5">
                  <span>Inspect</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Awaiting evaluation</p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Network Compliance</span>
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
              <p className="text-[11px] text-slate-500 mt-1">Statutory benchmark</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. OPERATIONAL SHORTCUTS (ROLE-FILTERED)                 */}
      {/* ======================================================== */}
      <div>
        {isOwner && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/inventory"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Inventory Stock</span>
                <Boxes className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-lg font-bold font-mono text-white mt-1 block">36 SKUs</span>
              <span className="text-[10px] text-amber-400 font-semibold">Store Stock Level</span>
            </Link>

            <Link
              to="/supply"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Company Supply</span>
                <Package className="h-4 w-4 text-teal-400" />
              </div>
              <span className="text-lg font-bold font-mono text-white mt-1 block">Active</span>
              <span className="text-[10px] text-teal-400 font-semibold">Inward Shipments</span>
            </Link>

            <Link
              to="/sales"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Sales Analytics</span>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                {summary.totalOutlets} Outlets
              </span>
              <span className="text-[10px] text-blue-400 font-semibold">Revenue Telemetry</span>
            </Link>

            <Link
              to="/evidence"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Store Evidence</span>
                <Video className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-lg font-bold font-mono text-white mt-1 block">
                {cctvSubmissions.length} Feeds
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold">Store CCTV Logs</span>
            </Link>
          </div>
        )}

        {isFranchise && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              to={`/outlets/${userOutlet}`}
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">My Outlet</span>
                <Store className="h-4 w-4 text-teal-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">{userOutlet}</span>
              <span className="text-[10px] text-teal-400 font-semibold">Store Profile</span>
            </Link>

            <Link
              to="/evidence"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">CCTV Portal</span>
                <Video className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">Upload CCTV</span>
              <span className="text-[10px] text-indigo-400 font-semibold">Daily Footage</span>
            </Link>

            <Link
              to="/inventory"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Store Stock</span>
                <Boxes className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">36 SKUs</span>
              <span className="text-[10px] text-amber-400 font-semibold">Physical Count</span>
            </Link>

            <Link
              to="/supply"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Company Supply</span>
                <Package className="h-4 w-4 text-teal-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">Shipments</span>
              <span className="text-[10px] text-teal-400 font-semibold">Requisitions</span>
            </Link>

            <Link
              to="/sales"
              className="p-3.5 rounded-xl border border-white/10 bg-[#0B1020] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Sales Register</span>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">Daily POS</span>
              <span className="text-[10px] text-blue-400 font-semibold">Settlements</span>
            </Link>
          </div>
        )}

        {isOfficer && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <Link
              to="/compliance"
              className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Audit Queue</span>
                <ShieldCheck className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                {pendingSubmissions.length} Pending
              </span>
              <span className="text-[10px] text-purple-400 font-semibold">Review Queue</span>
            </Link>

            <Link
              to="/compliance"
              className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">CCTV Evidence</span>
                <Video className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                {cctvSubmissions.length} Feeds
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold">Extracted Frames</span>
            </Link>

            <Link
              to="/risk"
              className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Risk Engine</span>
                <Scale className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                {summary.overallRiskScore}/100
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">Risk Tiers</span>
            </Link>

            <Link
              to="/alerts"
              className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-rose-500/40 hover:bg-rose-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Alerts</span>
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              </div>
              <span className="text-base font-bold font-mono text-rose-400 mt-1 block">
                {counts.complianceAlertsCount} Cases
              </span>
              <span className="text-[10px] text-rose-400 font-semibold">Anomalies</span>
            </Link>

            <Link
              to="/complaints"
              className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Complaints</span>
                <MessageSquare className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                {counts.customerComplaintsCount} Tickets
              </span>
              <span className="text-[10px] text-purple-400 font-semibold">Registry</span>
            </Link>

            <Link
              to="/corrective-actions"
              className="p-3 rounded-xl border border-white/10 bg-[#0B1020] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">CAPA</span>
                <FileCheck2 className="h-4 w-4 text-teal-400" />
              </div>
              <span className="text-base font-bold font-mono text-white mt-1 block">
                {counts.correctiveActionsCount} Mandates
              </span>
              <span className="text-[10px] text-teal-400 font-semibold">Resolution</span>
            </Link>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. STORE-SPECIFIC SURVEILLANCE & EVIDENCE DOSSIER        */}
      {/* ======================================================== */}
      {isFranchise && (
        <div className="rounded-[28px] border border-teal-500/30 bg-[#071126] p-6 sm:p-7 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 block mb-1 font-bold">
                STORE SURVEILLANCE & EVIDENCE STATUS
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-white uppercase">
                {userOutlet} Daily Surveillance Evidence
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically extracted frames and statutory compliance ratings verified by the Quality & Compliance Officer.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs px-3 py-1 font-mono font-semibold ${
                  storeSubmission?.status === "Verified"
                    ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                    : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                }`}
              >
                {storeSubmission?.status === "Verified"
                  ? "✓ Verified by Officer"
                  : "⏳ Pending Officer Review"}
              </Badge>
              <Link
                to="/evidence"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F46FF] hover:bg-[#6366F1] text-white text-xs font-semibold shadow-md transition-all"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Go to Store CCTV Portal</span>
              </Link>
            </div>
          </div>

          {/* Submission Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <FileVideo className="h-3.5 w-3.5 text-blue-400" />
                <span>CCTV Recording File</span>
              </span>
              <div className="font-mono text-white font-medium truncate">
                {storeSubmission?.videoName || "CCTV_DAILY_RECORDING_04OCT2026.mp4"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-400" />
                <span>Recorded Duration</span>
              </span>
              <div className="font-mono text-white font-medium">
                {storeSubmission?.durationLabel || "8 hours"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                <span>Upload Date</span>
              </span>
              <div className="font-mono text-white font-medium">
                {storeSubmission?.uploadDate || "04 Oct 2026"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Officer Rating</span>
              </span>
              <div className="font-mono text-emerald-400 font-bold text-sm">
                {storeSubmission?.finalRating ? `${storeSubmission.finalRating} / 10` : "Pending Inspection"}
              </div>
            </div>
          </div>

          {/* Officer Feedback Box (Read-Only) */}
          {storeSubmission?.officerComment && (
            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Officer Statutory Feedback:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Inspected: {storeSubmission.inspectionDate || "04 Oct 2026"}
                </span>
              </div>
              <p className="text-slate-200 italic">"{storeSubmission.officerComment}"</p>
            </div>
          )}

          {/* Extracted Frame Thumbnails */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
              Extracted Evidence Frames ({storePhotos.length} Photos)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {storePhotos.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl overflow-hidden border border-white/10 bg-[#050B1A] group"
                >
                  <div className="relative aspect-[16/10] bg-black">
                    <img
                      src={p.imageUrl}
                      alt={p.id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                      {p.timestamp}
                    </div>
                  </div>
                  <div className="p-2 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300 truncate max-w-[80px]">{p.zone}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. OFFICER STORE EVIDENCE REVIEW QUEUE TABLE             */}
      {/* ======================================================== */}
      {isOfficer && (
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                  <Video className="h-4 w-4 text-purple-400" />
                  <span>CCTV Evidence & Compliance Review Queue</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Stores with daily CCTV footage submitted. Open each store to inspect extracted photos and submit statutory ratings.
                </CardDescription>
              </div>
              <Link
                to="/compliance"
                className="text-xs text-purple-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Full Audit Portal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-y border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Store Outlet</th>
                    <th className="py-2.5 px-3 font-semibold">City / Model</th>
                    <th className="py-2.5 px-3 font-semibold">CCTV Recording</th>
                    <th className="py-2.5 px-3 font-semibold">Duration</th>
                    <th className="py-2.5 px-3 font-semibold">Review Status</th>
                    <th className="py-2.5 px-3 font-semibold">Compliance Rating</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Officer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cctvSubmissions.map((sub) => {
                    const storeInfo = STORES_MAP[sub.storeId];
                    return (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#818CF8] block">
                            {sub.storeId}
                          </span>
                          <span className="text-[11px] text-slate-300 block truncate max-w-[150px]">
                            {sub.storeName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          <div>{storeInfo?.city || "Network"}</div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {storeInfo?.model || "FOCO"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-slate-200 block truncate max-w-[140px]">
                            {sub.videoName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {sub.uploadDate}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {sub.durationLabel} ({sub.photosCount} Photos)
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              sub.status === "Verified"
                                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                            }`}
                          >
                            {sub.status === "Verified" ? "Verified" : "Pending Review"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {sub.finalRating ? (
                            <span className="text-emerald-400 font-bold">
                              {sub.finalRating} / 10
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Unrated</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/compliance/review/${sub.storeId}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            <span>Review Store Evidence</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 7. FRANCHISEE STORES PERFORMANCE & EVIDENCE OVERVIEW     */}
      {/* ======================================================== */}
      {isOwner && (
        <Card className="border-white/10 bg-[#0B1020]">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  <span>Franchise Stores Performance & Evidence Status</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Consolidated operational performance, CCTV surveillance submission status, and statutory compliance ratings.
                </CardDescription>
              </div>
              <Link
                to="/outlets"
                className="text-xs text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>All Outlets Directory</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-400 border-y border-white/10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Store Outlet</th>
                    <th className="py-2.5 px-3 font-semibold">City / Model</th>
                    <th className="py-2.5 px-3 font-semibold">Monthly Turnover</th>
                    <th className="py-2.5 px-3 font-semibold">CCTV Evidence Status</th>
                    <th className="py-2.5 px-3 font-semibold">Extracted Photos</th>
                    <th className="py-2.5 px-3 font-semibold">Compliance Rating</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ALL_NETWORK_STORES.map((s) => {
                    const storeSub = cctvSubmissions.find(
                      (sub) => sub.storeId.toUpperCase() === s.code.toUpperCase()
                    );
                    return (
                      <tr key={s.code} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3">
                          <Link
                            to={`/outlets/${s.code}`}
                            className="font-mono font-bold text-[#818CF8] hover:underline block"
                          >
                            {s.code}
                          </Link>
                          <span className="text-[11px] text-slate-300 block truncate max-w-[150px]">
                            {s.name}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          <div>{s.city}</div>
                          <span className="text-[10px] text-slate-500 font-mono">{s.model}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-white font-medium">
                          ₹6,48,000
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              storeSub?.status === "Verified"
                                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                            }`}
                          >
                            {storeSub?.status === "Verified" ? "Verified" : "Pending Review"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {storeSub?.photosCount || 8} Photos
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {storeSub?.finalRating ? (
                            <span className="text-emerald-400 font-bold">
                              {storeSub.finalRating} / 10
                            </span>
                          ) : (
                            <span className="text-slate-400">88%</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to="/evidence"
                              className="text-xs text-indigo-400 hover:underline"
                            >
                              Evidence →
                            </Link>
                            <Link
                              to={`/outlets/${s.code}`}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Profile →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 8. BUSINESS CHARTS & REGIONAL OVERVIEW (OWNER & OFFICER) */}
      {/* ======================================================== */}
      {!isFranchise && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trends Chart */}
          <Card className={`${isOwner ? "lg:col-span-3" : "lg:col-span-2"} border-white/10 bg-[#0B1020]`}>
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

          {/* Network Risk Distribution Chart (Officer Only) */}
          {isOfficer && (
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
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. OFFICER-ONLY COMPLIANCE ALERTS & CAPA AUDIT PIPELINE  */}
      {/* ======================================================== */}
      {isOfficer && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Alerts */}
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
      )}

      {/* ======================================================== */}
      {/* 10. STORE SALES PERFORMANCE (FOR STORE ROLE)             */}
      {/* ======================================================== */}
      {isFranchise && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-[#818CF8]" />
                    <span>Store Net Sales Trends</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Daily sales turnover logged for {userOutlet}
                  </CardDescription>
                </div>
                <Link to="/sales" className="text-xs text-[#818CF8] hover:underline">
                  Full Sales Register →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrends || []}>
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
                      stroke="#14B8A6"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="#14B8A6"
                      name="Store Net Sales"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-[#0B1020]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-white">
                <Store className="h-4 w-4 text-teal-400" />
                <span>Store Operational Profile</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Administrative contact details and on-ground staffing
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Store Manager</span>
                  <span className="font-semibold text-white text-sm">{matchedStore?.manager || "Store Operator"}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3 text-teal-400" />
                    <span>Active Staff</span>
                  </span>
                  <span className="font-semibold text-white text-sm">{matchedStore?.activeStaff || 14} Employees</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Registered Email</span>
                  <span className="font-mono text-slate-200">{matchedStore?.email || "store.lucknow@aurafoods.com"}</span>
                </div>
                <Link
                  to={`/outlets/${userOutlet}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              </div>
              <button
                onClick={() => setRiskModalOutlet(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-slate-300">Deterministic Multi-Factor Score:</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {riskModalOutlet.riskScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-slate-300">Audited Compliance Adherence:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {riskModalOutlet.complianceScore}%
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRiskModalOutlet(null)}
                className="text-xs"
              >
                Close Breakdown
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DRILLDOWN MODAL: Alert Item Details */}
      {alertModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0B1020] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono font-bold text-[#818CF8] text-xs">
                  {alertModalItem.alertId}
                </span>
                <h3 className="text-base font-bold text-white">
                  {alertModalItem.type || "Compliance Anomaly"}
                </h3>
              </div>
              <button
                onClick={() => setAlertModalItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-slate-300">{alertModalItem.message}</p>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAlertModalItem(null)}
                className="text-xs"
              >
                Close Case
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ManagementDashboard;
