import React from "react";
import { FileBarChart } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Executive & Audit Reports"
      phase="Phase 16"
      description="Comprehensive franchise reporting for executive management, regional directors, and bank audits."
      icon={FileBarChart}
      features={[
        "Consolidated profit & loss summaries and EBITDA margin analysis",
        "Stock reconciliation audit certificates with full transaction trail",
        "Territory compliance indices and historical CAPA turnaround metrics",
        "Exportable PDF/Excel dossiers for investor and regulatory review",
      ]}
    />
  );
}
