import React from "react";
import { Video } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function EvidencePage() {
  return (
    <ModulePlaceholder
      title="CCTV Evidence & Frame Extraction Engine"
      phase="Phase 10"
      description="Representative frame sampling with AI-assisted observation drafts and mandatory Human-in-the-Loop verification."
      icon={Video}
      features={[
        "Video duration parsing with 4–5 representative timestamp selection",
        "Deterministic frame extraction avoiding first/last frame bias",
        "AI-assisted observational hints (not verdicts)",
        "Officer review portal: Confirm, Reject, or Modify observations",
      ]}
    />
  );
}
