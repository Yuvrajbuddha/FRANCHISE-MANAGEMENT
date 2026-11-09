import React, { useState } from "react";
import {
  Store,
  ClipboardCheck,
  Camera,
  Cpu,
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  ArrowRight,
  ChevronRight,
  Check,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  label: string;
  role: string;
  headline: string;
  description: string;
  inputs: string[];
  outputs: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    label: "Franchise Outlet",
    role: "Store Crew & GM",
    headline: "Daily Outlet Operations",
    description: "Frontline store staff run daily kitchen prep, guest service, POS order billing, and commissary raw ingredient receipt.",
    inputs: ["Store opening checklist", "Commissary delivery invoice", "Kitchen prep schedule"],
    outputs: ["Physical shift operations", "Raw CCTV security stream"],
    icon: Store,
  },
  {
    id: 2,
    label: "Inspection",
    role: "Field Auditor",
    headline: "Walkthrough & Audit Initiation",
    description: "Scheduled quarterly inspections or automated prober triggers initiate comprehensive review across 4 core standard operating categories.",
    inputs: ["Store master registry", "Quarterly audit calendar", "Past violation history"],
    outputs: ["Inspection session ID", "Digital audit assignment"],
    icon: ClipboardCheck,
  },
  {
    id: 3,
    label: "Evidence Collection",
    role: "Evidence Vault Engine",
    headline: "Multi-Source Evidence Ingestion",
    description: "Ingests surveillance CCTV video recordings, store walk-in photos, POS end-of-day sales slips, and vendor supplier invoices into the vault.",
    inputs: ["MP4 video footage", "POS daily transaction logs", "Commissary delivery sheets"],
    outputs: ["Encrypted evidence repository", "Immutable SHA-256 hashes"],
    icon: Camera,
  },
  {
    id: 4,
    label: "AI Risk Analysis",
    role: "Sentinel AI Core",
    headline: "Automated Frame & Variance Analysis",
    description: "Computer vision algorithms isolate genuine video keyframes at critical timestamps, while deterministic equations cross-check supply vs POS revenue.",
    inputs: ["Raw surveillance frames", "POS receipt lines", "Commissary recipe yields"],
    outputs: ["Timestamped frame extractions", "Inventory variance percentage", "Multivariate risk index"],
    icon: Cpu,
  },
  {
    id: 5,
    label: "Compliance Verification",
    role: "Compliance Officer",
    headline: "Human-in-the-Loop Officer Review",
    description: "Authorized compliance officer inspects AI-flagged frame extractions, confirms or overrides visual observations, and scores standard hygiene adherence.",
    inputs: ["AI observations list", "Extracted video frames", "Historical branch benchmark"],
    outputs: ["Certified compliance grade (0-100%)", "Confirmed infraction notices"],
    icon: ShieldCheck,
  },
  {
    id: 6,
    label: "Corrective Action",
    role: "Store Manager & Officer",
    headline: "CAPA Remediation & Re-Audit",
    description: "For any identified non-compliance, a statutory Corrective and Preventive Action (CAPA) ticket is generated with a strict resolution deadline.",
    inputs: ["Violation severity", "Root cause description", "Remediation requirements"],
    outputs: ["CAPA tracking ticket", "Re-inspection verification proof"],
    icon: AlertOctagon,
  },
  {
    id: 7,
    label: "Final Report",
    role: "Executive Leadership",
    headline: "Certified Audit Dossier Issuance",
    description: "Generates tamper-evident executive audit reports with cryptographic hash, distributed to franchise owners and headquarters leadership.",
    inputs: ["Officer sign-off", "Verified evidence proofs", "CAPA resolution log"],
    outputs: ["Executive PDF audit report", "Royalty rating settlement"],
    icon: FileCheck,
  },
];

export function AuditWorkflowSection() {
  const [activeStepId, setActiveStepId] = useState<number>(4); // Default on AI Risk Analysis
  const activeStep = WORKFLOW_STEPS.find((s) => s.id === activeStepId) || WORKFLOW_STEPS[0];

  return (
    <section className="py-20 md:py-28 bg-[#F6F1E7] border-t border-[#DDE5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#13845B] block">
            END-TO-END OPERATIONAL WORKFLOW
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#073B2A]">
            Continuous Closed-Loop Audit Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-[#738078]">
            From physical store operations to executive sign-off: an unbroken chain of custody ensuring complete transparency and zero guesswork.
          </p>
        </div>

        {/* Horizontal Connected-Node Workflow Strip */}
        <div className="mb-10 overflow-x-auto pb-4">
          <div className="min-w-[850px] flex items-center justify-between relative px-4">
            {/* Background connecting track */}
            <div className="absolute left-8 right-8 top-6 h-0.5 bg-[#DDE5DC] -z-0" />

            {WORKFLOW_STEPS.map((step) => {
              const Icon = step.icon;
              const isSelected = step.id === activeStepId;
              const isPast = step.id < activeStepId;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className="flex flex-col items-center group relative z-10 cursor-pointer focus:outline-none"
                >
                  {/* Step Icon Disc */}
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-200 border-2 ${
                      isSelected
                        ? "bg-[#073B2A] text-[#72D6A0] border-[#13845B] shadow-md scale-110"
                        : isPast
                        ? "bg-[#E6F8EF] text-[#13845B] border-[#13845B]"
                        : "bg-[#FFFDF8] text-[#738078] border-[#DDE5DC] hover:border-[#13845B]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Step Name */}
                  <span
                    className={`text-xs font-semibold mt-3 whitespace-nowrap transition-colors ${
                      isSelected ? "text-[#073B2A] font-bold" : "text-[#738078] group-hover:text-[#073B2A]"
                    }`}
                  >
                    {step.label}
                  </span>

                  {/* Step Number Tag */}
                  <span className="text-[10px] font-mono text-[#738078] mt-0.5">
                    Step 0{step.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Deep-Dive Card */}
        <div className="rounded-3xl bg-[#FFFDF8] border border-[#DDE5DC] p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side: Summary & Description */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-[#E6F8EF] text-[#073B2A] border border-[#C7F1DC] text-xs font-mono font-bold">
                  STAGE 0{activeStep.id} OF 07
                </span>
                <span className="text-xs font-medium text-[#738078]">
                  Accountable: <strong className="text-[#073B2A]">{activeStep.role}</strong>
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#073B2A]">
                {activeStep.headline}
              </h3>

              <p className="text-sm text-[#738078] leading-relaxed">
                {activeStep.description}
              </p>

              {/* Navigation between steps */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#DDE5DC]">
                <button
                  disabled={activeStep.id === 1}
                  onClick={() => setActiveStepId((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#DDE5DC] bg-[#FAF7F0] text-[#073B2A] hover:bg-[#EAE3D2] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Previous Stage
                </button>
                <button
                  disabled={activeStep.id === WORKFLOW_STEPS.length}
                  onClick={() => setActiveStepId((prev) => Math.min(WORKFLOW_STEPS.length, prev + 1))}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next Stage</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Right Side: Inputs & Outputs Matrix */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#DDE5DC] space-y-4">
                {/* Inputs */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#738078] font-bold block mb-2">
                    Verified Inputs:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#18251F]">
                    {activeStep.inputs.map((inp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-[#13845B] shrink-0 mt-0.5" />
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs */}
                <div className="pt-3 border-t border-[#DDE5DC]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#13845B] font-bold block mb-2">
                    Certified Deliverables:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#18251F]">
                    {activeStep.outputs.map((out, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#13845B] shrink-0 mt-1.5" />
                        <span className="font-semibold text-[#073B2A]">{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
