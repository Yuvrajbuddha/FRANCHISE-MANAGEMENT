export type RiskLevel = "Low" | "Moderate" | "Elevated" | "High" | "Critical";

export interface RiskFactorDetail {
  name: string;
  rawScore: number; // 0 to 100
  weight: number; // e.g. 0.30
  weightedScore: number; // rawScore * weight
  description: string;
  metricDetails: Record<string, any>;
}

export interface RiskAssessmentResult {
  assessmentId: string;
  outletId: string;
  score: number; // 0 to 100 deterministic
  level: RiskLevel;
  factors: {
    salesAnomalies: RiskFactorDetail;
    compliance: RiskFactorDetail;
    complaints: RiskFactorDetail;
    evidence: RiskFactorDetail;
    operational: RiskFactorDetail;
    inventory: RiskFactorDetail;
  };
  contributingFactors: string[];
  explanation: string;
  assessedAt: string;
}
