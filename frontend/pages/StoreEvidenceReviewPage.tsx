import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CheckCircle,
  Clock,
  X,
  Check,
  AlertTriangle,
  Building,
  Calendar,
  MapPin,
  Camera,
  Star,
  FileText,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GeneratedPhoto,
  CctvSubmission,
  loadCctvSubmissions,
  saveCctvSubmissions,
  loadPhotosForStore,
  savePhotosForStore,
} from "@/services/cctvEvidenceStore";
import { STORES_MAP } from "@/utils/stores-data";

export default function StoreEvidenceReviewPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeStoreId = storeId || "OUT-042";

  // Load Submissions & Photos
  const [submissions, setSubmissions] = useState<CctvSubmission[]>(loadCctvSubmissions);
  const currentSub = submissions.find((s) => s.storeId === activeStoreId) || submissions[0];

  const matchedStore = STORES_MAP[activeStoreId];
  const storeName = currentSub?.storeName || matchedStore?.name || (activeStoreId === "OUT-042" ? "Lucknow Central" : `Store ${activeStoreId}`);
  const storeLocation = matchedStore?.city || (activeStoreId === "OUT-042" ? "Lucknow" : activeStoreId === "OUT-089" ? "Noida" : "Metro City");
  const cctvDate = currentSub?.uploadDate || "04 Oct 2026";

  const [photos, setPhotos] = useState<GeneratedPhoto[]>(() => loadPhotosForStore(activeStoreId));

  // Sync authentic frames from server storage & database
  useEffect(() => {
    const cached = loadPhotosForStore(activeStoreId);
    setPhotos(cached);

    const fetchServerSubmissions = async () => {
      try {
        const token = localStorage.getItem("franchise_auth_token") || localStorage.getItem("token") || "";
        const res = await fetch(`/api/cctv/submissions/${activeStoreId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.latestCompletedJob?.frames?.length > 0) {
            const serverFrames: GeneratedPhoto[] = data.latestCompletedJob.frames;
            setPhotos(serverFrames);
            savePhotosForStore(activeStoreId, serverFrames);
          }
        }
      } catch (err) {
        console.warn("Could not query server for store evidence:", err);
      }
    };
    fetchServerSubmissions();
  }, [activeStoreId]);

  // Active Photo Selected for Review Modal
  const [activePhoto, setActivePhoto] = useState<GeneratedPhoto | null>(null);
  const [tempDecision, setTempDecision] = useState<"Correct" | "Incorrect" | "Needs Review" | null>(null);
  const [tempComment, setTempComment] = useState<string>("");

  // Store Rating (1 - 10)
  const [finalRating, setFinalRating] = useState<number>(8);
  const [finalComment, setFinalComment] = useState<string>(
    "Most requirements were met. Minor corrective action is required for the inventory area."
  );

  // Submission & Post-Inspection Screen
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inspectionCompleted, setInspectionCompleted] = useState<boolean>(false);
  const [showFullDossier, setShowFullDossier] = useState<boolean>(false);

  // Summary counts
  const correctCount = photos.filter((p) => p.status === "Correct").length;
  const incorrectCount = photos.filter((p) => p.status === "Incorrect").length;
  const needsReviewCount = photos.filter((p) => p.status === "Needs Review").length;
  const unreviewedCount = photos.filter((p) => p.status === "Unreviewed").length;

  // Open Photo Review Panel
  const handleSelectPhoto = (photo: GeneratedPhoto) => {
    setActivePhoto(photo);
    setTempDecision(photo.status !== "Unreviewed" ? photo.status : "Correct");
    setTempComment(photo.officerComment || "");
  };

  // Save Review for Active Photo
  const handleSavePhotoReview = () => {
    if (!activePhoto || !tempDecision) return;

    const updated = photos.map((p) => {
      if (p.id === activePhoto.id) {
        return {
          ...p,
          status: tempDecision,
          officerComment: tempComment.trim() || undefined,
        };
      }
      return p;
    });

    setPhotos(updated);
    savePhotosForStore(activeStoreId, updated);
    setActivePhoto(null);
  };

  // Submit Final Inspection
  const handleSubmitInspection = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const officerName = user?.name || "Officer Yuvraj Buddha";
      const todayDate = "04 Oct 2026";

      // Update Cctv Submissions
      const updatedSubs = submissions.map((s) => {
        if (s.storeId === activeStoreId) {
          return {
            ...s,
            status: "Verified" as const,
            finalRating,
            officerComment: finalComment,
            inspectionDate: todayDate,
            officerName,
          };
        }
        return s;
      });

      saveCctvSubmissions(updatedSubs);
      setSubmissions(updatedSubs);

      // Also persist to officer_verified_stores for dashboard sync
      try {
        const stored = JSON.parse(localStorage.getItem("officer_verified_stores") || "{}");
        stored[activeStoreId] = {
          rating: finalRating,
          status: "Verified",
          inspectionDate: todayDate,
          officer: officerName,
          observation: finalComment,
          correct: correctCount,
          incorrect: incorrectCount,
          needsReview: needsReviewCount,
        };
        localStorage.setItem("officer_verified_stores", JSON.stringify(stored));
      } catch {}

      setIsSubmitting(false);
      setInspectionCompleted(true);
    }, 600);
  };

  // ========================================================
  // POST-INSPECTION RESULT SCREEN
  // ========================================================
  if (inspectionCompleted) {
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

          <span className="font-mono text-xs text-[#10B981] font-bold">
            INSPECTION CERTIFIED
          </span>
        </div>

        {/* Main Result Card */}
        <div className="rounded-[32px] border border-white/10 bg-[#071126] p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8">
          <div className="text-center space-y-3 relative z-10">
            <div className="h-20 w-20 rounded-3xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mx-auto shadow-2xl shadow-[#10B981]/20">
              <CheckCircle2 className="h-10 w-10 text-[#10B981]" />
            </div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#10B981]">
              OFFICIAL STATUTORY RECORD CERTIFIED
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              INSPECTION COMPLETED
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              The store's CCTV evidence photos have been verified and the final compliance rating is saved.
            </p>
          </div>

          {/* Store & Final Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <div className="p-5 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Store:
              </span>
              <div className="font-serif text-2xl font-bold text-white">
                {storeName}
              </div>
              <div className="font-mono text-xs text-[#10B981]">
                Store ID: {activeStoreId}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Final Rating:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-[#10B981]">
                  {finalRating}
                </span>
                <span className="font-serif text-2xl text-slate-500">/ 10</span>
                <span className="text-xs font-mono font-bold text-[#10B981] ml-2 px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
                  {finalRating * 10}% Score
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
              <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">✓ Correct:</span>
                <span className="font-serif text-lg font-bold text-[#10B981]">
                  {correctCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">✕ Incorrect:</span>
                <span className="font-serif text-lg font-bold text-[#EF4444]">
                  {incorrectCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">⚠ Needs Review:</span>
                <span className="font-serif text-lg font-bold text-[#F59E0B]">
                  {needsReviewCount}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata: Inspection Status, Officer, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#050B1A] border border-white/10 relative z-10 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Inspection Status:
              </span>
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>VERIFIED</span>
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Officer:
              </span>
              <div className="mt-1.5 flex items-center gap-2 text-white font-medium">
                <UserCheck className="h-4 w-4 text-[#10B981] shrink-0" />
                <span>{user?.name || "Officer Yuvraj Buddha"}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Date:
              </span>
              <div className="mt-1.5 flex items-center gap-2 text-slate-300 font-mono">
                <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                <span>04 Oct 2026</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: View Full Inspection & Back to Officer Dashboard */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFullDossier(true)}
              className="w-full sm:w-auto border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold h-12 px-6 rounded-2xl cursor-pointer gap-2 transition-all"
            >
              <FileText className="h-4 w-4 text-slate-300" />
              <span>View Full Inspection</span>
            </Button>

            <Button
              type="button"
              onClick={() => navigate("/compliance")}
              className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs h-12 px-8 rounded-2xl shadow-xl shadow-[#10B981]/30 cursor-pointer gap-2 transition-all uppercase tracking-wider"
            >
              <span>Back to Officer Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Full Inspection Dossier Modal */}
        {showFullDossier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-8 shadow-2xl text-[#18251F] my-auto space-y-6">
              <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#073B2A] uppercase">
                    Complete Inspection Dossier
                  </h3>
                  <p className="text-xs text-[#738078] font-mono">
                    {storeName} ({activeStoreId}) · Certified on 04 Oct 2026
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullDossier(false)}
                  className="p-2 rounded-lg text-[#738078] hover:text-[#073B2A] hover:bg-[#F6F1E7] cursor-pointer border border-[#DDE5DC]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
                <div className="p-4 rounded-xl bg-[#F6F1E7]/50 border border-[#DDE5DC] space-y-1">
                  <span className="text-[10px] font-mono text-[#738078] uppercase font-semibold">
                    Officer Feedback:
                  </span>
                  <p className="italic text-[#18251F]">"{finalComment}"</p>
                </div>

                <span className="text-[10px] font-mono text-[#738078] uppercase font-semibold block pt-2">
                  Verified Photos List:
                </span>
                <div className="space-y-2">
                  {photos.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg bg-[#F6F1E7]/40 border border-[#DDE5DC] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#073B2A]">{p.id}</span>
                        <span className="font-mono text-[#738078]">{p.timestamp}</span>
                        <span className="text-[11px] text-[#738078]">{p.zone}</span>
                      </div>
                      <div>
                        {p.status === "Correct" ? (
                          <span className="text-[#13845B] font-bold">✓ Correct</span>
                        ) : p.status === "Incorrect" ? (
                          <span className="text-rose-600 font-bold">✕ Incorrect</span>
                        ) : (
                          <span className="text-amber-600 font-bold">⚠ Needs Review</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDE5DC] flex justify-end">
                <Button
                  type="button"
                  onClick={() => setShowFullDossier(false)}
                  className="bg-[#073B2A] hover:bg-[#05291F] text-white text-xs h-10 px-5 rounded-lg cursor-pointer"
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

  // ========================================================
  // MAIN OFFICER STORE VERIFICATION VIEW
  // ========================================================
  return (
    <div className="space-y-8 font-sans antialiased text-[#18251F] pb-20 max-w-5xl mx-auto">
      {/* Top Breadcrumb Back */}
      <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
        <Link
          to="/compliance"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Officer Dashboard</span>
        </Link>

        <span className="text-[11px] font-mono text-[#738078]">
          Officer: <strong className="text-[#073B2A] font-bold">{user?.name || "Officer Yuvraj Buddha"}</strong>
        </span>
      </div>

      {/* ======================================================== */}
      {/* 1. STORE VERIFICATION HEADER                            */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-[#DDE5DC] pb-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] flex items-center gap-1.5 mb-1 font-bold">
            <Building className="h-3.5 w-3.5" />
            <span>STATUTORY STORE VERIFICATION</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#073B2A] uppercase">
            Store Verification
          </h1>
          <p className="text-xs text-[#738078] mt-0.5">
            Review automatically extracted photos from the store's CCTV recording and assign compliance rating.
          </p>
        </div>

        {/* Required Details: Store Name, Store ID, Location, CCTV Date, Photos Generated */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          {/* Store Name */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
              Store Name
            </span>
            <div className="font-serif text-base font-bold text-[#073B2A] truncate">
              {storeName}
            </div>
          </div>

          {/* Store ID */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
              Store ID
            </span>
            <div className="font-mono text-base font-bold text-[#13845B]">
              {activeStoreId}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
              Location
            </span>
            <div className="flex items-center gap-1.5 text-[#18251F] text-sm">
              <MapPin className="h-3.5 w-3.5 text-[#738078]" />
              <span>{storeLocation}</span>
            </div>
          </div>

          {/* CCTV Date */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
              CCTV Date
            </span>
            <div className="flex items-center gap-1.5 text-[#18251F] font-mono text-sm">
              <Calendar className="h-3.5 w-3.5 text-[#738078]" />
              <span>{cctvDate}</span>
            </div>
          </div>

          {/* Photos Generated */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
              Photos Generated
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[#073B2A]">
              <Camera className="h-3.5 w-3.5 text-[#13845B]" />
              <span>{photos.length} photos</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. GENERATED CCTV EVIDENCE SECTION                       */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDE5DC] pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#073B2A] uppercase">
              Generated CCTV Evidence
            </h2>
            <p className="text-xs text-[#738078] mt-0.5">
              Photos automatically generated from the store's CCTV recording.
            </p>
          </div>

          {/* Simple Progress Counter */}
          <div className="flex items-center gap-2 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] px-3.5 py-1.5 text-xs font-mono">
            <span className="text-[#13845B] font-bold">{correctCount} Correct</span>
            <span className="text-[#DDE5DC]">·</span>
            <span className="text-rose-600 font-bold">{incorrectCount} Incorrect</span>
            <span className="text-[#DDE5DC]">·</span>
            <span className="text-amber-600 font-bold">{needsReviewCount} Needs Review</span>
          </div>
        </div>

        {/* Clean Photos Grid */}
        {photos.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#DDE5DC] rounded-xl space-y-3 bg-[#F6F1E7]/50">
            <Camera className="h-10 w-10 text-[#738078] mx-auto" />
            <div className="text-sm font-semibold text-[#18251F]">No frames extracted yet.</div>
            <p className="text-xs text-[#738078] max-w-md mx-auto">
              The store operator has not yet uploaded CCTV surveillance footage for this date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => {
              const isReviewed = photo.status !== "Unreviewed";
              return (
                <div
                  key={photo.id}
                  onClick={() => handleSelectPhoto(photo)}
                  className={`group rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between bg-[#FFFDF8] hover:shadow-md ${
                    photo.status === "Correct"
                      ? "border-[#13845B] ring-1 ring-[#13845B]/30"
                      : photo.status === "Incorrect"
                      ? "border-rose-400 ring-1 ring-rose-400/30"
                      : photo.status === "Needs Review"
                      ? "border-amber-400 ring-1 ring-amber-400/30"
                      : "border-[#DDE5DC] hover:border-[#073B2A]"
                  }`}
                >
                  {/* Photo Preview Container */}
                  <div className="relative aspect-video bg-[#05291F] overflow-hidden border-b border-[#DDE5DC] flex items-center justify-center">
                    <img
                      src={photo.dataUrl || photo.imageUrl}
                      alt={photo.id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector(".img-error-notice")) {
                          const errNotice = document.createElement("div");
                          errNotice.className = "img-error-notice flex items-center justify-center p-4 text-center text-xs text-rose-300 font-mono h-full w-full bg-[#05291F]";
                          errNotice.innerText = "Frame unavailable — extraction or image loading failed.";
                          parent.appendChild(errNotice);
                        }
                      }}
                    />

                    {/* Photo Title Overlay */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                      {photo.id}
                    </div>

                    {/* Clean Prominent Timestamp */}
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#073B2A]/90 backdrop-blur-md text-[11px] font-mono font-bold text-[#72D6A0] border border-[#72D6A0]/20">
                      {photo.timestamp}
                    </div>

                    {/* Status Overlay Badge if reviewed */}
                    {isReviewed && (
                      <div className="absolute top-2 right-2">
                        {photo.status === "Correct" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#13845B] text-white">
                            ✓ Correct
                          </span>
                        )}
                        {photo.status === "Incorrect" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                            ✕ Incorrect
                          </span>
                        )}
                        {photo.status === "Needs Review" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-900">
                            ⚠ Needs Review
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Timestamp & Click prompt */}
                  <div className="p-3.5 space-y-1 bg-[#FFFDF8]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#073B2A]">{photo.id}</span>
                      <span className="font-mono text-xs font-semibold text-[#738078]">
                        {photo.timestamp}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#738078] font-mono flex items-center justify-between pt-1 border-t border-[#DDE5DC]/60">
                      <span className="truncate max-w-[120px]">{photo.zone}</span>
                      <span className="text-[#13845B] font-semibold group-hover:underline">
                        {isReviewed ? "Edit Review →" : "Review →"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. STORE RATING (MANUAL 1-10 SELECTOR)                   */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-[#DDE5DC] pb-4">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#073B2A] uppercase">
            Store Rating
          </h2>
          <p className="text-xs text-[#738078] mt-0.5">
            Assign statutory compliance rating based on verified evidence
          </p>
        </div>

        {/* 1 to 10 Number Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#738078] font-semibold">
              Select rating (1 - 10):
            </span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="font-serif text-3xl font-bold text-[#073B2A]">
                {finalRating}
              </span>
              <span className="text-sm text-[#738078]">/ 10</span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setFinalRating(num)}
                className={`h-11 rounded-lg text-sm font-bold font-mono cursor-pointer transition-all flex items-center justify-center ${
                  finalRating === num
                    ? "bg-[#073B2A] text-[#72D6A0] shadow-sm font-bold border border-[#073B2A]"
                    : "bg-[#F6F1E7] text-[#18251F] hover:bg-[#DDE5DC] border border-[#DDE5DC]"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. FINAL COMMENT                                         */}
        {/* ======================================================== */}
        <div className="pt-4 border-t border-[#DDE5DC] space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-[#073B2A] block font-bold">
            Officer Final Comment
          </label>
          <textarea
            rows={3}
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
            placeholder="Add compliance notes or corrective action requirements for the store operator..."
            className="w-full rounded-lg border border-[#DDE5DC] bg-white p-3 text-xs text-[#18251F] placeholder:text-[#738078] focus:border-[#073B2A] outline-none transition-colors"
          />
        </div>

        {/* ======================================================== */}
        {/* 5. SIMPLE SUMMARY & SUBMIT                               */}
        {/* ======================================================== */}
        <div className="p-5 rounded-xl bg-[#F6F1E7] border border-[#DDE5DC] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5 text-xs">
            <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
              Inspection Dossier Summary
            </span>
            <div className="flex flex-wrap items-center gap-3 font-mono">
              <span className="text-[#18251F]">Evidence Frames: <strong>{photos.length}</strong></span>
              <span className="text-[#DDE5DC]">·</span>
              <span className="text-[#13845B]">Correct: <strong>{correctCount}</strong></span>
              <span className="text-[#DDE5DC]">·</span>
              <span className="text-rose-600">Incorrect: <strong>{incorrectCount}</strong></span>
              <span className="text-[#DDE5DC]">·</span>
              <span className="text-amber-600">Needs Review: <strong>{needsReviewCount}</strong></span>
              {unreviewedCount > 0 && (
                <>
                  <span className="text-[#DDE5DC]">·</span>
                  <span className="text-[#738078]">Unreviewed: <strong>{unreviewedCount}</strong></span>
                </>
              )}
            </div>
            <div className="text-xs font-mono text-[#18251F] pt-1">
              Final Rating: <strong className="text-[#073B2A] font-bold text-sm">{finalRating} / 10</strong>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSubmitInspection}
            disabled={isSubmitting}
            className="bg-[#073B2A] hover:bg-[#05291F] text-white font-bold text-xs h-11 px-7 rounded-lg shadow-xs cursor-pointer gap-2 transition-all uppercase tracking-wider shrink-0"
          >
            <span>{isSubmitting ? "Submitting..." : "SUBMIT INSPECTION"}</span>
            <ArrowRight className="h-4 w-4 text-[#72D6A0]" />
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. SIMPLE PHOTO REVIEW PANEL (MODAL)                     */}
      {/* ======================================================== */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-2xl space-y-5 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#073B2A]">
                  {activePhoto.id}
                </h3>
                <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                  <span className="text-[#738078]">Timestamp:</span>
                  <span className="text-[#18251F] font-bold text-sm">
                    {activePhoto.timestamp}
                  </span>
                  <span className="text-[#DDE5DC]">·</span>
                  <span className="text-[#738078]">{activePhoto.zone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="p-1.5 rounded-lg text-[#738078] hover:text-[#073B2A] hover:bg-[#F6F1E7] cursor-pointer border border-[#DDE5DC]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Large Photo Preview */}
            <div className="rounded-xl overflow-hidden border border-[#DDE5DC] bg-[#05291F] aspect-[16/10] relative">
              <img
                src={activePhoto.dataUrl || activePhoto.imageUrl}
                alt={activePhoto.id}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded bg-[#073B2A]/90 backdrop-blur-md text-xs font-mono font-bold text-[#72D6A0] border border-[#72D6A0]/20">
                Timestamp: {activePhoto.timestamp}
              </div>
            </div>

            {/* Decision Buttons: ✓ CORRECT, ✕ INCORRECT, ⚠ NEEDS REVIEW */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-[#073B2A] block font-bold">
                Verification Assessment:
              </span>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTempDecision("Correct")}
                  className={`h-11 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    tempDecision === "Correct"
                      ? "bg-[#13845B] text-white shadow-xs font-bold"
                      : "bg-[#F6F1E7] text-[#13845B] hover:bg-[#13845B]/15 border border-[#13845B]/30"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>✓ CORRECT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTempDecision("Incorrect")}
                  className={`h-11 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    tempDecision === "Incorrect"
                      ? "bg-rose-600 text-white shadow-xs font-bold"
                      : "bg-[#F6F1E7] text-rose-600 hover:bg-rose-600/15 border border-rose-300"
                  }`}
                >
                  <X className="h-4 w-4" />
                  <span>✕ INCORRECT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTempDecision("Needs Review")}
                  className={`h-11 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    tempDecision === "Needs Review"
                      ? "bg-amber-600 text-white shadow-xs font-bold"
                      : "bg-[#F6F1E7] text-amber-700 hover:bg-amber-600/15 border border-amber-300"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>⚠ NEEDS REVIEW</span>
                </button>
              </div>
            </div>

            {/* Optional Officer Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-[#073B2A] block font-bold">
                Officer Notes (Optional):
              </label>
              <input
                type="text"
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
                placeholder="Add specific observations about this CCTV frame..."
                className="w-full h-10 rounded-lg border border-[#DDE5DC] bg-white px-3 text-xs text-[#18251F] placeholder:text-[#738078] focus:border-[#073B2A] outline-none"
              />
            </div>

            {/* Action Buttons: Save & Cancel */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DDE5DC]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActivePhoto(null)}
                className="border-[#DDE5DC] bg-white text-[#738078] hover:text-[#073B2A] text-xs h-10 px-5 rounded-lg cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSavePhotoReview}
                className="bg-[#073B2A] hover:bg-[#05291F] text-[#72D6A0] font-bold text-xs h-10 px-6 rounded-lg shadow-xs cursor-pointer uppercase tracking-wider"
              >
                Save Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
