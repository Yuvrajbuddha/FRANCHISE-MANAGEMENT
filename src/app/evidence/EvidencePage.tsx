import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  Camera,
  Video,
  Upload,
  FileCheck2,
  AlertCircle,
  Building,
  Calendar,
  Lock,
  Eye,
  Info,
  X,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Check,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export type StoreEvidenceStatus =
  | "Pending Officer Review"
  | "Verified"
  | "Incorrect"
  | "Needs Review";

export interface StoreEvidenceItem {
  id: string;
  name: string;
  type: "Photo" | "Video";
  category: string;
  uploadDate: string;
  status: StoreEvidenceStatus;
  description: string;
  officerFeedback?: string;
  mediaUrl?: string;
  resolution?: string;
  duration?: string;
}

const DEFAULT_STORE_EVIDENCE_ITEMS: StoreEvidenceItem[] = [
  {
    id: "EV-001",
    name: "Store Entrance",
    type: "Photo",
    category: "Store Entrance",
    uploadDate: "03 Oct 2026",
    status: "Verified",
    description: "Entrance vestibule, sanitization matting, and customer queue stanchions.",
    officerFeedback: "Store entrance is clean and all required signage is visible.",
    resolution: "1920x1080 HD",
  },
  {
    id: "EV-002",
    name: "Kitchen Prep Counter",
    type: "Video",
    category: "Cleanliness",
    uploadDate: "03 Oct 2026",
    status: "Verified",
    description: "CCTV morning rush assembly line sanitization and glove protocol.",
    officerFeedback: "All crew members wearing PPE and proper headnets verified.",
    duration: "01:24",
    resolution: "1080p @ 30fps",
  },
  {
    id: "EV-003",
    name: "Inventory Area",
    type: "Photo",
    category: "Inventory Area",
    uploadDate: "03 Oct 2026",
    status: "Needs Review",
    description: "Dry storage racks, Day-Dot FIFO labeling, and elevated floor palettes.",
    officerFeedback: "Image quality is insufficient to verify the requirement. Please upload clearer photo of lower shelf.",
    resolution: "2048x1536",
  },
  {
    id: "EV-004",
    name: "Cold Chain Storage",
    type: "Photo",
    category: "Cold Chain",
    uploadDate: "03 Oct 2026",
    status: "Verified",
    description: "Digital probe thermometer reading 3.4°C inside walk-in refrigeration.",
    officerFeedback: "Temperature probe verified compliant with statutory FSSAI threshold.",
    resolution: "1920x1080",
  },
  {
    id: "EV-005",
    name: "Handwash Station",
    type: "Photo",
    category: "Cleanliness",
    uploadDate: "03 Oct 2026",
    status: "Pending Officer Review",
    description: "Touchless soap dispenser refilled and sanitizer swab logged.",
    resolution: "1920x1080",
  },
  {
    id: "EV-006",
    name: "Order Dispatch Staging",
    type: "Video",
    category: "Service Quality",
    uploadDate: "03 Oct 2026",
    status: "Pending Officer Review",
    description: "Double-bag packaging seal applied before customer handover.",
    duration: "00:45",
    resolution: "1080p @ 30fps",
  },
];

