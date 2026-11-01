import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  FileCheck2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Check,
  X,
  Search,
  Plus,
  RefreshCw,
  Building,
  Upload,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  History,
  Calendar,
  User,
  FileText,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CorrectiveActionItem,
  CorrectiveActionHistoryEntry,
  CapaStatus,
  WorkflowStage,
  WORKFLOW_STAGES,
  CAPA_STATUSES,
} from "@/types/corrective-action-types";
import { STORES_MAP } from "@/utils/stores-data";

export function getCapaStatusBadge(status: CapaStatus | string, isOverdue?: boolean) {
  if (status === "OVERDUE" || isOverdue) {
    return (
      <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-bold animate-pulse">
        OVERDUE
      </Badge>
    );
  }

  switch (status?.toUpperCase()) {
    case "CLOSED":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
          CLOSED
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30 text-xs font-bold">
          COMPLETED
        </Badge>
      );
    case "PENDING_VERIFICATION":
      return (
        <Badge className="bg-[#E6F8EF] text-[#064E3B] border border-[#D1FAE5] text-xs font-bold">
          PENDING VERIFICATION
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-bold">
          IN PROGRESS
        </Badge>
      );
    case "OPEN":
    default:
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-bold">
          OPEN
        </Badge>
      );
  }
}

export function getPriorityBadge(priority: string) {
  switch (priority?.toUpperCase()) {
    case "CRITICAL":
      return <Badge className="bg-red-600 text-white text-[10px]">CRITICAL</Badge>;
    case "HIGH":
      return <Badge className="bg-orange-500 text-white text-[10px]">HIGH</Badge>;
    case "MEDIUM":
      return <Badge className="bg-slate-700 text-slate-200 text-[10px]">MEDIUM</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">LOW</Badge>;
  }
}

