export const CAPA_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "PENDING_VERIFICATION",
  "COMPLETED",
  "CLOSED",
  "OVERDUE",
] as const;

export type CapaStatus = typeof CAPA_STATUSES[number];

export const WORKFLOW_STAGES = [
  "Issue Detected",
  "Officer Review",
  "Violation Confirmed",
  "Corrective Action Assigned",
  "Deadline",
  "New Evidence Submitted",
  "Officer Verification",
  "Issue Closed",
] as const;

export type WorkflowStage = typeof WORKFLOW_STAGES[number];

export interface CorrectiveActionItem {
  id: number;
  actionId: string;
  outletId: string;
  issue: string;
  requiredAction: string;
  assignedPerson: string;
  deadline: string; // YYYY-MM-DD
  status: CapaStatus;
  currentStage: WorkflowStage | string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  // Evidence
  evidence?: string | null;
  evidenceSubmittedBy?: string | null;
  evidenceSubmittedAt?: string | null;
  // Verification
  verificationNotes?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  verificationDecision?: "APPROVED" | "REJECTED" | "PENDING" | null;
  inspectionId?: string | null;
  isOverdue?: boolean;
  daysRemaining?: number;
  createdBy: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CorrectiveActionHistoryEntry {
  id: number;
  actionId: string;
  outletId: string;
  previousStatus?: string | null;
  newStatus: string;
  stage: string;
  performedBy: string;
  remarks: string;
  evidenceDetails?: string | null;
  timestamp: string;
}
