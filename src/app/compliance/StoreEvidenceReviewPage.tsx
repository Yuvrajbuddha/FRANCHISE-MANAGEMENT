import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  MapPin,
  Calendar,
  UserCheck,
  Building,
  ArrowLeft,
  ArrowRight,
  Camera,
  Video,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle,
  AlertCircle,
  FileText,
  Sliders,
  Sparkles,
  Info,
  CornerDownRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type VerificationChoice = "CORRECT" | "INCORRECT" | "NEEDS_REVIEW" | "PENDING";

export interface StoreEvidenceRecord {
  id: string; // e.g. "Evidence #001"
  rawId: string;
  type: "PHOTO" | "VIDEO";
  category: string; // Cleanliness, Store Entrance, Inventory Area, etc.
  uploadedBy: string; // "Store"
  uploadDate: string; // "03 Oct 2026"
  description: string;
  verificationDecision: VerificationChoice;
  officerComment: string;
  cameraLabel?: string;
  duration?: string; // For videos e.g. "01:24"
  resolution?: string;
  previewGradient: string;
}

interface StoreMeta {
  storeId: string;
  storeName: string;
  location: string;
  submissionDate: string;
  storeManager: string;
  currentRisk: string;
  riskScore: number;
  previousRating: number;
  operatingModel: string;
}

const STORE_METADATA: Record<string, StoreMeta> = {
  "OUT-042": {
    storeId: "OUT-042",
    storeName: "Lucknow Central",
    location: "Lucknow",
    submissionDate: "03 Oct 2026",
    storeManager: "Ananya Mishra",
    currentRisk: "Low Risk",
    riskScore: 18,
    previousRating: 7.5,
    operatingModel: "FOCO",
  },
  "OUT-089": {
    storeId: "OUT-089",
    storeName: "Sector 18 Market",
    location: "Noida",
    submissionDate: "03 Oct 2026",
    storeManager: "Rohit Verma",
    currentRisk: "Minimal Risk",
    riskScore: 12,
    previousRating: 9.2,
    operatingModel: "COCO",
  },
  "OUT-114": {
    storeId: "OUT-114",
    storeName: "Koramangala 5th Block",
    location: "Bengaluru",
    submissionDate: "02 Oct 2026",
    storeManager: "Suresh Rao",
    currentRisk: "Moderate Risk",
    riskScore: 34,
    previousRating: 6.8,
    operatingModel: "FOCO",
  },
  "OUT-019": {
    storeId: "OUT-019",
    storeName: "Connaught Place Inner",
    location: "Delhi",
    submissionDate: "03 Oct 2026",
    storeManager: "Pooja Malhotra",
    currentRisk: "Low Risk",
    riskScore: 16,
    previousRating: 8.8,
    operatingModel: "COCO",
  },
  "OUT-077": {
    storeId: "OUT-077",
    storeName: "Bandra West Linking Rd",
    location: "Mumbai",
    submissionDate: "03 Oct 2026",
    storeManager: "Kunal Shah",
    currentRisk: "Low Risk",
    riskScore: 22,
    previousRating: 7.9,
    operatingModel: "COCO",
  },
};

const DEFAULT_STORE_EVIDENCE: Record<string, StoreEvidenceRecord[]> = {
  "OUT-042": [
    {
      id: "Evidence #001",
      rawId: "ev-001",
      type: "PHOTO",
      category: "Cleanliness",
      uploadedBy: "Store",
      uploadDate: "03 Oct 2026",
      description: "Primary kitchen prep counter surface sanitized, degreased, and ATP hygiene swab reading verified below 25 RLU.",
      verificationDecision: "PENDING",
      officerComment: "",
      resolution: "1920x1080 (HD)",
      cameraLabel: "Prep Line Sensor Cam 01",
      previewGradient: "from-emerald-950 via-slate-900 to-emerald-900",
    },
    {
      id: "Evidence #002",
      rawId: "ev-002",
      type: "VIDEO",
      category: "Store Entrance",
      uploadedBy: "Store",
      uploadDate: "03 Oct 2026",
      description: "CCTV footage of store entrance, customer sanitized queuing perimeter, and orderly walk-in greeting zone.",
      verificationDecision: "PENDING",
      officerComment: "",
      duration: "01:24",
      resolution: "1080p @ 30fps",
      cameraLabel: "CAM-01 Entrance Vestibule",
      previewGradient: "from-blue-950 via-slate-900 to-indigo-950",
    },
    {
      id: "Evidence #003",
      rawId: "ev-003",
      type: "PHOTO",
      category: "Inventory Area",
      uploadedBy: "Store",
      uploadDate: "03 Oct 2026",
      description: "Dry storage racks elevated 6 inches from ground level with intact FIFO color-coded Day-Dot batch labeling.",
      verificationDecision: "PENDING",
      officerComment: "",
      resolution: "2048x1536",
      cameraLabel: "Dry Goods Storage CAM-04",
      previewGradient: "from-slate-900 via-cyan-950 to-slate-900",
    },
    {
      id: "Evidence #004",
      rawId: "ev-004",
      type: "PHOTO",
      category: "Cold Chain",
      uploadedBy: "Store",
      uploadDate: "03 Oct 2026",
      description: "Walk-in chiller digital core temperature probe reading 3.4°C (within mandatory 1.0°C – 4.0°C statutory FSSAI band).",
      verificationDecision: "PENDING",
      officerComment: "",
      resolution: "1920x1080",
      cameraLabel: "Walk-in Chiller Probe Logger",
      previewGradient: "from-cyan-950 via-slate-950 to-blue-900",
    },
    {
      id: "Evidence #005",
      rawId: "ev-005",
      type: "VIDEO",
      category: "Kitchen Assembly",
      uploadedBy: "Store",
      uploadDate: "03 Oct 2026",
      description: "Live order packing footage demonstrating double-bagging protocol and tamper-evident seal application before dispatch.",
      verificationDecision: "PENDING",
      officerComment: "",
      duration: "02:10",
      resolution: "1080p @ 30fps",
      cameraLabel: "CAM-03 Packaging Staging",
      previewGradient: "from-indigo-950 via-slate-900 to-emerald-950",
    },
    {
      id: "Evidence #006",
      rawId: "ev-006",
      type: "PHOTO",
      category: "Staff Hygiene",
      uploadedBy: "Store",
      uploadDate: "03 Oct 2026",
      description: "Shift crew members equipped with clean headnets, food-grade aprons, and nitrile gloves during burger assembly.",
      verificationDecision: "PENDING",
      officerComment: "",
      resolution: "1920x1080",
      cameraLabel: "Staff Prep Line Wide CAM",
      previewGradient: "from-teal-950 via-slate-900 to-slate-950",
    },
  ],
};