export default function CorrectiveActionsPage() {
  const { user } = useAuth();
  const isFranchise = user?.role === "FRANCHISE";
  const isOfficerOrAdmin = user?.role === "OFFICER" || user?.role === "ADMIN";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  const [actions, setActions] = useState<CorrectiveActionItem[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    open: 0,
    inProgress: 0,
    pendingVerification: 0,
    completed: 0,
    closed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedOutlet, setSelectedOutlet] = useState(isFranchise ? userOutlet : "All Outlets");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState<CorrectiveActionItem | null>(null);
  const [historyTrail, setHistoryTrail] = useState<CorrectiveActionHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Evidence Submission Modal
  const [evidenceModalItem, setEvidenceModalItem] = useState<CorrectiveActionItem | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Officer Verification Modal
  const [verifyModalItem, setVerifyModalItem] = useState<CorrectiveActionItem | null>(null);
  const [verifyDecision, setVerifyDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);

  // Create Form State
  const [newOutletId, setNewOutletId] = useState(isFranchise ? userOutlet : "OUT-042");
  const [newIssue, setNewIssue] = useState("");
  const [newRequiredAction, setNewRequiredAction] = useState("");
  const [newAssignedPerson, setNewAssignedPerson] = useState("Yuvraj Buddha");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [newCategory, setNewCategory] = useState("Operational Compliance");
  const [isCreating, setIsCreating] = useState(false);

  const fetchActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);
      if (selectedPriority !== "All Priorities") params.append("priority", selectedPriority);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/corrective-actions?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load corrective actions.");

      setActions(data.actions || []);
      setSummary(data.summary || {});
    } catch (err: any) {
      setError(err.message || "Failed to load CAPA database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [selectedOutlet, selectedStatus, selectedPriority]);

  const loadActionHistory = async (actionId: string) => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/corrective-actions/${actionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setHistoryTrail(data.history || []);
      }
    } catch (e) {
      console.warn("Could not load history:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenDetail = (item: CorrectiveActionItem) => {
    setDetailModalItem(item);
    loadActionHistory(item.actionId);
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/corrective-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          outletId: newOutletId,
          issue: newIssue,
          requiredAction: newRequiredAction,
          assignedPerson: newAssignedPerson,
          deadline: newDeadline,
          priority: newPriority,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create corrective action.");

      setCreateModalOpen(false);
      setNewIssue("");
      setNewRequiredAction("");
      setNewAssignedPerson("Yuvraj Buddha");
      setNewDeadline("");
      fetchActions();
    } catch (err: any) {
      alert(err.message || "Failed to create corrective action.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalItem) return;
    setIsSubmittingEvidence(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/corrective-actions/${evidenceModalItem.actionId}/submit-evidence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          evidenceNotes,
          evidenceUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit evidence.");

      setEvidenceModalItem(null);
      setEvidenceNotes("");
      setEvidenceUrl("");
      fetchActions();
    } catch (err: any) {
      alert(err.message || "Failed to submit evidence.");
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleVerifyAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyModalItem) return;
    setIsSubmittingVerify(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/corrective-actions/${verifyModalItem.actionId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          decision: verifyDecision,
          remarks: verifyRemarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit verification.");

      setVerifyModalItem(null);
      setVerifyRemarks("");
      fetchActions();
    } catch (err: any) {
      alert(err.message || "Failed to record officer verification.");
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const displayedActions = useMemo(() => {
    if (!searchQuery.trim()) return actions;
    const q = searchQuery.toLowerCase().trim();
    return actions.filter(
      (a) =>
        a.issue.toLowerCase().includes(q) ||
        a.actionId.toLowerCase().includes(q) ||
        a.outletId.toLowerCase().includes(q) ||
        a.assignedPerson.toLowerCase().includes(q) ||
        a.requiredAction.toLowerCase().includes(q)
    );
  }, [actions, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 block mb-1 font-semibold">
            Statutory Remediation Protocol
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Corrective Action (CAPA) <span className="italic text-emerald-600">Lifecycle Loop</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            End-to-end statutory compliance remediation: Issue Detected → Action Assigned → Evidence Verification → Closed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActions}
            disabled={loading}
            className="gap-1.5 cursor-pointer text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {isOfficerOrAdmin && (
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="bg-[#059669] hover:bg-[#047857] text-white gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Assign Corrective Action</span>
            </Button>
          )}
        </div>
      </div>

      {/* Role Notice */}
      {isFranchise && (
        <div className="rounded-lg border border-[#D1FAE5] bg-[#E6F8EF] px-3.5 py-2.5 text-xs text-[#064E3B]">
          Store Isolation Active: Showing remediation mandates strictly for your assigned outlet (<strong>{userOutlet}</strong>). Submit evidence before due date to prevent overdue escalation.
        </div>
      )}

      {/* Complete Workflow Stepper Banner */}
      <div className="rounded-xl border border-[#D1FAE5] bg-white p-4 shadow-2xs space-y-3">
        <span className="font-bold text-[#064E3B] uppercase tracking-wider text-[11px] block">
          Statutory 8-Stage Closed-Loop Workflow:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-[10px]">
          {WORKFLOW_STAGES.map((stg, i) => (
            <div
              key={stg}
              className="p-2 rounded-lg border border-[#D1FAE5] bg-[#F0FDF4]/60 space-y-1 relative"
            >
              <span className="h-4 w-4 rounded-full bg-[#E6F8EF] text-[#064E3B] border border-[#D1FAE5] font-bold inline-flex items-center justify-center text-[10px] mx-auto">
                {i + 1}
              </span>
              <span className="block font-semibold text-[#1F2937] truncate" title={stg}>
                {stg}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-3 pb-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total CAPAs</span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {summary.total}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-3 pb-1">
            <span className="text-[10px] font-bold uppercase text-amber-500">Open</span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {summary.open}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="p-3 pb-1">
            <span className="text-[10px] font-bold uppercase text-amber-500">In Progress</span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {summary.inProgress}
            </span>
          </CardContent>
        </Card>

        <Card className="border-[#D1FAE5] bg-white shadow-2xs">
          <CardHeader className="p-3 pb-1">
            <span className="text-[10px] font-bold uppercase text-[#059669]">Pending Review</span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <span className="text-xl font-bold font-mono text-[#064E3B]">
              {summary.pendingVerification}
            </span>
          </CardContent>
        </Card>

        <Card className="border-[#D1FAE5] bg-white shadow-2xs">
          <CardHeader className="p-3 pb-1">
            <span className="text-[10px] font-bold uppercase text-[#059669]">Closed</span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <span className="text-xl font-bold font-mono text-[#059669]">
              {summary.closed}
            </span>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/20 shadow-2xs">
          <CardHeader className="p-3 pb-1">
            <span className="text-[10px] font-bold uppercase text-red-600">Overdue SLA</span>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <span className="text-xl font-bold font-mono text-red-600">
              {summary.overdue}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[#D1FAE5] bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
            <Input
              placeholder="Search issue, action, assignee, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 border-[#D1FAE5] bg-white text-[#1F2937]"
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

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Statuses">Filter Status: All</option>
              {CAPA_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Priority */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Priorities">Filter Priority: All</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Corrective Actions Section: Vertical Cards for Franchisee, Table for Officer/Admin/Owner */}
      {isFranchise ? (
        <div className="space-y-4 w-full max-w-full box-border">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#059669]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                Active Corrective Actions ({displayedActions.length})
              </h3>
            </div>
            <span className="text-xs text-[#64748B] font-mono">
              Outlet: {userOutlet}
            </span>
          </div>

          {displayedActions.length === 0 ? (
            <div className="rounded-xl border border-[#D1FAE5] bg-white p-12 text-center text-[#64748B] shadow-2xs">
              <FileCheck2 className="h-8 w-8 text-[#64748B]/50 mx-auto mb-2" />
              <p className="font-medium text-[#064E3B]">No active corrective actions</p>
              <p className="text-xs text-[#64748B] mt-1">All compliance items for this outlet are currently resolved.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full max-w-full box-border">
              {displayedActions.map((item) => {
                const outletInfo = STORES_MAP[item.outletId];
                const outletDisplayName = outletInfo?.name || item.outletId;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#D1FAE5] bg-white p-5 shadow-2xs hover:border-[#059669]/60 transition-colors w-full max-w-full box-border min-w-0 space-y-4"
                  >
                    {/* Card Header: Title & Status */}
                    <div className="flex items-center justify-between border-b border-[#D1FAE5]/60 pb-3">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-[#059669]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                          Corrective Action
                        </span>
                      </div>
                      <div>{getCapaStatusBadge(item.status, item.isOverdue)}</div>
                    </div>

                    {/* Vertical Fields arranged one below another */}
                    <div className="space-y-3.5 text-xs divide-y divide-[#D1FAE5]/60">
                      {/* 1. Issue / Requirement */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                          Issue / Requirement:
                        </span>
                        <p className="text-sm font-semibold text-[#064E3B] leading-snug">
                          {item.issue}
                        </p>
                      </div>

                      {/* 2. Outlet Name */}
                      <div className="pt-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] shrink-0">
                          Outlet Name:
                        </span>
                        <span className="font-semibold text-[#1F2937] text-xs sm:text-right">
                          {outletDisplayName}{" "}
                          <span className="font-mono text-[#64748B] font-normal">
                            ({item.outletId})
                          </span>
                        </span>
                      </div>

                      {/* 3. Required Corrective Action */}
                      <div className="pt-2.5 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                          Required Corrective Action:
                        </span>
                        <p className="text-xs text-[#1F2937] leading-relaxed bg-[#F0FDF4]/60 p-3 rounded-lg border border-[#D1FAE5]">
                          {item.requiredAction}
                        </p>
                      </div>

                      {/* 4. Due Date */}
                      {item.deadline && (
                        <div className="pt-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] shrink-0">
                            Due Date:
                          </span>
                          <div className="flex items-center gap-2 sm:justify-end">
                            <span className="font-mono font-medium text-[#1F2937]">
                              {item.deadline}
                            </span>
                            {item.isOverdue || item.status === "OVERDUE" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                <AlertOctagon className="h-3 w-3" />
                                Overdue
                              </span>
                            ) : item.status === "CLOSED" ? (
                              <span className="text-[11px] text-[#059669] font-medium">Resolved</span>
                            ) : (
                              <span className="text-[11px] text-[#64748B] font-medium">
                                ({item.daysRemaining} days remaining)
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 5. Current Status */}
                      <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] shrink-0">
                          Current Status:
                        </span>
                        <div className="sm:self-end">
                          {getCapaStatusBadge(item.status, item.isOverdue)}
                        </div>
                      </div>
                    </div>

                    {/* 6. Submit Evidence Button at Bottom */}
                    <div className="pt-3 border-t border-[#D1FAE5]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      {item.status !== "CLOSED" ? (
                        <Button
                          onClick={() => setEvidenceModalItem(item)}
                          className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs h-9 px-5 rounded-lg shadow-sm cursor-pointer gap-2 justify-center"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Submit Evidence</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 py-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Remediation Completed & Verified</span>
                        </span>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(item)}
                        className="w-full sm:w-auto text-xs h-9 px-3.5 gap-1.5 cursor-pointer justify-center"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Modern Vertical Card-Based Layout for All Management Roles */
        <div className="space-y-3 w-full max-w-full box-border">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#059669]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
                Active Corrective Action Dossiers ({displayedActions.length})
              </h3>
            </div>
            <span className="text-xs text-[#64748B] font-mono">
              PostgreSQL Queue
            </span>
          </div>

          {displayedActions.length === 0 ? (
            <div className="rounded-xl border border-[#D1FAE5] bg-white p-12 text-center text-[#64748B] shadow-2xs">
              <FileCheck2 className="h-8 w-8 text-[#64748B]/50 mx-auto mb-2" />
              <p className="font-medium text-[#064E3B]">No corrective actions found</p>
              <p className="text-xs text-[#64748B] mt-1">No corrective actions match the specified filters.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 w-full max-w-full box-border">
              {displayedActions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#D1FAE5] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#059669]/60 transition-colors w-full max-w-full box-border min-w-0 space-y-3"
                >
                  {/* Card Header: CAPA ID, Outlet, Priority, Status */}
                  <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#D1FAE5]/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#064E3B] bg-[#E6F8EF] px-2 py-0.5 rounded border border-[#D1FAE5]">
                        {item.actionId}
                      </span>
                      <Link
                        to={`/outlets/${item.outletId}`}
                        className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F0FDF4] hover:bg-[#E6F8EF] hover:text-[#064E3B] transition-colors inline-flex items-center gap-1 text-[#064E3B] border border-[#D1FAE5]"
                      >
                        <Building className="h-3 w-3" />
                        <span>{item.outletId}</span>
                      </Link>
                      {getPriorityBadge(item.priority)}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-medium text-[11px] text-[#064E3B] bg-[#E6F8EF] px-2 py-0.5 rounded border border-[#D1FAE5]">
                        Stage: {item.currentStage}
                      </span>
                      {getCapaStatusBadge(item.status, item.isOverdue)}
                    </div>
                  </div>

                  {/* Vertical Label-Value rows */}
                  <div className="space-y-2.5 text-xs">
                    {/* Issue */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                        Issue Description:
                      </span>
                      <p className="text-xs font-semibold text-[#064E3B] leading-snug">
                        {item.issue}
                      </p>
                    </div>

                    {/* Required Action */}
                    {item.requiredAction && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                          Required Mandate:
                        </span>
                        <p className="text-xs text-[#1F2937] leading-relaxed bg-[#F0FDF4]/60 p-2.5 rounded-lg border border-[#D1FAE5]">
                          {item.requiredAction}
                        </p>
                      </div>
                    )}

                    {/* Meta info row: Assignee, Category, Deadline */}
                    <div className="pt-2 border-t border-[#D1FAE5]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-[#64748B] font-medium">Assigned To:</span>
                        <span className="font-semibold text-[#1F2937]">
                          {item.assignedPerson} {item.category ? `(${item.category})` : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="text-[#64748B] font-medium">Deadline:</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-[#1F2937] font-medium">{item.deadline}</span>
                          {item.isOverdue || item.status === "OVERDUE" ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              <AlertOctagon className="h-3 w-3" />
                              OVERDUE ({Math.abs(item.daysRemaining || 0)}d)
                            </span>
                          ) : item.status === "CLOSED" ? (
                            <span className="text-[10px] text-[#059669] font-semibold">Resolved</span>
                          ) : (
                            <span className="text-[10px] text-[#64748B] font-semibold">
                              ({item.daysRemaining}d left)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Action Buttons */}
                  <div className="pt-3 border-t border-[#D1FAE5]/60 flex flex-wrap items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDetail(item)}
                      className="h-8 text-xs gap-1.5 cursor-pointer text-[#064E3B] border-[#D1FAE5] hover:bg-[#F0FDF4]"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#64748B]" />
                      <span>Dossier</span>
                    </Button>

                    {item.status !== "CLOSED" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEvidenceModalItem(item)}
                        className="h-8 text-xs gap-1.5 cursor-pointer bg-[#E6F8EF] text-[#064E3B] border border-[#D1FAE5] hover:bg-[#D1FAE5]"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#059669]" />
                        <span>Submit Evidence</span>
                      </Button>
                    )}

                    {isOfficerOrAdmin && item.status !== "CLOSED" && (
                      <Button
                        size="sm"
                        onClick={() => setVerifyModalItem(item)}
                        className="h-8 text-xs gap-1.5 bg-[#059669] hover:bg-[#047857] text-white cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verify & Sign-Off</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAIL & AUDIT HISTORY MODAL */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D1FAE5] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-start justify-between border-b border-[#D1FAE5]/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#064E3B] bg-[#E6F8EF] px-2 py-0.5 rounded border border-[#D1FAE5]">
                    {detailModalItem.actionId}
                  </span>
                  {getCapaStatusBadge(detailModalItem.status, detailModalItem.isOverdue)}
                  {getPriorityBadge(detailModalItem.priority)}
                </div>
                <h3 className="text-base font-bold text-[#064E3B] pt-1">
                  {detailModalItem.issue}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-[#64748B] hover:text-[#064E3B] p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Core Fields Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F0FDF4]/60 p-3.5 rounded-xl border border-[#D1FAE5]">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Store Outlet</span>
                <span className="font-mono font-bold text-[#064E3B] text-sm">
                  {detailModalItem.outletId}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Assigned Person</span>
                <span className="font-semibold text-[#1F2937]">
                  {detailModalItem.assignedPerson}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Deadline</span>
                <span className="font-mono font-bold text-[#1F2937]">
                  {detailModalItem.deadline}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase font-semibold block">Current Stage</span>
                <span className="font-semibold text-[#059669]">
                  {detailModalItem.currentStage}
                </span>
              </div>
            </div>

            {/* Required Action Description */}
            <div className="p-3 bg-white rounded-lg border border-[#D1FAE5] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Required Corrective Action</span>
              <p className="text-[#1F2937] text-sm leading-relaxed">
                {detailModalItem.requiredAction}
              </p>
            </div>

            {/* Submitted Evidence Section */}
            {detailModalItem.evidence && (
              <div className="p-3 bg-[#E6F8EF]/60 rounded-lg border border-[#D1FAE5] space-y-1">
                <div className="flex justify-between font-bold text-[#064E3B]">
                  <span>Submitted Evidence</span>
                  <span className="font-mono text-[10px]">{detailModalItem.evidenceSubmittedAt}</span>
                </div>
                <p className="text-[#1F2937]">{detailModalItem.evidence}</p>
                <span className="block text-[10px] text-[#64748B]">
                  Submitted By: {detailModalItem.evidenceSubmittedBy}
                </span>
              </div>
            )}

            {/* Officer Verification Section */}
            {detailModalItem.verifiedBy && (
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 space-y-1">
                <div className="flex justify-between font-bold text-emerald-950">
                  <span>Officer Verification Decision: {detailModalItem.verificationDecision}</span>
                  <span className="font-mono text-[10px]">{detailModalItem.verifiedAt}</span>
                </div>
                <p className="text-[#1F2937]">{detailModalItem.verificationNotes}</p>
                <span className="block text-[10px] text-[#64748B]">Verified By: {detailModalItem.verifiedBy}</span>
              </div>
            )}

            {/* Corrective Action History Audit Trail */}
            <div className="space-y-2 pt-2 border-t border-[#D1FAE5]/60">
              <div className="flex items-center gap-1.5 font-bold text-[#064E3B] text-xs">
                <History className="h-4 w-4 text-[#059669]" />
                <span>Chronological Audit Trail & History Log</span>
              </div>

              {historyLoading ? (
                <div className="py-6 text-center text-[#64748B]">Loading audit history...</div>
              ) : historyTrail.length === 0 ? (
                <p className="text-[#64748B] italic">No previous transition logs found.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {historyTrail.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-lg bg-[#F0FDF4]/60 border border-[#D1FAE5] text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#064E3B]">{h.stage}</span>
                        <span className="font-mono text-[10px] text-[#64748B]">{h.timestamp}</span>
                      </div>
                      <p className="text-[#1F2937]">{h.remarks}</p>
                      <div className="flex justify-between text-[10px] text-[#64748B] pt-0.5">
                        <span>Actor: {h.performedBy}</span>
                        <span>Status: {h.newStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setDetailModalItem(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT EVIDENCE MODAL */}
      {evidenceModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D1FAE5] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs my-auto">
            <div className="flex items-start justify-between border-b border-[#D1FAE5]/60 pb-3">
              <div>
                <span className="font-mono font-bold text-[#064E3B]">{evidenceModalItem.actionId}</span>
                <h3 className="text-base font-bold text-[#064E3B] pt-0.5">
                  Submit Remedial Evidence
                </h3>
              </div>
              <button onClick={() => setEvidenceModalItem(null)} className="text-[#64748B] hover:text-[#064E3B] cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F0FDF4]/60 rounded-lg border border-[#D1FAE5] space-y-1">
              <span className="font-bold text-[#1F2937] block">Issue: {evidenceModalItem.issue}</span>
              <span className="text-[#64748B] block">Required Action: {evidenceModalItem.requiredAction}</span>
            </div>

            <form onSubmit={handleSubmitEvidence} className="space-y-3">
              <div>
                <label className="font-semibold text-[#1F2937] block mb-1">
                  Evidence Description & Rectification Summary
                </label>
                <textarea
                  rows={3}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Detail the corrective steps completed, contractor report, training signed roster, etc..."
                  className="w-full rounded-md border border-[#D1FAE5] p-2 text-xs bg-white text-[#1F2937] focus:border-[#059669] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#1F2937] block mb-1">
                  Photo / Report Attachment Reference URL (Optional)
                </label>
                <Input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or /evidence/IMG-2026-CHILLER.jpg"
                  className="text-xs h-9 border-[#D1FAE5] bg-white text-[#1F2937]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEvidenceModalItem(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingEvidence}
                  className="bg-[#059669] hover:bg-[#047857] text-white font-semibold cursor-pointer shadow-xs"
                >
                  {isSubmittingEvidence ? "Submitting..." : "Submit to Officer for Verification"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICER VERIFICATION MODAL */}
      {verifyModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D1FAE5] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-xs my-auto">
            <div className="flex items-start justify-between border-b border-[#D1FAE5]/60 pb-3">
              <div>
                <span className="font-mono font-bold text-[#064E3B]">{verifyModalItem.actionId}</span>
                <h3 className="text-base font-bold text-[#064E3B] pt-0.5">
                  Officer Verification & Sign-Off
                </h3>
              </div>
              <button onClick={() => setVerifyModalItem(null)} className="text-[#64748B] hover:text-[#064E3B] cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 bg-[#F0FDF4]/60 rounded-lg border border-[#D1FAE5] space-y-1">
              <span className="font-bold text-[#1F2937] block">{verifyModalItem.issue}</span>
              {verifyModalItem.evidence ? (
                <p className="text-[#059669] font-medium pt-1">
                  Submitted Evidence: {verifyModalItem.evidence}
                </p>
              ) : (
                <p className="text-amber-700 font-medium pt-1">
                  Note: No remedial evidence uploaded yet.
                </p>
              )}
            </div>

            <form onSubmit={handleVerifyAction} className="space-y-3">
              <span className="font-semibold text-[#1F2937] block">
                Verification Decision
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyDecision("APPROVED")}
                  className={`p-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                    verifyDecision === "APPROVED"
                      ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                      : "border-[#D1FAE5] text-[#64748B] hover:bg-[#F0FDF4]"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>Approve & Close Issue</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyDecision("REJECTED")}
                  className={`p-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer ${
                    verifyDecision === "REJECTED"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "border-[#D1FAE5] text-[#64748B] hover:bg-red-50"
                  }`}
                >
                  <X className="h-4 w-4" />
                  <span>Reject & Require Re-work</span>
                </button>
              </div>

              <div>
                <label className="font-semibold text-[#1F2937] block mb-1">
                  Officer Inspection Remarks & Compliance Notes
                </label>
                <textarea
                  rows={3}
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  placeholder="Detail physical inspection observations, verification rationale, and sign-off remarks..."
                  className="w-full rounded-md border border-[#D1FAE5] p-2 text-xs bg-white text-[#1F2937] focus:border-[#059669] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setVerifyModalItem(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingVerify}
                  className="bg-[#059669] hover:bg-[#047857] text-white font-semibold cursor-pointer shadow-xs"
                >
                  {isSubmittingVerify ? "Recording Sign-off..." : "Commit Officer Decision"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CORRECTIVE ACTION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-[#D1FAE5] rounded-2xl max-w-xl sm:max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Modal Header - Fixed at Top */}
            <div className="flex items-start justify-between border-b border-[#D1FAE5]/60 px-6 py-4.5 shrink-0 bg-[#F0FDF4]/60">
              <div>
                <h3 className="text-base font-bold text-[#064E3B]">
                  Assign New Corrective Action (CAPA)
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Initiate statutory remediation workflow for an identified infraction.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-[#64748B] hover:text-[#064E3B] p-1 rounded-lg hover:bg-[#F0FDF4] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable Content & Fixed Footer */}
            <form onSubmit={handleCreateAction} className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Fields Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-[#1F2937] block mb-1.5">
                      Target Outlet
                    </label>
                    <select
                      value={newOutletId}
                      onChange={(e) => setNewOutletId(e.target.value)}
                      className="w-full h-9.5 rounded-lg border border-[#D1FAE5] bg-white px-3 text-xs font-semibold text-[#1F2937] cursor-pointer focus:border-[#059669] focus:outline-none"
                      disabled={isFranchise}
                    >
                      <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                      <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                      <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                      <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-[#1F2937] block mb-1.5">
                      Priority Tier
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full h-9.5 rounded-lg border border-[#D1FAE5] bg-white px-3 text-xs font-semibold text-[#1F2937] cursor-pointer focus:border-[#059669] focus:outline-none"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#1F2937] block mb-1.5">
                    Issue Title / Violation Detected
                  </label>
                  <Input
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    placeholder="e.g. Chiller temperature reading exceeded par (+8.5°C)"
                    className="text-xs h-9.5 rounded-lg border-[#D1FAE5] bg-white text-[#1F2937]"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#1F2937] block mb-1.5">
                    Required Corrective Action (Remediation Mandate)
                  </label>
                  <textarea
                    rows={3}
                    value={newRequiredAction}
                    onChange={(e) => setNewRequiredAction(e.target.value)}
                    placeholder="e.g. Inspect door magnetic gasket seal, recalibrate digital sensor probe, and log hourly verification temps for 48 hours."
                    className="w-full rounded-lg border border-[#D1FAE5] p-3 text-xs bg-white text-[#1F2937] focus:border-[#059669] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-[#1F2937] block mb-1.5">
                      Assigned Person / Manager / Lead
                    </label>
                    <Input
                      value={newAssignedPerson}
                      onChange={(e) => setNewAssignedPerson(e.target.value)}
                      placeholder="e.g. Yuvraj Buddha (GM)"
                      className="text-xs h-9.5 rounded-lg border-[#D1FAE5] bg-white text-[#1F2937]"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#1F2937] block mb-1.5">
                      Statutory Deadline (Due Date)
                    </label>
                    <Input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="text-xs h-9.5 rounded-lg border-[#D1FAE5] bg-white text-[#1F2937]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#1F2937] block mb-1.5">
                    Compliance Category
                  </label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Cold Chain Hygiene / Food Safety"
                    className="text-xs h-9.5 rounded-lg border-[#D1FAE5] bg-white text-[#1F2937]"
                  />
                </div>
              </div>

              {/* Modal Footer - Fixed at Bottom, Never Cut Off */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#D1FAE5]/60 bg-[#F0FDF4]/60 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                  className="cursor-pointer h-9 px-4 text-xs rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCreating}
                  className="bg-[#059669] hover:bg-[#047857] text-white font-semibold cursor-pointer h-9 px-4 text-xs rounded-lg shadow-sm"
                >
                  {isCreating ? "Assigning..." : "Assign Corrective Action"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
