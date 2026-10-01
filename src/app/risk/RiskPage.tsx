import React from "react";
import { Flame } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function RiskPage() {
  return (
    <ModulePlaceholder
      title="Explainable Risk Intelligence Engine"
      phase="Phase 12"
      description="Deterministic mathematical scoring (0–100) with weighted multi-factor business indicators."
      icon={Flame}
      features={[
        "Deterministic weighting: Sales (30%), Compliance (20%), Complaints (20%), Evidence (15%), Operations (10%), Inventory (5%)",
        "Transparent component scoring avoiding opaque 'black box' AI hallucinations",
        "Clear risk classification tiers (Low, Moderate, Elevated, High, Critical)",
        "Audit trail of score changes across reporting cycles",
      ]}
    />
  );
}
