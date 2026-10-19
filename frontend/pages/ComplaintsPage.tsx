import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquareWarning,
  Search,
  Filter,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  Eye,
  X,
  Building2,
  Calendar,
  User,
  Check,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ALL_NETWORK_STORES } from "@/utils/stores-data";

interface ComplaintItem {
  id: number;
  complaintId: string;
  outletId: string;
  outletName?: string;
  outletCity?: string;
  customerName: string;
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  status: "Open" | "Investigating" | "Resolved";
  reportedAt: string;
}

interface ComplaintSummary {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const CATEGORIES = [
  "All Categories",
  "Order Packaging",
  "Service Speed",
  "Food Temperature",
  "Food Quality",
  "Hygiene",
  "Staff Conduct",
  "Billing",
];

const SEVERITIES = ["All Severities", "Critical", "High", "Medium", "Low"];
const STATUSES = ["All Statuses", "Open", "Investigating", "Resolved"];

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [summary, setSummary] = useState<ComplaintSummary>({
    total: 0,
    open: 0,
    investigating: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("All Outlets");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSeverity, setSelectedSeverity] = useState("All Severities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Modals
  const [detailModalItem, setDetailModalItem] = useState<ComplaintItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Complaint Form
  const [formOutletId, setFormOutletId] = useState(
    user?.role === "FRANCHISE" ? user.assignedOutletId || "OUT-042" : "OUT-042"
  );
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formCategory, setFormCategory] = useState("Order Packaging");
  const [formSeverity, setFormSeverity] = useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [formDescription, setFormDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (selectedSeverity !== "All Severities") params.append("severity", selectedSeverity);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const res = await fetch(`/api/complaints?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error("Failed to fetch customer complaints.");
      }
      const data = await res.json();
      setComplaints(data.complaints || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      console.error("Complaints load error:", err);
      setError(err.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedOutlet, selectedCategory, selectedSeverity, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: "Open" | "Investigating" | "Resolved") => {
    setUpdatingId(complaintId);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update complaint status.");
      }

      const data = await res.json();
      setComplaints((prev) =>
        prev.map((c) => (c.complaintId === complaintId ? { ...c, status: newStatus } : c))
      );

      if (detailModalItem && detailModalItem.complaintId === complaintId) {
        setDetailModalItem((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      setSuccessToast(data.message || `Complaint status updated to ${newStatus}.`);
      setTimeout(() => setSuccessToast(null), 3000);
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formDescription.trim()) {
      alert("Please provide customer name and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers,
        body: JSON.stringify({
          outletId: formOutletId,
          customerName: formCustomerName.trim(),
          category: formCategory,
          severity: formSeverity,
          description: formDescription.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to log complaint.");
      }

      const data = await res.json();
      setCreateModalOpen(false);
      setFormCustomerName("");
      setFormDescription("");
      setSuccessToast(data.message || "Customer complaint registered successfully.");
      setTimeout(() => setSuccessToast(null), 3500);
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || "Failed to log complaint.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return (
          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-[10px] font-bold">
            CRITICAL
          </Badge>
        );
      case "HIGH":
        return (
          <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 text-[10px] font-bold">
            HIGH
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
            MEDIUM
          </Badge>
        );
      case "LOW":
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 text-[10px] font-bold">
            LOW
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40">
            <CheckCircle2 className="h-3 w-3" />
            Resolved
          </span>
        );
      case "Investigating":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40">
            <Clock className="h-3 w-3" />
            Investigating
          </span>
        );
      case "Open":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
            <AlertTriangle className="h-3 w-3" />
            Open
          </span>
        );
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedOutlet("All Outlets");
    setSelectedCategory("All Categories");
    setSelectedSeverity("All Severities");
    setSelectedStatus("All Statuses");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedOutlet !== "All Outlets" ||
    selectedCategory !== "All Categories" ||
    selectedSeverity !== "All Severities" ||
    selectedStatus !== "All Statuses";

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800">
              <MessageSquareWarning className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customer Complaints & Service Quality Registry
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Grievance logs, service speed evaluations, and packaging anomalies mapped to franchise unit compliance scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComplaints}
            disabled={loading}
            className="text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Complaint</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Logged</span>
            <MessageSquareWarning className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {summary.total}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Across franchise units</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Under Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summary.investigating + summary.open}
          </div>
          <p className="text-[11px] text-amber-600/80 mt-0.5">{summary.open} open, {summary.investigating} investigating</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.resolved}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Closed customer records</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>High / Critical</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {summary.critical + summary.high}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-0.5">Mandates supervisory action</p>
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
              placeholder="Search by ID, customer name, issue, or outlet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            />
          </form>

          {/* Quick Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
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

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Severity Selector */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
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
          <AlertOctagon className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaints Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Customer Grievances & Service Logs
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {complaints.length} records
            </Badge>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click row or view dossier for details
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-indigo-500" />
            <p>Loading complaints registry from database...</p>
          </div>
        ) : complaints.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareWarning className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                No Complaints Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No customer complaints match your active filter criteria. Try adjusting or clearing your search filters."
                  : "Zero customer complaints are logged in the registry for this scope."}
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
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log First Complaint</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-500 font-semibold">
                  <th className="py-3 px-4 min-w-[120px]">Complaint ID</th>
                  <th className="py-3 px-4 min-w-[150px]">Store Outlet</th>
                  <th className="py-3 px-4 min-w-[140px]">Customer</th>
                  <th className="py-3 px-4 min-w-[130px]">Category</th>
                  <th className="py-3 px-4 min-w-[95px]">Severity</th>
                  <th className="py-3 px-4 min-w-[240px]">Grievance Details</th>
                  <th className="py-3 px-4 min-w-[110px]">Reported</th>
                  <th className="py-3 px-4 min-w-[110px]">Status</th>
                  <th className="py-3 px-4 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {c.complaintId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {c.outletId}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {c.outletName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.customerName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {c.category}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">{getSeverityBadge(c.severity)}</td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <p className="line-clamp-2 leading-relaxed">{c.description}</p>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                      {c.reportedAt}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(c.status)}</td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDetailModalItem(c)}
                          className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Dossier
                        </Button>

                        {c.status !== "Resolved" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === c.complaintId}
                            onClick={() =>
                              handleUpdateStatus(
                                c.complaintId,
                                c.status === "Open" ? "Investigating" : "Resolved"
                              )
                            }
                            className="h-7 px-2 text-[11px] font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 cursor-pointer"
                          >
                            {updatingId === c.complaintId ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : c.status === "Open" ? (
                              "Investigate →"
                            ) : (
                              "Resolve ✓"
                            )}
                          </Button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold px-2">
                            Closed
                          </span>
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

      {/* DETAIL MODAL */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {detailModalItem.complaintId}
                  </span>
                  {getSeverityBadge(detailModalItem.severity)}
                  {getStatusBadge(detailModalItem.status)}
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Customer Grievance Dossier
                </h3>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Assigned Store
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalItem.outletId} · {detailModalItem.outletName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Customer Name
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalItem.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Category
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalItem.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">
                    Reported At
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalItem.reportedAt}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Grievance Description
                </label>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed">
                  {detailModalItem.description}
                </div>
              </div>

              {/* Status Update Quick Action */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Update Resolution Stage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={detailModalItem.status === "Open" ? "default" : "outline"}
                    disabled={updatingId === detailModalItem.complaintId}
                    onClick={() => handleUpdateStatus(detailModalItem.complaintId, "Open")}
                    className="text-xs h-8"
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant={detailModalItem.status === "Investigating" ? "default" : "outline"}
                    disabled={updatingId === detailModalItem.complaintId}
                    onClick={() => handleUpdateStatus(detailModalItem.complaintId, "Investigating")}
                    className="text-xs h-8"
                  >
                    Investigating
                  </Button>
                  <Button
                    size="sm"
                    variant={detailModalItem.status === "Resolved" ? "default" : "outline"}
                    disabled={updatingId === detailModalItem.complaintId}
                    onClick={() => handleUpdateStatus(detailModalItem.complaintId, "Resolved")}
                    className="text-xs h-8"
                  >
                    Resolved ✓
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModalItem(null)}
                className="text-xs"
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LOG NEW COMPLAINT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                  Quality & Service Registry
                </span>
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                  Log New Customer Complaint
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Target Store Outlet
                </label>
                <select
                  value={formOutletId}
                  onChange={(e) => setFormOutletId(e.target.value)}
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
                  Customer / Guest Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Ramesh Verma"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  className="text-xs h-9"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Grievance Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="Order Packaging">Order Packaging</option>
                    <option value="Service Speed">Service Speed</option>
                    <option value="Food Temperature">Food Temperature</option>
                    <option value="Food Quality">Food Quality</option>
                    <option value="Hygiene">Hygiene</option>
                    <option value="Staff Conduct">Staff Conduct</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) =>
                      setFormSeverity(e.target.value as "Low" | "Medium" | "High" | "Critical")
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="Low">Low (Informational)</option>
                    <option value="Medium">Medium (Standard Review)</option>
                    <option value="High">High (Officer Escalation)</option>
                    <option value="Critical">Critical (Immediate Audit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Complaint Description & Observation
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the customer issue, item involved, and observation details..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formCustomerName.trim() || !formDescription.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Log Complaint</span>
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
