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
  Loader2,
  Sparkles,
  RefreshCw,
  HardDrive,
  Film,
  AlertCircle,
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
} from "@/services/cctvEvidenceStore";
import {
  inspectVideoFile,
  ClientVideoMetadata,
  calculateTimestampsForDuration,
  extractFramesWithBrowser,
  formatHumanDuration,
} from "@/services/videoFrameExtractor";
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
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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

  // Upload Form & Video Processing State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState<string>("CCTV_DAILY_RECORDING.mp4");
  const [detectedMetadata, setDetectedMetadata] = useState<ClientVideoMetadata | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // Processing & Job Progress State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [submissionStatus, setSubmissionStatus] = useState<
    "IDLE" | "INSPECTING" | "UPLOADING" | "PROCESSING" | "SUBMITTED" | "FAILED"
  >("IDLE");
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    return sessionStorage.getItem(`active_cctv_job_${storeId}`);
  });

  // Read-only Photo Viewer modal for Store / Owner
  const [previewPhoto, setPreviewPhoto] = useState<GeneratedPhoto | null>(null);

  // Helper to reliably retrieve auth token
  const getAuthToken = () => {
    return (
      localStorage.getItem("franchise_auth_token") ||
      localStorage.getItem("token") ||
      ""
    );
  };

  // Sync latest submission and photos when storeId changes
  useEffect(() => {
    const subs = loadCctvSubmissions();
    setSubmissions(subs);
    const storePhotos = loadPhotosForStore(storeId);
    setPhotos(storePhotos);

    // Also synchronize from server storage
    const fetchServerStoreEvidence = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`/api/cctv/submissions/${storeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.latestCompletedJob?.frames?.length > 0) {
            const serverFrames: GeneratedPhoto[] = data.latestCompletedJob.frames;
            setPhotos(serverFrames);
            savePhotosForStore(storeId, serverFrames);
          }
        }
      } catch (err) {
        console.warn("Notice: server store evidence query skipped:", err);
      }
    };
    fetchServerStoreEvidence();
  }, [storeId]);

  // Resume or monitor active background job if page was refreshed
  useEffect(() => {
    if (!activeJobId) return;

    let isSubscribed = true;
    setIsProcessing(true);
    setSubmissionStatus("PROCESSING");

    const pollInterval = setInterval(async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`/api/cctv/jobs/${activeJobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            clearInterval(pollInterval);
            sessionStorage.removeItem(`active_cctv_job_${storeId}`);
            setActiveJobId(null);
            setIsProcessing(false);
          }
          return;
        }

        const data = await res.json();
        if (!isSubscribed) return;

        if (data.success && data.job) {
          const job = data.job;
          setUploadProgress(job.progressPct || 0);
          setProcessingStep(job.currentStep || "Processing video...");

          if (job.status === "COMPLETED") {
            clearInterval(pollInterval);
            sessionStorage.removeItem(`active_cctv_job_${storeId}`);
            setActiveJobId(null);
            setIsProcessing(false);
            setSubmissionStatus("SUBMITTED");
            setSubmissionSuccess(true);

            if (job.frames && Array.isArray(job.frames) && job.frames.length > 0) {
              const mappedPhotos: GeneratedPhoto[] = job.frames.map((f: any) => ({
                id: f.id,
                cctvId: f.cctvId,
                storeId: f.storeId,
                timestamp: f.timestamp,
                offsetSeconds: f.offsetSeconds,
                videoDurationSeconds: f.videoDurationSeconds,
                sourceVideoName: f.sourceVideoName,
                imageUrl: f.imageUrl,
                dataUrl: f.dataUrl,
                status: f.status || "Unreviewed",
                zone: f.zone,
                isAuthenticFrame: true,
              }));

              setPhotos(mappedPhotos);
              savePhotosForStore(storeId, mappedPhotos);

              const newSubmission: CctvSubmission = {
                id: job.cctvId,
                storeId,
                storeName,
                videoName: job.videoName,
                videoPath: job.videoPath,
                videoDurationSeconds: job.videoDurationSeconds,
                durationLabel: job.durationLabel || formatHumanDuration(job.videoDurationSeconds || 10),
                uploadDate: currentDate,
                status: "Pending Review",
                photosCount: mappedPhotos.length,
              };

              const updatedSubmissions = [
                newSubmission,
                ...loadCctvSubmissions().filter((s) => s.storeId !== storeId),
              ];
              saveCctvSubmissions(updatedSubmissions);
              setSubmissions(updatedSubmissions);
            }
          } else if (job.status === "FAILED") {
            clearInterval(pollInterval);
            sessionStorage.removeItem(`active_cctv_job_${storeId}`);
            setActiveJobId(null);
            setIsProcessing(false);
            setSubmissionStatus("FAILED");
            setErrorMessage(job.error || "Video processing job failed on server.");
          }
        }
      } catch (err) {
        console.warn("Background job polling warning:", err);
      }
    }, 1200);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [activeJobId, storeId, storeName, currentDate]);

  // Video Selection & Instant Duration Inspection
  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStoreRole) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setVideoName(file.name);
    setSubmissionSuccess(false);
    setErrorMessage(null);
    setInspectError(null);
    setIsInspecting(true);
    setSubmissionStatus("INSPECTING");

    try {
      const meta = await inspectVideoFile(file);
      setDetectedMetadata(meta);
      setIsInspecting(false);
      setSubmissionStatus("IDLE");
    } catch (err: any) {
      console.warn("Client video probe notice:", err);
      setIsInspecting(false);
      setInspectError(err.message || "Failed to inspect video duration. Please verify the video file.");
      setSubmissionStatus("IDLE");
    }
  };

  // Submit CCTV Video (Dual-layer Architecture: FFmpeg Background Job + Browser Canvas Fallback)
  const handleSubmitCctv = async () => {
    if (!isStoreRole || !selectedFile) return;

    setIsProcessing(true);
    setSubmissionSuccess(false);
    setErrorMessage(null);
    setPhotos([]); // Clear previous photos immediately so new upload doesn't mix with older footage
    setSubmissionStatus("UPLOADING");
    setUploadProgress(15);
    setProcessingStep("Uploading video to secure evidence vault...");

    const cctvId = `CCTV-${storeId}-${Date.now().toString().slice(-6)}`;
    const originalName = selectedFile.name;
    const token = getAuthToken();

    try {
      // 1. Attempt Server-side Upload & FFmpeg Extraction with Background Job
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("storeId", storeId);

      setProcessingStep("Uploading video file to server...");
      setUploadProgress(30);

      const res = await fetch("/api/cctv/upload-and-extract?async=true", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.jobId) {
          // Asynchronous job queued successfully!
          setActiveJobId(data.jobId);
          sessionStorage.setItem(`active_cctv_job_${storeId}`, data.jobId);
          setSubmissionStatus("PROCESSING");
          setProcessingStep("Video uploaded. Background frame extraction pipeline running...");
          setUploadProgress(40);
          return;
        } else if (data.success && data.frames) {
          // Synchronous completion fallback
          handleExtractionSuccess(data.frames, data.videoDurationSeconds, data.durationLabel, cctvId, originalName);
          return;
        }
      }

      // If server returned error or upload failed (e.g. Vercel 4.5MB serverless limit)
      console.warn("Server upload did not complete, switching to client-side authentic frame extraction...");
      await executeClientSideExtractionFallback(selectedFile, storeId, cctvId, originalName, token);
    } catch (err: any) {
      console.warn("Server upload encountered error, executing client-side extraction fallback:", err);
      try {
        await executeClientSideExtractionFallback(selectedFile, storeId, cctvId, originalName, token);
      } catch (fallbackErr: any) {
        setIsProcessing(false);
        setSubmissionStatus("FAILED");
        setErrorMessage(
          fallbackErr.message ||
            "Failed to decode frames from the uploaded video. Please verify the video format and retry."
        );
      }
    }
  };

  // Helper for successful frame extraction completion
  const handleExtractionSuccess = (
    frames: any[],
    durationSeconds: number,
    durationLabel: string,
    cctvId: string,
    originalName: string
  ) => {
    const mappedPhotos: GeneratedPhoto[] = frames.map((f: any) => ({
      id: f.id,
      cctvId: f.cctvId || cctvId,
      storeId,
      timestamp: f.timestamp,
      offsetSeconds: f.offsetSeconds,
      videoDurationSeconds: durationSeconds,
      sourceVideoName: originalName,
      imageUrl: f.imageUrl || f.dataUrl,
      dataUrl: f.dataUrl,
      status: "Unreviewed",
      zone: f.zone,
      isAuthenticFrame: true,
    }));

    setPhotos(mappedPhotos);
    savePhotosForStore(storeId, mappedPhotos);

    const newSubmission: CctvSubmission = {
      id: cctvId,
      storeId,
      storeName,
      videoName: originalName,
      videoDurationSeconds: durationSeconds,
      durationLabel: durationLabel || formatHumanDuration(durationSeconds),
      uploadDate: currentDate,
      status: "Pending Review",
      photosCount: mappedPhotos.length,
    };

    const updatedSubmissions = [
      newSubmission,
      ...loadCctvSubmissions().filter((s) => s.storeId !== storeId),
    ];
    saveCctvSubmissions(updatedSubmissions);
    setSubmissions(updatedSubmissions);

    setIsProcessing(false);
    setSubmissionStatus("SUBMITTED");
    setSubmissionSuccess(true);
    setSelectedFile(null);
  };

  // Resilient Browser-side extraction fallback (100% genuine frames via Canvas, compatible with Vercel)
  const executeClientSideExtractionFallback = async (
    file: File,
    storeId: string,
    cctvId: string,
    originalName: string,
    token: string
  ) => {
    setSubmissionStatus("PROCESSING");
    setProcessingStep("Decoding video frames locally via browser video processor...");

    const { metadata, frames } = await extractFramesWithBrowser(
      file,
      storeId,
      cctvId,
      (pct, curr, total, msg) => {
        setUploadProgress(pct);
        setProcessingStep(msg);
      }
    );

    setProcessingStep("Synchronizing authentic frames to server storage...");

    try {
      // Sync authentic frames to server storage
      await fetch("/api/cctv/sync-frames", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId,
          cctvId,
          videoName: originalName,
          durationSeconds: metadata.durationSeconds,
          frames,
        }),
      });
    } catch (syncErr) {
      console.warn("Sync to backend warning (frames stored locally):", syncErr);
    }

    handleExtractionSuccess(
      frames,
      metadata.durationSeconds,
      metadata.durationLabel,
      cctvId,
      originalName
    );
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#13845B]/10 text-[#13845B] border border-[#13845B]/30 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#13845B] shrink-0" />
            <span>Approved</span>
          </span>
        );
      case "Incorrect":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-700 border border-rose-500/30 shadow-2xs">
            <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span>Rejected</span>
          </span>
        );
      case "Needs Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/30 shadow-2xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Needs Re-review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F6F1E7] text-[#738078] border border-[#DDE5DC] shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Pending Officer Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans antialiased text-[#18251F] pb-20 max-w-5xl mx-auto">
      {/* ======================================================== */}
      {/* 1. HEADER CARD (ROLE-ADAPTIVE)                           */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] flex items-center gap-1.5 mb-1 font-bold">
            <Building className="h-3.5 w-3.5 text-[#13845B]" />
            <span>
              {isStoreRole
                ? "STORE CCTV PORTAL · OPERATIONAL UNIT"
                : "STORE EVIDENCE REPOSITORY · FRANCHISEE SUPERVISION"}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#073B2A] uppercase">
            {storeName}
          </h1>
          <p className="text-xs text-[#738078] mt-1 font-mono">
            Store ID:{" "}
            <span className="text-[#073B2A] font-bold bg-[#073B2A]/10 px-1.5 py-0.5 rounded border border-[#073B2A]/20">
              {storeId}
            </span>{" "}
            ·{" "}
            {isStoreRole
              ? "Daily CCTV Surveillance Upload & Automatic Frame Extraction"
              : "Store Evidence & CCTV Compliance Monitoring"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* If Store Role: link to switch store */}
          {isStoreRole && (
            <Link
              to="/login/store"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDE5DC] bg-[#F6F1E7]/50 hover:bg-[#F6F1E7] text-[#073B2A] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Switch Store"
            >
              <Store className="h-3.5 w-3.5 text-[#13845B]" />
              <span>Select Another Store</span>
            </Link>
          )}

          {/* If Franchisee Owner: Dropdown to inspect evidence for any network store */}
          {!isStoreRole && (
            <div className="flex items-center gap-2 bg-[#FFFDF8] px-3 py-1.5 rounded-lg border border-[#DDE5DC] shadow-2xs">
              <span className="text-[11px] text-[#738078] font-medium">Viewing Outlet:</span>
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                className="text-xs font-mono font-bold text-[#073B2A] bg-transparent focus:outline-none cursor-pointer"
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
            <Badge className="bg-[#13845B]/10 text-[#13845B] border-[#13845B]/30 text-xs px-3 py-1 font-mono font-semibold">
              Store Operator
            </Badge>
          ) : (
            <Badge className="bg-[#073B2A]/10 text-[#073B2A] border-[#073B2A]/30 text-xs px-3 py-1 font-mono font-semibold">
              Franchisee Owner (Read-Only)
            </Badge>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] text-[11px] text-[#738078] font-medium">
            <Lock className="h-3.5 w-3.5 text-[#738078]" />
            <span>
              {isStoreRole
                ? "Video Only · Real Frames Decoded"
                : "CCTV Upload Restricted to Store Operators"}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. OFFICER FINAL RATING & FEEDBACK (IF INSPECTED)        */}
      {/* ======================================================== */}
      {currentSubmission?.status === "Verified" && currentSubmission.finalRating && (
        <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#13845B]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#13845B] font-bold">
                STORE COMPLIANCE RATING
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#738078]">
              Verified by {currentSubmission.officerName || "Quality & Compliance Officer"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-5xl font-bold text-[#13845B]">
                  {currentSubmission.finalRating}
                </span>
                <span className="font-serif text-2xl text-[#738078]">/ 10</span>
              </div>
              <span className="text-[11px] text-[#738078] font-mono">
                Inspection Date: {currentSubmission.inspectionDate || currentDate}
              </span>
            </div>

            {currentSubmission.officerComment && (
              <div className="flex-1 max-w-xl p-4 rounded-xl bg-[#F6F1E7]/50 border border-[#DDE5DC] text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-[#13845B]" />
                  <span>Officer Feedback:</span>
                </span>
                <p className="text-[#18251F] italic">
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
        <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-[#DDE5DC] pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] block mb-1 font-semibold">
                  MANDATORY COMPLIANCE DISPATCH
                </span>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-[#073B2A] uppercase">
                  Daily CCTV Upload & Frame Extraction
                </h2>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#13845B]/10 border border-[#13845B]/20 text-xs font-mono text-[#13845B]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>100% Real Frame Decoding</span>
              </span>
            </div>
            <p className="text-xs text-[#738078] mt-1">
              Upload any CCTV video of any duration (10s, 30s, 1m, 10m, 1h, 8h, 10h). The system automatically inspects the actual video duration and extracts authentic photos directly from the footage.
            </p>
          </div>

          {/* Success Banner */}
          {submissionSuccess && (
            <div className="p-4 rounded-xl border border-[#13845B]/30 bg-[#13845B]/10 text-[#13845B] text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-[#13845B] shrink-0" />
                <div>
                  <span className="font-bold text-sm block">✓ CCTV Processed Successfully</span>
                  <span className="text-[11px] text-[#18251F]">
                    Status: <strong className="text-[#13845B] font-mono">EXTRACTED & READY</strong> → System extracted {photos.length} authentic timestamped photos from {currentSubmission?.durationLabel || "the uploaded video"} for officer review.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionSuccess(false)}
                className="text-[#738078] hover:text-[#18251F] cursor-pointer p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-800 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">Video Processing Error</span>
                  <span className="text-[11px] text-rose-700">{errorMessage}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-700 cursor-pointer p-1"
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
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv"
                className="hidden"
                onChange={handleVideoSelect}
              />

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed ${
                  selectedFile
                    ? "border-[#13845B] bg-[#13845B]/5"
                    : "border-[#DDE5DC] hover:border-[#13845B] bg-[#F6F1E7]/40 hover:bg-[#F6F1E7]/70"
                } rounded-xl p-8 text-center space-y-3 cursor-pointer transition-all group`}
              >
                <div className="h-14 w-14 rounded-xl bg-[#073B2A]/10 text-[#073B2A] border border-[#073B2A]/20 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Video className="h-7 w-7" />
                </div>
                <div>
                  <span className="font-serif text-lg font-bold text-[#073B2A] block">
                    {selectedFile ? `Selected: ${selectedFile.name}` : "[ Upload CCTV Video ]"}
                  </span>
                  <span className="text-xs text-[#738078] mt-1 block">
                    Supports any duration: 10s, 30s, 1m, 10m, 1h, 8h, 10h (MP4, WebM, MOV, AVI)
                  </span>
                </div>
                <span className="inline-block text-[11px] font-mono text-[#073B2A] bg-white px-3 py-1 rounded-md border border-[#DDE5DC]">
                  {selectedFile ? "Click to change video file" : "Click to browse local video file"}
                </span>
              </button>
            </div>

            {/* Inspecting status indicator */}
            {isInspecting && (
              <div className="p-3.5 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] flex items-center gap-2 text-xs text-[#073B2A]">
                <Loader2 className="h-4 w-4 animate-spin text-[#13845B]" />
                <span>Inspecting video file headers, codec, and actual duration...</span>
              </div>
            )}

            {/* Inspection error */}
            {inspectError && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{inspectError} (The system will inspect on server during upload)</span>
              </div>
            )}

            {/* Selected Video Details & Real Duration Telemetry */}
            {selectedFile && (
              <div className="rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  {/* Video Name */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                      Selected Video File
                    </span>
                    <div className="font-mono text-[#073B2A] font-medium truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </div>
                    <span className="text-[10px] font-mono text-[#738078] block">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>

                  {/* Real Detected Duration */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#13845B]" />
                      <span>Actual Video Duration</span>
                    </span>
                    <div className="font-mono text-[#13845B] font-bold text-sm">
                      {detectedMetadata ? detectedMetadata.durationLabel : "Detecting..."}
                    </div>
                    <span className="text-[10px] font-mono text-[#738078] block">
                      {detectedMetadata
                        ? `${detectedMetadata.durationSeconds.toFixed(1)} seconds total`
                        : "Probing video stream"}
                    </span>
                  </div>

                  {/* Frame Extraction Plan */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1">
                      <Camera className="h-3 w-3 text-[#13845B]" />
                      <span>Extraction Policy</span>
                    </span>
                    <div className="font-mono text-[#073B2A] font-bold">
                      {detectedMetadata
                        ? `${calculateTimestampsForDuration(detectedMetadata.durationSeconds).length} authentic frames`
                        : "Adaptive frame schedule"}
                    </div>
                    <span className="text-[10px] font-mono text-[#738078] block">
                      {detectedMetadata?.durationSeconds && detectedMetadata.durationSeconds <= 15
                        ? "Well-spaced within short clip"
                        : "Distributed across full duration"}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                      Upload Dispatch Date
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[#18251F]">
                      <Calendar className="h-3.5 w-3.5 text-[#738078]" />
                      <span>{currentDate}</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar during upload / extraction */}
                {isProcessing && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#073B2A] flex items-center gap-2 font-medium">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#13845B]" />
                        <span>{processingStep}</span>
                      </span>
                      <span className="text-[#073B2A] font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#DDE5DC] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#13845B] to-[#72D6A0] transition-all duration-300"
                        style={{ width: `${Math.max(5, uploadProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit CCTV Button */}
                <div className="pt-3 border-t border-[#DDE5DC] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-[11px] text-[#738078]">
                    {detectedMetadata?.durationSeconds && detectedMetadata.durationSeconds <= 15
                      ? `Short video detected (${detectedMetadata.durationLabel}): Frames will be extracted strictly within the recording.`
                      : "System automatically extracts representative frames distributed across the recording duration."}
                  </span>

                  <Button
                    type="button"
                    onClick={handleSubmitCctv}
                    disabled={isProcessing || isInspecting}
                    className="bg-[#073B2A] hover:bg-[#05291F] text-white font-bold text-xs h-11 px-8 rounded-lg shadow-sm cursor-pointer gap-2 transition-all uppercase tracking-wider"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing Video...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>PROCESS CCTV VIDEO</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3B. CCTV SUBMISSION DOSSIER (FRANCHISEE OWNER READ-ONLY)  */}
      {/* ======================================================== */}
      {!isStoreRole && (
        <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
          <div className="border-b border-[#DDE5DC] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] block mb-1 font-semibold">
                STORE EVIDENCE SUBMISSION DOSSIER
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#073B2A] uppercase">
                Surveillance Evidence Log
              </h2>
              <p className="text-xs text-[#738078] mt-0.5">
                Surveillance footage submitted by on-ground store operators. Frames are automatically extracted for compliance review.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs px-3 py-1 font-mono font-semibold ${
                  currentSubmission?.status === "Verified"
                    ? "border-[#13845B]/40 text-[#13845B] bg-[#13845B]/10"
                    : "border-amber-500/40 text-amber-700 bg-amber-500/10"
                }`}
              >
                {currentSubmission?.status === "Verified"
                  ? "✓ Verified by Officer"
                  : "⏳ Pending Officer Review"}
              </Badge>
              {(user?.role === "OFFICER" || user?.role === "ADMIN") && (
                <Link
                  to={`/compliance/review/${storeId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-[#073B2A] text-[#72D6A0] hover:bg-[#05291F] transition-all"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Review & Certify →</span>
                </Link>
              )}
            </div>
          </div>

          {/* Submission Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F6F1E7]/50 border border-[#DDE5DC] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1.5">
                <FileVideo className="h-3.5 w-3.5 text-[#13845B]" />
                <span>Video Footage</span>
              </span>
              <div className="font-mono text-[#073B2A] font-medium truncate" title={currentSubmission?.videoName || videoName}>
                {currentSubmission?.videoName || videoName}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F1E7]/50 border border-[#DDE5DC] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#13845B]" />
                <span>Recorded Duration</span>
              </span>
              <div className="font-mono text-[#073B2A] font-medium">
                {currentSubmission?.durationLabel || "Surveillance Recording"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F1E7]/50 border border-[#DDE5DC] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#738078]" />
                <span>Upload Date</span>
              </span>
              <div className="font-mono text-[#18251F] font-medium">
                {currentSubmission?.uploadDate || currentDate}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F1E7]/50 border border-[#DDE5DC] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#13845B]" />
                <span>Extracted Frames</span>
              </span>
              <div className="font-mono text-[#073B2A] font-medium">
                {photos.length} authentic photos
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] text-xs text-[#738078]">
            <Info className="h-4 w-4 shrink-0 text-[#13845B]" />
            <span>
              Daily surveillance footage is recorded and submitted exclusively by the store operator. Franchisee Owners can monitor submitted footage telemetry and compliance rating outcomes.
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SYSTEM-GENERATED CCTV PHOTOS (EVIDENCE GALLERY)        */}
      {/* ======================================================== */}
      <div className="rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-7 shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#DDE5DC] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] bg-[#13845B]/10 border border-[#13845B]/20 px-2.5 py-0.5 rounded-md font-semibold">
                AUTHENTIC SURVEILLANCE TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-[#13845B] flex items-center gap-1 font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>100% Real Decoded Video Frames</span>
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#073B2A]">
              Generated Photos ({photos.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#738078] max-w-2xl leading-relaxed">
              Every photo in this gallery is an authentic frame decoded from the uploaded CCTV recording. Timestamps correspond to the exact second within the video.
            </p>
          </div>

          {/* CCTV ID Badge Aligned to Right on Desktop */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] text-xs font-mono shadow-2xs">
              <span className="text-[#738078] font-medium">CCTV ID:</span>
              <span className="text-[#073B2A] font-bold tracking-wide">
                {currentSubmission?.id || `CCTV-${storeId}-REC`}
              </span>
            </div>
            {currentSubmission?.durationLabel && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] text-xs font-mono text-[#18251F]">
                <Clock className="h-3.5 w-3.5 text-[#13845B]" />
                <span>{currentSubmission.durationLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#DDE5DC] rounded-xl space-y-3 bg-[#F6F1E7]/30">
            {isProcessing ? (
              <>
                <Loader2 className="h-10 w-10 text-[#13845B] mx-auto animate-spin" />
                <div className="text-sm font-serif font-bold text-[#073B2A]">Extracting frames from the uploaded CCTV video...</div>
                <p className="text-xs text-[#738078] max-w-md mx-auto">
                  Automatic frame extraction pipeline is currently decoding authentic frames from your video recording.
                </p>
              </>
            ) : (
              <>
                <Camera className="h-10 w-10 text-[#738078] mx-auto" />
                <div className="text-sm font-serif font-bold text-[#073B2A]">No frames extracted yet.</div>
                <p className="text-xs text-[#738078] max-w-md mx-auto">
                  {isStoreRole
                    ? "Select and upload a CCTV recording above. Frames will be extracted automatically from your video."
                    : "The store operator has not yet submitted CCTV surveillance footage for this date."}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                onClick={() => setPreviewPhoto(photo)}
                className="group rounded-xl border border-[#DDE5DC] bg-[#FFFDF8] overflow-hidden shadow-xs hover:border-[#13845B] hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                {/* Photo Image Preview (16:9 Aspect Ratio) */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden border-b border-[#DDE5DC] flex items-center justify-center">
                  <img
                    src={photo.dataUrl || photo.imageUrl}
                    alt={`${photo.id} - ${photo.zone}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector(".img-fail-msg")) {
                        const failDiv = document.createElement("div");
                        failDiv.className = "img-fail-msg flex items-center justify-center p-3 text-center text-xs text-rose-400 font-mono h-full w-full bg-slate-950";
                        failDiv.innerText = "Frame unavailable — extraction or image loading failed.";
                        parent.appendChild(failDiv);
                      }
                    }}
                  />

                  {/* Floating Top Left Badge: Photo ID & Cam Tag */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#05291F]/90 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/15 shadow-sm">
                      {photo.id}
                    </span>
                    <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-[#13845B]/90 backdrop-blur-md text-[9px] font-mono font-semibold text-white border border-[#13845B]">
                      CAM-0{((idx % 4) + 1)}
                    </span>
                  </div>

                  {/* Floating Top Right Badge: Timestamp */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#05291F]/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#72D6A0] border border-[#72D6A0]/30 shadow-sm">
                      <Clock className="h-3 w-3 text-[#72D6A0]" />
                      {photo.timestamp}
                    </span>
                  </div>

                  {/* Hover Quick Preview Action */}
                  <div className="absolute inset-0 bg-[#073B2A]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 rounded-lg bg-[#FFFDF8] text-xs font-medium text-[#073B2A] border border-[#DDE5DC] shadow-md flex items-center gap-1.5">
                      <Maximize2 className="h-3.5 w-3.5 text-[#13845B]" />
                      Inspect Frame
                    </span>
                  </div>
                </div>

                {/* Photo Meta & Review Status */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-sm text-[#073B2A] tracking-tight flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-[#13845B] shrink-0" />
                        {photo.id}
                      </span>
                      <span className="font-mono text-xs text-[#073B2A] font-semibold bg-[#F6F1E7] px-2 py-0.5 rounded-md border border-[#DDE5DC]">
                        {photo.timestamp}
                      </span>
                    </div>

                    {/* Category / Zone Label */}
                    <div className="flex items-center gap-1.5 text-xs text-[#738078] font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#738078] shrink-0" />
                      <span className="truncate text-[#18251F]" title={photo.zone}>
                        {photo.zone}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#738078] truncate">
                      {storeName} ({storeId})
                    </div>
                  </div>

                  {/* Card Footer: Officer Review Status */}
                  <div className="pt-2.5 border-t border-[#DDE5DC] flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-[#738078] tracking-wider font-semibold">
                      Review Status
                    </span>
                    <div>{getStatusBadge(photo.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 shadow-2xl space-y-5 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#13845B] bg-[#13845B]/10 border border-[#13845B]/20 px-2.5 py-0.5 rounded-md font-semibold">
                    AUTHENTIC CCTV EVIDENCE FRAME
                  </span>
                  <span className="text-xs font-mono text-[#738078]">
                    {previewPhoto.id}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#073B2A] uppercase tracking-tight">
                  {previewPhoto.id} · Timestamp {previewPhoto.timestamp}
                </h3>
                <p className="text-xs text-[#738078] font-mono">
                  {storeName} ({storeId}) · Extracted from {previewPhoto.sourceVideoName || currentSubmission?.videoName || "CCTV footage"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                aria-label="Close photo preview"
                className="p-2 rounded-lg text-[#738078] hover:text-[#073B2A] hover:bg-[#F6F1E7] cursor-pointer border border-[#DDE5DC] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal 16:9 Image Frame */}
            <div className="rounded-xl overflow-hidden border border-[#DDE5DC] bg-black aspect-video w-full shadow-inner flex items-center justify-center">
              <img
                src={previewPhoto.dataUrl || previewPhoto.imageUrl}
                alt={`${previewPhoto.id} - ${previewPhoto.zone}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector(".modal-img-error")) {
                    const errNotice = document.createElement("div");
                    errNotice.className = "modal-img-error flex items-center justify-center p-6 text-center text-sm text-rose-400 font-mono h-full w-full bg-slate-950";
                    errNotice.innerText = "Frame unavailable — extraction or image loading failed.";
                    parent.appendChild(errNotice);
                  }
                }}
              />
            </div>

            {/* Modal Evidence Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F6F1E7]/60 border border-[#DDE5DC] text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                  Timestamp In Video:
                </span>
                <span className="font-mono text-[#073B2A] font-bold text-sm">
                  {previewPhoto.timestamp}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                  Monitored Zone:
                </span>
                <span className="font-medium text-[#18251F]">
                  {previewPhoto.zone}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                  Authenticity:
                </span>
                <span className="font-bold text-[#13845B] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Real Decoded Frame</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#738078] block font-semibold">
                  Officer Review:
                </span>
                <div className="mt-0.5">{getStatusBadge(previewPhoto.status)}</div>
              </div>
            </div>

            {/* Officer Comment if exists */}
            {previewPhoto.officerComment && (
              <div className="p-3.5 rounded-xl bg-[#F6F1E7] border border-[#DDE5DC] text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#13845B] font-semibold block">
                  Officer Evaluation Note:
                </span>
                <p className="text-[#18251F] italic">"{previewPhoto.officerComment}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
