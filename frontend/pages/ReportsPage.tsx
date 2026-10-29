import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileBarChart,
  Search,
  RefreshCw,
  Plus,
  Download,
  Eye,
  X,
  Calendar,
  Building2,
  CheckCircle2,
  Award,
  Printer,
  ShieldCheck,
  FileText,
  DollarSign,
  Boxes,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ALL_NETWORK_STORES } from "@/utils/stores-data";

interface ReportItem {
  id: string;
  title: string;
  reportType: string;
  outletId: string;
  outletName?: string;
  outletCity?: string;
  date: string;
  author: string;
  score: number;
  status: string;
  summary: string;
  keyMetrics?: { label: string; value: string }[];
  sections?: { title: string; content: string }[];
}

interface ReportSummary {
  total: number;
  auditDossiers: number;
  inspections: number;
  financial: number;
  stockAndRisk: number;
}

const REPORT_TYPES = [
  "All Types",
  "Audit Dossier",
  "Compliance Inspection",
  "Financial & Royalty",
  "Stock & Supply Variance",
  "CAPA & Risk Intelligence",
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    total: 0,
    auditDossiers: 0,
    inspections: 0,
    financial: 0,
    stockAndRisk: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedOutlet, setSelectedOutlet] = useState("All Outlets");

  // Modals
  const [viewingReport, setViewingReport] = useState<ReportItem | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [genOutletId, setGenOutletId] = useState(
    user?.role === "FRANCHISE" ? user.assignedOutletId || "OUT-042" : "OUT-042"
  );
  const [genSummary, setGenSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (selectedType !== "All Types") params.append("type", selectedType);
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/reports?${params.toString()}`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch executed reports.");
      }
      const data = await res.json();
      setReports(data.reports || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load reports.");
      // Resilient fallback for preview/offline
      setReports((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: "REP-AUDIT-1",
            title: "QSR Operational & Hygiene Audit Report (OUT-042)",
            reportType: "Audit Dossier",
            outletId: "OUT-042",
            outletName: "Hazratganj Flagship",
            outletCity: "Lucknow",
            date: "2026-09-15",
            author: "Karan Singhal (Lead Inspector)",
            score: 96,
            status: "Passed - Grade A",
            summary: "Full compliance with corporate QSR hygiene standards. Clean pest traps and calibrated chillers.",
            keyMetrics: [
              { label: "Audit Score", value: "96/100" },
              { label: "Status Tier", value: "Passed - Grade A" },
              { label: "Lead Auditor", value: "Karan Singhal (Lead Inspector)" },
            ],
            sections: [
              { title: "Executive Overview", content: "Full compliance with corporate QSR hygiene benchmark. Zero critical non-conformances." },
              { title: "Cold Chain Verification", content: "Chillers operating within target 1°C - 4°C parameters." },
            ],
          },
          {
            id: "REP-INS-1",
            title: "Store Quality & Food Safety Inspection (OUT-042)",
            reportType: "Compliance Inspection",
            outletId: "OUT-042",
            outletName: "Hazratganj Flagship",
            outletCity: "Lucknow",
            date: "2026-09-28",
            author: "Ananya Roy (Senior Quality Auditor)",
            score: 92,
            status: "Verified Compliant",
            summary: "Secondary raw burger chiller unit was operating at 5.8°C during peak prep shift, above the required 4.0°C threshold. Rectified on revisit.",
            keyMetrics: [
              { label: "Category", value: "Hygiene" },
              { label: "Severity", value: "MEDIUM" },
              { label: "Workflow Status", value: "VERIFIED" },
            ],
            sections: [
              { title: "Primary Observation", content: "Secondary raw burger chiller unit was operating at 5.8°C during peak prep shift." },
              { title: "Remediation", content: "Compressor coil cleansed; temperature stabilized at 3.2°C." },
            ],
          },
        ];
      });
      setSummary((prev) => prev.total > 0 ? prev : {
        total: 2,
        auditDossiers: 1,
        inspections: 1,
        financial: 0,
        stockAndRisk: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedType, selectedOutlet]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All Types");
    setSelectedOutlet("All Outlets");
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          outletId: genOutletId,
          summary: genSummary.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate report.");
      }

      const data = await res.json();
      setGenerateModalOpen(false);
      setGenSummary("");
      setSuccessToast(data.message || "Audit report executed and archived successfully.");
      setTimeout(() => setSuccessToast(null), 3500);
      fetchReports();
    } catch (err: any) {
      alert(err.message || "Report generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportJson = (report: ReportItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${report.id}_dossier.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Audit Dossier":
        return <Award className="h-4 w-4 text-emerald-500" />;
      case "Compliance Inspection":
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case "Financial & Royalty":
        return <DollarSign className="h-4 w-4 text-indigo-500" />;
      case "Stock & Supply Variance":
        return <Boxes className="h-4 w-4 text-amber-500" />;
      case "CAPA & Risk Intelligence":
        return <Flame className="h-4 w-4 text-rose-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Audit Dossier":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
            Audit Dossier
          </Badge>
        );
      case "Compliance Inspection":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px] font-bold">
            Compliance Inspection
          </Badge>
        );
      case "Financial & Royalty":
        return (
          <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 text-[10px] font-bold">
            Financial & Royalty
          </Badge>
        );
      case "Stock & Supply Variance":
        return (
          <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
            Stock & Supply
          </Badge>
        );
      case "CAPA & Risk Intelligence":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px] font-bold">
            CAPA & Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {type}
          </Badge>
        );
    }
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedType !== "All Types" || selectedOutlet !== "All Outlets";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 text-white px-4 py-3 shadow-xl text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
              <FileBarChart className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive & Audit Reports Registry
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Certified walkthrough inspections, quarterly royalty reconciliation ledgers, and cold-chain compliance dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setGenerateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Reports</span>
            <FileBarChart className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {summary.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Executed audit records</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Audit Walkthroughs</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.auditDossiers}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Certified store grades</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Quality Inspections</span>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.inspections}
          </div>
          <p className="text-[11px] text-blue-600/80 mt-0.5">Safety & observation logs</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Financial & Stock Ledgers</span>
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {summary.financial + summary.stockAndRisk}
          </div>
          <p className="text-[11px] text-indigo-600/80 mt-0.5">Royalty & stock audits</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search reports by ID, title, auditor, or outlet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            />
          </form>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Report Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Outlet Selector */}
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All Outlets">All Outlets</option>
              {ALL_NETWORK_STORES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white h-9 px-2.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Executed Audit & Compliance Ledgers
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {reports.length} available
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Export or inspect full certified dossiers
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-500" />
            <p>Loading reports registry from database...</p>
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileBarChart className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                No Reports Available
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No executed reports match your active filter criteria. Try adjusting your search."
                  : "Zero reports are currently stored in this registry."}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              {hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={clearFilters} className="text-xs">
                  Reset Filter Settings
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setGenerateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Generate First Report</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 p-4 w-full max-w-full box-border">
            {reports.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 w-full max-w-full box-border min-w-0 space-y-3"
              >
                {/* Header: Report ID, Title, Status & Score */}
                <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        {r.id}
                      </span>
                      {getTypeBadge(r.reportType)}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
                        <CheckCircle2 className="h-3 w-3" />
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {getTypeIcon(r.reportType)}
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {r.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Score</span>
                    <span className="font-extrabold font-mono text-base text-slate-900 dark:text-white">
                      {r.score}%
                    </span>
                  </div>
                </div>

                {/* Vertical Label-Value rows */}
                <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* Outlet Scope */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1.5 first:pt-0">
                    <span className="text-slate-400 font-medium shrink-0">Store Outlet / Scope:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 sm:text-right">
                      {r.outletName || r.outletId}{" "}
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({r.outletId !== "ALL" ? r.outletId : "Network Wide"} · {r.outletCity})
                      </span>
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                    <span className="text-slate-400 font-medium shrink-0">Execution Date:</span>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 sm:justify-end">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-mono">{r.date}</span>
                    </div>
                  </div>

                  {/* Auditor */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                    <span className="text-slate-400 font-medium shrink-0">Lead Auditor / Service:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 sm:text-right">
                      {r.author}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingReport(r)}
                    className="h-8 px-3 text-xs gap-1.5 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Dossier</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportJson(r)}
                    title="Download Dossier JSON"
                    className="h-8 px-3 text-xs gap-1.5 text-slate-700 hover:text-slate-900 dark:text-slate-300 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export JSON</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEW REPORT DOSSIER MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {viewingReport.id}
                  </span>
                  {getTypeBadge(viewingReport.reportType)}
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                  {viewingReport.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingReport.outletName} · {viewingReport.date} · Certified by {viewingReport.author}
                </p>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Benchmark Score
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {viewingReport.score}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Certification Status
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {viewingReport.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Lead Auditor
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {viewingReport.author}
                </span>
              </div>
            </div>

            {/* Additional Metrics if present */}
            {viewingReport.keyMetrics && viewingReport.keyMetrics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {viewingReport.keyMetrics.map((km, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex items-center gap-1.5"
                  >
                    <span className="text-slate-400">{km.label}:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{km.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Block */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Executive Audit Summary
              </label>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {viewingReport.summary}
              </div>
            </div>

            {/* Sections */}
            {viewingReport.sections && viewingReport.sections.length > 0 && (
              <div className="space-y-3">
                {viewingReport.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/20 text-xs space-y-1"
                  >
                    <span className="font-bold text-slate-900 dark:text-white">{sec.title}</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportJson(viewingReport)}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download JSON Dossier</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Dossier</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewingReport(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE REPORT MODAL */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  On-Demand Audit Compiler
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Generate Store Audit Report
                </h3>
              </div>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Target Store Outlet
                </label>
                <select
                  value={genOutletId}
                  onChange={(e) => setGenOutletId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                  required
                >
                  {ALL_NETWORK_STORES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Audit Summary & Focus Area (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Q4 comprehensive walkthrough inspection. Walk-in chiller and secondary line sanitation verified."
                  value={genSummary}
                  onChange={(e) => setGenSummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Leave empty to compile standard operational and food safety audit summary.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGenerateModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5 shadow-xs"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Compiling Dossier...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Execute & Save Report</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
