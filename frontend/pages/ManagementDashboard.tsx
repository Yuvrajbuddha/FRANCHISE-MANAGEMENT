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
  MapPin,
  Maximize2,
  XCircle,
  AlertOctagon,
  Upload,
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
  const [dashboardPreviewPhoto, setDashboardPreviewPhoto] = useState<GeneratedPhoto | null>(null);

  // Keyboard Escape listener for lightbox preview modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDashboardPreviewPhoto(null);
      }
    };
    if (dashboardPreviewPhoto) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dashboardPreviewPhoto]);

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
    <div className="space-y-6 font-sans text-[#18251F] pb-16">
      {/* ======================================================== */}
      {/* 1. ROLE-ADAPTIVE HEADER CARD                             */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#13845B] flex items-center gap-1.5 font-bold">
            <span className="h-2 w-2 rounded-full bg-[#13845B] animate-pulse" />
            {isOwner && <span>EXECUTIVE MONITORING · FRANCHISEE OWNER PORTAL</span>}
            {isFranchise && <span>UNIT CONSOLE · STORE OPERATIONAL GATE</span>}
            {isOfficer && <span>SUPERVISORY INTELLIGENCE · QUALITY & COMPLIANCE CONSOLE</span>}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#073B2A]">
            {isOwner && "Franchise Standards & Business Performance"}
            {isFranchise && `${storeName} — Daily Operations & Evidence`}
            {isOfficer && "Executive Standards & Compliance Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-[#738078]">
            {isOwner &&
              "Enterprise overview spanning franchise outlets, revenue run-rate, inventory stock, and certified statutory compliance ratings."}
            {isFranchise &&
              "Operational metrics, daily CCTV submission status, extracted evidence photos, and statutory compliance ratings for your outlet."}
            {isOfficer &&
              "Real-time compliance monitoring, CCTV verification queue, extracted photo evidence, and risk intelligence across franchise outlets."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <Badge className="bg-[#073B2A]/10 text-[#073B2A] border-[#073B2A]/20 text-xs px-3 py-1 font-mono font-semibold">
              Franchisee Owner
            </Badge>
          )}
          {isFranchise && (
            <Badge className="bg-[#13845B]/15 text-[#073B2A] border-[#13845B]/30 text-xs px-3 py-1 font-mono font-semibold">
              Store Operator · {userOutlet}
            </Badge>
          )}
          {isOfficer && (
            <Badge className="bg-[#073B2A] text-white border-transparent text-xs px-3 py-1 font-mono font-semibold">
              Compliance Officer
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 cursor-pointer text-xs hidden sm:flex border-[#DDE5DC] bg-white text-[#18251F] hover:bg-[#F6F1E7] rounded-xl shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-[#073B2A]" />
            <span>Export View</span>
          </Button>
        </div>
      </div>

      {/* Role notice for store isolation */}
      {isFranchise && (
        <div className="rounded-xl border border-[#13845B]/30 bg-[#FFFDF8] p-3.5 text-xs text-[#073B2A] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#13845B] shrink-0" />
            <span>
              <strong>Store Isolation Active:</strong> Telemetry strictly scoped to your assigned store (
              <strong>{userOutlet} — {storeName}</strong>). Network financials and other stores' private data are restricted.
            </span>
          </div>
          <Link
            to="/login/store"
            className="text-[11px] font-semibold text-[#13845B] hover:underline shrink-0"
          >
            Switch Store →
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FILTER BAR (ROLE-AWARE)                               */}
      {/* ======================================================== */}
      {!isFranchise && (
        <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#073B2A] text-xs">
              <Filter className="h-4 w-4 text-[#13845B]" />
              <span>Multi-Dimensional Filtering</span>
            </div>
            <span className="text-[11px] font-mono text-[#738078]">Dynamic Telemetry Query</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Date Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase text-[#738078] block mb-1">
                Date Period
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#DDE5DC] bg-white px-2.5 text-xs font-semibold text-[#18251F] cursor-pointer focus:border-[#073B2A]"
              >
                <option value="Today">Today (Oct 04, 2026)</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Month to Date">Month to Date (Oct '26)</option>
                <option value="All Time">All Historical Cycles</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase text-[#738078] block mb-1">
                City Region
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#DDE5DC] bg-white px-2.5 text-xs font-semibold text-[#18251F] cursor-pointer focus:border-[#073B2A]"
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
              <label className="text-[10px] font-bold uppercase text-[#738078] block mb-1">
                Store Outlet
              </label>
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#DDE5DC] bg-white px-2.5 text-xs font-semibold text-[#18251F] cursor-pointer focus:border-[#073B2A]"
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
                <label className="text-[10px] font-bold uppercase text-[#738078] block mb-1">
                  Risk Level Tier
                </label>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#DDE5DC] bg-white px-2.5 text-xs font-semibold text-[#18251F] cursor-pointer focus:border-[#073B2A]"
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
              <label className="text-[10px] font-bold uppercase text-[#738078] block mb-1">
                Compliance Status
              </label>
              <select
                value={selectedComplianceStatus}
                onChange={(e) => setSelectedComplianceStatus(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#DDE5DC] bg-white px-2.5 text-xs font-semibold text-[#18251F] cursor-pointer focus:border-[#073B2A]"
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
          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Total Outlets</span>
                <Building2 className="h-4 w-4 text-[#073B2A]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#073B2A] font-mono">
                  {summary.totalOutlets}
                </span>
                <Link to="/outlets" className="text-xs text-[#13845B] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Directory</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Assigned franchise stores</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Net Revenue</span>
                <TrendingUp className="h-4 w-4 text-[#13845B]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#073B2A] font-mono">
                  {formatCurrency(summary.totalRevenue)}
                </span>
                <Link to="/sales" className="text-xs text-[#13845B] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Sales</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Net sales turnover</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>EBITDA / Profit</span>
                <DollarSign className="h-4 w-4 text-[#13845B]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#073B2A] font-mono">
                  {formatCurrency(summary.ebitda)}
                </span>
                <Badge variant="outline" className="text-[10px] font-bold text-[#073B2A] border-[#073B2A]/20 bg-[#073B2A]/5">
                  {summary.ebitdaMargin}% Margin
                </Badge>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Franchise run-rate</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Compliance Adherence</span>
                <ShieldCheck className="h-4 w-4 text-[#13845B]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#13845B] font-mono">
                  {summary.compliancePercentage}%
                </span>
                <Badge className="bg-[#13845B]/10 text-[#073B2A] border-[#13845B]/30 text-[10px]">
                  Verified
                </Badge>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Average store score</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Physical Stock</span>
                <Boxes className="h-4 w-4 text-[#B45309]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#18251F] font-mono">
                  36 SKUs
                </span>
                <Link to="/inventory" className="text-xs text-[#B45309] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Inventory</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Healthy stock holding</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- STORE ROLE KPIS (SCOPED STRICTLY TO THEIR OWN STORE) --- */}
      {isFranchise && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Store Identity</span>
                <Store className="h-4 w-4 text-[#073B2A]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-[#073B2A] font-mono">
                  {userOutlet}
                </span>
                <Badge className="bg-[#073B2A]/10 text-[#073B2A] border-[#073B2A]/20 text-[10px]">
                  {matchedStore?.model || "FOCO"}
                </Badge>
              </div>
              <p className="text-[11px] text-[#738078] mt-1 truncate">
                {matchedStore?.name} · {matchedStore?.city}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Daily CCTV Submission</span>
                <Video className="h-4 w-4 text-[#073B2A]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-[#073B2A] font-mono">
                  {storeSubmission?.status || "Pending"}
                </span>
                <Link to="/evidence" className="text-xs text-[#13845B] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>CCTV Portal</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">
                {storeSubmission?.photosCount || 8} Frames Extracted
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Store Compliance Rating</span>
                <ShieldCheck className="h-4 w-4 text-[#13845B]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#13845B] font-mono">
                  {storeSubmission?.finalRating ? `${storeSubmission.finalRating} / 10` : "88%"}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-[#073B2A] font-mono font-semibold">
                  <Lock className="h-3 w-3 text-[#13845B]" />
                  <span>Officer Verified</span>
                </div>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Statutory compliance score</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Physical Stock Count</span>
                <Boxes className="h-4 w-4 text-[#B45309]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#18251F] font-mono">
                  36 SKUs
                </span>
                <Link to="/inventory" className="text-xs text-[#B45309] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Inventory</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Store on-hand stock</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- QUALITY & COMPLIANCE OFFICER KPIS --- */}
      {isOfficer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Stores in Scope</span>
                <Building2 className="h-4 w-4 text-[#073B2A]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#073B2A] font-mono">
                  {summary.totalOutlets}
                </span>
                <Link to="/compliance" className="text-xs text-[#13845B] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Queue</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Supervised stores</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>CCTV Submissions</span>
                <Video className="h-4 w-4 text-[#073B2A]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#073B2A] font-mono">
                  {cctvSubmissions.length}
                </span>
                <Link to="/compliance" className="text-xs text-[#13845B] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Review</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Surveillance recordings</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Verified Stores</span>
                <CheckCircle2 className="h-4 w-4 text-[#13845B]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#13845B] font-mono">
                  {verifiedSubmissions.length}
                </span>
                <Badge className="bg-[#13845B]/10 text-[#073B2A] border-[#13845B]/30 text-[10px]">
                  Certified
                </Badge>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Final ratings submitted</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Pending Review</span>
                <Clock className="h-4 w-4 text-[#B45309]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#B45309] font-mono">
                  {pendingSubmissions.length}
                </span>
                <Link to="/compliance" className="text-xs text-[#B45309] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Inspect</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Awaiting evaluation</p>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-1 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#738078] flex items-center justify-between">
                <span>Avg Compliance</span>
                <ShieldCheck className="h-4 w-4 text-[#13845B]" />
              </span>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#13845B] font-mono">
                  {summary.compliancePercentage}%
                </span>
                <Link to="/compliance" className="text-xs text-[#13845B] hover:underline inline-flex items-center gap-0.5 font-semibold">
                  <span>Audits</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-[11px] text-[#738078] mt-1">Statutory benchmark</p>
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
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Inventory Stock</span>
                <Boxes className="h-4 w-4 text-[#B45309]" />
              </div>
              <span className="text-lg font-bold font-mono text-[#18251F] mt-1 block">36 SKUs</span>
              <span className="text-[10px] text-[#B45309] font-semibold">Store Stock Level</span>
            </Link>

            <Link
              to="/supply"
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Company Supply</span>
                <Package className="h-4 w-4 text-[#13845B]" />
              </div>
              <span className="text-lg font-bold font-mono text-[#18251F] mt-1 block">Active</span>
              <span className="text-[10px] text-[#13845B] font-semibold">Inward Shipments</span>
            </Link>

            <Link
              to="/sales"
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Sales Analytics</span>
                <TrendingUp className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-lg font-bold font-mono text-[#18251F] mt-1 block">
                {summary.totalOutlets} Outlets
              </span>
              <span className="text-[10px] text-[#073B2A] font-semibold">Revenue Telemetry</span>
            </Link>

            <Link
              to="/evidence"
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Store Evidence</span>
                <Video className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-lg font-bold font-mono text-[#18251F] mt-1 block">
                {cctvSubmissions.length} Feeds
              </span>
              <span className="text-[10px] text-[#073B2A] font-semibold">Store CCTV Logs</span>
            </Link>
          </div>
        )}

        {isFranchise && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              to={`/outlets/${userOutlet}`}
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">My Outlet</span>
                <Store className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-base font-bold font-mono text-[#073B2A] mt-1 block">{userOutlet}</span>
              <span className="text-[10px] text-[#13845B] font-semibold">Store Profile</span>
            </Link>

            <Link
              to="/evidence"
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">CCTV Portal</span>
                <Video className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">Upload CCTV</span>
              <span className="text-[10px] text-[#073B2A] font-semibold">Daily Footage</span>
            </Link>

            <Link
              to="/inventory"
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Store Stock</span>
                <Boxes className="h-4 w-4 text-[#B45309]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">36 SKUs</span>
              <span className="text-[10px] text-[#B45309] font-semibold">Physical Count</span>
            </Link>

            <Link
              to="/supply"
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Company Supply</span>
                <Package className="h-4 w-4 text-[#13845B]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">Shipments</span>
              <span className="text-[10px] text-[#13845B] font-semibold">Requisitions</span>
            </Link>

            <Link
              to="/sales"
              className="p-4 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Sales Register</span>
                <TrendingUp className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">Daily POS</span>
              <span className="text-[10px] text-[#073B2A] font-semibold">Settlements</span>
            </Link>
          </div>
        )}

        {isOfficer && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            <Link
              to="/compliance"
              className="p-3.5 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Audit Queue</span>
                <ShieldCheck className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-base font-bold font-mono text-[#073B2A] mt-1 block">
                {pendingSubmissions.length} Pending
              </span>
              <span className="text-[10px] text-[#13845B] font-semibold">Review Queue</span>
            </Link>

            <Link
              to="/compliance"
              className="p-3.5 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">CCTV Evidence</span>
                <Video className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">
                {cctvSubmissions.length} Feeds
              </span>
              <span className="text-[10px] text-[#073B2A] font-semibold">Extracted Frames</span>
            </Link>

            <Link
              to="/risk"
              className="p-3.5 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Risk Engine</span>
                <Scale className="h-4 w-4 text-[#B45309]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">
                {summary.overallRiskScore}/100
              </span>
              <span className="text-[10px] text-[#B45309] font-semibold">Risk Tiers</span>
            </Link>

            <Link
              to="/alerts"
              className="p-3.5 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Alerts</span>
                <ShieldAlert className="h-4 w-4 text-rose-600" />
              </div>
              <span className="text-base font-bold font-mono text-rose-600 mt-1 block">
                {counts.complianceAlertsCount} Cases
              </span>
              <span className="text-[10px] text-rose-700 font-semibold">Anomalies</span>
            </Link>

            <Link
              to="/complaints"
              className="p-3.5 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">Complaints</span>
                <MessageSquare className="h-4 w-4 text-[#073B2A]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">
                {counts.customerComplaintsCount} Tickets
              </span>
              <span className="text-[10px] text-[#738078] font-semibold">Registry</span>
            </Link>

            <Link
              to="/corrective-actions"
              className="p-3.5 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#738078]">CAPA</span>
                <FileCheck2 className="h-4 w-4 text-[#13845B]" />
              </div>
              <span className="text-base font-bold font-mono text-[#18251F] mt-1 block">
                {counts.correctiveActionsCount} Mandates
              </span>
              <span className="text-[10px] text-[#13845B] font-semibold">Resolution</span>
            </Link>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. STORE-SPECIFIC SURVEILLANCE & EVIDENCE DOSSIER        */}
      {/* ======================================================== */}
      {isFranchise && (
        <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 lg:p-8 shadow-sm space-y-6 text-[#18251F]">
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDE5DC] pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] bg-[#13845B]/10 border border-[#13845B]/20 px-2.5 py-0.5 rounded-full font-semibold inline-block mb-1">
                STORE SURVEILLANCE & EVIDENCE STATUS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#073B2A]">
                {userOutlet} Daily Surveillance Evidence
              </h2>
              <p className="text-xs sm:text-sm text-[#738078] max-w-2xl leading-relaxed">
                Automatically extracted frames and statutory compliance ratings verified by the Quality & Compliance Officer.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {storeSubmission?.status === "Verified" ? (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#13845B]/10 text-[#073B2A] border border-[#13845B]/30 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#13845B] shrink-0" />
                  <span>Verified by Officer</span>
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                  <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>Pending Officer Review</span>
                </span>
              )}

              <Link
                to="/evidence"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#073B2A] hover:bg-[#05291F] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Video className="h-3.5 w-3.5 shrink-0" />
                <span>Go to Store CCTV Portal</span>
                <ArrowRight className="h-3 w-3 text-white/80 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Submission Specs: Four Redesigned Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: CCTV Recording File */}
            <div className="p-4 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] flex flex-col justify-between space-y-2.5 h-full">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#738078] font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#073B2A]/10 text-[#073B2A]">
                  <FileVideo className="h-3.5 w-3.5" />
                </span>
                <span>CCTV Recording File</span>
              </span>
              <div
                className="font-mono text-[#073B2A] text-xs sm:text-sm font-bold truncate"
                title={storeSubmission?.videoName || "CCTV_DAILY_RECORDING_04OCT2026.mp4"}
              >
                {storeSubmission?.videoName || "CCTV_DAILY_RECORDING_04OCT2026.mp4"}
              </div>
              <div className="text-[11px] text-[#738078] font-mono pt-1 border-t border-[#DDE5DC] flex items-center justify-between">
                <span>Format: MP4</span>
                <span className="text-[#13845B] font-semibold">Security Raw</span>
              </div>
            </div>

            {/* Card 2: Recorded Duration */}
            <div className="p-4 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] flex flex-col justify-between space-y-2.5 h-full">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#738078] font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#073B2A]/10 text-[#073B2A]">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <span>Recorded Duration</span>
              </span>
              <div className="font-mono text-[#073B2A] text-base sm:text-lg font-bold">
                {storeSubmission?.durationLabel || "8 hours"}
              </div>
              <div className="text-[11px] text-[#738078] font-mono pt-1 border-t border-[#DDE5DC] flex items-center justify-between">
                <span>Coverage</span>
                <span className="text-[#073B2A] font-semibold">Operating Shift</span>
              </div>
            </div>

            {/* Card 3: Upload Date */}
            <div className="p-4 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] flex flex-col justify-between space-y-2.5 h-full">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#738078] font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#073B2A]/10 text-[#073B2A]">
                  <Calendar className="h-3.5 w-3.5" />
                </span>
                <span>Upload Date</span>
              </span>
              <div className="font-mono text-[#073B2A] text-base sm:text-lg font-bold">
                {storeSubmission?.uploadDate || "04 Oct 2026"}
              </div>
              <div className="text-[11px] text-[#738078] font-mono pt-1 border-t border-[#DDE5DC] flex items-center justify-between">
                <span>Cycle</span>
                <span className="text-[#073B2A] font-semibold">Daily Mandatory</span>
              </div>
            </div>

            {/* Card 4: Officer Rating */}
            <div className="p-4 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] flex flex-col justify-between space-y-2.5 h-full">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#738078] font-semibold flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#13845B]/10 text-[#13845B]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span>Officer Rating</span>
              </span>
              {storeSubmission?.finalRating ? (
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="font-serif text-2xl font-bold text-[#13845B]">
                    {storeSubmission.finalRating}
                  </span>
                  <span className="text-xs text-[#738078] font-semibold">/ 10 Rating</span>
                </div>
              ) : (
                <div className="mt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-semibold">
                    <Clock className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>Pending Inspection</span>
                  </span>
                </div>
              )}
              <div className="text-[11px] text-[#738078] font-mono pt-1 border-t border-[#DDE5DC] flex items-center justify-between">
                <span>Compliance Audit</span>
                <span className={storeSubmission?.finalRating ? "text-[#13845B] font-semibold" : "text-amber-700 font-semibold"}>
                  {storeSubmission?.finalRating ? "Certified" : "Awaiting Review"}
                </span>
              </div>
            </div>
          </div>

          {/* Officer Feedback Box (Read-Only) */}
          {storeSubmission?.officerComment && (
            <div className="p-4 rounded-xl bg-[#F6F1E7]/70 border border-[#13845B]/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#073B2A] block font-semibold flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-[#13845B] shrink-0" />
                  <span>Officer Statutory Feedback:</span>
                </span>
                <span className="text-[10px] text-[#738078] font-mono">
                  Inspected: {storeSubmission.inspectionDate || "04 Oct 2026"}
                </span>
              </div>
              <p className="text-[#18251F] italic leading-relaxed">"{storeSubmission.officerComment}"</p>
            </div>
          )}

          {/* Extracted Frame Thumbnails Gallery */}
          <div className="space-y-4 pt-3 border-t border-[#DDE5DC]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-serif font-normal tracking-tight text-[#073B2A] flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#13845B]" />
                  <span>Extracted Evidence Frames ({storePhotos.length} Photos)</span>
                </h3>
                <p className="text-xs text-[#738078]">
                  Click any frame to inspect full-resolution capture telemetry and statutory timestamps.
                </p>
              </div>
              <Link
                to="/evidence"
                className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <span>Store CCTV Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Responsive 4-col wide / 2-col medium / 1-col mobile grid */}
            {storePhotos.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[#DDE5DC] rounded-xl space-y-2 bg-[#F6F1E7]/50">
                <Camera className="h-8 w-8 text-[#738078] mx-auto" />
                <div className="text-sm font-semibold text-[#18251F]">No frames extracted yet</div>
                <p className="text-xs text-[#738078] max-w-sm mx-auto">
                  Upload a CCTV video to extract authentic evidence frames directly from your recording.
                </p>
                <Link
                  to="/evidence"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#073B2A] hover:bg-[#05291F] text-xs font-semibold text-white mt-2 transition-colors"
                >
                  <span>Upload CCTV Video</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {storePhotos.map((p, pIdx) => (
                  <div
                    key={p.id}
                    onClick={() => setDashboardPreviewPhoto(p)}
                    className="rounded-xl overflow-hidden border border-[#DDE5DC] bg-white group hover:border-[#073B2A]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {/* Thumbnail Frame (16:9 aspect ratio) */}
                    <div className="relative aspect-video w-full bg-[#18251F] overflow-hidden border-b border-[#DDE5DC] flex items-center justify-center">
                      <img
                        src={p.dataUrl || p.imageUrl}
                        alt={`${p.id} - ${p.zone}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector(".img-error-fallback")) {
                            const errDiv = document.createElement("div");
                            errDiv.className = "img-error-fallback text-center p-3 text-xs text-rose-400 font-mono";
                            errDiv.innerText = "Frame unavailable — extraction or image loading failed.";
                            parent.appendChild(errDiv);
                          }
                        }}
                      />
                    {/* Top Left Photo Tag */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/15 shadow-sm">
                        {p.id}
                      </span>
                      <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-[#073B2A]/90 backdrop-blur-md text-[9px] font-mono font-semibold text-[#72D6A0] border border-[#72D6A0]/30">
                        CAM-0{((pIdx % 4) + 1)}
                      </span>
                    </div>

                    {/* Top Right Timestamp */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-[#72D6A0] border border-[#72D6A0]/30 shadow-sm">
                        <Clock className="h-3 w-3 text-[#72D6A0]" />
                        {p.timestamp}
                      </span>
                    </div>

                    {/* Hover Inspect Indicator */}
                    <div className="absolute inset-0 bg-[#073B2A]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-xs font-medium text-white border border-white/20 shadow-md flex items-center gap-1.5">
                        <Maximize2 className="h-3.5 w-3.5 text-[#72D6A0]" />
                        Inspect Frame
                      </span>
                    </div>
                  </div>

                  {/* Card Meta & Review Status */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-serif font-bold text-sm text-[#073B2A] tracking-tight flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5 text-[#13845B] shrink-0" />
                          {p.id}
                        </span>
                        <span className="font-mono text-xs text-[#18251F] font-semibold bg-[#F6F1E7] px-2 py-0.5 rounded-md border border-[#DDE5DC]">
                          {p.timestamp}
                        </span>
                      </div>

                      {/* Evidence Category / Zone Label */}
                      <div className="flex items-center gap-1.5 text-xs text-[#738078] font-medium">
                        <MapPin className="h-3.5 w-3.5 text-[#13845B] shrink-0" />
                        <span className="truncate text-[#18251F]" title={p.zone}>
                          {p.zone}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="pt-2 border-t border-[#DDE5DC] flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#738078] tracking-wider font-semibold">
                        Review Status
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-semibold ${
                          p.status === "Correct"
                            ? "border-[#13845B]/40 text-[#073B2A] bg-[#13845B]/10"
                            : p.status === "Incorrect"
                            ? "border-rose-300 text-rose-700 bg-rose-50"
                            : p.status === "Needs Review"
                            ? "border-amber-300 text-amber-800 bg-amber-50"
                            : "border-[#DDE5DC] text-[#738078] bg-[#F6F1E7]"
                        }`}
                      >
                        {p.status === "Correct"
                          ? "Approved"
                          : p.status === "Incorrect"
                          ? "Rejected"
                          : p.status === "Needs Review"
                          ? "Needs Re-review"
                          : "Pending Officer Review"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Lightbox Modal for Dashboard Photo Preview */}
          {dashboardPreviewPhoto && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="CCTV Evidence Frame Preview"
              onClick={() => setDashboardPreviewPhoto(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-3xl rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 shadow-2xl space-y-5 my-auto text-[#18251F]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] bg-[#13845B]/10 border border-[#13845B]/20 px-2.5 py-0.5 rounded-full font-semibold">
                        CCTV EVIDENCE RECORD
                      </span>
                      <span className="text-xs font-mono text-[#738078]">
                        {dashboardPreviewPhoto.id}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#073B2A] tracking-tight">
                      {dashboardPreviewPhoto.id} · {dashboardPreviewPhoto.timestamp}
                    </h3>
                    <p className="text-xs text-[#738078] font-mono">
                      {storeName} ({userOutlet}) · Extracted from {storeSubmission?.videoName || "CCTV footage"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDashboardPreviewPhoto(null)}
                    aria-label="Close photo preview"
                    className="p-2.5 rounded-xl text-[#738078] hover:text-[#18251F] hover:bg-[#F6F1E7] cursor-pointer border border-[#DDE5DC] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal 16:9 Image Frame */}
                <div className="rounded-xl overflow-hidden border border-[#DDE5DC] bg-black aspect-video w-full shadow-inner flex items-center justify-center">
                  <img
                    src={dashboardPreviewPhoto.dataUrl || dashboardPreviewPhoto.imageUrl}
                    alt={`${dashboardPreviewPhoto.id} - ${dashboardPreviewPhoto.zone}`}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector(".modal-img-error")) {
                        const errDiv = document.createElement("div");
                        errDiv.className = "modal-img-error text-center p-6 text-sm text-rose-400 font-mono";
                        errDiv.innerText = "Frame unavailable — extraction or image loading failed.";
                        parent.appendChild(errDiv);
                      }
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Modal Evidence Telemetry Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold mb-0.5">
                      Capture Timestamp
                    </span>
                    <span className="font-mono text-sm text-[#073B2A] font-bold">
                      {dashboardPreviewPhoto.timestamp}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold mb-0.5">
                      Evidence Zone
                    </span>
                    <span className="font-mono text-xs text-[#073B2A] font-semibold truncate block">
                      {dashboardPreviewPhoto.zone}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold mb-0.5">
                      Surveillance Source
                    </span>
                    <span className="font-mono text-xs text-[#18251F]">
                      {storeSubmission?.id || `CCTV-${userOutlet}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold mb-1">
                      Compliance Status
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 font-semibold ${
                        dashboardPreviewPhoto.status === "Correct"
                          ? "border-[#13845B]/40 text-[#073B2A] bg-[#13845B]/10"
                          : dashboardPreviewPhoto.status === "Incorrect"
                          ? "border-rose-300 text-rose-700 bg-rose-50"
                          : dashboardPreviewPhoto.status === "Needs Review"
                          ? "border-amber-300 text-amber-800 bg-amber-50"
                          : "border-[#DDE5DC] text-[#738078] bg-[#F6F1E7]"
                      }`}
                    >
                      {dashboardPreviewPhoto.status === "Correct"
                        ? "Approved"
                        : dashboardPreviewPhoto.status === "Incorrect"
                        ? "Rejected"
                        : dashboardPreviewPhoto.status === "Needs Review"
                        ? "Needs Re-review"
                        : "Pending Officer Review"}
                    </Badge>
                  </div>
                </div>

                {dashboardPreviewPhoto.officerComment && (
                  <div className="p-4 rounded-xl bg-[#F6F1E7]/60 border border-[#13845B]/30 text-xs space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#073B2A] font-bold block">
                      Officer Review Comment:
                    </span>
                    <p className="text-[#18251F] italic">"{dashboardPreviewPhoto.officerComment}"</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-[#DDE5DC]">
                  <span className="text-[11px] font-mono text-[#738078]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white text-[#18251F] border border-[#DDE5DC] text-[10px]">Esc</kbd> to close
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      to="/evidence"
                      className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold"
                    >
                      Go to Evidence Portal →
                    </Link>
                    <Button
                      type="button"
                      onClick={() => setDashboardPreviewPhoto(null)}
                      className="bg-[#073B2A] hover:bg-[#05291F] text-white text-xs h-9 px-5 rounded-xl cursor-pointer font-medium"
                    >
                      Close Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. OFFICER STORE EVIDENCE REVIEW QUEUE TABLE             */}
      {/* ======================================================== */}
      {isOfficer && (
        <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#DDE5DC]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                  <Video className="h-4 w-4 text-[#13845B]" />
                  <span>CCTV Evidence & Compliance Review Queue</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#738078]">
                  Stores with daily CCTV footage submitted. Open each store to inspect extracted photos and submit statutory ratings.
                </CardDescription>
              </div>
              <Link
                to="/compliance"
                className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold inline-flex items-center gap-1"
              >
                <span>Full Audit Portal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3.5 w-full max-w-full box-border">
              {cctvSubmissions.map((sub) => {
                const storeInfo = STORES_MAP[sub.storeId];
                return (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-[#DDE5DC] bg-white p-4 sm:p-5 shadow-2xs w-full max-w-full box-border min-w-0 space-y-3"
                  >
                    {/* Header: Outlet Code, Name, Status & Review Action */}
                    <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#DDE5DC] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#073B2A] text-sm">
                            {sub.storeId}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              sub.status === "Verified"
                                ? "border-[#13845B]/40 text-[#073B2A] bg-[#13845B]/10"
                                : "border-amber-300 text-amber-800 bg-amber-50"
                            }`}
                          >
                            {sub.status === "Verified" ? "Verified" : "Pending Review"}
                          </Badge>
                        </div>
                        <h4 className="text-xs text-[#18251F] font-semibold mt-1">
                          {sub.storeName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/compliance/review/${sub.storeId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#073B2A] hover:bg-[#05291F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Review Store Evidence</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Vertical Label-Value rows */}
                    <div className="space-y-2 text-xs divide-y divide-[#DDE5DC]/60">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1.5 first:pt-0">
                        <span className="text-[#738078] font-medium shrink-0">Location & Model:</span>
                        <span className="text-[#18251F] sm:text-right">
                          {storeInfo?.city || "Network"} · <span className="font-mono text-[#738078]">{storeInfo?.model || "FOCO"}</span>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                        <span className="text-[#738078] font-medium shrink-0">CCTV Video Recording:</span>
                        <span className="font-mono text-[#073B2A] sm:text-right font-medium">
                          {sub.videoName} <span className="text-[#738078] text-[11px]">({sub.uploadDate})</span>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                        <span className="text-[#738078] font-medium shrink-0">Duration & Extraction:</span>
                        <span className="font-mono text-[#18251F] sm:text-right">
                          {sub.durationLabel} ({sub.photosCount} Extracted Photos)
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                        <span className="text-[#738078] font-medium shrink-0">Statutory Compliance Rating:</span>
                        <div className="sm:text-right">
                          {sub.finalRating ? (
                            <span className="text-[#13845B] font-bold font-mono">
                              {sub.finalRating} / 10
                            </span>
                          ) : (
                            <span className="text-[#738078] italic">Unrated</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 7. FRANCHISEE STORES PERFORMANCE & EVIDENCE OVERVIEW     */}
      {/* ======================================================== */}
      {isOwner && (
        <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
          <CardHeader className="pb-3 border-b border-[#DDE5DC]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                  <Building2 className="h-4 w-4 text-[#13845B]" />
                  <span>Franchise Stores Performance & Evidence Status</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#738078]">
                  Consolidated operational performance, CCTV surveillance submission status, and statutory compliance ratings.
                </CardDescription>
              </div>
              <Link
                to="/outlets"
                className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold inline-flex items-center gap-1"
              >
                <span>All Outlets Directory</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3.5 w-full max-w-full box-border">
              {ALL_NETWORK_STORES.map((s) => {
                const storeSub = cctvSubmissions.find(
                  (sub) => sub.storeId.toUpperCase() === s.code.toUpperCase()
                );
                return (
                  <div
                    key={s.code}
                    className="rounded-xl border border-[#DDE5DC] bg-white p-4 sm:p-5 shadow-2xs w-full max-w-full box-border min-w-0 space-y-3"
                  >
                    {/* Header: Code, Name, Status, Actions */}
                    <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#DDE5DC] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/outlets/${s.code}`}
                            className="font-mono font-bold text-[#073B2A] hover:underline text-sm"
                          >
                            {s.code}
                          </Link>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              storeSub?.status === "Verified"
                                ? "border-[#13845B]/40 text-[#073B2A] bg-[#13845B]/10"
                                : "border-amber-300 text-amber-800 bg-amber-50"
                            }`}
                          >
                            {storeSub?.status === "Verified" ? "Verified" : "Pending Review"}
                          </Badge>
                        </div>
                        <h4 className="text-xs text-[#18251F] font-semibold mt-1">
                          {s.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to="/evidence"
                          className="text-xs text-[#073B2A] hover:underline px-2.5 py-1 rounded bg-[#073B2A]/5 border border-[#DDE5DC] font-medium"
                        >
                          Evidence →
                        </Link>
                        <Link
                          to={`/outlets/${s.code}`}
                          className="text-xs text-[#18251F] hover:text-[#073B2A] px-2.5 py-1 rounded bg-[#F6F1E7] border border-[#DDE5DC] font-medium"
                        >
                          Profile →
                        </Link>
                      </div>
                    </div>

                    {/* Vertical Label-Value rows */}
                    <div className="space-y-2 text-xs divide-y divide-[#DDE5DC]/60">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1.5 first:pt-0">
                        <span className="text-[#738078] font-medium shrink-0">City & Operating Model:</span>
                        <span className="text-[#18251F] sm:text-right">
                          {s.city} · <span className="font-mono text-[#738078]">{s.model}</span>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                        <span className="text-[#738078] font-medium shrink-0">Monthly Turnover:</span>
                        <span className="font-mono text-[#073B2A] font-bold sm:text-right">
                          ₹6,48,000
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                        <span className="text-[#738078] font-medium shrink-0">Extracted CCTV Photos:</span>
                        <span className="font-mono text-[#18251F] sm:text-right">
                          {storeSub?.photosCount || 8} Photos
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                        <span className="text-[#738078] font-medium shrink-0">Compliance Rating:</span>
                        <div className="sm:text-right">
                          {storeSub?.finalRating ? (
                            <span className="text-[#13845B] font-bold font-mono">
                              {storeSub.finalRating} / 10
                            </span>
                          ) : (
                            <span className="text-[#738078] font-mono">88%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
          <Card className={`${isOwner ? "lg:col-span-3" : "lg:col-span-2"} border-[#DDE5DC] bg-[#FFFDF8] shadow-sm`}>
            <CardHeader className="pb-2 border-b border-[#DDE5DC]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                    <BarChart3 className="h-4 w-4 text-[#13845B]" />
                    <span>Real Sales Trends & Revenue Performance</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-[#738078]">
                    Daily net sales turnover and transaction volume logged in PostgreSQL
                  </CardDescription>
                </div>
                <Link to="/sales" className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold">
                  View Sales →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrends || []}>
                    <defs>
                      <linearGradient id="forestSalesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#073B2A" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#073B2A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE5DC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#738078" }} stroke="#DDE5DC" />
                    <YAxis tick={{ fontSize: 11, fill: "#738078" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="#DDE5DC" />
                    <Tooltip
                      formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]}
                      contentStyle={{ backgroundColor: "#FFFDF8", borderColor: "#DDE5DC", borderRadius: 12, color: "#18251F", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#073B2A"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#forestSalesGrad)"
                      name="Net Sales (₹)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Network Risk Distribution Chart (Officer Only) */}
          {isOfficer && (
            <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
              <CardHeader className="pb-2 border-b border-[#DDE5DC]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                      <Scale className="h-4 w-4 text-[#B45309]" />
                      <span>Network Risk Distribution</span>
                    </CardTitle>
                    <CardDescription className="text-xs text-[#738078]">
                      Classification across 5 deterministic risk tiers
                    </CardDescription>
                  </div>
                  <Link to="/risk" className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold">
                    View Risk →
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
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
                        {(data?.riskDistribution || []).map((entry: any, index: number) => {
                          const brandColors = ["#13845B", "#72D6A0", "#F59E0B", "#F97316", "#E11D48"];
                          const fill = brandColors[index % brandColors.length];
                          return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                      </Pie>
                      <Tooltip formatter={(v: any, name: any) => [`${v} Outlets`, name]} contentStyle={{ backgroundColor: "#FFFDF8", borderColor: "#DDE5DC", borderRadius: 12, color: "#18251F", fontSize: 12 }} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#738078" }} />
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
        <div className="space-y-6">
          {/* Compliance Alerts */}
          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-3 border-b border-[#DDE5DC]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <span>Recent Compliance Alerts (Click to Open Case)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-[#738078]">
                    Active prioritized anomalies from PostgreSQL outlet_alerts
                  </CardDescription>
                </div>
                <Link to="/alerts" className="text-xs text-[#073B2A] hover:text-rose-700 font-semibold">
                  View All Alerts →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#DDE5DC] text-xs">
                {(data?.recentAlerts || []).map((a: any) => (
                  <div
                    key={a.id}
                    onClick={() => setAlertModalItem(a)}
                    className="p-4 hover:bg-[#F6F1E7]/50 cursor-pointer flex items-start justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#073B2A]">{a.alertId}</span>
                        <Link
                          to={`/outlets/${a.outletId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-[11px] bg-[#F6F1E7] border border-[#DDE5DC] px-2 py-0.5 rounded font-semibold text-[#18251F] hover:text-[#073B2A]"
                        >
                          {a.outletId}
                        </Link>
                        <Badge
                          className={
                            a.severity === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border-rose-200 text-[10px]"
                              : a.severity === "HIGH"
                              ? "bg-amber-50 text-amber-800 border-amber-200 text-[10px]"
                              : "bg-[#F6F1E7] text-[#738078] border-[#DDE5DC] text-[10px]"
                          }
                        >
                          {a.severity}
                        </Badge>
                      </div>
                      <p className="text-[#18251F] font-medium line-clamp-1">{a.message}</p>
                      <span className="text-[10px] text-[#738078] block">{a.priority} • {a.createdDate}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs shrink-0 text-[#073B2A] hover:bg-[#073B2A]/5 font-semibold">
                      Case →
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Corrective Actions (CAPA) */}
          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm w-full overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#DDE5DC]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                    <FileCheck2 className="h-4 w-4 text-[#13845B]" />
                    <span>Corrective Action Pipeline (CAPA)</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-[#738078] mt-0.5">
                    Statutory remediation mandates across workflow stages
                  </CardDescription>
                </div>
                <Link
                  to="/corrective-actions"
                  className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>View All CAPAs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3.5 w-full max-w-full box-border">
                {(data?.recentCapas || []).map((c: any) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-[#DDE5DC] bg-white p-4 sm:p-5 shadow-2xs w-full max-w-full box-border min-w-0 space-y-3"
                  >
                    {/* Header: CAPA ID, Outlet, Priority, Status */}
                    <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#DDE5DC] pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-[#073B2A] text-xs">
                          {c.actionId}
                        </span>
                        <Link
                          to={`/outlets/${c.outletId}`}
                          className="font-mono text-[11px] bg-[#F6F1E7] border border-[#DDE5DC] px-2 py-0.5 rounded font-semibold text-[#18251F] hover:text-[#073B2A] transition-colors inline-block"
                        >
                          {c.outletId}
                        </Link>
                        <Badge
                          className={`text-[9px] px-2 py-0.5 font-semibold ${
                            c.priority === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : c.priority === "HIGH"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-[#073B2A]/5 text-[#073B2A] border-[#073B2A]/20"
                          }`}
                        >
                          {c.priority || "MEDIUM"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            c.status === "CLOSED"
                              ? "border-[#13845B]/40 text-[#073B2A] bg-[#13845B]/10"
                              : c.status === "OVERDUE"
                              ? "border-rose-300 text-rose-700 bg-rose-50"
                              : "border-[#DDE5DC] text-[#738078] bg-[#F6F1E7]"
                          }`}
                        >
                          {c.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Vertical Description & Metadata */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[#18251F] font-semibold leading-snug">
                          {c.issue}
                        </p>
                        {c.requiredAction && (
                          <p className="text-[11px] text-[#738078] mt-1 leading-relaxed bg-[#F6F1E7]/60 p-2.5 rounded-lg border border-[#DDE5DC]">
                            {c.requiredAction}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#DDE5DC] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[#738078] font-medium">Assignee:</span>
                          <span className="text-[#18251F] font-medium">
                            {c.assignedPerson || "Unassigned"}
                          </span>
                          <span className="text-[10px] text-[#738078]">
                            (Stage: {c.currentStage})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[#738078] font-medium">Deadline:</span>
                          <div className="flex items-center gap-1 font-mono">
                            <span className="text-[#18251F]">{c.deadline}</span>
                            {c.isOverdue || c.status === "OVERDUE" ? (
                              <span className="text-[10px] font-bold text-rose-700 ml-1">
                                OVERDUE
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#738078] ml-1">
                                Active SLA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2 border-t border-[#DDE5DC] flex justify-end">
                      <Link
                        to="/corrective-actions"
                        className="text-[#073B2A] hover:text-[#13845B] text-xs font-semibold inline-flex items-center gap-1.5 bg-[#073B2A]/5 px-3 py-1.5 rounded-lg border border-[#073B2A]/15"
                      >
                        <span>Remediate Dossier</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
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
          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-2 border-b border-[#DDE5DC]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                    <BarChart3 className="h-4 w-4 text-[#13845B]" />
                    <span>Store Net Sales Trends</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-[#738078]">
                    Daily sales turnover logged for {userOutlet}
                  </CardDescription>
                </div>
                <Link to="/sales" className="text-xs text-[#073B2A] hover:text-[#13845B] font-semibold">
                  Full Sales Register →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.salesTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DDE5DC" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#738078" }} stroke="#DDE5DC" />
                    <YAxis tick={{ fontSize: 11, fill: "#738078" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="#DDE5DC" />
                    <Tooltip
                      formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]}
                      contentStyle={{ backgroundColor: "#FFFDF8", borderColor: "#DDE5DC", borderRadius: 12, color: "#18251F", fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#13845B"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="#13845B"
                      name="Store Net Sales"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#DDE5DC] bg-[#FFFDF8] shadow-sm">
            <CardHeader className="pb-2 border-b border-[#DDE5DC]">
              <CardTitle className="text-base font-normal font-serif flex items-center gap-2 text-[#073B2A]">
                <Store className="h-4 w-4 text-[#13845B]" />
                <span>Store Operational Profile</span>
              </CardTitle>
              <CardDescription className="text-xs text-[#738078]">
                Administrative contact details and on-ground staffing
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">Store Manager</span>
                  <span className="font-semibold text-[#18251F] text-sm">{matchedStore?.manager || "Store Operator"}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#13845B]" />
                    <span>Active Staff</span>
                  </span>
                  <span className="font-semibold text-[#18251F] text-sm">{matchedStore?.activeStaff || 14} Employees</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#738078] block">Registered Email</span>
                  <span className="font-mono text-[#073B2A] font-medium">{matchedStore?.email || "store.lucknow@aurafoods.com"}</span>
                </div>
                <Link
                  to={`/outlets/${userOutlet}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#073B2A] hover:bg-[#05291F] text-white font-semibold text-xs transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#DDE5DC] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-[#18251F]">
            <div className="flex items-start justify-between border-b border-[#DDE5DC] pb-3">
              <div>
                <span className="font-mono font-bold text-rose-700 text-xs">{riskModalOutlet.outletId}</span>
                <h3 className="text-base font-normal font-serif text-[#073B2A]">
                  {riskModalOutlet.name} — Risk Engine Breakdown
                </h3>
              </div>
              <button
                onClick={() => setRiskModalOutlet(null)}
                className="text-[#738078] hover:text-[#18251F] cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC]">
                <span className="text-[#18251F] font-medium">Deterministic Multi-Factor Score:</span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  {riskModalOutlet.riskScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC]">
                <span className="text-[#18251F] font-medium">Audited Compliance Adherence:</span>
                <span className="font-mono font-bold text-[#13845B] text-sm">
                  {riskModalOutlet.complianceScore}%
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRiskModalOutlet(null)}
                className="text-xs border-[#DDE5DC] bg-white text-[#18251F]"
              >
                Close Breakdown
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DRILLDOWN MODAL: Alert Item Details */}
      {alertModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#DDE5DC] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-[#18251F]">
            <div className="flex items-start justify-between border-b border-[#DDE5DC] pb-3">
              <div>
                <span className="font-mono font-bold text-[#073B2A] text-xs">
                  {alertModalItem.alertId}
                </span>
                <h3 className="text-base font-normal font-serif text-[#073B2A]">
                  {alertModalItem.type || "Compliance Anomaly"}
                </h3>
              </div>
              <button
                onClick={() => setAlertModalItem(null)}
                className="text-[#738078] hover:text-[#18251F] cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[#18251F] leading-relaxed">{alertModalItem.message}</p>
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAlertModalItem(null)}
                className="text-xs border-[#DDE5DC] bg-white text-[#18251F]"
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
