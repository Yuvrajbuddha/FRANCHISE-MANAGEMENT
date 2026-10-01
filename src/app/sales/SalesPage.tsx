import React from "react";
import { TrendingUp } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function SalesPage() {
  return (
    <ModulePlaceholder
      title="Sales Performance & Anomaly Analytics"
      phase="Phase 6 & 8"
      description="Context-aware sales monitoring with rolling averages and peer benchmark comparisons."
      icon={TrendingUp}
      features={[
        "Daily, weekly, and monthly revenue reconciliations",
        "Contextual pattern engine accounting for seasonality, weather, and holidays",
        "Moving averages and historical peer outlet comparisons",
        "Protection against misclassifying natural volume declines as high risk",
      ]}
    />
  );
}
