import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  Paperclip,
  UserCheck,
  Building,
  Calendar,
  Eye,
  Trash2,
  X,
  TrendingUp,
  AlertOctagon,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Camera,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const COMPLIANCE_CATEGORIES = [
  "Hygiene",
  "Service Quality",
  "Operational Standards",
  "Staff Compliance",
  "Safety-related visible checks",
  "Store Cleanliness",
  "Process Adherence",
] as const;

export const COMPLIANCE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "RESOLVED",
] as const;

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export interface ComplianceInspection {
  id: number;
  inspectionId: string;
  outletId: string;
  title: string;
  category: typeof COMPLIANCE_CATEGORIES[number];
  severity: typeof SEVERITIES[number];
  status: typeof COMPLIANCE_STATUSES[number];
  observation: string;
  evidenceDescription?: string | null;
  evidenceAttachment?: string | null;
  evidenceType?: string | null;
  assignedReviewer: string;
  assignedReviewerEmail?: string | null;
  inspectorName: string;
  inspectionDate: string;
  dueDate?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  scoreImpact: number;
}

export function getSeverityBadge(severity: string) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return (
        <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 text-[10px] font-bold">
          CRITICAL
        </Badge>
      );
    case "HIGH":
      return (
        <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 text-[10px] font-bold">
          HIGH
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
          MEDIUM
        </Badge>
      );
    case "LOW":
    default:
      return (
        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px] font-bold">
          LOW
        </Badge>
      );
  }
}

