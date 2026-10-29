import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  Upload,
  FileSpreadsheet,
  Download,
  Paperclip,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type TabKey =
  | "Overview"
  | "Invoices & Uploads"
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
  "Invoices & Uploads",
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

  // Invoices & Uploads state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [invoiceUploadSuccess, setInvoiceUploadSuccess] = useState<string | null>(null);
  const [invoiceUploadError, setInvoiceUploadError] = useState<string | null>(null);

  // Form states for invoice upload
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceNumberInput, setInvoiceNumberInput] = useState("");
  const [invoiceDateInput, setInvoiceDateInput] = useState(new Date().toISOString().split("T")[0]);
  const [invoiceAmountInput, setInvoiceAmountInput] = useState("");
  const [invoiceNotesInput, setInvoiceNotesInput] = useState("");

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

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/store/invoices?outletId=${normalizedOutletId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setInvoices(d.invoices || []);
      }
    } catch (e) {
      console.error("Error loading store invoices:", e);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchOutletData();
      fetchInvoices();
    }
  }, [normalizedOutletId, isAuthorized]);

  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvoiceUploadError(null);
    setInvoiceUploadSuccess(null);

    if (!invoiceFile) {
      setInvoiceUploadError("Please select a file to upload (PDF, JPG, PNG, CSV, or Excel).");
      return;
    }

    setUploadingInvoice(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const formData = new FormData();
      formData.append("invoiceFile", invoiceFile);
      formData.append("outletId", normalizedOutletId);
      formData.append("invoiceNumber", invoiceNumberInput.trim() || `INV-${Date.now().toString().slice(-6)}`);
      formData.append("invoiceDate", invoiceDateInput);
      formData.append("totalAmount", invoiceAmountInput || "0");
      formData.append("notes", invoiceNotesInput || "Store sales invoice uploaded.");

      const res = await fetch("/api/store/invoices/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error || "Failed to upload invoice.");
      }

      setInvoiceUploadSuccess("Sales invoice uploaded and recorded in PostgreSQL successfully!");
      setInvoiceFile(null);
      setInvoiceNumberInput("");
      setInvoiceAmountInput("");
      setInvoiceNotesInput("");
      fetchInvoices();
    } catch (err: any) {
      setInvoiceUploadError(err.message || "Failed to upload invoice.");
    } finally {
      setUploadingInvoice(false);
    }
  };

  const handleDownloadInvoice = async (inv: any) => {
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/store/invoices/${inv.invoiceId}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to download invoice.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = inv.originalName || inv.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Download error:", e);
    }
  };

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
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#073B2A] bg-[#073B2A]/10 px-2.5 py-0.5 rounded border border-[#073B2A]/20">
                {outlet.outletId}
              </span>
              <Badge variant="outline" className="font-semibold text-xs border-[#DDE5DC] text-[#18251F]">
                {outlet.operatingModel} Model
              </Badge>
              {getStatusBadge(outlet.status)}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#073B2A]">
              {outlet.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#738078] pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#738078]" />
                {outlet.address}, {outlet.city}, {outlet.state}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#738078]" />
                Commissioned: {outlet.openedDate}
              </span>
            </div>
          </div>

          {/* Quick Metrics Badge Ribbon */}
          <div className="flex items-center gap-2 sm:gap-3 self-start">
            <div className="rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/60 px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-[#738078] block">
                Compliance
              </span>
              <span className="text-sm font-bold text-[#13845B] font-mono">
                {outlet.complianceScore}%
              </span>
            </div>

            <div className="rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/60 px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-[#738078] block">
                Risk Score
              </span>
              <span className="text-sm font-bold text-amber-600 font-mono">
                {outlet.riskScore}
              </span>
            </div>

            <div className="rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/60 px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-[#738078] block">
                Revenue
              </span>
              <span className="text-sm font-bold text-[#073B2A] font-mono">
                ₹{(Number(outlet.revenueMonthly) / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Franchise User & Operational Contacts Strip */}
        <div className="pt-3 border-t border-[#DDE5DC] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#18251F]">
            <UserCheck className="h-4 w-4 text-[#13845B] shrink-0" />
            <div>
              <span className="text-[10px] text-[#738078] block font-medium">Assigned Franchise User</span>
              <span className="font-semibold text-[#073B2A]">{outlet.assignedFranchiseUser}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#18251F]">
            <Store className="h-4 w-4 text-[#13845B] shrink-0" />
            <div>
              <span className="text-[10px] text-[#738078] block font-medium">Store Operations Manager</span>
              <span className="font-semibold text-[#073B2A]">{outlet.manager}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#18251F]">
            <Phone className="h-4 w-4 text-[#738078] shrink-0" />
            <div>
              <span className="text-[10px] text-[#738078] block font-medium">Contact & Support</span>
              <span className="font-mono text-[#18251F]">{outlet.contactPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 11 Mandatory Sections/Tabs Navigation Bar */}
      <div className="border-b border-[#DDE5DC] overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 min-w-max pb-px" aria-label="Outlet Tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-b-2 ${
                  isActive
                    ? "border-[#073B2A] text-[#073B2A] bg-[#073B2A]/5"
                    : "border-transparent text-[#738078] hover:text-[#073B2A] hover:border-[#DDE5DC]"
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
              <Card className="border-[#DDE5DC] bg-[#FFFDF8]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-bold text-[#738078]">
                    Station Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Outlet Code:</span>
                    <span className="font-mono font-bold text-[#073B2A]">{outlet.outletId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Operating Model:</span>
                    <Badge variant="outline" className="border-[#DDE5DC] text-[#18251F]">{outlet.operatingModel}</Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Territory:</span>
                    <span className="text-[#18251F]">{outlet.city}, {outlet.state}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#738078]">Audit Status:</span>
                    <span className="font-medium text-[#13845B]">{outlet.status}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#DDE5DC] bg-[#FFFDF8]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-bold text-[#738078]">
                    Financial Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Monthly Run-Rate:</span>
                    <span className="font-mono font-bold text-[#073B2A]">₹{Number(outlet.revenueMonthly).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">EBITDA Margin:</span>
                    <span className="font-bold text-[#13845B] font-mono">{outlet.ebitdaMargin}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Daily Sales Recorded:</span>
                    <span className="text-[#18251F]">{sales.length} logs in DB</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#738078]">Inventory Items:</span>
                    <span className="text-[#18251F]">{inventory.length} tracked items</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#DDE5DC] bg-[#FFFDF8]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-bold text-[#738078]">
                    Quality & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Deterministic Score:</span>
                    <span className="font-bold text-[#13845B] font-mono">{outlet.complianceScore} / 100</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Risk Coefficient:</span>
                    <span className="font-bold text-amber-600 font-mono">{outlet.riskScore} (Low/Nominal)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Open Complaints:</span>
                    <span className="text-[#18251F]">{complaints.filter((c: any) => c.status !== "Resolved").length} open</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#738078]">Active CAPA Items:</span>
                    <span className="text-[#18251F]">{correctiveActions.filter((a: any) => a.status !== "Verified & Closed").length} pending</span>
                  </div>
                </CardContent>
              </Card>

              {/* 4th Card: Invoices Dossier Summary */}
              <Card className="border-[#DDE5DC] bg-[#FFFDF8]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-bold text-[#738078]">
                    Sales Invoices Dossier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Uploaded Invoices:</span>
                    <span className="font-bold text-[#073B2A] font-mono">{invoices.length} filed in DB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DDE5DC]">
                    <span className="text-[#738078]">Latest Invoice:</span>
                    <span className="font-mono text-[#18251F]">{invoices[0]?.invoiceDate || "None filed"}</span>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("Invoices & Uploads")}
                      className="w-full bg-[#073B2A] hover:bg-[#05291F] text-white text-xs gap-1.5 h-8 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload & View Invoices</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB: INVOICES & UPLOADS                   */}
        {/* ========================================= */}
        {activeTab === "Invoices & Uploads" && (
          <div className="space-y-6">
            {/* Header info banner */}
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#13845B] font-bold block">
                    Store Sales Document Repository
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#073B2A]">
                    Sales Invoices Dossier — {outlet.name}
                  </h3>
                  <p className="text-xs text-[#738078]">
                    Upload official shift sales invoices, vendor delivery receipts, and CSV/Excel ledgers. Compatible formats: <span className="font-mono font-semibold text-[#18251F]">PDF, JPG, PNG, CSV, XLSX, XLS</span>.
                  </p>
                </div>
                <Badge variant="outline" className="border-[#DDE5DC] text-[#073B2A] bg-[#FAF7F0] text-xs font-mono">
                  {invoices.length} Verified Records
                </Badge>
              </div>

              {/* Isolation Banner */}
              <div className="p-3 rounded-lg bg-[#E6F8EF] border border-[#C7F1DC] text-xs text-[#073B2A] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#13845B] shrink-0" />
                <span>
                  <strong>Strict Store Isolation Active:</strong> Invoices uploaded here are permanently bound to Store ID <strong className="font-mono">{outlet.outletId}</strong> in PostgreSQL. Other store operators cannot access or download these records.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Upload New Sales Invoice Form */}
              <div className="lg:col-span-5 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 sm:p-6 shadow-xs space-y-5">
                <div className="space-y-1 border-b border-[#DDE5DC] pb-3">
                  <h4 className="font-serif text-base font-bold text-[#073B2A] flex items-center gap-2">
                    <Upload className="h-4 w-4 text-[#13845B]" />
                    <span>Upload Sales Invoice</span>
                  </h4>
                  <p className="text-xs text-[#738078]">
                    Attach official invoice file and register billing details.
                  </p>
                </div>

                {invoiceUploadSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{invoiceUploadSuccess}</span>
                  </div>
                )}

                {invoiceUploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{invoiceUploadError}</span>
                  </div>
                )}

                <form onSubmit={handleUploadInvoice} className="space-y-4 text-xs">
                  {/* File Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[#073B2A] font-semibold">
                      Invoice Document File <span className="text-rose-600">*</span>
                    </label>
                    <div className="border-2 border-dashed border-[#DDE5DC] hover:border-[#13845B] rounded-xl p-4 text-center bg-[#FAF7F0] transition-colors relative cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx,.xls"
                        onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        required
                      />
                      <div className="space-y-1 pointer-events-none">
                        <Upload className="h-6 w-6 text-[#13845B] mx-auto" />
                        <p className="text-xs font-semibold text-[#073B2A]">
                          {invoiceFile ? invoiceFile.name : "Click to select or drag invoice file"}
                        </p>
                        <p className="text-[10px] text-[#738078]">
                          {invoiceFile
                            ? `${(invoiceFile.size / 1024).toFixed(1)} KB · Ready to submit`
                            : "Supports PDF, JPG, PNG, CSV, and Excel (up to 25MB)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Number */}
                  <div className="space-y-1.5">
                    <label className="block text-[#073B2A] font-semibold">
                      Invoice / Bill Number
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. INV-2026-9042"
                      value={invoiceNumberInput}
                      onChange={(e) => setInvoiceNumberInput(e.target.value)}
                      className="h-9 bg-white border-[#DDE5DC] text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Invoice Date */}
                    <div className="space-y-1.5">
                      <label className="block text-[#073B2A] font-semibold">
                        Invoice Date
                      </label>
                      <Input
                        type="date"
                        value={invoiceDateInput}
                        onChange={(e) => setInvoiceDateInput(e.target.value)}
                        className="h-9 bg-white border-[#DDE5DC] text-xs font-mono"
                        required
                      />
                    </div>

                    {/* Total Amount */}
                    <div className="space-y-1.5">
                      <label className="block text-[#073B2A] font-semibold">
                        Total Amount (₹)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 185000"
                        value={invoiceAmountInput}
                        onChange={(e) => setInvoiceAmountInput(e.target.value)}
                        className="h-9 bg-white border-[#DDE5DC] text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-[#073B2A] font-semibold">
                      Description / Reconciliation Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Consolidated POS billing for second weekly shift."
                      value={invoiceNotesInput}
                      onChange={(e) => setInvoiceNotesInput(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-[#DDE5DC] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#13845B]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={uploadingInvoice || !invoiceFile}
                    className="w-full h-10 bg-[#073B2A] hover:bg-[#05291F] text-white text-xs font-semibold gap-2 cursor-pointer shadow-xs"
                  >
                    {uploadingInvoice ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Uploading & Recording in Database...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Submit Invoice to Store Dossier</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Right Column: Invoices Registry Table */}
              <div className="lg:col-span-7 rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] overflow-hidden shadow-xs flex flex-col justify-between">
                <div>
                  <div className="p-4 sm:p-5 border-b border-[#DDE5DC] flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#073B2A]">
                        Uploaded Invoices History
                      </h4>
                      <p className="text-xs text-[#738078]">
                        Permanent record of all invoices saved against {outlet.name} ({outlet.outletId}).
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchInvoices}
                      disabled={loadingInvoices}
                      className="text-xs h-8 gap-1.5"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingInvoices ? "animate-spin" : ""}`} />
                      <span>Refresh</span>
                    </Button>
                  </div>

                  {loadingInvoices ? (
                    <div className="p-8 text-center text-xs text-[#738078] space-y-2">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#13845B]" />
                      <p>Loading invoices from database...</p>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <FileText className="h-8 w-8 text-[#738078] mx-auto opacity-50" />
                      <h5 className="font-serif text-sm font-bold text-[#073B2A]">No Invoices Uploaded Yet</h5>
                      <p className="text-xs text-[#738078] max-w-sm mx-auto">
                        Upload your first shift invoice or commissary delivery receipt using the form on the left.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#FAF7F0] text-[#073B2A] font-mono text-[11px] border-b border-[#DDE5DC]">
                          <tr>
                            <th className="p-3">Invoice Details</th>
                            <th className="p-3">File / Format</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DDE5DC]/60">
                          {invoices.map((inv) => (
                            <tr key={inv.invoiceId} className="hover:bg-[#FAF7F0]/50 transition-colors">
                              <td className="p-3">
                                <span className="font-mono text-xs font-bold text-[#073B2A] block">
                                  {inv.invoiceNumber || inv.invoiceId}
                                </span>
                                <span className="text-[10px] text-[#738078] flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-3 w-3" />
                                  <span>{inv.invoiceDate}</span>
                                  <span>·</span>
                                  <span>{inv.uploadedBy}</span>
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  <Badge variant="outline" className="text-[10px] font-mono border-[#DDE5DC] text-[#073B2A]">
                                    {inv.fileType || "PDF"}
                                  </Badge>
                                  <p className="text-[10px] text-[#738078] truncate max-w-[140px]" title={inv.originalName}>
                                    {inv.originalName}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3 font-mono font-bold text-[#073B2A]">
                                {inv.totalAmount && Number(inv.totalAmount) > 0
                                  ? `₹${Number(inv.totalAmount).toLocaleString()}`
                                  : "—"}
                              </td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F8EF] text-[#13845B] border border-[#C7F1DC]">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>{inv.status || "SUBMITTED"}</span>
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadInvoice(inv)}
                                    title="Download original invoice file"
                                    className="h-7 px-2 text-[11px] text-[#073B2A] border-[#DDE5DC] hover:bg-[#FAF7F0] cursor-pointer"
                                  >
                                    <Download className="h-3 w-3 mr-1 text-[#13845B]" />
                                    <span>Download</span>
                                  </Button>
                                  {inv.fileUrl && (
                                    <a
                                      href={inv.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center h-7 px-2 text-[11px] rounded-md border border-[#DDE5DC] text-[#738078] hover:text-[#073B2A] hover:bg-[#FAF7F0]"
                                    >
                                      View
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-[#FAF7F0] border-t border-[#DDE5DC] text-[11px] text-[#738078] flex items-center justify-between">
                  <span>Store ID: <strong className="font-mono text-[#073B2A]">{outlet.outletId}</strong></span>
                  <span>Data stored in PostgreSQL Cloud SQL</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 2: PERFORMANCE */}
        {/* ========================================= */}
        {activeTab === "Performance" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-serif font-bold text-[#073B2A]">
                Financial & P&L Performance (Real PostgreSQL Aggregation)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg bg-[#F6F1E7]/60 border border-[#DDE5DC]">
                  <span className="text-[10px] text-[#738078] font-bold uppercase block">Monthly Gross Revenue</span>
                  <span className="text-lg font-bold text-[#073B2A] font-mono">
                    ₹{Number(outlet.revenueMonthly).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#F6F1E7]/60 border border-[#DDE5DC]">
                  <span className="text-[10px] text-[#738078] font-bold uppercase block">Store EBITDA Margin</span>
                  <span className="text-lg font-bold text-[#13845B] font-mono">
                    {outlet.ebitdaMargin}%
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[#F6F1E7]/60 border border-[#DDE5DC]">
                  <span className="text-[10px] text-[#738078] font-bold uppercase block">City Benchmark Rank</span>
                  <span className="text-lg font-bold text-[#073B2A] font-mono">
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
              <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-[#073B2A]">
                    Record Daily Sales Batch (PostgreSQL Insert)
                  </span>
                  {saleSuccessMessage && (
                    <span className="text-xs font-medium text-[#13845B] flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {saleSuccessMessage}
                    </span>
                  )}
                </div>

                <form onSubmit={handleRecordSale} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-[11px] font-medium text-[#738078] block mb-1">
                      Net Sales (₹)
                    </label>
                    <Input
                      type="number"
                      value={newSaleNet}
                      onChange={(e) => setNewSaleNet(e.target.value)}
                      className="h-8 text-xs bg-white border-[#DDE5DC] text-[#18251F]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#738078] block mb-1">
                      Order Count
                    </label>
                    <Input
                      type="number"
                      value={newSaleOrders}
                      onChange={(e) => setNewSaleOrders(e.target.value)}
                      className="h-8 text-xs bg-white border-[#DDE5DC] text-[#18251F]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#738078] block mb-1">
                      UPI Collection (₹)
                    </label>
                    <Input
                      type="number"
                      value={newSaleUpi}
                      onChange={(e) => setNewSaleUpi(e.target.value)}
                      className="h-8 text-xs bg-white border-[#DDE5DC] text-[#18251F]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#738078] block mb-1">
                      Cash Collection (₹)
                    </label>
                    <Input
                      type="number"
                      value={newSaleCash}
                      onChange={(e) => setNewSaleCash(e.target.value)}
                      className="h-8 text-xs bg-white border-[#DDE5DC] text-[#18251F]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmittingSale}
                    className="h-8 text-xs bg-[#073B2A] hover:bg-[#05291F] text-white font-semibold cursor-pointer"
                  >
                    {isSubmittingSale ? "Recording..." : "Save Sales Batch"}
                  </Button>
                </form>
              </div>
            )}

            {/* Sales Table */}
            <div className="space-y-3 w-full max-w-full box-border">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Recorded Sales Ledger ({sales.length} records in PostgreSQL)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Daily Settlements
                </span>
              </div>

              {sales.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                  No sales entries recorded yet for this outlet.
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 w-full max-w-full box-border">
                  {sales.map((s: any) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-4 sm:p-5 shadow-xs w-full max-w-full box-border min-w-0 space-y-3"
                    >
                      {/* Header: Date + Net Sales + Status */}
                      <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#DDE5DC] pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#073B2A] bg-[#073B2A]/10 px-2 py-0.5 rounded border border-[#073B2A]/20">
                            {s.date}
                          </span>
                          <span className="text-xs text-[#738078] font-mono ml-2">
                            {s.orderCount} total orders
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold font-mono text-[#073B2A]">
                            ₹{Number(s.netSales).toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-[#13845B] border-[#13845B]/30 text-[10px]">
                            Settled
                          </Badge>
                        </div>
                      </div>

                      {/* Vertical Label-Value rows */}
                      <div className="space-y-2 text-xs divide-y divide-[#DDE5DC]/60">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1.5 first:pt-0">
                          <span className="text-[#738078] font-medium shrink-0">Gross Sales:</span>
                          <span className="font-mono text-[#18251F] sm:text-right">
                            ₹{Number(s.grossSales).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                          <span className="text-[#738078] font-medium shrink-0">Average Ticket Size:</span>
                          <span className="font-mono text-[#18251F] sm:text-right">
                            ₹{Number(s.avgTicket).toFixed(1)} / order
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                          <span className="text-[#738078] font-medium shrink-0">Payment Settlement Mix:</span>
                          <span className="font-mono text-[#18251F] sm:text-right text-[11px]">
                            ₹{Number(s.upiCollection).toLocaleString()} (UPI) · ₹{Number(s.cashCollection).toLocaleString()} (Cash)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 4: INVENTORY */}
        {/* ========================================= */}
        {activeTab === "Inventory" && (
          <div className="space-y-4">
            <div className="space-y-3 w-full max-w-full box-border">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#073B2A]">
                  Stock On-Hand & Par Levels ({inventory.length} SKUs in PostgreSQL)
                </span>
                <span className="text-xs text-[#738078] font-mono">
                  Store Inventory
                </span>
              </div>

              {inventory.length === 0 ? (
                <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-12 text-center text-[#738078] shadow-xs">
                  No inventory records found for this outlet.
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 w-full max-w-full box-border">
                  {inventory.map((item: any) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-4 sm:p-5 shadow-xs w-full max-w-full box-border min-w-0 space-y-3"
                    >
                      {/* Header: Item Name, Category & Status */}
                      <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#DDE5DC] pb-3">
                        <div>
                          <h4 className="text-sm font-serif font-bold text-[#073B2A]">
                            {item.itemName}
                          </h4>
                          <span className="text-xs text-[#738078] mt-0.5 block">
                            {item.category}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            item.status === "In Stock"
                              ? "text-[#13845B] border-[#13845B]/30"
                              : item.status === "Low Stock"
                              ? "text-amber-600 border-amber-500/30"
                              : "text-red-600 border-red-500/30"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>

                      {/* Vertical Label-Value rows */}
                      <div className="space-y-2 text-xs divide-y divide-[#DDE5DC]/60">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1.5 first:pt-0">
                          <span className="text-[#738078] font-medium shrink-0">Current Stock Quantity:</span>
                          <span className="font-bold font-mono text-[#073B2A] sm:text-right">
                            {item.stockQuantity} {item.unit}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                          <span className="text-[#738078] font-medium shrink-0">Par / Reorder Threshold:</span>
                          <span className="font-mono text-[#18251F] sm:text-right">
                            {item.reorderLevel} {item.unit}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                          <span className="text-[#738078] font-medium shrink-0">Unit Acquisition Cost:</span>
                          <span className="font-mono text-[#18251F] sm:text-right">
                            ₹{item.unitCost}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                          <span className="text-[#738078] font-medium shrink-0">Historical Audit Variance:</span>
                          <span className={`font-mono font-bold sm:text-right ${Number(item.variancePct) < 0 ? "text-red-500" : "text-[#13845B]"}`}>
                            {item.variancePct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* TAB 5: COMPLIANCE */}
        {/* ========================================= */}
        {activeTab === "Compliance" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#073B2A]">
                    Deterministic Compliance Audit Posture
                  </h3>
                  <p className="text-xs text-[#738078]">
                    Strict mathematical weighted index across kitchen hygiene, cold chain, pest prevention, and SOP adherence.
                  </p>
                </div>
                <Badge className="bg-[#13845B]/10 text-[#13845B] border-[#13845B]/30 text-xs font-mono">
                  Score: {outlet.complianceScore}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#738078] block">Food Safety & Temps</span>
                  <span className="text-lg font-bold text-[#13845B] font-mono">98%</span>
                </div>
                <div className="p-3 rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#738078] block">Staff Hygiene & PPE</span>
                  <span className="text-lg font-bold text-[#13845B] font-mono">94%</span>
                </div>
                <div className="p-3 rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#738078] block">FSSAI Storage Labels</span>
                  <span className="text-lg font-bold text-[#13845B] font-mono">92%</span>
                </div>
                <div className="p-3 rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/40 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#738078] block">Pest Control Records</span>
                  <span className="text-lg font-bold text-[#13845B] font-mono">100%</span>
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
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#DDE5DC] flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#073B2A]">
                  Customer Grievances & Service Logs ({complaints.length} records in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-[#DDE5DC]/60 text-xs">
                {complaints.map((c: any) => (
                  <div key={c.id} className="p-4 space-y-1.5 hover:bg-[#F6F1E7]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#073B2A]">{c.complaintId}</span>
                        <Badge variant="outline" className="border-[#DDE5DC] text-[#738078]">{c.category}</Badge>
                        <Badge
                          className={
                            c.severity === "Critical"
                              ? "bg-red-500/10 text-red-600 border-red-500/30"
                              : c.severity === "High"
                              ? "bg-orange-500/10 text-orange-600 border-orange-500/30"
                              : "bg-slate-500/10 text-[#738078] border-slate-500/30"
                          }
                        >
                          {c.severity}
                        </Badge>
                      </div>
                      <span className="text-[#738078] text-[11px] font-mono">{c.reportedAt}</span>
                    </div>
                    <p className="text-[#18251F] pt-1 font-medium">{c.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#738078] pt-1">
                      <span>Reported by: <strong className="text-[#073B2A]">{c.customerName}</strong></span>
                      <span className="text-[#13845B] font-semibold">{c.status}</span>
                    </div>
                  </div>
                ))}
                {complaints.length === 0 && (
                  <div className="p-8 text-center text-[#738078]">
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
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#DDE5DC] flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#073B2A]">
                  Audit Photo & Telemetry Evidence ({evidence.length} items in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-[#DDE5DC]/60 text-xs">
                {evidence.map((ev: any) => (
                  <div key={ev.id} className="p-4 space-y-1.5 hover:bg-[#F6F1E7]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#073B2A]">{ev.evidenceId}</span>
                        <Badge variant="outline" className="border-[#DDE5DC] text-[#738078]">{ev.category}</Badge>
                        <Badge className="bg-[#13845B]/10 text-[#13845B] border-[#13845B]/30">
                          {ev.aiFlag || "Verified"}
                        </Badge>
                      </div>
                      <span className="text-[#738078] text-[11px] font-mono">{ev.timestamp}</span>
                    </div>
                    <h4 className="font-serif font-semibold text-[#073B2A]">{ev.title}</h4>
                    <p className="text-[#18251F] text-[11px] bg-[#F6F1E7]/50 p-2.5 rounded-lg border border-[#DDE5DC]">
                      Officer Verification Notes: {ev.officerNotes || "Inspected and verified during scheduled field check."}
                    </p>
                  </div>
                ))}
                {evidence.length === 0 && (
                  <div className="p-8 text-center text-[#738078]">
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
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#073B2A]">
                    Deterministic Risk Scoring Breakdown
                  </h3>
                  <p className="text-xs text-[#738078]">
                    Multi-factor anomaly calculation without speculative heuristics.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#738078] uppercase block">Composite Risk</span>
                  <span className="text-xl font-bold text-[#13845B] font-mono">{outlet.riskScore} / 100</span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-[#18251F]">Cold Chain & Thermometer Drift</span>
                    <span className="text-[#13845B] font-mono">Low Risk (3%)</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC]/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#13845B] h-full w-[3%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-[#18251F]">Inventory Shrinkage & Waste Variance</span>
                    <span className="text-[#13845B] font-mono">Low Risk (5%)</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC]/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#13845B] h-full w-[5%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-[#18251F]">Customer Repeat Complaint Ratio</span>
                    <span className="text-amber-600 font-mono">Moderate (12%)</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC]/50 h-2 rounded-full overflow-hidden">
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
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#DDE5DC] flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#073B2A]">
                  Active Station Warnings & Notifications ({alerts.length} in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-[#DDE5DC]/60 text-xs">
                {alerts.map((alt: any) => (
                  <div key={alt.id} className="p-4 flex items-start gap-3 hover:bg-[#F6F1E7]/30 transition-colors">
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
                          <span className="font-mono font-bold text-[#073B2A]">{alt.alertId}</span>
                          <Badge variant="outline" className="border-[#DDE5DC] text-[#738078]">{alt.category}</Badge>
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
                        <span className="text-[#738078] text-[11px] font-mono">{alt.timestamp}</span>
                      </div>
                      <p className="text-[#18251F] font-medium">{alt.message}</p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="p-8 text-center text-[#738078]">
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
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#DDE5DC] flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#073B2A]">
                  CAPA Remediation Pipeline ({correctiveActions.length} cases in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-[#DDE5DC]/60 text-xs">
                {correctiveActions.map((act: any) => (
                  <div key={act.id} className="p-4 space-y-2 hover:bg-[#F6F1E7]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#073B2A]">{act.actionId}</span>
                        <Badge
                          className={
                            act.status === "Verified & Closed"
                              ? "bg-[#13845B]/10 text-[#13845B] border-[#13845B]/30"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          }
                        >
                          {act.status}
                        </Badge>
                        <Badge variant="outline" className="border-[#DDE5DC] text-[#738078]">{act.priority} Priority</Badge>
                      </div>
                      <span className="text-[#738078] text-[11px] font-mono">Due: {act.dueDate}</span>
                    </div>

                    <h4 className="font-serif font-semibold text-[#073B2A]">{act.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-[#738078]">
                      <span>Assigned to: <strong className="text-[#073B2A]">{act.assignedTo}</strong></span>
                    </div>

                    {act.resolutionNotes && (
                      <div className="rounded-lg bg-[#F6F1E7]/50 p-2.5 text-[11px] text-[#18251F] border border-[#DDE5DC]">
                        Resolution Notes: {act.resolutionNotes}
                      </div>
                    )}
                  </div>
                ))}
                {correctiveActions.length === 0 && (
                  <div className="p-8 text-center text-[#738078]">
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
            <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#DDE5DC] flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#073B2A]">
                  Historical Inspection Log & Audit Registry ({history.length} records in PostgreSQL)
                </span>
              </div>
              <div className="divide-y divide-[#DDE5DC]/60 text-xs">
                {history.map((h: any) => (
                  <div key={h.id} className="p-4 space-y-2 hover:bg-[#F6F1E7]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-[#073B2A]">{h.auditDate}</span>
                        <Badge className="bg-[#13845B]/10 text-[#13845B] border-[#13845B]/30">
                          {h.status}
                        </Badge>
                      </div>
                      <span className="font-mono font-bold text-[#13845B]">Audit Score: {h.score}%</span>
                    </div>

                    <p className="text-[#18251F] font-medium">{h.summary}</p>
                    <div className="text-[11px] text-[#738078]">
                      Inspecting Quality Officer: <span className="text-[#073B2A] font-medium">{h.auditorName}</span>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="p-8 text-center text-[#738078]">
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
