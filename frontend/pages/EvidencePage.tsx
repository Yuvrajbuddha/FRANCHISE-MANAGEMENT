import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Video,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Calendar,
  Lock,
  Eye,
  Check,
  X,
  AlertTriangle,
  FileCheck2,
  Store,
  Layers,
  FileVideo,
  Info,
  Camera,
  Maximize2,
  MapPin,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CctvSubmission,
  GeneratedPhoto,
  loadCctvSubmissions,
  saveCctvSubmissions,
  loadPhotosForStore,
  savePhotosForStore,
  createGeneratedPhotosForSubmission,
  generateCctvPhotoDataUrl,
} from "@/services/cctvEvidenceStore";
import { STORES_MAP, ALL_NETWORK_STORES } from "@/utils/stores-data";

export default function EvidencePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Role check: Only Store role ('FRANCHISE') can upload CCTV videos.
  // Franchisee Owner ('OWNER' or 'ADMIN') has read-only supervisory access.
  const isStoreRole = user?.role === "FRANCHISE";
  const isOwner = user?.role === "OWNER" || user?.role === "ADMIN";

  // For Store role: locked to their assigned outlet.
  // For Franchisee Owner: can switch between stores to supervise evidence.
  const [selectedOutletId, setSelectedOutletId] = useState<string>(
    user?.assignedOutletId || "OUT-042"
  );
  const storeId = isStoreRole ? (user?.assignedOutletId || "OUT-042") : selectedOutletId;

  const matchedStore = STORES_MAP[storeId];
  const currentDate = "04 Oct 2026";

  // CCTV Submissions state
  const [submissions, setSubmissions] = useState<CctvSubmission[]>(loadCctvSubmissions);
  const [photos, setPhotos] = useState<GeneratedPhoto[]>(() => loadPhotosForStore(storeId));

  // Current Store's latest CCTV submission
  const currentSubmission =
    submissions.find((s) => s.storeId === storeId) ||
    submissions.find((s) => s.storeId === "OUT-042");

  const storeName =
    currentSubmission?.storeName ||
    matchedStore?.name ||
    user?.assignedOutletName ||
    (storeId === "OUT-042" ? "Lucknow Central" : `Store ${storeId}`);

  // Upload Form State (STORE CAN ONLY UPLOAD VIDEOS)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState<string>("CCTV_DAILY_RECORDING_04OCT2026.mp4");
  const [durationHours, setDurationHours] = useState<number>(8);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<"IDLE" | "PROCESSING" | "SUBMITTED">("IDLE");

  // Read-only Photo Viewer modal for Store / Owner
  const [previewPhoto, setPreviewPhoto] = useState<GeneratedPhoto | null>(null);

  // Sync latest submission and photos when storeId changes
  useEffect(() => {
    const subs = loadCctvSubmissions();
    setSubmissions(subs);
    const storePhotos = loadPhotosForStore(storeId);
    setPhotos(storePhotos);
  }, [storeId]);

  // Video Selection (Restricted strictly to Store role)
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStoreRole) return;
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVideoName(file.name);
      setSubmissionSuccess(false);
      setSubmissionStatus("IDLE");
    }
  };

  // Submit CCTV Video (Restricted strictly to Store role)
  const handleSubmitCctv = () => {
    if (!isStoreRole) return;

    setIsProcessing(true);
    setSubmissionStatus("PROCESSING");
    setSubmissionSuccess(false);

    // Simulate system automatic frame extraction
    setTimeout(() => {
      const cctvId = `CCTV-${storeId}-${Date.now().toString().slice(-6)}`;
      const durationLabel =
        durationHours === 1
          ? "1 hour"
          : durationHours <= 5
          ? `${durationHours} hours`
          : "8 hours";

      // System automatically extracts random photos from different timestamps
      const generatedPhotos = createGeneratedPhotosForSubmission(
        cctvId,
        storeId,
        durationHours
      );

      // Save to store
      savePhotosForStore(storeId, generatedPhotos);
      setPhotos(generatedPhotos);

      const newSubmission: CctvSubmission = {
        id: cctvId,
        storeId,
        storeName,
        videoName,
        durationLabel,
        durationHours,
        uploadDate: currentDate,
        status: "Pending Review",
        photosCount: generatedPhotos.length,
      };

      const updatedSubmissions = [
        newSubmission,
        ...submissions.filter((s) => s.storeId !== storeId),
      ];
      saveCctvSubmissions(updatedSubmissions);
      setSubmissions(updatedSubmissions);

      setIsProcessing(false);
      setSubmissionStatus("SUBMITTED");
      setSubmissionSuccess(true);
      setSelectedFile(null);
    }, 1200);
  };

  // Keyboard Escape listener for lightbox preview modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewPhoto(null);
      }
    };
    if (previewPhoto) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewPhoto]);

  const getStatusBadge = (status: GeneratedPhoto["status"]) => {
    switch (status) {
      case "Correct":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Approved</span>
          </span>
        );
      case "Incorrect":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-2xs">
            <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span>Rejected</span>
          </span>
        );
      case "Needs Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-2xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Needs Re-review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/80 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Pending Officer Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans antialiased text-slate-900 pb-20 max-w-5xl mx-auto">
      {/* ======================================================== */}
      {/* 1. HEADER CARD (ROLE-ADAPTIVE)                           */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/60 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-teal-800 flex items-center gap-1.5 mb-1 font-bold">
            <Building className="h-3.5 w-3.5 text-teal-600" />
            <span>
              {isStoreRole
                ? "STORE CCTV PORTAL · OPERATIONAL UNIT"
                : "STORE EVIDENCE REPOSITORY · FRANCHISEE SUPERVISION"}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 uppercase">
            {storeName}
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-mono">
            Store ID:{" "}
            <span className="text-teal-700 font-bold bg-teal-100/70 px-1.5 py-0.5 rounded border border-teal-200">
              {storeId}
            </span>{" "}
            ·{" "}
            {isStoreRole
              ? "Daily CCTV Surveillance Upload"
              : "Store Evidence & CCTV Compliance Monitoring"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* If Store Role: link to switch store */}
          {isStoreRole && (
            <Link
              to="/login/store"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-300 bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Switch Store"
            >
              <Store className="h-3.5 w-3.5 text-teal-600" />
              <span>Select Another Store</span>
            </Link>
          )}

          {/* If Franchisee Owner: Dropdown to inspect evidence for any network store */}
          {!isStoreRole && (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Viewing Outlet:</span>
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                className="text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {ALL_NETWORK_STORES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role Badge */}
          {isStoreRole ? (
            <Badge className="bg-teal-100 text-teal-800 border-teal-300 text-xs px-3 py-1 font-mono font-semibold">
              Store Operator
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs px-3 py-1 font-mono font-semibold">
              Franchisee Owner (Read-Only)
            </Badge>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100/90 border border-amber-300 text-[11px] text-amber-900 font-medium">
            <Lock className="h-3.5 w-3.5 text-amber-700" />
            <span>
              {isStoreRole
                ? "Video Only · Photos Auto-Generated"
                : "CCTV Upload Restricted to Store Operators"}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. OFFICER FINAL RATING & FEEDBACK (IF INSPECTED)        */}
      {/* ======================================================== */}
      {currentSubmission?.status === "Verified" && currentSubmission.finalRating && (
        <div className="rounded-[28px] border border-[#10B981]/30 bg-[#071126] p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#10B981]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-bold">
                STORE COMPLIANCE RATING
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Verified by {currentSubmission.officerName || "Quality & Compliance Officer"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-5xl font-bold text-[#10B981]">
                  {currentSubmission.finalRating}
                </span>
                <span className="font-serif text-2xl text-slate-500">/ 10</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Inspection Date: {currentSubmission.inspectionDate || currentDate}
              </span>
            </div>

            {currentSubmission.officerComment && (
              <div className="flex-1 max-w-xl p-4 rounded-2xl bg-[#050B1A] border border-white/10 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-[#818CF8]" />
                  <span>Officer Feedback:</span>
                </span>
                <p className="text-slate-200 italic">
                  "{currentSubmission.officerComment}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3A. DAILY CCTV UPLOAD (STORE ROLE ONLY)                   */}
      {/* ======================================================== */}
      {isStoreRole && (
        <div className="rounded-[28px] border border-teal-500/25 bg-[#071126] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              MANDATORY COMPLIANCE DISPATCH
            </span>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white uppercase">
              DAILY CCTV UPLOAD
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The Store user can upload only CCTV video. Photos are automatically generated by the system across recording timestamps.
            </p>
          </div>

          {/* Success Banner */}
          {submissionSuccess && (
            <div className="p-4 rounded-2xl border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981] text-xs flex items-center justify-between shadow-lg shadow-[#10B981]/5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0" />
                <div>
                  <span className="font-bold text-sm block">✓ CCTV submitted successfully</span>
                  <span className="text-[11px] text-slate-300">
                    Status: <strong className="text-amber-400 font-mono">PROCESSING</strong> → System generated {photos.length} timestamped photos for Officer review.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSubmissionSuccess(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Video Upload Control */}
          <div className="space-y-6">
            {/* File Picker */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleVideoSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/20 hover:border-[#4F46FF] bg-[#050B1A] hover:bg-white/[0.02] rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-all group"
              >
                <div className="h-14 w-14 rounded-2xl bg-[#4F46FF]/15 text-[#4F46FF] border border-[#4F46FF]/30 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Video className="h-7 w-7" />
                </div>
                <div>
                  <span className="font-serif text-lg font-bold text-white block">
                    [ Upload CCTV Video ]
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Select MP4 or WebM CCTV footage from store security recorder
                  </span>
                </div>
                <span className="inline-block text-[11px] font-mono text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Click to browse file
                </span>
              </button>
            </div>

            {/* Selected Video Details */}
            <div className="rounded-2xl bg-[#050B1A] border border-white/10 p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Video Name */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    Video Name
                  </span>
                  <div className="font-mono text-white font-medium truncate">
                    {selectedFile ? selectedFile.name : videoName}
                  </div>
                </div>

                {/* Video Duration Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    Video Duration
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: "1 hr (3 photos)", hours: 1 },
                      { label: "4-5 hrs (5 photos)", hours: 5 },
                      { label: "8 hrs (8-10 photos)", hours: 8 },
                    ].map((d) => (
                      <button
                        key={d.hours}
                        type="button"
                        onClick={() => setDurationHours(d.hours)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono cursor-pointer transition-all ${
                          durationHours === d.hours
                            ? "bg-[#4F46FF] text-white font-bold"
                            : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Date */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                    Upload Date
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-300">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{currentDate}</span>
                  </div>
                </div>
              </div>

              {/* Submit CCTV Button */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  System automatically selects random frames across the entire duration.
                </span>

                <Button
                  type="button"
                  onClick={handleSubmitCctv}
                  disabled={isProcessing}
                  className="bg-[#4F46FF] hover:bg-[#6366F1] text-white font-bold text-xs h-11 px-8 rounded-xl shadow-lg shadow-[#4F46FF]/30 cursor-pointer gap-2 transition-all uppercase tracking-wider"
                >
                  <Upload className="h-4 w-4" />
                  <span>{isProcessing ? "Processing Video..." : "SUBMIT CCTV"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3B. CCTV SUBMISSION DOSSIER (FRANCHISEE OWNER READ-ONLY)  */}
      {/* ======================================================== */}
      {!isStoreRole && (
        <div className="rounded-[28px] border border-blue-500/20 bg-[#071126] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                STORE EVIDENCE SUBMISSION DOSSIER
              </span>
              <h2 className="font-serif text-2xl font-normal tracking-tight text-white uppercase">
                SURVEILLANCE EVIDENCE LOG
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Surveillance footage submitted by on-ground store operators. Frames are automatically extracted for compliance review.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs px-3 py-1 font-mono font-semibold ${
                  currentSubmission?.status === "Verified"
                    ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                    : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                }`}
              >
                {currentSubmission?.status === "Verified"
                  ? "✓ Verified by Officer"
                  : "⏳ Pending Officer Review"}
              </Badge>
            </div>
          </div>

          {/* Submission Info Grid (No Upload Button, No File Picker) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <FileVideo className="h-3.5 w-3.5 text-blue-400" />
                <span>Video Footage</span>
              </span>
              <div className="font-mono text-white font-medium truncate" title={currentSubmission?.videoName || videoName}>
                {currentSubmission?.videoName || videoName}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-400" />
                <span>Recorded Duration</span>
              </span>
              <div className="font-mono text-white font-medium">
                {currentSubmission?.durationLabel || "8 hours"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                <span>Upload Date</span>
              </span>
              <div className="font-mono text-white font-medium">
                {currentSubmission?.uploadDate || currentDate}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B1A] border border-white/10 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>Extracted Frames</span>
              </span>
              <div className="font-mono text-white font-medium">
                {photos.length} timestamped photos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-300">
            <Info className="h-4 w-4 shrink-0 text-blue-400" />
            <span>
              Daily surveillance footage is recorded and submitted exclusively by the store operator. Franchisee Owners can monitor submitted footage telemetry and compliance rating outcomes.
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SYSTEM-GENERATED CCTV PHOTOS (EVIDENCE GALLERY)        */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-slate-700/80 bg-[#071126] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-700/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-full font-semibold">
                AUTOMATED SURVEILLANCE TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                · 1080P HD Extractions
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              Generated Photos ({photos.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Photos are automatically extracted across the CCTV recording duration for officer compliance review. Store operators have read-only access and cannot modify or verify frames.
            </p>
          </div>

          {/* CCTV ID Badge Aligned to Right on Desktop */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#050B1A] border border-cyan-500/30 text-xs font-mono shadow-xs">
              <span className="text-slate-400 font-medium">CCTV ID:</span>
              <span className="text-cyan-400 font-bold tracking-wide">
                {currentSubmission?.id || `CCTV-${storeId}-REC`}
              </span>
            </div>
            {currentSubmission?.durationLabel && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>{currentSubmission.durationLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Photos Grid (4 cols wide desktop, 2 cols medium, 1 col mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="group rounded-2xl border border-slate-700/60 bg-[#0B1528] overflow-hidden shadow-lg hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              {/* Photo Image Preview (16:9 Aspect Ratio) */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden border-b border-slate-700/60">
                <img
                  src={photo.imageUrl}
                  alt={`${photo.id} - ${photo.zone}`}
                  loading="lazy"
                  onError={(e) => {
                    const fallback = generateCctvPhotoDataUrl(photo.timestamp, photo.zone, storeId, idx);
                    (e.currentTarget as HTMLImageElement).src = fallback;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Floating Top Left Badge: Photo ID & Cam Tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/15 shadow-sm">
                    {photo.id}
                  </span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-md text-[9px] font-mono font-semibold text-cyan-300 border border-cyan-500/30">
                    CAM-0{((idx % 4) + 1)}
                  </span>
                </div>

                {/* Floating Top Right Badge: Timestamp */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30 shadow-sm">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    {photo.timestamp}
                  </span>
                </div>

                {/* Hover Quick Preview Action */}
                <div className="absolute inset-0 bg-cyan-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-xs font-medium text-white border border-white/20 shadow-md flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
                    Inspect Frame
                  </span>
                </div>
              </div>

              {/* Photo Meta & Review Status */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      {photo.id}
                    </span>
                    <span className="font-mono text-xs text-slate-300 font-semibold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                      {photo.timestamp}
                    </span>
                  </div>

                  {/* Category / Zone Label */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-200" title={photo.zone}>
                      {photo.zone}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {storeName} ({storeId})
                  </div>
                </div>

                {/* Card Footer: Officer Review Status */}
                <div className="pt-2.5 border-t border-slate-700/50 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                    Review Status
                  </span>
                  <div>{getStatusBadge(photo.status)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. READ-ONLY PREVIEW LIGHTBOX MODAL                       */}
      {/* ======================================================== */}
      {previewPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="CCTV Evidence Frame Preview"
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-[28px] border border-slate-700 bg-[#071126] p-6 shadow-2xl space-y-5 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-0.5 rounded-full font-semibold">
                    CCTV EVIDENCE RECORD
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {previewPhoto.id}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                  {previewPhoto.id} · {previewPhoto.timestamp}
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  {storeName} ({storeId}) · Extracted from {currentSubmission?.videoName || "CCTV footage"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                aria-label="Close photo preview"
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer border border-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal 16:9 Image Frame */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video w-full shadow-inner">
              <img
                src={previewPhoto.imageUrl}
                alt={`${previewPhoto.id} - ${previewPhoto.zone}`}
                onError={(e) => {
                  const fallback = generateCctvPhotoDataUrl(previewPhoto.timestamp, previewPhoto.zone, storeId, 0);
                  (e.currentTarget as HTMLImageElement).src = fallback;
                }}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Evidence Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#050B1A] border border-slate-700/80 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                  Capture Timestamp
                </span>
                <span className="font-mono text-sm text-white font-bold">
                  {previewPhoto.timestamp}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                  Evidence Zone
                </span>
                <span className="font-mono text-xs text-cyan-300 font-semibold truncate block">
                  {previewPhoto.zone}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-0.5">
                  Surveillance Source
                </span>
                <span className="font-mono text-xs text-slate-200">
                  {currentSubmission?.id || `CCTV-${storeId}`}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-1">
                  Compliance Status
                </span>
                <div>{getStatusBadge(previewPhoto.status)}</div>
              </div>
            </div>

            {previewPhoto.officerComment && (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  Officer Review Comment:
                </span>
                <p className="text-slate-200 italic">"{previewPhoto.officerComment}"</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-700/70">
              <span className="text-[11px] font-mono text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Esc</kbd> to close
              </span>
              <Button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs h-9 px-5 rounded-xl border border-white/15 cursor-pointer font-medium"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
