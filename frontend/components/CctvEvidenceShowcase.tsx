import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Video,
  Upload,
  Cpu,
  Clock,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Play,
  Pause,
  Maximize2,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface EvidenceTimestamp {
  id: string;
  label: string;
  timecode: string;
  camera: string;
  outlet: string;
  imageSrc: string;
  findings: {
    category: string;
    description: string;
    status: "Verified" | "Caution" | "Compliant";
    score: number;
  }[];
  verdict: "Compliant" | "Observation Required";
  hash: string;
}

const EVIDENCE_SAMPLES: EvidenceTimestamp[] = [
  {
    id: "ts-01",
    label: "Kitchen Assembly & Prep",
    timecode: "19:42:08 UTC",
    camera: "CAM-14: Kitchen Central Prep",
    outlet: "Hazratganj Flagship (OUT-042)",
    imageSrc: "/src/assets/images/cctv_kitchen_prep_1794163966421.jpg",
    findings: [
      {
        category: "Staff Hygiene & Apparel",
        description: "Dark green aprons, hairnets, and hygiene gloves verified on all prep crew",
        status: "Verified",
        score: 98,
      },
      {
        category: "Food Prep Sanitization",
        description: "Clean stainless steel prep tables, color-coded cutting boards in place",
        status: "Compliant",
        score: 96,
      },
      {
        category: "Packaging Seal Protocol",
        description: "Double-bag seal inspection confirmed before dispatch to counter",
        status: "Verified",
        score: 97,
      },
    ],
    verdict: "Compliant",
    hash: "0x8f4c93a...d2e7",
  },
  {
    id: "ts-02",
    label: "Cold Storage & Walk-In Chiller",
    timecode: "10:34:57 UTC",
    camera: "CAM-04: Walk-in Cooler",
    outlet: "Sector 18 Market (OUT-089)",
    imageSrc: "/src/assets/images/cctv_cold_storage_1794163967667.jpg",
    findings: [
      {
        category: "Temperature Probe Readout",
        description: "Digital cooler display verified at +3.2°C (Optimal dairy & meat safety bracket)",
        status: "Compliant",
        score: 99,
      },
      {
        category: "Storage Organization",
        description: "Crates stacked 6 inches off floor, color-coded perishable labels present",
        status: "Verified",
        score: 95,
      },
      {
        category: "First-In First-Out (FIFO)",
        description: "Batch date tags oriented forward for correct ingredient rotation",
        status: "Verified",
        score: 94,
      },
    ],
    verdict: "Compliant",
    hash: "0x3e1b71c...a90f",
  },
  {
    id: "ts-03",
    label: "Front Counter & Customer Service",
    timecode: "13:42:15 UTC",
    camera: "CAM-04: Dining & POS Order Counter",
    outlet: "Cyber Hub Galleria (OUT-142)",
    imageSrc: "/src/assets/images/cctv_store_front_1794163968409.jpg",
    findings: [
      {
        category: "Point of Sale Billing",
        description: "Every guest order punched into POS terminal prior to service dispatch",
        status: "Compliant",
        score: 96,
      },
      {
        category: "Dining Cleanliness",
        description: "Tables sanitized within 90 seconds of guest departures",
        status: "Verified",
        score: 93,
      },
      {
        category: "Brand Standard Display",
        description: "Digital menu boards synchronized with central promotional pricing",
        status: "Verified",
        score: 97,
      },
    ],
    verdict: "Compliant",
    hash: "0x7a92dd4...e18b",
  },
];

