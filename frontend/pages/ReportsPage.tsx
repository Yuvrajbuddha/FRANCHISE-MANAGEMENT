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
        return <Award className="h-4 w-4 text-[#059669]" />;
      case "Compliance Inspection":
        return <ShieldCheck className="h-4 w-4 text-[#059669]" />;
      case "Financial & Royalty":
        return <DollarSign className="h-4 w-4 text-[#059669]" />;
      case "Stock & Supply Variance":
        return <Boxes className="h-4 w-4 text-[#059669]" />;
      case "CAPA & Risk Intelligence":
        return <Flame className="h-4 w-4 text-[#059669]" />;
      default:
        return <FileText className="h-4 w-4 text-[#059669]" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Audit Dossier":
        return (
          <Badge className="bg-[#ECFDF5] text-[#064E3B] border-[#A7F3D0] text-[10px] font-bold">
            Audit Dossier
          </Badge>
        );
      case "Compliance Inspection":
        return (
          <Badge className="bg-[#F0FDF4] text-[#047857] border-[#D1FAE5] text-[10px] font-bold">
            Compliance Inspection
          </Badge>
        );
      case "Financial & Royalty":
        return (
          <Badge className="bg-[#E6F4EA] text-[#064E3B] border-[#B7E1CD] text-[10px] font-bold">
            Financial & Royalty
          </Badge>
        );
      case "Stock & Supply Variance":
        return (
          <Badge className="bg-[#F0FDF4] text-[#065F46] border-[#D1FAE5] text-[10px] font-bold">
            Stock & Supply
          </Badge>
        );
      case "CAPA & Risk Intelligence":
        return (
          <Badge className="bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] text-[10px] font-bold">
            CAPA & Risk
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] border-[#D1FAE5] text-[#064E3B] bg-white">
            {type}
          </Badge>
        );
    }
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedType !== "All Types" || selectedOutlet !== "All Outlets";

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] bg-[#F0FDF4] space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#064E3B] border border-[#0D4E39] text-white px-4 py-3 shadow-xl text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-[#72D6A0]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1FAE5]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#059669] border border-[#D1FAE5] shadow-xs">
              <FileBarChart className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#064E3B]">
              Audit & Compliance Reports Registry
            </h1>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Certified walkthrough inspections, quarterly royalty reconciliation ledgers, and cold-chain compliance dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
            className="bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] hover:border-[#059669] text-xs gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setGenerateModalOpen(true)}
            className="bg-[#059669] hover:bg-[#047857] text-white text-xs gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Report</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#D1FAE5] bg-white p-4 shadow-xs hover:border-[#A7F3D0] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Reports</span>
            <FileBarChart className="h-4 w-4 text-[#059669]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#064E3B]">
            {summary.total}
          </div>
          <p className="text-[11px] text-[#64748B] mt-0.5">Executed audit records</p>
        </div>

        <div className="rounded-2xl border border-[#D1FAE5] bg-white p-4 shadow-xs hover:border-[#A7F3D0] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Audit Walkthroughs</span>
            <Award className="h-4 w-4 text-[#059669]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#064E3B]">
            {summary.auditDossiers}
          </div>
          <p className="text-[11px] text-[#059669] font-medium mt-0.5">Certified store grades</p>
        </div>

        <div className="rounded-2xl border border-[#D1FAE5] bg-white p-4 shadow-xs hover:border-[#A7F3D0] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Quality Inspections</span>
            <ShieldCheck className="h-4 w-4 text-[#059669]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#064E3B]">
            {summary.inspections}
          </div>
          <p className="text-[11px] text-[#059669] font-medium mt-0.5">Safety & observation logs</p>
        </div>

        <div className="rounded-2xl border border-[#D1FAE5] bg-white p-4 shadow-xs hover:border-[#A7F3D0] transition-colors">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Financial & Stock Ledgers</span>
            <DollarSign className="h-4 w-4 text-[#059669]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#064E3B]">
            {summary.financial + summary.stockAndRisk}
          </div>
          <p className="text-[11px] text-[#059669] font-medium mt-0.5">Royalty & stock audits</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#D1FAE5] bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#059669]" />
            <Input
              type="text"
              placeholder="Search reports by ID, title, auditor, or outlet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-white border-[#D1FAE5] text-[#1F2937] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#059669] focus-visible:border-[#059669]"
            />
          </form>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Report Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-xl border border-[#D1FAE5] bg-white text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] cursor-pointer"
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
              className="h-9 px-2.5 text-xs rounded-xl border border-[#D1FAE5] bg-white text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] cursor-pointer"
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
                className="text-xs text-[#64748B] hover:text-[#064E3B] h-9 px-2.5 cursor-pointer"
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
        <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-4 text-xs text-[#991B1B] flex items-center gap-2.5 shadow-2xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626]" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Reports Table Container */}
      <div className="rounded-2xl border border-[#D1FAE5] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#D1FAE5] bg-[#F0FDF4]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
              Executed Audit & Compliance Ledgers
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-[#D1FAE5] text-[#064E3B] bg-white">
              {reports.length} available
            </Badge>
          </div>
          <span className="text-[11px] text-[#64748B] hidden sm:inline">
            Export or inspect full certified dossiers
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-2">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#059669]" />
            <p>Loading reports registry from database...</p>
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[#F0FDF4] border border-[#D1FAE5] text-[#059669] flex items-center justify-center mx-auto">
              <FileBarChart className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-[#064E3B]">
                No Reports Available
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No executed reports match your active filter criteria. Try adjusting your search."
                  : "Zero reports are currently stored in this registry."}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              {hasActiveFilters ? (
                <Button size="sm" variant="outline" onClick={clearFilters} className="bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] text-xs">
                  Reset Filter Settings
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setGenerateModalOpen(true)}
                  className="bg-[#059669] hover:bg-[#047857] text-white text-xs gap-1.5 shadow-xs transition-colors"
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
                className="rounded-xl border border-[#D1FAE5] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#A7F3D0] transition-all w-full max-w-full box-border min-w-0 space-y-3"
              >
                {/* Header: Report ID, Title, Status & Score */}
                <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#D1FAE5] pb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#064E3B] bg-[#F0FDF4] px-2.5 py-0.5 rounded-lg border border-[#D1FAE5]">
                        {r.id}
                      </span>
                      {getTypeBadge(r.reportType)}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#064E3B] border border-[#D1FAE5]">
                        <CheckCircle2 className="h-3 w-3 text-[#059669]" />
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {getTypeIcon(r.reportType)}
                      <h4 className="font-semibold text-[#064E3B] text-sm">
                        {r.title}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[#64748B] block">Audit Score</span>
                    <span className="font-extrabold font-mono text-base text-[#064E3B]">
                      {r.score}%
                    </span>
                  </div>
                </div>

                {/* Vertical Label-Value rows */}
                <div className="space-y-2 text-xs divide-y divide-[#E6F4EA]">
                  {/* Outlet Scope */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1.5 first:pt-0">
                    <span className="text-[#64748B] font-medium shrink-0">Store Outlet / Scope:</span>
                    <span className="font-medium text-[#1F2937] sm:text-right">
                      {r.outletName || r.outletId}{" "}
                      <span className="text-[11px] text-[#64748B] font-mono">
                        ({r.outletId !== "ALL" ? r.outletId : "Network Wide"} · {r.outletCity})
                      </span>
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                    <span className="text-[#64748B] font-medium shrink-0">Execution Date:</span>
                    <div className="flex items-center gap-1.5 text-[#1F2937] sm:justify-end">
                      <Calendar className="h-3.5 w-3.5 text-[#059669]" />
                      <span className="font-mono">{r.date}</span>
                    </div>
                  </div>

                  {/* Auditor */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                    <span className="text-[#64748B] font-medium shrink-0">Lead Auditor / Service:</span>
                    <span className="font-medium text-[#1F2937] sm:text-right">
                      {r.author}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#D1FAE5] flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingReport(r)}
                    className="h-8 px-3 text-xs gap-1.5 bg-white border border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] hover:border-[#059669] transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#059669]" />
                    <span>View Dossier</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportJson(r)}
                    title="Download Dossier JSON"
                    className="h-8 px-3 text-xs gap-1.5 bg-white border border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] hover:border-[#059669] transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[#059669]" />
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
          <div className="bg-white border border-[#D1FAE5] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#D1FAE5] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#064E3B] bg-[#F0FDF4] px-2 py-0.5 rounded-lg border border-[#D1FAE5]">
                    {viewingReport.id}
                  </span>
                  {getTypeBadge(viewingReport.reportType)}
                </div>
                <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                  {viewingReport.title}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {viewingReport.outletName} · {viewingReport.date} · Certified by {viewingReport.author}
                </p>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                className="text-[#64748B] hover:text-[#064E3B] hover:bg-[#F0FDF4] p-1.5 rounded-xl cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F0FDF4] border border-[#D1FAE5] text-xs">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Benchmark Score
                </span>
                <span className="text-lg font-bold text-[#064E3B]">
                  {viewingReport.score}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Certification Status
                </span>
                <span className="text-xs font-semibold text-[#059669]">
                  {viewingReport.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase block">
                  Lead Auditor
                </span>
                <span className="text-xs font-semibold text-[#1F2937] truncate block">
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
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D1FAE5] text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="text-[#64748B]">{km.label}:</span>
                    <span className="font-bold text-[#064E3B]">{km.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Block */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#064E3B] uppercase tracking-wider">
                Audit Summary Dossier
              </label>
              <div className="p-4 rounded-2xl bg-[#F0FDF4]/70 border border-[#D1FAE5] text-xs text-[#1F2937] leading-relaxed">
                {viewingReport.summary}
              </div>
            </div>

            {/* Sections */}
            {viewingReport.sections && viewingReport.sections.length > 0 && (
              <div className="space-y-3">
                {viewingReport.sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#D1FAE5] bg-white text-xs space-y-1 shadow-2xs"
                  >
                    <span className="font-bold text-[#064E3B]">{sec.title}</span>
                    <p className="text-[#1F2937] leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#D1FAE5]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportJson(viewingReport)}
                className="bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] hover:border-[#059669] text-xs gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-[#059669]" />
                <span>Download JSON Dossier</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] hover:border-[#059669] text-xs gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-[#059669]" />
                  <span>Print Dossier</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewingReport(null)}
                  className="bg-[#064E3B] hover:bg-[#047857] text-white text-xs cursor-pointer transition-colors"
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
          <div className="bg-white border border-[#D1FAE5] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#D1FAE5] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#059669] font-bold">
                  On-Demand Audit Compiler
                </span>
                <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                  Generate Store Audit Report
                </h3>
              </div>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="text-[#64748B] hover:text-[#064E3B] hover:bg-[#F0FDF4] p-1.5 rounded-xl cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#064E3B] font-semibold mb-1">
                  Target Store Outlet
                </label>
                <select
                  value={genOutletId}
                  onChange={(e) => setGenOutletId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#D1FAE5] bg-white text-[#1F2937] text-xs focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] cursor-pointer"
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
                <label className="block text-[#064E3B] font-semibold mb-1">
                  Audit Summary & Focus Area (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Q4 comprehensive walkthrough inspection. Walk-in chiller and secondary line sanitation verified."
                  value={genSummary}
                  onChange={(e) => setGenSummary(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D1FAE5] bg-white text-[#1F2937] text-xs focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">
                  Leave empty to compile standard operational and food safety audit summary.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D1FAE5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGenerateModalOpen(false)}
                  className="bg-white border-[#D1FAE5] text-[#64748B] hover:text-[#064E3B] hover:bg-[#F0FDF4] text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-[#059669] hover:bg-[#047857] text-white text-xs gap-1.5 shadow-xs transition-colors cursor-pointer"
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
