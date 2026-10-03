import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Building,
  UserCheck,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History as HistoryIcon,
  RefreshCw,
  Edit2,
  CheckCircle,
  XCircle,
  HelpCircle,
  Camera,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ComplianceInspection,
  getSeverityBadge,
  getStatusBadge,
  COMPLIANCE_STATUSES,
} from "./CompliancePage";

interface HistoryRecord {
  id: number;
  inspectionId: string;
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  changedBy: string;
  notes?: string | null;
  timestamp: string;
}

export default function ComplianceDetailPage() {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<ComplianceInspection | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status transition form state
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [assignedReviewerInput, setAssignedReviewerInput] = useState<string>("");
  const [transitionNotes, setTransitionNotes] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const normalizedId = (inspectionId || "").toUpperCase().trim();

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/compliance/${normalizedId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load inspection detail.");
      }

      setInspection(data.inspection);
      setHistory(data.history || []);
      setSelectedStatus(data.inspection.status);
      setAssignedReviewerInput(data.inspection.assignedReviewer);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve inspection record from PostgreSQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [normalizedId]);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspection) return;

    setSuccessMessage(null);
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/compliance/${inspection.inspectionId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          newStatus: selectedStatus,
          reviewer: assignedReviewerInput,
          notes: transitionNotes,
          resolutionNotes: selectedStatus === "RESOLVED" || selectedStatus === "VERIFIED" ? transitionNotes : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update inspection status.");
      }

      setSuccessMessage(`Inspection status successfully transitioned to ${selectedStatus}.`);
      setTransitionNotes("");
      fetchDetail();
    } catch (err: any) {
      alert(err.message || "Failed to update inspection status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-sm">Loading compliance dossier from PostgreSQL...</span>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 space-y-3">
        <div className="flex items-center gap-2 font-bold text-base">
          <AlertTriangle className="h-5 w-5" />
          <span>Compliance Audit Not Found</span>
        </div>
        <p className="text-xs">{error || "The requested inspection could not be loaded."}</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/compliance")}>
          Back to Compliance Registry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/compliance"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Compliance Audit Table</span>
      </Link>

      {/* Main Dossier Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                {inspection.inspectionId}
              </span>
              <Badge variant="outline" className="font-semibold text-xs">
                Outlet: {inspection.outletId}
              </Badge>
              {getSeverityBadge(inspection.severity)}
              {getStatusBadge(inspection.status)}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {inspection.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Audit Date: {inspection.inspectionDate}
              </span>
              {inspection.dueDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    Due Date: {inspection.dueDate}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                Officer: {inspection.inspectorName || "Quality & Compliance Officer"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Violation Category
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {inspection.category}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Score Deduction: -{inspection.scoreImpact} pts
            </span>
          </div>
        </div>

        {/* Observation Text Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[10px]">
            Field Observation Details
          </span>
          <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
            {inspection.observation}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Evidence Attachment Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evidence Attachment Section */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Camera className="h-4 w-4 text-indigo-600" />
                <span>Evidence Attachment Section</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Quality Officer photographs, test strip swatch readings, and IoT telemetry records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 dark:border-indigo-900 dark:bg-indigo-950/20 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 shrink-0">
                  <Paperclip className="h-6 w-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {inspection.evidenceAttachment || "evidence_capture_log.png"}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-medium text-emerald-600 border-emerald-500/30">
                      Verified Attachment
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-medium">
                    Type: {inspection.evidenceType || "Photo & Observation Log"}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-xs pt-1">
                    {inspection.evidenceDescription ||
                      "Digital inspection photograph captured during officer walkthrough. Tamper-proof hash stored in PostgreSQL audit log."}
                  </p>
                </div>
              </div>

              {inspection.resolutionNotes && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20 space-y-1 text-xs">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Resolution & Remediation Notes</span>
                  </span>
                  <p className="text-emerald-900 dark:text-emerald-200/90 leading-relaxed pt-1">
                    {inspection.resolutionNotes}
                  </p>
                  {inspection.resolvedAt && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block pt-1">
                      Resolved Timestamp: {inspection.resolvedAt}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit History Log */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HistoryIcon className="h-4 w-4 text-indigo-600" />
                <span>Audit & State History Trail ({history.length} events)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Immutable audit progression trail stored in PostgreSQL `compliance_history` table.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:top-2 before:left-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {history.map((h, idx) => (
                  <div key={h.id} className="relative space-y-1 text-xs">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-indigo-600 bg-white dark:bg-slate-900" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {h.action.replace("_", " ")}
                        </span>
                        {h.newStatus && getStatusBadge(h.newStatus)}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{h.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{h.notes}</p>
                    <span className="text-[10px] text-slate-400 block">By: {h.changedBy}</span>
                  </div>
                ))}

                {history.length === 0 && (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No history events recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Update Status & Assign Reviewer Form */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-indigo-600" />
                <span>Update Status & Reviewer</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Progress through audit stages (OPEN → UNDER_REVIEW → VERIFIED → RESOLVED).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleStatusSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Inspection Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                  >
                    {(COMPLIANCE_STATUSES as readonly string[]).map((st: string) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Quality & Compliance Officer
                  </label>
                  <div className="w-full h-8 rounded border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 px-2.5 text-xs flex items-center text-slate-300 font-medium">
                    Quality & Compliance Officer
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Status Transition Notes / Remediation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter reason for status change, physical re-inspection results, or remediation verification..."
                    value={transitionNotes}
                    onChange={(e) => setTransitionNotes(e.target.value)}
                    className="w-full rounded border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer text-xs h-9"
                >
                  {isUpdatingStatus ? "Updating..." : "Commit Status Change"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Officer Details Card */}
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-bold text-slate-400">
                Quality & Compliance Officer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Verifying Officer:</span>
                <span className="font-medium">{inspection.inspectorName || "Quality & Compliance Officer"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Officer Role:</span>
                <span className="font-medium text-emerald-400">Quality & Compliance Officer</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Store Outlet:</span>
                <span className="font-mono font-bold">{inspection.outletId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Database Record ID:</span>
                <span className="font-mono">#{inspection.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