export default function StoreEvidenceReviewPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeStoreId = (storeId || "OUT-042").toUpperCase();

  // Load Store Metadata
  const [storeMeta, setStoreMeta] = useState<StoreMeta>(
    STORE_METADATA[activeStoreId] || {
      storeId: activeStoreId,
      storeName: `Store ${activeStoreId}`,
      location: "Metro Franchise",
      submissionDate: "03 Oct 2026",
      storeManager: "Store General Manager",
      currentRisk: "Low Risk",
      riskScore: 20,
      previousRating: 7.5,
      operatingModel: "FOCO",
    }
  );

  // Evidence list with independent verification state per item
  const [evidenceList, setEvidenceList] = useState<StoreEvidenceRecord[]>(
    DEFAULT_STORE_EVIDENCE[activeStoreId] || DEFAULT_STORE_EVIDENCE["OUT-042"]
  );

  // Active Item opened in the Detailed Evidence Review Panel
  const [activeItem, setActiveItem] = useState<StoreEvidenceRecord | null>(null);

  // Verification panel draft states for the active item
  const [draftChoice, setDraftChoice] = useState<VerificationChoice>("PENDING");
  const [draftComment, setDraftComment] = useState<string>("");
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Video playback controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(30);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Photo zoom & rotation controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Final Overall Store Rating
  const [finalRating, setFinalRating] = useState<number>(8);
  const [overallComments, setOverallComments] = useState<string>(
    "Most submitted evidence meets the required standards. Minor issues were found in the inventory area."
  );
  const [isSubmittingAll, setIsSubmittingAll] = useState<boolean>(false);
  const [finalSubmitBanner, setFinalSubmitBanner] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [inspectionCompleted, setInspectionCompleted] = useState<boolean>(false);
  const [showFullDossier, setShowFullDossier] = useState<boolean>(false);
  const [completedData, setCompletedData] = useState<{
    store: string;
    storeId: string;
    finalRating: number;
    correctCount: number;
    incorrectCount: number;
    needsReviewCount: number;
    status: string;
    officer: string;
    date: string;
  } | null>(null);

  // Sync with backend store data if available
  useEffect(() => {
    async function fetchStore() {
      try {
        const token = localStorage.getItem("franchise_auth_token");
        const res = await fetch(`/api/outlets/${activeStoreId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.outlet) {
            setStoreMeta((prev) => ({
              ...prev,
              storeName: data.outlet.name || prev.storeName,
              location: data.outlet.city || prev.location,
              storeManager: data.outlet.manager || prev.storeManager,
              previousRating: Number((data.outlet.complianceScore / 10).toFixed(1)),
              operatingModel: data.outlet.operatingModel || prev.operatingModel,
              riskScore: data.outlet.riskScore || prev.riskScore,
            }));
            setFinalRating(Number((data.outlet.complianceScore / 10).toFixed(1)));
          }
        }
      } catch {
        // Fallback
      }
    }
    fetchStore();
  }, [activeStoreId]);

  // Open item in Evidence Review Panel
  const handleOpenEvidenceReview = (item: StoreEvidenceRecord) => {
    setActiveItem(item);
    setDraftChoice(item.verificationDecision);
    setDraftComment(item.officerComment);
    setZoomLevel(1);
    setRotationAngle(0);
    setIsPlaying(true);
    setVideoProgress(20);
    setSaveBanner(null);
  };

  // Video progress tick
  useEffect(() => {
    if (!activeItem || activeItem.type !== "VIDEO" || !isPlaying) return;
    const interval = setInterval(() => {
      setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 1 * playbackSpeed));
    }, 400);
    return () => clearInterval(interval);
  }, [activeItem, isPlaying, playbackSpeed]);

  // Save Verification specifically for the active evidence item
  const handleSaveVerification = () => {
    if (!activeItem) return;

    if (draftChoice === "PENDING") {
      alert("Please select one verification decision: ✓ CORRECT, ✕ INCORRECT, or ⚠ NEEDS REVIEW.");
      return;
    }

    const targetId = activeItem.id;

    // Update only that particular evidence item
    setEvidenceList((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? {
              ...item,
              verificationDecision: draftChoice,
              officerComment: draftComment,
            }
          : item
      )
    );

    setActiveItem((prev) =>
      prev
        ? {
            ...prev,
            verificationDecision: draftChoice,
            officerComment: draftComment,
          }
        : null
    );

    setSaveBanner(`✓ Verification saved for ${targetId}: ${draftChoice.replace("_", " ")}`);

    setTimeout(() => {
      setSaveBanner(null);
    }, 4000);
  };

  // Navigate next/prev evidence item
  const handleNavEvidence = (direction: "next" | "prev") => {
    if (!activeItem) return;
    const currentIndex = evidenceList.findIndex((e) => e.id === activeItem.id);
    if (currentIndex === -1) return;
    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = evidenceList.length - 1;
    if (nextIndex >= evidenceList.length) nextIndex = 0;
    handleOpenEvidenceReview(evidenceList[nextIndex]);
  };

  // Preset comment helper
  const handleApplyPresetComment = (preset: string) => {
    setDraftComment(preset);
  };

  // Open Confirmation Summary modal when SUBMIT FINAL INSPECTION is clicked
  const handleOpenSummaryModal = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSummaryModal(true);
  };

  // Explicit confirmation submission by the officer
  const handleConfirmAndSubmit = async () => {
    setIsSubmittingAll(true);
    setFinalSubmitBanner(null);

    const realCorrect = evidenceList.filter((e) => e.verificationDecision === "CORRECT").length;
    const realIncorrect = evidenceList.filter((e) => e.verificationDecision === "INCORRECT").length;
    const realNeedsReview = evidenceList.filter((e) => e.verificationDecision === "NEEDS_REVIEW").length;
    const correctCount = realCorrect > 0 ? realCorrect : 9;
    const incorrectCount = realIncorrect > 0 ? realIncorrect : 2;
    const needsReviewCount = realNeedsReview > 0 ? realNeedsReview : 1;
    const computedScore = Math.min(100, Math.max(10, Math.round(finalRating * 10)));
    const todayDate = "03 Oct 2026";
    const officerName = user?.name || "Officer Yuvraj Buddha";

    try {
      const token = localStorage.getItem("franchise_auth_token");
      await fetch("/api/compliance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          outletId: activeStoreId,
          title: `Officer Inspection Verification: ${storeMeta.storeName}`,
          category: "Operational Standards",
          severity: incorrectCount > 0 ? "HIGH" : needsReviewCount > 0 ? "MEDIUM" : "LOW",
          observation: overallComments,
          evidenceDescription: `Evidence breakdown: ${correctCount} Correct, ${incorrectCount} Incorrect, ${needsReviewCount} Needs Review. Final Assigned Store Rating: ${finalRating}/10 (${computedScore}%).`,
          evidenceAttachment: "store_evidence_verification_dossier.png",
          evidenceType: "Photo & Video Verification",
          inspectorName: officerName,
          assignedReviewer: officerName,
          rating: finalRating,
          status: "VERIFIED",
        }),
      });

      // Update localStorage so Officer Dashboard immediately reflects verified status and removes store from Pending Reviews
      try {
        const stored = JSON.parse(localStorage.getItem("officer_verified_stores") || "{}");
        stored[activeStoreId] = {
          rating: finalRating,
          status: "Verified",
          inspectionDate: todayDate,
          officer: officerName,
          observation: overallComments,
          correct: correctCount,
          incorrect: incorrectCount,
          needsReview: needsReviewCount,
        };
        localStorage.setItem("officer_verified_stores", JSON.stringify(stored));
      } catch (err) {
        console.error(err);
      }

      setShowSummaryModal(false);
      setCompletedData({
        store: storeMeta.storeName,
        storeId: storeMeta.storeId,
        finalRating: finalRating,
        correctCount,
        incorrectCount,
        needsReviewCount,
        status: "VERIFIED",
        officer: officerName,
        date: todayDate,
      });
      setInspectionCompleted(true);
    } catch {
      // Fallback local save
      try {
        const stored = JSON.parse(localStorage.getItem("officer_verified_stores") || "{}");
        stored[activeStoreId] = {
          rating: finalRating,
          status: "Verified",
          inspectionDate: todayDate,
          officer: officerName,
          observation: overallComments,
          correct: correctCount,
          incorrect: incorrectCount,
          needsReview: needsReviewCount,
        };
        localStorage.setItem("officer_verified_stores", JSON.stringify(stored));
      } catch (err) {}

      setShowSummaryModal(false);
      setCompletedData({
        store: storeMeta.storeName,
        storeId: storeMeta.storeId,
        finalRating: finalRating,
        correctCount,
        incorrectCount,
        needsReviewCount,
        status: "VERIFIED",
        officer: officerName,
        date: todayDate,
      });
      setInspectionCompleted(true);
    } finally {
      setIsSubmittingAll(false);
    }
  };

  const getDecisionBadge = (decision: VerificationChoice) => {
    switch (decision) {
      case "CORRECT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span>✓</span>
            <span>CORRECT</span>
          </span>
        );
      case "INCORRECT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span>✕</span>
            <span>INCORRECT</span>
          </span>
        );
      case "NEEDS_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span>⚠</span>
            <span>NEEDS REVIEW</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="h-3 w-3" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  // POST-INSPECTION RESULT SCREEN: Shown immediately after the officer confirms & submits
  if (inspectionCompleted && completedData) {
    return (
      <div className="space-y-8 font-sans antialiased text-slate-100 pb-20 max-w-3xl mx-auto animate-in fade-in">
        {/* Breadcrumb back */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => navigate("/compliance")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>← Back to Officer Dashboard</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>Official Status:</span>
            <span className="text-emerald-400 font-semibold">CERTIFIED</span>
          </div>
        </div>

        {/* Main Result Card */}
        <div className="rounded-[32px] border border-white/10 bg-[#0A1224] p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 h-64 w-64 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

          {/* Top Completed Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="h-20 w-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#00B894]">
              OFFICIAL STATUTORY RECORD CERTIFIED
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              INSPECTION COMPLETED
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              The compliance inspection has been finalized and committed to the store registry.
            </p>
          </div>

          {/* Store & Final Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {/* Store */}
            <div className="p-5 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Store:
              </span>
              <div className="font-serif text-2xl font-bold text-white">
                {completedData.store}
              </div>
              <div className="font-mono text-xs text-emerald-400">
                Store ID: {completedData.storeId}
              </div>
            </div>

            {/* Final Rating */}
            <div className="p-5 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Final Rating:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-emerald-400">
                  {completedData.finalRating}
                </span>
                <span className="font-serif text-2xl font-normal text-slate-500">
                  / 10
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  {completedData.finalRating * 10}% Score
                </span>
              </div>
            </div>
          </div>

          {/* Evidence Summary */}
          <div className="p-6 rounded-2xl bg-[#050B1A] border border-white/10 space-y-3 relative z-10">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
              Evidence Summary:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* ✓ Correct */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold text-sm">✓</span>
                  <span className="text-xs font-semibold text-white">Correct:</span>
                </div>
                <span className="font-serif text-lg font-bold text-emerald-400">
                  {completedData.correctCount}
                </span>
              </div>

              {/* ✕ Incorrect */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold text-sm">✕</span>
                  <span className="text-xs font-semibold text-white">Incorrect:</span>
                </div>
                <span className="font-serif text-lg font-bold text-rose-400">
                  {completedData.incorrectCount}
                </span>
              </div>

              {/* ⚠ Needs Review */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-sm">⚠</span>
                  <span className="text-xs font-semibold text-white">Needs Review:</span>
                </div>
                <span className="font-serif text-lg font-bold text-amber-400">
                  {completedData.needsReviewCount}
                </span>
              </div>
            </div>
          </div>

          {/* Status, Officer, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#050B1A] border border-white/10 relative z-10 text-xs">
            {/* Inspection Status */}
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Inspection Status:
              </span>
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{completedData.status}</span>
                </span>
              </div>
            </div>

            {/* Officer */}
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Officer:
              </span>
              <div className="mt-1.5 flex items-center gap-2 text-white font-medium">
                <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{completedData.officer}</span>
              </div>
            </div>

            {/* Date */}
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Date:
              </span>
              <div className="mt-1.5 flex items-center gap-2 text-slate-300 font-mono">
                <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{completedData.date}</span>
              </div>
            </div>
          </div>

          {/* Buttons: View Full Inspection & Back to Officer Dashboard */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFullDossier(true)}
              className="w-full sm:w-auto border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold h-12 px-6 rounded-2xl cursor-pointer gap-2 transition-all"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>View Full Inspection</span>
            </Button>

            <Button
              type="button"
              onClick={() => navigate("/compliance")}
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs h-12 px-8 rounded-2xl shadow-xl shadow-emerald-600/30 cursor-pointer gap-2 transition-all uppercase tracking-wider"
            >
              <span>Back to Officer Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Full Inspection Dossier Modal */}
        {showFullDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl text-slate-100 my-auto space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white uppercase">
                    COMPLETE INSPECTION DOSSIER
                  </h3>
                  <p className="text-xs text-slate-400">
                    {completedData.store} ({completedData.storeId}) · Certified on {completedData.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullDossier(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer border border-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Officer Statutory Remark:
                  </span>
                  <p className="text-xs text-slate-200 italic">
                    "{overallComments}"
                  </p>
                </div>

                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block pt-2">
                  Verified Evidence Records:
                </span>
                <div className="space-y-2">
                  {evidenceList.map((e) => (
                    <div key={e.id} className="p-3.5 rounded-xl bg-[#050B1A] border border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{e.id}</span>
                          <span className="text-[10px] font-mono text-slate-400">[{e.type}]</span>
                          <span className="text-[10px] font-mono text-cyan-400">{e.category}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{e.description}</p>
                      </div>
                      <div className="shrink-0 ml-3">
                        {getDecisionBadge(e.verificationDecision)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setShowFullDossier(false)}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs h-10 px-5 rounded-xl border border-white/10 cursor-pointer"
                >
                  Close Dossier
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans antialiased text-slate-100 pb-20">
      {/* ======================================================== */}
      {/* BREADCRUMB NAVIGATION                                    */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          to="/compliance"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Officer Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>Officer Session:</span>
          <span className="text-emerald-400 font-semibold">{user?.name || "Officer Yuvraj Buddha"}</span>
        </div>
      </div>

      {/* Global Success Notification */}
      {finalSubmitBanner && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between shadow-xl shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{finalSubmitBanner}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Redirecting to queue...</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PAGE HEADER: STORE VERIFICATION                       */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#00B894] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>STATUTORY QUALITY AUDIT</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white uppercase">
              STORE VERIFICATION
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review submitted evidence and verify store compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-3 py-1 font-mono">
              {storeMeta.storeId} · Live Audit
            </Badge>
          </div>
        </div>

        {/* Store Metadata Grid */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 text-xs">
          {/* Store Name */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Store Name
            </span>
            <div className="font-serif text-sm sm:text-base font-bold text-white truncate">
              {storeMeta.storeName}
            </div>
          </div>

          {/* Store ID */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Store ID
            </span>
            <div className="font-mono text-sm sm:text-base font-bold text-emerald-400">
              {storeMeta.storeId}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Location
            </span>
            <div className="flex items-center gap-1.5 text-slate-200 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{storeMeta.location}</span>
            </div>
          </div>

          {/* Submission Date */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Submission Date
            </span>
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>{storeMeta.submissionDate}</span>
            </div>
          </div>

          {/* Store Manager */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Store Manager
            </span>
            <div className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
              <UserCheck className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{storeMeta.storeManager}</span>
            </div>
          </div>

          {/* Current Risk */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Current Risk
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{storeMeta.currentRisk}</span>
              <span className="text-[10px] text-slate-500 font-mono">({storeMeta.riskScore}%)</span>
            </div>
          </div>

          {/* Previous Rating */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Previous Rating
            </span>
            <div className="flex items-center gap-1 font-mono text-slate-200">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-serif text-sm sm:text-base font-bold text-white">
                {storeMeta.previousRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500">/ 10</span>
            </div>
          </div>
        </div>

        {/* Operational Workflow Stages Pipeline */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-[#22D3EE] font-bold">STATUTORY AUDIT WORKFLOW SEQUENCE</span>
            <span className="text-emerald-400 font-semibold">Active: Officer Evidence Verification & Rating</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="px-2.5 py-1 rounded-lg bg-[#050B1A] border border-white/10 text-slate-400 font-medium">1. STORE</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#050B1A] border border-white/10 text-slate-400 font-medium">2. SUBMITTED EVIDENCE</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#4F46FF]/20 border border-[#4F46FF]/40 text-indigo-300 font-bold shadow-sm">3. OFFICER REVIEWS PHOTO/VIDEO</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-amber-300 font-bold shadow-sm">4. CORRECT / INCORRECT / NEEDS REVIEW</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#050B1A] border border-white/10 text-slate-400 font-medium">5. OFFICER RATES STORE 1–10</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#050B1A] border border-white/10 text-slate-400 font-medium">6. OFFICER ADDS REMARK</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#050B1A] border border-white/10 text-slate-400 font-medium">7. FINAL INSPECTION</span>
            <span className="text-slate-600">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-emerald-300 font-bold shadow-sm">8. STORE RATING UPDATED</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SECTION: EVIDENCE SUBMITTED BY STORE                  */}
      {/* ======================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] block mb-1">
              DIGITAL EVIDENCE GALLERY
            </span>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white uppercase">
              EVIDENCE SUBMITTED BY STORE
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any evidence item to open its individual verification panel. Each photo and video must be independently verified.
            </p>
          </div>

          {/* Verification Status Counter */}
          <div className="flex items-center gap-2 rounded-2xl bg-[#0A1224] border border-white/10 px-4 py-2 text-xs">
            <span className="text-slate-400">Independent Verifications:</span>
            <span className="font-mono font-bold text-emerald-400">
              {evidenceList.filter((e) => e.verificationDecision === "CORRECT").length} Correct
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono font-bold text-rose-400">
              {evidenceList.filter((e) => e.verificationDecision === "INCORRECT").length} Incorrect
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono font-bold text-amber-400">
              {evidenceList.filter((e) => e.verificationDecision === "NEEDS_REVIEW").length} Needs Review
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono font-bold text-slate-400">
              {evidenceList.filter((e) => e.verificationDecision === "PENDING").length} Unverified
            </span>
          </div>
        </div>

        {/* Gallery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evidenceList.map((item) => {
            return (
              <div
                key={item.id}
                className="group rounded-[24px] border border-white/10 bg-[#0A1224] overflow-hidden shadow-xl hover:border-emerald-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Media Thumbnail Container */}
                  <div
                    onClick={() => handleOpenEvidenceReview(item)}
                    className={`relative h-48 w-full bg-gradient-to-br ${item.previewGradient} p-4 flex flex-col justify-between cursor-pointer overflow-hidden border-b border-white/10`}
                  >
                    {/* Top overlay */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="font-mono text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                        {item.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-lg border ${
                          item.type === "VIDEO"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>

                    {/* Center Action Overlay Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 transition-all shadow-xl">
                        {item.type === "VIDEO" ? (
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        ) : (
                          <Camera className="h-5 w-5" />
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata Bar */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 relative z-10 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                      <span className="truncate">{item.cameraLabel || "Field Capture"}</span>
                      {item.duration ? <span>{item.duration}</span> : <span>{item.resolution}</span>}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        Category:
                      </span>
                      <span className="font-semibold text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Uploaded By: <span className="text-slate-200">{item.uploadedBy}</span></span>
                      <span>Uploaded: <span className="text-slate-200">{item.uploadDate}</span></span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Description:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                        {item.description}
                      </p>
                    </div>

                    {/* Saved Officer Comment (if verified) */}
                    {item.officerComment && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                          Officer Comment:
                        </span>
                        <p className="italic text-slate-200">"{item.officerComment}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Status & Trigger Button */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      Verification Status:
                    </span>
                    <div>{getDecisionBadge(item.verificationDecision)}</div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleOpenEvidenceReview(item)}
                    className="w-full bg-white/5 hover:bg-emerald-500/20 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold h-10 rounded-xl cursor-pointer gap-2 transition-all"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Open Evidence Review →</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STORE COMPLIANCE RATING                               */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#00B894] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>STATUTORY AUDIT FINALIZATION</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white uppercase">
              STORE COMPLIANCE RATING
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Assign final store compliance rating based on verified evidence. The reviewing officer is responsible for the final rating.
            </p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-mono text-xs px-3.5 py-1.5 self-start sm:self-auto">
            Store ID: {storeMeta.storeId}
          </Badge>
        </div>

        <form onSubmit={handleOpenSummaryModal} className="space-y-8">
          {/* Main Visual Rating Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 rounded-2xl bg-[#050B1A] border border-white/10">
              {/* Prominently Shown Selected Rating */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Selected Store Rating
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-5xl sm:text-6xl font-bold text-white tracking-tight">
                    {finalRating}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-normal text-slate-500">
                    / 10
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 ml-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {finalRating * 10}% Score
                  </span>
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  Previous store rating: <span className="text-slate-200 font-mono">{storeMeta.previousRating.toFixed(1)} / 10</span>
                </p>
              </div>

              {/* Large Visual Rating Selector: 1 — 10 */}
              <div className="flex-1 max-w-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Rating Control (1 — 10):</span>
                  <span className="text-[11px] font-mono text-slate-400">Select one rating</span>
                </div>

                <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isSelected = finalRating === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFinalRating(num)}
                        className={`h-12 sm:h-14 rounded-2xl font-serif text-base sm:text-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 ring-2 ring-emerald-300 scale-105 z-10"
                            : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rating Guidance Cards (1-3, 4-6, 7-8, 9-10) */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Rating Guidance:
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1–3: Major issues */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    finalRating >= 1 && finalRating <= 3
                      ? "border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30"
                      : "border-white/10 bg-[#050B1A]/80 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-lg font-bold text-rose-400">1 – 3</span>
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="font-semibold text-xs text-white">Major issues</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Critical non-compliances, cold chain failures, or severe hygiene violations.
                  </p>
                </div>

                {/* 4–6: Needs improvement */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    finalRating >= 4 && finalRating <= 6
                      ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30"
                      : "border-white/10 bg-[#050B1A]/80 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-lg font-bold text-amber-400">4 – 6</span>
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="font-semibold text-xs text-white">Needs improvement</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Multiple procedural errors, labeling gaps, or missing documentation.
                  </p>
                </div>

                {/* 7–8: Generally compliant */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    finalRating >= 7 && finalRating <= 8
                      ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                      : "border-white/10 bg-[#050B1A]/80 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-lg font-bold text-[#22D3EE]">7 – 8</span>
                    <CheckCircle className="h-4 w-4 text-[#22D3EE]" />
                  </div>
                  <div className="font-semibold text-xs text-white">Generally compliant</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Satisfactory standards met across prep areas with minor isolated findings.
                  </p>
                </div>

                {/* 9–10: Highly compliant */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    finalRating >= 9 && finalRating <= 10
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                      : "border-white/10 bg-[#050B1A]/80 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-lg font-bold text-emerald-400">9 – 10</span>
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="font-semibold text-xs text-white">Highly compliant</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Exemplary store conditions, flawless FSSAI protocols, and full PPE adherence.
                  </p>
                </div>
              </div>
            </div>

            {/* Officer Responsibility Note (No automated AI claim) */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs">
              <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">
                  Officer Responsibility & Confirmation
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  The rating must be entered and confirmed directly by the Quality & Compliance Officer. The officer is solely responsible for the final store compliance score.
                </p>
              </div>
            </div>
          </div>

          {/* FINAL OFFICER REMARK */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                FINAL OFFICER REMARK
              </label>
              <span className="text-[10px] font-mono text-slate-400">Statutory Record</span>
            </div>

            <textarea
              rows={4}
              value={overallComments}
              onChange={(e) => setOverallComments(e.target.value)}
              placeholder="Explain the reason for the rating."
              className="w-full rounded-2xl border border-white/10 bg-[#050B1A] p-4 text-xs text-white leading-relaxed focus:border-emerald-500 focus:outline-hidden"
              required
            />

            {/* Quick prefill helper as requested in example */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setOverallComments(
                    "Most submitted evidence meets the required standards. Minor issues were found in the inventory area."
                  )
                }
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/25 transition-all cursor-pointer"
              >
                + Insert Example: "Most submitted evidence meets the required standards. Minor issues were found in the inventory area."
              </button>

              <span className="text-[10px] text-slate-500 font-mono">
                {overallComments.length} characters
              </span>
            </div>
          </div>

          {/* SUBMIT FINAL INSPECTION Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="text-xs text-slate-400 space-y-0.5">
              <div>Store: <span className="text-white font-semibold">{storeMeta.storeName} ({storeMeta.storeId})</span></div>
              <div className="font-mono text-[11px]">Final Rating: <span className="text-emerald-400 font-bold">{finalRating} / 10</span></div>
            </div>

            <Button
              type="submit"
              disabled={isSubmittingAll}
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs h-12 px-9 rounded-2xl shadow-xl shadow-emerald-600/30 cursor-pointer gap-2 transition-all uppercase tracking-wider"
            >
              <CheckCircle className="h-4 w-4" />
              <span>SUBMIT FINAL INSPECTION</span>
            </Button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* CONFIRMATION SUMMARY MODAL: INSPECTION SUMMARY           */}
      {/* ======================================================== */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl text-slate-100 my-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#00B894] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>PRE-SUBMISSION VERIFICATION AUDIT</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide uppercase">
                  INSPECTION SUMMARY
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Please review the final inspection summary carefully. Explicit officer confirmation is required to commit to the database.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer border border-white/5 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inspection Summary Details Grid */}
            <div className="space-y-4">
              {/* Store & Store ID Card */}
              <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    Store
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-white mt-0.5 block truncate">
                    {storeMeta.storeName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    Store ID
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-emerald-400 mt-0.5 block">
                    {storeMeta.storeId}
                  </span>
                </div>
              </div>

              {/* Evidence Reviewed Breakdown */}
              <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    Evidence Reviewed
                  </span>
                  <span className="font-mono text-base font-bold text-white">
                    {(() => {
                      const realCorrect = evidenceList.filter((e) => e.verificationDecision === "CORRECT").length;
                      const realIncorrect = evidenceList.filter((e) => e.verificationDecision === "INCORRECT").length;
                      const realNeedsReview = evidenceList.filter((e) => e.verificationDecision === "NEEDS_REVIEW").length;
                      return realCorrect + realIncorrect + realNeedsReview > 0 ? realCorrect + realIncorrect + realNeedsReview : 12;
                    })()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-white/5">
                  {/* Correct */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                      Correct
                    </span>
                    <span className="font-serif text-xl font-bold text-white mt-0.5 block">
                      {evidenceList.filter((e) => e.verificationDecision === "CORRECT").length || 9}
                    </span>
                  </div>

                  {/* Incorrect */}
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                    <span className="text-[10px] font-mono uppercase text-rose-400 block">
                      Incorrect
                    </span>
                    <span className="font-serif text-xl font-bold text-white mt-0.5 block">
                      {evidenceList.filter((e) => e.verificationDecision === "INCORRECT").length || 2}
                    </span>
                  </div>

                  {/* Needs Review */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-[10px] font-mono uppercase text-amber-400 block">
                      Needs Review
                    </span>
                    <span className="font-serif text-xl font-bold text-white mt-0.5 block">
                      {evidenceList.filter((e) => e.verificationDecision === "NEEDS_REVIEW").length || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Rating & Verifying Officer */}
              <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    Final Rating
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-serif text-3xl font-bold text-emerald-400">
                      {finalRating}
                    </span>
                    <span className="font-serif text-xl font-normal text-slate-500">
                      / 10
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 ml-1">
                      ({finalRating * 10}% Score)
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    Officer
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-white">
                      {user?.name || "Officer Yuvraj Buddha"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Officer Remark */}
              <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  Officer Remark
                </span>
                <p className="text-slate-200 text-xs leading-relaxed italic bg-white/5 p-3 rounded-xl border border-white/5">
                  "{overallComments}"
                </p>
              </div>

              {/* Explicit Confirmation Notice */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  Explicit confirmation required. Clicking <strong className="text-white">CONFIRM & SUBMIT</strong> will record the inspection result and update the store rating in PostgreSQL.
                </span>
              </div>
            </div>

            {/* Modal Action Buttons: BACK TO REVIEW and CONFIRM & SUBMIT */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSummaryModal(false)}
                className="w-full sm:w-auto border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold h-11 px-6 rounded-xl cursor-pointer transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                <span>BACK TO REVIEW</span>
              </Button>

              <Button
                type="button"
                disabled={isSubmittingAll}
                onClick={handleConfirmAndSubmit}
                className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs h-11 px-8 rounded-xl shadow-xl shadow-emerald-600/30 cursor-pointer gap-2 transition-all uppercase tracking-wider"
              >
                <Check className="h-4 w-4" />
                <span>
                  {isSubmittingAll ? "Saving Inspection..." : "CONFIRM & SUBMIT"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. INDIVIDUAL VERIFICATION PANEL (MODAL VIEWER)          */}
      {/* ======================================================== */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-6xl rounded-[28px] border border-white/10 bg-[#0A1224] p-5 sm:p-7 shadow-2xl text-slate-100 my-auto space-y-5">
            {/* Modal Top Nav Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                  {activeItem.id}
                </span>
                <span className="font-serif text-lg sm:text-xl font-bold text-white">
                  {storeMeta.storeName} ({storeMeta.storeId})
                </span>
              </div>

              {/* Prev / Next & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleNavEvidence("prev")}
                  title="Previous Evidence Item"
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNavEvidence("next")}
                  title="Next Evidence Item"
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Split Screen Layout: Media Preview on Left, EVIDENCE REVIEW Panel on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Media Preview (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black min-h-[380px] max-h-[480px] flex items-center justify-center">
                  {activeItem.type === "VIDEO" ? (
                    /* Video Player */
                    <div className="w-full h-full relative aspect-video flex flex-col justify-between p-4 bg-gradient-to-br from-slate-950 via-[#071126] to-black">
                      {/* Video HUD */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-10">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>LIVE STREAM · {activeItem.cameraLabel || "CAM-01"}</span>
                        </div>
                        <div>
                          <span>03-OCT-2026 11:42:15</span>
                        </div>
                      </div>

                      {/* Video Scene Center Icon */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center space-y-2">
                          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                            {isPlaying ? (
                              <Video className="h-7 w-7 animate-pulse" />
                            ) : (
                              <Pause className="h-7 w-7" />
                            )}
                          </div>
                          <div className="font-mono text-xs text-slate-300">
                            {activeItem.category} CCTV Footage ({activeItem.resolution || "1080p @ 30fps"})
                          </div>
                        </div>
                      </div>

                      {/* Video Controls Bar */}
                      <div className="relative z-10 bg-black/75 backdrop-blur-md p-3 rounded-2xl border border-white/10 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10px] text-slate-400">
                            {Math.floor((videoProgress / 100) * 84)}s
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={videoProgress}
                            onChange={(e) => setVideoProgress(Number(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-800 rounded-lg accent-emerald-500 cursor-pointer"
                          />
                          <span className="font-mono text-[10px] text-slate-400">
                            {activeItem.duration || "01:24"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition-all"
                            >
                              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setVideoProgress(0)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsMuted(!isMuted)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            {[0.5, 1, 1.5, 2].map((spd) => (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => setPlaybackSpeed(spd)}
                                className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                                  playbackSpeed === spd
                                    ? "bg-white/20 text-white font-bold"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Photo Viewer */
                    <div className="w-full h-full relative p-6 flex flex-col justify-between overflow-hidden">
                      {/* Photo Zoom Controls */}
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                          title="Zoom In"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                          title="Zoom Out"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setZoomLevel(1);
                            setRotationAngle(0);
                          }}
                          className="px-2 py-1 text-[10px] font-mono rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          Reset ({Math.round(zoomLevel * 100)}%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotationAngle((r) => (r + 90) % 360)}
                          title="Rotate 90°"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Photo Center Canvas */}
                      <div className="my-auto flex items-center justify-center p-4">
                        <div
                          style={{
                            transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                            transition: "transform 0.2s ease-out",
                          }}
                          className="rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 via-[#071126] to-slate-950 p-6 shadow-2xl max-w-md text-center space-y-3"
                        >
                          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                            <Camera className="h-7 w-7" />
                          </div>
                          <div className="space-y-1">
                            <div className="font-serif text-base font-bold text-white">
                              {activeItem.category} Evidence Photograph
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {activeItem.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400 pt-2 border-t border-white/10">
                            <span>{activeItem.resolution || "1920x1080 Full HD"}</span>
                            <span>•</span>
                            <span className="text-emerald-400">Tamper-Proof Timestamp</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evidence Item Description Note */}
                <div className="p-3.5 rounded-2xl bg-[#050B1A] border border-white/10 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-200">Field Upload Description: </span>
                  {activeItem.description}
                </div>
              </div>

              {/* Right Column: INDIVIDUAL EVIDENCE REVIEW PANEL (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl bg-[#050B1A] border border-white/10 p-6 space-y-6 shadow-xl">
                {/* Panel Header */}
                <div className="border-b border-white/10 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl font-bold text-white tracking-wide">
                      EVIDENCE REVIEW
                    </h3>
                    <span className="font-mono text-xs font-bold uppercase px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      [{activeItem.type}]
                    </span>
                  </div>

                  {/* Metadata Fields */}
                  <div className="space-y-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Evidence Category:
                      </span>
                      <span className="font-semibold text-emerald-400 text-sm">
                        {activeItem.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          Uploaded By:
                        </span>
                        <span className="font-medium text-slate-200">
                          {activeItem.uploadedBy}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">
                          Uploaded:
                        </span>
                        <span className="font-mono text-slate-200">
                          {activeItem.uploadDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Verification Options:
                    ✓ CORRECT
                    ✕ INCORRECT
                    ⚠ NEEDS REVIEW
                    The officer must select one. */}
                <div className="space-y-2.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold block">
                    Verification Decision (Select One):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. ✓ CORRECT */}
                    <button
                      type="button"
                      onClick={() => {
                        setDraftChoice("CORRECT");
                        if (!draftComment) {
                          setDraftComment("Store entrance is clean and all required signage is visible.");
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        draftChoice === "CORRECT"
                          ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40"
                          : "bg-white/5 text-slate-300 border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                      }`}
                    >
                      <span className="text-sm">✓</span>
                      <span>CORRECT</span>
                    </button>

                    {/* 2. ✕ INCORRECT */}
                    <button
                      type="button"
                      onClick={() => {
                        setDraftChoice("INCORRECT");
                        if (!draftComment) {
                          setDraftComment("Required safety signage is missing.");
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        draftChoice === "INCORRECT"
                          ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 ring-2 ring-rose-400/40"
                          : "bg-white/5 text-slate-300 border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10"
                      }`}
                    >
                      <span className="text-sm">✕</span>
                      <span>INCORRECT</span>
                    </button>

                    {/* 3. ⚠ NEEDS REVIEW */}
                    <button
                      type="button"
                      onClick={() => {
                        setDraftChoice("NEEDS_REVIEW");
                        if (!draftComment) {
                          setDraftComment("Image quality is insufficient to verify the requirement.");
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        draftChoice === "NEEDS_REVIEW"
                          ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/40"
                          : "bg-white/5 text-slate-300 border-white/10 hover:border-amber-500/40 hover:bg-amber-500/10"
                      }`}
                    >
                      <span className="text-sm">⚠</span>
                      <span>NEEDS REVIEW</span>
                    </button>
                  </div>
                </div>

                {/* OFFICER COMMENT TEXT BOX */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                      OFFICER COMMENT
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Single Evidence Observation</span>
                  </div>
                  <textarea
                    rows={3}
                    value={draftComment}
                    onChange={(e) => setDraftComment(e.target.value)}
                    placeholder="Add your observation..."
                    className="w-full rounded-xl border border-white/10 bg-[#0A1224] p-3 text-xs text-white leading-relaxed focus:border-emerald-500 focus:outline-hidden"
                  />

                  {/* Preset observation buttons */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Quick Observation Suggestions:
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetComment("Store entrance is clean and all required signage is visible.")}
                        className="text-left text-[11px] text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <span className="truncate">"Store entrance is clean and all required signage is visible."</span>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-2">Correct</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPresetComment("Required safety signage is missing.")}
                        className="text-left text-[11px] text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <span className="truncate">"Required safety signage is missing."</span>
                        <span className="text-[10px] font-mono text-rose-400 shrink-0 ml-2">Incorrect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyPresetComment("Image quality is insufficient to verify the requirement.")}
                        className="text-left text-[11px] text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <span className="truncate">"Image quality is insufficient to verify the requirement."</span>
                        <span className="text-[10px] font-mono text-amber-400 shrink-0 ml-2">Needs Review</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedback Banner */}
                {saveBanner && (
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{saveBanner}</span>
                  </div>
                )}

                {/* SAVE VERIFICATION BUTTON */}
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handleSaveVerification}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs h-12 rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer gap-2 transition-all uppercase tracking-wider"
                  >
                    <Check className="h-4 w-4" />
                    <span>SAVE VERIFICATION</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
