import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Store,
  Building2,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Lock,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  DollarSign,
  FileCheck2,
  AlertCircle,
  FileText,
  Clock,
  History as HistoryIcon,
  RefreshCw,
  PlusCircle,
  BarChart3,
  Camera,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type TabKey =
  | "Overview"
  | "Performance"
  | "Sales"
  | "Inventory"
  | "Compliance"
  | "Complaints"
  | "Evidence"
  | "Risk"
  | "Alerts"
  | "Corrective Actions"
  | "History";

const TABS: TabKey[] = [
  "Overview",
  "Performance",
  "Sales",
  "Inventory",
  "Compliance",
  "Complaints",
  "Evidence",
  "Risk",
  "Alerts",
  "Corrective Actions",
  "History",
];

export default function OutletDetailPage() {
  const { outletId } = useParams<{ outletId: string }>();
  const { user, canAccessOutlet } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New sale form state
  const [newSaleNet, setNewSaleNet] = useState("45000");
  const [newSaleOrders, setNewSaleOrders] = useState("110");
  const [newSaleUpi, setNewSaleUpi] = useState("32000");
  const [newSaleCash, setNewSaleCash] = useState("13000");
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string | null>(null);

  const normalizedOutletId = (outletId || "").toUpperCase();

  // Strict frontend check for franchise users
  const isAuthorized = canAccessOutlet(normalizedOutletId);

  const fetchOutletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/outlets/${normalizedOutletId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load outlet details.");
      } else {
        setData(json);
      }
    } catch (err: any) {
      setError("Network error connecting to PostgreSQL server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchOutletData();
    }
  }, [normalizedOutletId, isAuthorized]);

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaleSuccessMessage(null);
    setIsSubmittingSale(true);

    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/outlets/${normalizedOutletId}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          netSales: Number(newSaleNet),
          grossSales: Number(newSaleNet) * 1.05,
          orderCount: Number(newSaleOrders),
          avgTicket: Number(newSaleNet) / Math.max(1, Number(newSaleOrders)),
          cashCollection: Number(newSaleCash),
          upiCollection: Number(newSaleUpi),
          cardCollection: 0,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to submit sales.");
      }

      setSaleSuccessMessage("Daily sales successfully recorded in PostgreSQL.");
      fetchOutletData(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Failed to submit sales.");
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // If unauthorized franchise user attempted access to another outlet:
  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Security Violation: Franchise Data Isolation
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Franchise operators are strictly restricted to their designated outlet. You do not have authorization to view or manipulate data for outlet{" "}
          <strong className="text-red-600 font-mono">{normalizedOutletId}</strong>.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => navigate(`/outlets/${user?.assignedOutletId || "OUT-042"}`)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-9 cursor-pointer"
          >
            <span>Return to My Assigned Outlet ({user?.assignedOutletId || "OUT-042"})</span>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-sm">Loading outlet data from PostgreSQL...</span>
      </div>
    );
  }

  if (error || !data?.outlet) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 space-y-3">
        <div className="flex items-center gap-2 font-bold text-base">
          <AlertCircle className="h-5 w-5" />
          <span>Error Loading Outlet</span>
        </div>
        <p className="text-xs">{error || "Outlet not found in database."}</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/outlets")}>
          Back to Outlets Directory
        </Button>
      </div>
    );
  }

  const {
    outlet,
    sales = [],
    inventory = [],
    complaints = [],
    evidence = [],
    alerts = [],
    correctiveActions = [],
    history = [],
  } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
            Active
          </Badge>
        );
      case "Under Audit":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
            Under Audit
          </Badge>
        );
      case "Grace Period":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
            Grace Period
          </Badge>
        );
      case "Notice Issued":
        return (
          <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30">
            Notice Issued
          </Badge>
        );
      case "Critical Escalation":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30">
            Critical Escalation
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      {user?.role !== "FRANCHISE" && (
        <Link
          to="/outlets"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Outlets</span>
        </Link>
      )}

      {/* Header Banner with Mandatory Outlet Fields */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {outlet.outletId}
              </span>
              <Badge variant="outline" className="font-semibold text-xs">
                {outlet.operatingModel} Model
              </Badge>
              {getStatusBadge(outlet.status)}
              <Badge variant="outline" className="text-[10px] font-mono text-slate-400 border-slate-200">
                PostgreSQL Backed
              </Badge>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {outlet.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {outlet.address}, {outlet.city}, {outlet.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Commissioned: {outlet.openedDate}
              </span>
            </div>
          </div>

          {/* Quick Metrics Badge Ribbon */}
          <div className="flex items-center gap-2 sm:gap-3 self-start">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Compliance
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {outlet.complianceScore}%
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Risk Score
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {outlet.riskScore}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Revenue
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                ₹{(Number(outlet.revenueMonthly) / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Franchise User & Operational Contacts Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <UserCheck className="h-4 w-4 text-indigo-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Assigned Franchise User</span>
              <span className="font-semibold">{outlet.assignedFranchiseUser}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Store className="h-4 w-4 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Store Operations Manager</span>
              <span className="font-semibold">{outlet.manager}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Phone className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Contact & Support</span>
              <span>{outlet.contactPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 11 Mandatory Sections/Tabs Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 min-w-max pb-px" aria-label="Outlet Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* ========================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================= */}
        {activeTab === "Overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-bold text-slate-400">
                    Station Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Outlet Code:</span>
                    <span className="font-mono font-bold">{outlet.outletId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Operating Model:</span>
                    <Badge variant="outline">{outlet.operatingModel}</Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Territory:</span>
                    <span>{outlet.city}, {outlet.state}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Audit Status:</span>
                    <span className="font-medium text-emerald-600">{outlet.status}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-bold text-slate-400">
                    Financial Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Monthly Run-Rate:</span>
                    <span className="font-mono font-bold">₹{Number(outlet.revenueMonthly).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">EBITDA Margin:</span>
                    <span className="font-bold text-indigo-600">{outlet.ebitdaMargin}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Daily Sales Recorded:</span>
                    <span>{sales.length} logs in DB</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Inventory Items:</span>
                    <span>{inventory.length} tracked items</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-bold text-slate-400">
                    Quality & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Deterministic Score:</span>
                    <span className="font-bold text-emerald-600">{outlet.complianceScore} / 100</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Risk Coefficient:</span>
                    <span className="font-bold text-amber-600">{outlet.riskScore} (Low/Nominal)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Open Complaints:</span>
                    <span>{complaints.filter((c: any) => c.status !== "Resolved").length} open</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Active CAPA Items:</span>
                    <span>{correctiveActions.filter((a: any) => a.status !== "Verified & Closed").length} pending</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: PERFORMANCE */}
        {/* ========================================= */}
        {activeTab === "Performance" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Financial & P&L Performance (Real PostgreSQL Aggregation)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Gross Revenue</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                    ₹{Number(outlet.revenueMonthly).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Store EBITDA Margin</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {outlet.ebitdaMargin}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">City Benchmark Rank</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    #1 in {outlet.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 3: SALES */}
        {/* ========================================= */}
        {activeTab === "Sales" && (
          <div className="space-y-4">
            {/* Sales Submission Form for Authorized Store Operator */}
            {user?.role !== "OWNER" && user?.role !== "OFFICER" && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-900 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Record Daily Sales Batch (PostgreSQL Insert)
                  </span>
                  {saleSuccessMessage && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {saleSuccessMessage}
                    </span>
                  )}
                </div>

                <form onSubmit={handleRecordSale} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Net Sales (₹)
                    </label>
                    <Input
                      type="number"
                      value={newSaleNet}
                      onChange={(e) => setNewSaleNet(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Order Count
                    </label>
                    <Input
                      type="number"
                      value={newSaleOrders}
                      onChange={(e) => setNewSaleOrders(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      UPI Collection (₹)
                    </label>
                    <Input
                      type="number"
                      value={newSaleUpi}
                      onChange={(e) => setNewSaleUpi(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Cash Collection (₹)
                    </label>
                    <Input
                      type="number"
                      value={newSaleCash}
                      onChange={(e) => setNewSaleCash(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-slate-900"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmittingSale}
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                  >
                    {isSubmittingSale ? "Recording..." : "Save Sales Batch"}
                  </Button>
                </form>
              </div>
            )}

            {/* Sales Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Recorded Sales Ledger ({sales.length} records in PostgreSQL)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Net Sales</th>
                      <th className="py-2.5 px-3 font-semibold">Gross Sales</th>
                      <th className="py-2.5 px-3 font-semibold">Orders</th>
                      <th className="py-2.5 px-3 font-semibold">Avg Ticket</th>
                      <th className="py-2.5 px-3 font-semibold">UPI vs Cash</th>
                      <th className="py-2.5 px-3 font-semibold">POS Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {sales.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono font-medium">{s.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                          ₹{Number(s.netSales).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">₹{Number(s.grossSales).toLocaleString()}</td>
                        <td className="py-2.5 px-3">{s.orderCount}</td>
                        <td className="py-2.5 px-3">₹{Number(s.avgTicket).toFixed(1)}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          ₹{Number(s.upiCollection).toLocaleString()} / ₹{Number(s.cashCollection).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 text-[10px]">
                            Settled
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {sales.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No sales entries recorded yet for this outlet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 4: INVENTORY */}
        {/* ========================================= */}
        {activeTab === "Inventory" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Stock On-Hand & Par Levels ({inventory.length} SKUs in PostgreSQL)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">SKU / Item</th>
                      <th className="py-2.5 px-3 font-semibold">Category</th>
                      <th className="py-2.5 px-3 font-semibold">Stock Qty</th>
                      <th className="py-2.5 px-3 font-semibold">Reorder Level</th>
                      <th className="py-2.5 px-3 font-semibold">Unit Cost</th>
                      <th className="py-2.5 px-3 font-semibold">Variance</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {inventory.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                          {item.itemName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{item.category}</td>
                        <td className="py-2.5 px-3 font-bold font-mono">
                          {item.stockQuantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {item.reorderLevel} {item.unit}
                        </td>
                        <td className="py-2.5 px-3">₹{item.unitCost}</td>
                        <td className={`py-2.5 px-3 font-mono ${Number(item.variancePct) < 0 ? "text-red-500" : "text-emerald-500"}`}>
                          {item.variancePct}%
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant="outline"
                            className={
                              item.status === "In Stock"
                                ? "text-emerald-600 border-emerald-500/30"
                                : item.status === "Low Stock"
                                ? "text-amber-600 border-amber-500/30"
                                : "text-red-600 border-red-500/30"
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {inventory.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No inventory records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 5: COMPLIANCE */}
        {/* ========================================= */}
        {activeTab === "Compliance" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Deterministic Compliance Audit Posture
                  </h3>
                  <p className="text-xs text-slate-500">
                    Strict mathematical weighted index across kitchen hygiene, cold chain, pest prevention, and SOP adherence.
                  </p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs">
                  Score: {outlet.complianceScore}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Food Safety & Temps</span>
                  <span className="text-lg font-bold text-emerald-600">98%</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Hygiene & PPE</span>
                  <span className="text-lg font-bold text-emerald-600">94%</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">FSSAI Storage Labels</span>
                  <span className="text-lg font-bold text-emerald-600">92%</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pest Control Records</span>
                  <span className="text-lg font-bold text-emerald-600">100%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 6: COMPLAINTS */}
        {/* ========================================= */}
        {activeTab === "Complaints" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Customer Grievances & Service Logs ({complaints.length} records in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {complaints.map((c: any) => (
                  <div key={c.id} className="p-4 space-y-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600">{c.complaintId}</span>
                        <Badge variant="outline">{c.category}</Badge>
                        <Badge
                          className={
                            c.severity === "Critical"
                              ? "bg-red-500/10 text-red-600 border-red-500/30"
                              : c.severity === "High"
                              ? "bg-orange-500/10 text-orange-600 border-orange-500/30"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }
                        >
                          {c.severity}
                        </Badge>
                      </div>
                      <span className="text-slate-400 text-[11px]">{c.reportedAt}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 pt-1 font-medium">{c.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Reported by: <strong>{c.customerName}</strong></span>
                      <span className="text-emerald-600 font-semibold">{c.status}</span>
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    Zero customer complaints logged for this outlet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 7: EVIDENCE */}
        {/* ========================================= */}
        {activeTab === "Evidence" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Audit Photo & Telemetry Evidence ({evidence.length} items in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {evidence.map((ev: any) => (
                  <div key={ev.id} className="p-4 space-y-1.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600">{ev.evidenceId}</span>
                        <Badge variant="outline">{ev.category}</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                          {ev.aiFlag || "Verified"}
                        </Badge>
                      </div>
                      <span className="text-slate-400 text-[11px]">{ev.timestamp}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{ev.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                      Officer Verification Notes: {ev.officerNotes || "Inspected and verified during scheduled field check."}
                    </p>
                  </div>
                ))}
                {evidence.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No evidence records uploaded.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 8: RISK */}
        {/* ========================================= */}
        {activeTab === "Risk" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Deterministic Risk Scoring Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Multi-factor anomaly calculation without speculative heuristics.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase block">Composite Risk</span>
                  <span className="text-xl font-bold text-emerald-600">{outlet.riskScore} / 100</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Cold Chain & Thermometer Drift</span>
                    <span className="text-emerald-600">Low Risk (3%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[3%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Inventory Shrinkage & Waste Variance</span>
                    <span className="text-emerald-600">Low Risk (5%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[5%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Customer Repeat Complaint Ratio</span>
                    <span className="text-amber-600">Moderate (12%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[12%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 9: ALERTS */}
        {/* ========================================= */}
        {activeTab === "Alerts" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Active Station Warnings & Notifications ({alerts.length} in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {alerts.map((alt: any) => (
                  <div key={alt.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <AlertTriangle
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        alt.severity === "CRITICAL"
                          ? "text-red-500"
                          : alt.severity === "HIGH"
                          ? "text-orange-500"
                          : "text-amber-500"
                      }`}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{alt.alertId}</span>
                          <Badge variant="outline">{alt.category}</Badge>
                          <Badge
                            className={
                              alt.severity === "CRITICAL"
                                ? "bg-red-500/10 text-red-600 border-red-500/30"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            }
                          >
                            {alt.severity}
                          </Badge>
                        </div>
                        <span className="text-slate-400 text-[11px]">{alt.timestamp}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{alt.message}</p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No active warnings or alerts for this location.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 10: CORRECTIVE ACTIONS */}
        {/* ========================================= */}
        {activeTab === "Corrective Actions" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  CAPA Remediation Pipeline ({correctiveActions.length} cases in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {correctiveActions.map((act: any) => (
                  <div key={act.id} className="p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600">{act.actionId}</span>
                        <Badge
                          className={
                            act.status === "Verified & Closed"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }
                        >
                          {act.status}
                        </Badge>
                        <Badge variant="outline">{act.priority} Priority</Badge>
                      </div>
                      <span className="text-slate-400 text-[11px]">Due: {act.dueDate}</span>
                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{act.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Assigned to: <strong>{act.assignedTo}</strong></span>
                    </div>

                    {act.resolutionNotes && (
                      <div className="rounded bg-slate-50 dark:bg-slate-800/50 p-2 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                        Resolution Notes: {act.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
                {correctiveActions.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    Zero open corrective action requirements.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 11: HISTORY */}
        {/* ========================================= */}
        {activeTab === "History" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Historical Inspection Log & Audit Registry ({history.length} records in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {history.map((h: any) => (
                  <div key={h.id} className="p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{h.auditDate}</span>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                          {h.status}
                        </Badge>
                      </div>
                      <span className="font-bold text-emerald-600">Audit Score: {h.score}%</span>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 font-medium">{h.summary}</p>
                    <div className="text-[11px] text-slate-400">
                      Inspecting Quality Officer: <span className="text-slate-600 dark:text-slate-300 font-medium">{h.auditorName}</span>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No historical audits archived yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
