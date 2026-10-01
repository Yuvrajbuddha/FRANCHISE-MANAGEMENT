import React from "react";
import { FileCheck2 } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function CorrectiveActionsPage() {
  return (
    <ModulePlaceholder
      title="Corrective Action Loop (CAPA)"
      phase="Phase 15"
      description="Closed-loop remediation: Issue Detected → Violation Confirmed → Action Assigned → Evidence Resubmitted → Officer Verified → Closed."
      icon={FileCheck2}
      features={[
        "Status pipeline: Open → In Progress → Pending Verification → Completed → Closed → Overdue",
        "Assigned responsible franchisee manager and statutory deadlines",
        "Resubmission of corrective evidence (photos/checklists)",
        "Overdue alert automation and officer sign-off requirements",
      ]}
    />
  );
}
