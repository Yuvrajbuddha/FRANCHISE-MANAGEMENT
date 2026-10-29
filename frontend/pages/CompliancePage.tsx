import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
} from "@/services/cctvEvidenceStore";

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
    <div className="space-y-6 font-sans antialiased text-[#18251F] pb-20 max-w-6xl mx-auto">
      {/* ======================================================== */}
      {/* 1. OFFICER DASHBOARD HEADER                              */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#13845B] flex items-center gap-1.5 mb-1 font-bold">
            <ShieldCheck className="h-4 w-4 text-[#13845B]" />
            <span>Quality & Standards Desk · Regulatory Audit</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#073B2A]">
            Officer Compliance Queue
          </h1>
          <p className="text-xs text-[#738078] mt-1">
            Review store CCTV surveillance submissions, verify extracted evidence frames, and certify compliance ratings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#DDE5DC] bg-[#F6F1E7] px-3.5 py-2 text-xs">
            <UserCheck className="h-4 w-4 text-[#13845B]" />
            <span className="font-semibold text-[#073B2A]">
              {user?.name || "Officer Yuvraj Buddha"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshList}
            className="gap-1.5 cursor-pointer text-xs border-[#DDE5DC] bg-[#FFFDF8] text-[#073B2A] hover:bg-[#F6F1E7] rounded-lg h-9 px-3.5"
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
        <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#738078]">
            <span>Pending Reviews</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#073B2A]">
            {summaryMetrics.pending}
          </div>
          <p className="text-[11px] text-amber-700 font-mono font-medium">
            Awaiting Officer Verification
          </p>
        </div>

        {/* Verified Stores */}
        <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#738078]">
            <span>Verified Outlets</span>
            <CheckCircle2 className="h-4 w-4 text-[#13845B]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#073B2A]">
            {summaryMetrics.verified}
          </div>
          <p className="text-[11px] text-[#13845B] font-mono font-medium">
            Inspection Certified
          </p>
        </div>

        {/* Total CCTV Submissions */}
        <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#738078]">
            <span>Total CCTV Submissions</span>
            <Camera className="h-4 w-4 text-[#073B2A]" />
          </div>
          <div className="font-serif text-3xl font-bold text-[#073B2A]">
            {summaryMetrics.total}
          </div>
          <p className="text-[11px] text-[#738078] font-mono">
            Network Recordings Logged
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STORES SUBMITTED CCTV LIST                            */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDE5DC] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#073B2A]">
              CCTV Submissions Queue
            </h2>
            <p className="text-xs text-[#738078] mt-0.5">
              Stores that have uploaded daily CCTV footage. Photos have been automatically extracted for review.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#738078]" />
              <Input
                placeholder="Search store name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs border-[#DDE5DC] bg-white text-[#18251F] rounded-lg placeholder:text-[#738078] focus:border-[#073B2A]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] text-xs font-mono">
              {["ALL", "Pending Review", "Verified"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded text-[11px] cursor-pointer transition-all ${
                    statusFilter === st
                      ? "bg-[#073B2A] text-[#72D6A0] font-bold"
                      : "text-[#738078] hover:text-[#073B2A]"
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
              className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 shadow-xs space-y-4 hover:border-[#073B2A] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Store Name Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#073B2A] tracking-tight">
                      {store.storeName}
                    </h3>
                    <div className="text-xs font-mono text-[#13845B] font-semibold mt-0.5">
                      Store ID: {store.storeId}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                      store.status === "Verified"
                        ? "bg-[#13845B]/15 text-[#13845B] border border-[#13845B]/30"
                        : "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                    }`}
                  >
                    {store.status === "Verified" ? "Verified" : "Pending Review"}
                  </span>
                </div>

                {/* Information Grid: CCTV Date, Photos Generated, Duration */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#DDE5DC]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                      Recorded Date:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[#18251F] mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-[#738078]" />
                      <span>{store.uploadDate}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                      Extracted Frames:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[#18251F] font-bold mt-0.5">
                      <Camera className="h-3.5 w-3.5 text-[#13845B]" />
                      <span>{store.photosCount} Evidence Photos</span>
                    </div>
                  </div>
                </div>

                {/* Score if verified */}
                {store.finalRating && (
                  <div className="p-3 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] text-xs flex items-center justify-between">
                    <span className="text-[#738078]">Assigned Compliance Rating:</span>
                    <span className="font-serif text-base font-bold text-[#073B2A]">
                      {store.finalRating} / 10
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button: [ REVIEW STORE → ] */}
              <div className="pt-3 border-t border-[#DDE5DC]">
                <Button
                  type="button"
                  onClick={() => navigate(`/compliance/review/${store.storeId}`)}
                  className="w-full bg-[#073B2A] hover:bg-[#05291F] text-[#72D6A0] font-bold text-xs h-10 rounded-lg shadow-xs cursor-pointer gap-2 transition-all uppercase tracking-wider"
                >
                  <span>Review Store Footage →</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
