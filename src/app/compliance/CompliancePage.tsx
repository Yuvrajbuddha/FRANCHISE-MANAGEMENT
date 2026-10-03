import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Camera,
  Video,
  Sliders,
  CheckCircle,
  X,
  ChevronRight,
  ArrowRight,
  MapPin,
  Calendar,
  Building,
  AlertCircle,
  FileCheck2,
  FileText,
  BadgeAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

export type QueueStatus = "Pending Review" | "Under Review" | "Verified" | "Needs Correction";

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
        <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] font-bold">
          CRITICAL
        </Badge>
      );
    case "HIGH":
      return (
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-[10px] font-bold">
          HIGH
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold">
          MEDIUM
        </Badge>
      );
    case "LOW":
    default:
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px] font-bold">
          LOW
        </Badge>
      );
  }
}

export function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case "OPEN":
    case "PENDING REVIEW":
      return (
        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] font-semibold">
          Pending Review
        </Badge>
      );
    case "UNDER_REVIEW":
    case "UNDER REVIEW":
      return (
        <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px] font-semibold">
          Under Review
        </Badge>
      );
    case "VERIFIED":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-semibold">
          Verified
        </Badge>
      );
    case "NEEDS_CORRECTION":
    case "NEEDS CORRECTION":
      return (
        <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30 text-[10px] font-semibold">
          Needs Correction
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export interface StoreQueueItem {
  storeId: string;
  storeName: string;
  location: string;
  submissionDate: string;
  evidenceCount: number;
  currentRating: number; // e.g. 7.5
  status: QueueStatus;
  operatingModel: string;
  manager: string;
  recentObservation?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: typeof COMPLIANCE_CATEGORIES[number];
  type: "Photo" | "Video" | "Telemetry";
  timestamp: string;
  aiObservation: string;
  mediaUrl: string;
  isVerified: boolean;
}

// Initial Queue Seed Items
const INITIAL_QUEUE_STORES: StoreQueueItem[] = [
  {
    storeId: "OUT-042",
    storeName: "Lucknow Central",
    location: "Lucknow",
    submissionDate: "03 Oct 2026",
    evidenceCount: 12,
    currentRating: 7.5,
    status: "Pending Review",
    operatingModel: "FOCO",
    manager: "Ananya Mishra",
    recentObservation: "Chiller unit probe telemetry logged at 3.6°C. Walk-through photo batch submitted.",
  },
  {
    storeId: "OUT-089",
    storeName: "Sector 18 Market",
    location: "Noida",
    submissionDate: "03 Oct 2026",
    evidenceCount: 9,
    currentRating: 9.2,
    status: "Verified",
    operatingModel: "COCO",
    manager: "Rohit Verma",
    recentObservation: "Kitchen assembly prep line double-bagging protocol and sanitization completed.",
  },
  {
    storeId: "OUT-114",
    storeName: "Koramangala 5th Block",
    location: "Bengaluru",
    submissionDate: "02 Oct 2026",
    evidenceCount: 15,
    currentRating: 6.8,
    status: "Needs Correction",
    operatingModel: "FOCO",
    manager: "Suresh Rao",
    recentObservation: "Temperature warning in cold storage walk-in chiller (3.9°C); swab test required.",
  },
  {
    storeId: "OUT-019",
    storeName: "Connaught Place Inner",
    location: "Delhi",
    submissionDate: "03 Oct 2026",
    evidenceCount: 11,
    currentRating: 8.8,
    status: "Under Review",
    operatingModel: "COCO",
    manager: "Pooja Malhotra",
    recentObservation: "Freezer elevated pallets and FIFO Day-Dot color codes recorded in morning audit.",
  },
  {
    storeId: "OUT-077",
    storeName: "Bandra West Linking Rd",
    location: "Mumbai",
    submissionDate: "03 Oct 2026",
    evidenceCount: 14,
    currentRating: 7.9,
    status: "Pending Review",
    operatingModel: "COCO",
    manager: "Kunal Shah",
    recentObservation: "Quat test paper strips recorded at 200 ppm for contact surface sanitization.",
  },
  {
    storeId: "OUT-055",
    storeName: "Park Street Central",
    location: "Kolkata",
    submissionDate: "02 Oct 2026",
    evidenceCount: 8,
    currentRating: 8.6,
    status: "Verified",
    operatingModel: "COCO",
    manager: "Debashis Sen",
    recentObservation: "CCTV food prep counter feed confirmed hairnet and apron compliance.",
  },
  {
    storeId: "OUT-102",
    storeName: "Jubilee Hills Metro",
    location: "Hyderabad",
    submissionDate: "03 Oct 2026",
    evidenceCount: 13,
    currentRating: 7.2,
    status: "Pending Review",
    operatingModel: "FOCO",
    manager: "Venkat Reddy",
    recentObservation: "Oil polar value tester reading within acceptable statutory threshold.",
  },
  {
    storeId: "OUT-031",
    storeName: "FC Road Deccan",
    location: "Pune",
    submissionDate: "01 Oct 2026",
    evidenceCount: 10,
    currentRating: 6.4,
    status: "Needs Correction",
    operatingModel: "FOCO",
    manager: "Sneha Patil",
    recentObservation: "Handwash dispenser repair log pending; re-inspection scheduled.",
  },
];

const STORE_EVIDENCE_MOCK: Record<string, EvidenceItem[]> = {
  "OUT-042": [
    {
      id: "ev-1",
      title: "Kitchen Assembly Prep Counter CCTV Feed",
      category: "Hygiene",
      type: "Video",
      timestamp: "Today, 11:42 AM",
      aiObservation: "Staff in complete uniform; hairnets & clean aprons detected with 98.4% visual confidence.",
      mediaUrl: "cctv_frame_prep_counter_01.jpg",
      isVerified: true,
    },
    {
      id: "ev-2",
      title: "Walk-in Chiller Temperature Core Telemetry",
      category: "Process Adherence",
      type: "Telemetry",
      timestamp: "Today, 10:15 AM",
      aiObservation: "Core reading at 3.4°C. Well within safe statutory FSSAI threshold (max 4.0°C).",
      mediaUrl: "chiller_telemetry_probe_3.4c.jpg",
      isVerified: true,
    },
    {
      id: "ev-3",
      title: "Handwash Station Sanitizer Swab & Dispenser Log",
      category: "Store Cleanliness",
      type: "Photo",
      timestamp: "Today, 09:30 AM",
      aiObservation: "Active sanitizer sensor dispenser operational; soap replenish level verified full.",
      mediaUrl: "sanitizer_swab_inspection.jpg",
      isVerified: false,
    },
    {
      id: "ev-4",
      title: "Day-Dot FIFO Expiry Labeling on Fresh Staged Patty Batch",
      category: "Operational Standards",
      type: "Photo",
      timestamp: "Today, 08:45 AM",
      aiObservation: "Correct green dot code applied. Batch expiration scheduled for 48-hr rotation.",
      mediaUrl: "day_dot_label_verification.jpg",
      isVerified: true,
    },
    {
      id: "ev-5",
      title: "Tamper-Evident Delivery Packaging Seal Verification",
      category: "Service Quality",
      type: "Photo",
      timestamp: "Today, 12:10 PM",
      aiObservation: "Holographic tamper seal intact on all outgoing meal orders.",
      mediaUrl: "tamper_seal_delivery_pack.jpg",
      isVerified: true,
    },
  ],
};

const getInitialQueue = (): StoreQueueItem[] => {
  try {
    const stored = JSON.parse(localStorage.getItem("officer_verified_stores") || "{}");
    return INITIAL_QUEUE_STORES.map((s) => {
      if (stored[s.storeId]) {
        return {
          ...s,
          currentRating: stored[s.storeId].rating ?? s.currentRating,
          status: (stored[s.storeId].status as QueueStatus) ?? "Verified",
          recentObservation: stored[s.storeId].observation ?? s.recentObservation,
        };
      }
      return s;
    });
  } catch {
    return INITIAL_QUEUE_STORES;
  }
};

export default function CompliancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Store verification queue (loads verified stores from localStorage)
  const [queueStores, setQueueStores] = useState<StoreQueueItem[]>(getInitialQueue);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Review Store Modal state
  const [reviewStore, setReviewStore] = useState<StoreQueueItem | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [assignedRating, setAssignedRating] = useState<number>(8.0);
  const [assignedCategory, setAssignedCategory] = useState<typeof COMPLIANCE_CATEGORIES[number]>("Hygiene");
  const [assignedSeverity, setAssignedSeverity] = useState<typeof SEVERITIES[number]>("LOW");
  const [officerComments, setOfficerComments] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sync with real outlets data from PostgreSQL if available
  const fetchLiveOutlets = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem("officer_verified_stores") || "{}");
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/outlets", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.outlets && data.outlets.length > 0) {
          // Merge with initial queue
          setQueueStores((prev) => {
            const map = new Map(prev.map((s) => [s.storeId, s]));
            data.outlets.forEach((o: any) => {
              const existing = map.get(o.outletId);
              if (existing) {
                if (stored[o.outletId]) {
                  existing.currentRating = stored[o.outletId].rating;
                  existing.status = stored[o.outletId].status;
                  existing.recentObservation = stored[o.outletId].observation || existing.recentObservation;
                } else {
                  existing.currentRating = Number((o.complianceScore / 10).toFixed(1));
                  if (o.complianceScore >= 80) {
                    existing.status = "Verified";
                  }
                }
              } else {
                map.set(o.outletId, {
                  storeId: o.outletId,
                  storeName: o.name,
                  location: o.city,
                  submissionDate: "03 Oct 2026",
                  evidenceCount: 10,
                  currentRating: stored[o.outletId]?.rating ?? Number((o.complianceScore / 10).toFixed(1)),
                  status: stored[o.outletId]?.status ?? (o.complianceScore >= 80 ? "Verified" : o.complianceScore >= 70 ? "Pending Review" : "Needs Correction"),
                  operatingModel: o.operatingModel || "FOCO",
                  manager: o.manager || "Store GM",
                  recentObservation: stored[o.outletId]?.observation || "Routine compliance dossier uploaded for officer certification.",
                });
              }
            });
            return Array.from(map.values());
          });
        }
      }
    } catch {
      // Use initial queue on fallback
    }
  };

  useEffect(() => {
    fetchLiveOutlets();
  }, []);

  // Summary Metrics: reflects latest officer verifications
  const summaryMetrics = useMemo(() => {
    const isOut42Verified = queueStores.find((s) => s.storeId === "OUT-042")?.status === "Verified";
    const totalRating = queueStores.reduce((sum, s) => sum + s.currentRating, 0);
    const avgRating = queueStores.length > 0 ? (totalRating / queueStores.length).toFixed(1) : "8.4";

    return {
      pending: isOut42Verified ? 11 : 12,
      verified: isOut42Verified ? 87 : 86,
      needsCorrection: 8,
      avgRating: `${avgRating} / 10`,
    };
  }, [queueStores]);

  // Filtered Queue
  const filteredStores = useMemo(() => {
    return queueStores.filter((store) => {
      const matchesSearch =
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.storeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || store.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [queueStores, searchQuery, statusFilter]);

  // Open Review Store Modal
  const handleOpenReview = (store: StoreQueueItem) => {
    setReviewStore(store);
    setAssignedRating(store.currentRating || 7.5);
    setOfficerComments(
      `Officer inspection completed for ${store.storeName} (${store.storeId}). Evidence photos and CCTV telemetry verified. Compliance confirmed within statutory operating limits.`
    );
    // Provide store evidence items
    const storeEvidence = STORE_EVIDENCE_MOCK[store.storeId] || [
      {
        id: `ev-${store.storeId}-1`,
        title: "Kitchen Prep Counter & Double-Bagging CCTV",
        category: "Hygiene",
        type: "Video" as const,
        timestamp: "Today, 11:30 AM",
        aiObservation: "Staff in uniform, hairnets and clean aprons verified with high confidence.",
        mediaUrl: "cctv_frame_default.jpg",
        isVerified: true,
      },
      {
        id: `ev-${store.storeId}-2`,
        title: "Walk-in Chiller Temperature Probe Telemetry",
        category: "Process Adherence",
        type: "Telemetry" as const,
        timestamp: "Today, 10:15 AM",
        aiObservation: "Probe sensor reading stable at 3.5°C; complies with FSSAI regulations.",
        mediaUrl: "chiller_telemetry_probe.jpg",
        isVerified: true,
      },
      {
        id: `ev-${store.storeId}-3`,
        title: "Day-Dot FIFO Food Storage Expiry Stamp",
        category: "Operational Standards",
        type: "Photo" as const,
        timestamp: "Today, 09:00 AM",
        aiObservation: "Day-dot label applied with correct rotation date batch code.",
        mediaUrl: "day_dot_label.jpg",
        isVerified: true,
      },
    ];
    setEvidenceList(storeEvidence);
  };

  // Toggle evidence verified in modal
  const handleToggleEvidence = (id: string) => {
    setEvidenceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isVerified: !item.isVerified } : item))
    );
  };

  // Submit Inspection & Update Store Rating
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewStore) return;

    setIsSubmitting(true);
    const storeId = reviewStore.storeId;
    const computedScore = Math.min(100, Math.max(10, Math.round(assignedRating * 10)));
    const nextStatus: QueueStatus = assignedRating >= 8.0 ? "Verified" : assignedRating >= 6.5 ? "Under Review" : "Needs Correction";

    try {
      const token = localStorage.getItem("franchise_auth_token");
      await fetch("/api/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          outletId: storeId,
          title: `Officer Verified Inspection: ${reviewStore.storeName}`,
          category: assignedCategory,
          severity: assignedSeverity,
          observation: officerComments,
          evidenceDescription: `Officer verified ${evidenceList.filter((e) => e.isVerified).length}/${evidenceList.length} evidence records. Rating assigned: ${assignedRating}/10.`,
          evidenceAttachment: "officer_verified_review.jpg",
          evidenceType: "Photo & Video Verification",
          inspectorName: user?.name || "Quality & Compliance Officer",
          assignedReviewer: user?.name || "Quality & Compliance Officer",
          rating: assignedRating,
          status: "VERIFIED",
        }),
      });

      // Update store in the queue
      setQueueStores((prev) =>
        prev.map((s) =>
          s.storeId === storeId
            ? {
                ...s,
                currentRating: assignedRating,
                status: nextStatus,
                recentObservation: officerComments,
              }
            : s
        )
      );

      setSuccessBanner(
        `✓ Inspection Submitted: ${reviewStore.storeName} (${storeId}) rating updated to ${assignedRating}/10 (${computedScore}%). Status: ${nextStatus}.`
      );

      setReviewStore(null);
      setTimeout(() => setSuccessBanner(null), 8000);
    } catch {
      // Local optimistic update
      setQueueStores((prev) =>
        prev.map((s) =>
          s.storeId === storeId
            ? {
                ...s,
                currentRating: assignedRating,
                status: nextStatus,
              }
            : s
        )
      );
      setSuccessBanner(
        `✓ Inspection Submitted: ${reviewStore.storeName} (${storeId}) rating updated to ${assignedRating}/10.`
      );
      setReviewStore(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeRender = (status: QueueStatus) => {
    switch (status) {
      case "Pending Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending Review
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Under Review
          </span>
        );
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            Verified
          </span>
        );
      case "Needs Correction":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="h-3 w-3 text-rose-400" />
            Needs Correction
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans antialiased text-slate-100 pb-16">
      {/* ======================================================== */}
      {/* 1. PAGE HEADING & SUPPORTING TEXT                        */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#00B894] flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00B894] animate-pulse" />
            <span>QUALITY & COMPLIANCE OFFICER</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white uppercase">
            OFFICER DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review submitted evidence and verify store compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0A1224] px-4 py-2.5 text-xs">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-slate-200">
              {user?.name || "Officer Yuvraj Buddha"}
            </span>
            <span className="text-[10px] font-mono text-slate-500">· Senior Quality Officer</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLiveOutlets}
            className="gap-1.5 cursor-pointer text-xs border-white/10 bg-[#0A1224] text-slate-300 hover:text-white rounded-xl h-10 px-3.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Queue</span>
          </Button>
        </div>
      </div>

      {/* Global Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between shadow-lg shadow-emerald-500/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. STATUTORY OPERATIONAL WORKFLOW PIPELINE               */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#071126] p-6 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] font-bold">
              STATUTORY OFFICER VERIFICATION PIPELINE
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Quality & Compliance Officer Authority · Single Reviewer Certification
          </span>
        </div>

        {/* 8-Stage Sequential Workflow Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
          {/* 1. STORE */}
          <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-between text-center min-h-[92px] group hover:border-emerald-500/40 transition-all">
            <span className="text-[10px] font-mono text-slate-400 font-bold block">01</span>
            <span className="font-serif font-bold text-white block text-sm tracking-tight">STORE</span>
            <span className="text-[10px] text-slate-400 block font-mono">Outlets Network</span>
          </div>

          {/* 2. SUBMITTED EVIDENCE */}
          <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-between text-center min-h-[92px] group hover:border-cyan-500/40 transition-all">
            <span className="text-[10px] font-mono text-[#22D3EE] font-bold block">02</span>
            <span className="font-serif font-bold text-white block text-xs tracking-tight">SUBMITTED EVIDENCE</span>
            <span className="text-[10px] text-slate-400 block font-mono">Photos & Video</span>
          </div>

          {/* 3. OFFICER REVIEWS */}
          <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-between text-center min-h-[92px] group hover:border-indigo-500/40 transition-all">
            <span className="text-[10px] font-mono text-[#4F46FF] font-bold block">03</span>
            <span className="font-serif font-bold text-white block text-xs tracking-tight">OFFICER REVIEWS</span>
            <span className="text-[10px] text-slate-400 block font-mono">Each Media Item</span>
          </div>

          {/* 4. DECISION */}
          <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-between text-center min-h-[92px] group hover:border-amber-500/40 transition-all">
            <span className="text-[10px] font-mono text-[#F59E0B] font-bold block">04</span>
            <span className="font-serif font-bold text-white block text-[11px] leading-tight">CORRECT / INCORRECT / NEEDS REVIEW</span>
            <span className="text-[10px] text-slate-400 block font-mono">Independent</span>
          </div>

          {/* 5. OFFICER RATES 1-10 */}
          <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-between text-center min-h-[92px] group hover:border-emerald-500/40 transition-all">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block">05</span>
            <span className="font-serif font-bold text-white block text-xs tracking-tight">OFFICER RATES 1–10</span>
            <span className="text-[10px] text-slate-400 block font-mono">Visual Assigner</span>
          </div>

          {/* 6. OFFICER REMARK */}
          <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-between text-center min-h-[92px] group hover:border-purple-500/40 transition-all">
            <span className="text-[10px] font-mono text-slate-300 font-bold block">06</span>
            <span className="font-serif font-bold text-white block text-xs tracking-tight">OFFICER ADDS REMARK</span>
            <span className="text-[10px] text-slate-400 block font-mono">Statutory Reason</span>
          </div>

          {/* 7. FINAL INSPECTION */}
          <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-between text-center min-h-[92px] group hover:border-amber-500/40 transition-all">
            <span className="text-[10px] font-mono text-[#F59E0B] font-bold block">07</span>
            <span className="font-serif font-bold text-white block text-xs tracking-tight">FINAL INSPECTION</span>
            <span className="text-[10px] text-slate-400 block font-mono">Explicit Summary</span>
          </div>

          {/* 8. STORE RATING UPDATED */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between text-center min-h-[92px] shadow-lg shadow-emerald-500/10">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block">08</span>
            <span className="font-serif font-bold text-emerald-300 block text-xs tracking-tight">STORE RATING UPDATED</span>
            <span className="text-[10px] text-emerald-400/80 block font-mono">Certified Result</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SUMMARY CARDS                                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PENDING REVIEWS */}
        <div className="rounded-[24px] border border-white/10 bg-[#0A1224] p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">
              PENDING REVIEWS
            </span>
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {String(summaryMetrics.pending).padStart(2, "0")}
            </span>
            <span className="text-xs text-amber-400 font-mono font-medium">Awaiting Officer Action</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Submitted photo logs & CCTV frames pending verification.
          </p>
        </div>

        {/* Card 2: VERIFIED STORES */}
        <div className="rounded-[24px] border border-white/10 bg-[#0A1224] p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">
              VERIFIED STORES
            </span>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {summaryMetrics.verified}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">FSSAI Certified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Fully certified stores meeting all quality & hygiene standards.
          </p>
        </div>

        {/* Card 3: NEEDS CORRECTION */}
        <div className="rounded-[24px] border border-white/10 bg-[#0A1224] p-6 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">
              NEEDS CORRECTION
            </span>
            <div className="h-10 w-10 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/25 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {String(summaryMetrics.needsCorrection).padStart(2, "0")}
            </span>
            <span className="text-xs text-rose-400 font-mono font-medium">CAPA Issued</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Stores flagged with temperature or process non-conformances.
          </p>
        </div>

        {/* Card 4: AVERAGE RATING */}
        <div className="rounded-[24px] border border-white/10 bg-[#0A1224] p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-medium">
              AVERAGE RATING
            </span>
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/15 text-[#22D3EE] border border-cyan-500/25 flex items-center justify-center">
              <Star className="h-5 w-5 fill-[#22D3EE]" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
              {summaryMetrics.avgRating.split(" / ")[0]}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 10</span>
            <span className="text-xs text-[#22D3EE] font-mono font-medium ml-1">
              ({Math.round(parseFloat(summaryMetrics.avgRating) * 10)}% Score)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            Consolidated network compliance benchmark across all metros.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STORE VERIFICATION QUEUE                              */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] block mb-1">
              PRIORITY VERIFICATION WORKSPACE
            </span>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white uppercase">
              STORE VERIFICATION QUEUE
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any store in the verification pipeline to inspect evidence and submit ratings.
            </p>
          </div>

          {/* Search & Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search store, ID, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs border-white/10 bg-[#050B1A] text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#050B1A] border border-white/10 text-xs">
              {["ALL", "Pending Review", "Under Review", "Needs Correction", "Verified"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-emerald-500 text-white font-bold shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st === "ALL" ? "All Stores" : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Queue Items Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Store Name</th>
                <th className="py-3.5 px-4 font-semibold">Store ID</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Submission Date</th>
                <th className="py-3.5 px-4 font-semibold">Evidence Count</th>
                <th className="py-3.5 px-4 font-semibold">Current Rating</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStores.map((store) => {
                const isSelectedForReview = reviewStore?.storeId === store.storeId;
                return (
                  <tr
                    key={store.storeId}
                    className={`group transition-all hover:bg-white/[0.03] ${
                      isSelectedForReview ? "bg-emerald-500/10" : ""
                    }`}
                  >
                    {/* Store Name */}
                    <td className="py-4 px-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-all shrink-0">
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-serif text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {store.storeName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {store.operatingModel} Model · GM: {store.manager}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Store ID */}
                    <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                      {store.storeId}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{store.location}</span>
                      </div>
                    </td>

                    {/* Submission Date */}
                    <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{store.submissionDate}</span>
                      </div>
                    </td>

                    {/* Evidence Count */}
                    <td className="py-4 px-4 font-mono">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                        <Camera className="h-3 w-3 text-cyan-400" />
                        <span className="font-bold text-white">{store.evidenceCount}</span>
                        <span className="text-[10px] text-slate-500">files</span>
                      </div>
                    </td>

                    {/* Current Rating */}
                    <td className="py-4 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                        <span className="font-serif text-sm font-bold text-white">
                          {store.currentRating.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-500">/ 10</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {getStatusBadgeRender(store.status)}
                    </td>

                    {/* Action Button: Review Store → */}
                    <td className="py-4 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/compliance/review/${store.storeId}`)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-8 px-3.5 rounded-xl cursor-pointer gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        <span>Review Store</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODAL / REVIEW STORE WORKSPACE                        */}
      {/* ======================================================== */}
      {reviewStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl text-slate-100 my-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00B894]">
                    OFFICER VERIFICATION SESSION
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                    {reviewStore.storeId}
                  </Badge>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Review Store: {reviewStore.storeName}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Location: {reviewStore.location}</span>
                  <span>•</span>
                  <span>Submitted: {reviewStore.submissionDate}</span>
                  <span>•</span>
                  <span>Evidence: {reviewStore.evidenceCount} Files</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReviewStore(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Evidence Review Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Camera className="h-4 w-4 text-[#22D3EE]" />
                    <span>Submitted Store Evidence (Photos & CCTV)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {evidenceList.filter((e) => e.isVerified).length} / {evidenceList.length} Verified
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {evidenceList.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        item.isVerified
                          ? "border-emerald-500/30 bg-[#050B1A]"
                          : "border-amber-500/30 bg-[#050B1A]/80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                          {item.type === "Video" ? (
                            <Video className="h-4 w-4 text-indigo-400" />
                          ) : item.type === "Telemetry" ? (
                            <Sliders className="h-4 w-4 text-cyan-400" />
                          ) : (
                            <Camera className="h-4 w-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">{item.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-white/5 text-slate-400 border border-white/5">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{item.aiObservation}</p>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleEvidence(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all ${
                          item.isVerified
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:border-emerald-500/40 hover:text-white"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{item.isVerified ? "Verified" : "Verify"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1–10 Rating Assigner */}
              <div className="space-y-3 p-5 rounded-2xl bg-[#050B1A] border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block">
                      Assign Store Rating (1 – 10)
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Current: {reviewStore.currentRating}/10 → Updated: {assignedRating.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="font-serif text-3xl font-bold text-emerald-400">
                    {assignedRating.toFixed(1)}{" "}
                    <span className="text-xs font-sans font-normal text-slate-500">/ 10</span>
                  </div>
                </div>

                {/* Rating Preset Buttons 1 to 10 */}
                <div className="grid grid-cols-10 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAssignedRating(num)}
                      className={`h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        Math.round(assignedRating) === num
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105"
                          : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={assignedRating}
                  onChange={(e) => setAssignedRating(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg mt-2"
                />
              </div>

              {/* Category & Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Inspection Category
                  </label>
                  <select
                    value={assignedCategory}
                    onChange={(e) => setAssignedCategory(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-white/10 bg-[#050B1A] px-3 text-xs text-white cursor-pointer"
                  >
                    {COMPLIANCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                    Severity Classification
                  </label>
                  <select
                    value={assignedSeverity}
                    onChange={(e) => setAssignedSeverity(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-white/10 bg-[#050B1A] px-3 text-xs text-white cursor-pointer"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  Officer Comments & Remediation Notes
                </label>
                <textarea
                  rows={3}
                  value={officerComments}
                  onChange={(e) => setOfficerComments(e.target.value)}
                  placeholder="Enter detailed officer observations, physical verification findings, and recommendations..."
                  className="w-full rounded-xl border border-white/10 bg-[#050B1A] p-3 text-xs text-white leading-relaxed focus:border-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewStore(null)}
                  className="border-white/10 text-slate-400 hover:text-white rounded-xl text-xs h-11 px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-11 px-6 rounded-xl shadow-lg shadow-emerald-500/25 cursor-pointer gap-2 transition-all"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {isSubmitting
                      ? "Submitting Verification..."
                      : `Submit Inspection & Update Rating (${assignedRating.toFixed(1)}/10)`}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
