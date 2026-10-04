import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  UserCheck,
  RefreshCw,
  Camera,
  Calendar,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CctvSubmission,
  loadCctvSubmissions,
} from "@/lib/cctvEvidenceStore";

export const COMPLIANCE_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
  "RESOLVED",
] as const;

export interface ComplianceInspection {
  id: number;
  inspectionId: string;
  outletId: string;
  title: string;
  category: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
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
  return (
    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold">
      {severity}
    </Badge>
  );
}

export function getStatusBadge(status: string) {
  return (
    <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-semibold">
      {status}
    </Badge>
  );
}

export default function CompliancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load CCTV Submissions from unified store
  const [submissions, setSubmissions] = useState<CctvSubmission[]>(loadCctvSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const refreshList = () => {
    setSubmissions(loadCctvSubmissions());
  };

  useEffect(() => {
    refreshList();
  }, []);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const pendingCount = submissions.filter((s) => s.status === "Pending Review").length;
    const verifiedCount = submissions.filter((s) => s.status === "Verified").length;
    return {
      pending: pendingCount,
      verified: verifiedCount,
      total: submissions.length,
    };
  }, [submissions]);

  // Filtered Stores
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.storeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || s.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  return (
    <div className="space-y-8 font-sans antialiased text-slate-100 pb-20 max-w-5xl mx-auto">
      {/* ======================================================== */}
      {/* 1. OFFICER DASHBOARD HEADER                              */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] flex items-center gap-1.5 mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>QUALITY & COMPLIANCE OFFICER</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white uppercase">
            OFFICER DASHBOARD
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Review stores that have submitted CCTV surveillance recordings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#071126] px-4 py-2 text-xs">
            <UserCheck className="h-4 w-4 text-[#10B981]" />
            <span className="font-medium text-slate-200">
              {user?.name || "Officer Yuvraj Buddha"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshList}
            className="gap-1.5 cursor-pointer text-xs border-white/10 bg-[#071126] text-slate-300 hover:text-white rounded-xl h-10 px-3.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SIMPLE SUMMARY METRICS                                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Reviews */}
        <div className="rounded-2xl border border-white/10 bg-[#071126] p-5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
            <span>PENDING REVIEWS</span>
            <Clock className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">
            {summaryMetrics.pending}
          </div>
          <p className="text-[11px] text-[#F59E0B] font-mono">
            Awaiting Officer Verification
          </p>
        </div>

        {/* Verified Stores */}
        <div className="rounded-2xl border border-white/10 bg-[#071126] p-5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
            <span>VERIFIED STORES</span>
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">
            {summaryMetrics.verified}
          </div>
          <p className="text-[11px] text-[#10B981] font-mono">
            Inspection Certified
          </p>
        </div>

        {/* Total CCTV Submissions */}
        <div className="rounded-2xl border border-white/10 bg-[#071126] p-5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400">
            <span>TOTAL CCTV SUBMISSIONS</span>
            <Camera className="h-4 w-4 text-slate-400" />
          </div>
          <div className="font-serif text-3xl font-bold text-white">
            {summaryMetrics.total}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Store Network Recordings
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STORES SUBMITTED CCTV LIST                            */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#071126] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white uppercase">
              CCTV SUBMISSIONS QUEUE
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Stores that have uploaded daily CCTV footage. Photos have been automatically extracted for review.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search store name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs border-white/10 bg-[#050B1A] text-white rounded-xl placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#050B1A] border border-white/10 text-xs font-mono">
              {["ALL", "Pending Review", "Verified"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[11px] cursor-pointer transition-all ${
                    statusFilter === st
                      ? "bg-[#4F46FF] text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st === "ALL" ? "All" : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clean Stores Grid / Cards as specified in example */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubmissions.map((store) => (
            <div
              key={store.id}
              className="rounded-2xl border border-white/10 bg-[#050B1A] p-5 shadow-lg space-y-4 hover:border-[#4F46FF] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Store Name Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white uppercase tracking-tight">
                      {store.storeName}
                    </h3>
                    <div className="text-xs font-mono text-[#10B981] font-semibold mt-0.5">
                      Store ID: {store.storeId}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      store.status === "Verified"
                        ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                        : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
                    }`}
                  >
                    {store.status === "Verified" ? "Verified" : "Pending Review"}
                  </span>
                </div>

                {/* Information Grid: CCTV Date, Photos Generated, Duration */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      CCTV:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-200 mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{store.uploadDate}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                      Photos Generated:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-200 font-bold mt-0.5">
                      <Camera className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-200">{store.photosCount}</span>
                    </div>
                  </div>
                </div>

                {/* Score if verified */}
                {store.finalRating && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Assigned Rating:</span>
                    <span className="font-serif text-base font-bold text-[#10B981]">
                      {store.finalRating} / 10
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button: [ REVIEW STORE → ] */}
              <div className="pt-3 border-t border-white/5">
                <Button
                  type="button"
                  onClick={() => navigate(`/compliance/review/${store.storeId}`)}
                  className="w-full bg-[#4F46FF] hover:bg-[#6366F1] text-white font-bold text-xs h-11 rounded-xl shadow-md cursor-pointer gap-2 transition-all uppercase tracking-wider"
                >
                  <span>REVIEW STORE →</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