export default function EvidencePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isStoreUser = user?.role === "FRANCHISE" || user?.role === "OWNER";
  const outletId = user?.assignedOutletId || "OUT-042";
  const outletName = outletId === "OUT-042" ? "Lucknow Central" : `Store ${outletId}`;

  // Evidence Items State
  const [evidenceList, setEvidenceList] = useState<StoreEvidenceItem[]>(() => {
    try {
      const stored = localStorage.getItem(`store_evidence_${outletId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_STORE_EVIDENCE_ITEMS;
  });

  // Officer Verified Store Compliance Data (read-only for store)
  const [officerVerifiedData, setOfficerVerifiedData] = useState<{
    rating: number;
    status: string;
    feedback: string;
    officer: string;
    date: string;
  } | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("officer_verified_stores") || "{}");
      if (stored[outletId]) {
        return {
          rating: stored[outletId].rating ?? 8,
          status: stored[outletId].status ?? "Verified",
          feedback:
            stored[outletId].observation ||
            "Most requirements were met. Minor corrective action is required for the inventory area.",
          officer: stored[outletId].officer || "Officer Yuvraj Buddha",
          date: stored[outletId].inspectionDate || "03 Oct 2026",
        };
      }
    } catch {}
    // Default baseline if officer reviewed
    return {
      rating: 8,
      status: "Verified",
      feedback: "Most requirements were met. Minor corrective action is required for the inventory area.",
      officer: "Officer Yuvraj Buddha",
      date: "03 Oct 2026",
    };
  });

  // Form Upload State for Store User
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Photo" | "Video">("Photo");
  const [newCategory, setNewCategory] = useState("Store Entrance");
  const [newDescription, setNewDescription] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessBanner, setUploadSuccessBanner] = useState<string | null>(null);

  // Search & Status Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Read-only modal viewer for Store User
  const [viewingMediaItem, setViewingMediaItem] = useState<StoreEvidenceItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sync with Officer verifications from localStorage or API
  useEffect(() => {
    try {
      const storedVerifications = JSON.parse(localStorage.getItem("officer_verified_stores") || "{}");
      if (storedVerifications[outletId]) {
        const v = storedVerifications[outletId];
        setOfficerVerifiedData({
          rating: v.rating ?? 8,
          status: v.status ?? "Verified",
          feedback: v.observation || "Most requirements were met. Minor corrective action is required for the inventory area.",
          officer: v.officer || "Officer Yuvraj Buddha",
          date: v.inspectionDate || "03 Oct 2026",
        });
      }
    } catch {}
  }, [outletId]);

  // Persist evidence updates
  useEffect(() => {
    try {
      localStorage.setItem(`store_evidence_${outletId}`, JSON.stringify(evidenceList));
    } catch {}
  }, [evidenceList, outletId]);

  // Handle Store User uploading new evidence
  const handleStoreUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      const newItem: StoreEvidenceItem = {
        id: `EV-${String(evidenceList.length + 1).padStart(3, "0")}`,
        name: newTitle.trim(),
        type: newType,
        category: newCategory,
        uploadDate: "03 Oct 2026",
        // When a Store user uploads photos/videos, each submission MUST receive: PENDING OFFICER REVIEW
        status: "Pending Officer Review",
        description: newDescription.trim() || `${newCategory} evidence photo uploaded by store team.`,
        resolution: newType === "Photo" ? "1920x1080 HD" : "1080p @ 30fps",
        duration: newType === "Video" ? "01:15" : undefined,
      };

      setEvidenceList((prev) => [newItem, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setSelectedFileName("");
      setIsUploading(false);
      setUploadSuccessBanner(
        `✓ "${newItem.name}" submitted successfully! Assigned Status: PENDING OFFICER REVIEW.`
      );

      setTimeout(() => setUploadSuccessBanner(null), 6000);
    }, 600);
  };

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: StoreEvidenceStatus) => {
    switch (status) {
      case "Pending Officer Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>Pending Officer Review</span>
          </span>
        );
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Check className="h-3 w-3 text-emerald-400" />
            <span>Verified</span>
          </span>
        );
      case "Incorrect":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <X className="h-3 w-3 text-rose-400" />
            <span>Incorrect</span>
          </span>
        );
      case "Needs Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <AlertTriangle className="h-3 w-3 text-orange-400" />
            <span>Needs Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans antialiased text-slate-100 pb-20 max-w-7xl mx-auto">
      {/* ======================================================== */}
      {/* 1. STORE HEADER & IDENTITY BANNER                        */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#00B894] flex items-center gap-1.5 mb-1">
            <Building className="h-3.5 w-3.5" />
            <span>STORE COMPLIANCE & EVIDENCE REGISTRY</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white uppercase">
            {outletName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Store ID: <span className="font-mono text-emerald-400 font-semibold">{outletId}</span> · Operational Unit & Evidence Dispatch Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-white/5 text-slate-300 border-white/10 text-xs px-3.5 py-1.5 font-mono">
            {isStoreUser ? "Store Operator Session" : "Store Audit View"}
          </Badge>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>Officer Verified Pipeline</span>
          </div>
        </div>
      </div>

      {/* Global Success Notification */}
      {uploadSuccessBanner && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between shadow-xl shadow-amber-500/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400 shrink-0" />
            <span className="font-medium">{uploadSuccessBanner}</span>
          </div>
          <button
            onClick={() => setUploadSuccessBanner(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. STORE COMPLIANCE RATING (OFFICER-SUBMITTED RESULT)    */}
      {/* ======================================================== */}
      {officerVerifiedData && (
        <div className="rounded-[28px] border border-emerald-500/30 bg-[#0A1224] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#00B894] flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>OFFICIAL STATUTORY INSPECTION RESULT</span>
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-white uppercase">
                STORE COMPLIANCE RATING
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official rating determined by Quality & Compliance Officer based on submitted evidence.
              </p>
            </div>

            {/* Read-Only Notice Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Read-Only Officer Certification</span>
            </div>
          </div>

          {/* Rating Display & Officer Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            {/* Rating Number Column */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-[#050B1A] border border-white/10 flex flex-col justify-center items-center text-center space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold">
                Store Compliance Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-5xl sm:text-6xl font-bold text-emerald-400 tracking-tight">
                  {officerVerifiedData.rating}
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-normal text-slate-500">
                  / 10
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{officerVerifiedData.rating * 10}% Certified</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono pt-1">
                Evaluation Date: {officerVerifiedData.date}
              </span>
            </div>

            {/* Officer Feedback Column */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-[#050B1A] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-[#22D3EE]" />
                  <span>Officer Feedback:</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  Verified by {officerVerifiedData.officer}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed italic">
                "{officerVerifiedData.feedback}"
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Info className="h-4 w-4 text-slate-500 shrink-0" />
                <span>Store operators cannot edit the officer's score. Contact Quality & Compliance for re-inspection inquiries.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. UPLOAD EVIDENCE SECTION (STORE USER INPUT)            */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] block mb-1">
              DAILY AUDIT SUBMISSION
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-white uppercase">
              UPLOAD STORE EVIDENCE
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit daily photographs and CCTV video clips. Each upload receives <span className="text-amber-400 font-mono font-semibold">PENDING OFFICER REVIEW</span> status.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 bg-[#050B1A] px-3.5 py-2 rounded-xl border border-white/10">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            <span>Store user cannot mark self-verified</span>
          </div>
        </div>

        <form onSubmit={handleStoreUploadSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Evidence Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Evidence Name / Location
              </label>
              <Input
                placeholder="e.g. Store Entrance, Prep Line..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="h-10 text-xs border-white/10 bg-[#050B1A] text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            {/* Type: Photo / Video */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Media Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewType("Photo")}
                  className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    newType === "Photo"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "bg-[#050B1A] text-slate-400 border border-white/10 hover:text-white"
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  <span>Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewType("Video")}
                  className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    newType === "Video"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                      : "bg-[#050B1A] text-slate-400 border border-white/10 hover:text-white"
                  }`}
                >
                  <Video className="h-4 w-4" />
                  <span>Video</span>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Audit Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/10 bg-[#050B1A] px-3 text-xs text-white cursor-pointer focus:border-emerald-500"
              >
                <option value="Store Entrance">Store Entrance</option>
                <option value="Cleanliness">Cleanliness & Hygiene</option>
                <option value="Inventory Area">Inventory Area</option>
                <option value="Cold Chain">Cold Chain & Chiller</option>
                <option value="Staff PPE">Staff PPE & Compliance</option>
                <option value="Service Quality">Packaging & Quality</option>
              </select>
            </div>
          </div>

          {/* Description & File Picker */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Description / Checklist Notes
              </label>
              <Input
                placeholder="e.g. Front vestibule swept, floor mats sanitized, safety advisory signage verified intact."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="h-10 text-xs border-white/10 bg-[#050B1A] text-white rounded-xl placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            {/* Upload File Button */}
            <div className="md:col-span-4 flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept={newType === "Photo" ? "image/*" : "video/*"}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFileName(e.target.files[0].name);
                    if (!newTitle) {
                      setNewTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-10 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="h-4 w-4 text-emerald-400" />
                <span className="truncate max-w-[180px]">
                  {selectedFileName ? selectedFileName : `Select ${newType} File`}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Uploaded item will be placed in the officer queue with status: <strong className="text-amber-300">Pending Officer Review</strong>.</span>
            </div>

            <Button
              type="submit"
              disabled={isUploading}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs h-11 px-6 rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer gap-2 transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>{isUploading ? "Uploading Evidence..." : "Submit Evidence to Officer Queue"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 4. SUBMITTED EVIDENCE TABLE                              */}
      {/* ======================================================== */}
      <div className="rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] block mb-1">
              STORE EVIDENCE DOSSIER
            </span>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white uppercase">
              SUBMITTED EVIDENCE
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status of all store photographic and video submissions verified by the Quality Officer.
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search submitted evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs border-white/10 bg-[#050B1A] text-white rounded-xl placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#050B1A] border border-white/10 text-xs">
              {["ALL", "Pending Officer Review", "Verified", "Incorrect", "Needs Review"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-emerald-500 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st === "ALL" ? "All" : st.replace("Pending Officer Review", "Pending")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Evidence Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-semibold">Evidence</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Upload Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Officer Observation</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvidence.map((item) => (
                <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                  {/* Evidence Title & Type */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {item.type === "Photo" ? (
                          <Camera className="h-4 w-4 text-cyan-400" />
                        ) : (
                          <Video className="h-4 w-4 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-serif text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.type} · {item.resolution || item.duration || "HD"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 text-slate-300 border border-white/10">
                      {item.category}
                    </span>
                  </td>

                  {/* Upload Date */}
                  <td className="py-4 px-4 font-mono text-slate-300 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.uploadDate}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* Officer Observation Feedback */}
                  <td className="py-4 px-4 text-slate-300 max-w-xs">
                    {item.officerFeedback ? (
                      <p className="text-[11px] text-slate-200 italic line-clamp-2">
                        "{item.officerFeedback}"
                      </p>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        Awaiting officer review
                      </span>
                    )}
                  </td>

                  {/* Read-Only View Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setViewingMediaItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-[11px] font-semibold cursor-pointer transition-all inline-flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* READ-ONLY MEDIA PREVIEW MODAL FOR STORE USER             */}
      {/* ======================================================== */}
      {viewingMediaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl text-slate-100 my-auto space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-emerald-400 font-bold">{viewingMediaItem.id}</span>
                  <span className="text-slate-500 font-mono text-xs">·</span>
                  <span className="text-xs font-mono text-slate-400">{viewingMediaItem.category}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                  {viewingMediaItem.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setViewingMediaItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer border border-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Read-Only Media Screen */}
            <div className="rounded-2xl border border-white/10 bg-black min-h-[260px] p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                {viewingMediaItem.type === "Photo" ? (
                  <Camera className="h-8 w-8 text-cyan-400" />
                ) : (
                  <Video className="h-8 w-8 text-indigo-400" />
                )}
              </div>
              <div className="font-serif text-base font-bold text-white">
                {viewingMediaItem.name} ({viewingMediaItem.type})
              </div>
              <p className="text-xs text-slate-300 max-w-md">
                {viewingMediaItem.description}
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Upload Date: {viewingMediaItem.uploadDate} · {viewingMediaItem.resolution || "HD 1080p"}
              </div>
            </div>

            {/* Status & Officer Observation Section */}
            <div className="p-4 rounded-xl bg-[#050B1A] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Current Status:</span>
                <div>{getStatusBadge(viewingMediaItem.status)}</div>
              </div>

              {viewingMediaItem.officerFeedback && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold mb-1">
                    Officer Observation:
                  </span>
                  <p className="text-slate-200 italic bg-white/5 p-3 rounded-lg border border-white/5">
                    "{viewingMediaItem.officerFeedback}"
                  </p>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <Button
                type="button"
                onClick={() => setViewingMediaItem(null)}
                className="bg-white/5 hover:bg-white/10 text-white text-xs h-10 px-5 rounded-xl border border-white/10 cursor-pointer"
              >
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