export function CctvEvidenceShowcase() {
  const [activeStep, setActiveStep] = useState<number>(3); // 1 = Upload, 2 = Process, 3 = Extract, 4 = Verify, 5 = Report
  const [selectedSample, setSelectedSample] = useState<EvidenceTimestamp>(EVIDENCE_SAMPLES[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    { num: 1, title: "CCTV Video Upload", desc: "Multi-stream MP4/RTSP footage ingestion", icon: Upload },
    { num: 2, title: "Video Processing", desc: "Keyframe indexing & scene segmentation", icon: Cpu },
    { num: 3, title: "Timestamp Extraction", desc: "Accurate frame isolation at critical moments", icon: Clock },
    { num: 4, title: "Evidence Verification", desc: "Multi-criteria standard checks & scoring", icon: ShieldCheck },
    { num: 5, title: "Audit Report Generation", desc: "Certified cryptographically signed PDF", icon: FileCheck2 },
  ];

  return (
    <section className="relative py-20 bg-[#073B2A] text-white overflow-hidden">
      {/* Background Decorative Mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#72D6A0]/30 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#72D6A0] block">
            CCTV EVIDENCE INTELLIGENCE PIPELINE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            From Surveillance Stream to Verified Evidence
          </h2>
          <p className="text-sm sm:text-base text-[#CAD5C9] font-sans">
            Transform high-volume video recordings into deterministic audit proof. Extract verified timestamps, detect kitchen SOP non-compliance, and produce tamper-evident audit dossiers.
          </p>
        </div>

        {/* 5-Stage Interactive Step Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.num;
            const isCompleted = activeStep > s.num;

            return (
              <button
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? "bg-[#031D15] border-[#72D6A0] shadow-[0_0_20px_rgba(114,214,160,0.2)]"
                    : isCompleted
                    ? "bg-[#05291F] border-[#13845B] text-white/90"
                    : "bg-[#05291F]/60 border-[#0D4E39] text-[#CAD5C9] hover:border-[#13845B]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isActive
                        ? "bg-[#13845B] text-white"
                        : isCompleted
                        ? "bg-[#073B2A] text-[#72D6A0]"
                        : "bg-[#073B2A] text-white/60"
                    }`}
                  >
                    STAGE 0{s.num}
                  </span>
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-[#72D6A0]" : isCompleted ? "text-[#13845B]" : "text-white/40"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white truncate">{s.title}</h4>
                  <p className="text-[10px] text-[#CAD5C9] mt-0.5 line-clamp-1">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main CCTV Intelligence Workplace Card */}
        <div className="rounded-3xl bg-[#031D15] border border-[#0D4E39] p-4 sm:p-7 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: CCTV Video Screen with Live Frame HUD */}
          <div className="lg:col-span-7 space-y-4">
            {/* Camera Viewport Header */}
            <div className="flex items-center justify-between border-b border-[#0D4E39] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white tracking-wide">
                  {selectedSample.camera}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#72D6A0]">
                {selectedSample.outlet}
              </span>
            </div>

            {/* Extracted Frame Screen with Verification Overlays */}
            <div className="relative rounded-2xl overflow-hidden border border-[#0D4E39] bg-black aspect-video flex flex-col justify-between group">
              {/* Actual Generated Surveillance Image */}
              <img
                src={selectedSample.imageSrc}
                alt={selectedSample.label}
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />

              {/* Dark subtle gradient scrim for HUD legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

              {/* Top HUD Telemetry */}
              <div className="relative z-10 p-3.5 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-white">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>LIVE RECORDING</span>
                </div>
                <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[#72D6A0] font-bold">
                  {selectedSample.timecode}
                </div>
              </div>

              {/* Center Verification Overlay Box */}
              <div className="relative z-10 m-auto max-w-sm w-full mx-4 sm:mx-auto bg-black/65 backdrop-blur-sm border border-[#72D6A0]/50 rounded-xl p-3 text-center space-y-1.5 shadow-lg">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-[#72D6A0]" />
                  <span>AI Computer Vision Verified</span>
                </div>
                <p className="text-[10px] font-mono text-[#CAD5C9]">
                  {selectedSample.findings[0]?.description}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-[#72D6A0] border border-emerald-500/40">
                    Confidence: {selectedSample.findings[0]?.score}%
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-black/80 text-white/70 border border-white/10">
                    SHA-256: {selectedSample.hash}
                  </span>
                </div>
              </div>

              {/* Bottom Video Controls Strip */}
              <div className="relative z-10 p-3.5 flex items-center justify-between text-[11px] font-mono text-white/90 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <span className="text-[10px] text-[#CAD5C9]">Timestamp: {selectedSample.timecode}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px]">
                    1080p FHD · 30 FPS
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#13845B] text-white font-bold text-[10px]">
                    AUTHENTIC EXTRACT
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamp Selector Tabs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#CAD5C9] block">
                Select Extracted Timestamp Feed:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {EVIDENCE_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => setSelectedSample(sample)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedSample.id === sample.id
                        ? "bg-[#05291F] border-[#72D6A0] text-white shadow-sm"
                        : "bg-[#031D15] border-[#0D4E39] text-[#CAD5C9] hover:border-[#13845B]"
                    }`}
                  >
                    <div className="font-semibold text-white truncate">{sample.label}</div>
                    <div className="text-[10px] font-mono text-[#72D6A0] mt-0.5">
                      {sample.timecode}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Evidence Findings & Official Audit Dossier */}
          <div className="lg:col-span-5 space-y-5">
            {/* Audit Dossier Header */}
            <div className="p-4 rounded-2xl bg-[#05291F] border border-[#0D4E39] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#72D6A0] font-bold">
                  EVIDENCE VERIFICATION CARD
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#073B2A] text-[#72D6A0] border border-[#13845B]">
                  AUDIT PASS
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {selectedSample.outlet}
                </h3>
                <p className="text-xs text-[#CAD5C9]">
                  Inspection Timecode: {selectedSample.timecode} · {selectedSample.camera}
                </p>
              </div>

              {/* 3 Verification Checklist Items */}
              <div className="space-y-2.5 pt-2 border-t border-[#0D4E39]">
                {selectedSample.findings.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#031D15] border border-[#0D4E39] space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#72D6A0] shrink-0" />
                        <span>{f.category}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#72D6A0]">
                        {f.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#CAD5C9] leading-relaxed pl-5">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Audit Report Preview */}
            <div className="p-4 rounded-2xl bg-[#073B2A] border border-[#13845B]/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#72D6A0]" />
                  <span className="text-xs font-semibold text-white">
                    Official Franchise Audit Dossier
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#72D6A0]">PDF Generated</span>
              </div>

              <div className="p-3 rounded-xl bg-[#031D15] border border-[#0D4E39] text-[11px] font-mono space-y-1.5 text-[#CAD5C9]">
                <div className="flex justify-between">
                  <span>Dossier ID:</span>
                  <span className="text-white font-bold">AUD-2026-0428</span>
                </div>
                <div className="flex justify-between">
                  <span>Auditor Sign-off:</span>
                  <span className="text-white">Yuvraj Buddha (Compliance Officer)</span>
                </div>
                <div className="flex justify-between">
                  <span>Hash Fingerprint:</span>
                  <span className="text-[#72D6A0] truncate max-w-[160px]">{selectedSample.hash}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/evidence"
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#13845B] hover:bg-[#0E6847] text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect CCTV Evidence Vault</span>
                </Link>
                <Link
                  to="/compliance"
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#031D15] hover:bg-[#05291F] text-[#CAD5C9] border border-[#0D4E39] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Officer Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
