// Foundational Domain Types for Franchise Management System

export type UserRole = "ADMIN" | "OWNER" | "FRANCHISE" | "OFFICER";

export type OperatingModel = "COCO" | "FOCO"; // Company-Owned Company-Operated vs Franchise-Owned Company-Operated

export type OutletStatus = "ACTIVE" | "INACTIVE" | "UNDER_REVIEW" | "PROBATION";

export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";

export type ComplianceStatus = "OPEN" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "RESOLVED";

export type OfficerVerificationStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "MODIFIED";

export type CorrectiveActionStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING_VERIFICATION"
  | "COMPLETED"
  | "CLOSED"
  | "OVERDUE";

export type AlertSeverity = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface Outlet {
  id: string;
  outletId: string;
  name: string;
  city: string;
  operatingModel: OperatingModel;
  assignedUserId?: string;
  status: OutletStatus;
  address?: string;
  phone?: string;
  openedDate?: string;
}

export interface RiskFactors {
  salesScore: number;       // 30% weight
  complianceScore: number;  // 20% weight
  complaintScore: number;   // 20% weight
  evidenceScore: number;    // 15% weight
  operationalScore: number; // 10% weight
  inventoryScore: number;   // 5% weight
}

export interface RiskAssessment {
  id: string;
  outletId: string;
  riskScore: number;        // 0-100 deterministic
  riskLevel: RiskLevel;
  componentScores: RiskFactors;
  explanation: string;
  date: string;
  previousScore?: number;
}
