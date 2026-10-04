import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
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
} from "@/lib/cctvEvidenceStore";

export default function EvidencePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const storeId = user?.assignedOutletId || "OUT-042";
  const storeName = storeId === "OUT-042" ? "Lucknow Central" : `Store ${storeId}`;
  const currentDate = "04 Oct 2026";

  // CCTV Submissions state
  const [submissions, setSubmissions] = useState<CctvSubmission[]>(loadCctvSubmissions);
  const [photos, setPhotos] = useState<GeneratedPhoto[]>(() => loadPhotosForStore(storeId));

  // Current Store's latest CCTV submission
  const currentSubmission = submissions.find((s) => s.storeId === storeId) || submissions[0];

  // Upload Form State (STORE CAN ONLY UPLOAD VIDEOS)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState<string>("CCTV_DAILY_RECORDING_04OCT2026.mp4");
  const [durationHours, setDurationHours] = useState<number>(8);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<"IDLE" | "PROCESSING" | "SUBMITTED">("IDLE");

  // Read-only Photo Viewer modal for Store User
  const [previewPhoto, setPreviewPhoto] = useState<GeneratedPhoto | null>(null);

  // Sync latest submission and photos
  useEffect(() => {
    const subs = loadCctvSubmissions();
    setSubmissions(subs);
    const storePhotos = loadPhotosForStore(storeId);
    setPhotos(storePhotos);
  }, [storeId]);

  // Video Selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVideoName(file.name);
      setSubmissionSuccess(false);
      setSubmissionStatus("IDLE");
    }
  };

  // Submit CCTV Video
  const handleSubmitCctv = () => {
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

  const getStatusBadge = (status: GeneratedPhoto["status"]) => {
    switch (status) {
      case "Correct":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
            <Check className="h-3 w-3" />
            <span>Correct</span>
          </span>
        );
      case "Incorrect":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            <X className="h-3 w-3" />
            <span>Incorrect</span>
          </span>
        );
      case "Needs Review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            <AlertTriangle className="h-3 w-3" />
            <span>Needs Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 text-slate-400 border border-white/10">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Pending Officer Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans antialiased text-slate-100 pb-20 max-w-5xl mx-auto">
      {/* ======================================================== */}
      {/* 1. STORE HEADER                                          */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
            <Building className="h-3.5 w-3.5" />
            <span>STORE CCTV PORTAL</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white uppercase">
            {storeName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Store ID: <span className="text-[#10B981] font-bold">{storeId}</span> · Daily CCTV Surveillance Upload
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-white/5 text-slate-300 border-white/10 text-xs px-3 py-1 font-mono">
            Store User
          </Badge>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300">
            <Lock className="h-3 w-3 text-amber-400" />
            <span>Video Only · Photos Auto-Generated</span>
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
      {/* 3. DAILY CCTV UPLOAD (STORE USER HAS ONLY VIDEO UPLOAD)   */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#071126] p-6 sm:p-8 shadow-2xl space-y-6">
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

      {/* ======================================================== */}
      {/* 4. SYSTEM-GENERATED CCTV PHOTOS (READ-ONLY FOR STORE)     */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#071126] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              AUTOMATICALLY EXTRACTED EVIDENCE
            </span>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white uppercase">
              GENERATED PHOTOS ({photos.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Random frames extracted across recording duration for Officer review. Store users cannot edit or verify photos.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-[#050B1A] px-3.5 py-1.5 rounded-xl border border-white/10">
            CCTV ID: <span className="text-slate-200">{currentSubmission?.id}</span>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="group rounded-2xl border border-white/10 bg-[#050B1A] overflow-hidden shadow-lg hover:border-[#4F46FF] transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Photo Image Preview */}
              <div className="relative aspect-[16/10] bg-black overflow-hidden border-b border-white/10">
                <img
                  src={photo.imageUrl}
                  alt={photo.id}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/10">
                  {photo.id}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#050B1A]/80 backdrop-blur-md text-[10px] font-mono font-bold text-[#10B981] border border-white/10">
                  {photo.timestamp}
                </div>
              </div>

              {/* Photo Meta & Status */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-white">{photo.id}</span>
                  <span className="font-mono text-[11px] text-slate-300 font-bold">
                    {photo.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                    {photo.zone}
                  </span>
                  <div>{getStatusBadge(photo.status)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. READ-ONLY PREVIEW MODAL                                */}
      {/* ======================================================== */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#071126] p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-white uppercase">
                  {previewPhoto.id} · {previewPhoto.timestamp}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {storeName} ({storeId}) · Extracted from CCTV video
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer border border-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[16/10]">
              <img
                src={previewPhoto.imageUrl}
                alt={previewPhoto.id}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                  Timestamp
                </span>
                <span className="font-mono text-sm text-white font-bold">
                  {previewPhoto.timestamp}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold mb-1">
                  Status
                </span>
                <div>{getStatusBadge(previewPhoto.status)}</div>
              </div>
            </div>

            {previewPhoto.officerComment && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#10B981] font-bold block">
                  Officer Comment:
                </span>
                <p className="text-slate-200 italic">"{previewPhoto.officerComment}"</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <Button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="bg-white/5 hover:bg-white/10 text-white text-xs h-10 px-5 rounded-xl border border-white/10 cursor-pointer"
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