export function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case "OPEN":
      return (
        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 text-[10px] font-semibold">
          OPEN
        </Badge>
      );
    case "UNDER_REVIEW":
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-semibold">
          UNDER REVIEW
        </Badge>
      );
    case "VERIFIED":
      return (
        <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[10px] font-semibold">
          VERIFIED
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-semibold">
          RESOLVED
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 text-[10px] font-semibold">
          REJECTED
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function CompliancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inspections, setInspections] = useState<ComplianceInspection[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    open: 0,
    underReview: 0,
    verified: 0,
    resolved: 0,
    rejected: 0,
    criticalSeverity: 0,
    highSeverity: 0,
  });
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("All Outlets");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedSeverity, setSelectedSeverity] = useState("All Severities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Create Inspection Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const isFranchise = user?.role === "FRANCHISE";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  const [formOutletId, setFormOutletId] = useState(isFranchise ? userOutlet : "OUT-042");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<typeof COMPLIANCE_CATEGORIES[number]>("Hygiene");
  const [formSeverity, setFormSeverity] = useState<typeof SEVERITIES[number]>("MEDIUM");
  const [formObservation, setFormObservation] = useState("");
  const [formEvidenceDesc, setFormEvidenceDesc] = useState("");
  const [formEvidenceAttachment, setFormEvidenceAttachment] = useState("probe_calibration_photo.png");
  const [formEvidenceType, setFormEvidenceType] = useState("Photo & Observation Log");
  const [formAssignedReviewer, setFormAssignedReviewer] = useState("Karan Singhal (Lead Compliance Officer)");
  const [formInspectorName, setFormInspectorName] = useState(user?.name || "Devendra Joshi (Field Compliance Officer)");
  const [formInspectionDate, setFormInspectionDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = useState("");

  const fetchCompliance = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (selectedSeverity !== "All Severities") params.append("severity", selectedSeverity);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/compliance?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load compliance audits.");
      }

      setInspections(data.inspections || []);
      setSummary(data.summary || {});
      setTrend(data.trend || []);
    } catch (err: any) {
      setError(err.message || "Failed to connect to PostgreSQL compliance database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, [selectedOutlet, selectedCategory, selectedSeverity, selectedStatus]);

  const handleOpenCreateModal = () => {
    setFormOutletId(isFranchise ? userOutlet : "OUT-042");
    setFormTitle("Cold Holding Storage Temperature Verification");
    setFormCategory("Hygiene");
    setFormSeverity("MEDIUM");
    setFormObservation("Chiller unit #2 core temperature measured at 5.5°C during afternoon audit, exceeding the 4.0°C maximum threshold.");
    setFormEvidenceDesc("Probe sensor reading photograph and calibration certificate log attached.");
    setFormEvidenceAttachment("chiller_probe_telemetry_5.5c.png");
    setFormEvidenceType("Photo & Telemetry Log");
    setFormAssignedReviewer("Karan Singhal (Lead Compliance Officer)");
    setFormInspectorName(user?.name || "Devendra Joshi (Field Compliance Officer)");
    setFormInspectionDate(new Date().toISOString().split("T")[0]);
    // default due date: 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setFormDueDate(d.toISOString().split("T")[0]);
    setIsCreateOpen(true);
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          outletId: formOutletId,
          title: formTitle,
          category: formCategory,
          severity: formSeverity,
          observation: formObservation,
          evidenceDescription: formEvidenceDesc,
          evidenceAttachment: formEvidenceAttachment,
          evidenceType: formEvidenceType,
          assignedReviewer: formAssignedReviewer,
          assignedReviewerEmail: "officer.compliance@aurafoods.com",
          inspectorName: formInspectorName,
          inspectionDate: formInspectionDate,
          dueDate: formDueDate,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create inspection.");
      }

      setIsCreateOpen(false);
      fetchCompliance();
    } catch (err: any) {
      alert(err.message || "Failed to record compliance inspection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedInspections = useMemo(() => {
    if (!searchQuery.trim()) return inspections;
    const q = searchQuery.toLowerCase().trim();
    return inspections.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.observation.toLowerCase().includes(q) ||
        i.inspectionId.toLowerCase().includes(q) ||
        i.assignedReviewer.toLowerCase().includes(q) ||
        i.outletId.toLowerCase().includes(q)
    );
  }, [inspections, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Compliance & Inspection Management
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              PostgreSQL Stored
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic franchise inspection audits across 7 core quality, hygiene, and process categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCompliance}
            disabled={loading}
            className="gap-1.5 cursor-pointer text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {user?.role !== "OWNER" && (
            <Button
              size="sm"
              onClick={handleOpenCreateModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create Inspection</span>
            </Button>
          )}
        </div>
      </div>

      {/* Role notice if franchise */}
      {isFranchise && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 px-3.5 py-2.5 text-xs text-emerald-900 dark:text-emerald-300">
          Franchise Store Isolation: Viewing compliance audits and inspection history strictly for your assigned outlet (<strong>{userOutlet}</strong>).
        </div>
      )}

      {/* 4 Compliance Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Inspections Logged
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {summary.total}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {summary.resolved + summary.verified} Completed
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active observation registry in PostgreSQL
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Review & Verification
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                {summary.open + summary.underReview}
              </span>
              <span className="text-xs text-slate-400">
                {summary.open} Open • {summary.underReview} Reviewing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Requiring assigned officer verification
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              High & Critical Observations
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold font-mono ${summary.criticalSeverity > 0 ? "text-red-600" : summary.highSeverity > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                {summary.criticalSeverity + summary.highSeverity}
              </span>
              {summary.criticalSeverity > 0 && (
                <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-[10px]">
                  {summary.criticalSeverity} Critical
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Immediate corrective action threshold
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Verification Clearance Rate
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {summary.total > 0 ? Math.round(((summary.verified + summary.resolved) / summary.total) * 100) : 100}%
              </span>
              <span className="text-xs text-emerald-600 font-medium">Standard Parity</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Audits resolved through verified remediation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Trend Chart Section */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <span>Compliance Verification Trend Chart</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Trajectory of open vs verified/resolved inspections across audit cycles.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    val,
                    name === "verifiedCount" ? "Verified / Resolved" : "Open / Review",
                  ]}
                  labelFormatter={(lbl) => `Audit Date: ${lbl}`}
                />
                <Legend
                  formatter={(val) => (val === "verifiedCount" ? "Verified & Resolved" : "Open & In Review")}
                />
                <Bar dataKey="verifiedCount" fill="#10b981" radius={[4, 4, 0, 0]} name="verifiedCount" />
                <Bar dataKey="openCount" fill="#f59e0b" radius={[4, 4, 0, 0]} name="openCount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search title, observation, ID..."
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
                <option value="All Outlets">Filter by Outlet: All</option>
                <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
              </select>
            </div>
          )}

          {/* Filter Category (7 specified categories) */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Categories">Filter by Category: All</option>
              {COMPLIANCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              <option value="All Severities">Filter by Severity: All</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s} Severity
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status (5 specified statuses) */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Statuses">Filter by Status: All</option>
              {COMPLIANCE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters helper */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Showing {displayedInspections.length} recorded compliance inspections</span>
          {(selectedOutlet !== "All Outlets" ||
            selectedCategory !== "All Categories" ||
            selectedSeverity !== "All Severities" ||
            selectedStatus !== "All Statuses" ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedOutlet("All Outlets");
                setSelectedCategory("All Categories");
                setSelectedSeverity("All Severities");
                setSelectedStatus("All Statuses");
                setSearchQuery("");
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Compliance Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Inspection Registry & Violation Observations (PostgreSQL Live)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {displayedInspections.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5 font-semibold">Inspection ID</th>
                <th className="py-3 px-3.5 font-semibold">Outlet</th>
                <th className="py-3 px-3.5 font-semibold">Observation Title</th>
                <th className="py-3 px-3.5 font-semibold">Violation Category</th>
                <th className="py-3 px-3.5 font-semibold">Severity</th>
                <th className="py-3 px-3.5 font-semibold">Status</th>
                <th className="py-3 px-3.5 font-semibold">Assigned Reviewer</th>
                <th className="py-3 px-3.5 font-semibold">Evidence</th>
                <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {displayedInspections.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3.5">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {item.inspectionId}
                    </span>
                    <span className="block text-[10px] text-slate-400">{item.inspectionDate}</span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {item.outletId}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 max-w-[240px]">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate" title={item.title}>
                      {item.title}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate" title={item.observation}>
                      {item.observation}
                    </p>
                  </td>
                  <td className="py-3 px-3.5">
                    <Badge variant="outline" className="font-medium text-[11px]">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-3.5">{getSeverityBadge(item.severity)}</td>
                  <td className="py-3 px-3.5">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-3.5">
                    <span className="text-slate-800 dark:text-slate-200 font-medium block truncate max-w-[140px]" title={item.assignedReviewer}>
                      {item.assignedReviewer}
                    </span>
                    <span className="text-[10px] text-slate-400">By: {item.inspectorName}</span>
                  </td>
                  <td className="py-3 px-3.5">
                    {item.evidenceAttachment ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        <Paperclip className="h-3 w-3" />
                        Attached
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No attachment</span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/compliance/${item.inspectionId}`)}
                      className="h-7 text-xs gap-1 cursor-pointer"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}

              {displayedInspections.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No compliance inspections match the active criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Inspection Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <span>Log Compliance Observation</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Standardized store audit stored directly into PostgreSQL.
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3.5 text-xs">
              {/* Outlet and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Store Outlet
                  </label>
                  {isFranchise ? (
                    <div className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {userOutlet} (Assigned)
                    </div>
                  ) : (
                    <select
                      value={formOutletId}
                      onChange={(e) => setFormOutletId(e.target.value)}
                      className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                      <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                      <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                      <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Inspection Date
                  </label>
                  <Input
                    type="date"
                    value={formInspectionDate}
                    onChange={(e) => setFormInspectionDate(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Observation Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Raw poultry core temperature deviation in walk-in chiller"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>

              {/* Category & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Violation Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    {COMPLIANCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Severity Level
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as any)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s} Severity
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Observation Detail */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Detailed Field Observation
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the physical observation, deviations from SOP, instruments used, or staff actions..."
                  value={formObservation}
                  onChange={(e) => setFormObservation(e.target.value)}
                  className="w-full rounded border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>

              {/* Evidence Attachment Section */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Evidence Attachment Section</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Attachment Filename / Telemetry Identifier
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. thermometer_probe_reading.png"
                      value={formEvidenceAttachment}
                      onChange={(e) => setFormEvidenceAttachment(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      Evidence Type
                    </label>
                    <select
                      value={formEvidenceType}
                      onChange={(e) => setFormEvidenceType(e.target.value)}
                      className="w-full h-8 rounded border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="Photo & Observation Log">Photo & Observation Log</option>
                      <option value="IoT Sensor Telemetry Display">IoT Sensor Telemetry Display</option>
                      <option value="CCTV Video Frame Capture">CCTV Video Frame Capture</option>
                      <option value="Physical Swatch / Test Strip">Physical Swatch / Test Strip</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Evidence Verification Description
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Test strip color chart comparison verified against manufacturer standard."
                    value={formEvidenceDesc}
                    onChange={(e) => setFormEvidenceDesc(e.target.value)}
                    className="h-8 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Reviewer Assignment and Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Assign Reviewer
                  </label>
                  <select
                    value={formAssignedReviewer}
                    onChange={(e) => setFormAssignedReviewer(e.target.value)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Karan Singhal (Lead Compliance Officer)">
                      Karan Singhal (Lead Compliance Officer)
                    </option>
                    <option value="Sunil Kapoor (Regional Inspection Head)">
                      Sunil Kapoor (Regional Inspection Head)
                    </option>
                    <option value="Yuvraj Buddha (Senior Quality Auditor)">
                      Yuvraj Buddha (Senior Quality Auditor)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Remediation Target Due Date
                  </label>
                  <Input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                >
                  {isSubmitting ? "Logging..." : "Create Inspection in PostgreSQL"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
