import React from "react";
import { MessageSquareWarning } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function ComplaintsPage() {
  return (
    <ModulePlaceholder
      title="Customer Complaints & Service Quality Registry"
      phase="Phase 9 & 14"
      description="Categorized customer grievance records mapped directly to outlet compliance scores."
      icon={MessageSquareWarning}
      features={[
        "Categorization: Hygiene, Food Quality, Staff Conduct, Order Delays, Billing Errors",
        "Severity weighting and escalation thresholds",
        "Integration into the deterministic risk engine",
        "Resolution tracking and customer satisfaction verification",
      ]}
    />
  );
}
