import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Building,
  ArrowRight,
  Eye,
  Check,
  X,
  Sliders,
  TrendingDown,
  Package,
  ShieldCheck,
  MessageSquare,
  Video,
  Activity,
  FileText,
  UserCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ALERT_TYPES,
  ALERT_SEVERITIES,
  AlertType,
  AlertSeverity,
  OutletAlertItem,
} from "@/types/alert-types";

export function getAlertSeverityBadge(severity: string) {
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
    case "ELEVATED":
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
          ELEVATED
        </Badge>
      );
    case "MODERATE":
      return (
        <Badge className="bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30 text-[10px] font-bold">
          MODERATE
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
}

export function getPriorityBadge(severity: string) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
          <AlertOctagon className="h-3.5 w-3.5" />
          Immediate attention/escalation
        </span>
      );
    case "HIGH":
    case "ELEVATED":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          Prioritized officer review
        </span>
      );
    case "MODERATE":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400">
          <Clock className="h-3.5 w-3.5" />
          Periodic review
        </span>
      );
    case "LOW":
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Routine monitoring
        </span>
      );
  }
}

export function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case "NEW":
      return (
        <Badge className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 text-[10px] font-semibold">
          NEW
        </Badge>
      );
    case "REVIEWED":
      return (
        <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 text-[10px] font-semibold">
          REVIEWED
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 text-[10px] font-semibold">
          IN PROGRESS
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 text-[10px] font-semibold">
          RESOLVED
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function getTypeIcon(type: string) {
  switch (type) {
    case "Sales anomaly":
      return <TrendingDown className="h-4 w-4 text-rose-500" />;
    case "Inventory mismatch":
      return <Package className="h-4 w-4 text-amber-500" />;
    case "Repeated compliance issues":
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    case "Increased complaints":
      return <MessageSquare className="h-4 w-4 text-orange-500" />;
    case "CCTV evidence requiring review":
      return <Video className="h-4 w-4 text-indigo-500" />;
    case "Operational deviations":
      return <Activity className="h-4 w-4 text-teal-500" />;
    case "Sudden performance deterioration":
      return <Zap className="h-4 w-4 text-purple-500" />;
    case "Unresolved corrective actions":
      return <FileText className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-slate-500" />;
  }
}

export default function AlertsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isFranchise = user?.role === "FRANCHISE";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  const [alerts, setAlerts] = useState<OutletAlertItem[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    critical: 0,
    highOrElevated: 0,
    moderate: 0,
    low: 0,
    newCount: 0,
    reviewed: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState(isFranchise ? userOutlet : "All Outlets");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedSeverity, setSelectedSeverity] = useState("All Severities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Alert Detail Modal
  const [activeAlert, setActiveAlert] = useState<OutletAlertItem | null>(null);
  const [reviewStatusInput, setReviewStatusInput] = useState<"REVIEWED" | "RESOLVED" | "IN_PROGRESS">("REVIEWED");
  const [reviewNotesInput, setReviewNotesInput] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedType !== "All Types") params.append("type", selectedType);
      if (selectedSeverity !== "All Severities") params.append("severity", selectedSeverity);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/alerts?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load alerts.");
      }

      setAlerts(data.alerts || []);
      setSummary(data.summary || {});
    } catch (err: any) {
      setError(err.message || "Failed to connect to alerts registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedOutlet, selectedType, selectedSeverity, selectedStatus]);

  const handleGenerateFreshAlerts = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/alerts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          outletId: selectedOutlet !== "All Outlets" ? selectedOutlet : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate alerts.");

      fetchAlerts();
    } catch (err: any) {
      alert(err.message || "Failed to trigger alert scan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenDetailModal = (item: OutletAlertItem) => {
    setActiveAlert(item);
    setReviewStatusInput(item.status === "NEW" ? "REVIEWED" : (item.status as any));
    setReviewNotesInput(item.reviewNotes || "");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlert) return;

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/alerts/${activeAlert.alertId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: reviewStatusInput,
          reviewNotes: reviewNotesInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update review status.");

      setActiveAlert(null);
      fetchAlerts();
    } catch (err: any) {
      alert(err.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const displayedAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const q = searchQuery.toLowerCase().trim();
    return alerts.filter(
      (a) =>
        a.message.toLowerCase().includes(q) ||
        a.alertId.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.outletId.toLowerCase().includes(q)
    );
  }, [alerts, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Scan Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 block mb-1 font-semibold">
            Operational Prioritization
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Alerts & <span className="italic text-amber-600">Prioritization Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Automated anomaly detection across 8 operational streams with tiered priority escalation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
            className="gap-1.5 cursor-pointer text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {user?.role !== "OWNER" && (
            <Button
              size="sm"
              onClick={handleGenerateFreshAlerts}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              <Zap className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Scanning Triggers..." : "Scan & Generate Alerts"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Role notice if franchise */}
      {isFranchise && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 px-3.5 py-2.5 text-xs text-emerald-900 dark:text-emerald-300">
          Store Isolation Active: Viewing operational threshold alerts strictly for your assigned outlet (<strong>{userOutlet}</strong>).
        </div>
      )}

      {/* Priority Escalation Guide Ribbon */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2 text-xs">
        <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] block">
          Tiered Priority Escalation Framework:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-950 dark:bg-red-950/20 space-y-1">
            <span className="font-bold text-red-700 dark:text-red-400 block text-xs">
              CRITICAL: Immediate Escalation
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Foreign body complaint, cash ratio {">"} 65%, or critical hygiene failure.
            </p>
          </div>
          <div className="p-2.5 rounded-lg border border-orange-200 bg-orange-50/50 dark:border-orange-950 dark:bg-orange-950/20 space-y-1">
            <span className="font-bold text-orange-700 dark:text-orange-400 block text-xs">
              ELEVATED/HIGH: Priority Review
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Multiple inventory variances, unverified CCTV, or overdue CAPA milestones.
            </p>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0A1224] space-y-1">
            <span className="font-bold text-teal-600 dark:text-teal-400 block text-xs">
              MODERATE: Periodic Review
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Telemetry drift, non-critical inventory delta, or customer wait time peak.
            </p>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
              LOW: Routine Monitoring
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Baseline telemetry checks within par tolerance.
            </p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Active Alerts
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {summary.total}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {summary.newCount} New Unreviewed
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active operational queue in PostgreSQL
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">
              Critical Escalations
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono">
                {summary.critical}
              </span>
              <span className="text-xs text-red-600 font-semibold">Immediate Action</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Immediate officer attention mandatory
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
              High / Elevated Queue
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                {summary.highOrElevated}
              </span>
              <span className="text-xs text-slate-400">Prioritized Review</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Prioritized supervisory inspection
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
              Reviewed & Cleared
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {summary.reviewed + summary.resolved}
              </span>
              <span className="text-xs text-emerald-600 font-medium font-mono">
                {summary.resolved} Resolved
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Audited by compliance officers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search alert message, ID, outlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Filter Outlet */}
          {!isFranchise && (
            <div>
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All Outlets">Filter Outlet: All</option>
                <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
              </select>
            </div>
          )}

          {/* Filter Type (8 Types) */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Types">Filter Trigger: All 8 Types</option>
              {ALERT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Severity */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Severities">Filter Severity: All</option>
              {ALERT_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s} Severity
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Statuses">Filter Status: All</option>
              <option value="NEW">NEW (Unreviewed)</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Showing {displayedAlerts.length} operational alerts</span>
          {(selectedOutlet !== "All Outlets" ||
            selectedType !== "All Types" ||
            selectedSeverity !== "All Severities" ||
            selectedStatus !== "All Statuses" ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedOutlet("All Outlets");
                setSelectedType("All Types");
                setSelectedSeverity("All Severities");
                setSelectedStatus("All Statuses");
                setSearchQuery("");
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Prioritized Alert Queue ({displayedAlerts.length} items)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Table: outlet_alerts (PostgreSQL)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Alert ID</th>
                <th className="py-3 px-3.5 font-semibold">Outlet (Link)</th>
                <th className="py-3 px-3.5 font-semibold">Trigger Type</th>
                <th className="py-3 px-3.5 font-semibold">Severity & Priority</th>
                <th className="py-3 px-3.5 font-semibold max-w-[280px]">Operational Message</th>
                <th className="py-3 px-3.5 font-semibold">Risk Score</th>
                <th className="py-3 px-3.5 font-semibold">Status</th>
                <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {displayedAlerts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {item.alertId}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {item.createdDate}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <Link
                      to={`/outlets/${item.outletId}`}
                      className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900 transition-colors inline-flex items-center gap-1"
                      title="Inspect Outlet Dossier"
                    >
                      <Building className="h-3 w-3" />
                      <span>{item.outletId}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-1.5 font-medium">
                      {getTypeIcon(item.type)}
                      <span>{item.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="space-y-1">
                      {getAlertSeverityBadge(item.severity)}
                      <span className="block text-[10px] text-slate-500 font-medium">
                        {item.priority}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 max-w-[280px]">
                    <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2" title={item.message}>
                      {item.message}
                    </p>
                  </td>
                  <td className="py-3 px-3.5">
                    {item.riskScore !== undefined && item.riskScore !== null ? (
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                          item.riskScore > 60
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : item.riskScore > 40
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {item.riskScore}/100
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDetailModal(item)}
                      className="h-7 text-xs gap-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Review</span>
                    </Button>
                  </td>
                </tr>
              ))}

              {displayedAlerts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No operational alerts match the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Detail & Review Modal Dialog */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {activeAlert.alertId}
                  </span>
                  {getAlertSeverityBadge(activeAlert.severity)}
                  {getStatusBadge(activeAlert.status)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pt-1">
                  {getTypeIcon(activeAlert.type)}
                  <span>{activeAlert.type}</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Alert Message Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">
                Operational Alert Description
              </span>
              <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
                {activeAlert.message}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Linked Store Outlet
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {activeAlert.outletId}
                  </span>
                  <Link
                    to={`/outlets/${activeAlert.outletId}`}
                    className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium text-[11px]"
                  >
                    <span>View Store</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Priority Directive
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  {activeAlert.priority}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Composite Risk Score
                </span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                  {activeAlert.riskScore !== undefined && activeAlert.riskScore !== null ? `${activeAlert.riskScore}/100` : "Baseline Par"}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                  Detection Date & Time
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 block text-xs">
                  {activeAlert.timestamp || activeAlert.createdDate}
                </span>
              </div>
            </div>

            {/* Previous Review Log if exists */}
            {activeAlert.reviewedBy && (
              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                <div className="flex justify-between font-bold text-indigo-950 dark:text-indigo-200">
                  <span>Last Reviewed By: {activeAlert.reviewedBy}</span>
                  <span className="font-mono text-[10px]">{activeAlert.reviewedAt}</span>
                </div>
                {activeAlert.reviewNotes && (
                  <p className="text-slate-600 dark:text-slate-300 pt-0.5">{activeAlert.reviewNotes}</p>
                )}
              </div>
            )}

            {/* Officer Review Form: Mark as Reviewed */}
            <form onSubmit={handleSubmitReview} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Officer Action: Update Alert Status & Log Remarks
              </span>

              <div className="grid grid-cols-3 gap-2">
                {(["REVIEWED", "IN_PROGRESS", "RESOLVED"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReviewStatusInput(st)}
                    className={`py-2 rounded-lg border font-bold text-xs cursor-pointer ${
                      reviewStatusInput === st
                        ? st === "RESOLVED"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : st === "IN_PROGRESS"
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Review & Mitigation Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewNotesInput}
                  onChange={(e) => setReviewNotesInput(e.target.value)}
                  placeholder="Enter supervisory verification, store manager instruction, or corrective resolution..."
                  className="w-full rounded-md border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveAlert(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingReview}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                >
                  {isSubmittingReview ? "Saving..." : "Commit Alert Status to PostgreSQL"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
