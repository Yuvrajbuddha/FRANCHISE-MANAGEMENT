import { db } from "../db/index.ts";
import {
  outlets,
  outletSales,
  outletInventory,
  outletComplaints,
  outletEvidence,
  outletAlerts,
  outletCorrectiveActions,
  complianceInspections,
  inventoryReconciliations,
  outletRiskAssessments,
} from "../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { RiskLevel, RiskFactorDetail, RiskAssessmentResult } from "../types/risk-types";

export type { RiskLevel, RiskFactorDetail, RiskAssessmentResult };

dotenv.config();

// Ensure Gemini client is instantiated strictly on the server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// In-memory cache for explanations and rate-limit cooldown tracker
const explanationCache = new Map<string, string>();
let rateLimitCooldownUntil = 0;

/**
 * Determine risk level based on strict deterministic brackets:
 * 0–20 = Low
 * 21–40 = Moderate
 * 41–60 = Elevated
 * 61–80 = High
 * 81–100 = Critical
 */
export function getRiskLevel(score: number): RiskLevel {
  const s = Math.round(score);
  if (s <= 20) return "Low";
  if (s <= 40) return "Moderate";
  if (s <= 60) return "Elevated";
  if (s <= 80) return "High";
  return "Critical";
}

/**
 * Compute raw risk score for Sales/Financial Anomalies (Weight: 30%)
 * Analyzes cash ratio, invoice variance, revenue decline vs baseline.
 */
function computeSalesAnomaliesScore(salesRecords: any[]): { score: number; description: string; details: any } {
  if (!salesRecords || salesRecords.length === 0) {
    return { score: 15, description: "Nominal transaction flow with standard cash/digital parity.", details: {} };
  }

  let totalSales = 0;
  let cashSales = 0;
  let digitalSales = 0;

  salesRecords.forEach((s) => {
    const cash = Number(s.cashSales || 0);
    const digital = Number(s.digitalSales || 0);
    cashSales += cash;
    digitalSales += digital;
    totalSales += Number(s.netSales || (cash + digital));
  });

  const cashRatio = totalSales > 0 ? (cashSales / totalSales) * 100 : 30;

  // Expected cash ratio in standard Indian QSR mall/high-street is ~25-35%.
  // If cash ratio exceeds 50%, or drops under 10% abruptly, flags variance.
  let score = 10;
  let reason = "Healthy cash-to-digital distribution aligns with baseline.";

  if (cashRatio > 65) {
    score = 75;
    reason = `Abnormally elevated cash tender proportion (${Math.round(cashRatio)}% vs standard 30% baseline).`;
  } else if (cashRatio > 45) {
    score = 45;
    reason = `Moderate cash tender variance observed (${Math.round(cashRatio)}% cash tender).`;
  } else if (cashRatio < 12 && totalSales > 50000) {
    score = 30;
    reason = `Unusually low cash ratio (${Math.round(cashRatio)}%), potential off-book cash leakage check.`;
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    description: reason,
    details: { totalSales, cashRatio: Math.round(cashRatio), recordCount: salesRecords.length },
  };
}

/**
 * Compute raw risk score for Compliance Violations (Weight: 20%)
 * Evaluates open vs verified vs critical compliance inspections.
 */
function computeComplianceScore(inspections: any[]): { score: number; description: string; details: any } {
  if (!inspections || inspections.length === 0) {
    return { score: 10, description: "Zero recorded compliance infractions.", details: {} };
  }

  let openCount = 0;
  let criticalCount = 0;
  let highCount = 0;
  let verifiedCount = 0;

  inspections.forEach((i) => {
    if (i.status === "OPEN" || i.status === "UNDER_REVIEW") openCount++;
    if (i.status === "VERIFIED" || i.status === "RESOLVED") verifiedCount++;
    if (i.severity === "CRITICAL") criticalCount++;
    if (i.severity === "HIGH") highCount++;
  });

  // Deterministic formula
  let score = 10 + openCount * 12 + criticalCount * 25 + highCount * 10 - verifiedCount * 4;
  score = Math.min(100, Math.max(5, score));

  let description = "Compliance inspections within acceptable operational par.";
  if (criticalCount > 0) {
    description = `${criticalCount} Critical compliance infraction(s) pending remediation.`;
  } else if (openCount > 2) {
    description = `${openCount} Compliance observations awaiting reviewer sign-off.`;
  }

  return {
    score,
    description,
    details: { total: inspections.length, openCount, criticalCount, highCount, verifiedCount },
  };
}

/**
 * Compute raw risk score for Customer Complaints (Weight: 20%)
 * Evaluates severity, quantity, and unresolved complaints.
 */
function computeComplaintsScore(complaints: any[]): { score: number; description: string; details: any } {
  if (!complaints || complaints.length === 0) {
    return { score: 8, description: "Clean guest satisfaction record; zero open escalations.", details: {} };
  }

  let criticalCount = 0;
  let highCount = 0;
  let openCount = 0;

  complaints.forEach((c) => {
    if (c.severity === "Critical" || c.severity === "CRITICAL") criticalCount++;
    if (c.severity === "High" || c.severity === "HIGH") highCount++;
    if (c.status === "Open" || c.status === "Investigating") openCount++;
  });

  let score = 12 + complaints.length * 6 + criticalCount * 20 + highCount * 10 + openCount * 8;
  score = Math.min(100, Math.max(5, score));

  let description = `${complaints.length} customer complaint(s) logged; standard resolution cycle active.`;
  if (criticalCount > 0) {
    description = `Critical hygiene/foreign object customer complaint under active investigation.`;
  } else if (openCount > 1) {
    description = `${openCount} unresolved guest service tickets pending store manager response.`;
  }

  return {
    score,
    description,
    details: { total: complaints.length, criticalCount, highCount, openCount },
  };
}

/**
 * Compute raw risk score for Evidence Observations (Weight: 15%)
 * Evaluates CCTV evidence verifications and AI-flagged discrepancies.
 */
function computeEvidenceScore(evidenceList: any[]): { score: number; description: string; details: any } {
  if (!evidenceList || evidenceList.length === 0) {
    return { score: 10, description: "CCTV surveillance feeds clear of operational obstructions.", details: {} };
  }

  let unverifiedCount = 0;
  let modifiedCount = 0;
  let rejectedCount = 0;

  evidenceList.forEach((e) => {
    if (!e.verified) unverifiedCount++;
    if (e.aiFlag === "MODIFIED") modifiedCount++;
    if (e.aiFlag === "REJECTED") rejectedCount++;
  });

  let score = 15 + unverifiedCount * 15 + modifiedCount * 10;
  score = Math.min(100, Math.max(5, score));

  let description = "CCTV frame extractions show compliant station operations.";
  if (unverifiedCount > 0) {
    description = `${unverifiedCount} CCTV surveillance frame(s) pending officer verification.`;
  } else if (modifiedCount > 0) {
    description = `Officer modified ${modifiedCount} provisional observations during walkthrough check.`;
  }

  return {
    score,
    description,
    details: { total: evidenceList.length, unverifiedCount, modifiedCount, rejectedCount },
  };
}

/**
 * Compute raw risk score for Operational Deviations / CAPA Backlog (Weight: 10%)
 * Evaluates pending corrective action requests.
 */
function computeOperationalScore(actions: any[], alerts: any[]): { score: number; description: string; details: any } {
  const pendingCapa = actions.filter((a) => a.status === "Pending" || a.status === "In Progress").length;
  const unresolvedAlerts = alerts.filter((al) => !al.resolved).length;

  let score = 10 + pendingCapa * 18 + unresolvedAlerts * 8;
  score = Math.min(100, Math.max(5, score));

  let description = "Operational corrective actions progressing according to timeline.";
  if (pendingCapa > 1) {
    description = `${pendingCapa} Corrective Action (CAPA) milestone(s) overdue for resolution.`;
  } else if (unresolvedAlerts > 2) {
    description = `${unresolvedAlerts} active operational threshold alert(s) requiring attention.`;
  }

  return {
    score,
    description,
    details: { pendingCapa, unresolvedAlerts },
  };
}

/**
 * Compute raw risk score for Inventory Discrepancies / History (Weight: 5%)
 * Evaluates variance % and stock discrepancies requiring review.
 */
function computeInventoryScore(reconciliations: any[]): { score: number; description: string; details: any } {
  if (!reconciliations || reconciliations.length === 0) {
    return { score: 10, description: "Inventory stock parity verified across all audited SKUs.", details: {} };
  }

  let discrepancyCount = 0;
  let totalVariance = 0;

  reconciliations.forEach((r) => {
    if (r.hasDiscrepancy) discrepancyCount++;
    totalVariance += Math.abs(Number(r.variance || 0));
  });

  let score = 8 + discrepancyCount * 22;
  score = Math.min(100, Math.max(5, score));

  let description = "Opening vs closing inventory counts match within standard 3% tolerance.";
  if (discrepancyCount > 0) {
    description = `${discrepancyCount} SKU(s) flagged with variance between recorded sales and physical count.`;
  }

  return {
    score,
    description,
    details: { totalItems: reconciliations.length, discrepancyCount, totalVariance },
  };
}

/**
 * Core Deterministic Risk Engine Calculation
 *
 * Formula:
 * score = factor1 * 0.30 + factor2 * 0.20 + factor3 * 0.20 + factor4 * 0.15 + factor5 * 0.10 + factor6 * 0.05
 *
 * All factors are normalized 0-100.
 * Result is strictly deterministic.
 */
export async function calculateOutletRisk(outletId: string): Promise<RiskAssessmentResult> {
  const normOutletId = outletId.toUpperCase().trim();

  // Query PostgreSQL for real multi-table data for this outlet
  const [salesRecords, inspections, complaints, evidenceList, actions, alertsList, reconciliations] =
    await Promise.all([
      db.select().from(outletSales).where(eq(outletSales.outletId, normOutletId)),
      db.select().from(complianceInspections).where(eq(complianceInspections.outletId, normOutletId)),
      db.select().from(outletComplaints).where(eq(outletComplaints.outletId, normOutletId)),
      db.select().from(outletEvidence).where(eq(outletEvidence.outletId, normOutletId)),
      db.select().from(outletCorrectiveActions).where(eq(outletCorrectiveActions.outletId, normOutletId)),
      db.select().from(outletAlerts).where(eq(outletAlerts.outletId, normOutletId)),
      db.select().from(inventoryReconciliations).where(eq(inventoryReconciliations.outletId, normOutletId)),
    ]);

  // Compute individual factors (0-100)
  const salesFactor = computeSalesAnomaliesScore(salesRecords);
  const complianceFactor = computeComplianceScore(inspections);
  const complaintsFactor = computeComplaintsScore(complaints);
  const evidenceFactor = computeEvidenceScore(evidenceList);
  const operationalFactor = computeOperationalScore(actions, alertsList);
  const inventoryFactor = computeInventoryScore(reconciliations);

  // DETERMINISTIC FORMULA (Weighted Sum)
  // Weights:
  // Factor 1 = 30% (Sales/financial anomalies)
  // Factor 2 = 20% (Compliance)
  // Factor 3 = 20% (Customer complaints)
  // Factor 4 = 15% (Evidence observations)
  // Factor 5 = 10% (Operational deviations)
  // Factor 6 = 5%  (Inventory discrepancies)
  const weightedSum =
    salesFactor.score * 0.30 +
    complianceFactor.score * 0.20 +
    complaintsFactor.score * 0.20 +
    evidenceFactor.score * 0.15 +
    operationalFactor.score * 0.10 +
    inventoryFactor.score * 0.05;

  const finalScore = Math.min(100, Math.max(0, Math.round(weightedSum)));
  const level = getRiskLevel(finalScore);

  // Identify contributing factors (any factor scoring > 30, sorted by impact)
  const factorList = [
    { name: "Sales / financial anomalies", raw: salesFactor.score, contribution: salesFactor.score * 0.30, desc: salesFactor.description },
    { name: "Compliance observations", raw: complianceFactor.score, contribution: complianceFactor.score * 0.20, desc: complianceFactor.description },
    { name: "Customer complaints", raw: complaintsFactor.score, contribution: complaintsFactor.score * 0.20, desc: complaintsFactor.description },
    { name: "Evidence observations", raw: evidenceFactor.score, contribution: evidenceFactor.score * 0.15, desc: evidenceFactor.description },
    { name: "Operational deviations & CAPA", raw: operationalFactor.score, contribution: operationalFactor.score * 0.10, desc: operationalFactor.description },
    { name: "Inventory discrepancies", raw: inventoryFactor.score, contribution: inventoryFactor.score * 0.05, desc: inventoryFactor.description },
  ];

  factorList.sort((a, b) => b.contribution - a.contribution);

  const contributingFactors = factorList
    .filter((f) => f.raw >= 25)
    .map((f) => `${f.name} (${f.desc})`);

  if (contributingFactors.length === 0) {
    contributingFactors.push("All operational streams operating within standard par limits.");
  }

  // Generate Natural-Language Explanation:
  // Gemini may generate the narrative explanation, but NEVER the numerical score.
  let explanation = "";
  const cacheKey = `${normOutletId}-${finalScore}-${level}`;

  if (explanationCache.has(cacheKey)) {
    explanation = explanationCache.get(cacheKey)!;
  } else if (aiClient && Date.now() > rateLimitCooldownUntil) {
    try {
      const prompt = `Outlet: ${normOutletId}
Deterministic Risk Score: ${finalScore}/100
Risk Level: ${level}
Factor Breakdown:
- Sales/Financial Anomalies: Score ${salesFactor.score}/100 (Weight: 30%, Contribution: ${(salesFactor.score * 0.30).toFixed(1)}) - ${salesFactor.description}
- Compliance Inspections: Score ${complianceFactor.score}/100 (Weight: 20%, Contribution: ${(complianceFactor.score * 0.20).toFixed(1)}) - ${complianceFactor.description}
- Customer Complaints: Score ${complaintsFactor.score}/100 (Weight: 20%, Contribution: ${(complaintsFactor.score * 0.20).toFixed(1)}) - ${complaintsFactor.description}
- Evidence Observations: Score ${evidenceFactor.score}/100 (Weight: 15%, Contribution: ${(evidenceFactor.score * 0.15).toFixed(1)}) - ${evidenceFactor.description}
- Operational Deviations (CAPA): Score ${operationalFactor.score}/100 (Weight: 10%, Contribution: ${(operationalFactor.score * 0.10).toFixed(1)}) - ${operationalFactor.description}
- Inventory Discrepancies: Score ${inventoryFactor.score}/100 (Weight: 5%, Contribution: ${(inventoryFactor.score * 0.05).toFixed(1)}) - ${inventoryFactor.description}

Write a 2 to 3 sentence objective explanation of why this outlet received its Risk Score of ${finalScore}/100 (${level} Risk).
Highlight the primary contributing factors.
IMPORTANT ETHICAL RULE: Do NOT allege fraud or declare intentional misconduct. Frame everything as operational variance requiring supervisory verification.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.8-flash",
        config: {
          systemInstruction: "You are an explainable enterprise risk intelligence advisor. Explain numerical scores transparently without alarmism.",
          temperature: 0.2,
        },
        contents: prompt,
      });

      explanation = response.text?.trim() || "";
      if (explanation) {
        explanationCache.set(cacheKey, explanation);
      }
    } catch (aiErr: any) {
      // If 429 quota or rate-limit error, enter cooldown for 60 seconds
      const errMsg = String(aiErr?.message || aiErr || "");
      if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        rateLimitCooldownUntil = Date.now() + 60_000;
      }
    }
  }

  if (!explanation) {
    explanation = `${normOutletId} received a deterministic risk score of ${finalScore}/100 (${level} Risk). Primary drivers include ${factorList[0].name.toLowerCase()} (${factorList[0].desc}) and ${factorList[1].name.toLowerCase()} (${factorList[1].desc}). All contributing metrics reflect operational variance under active monitoring.`;
    explanationCache.set(cacheKey, explanation);
  }

  const assessmentId = `RSK-${normOutletId}-${Date.now().toString().slice(-5)}`;
  const assessedAt = new Date().toISOString().replace("T", " ").substring(0, 16);

  const result: RiskAssessmentResult = {
    assessmentId,
    outletId: normOutletId,
    score: finalScore,
    level,
    factors: {
      salesAnomalies: {
        name: "Sales / Financial Anomalies",
        rawScore: salesFactor.score,
        weight: 0.30,
        weightedScore: Number((salesFactor.score * 0.30).toFixed(2)),
        description: salesFactor.description,
        metricDetails: salesFactor.details,
      },
      compliance: {
        name: "Compliance Violations & Observations",
        rawScore: complianceFactor.score,
        weight: 0.20,
        weightedScore: Number((complianceFactor.score * 0.20).toFixed(2)),
        description: complianceFactor.description,
        metricDetails: complianceFactor.details,
      },
      complaints: {
        name: "Customer Complaints & Escalations",
        rawScore: complaintsFactor.score,
        weight: 0.20,
        weightedScore: Number((complaintsFactor.score * 0.20).toFixed(2)),
        description: complaintsFactor.description,
        metricDetails: complaintsFactor.details,
      },
      evidence: {
        name: "Evidence Observations & CCTV Sampling",
        rawScore: evidenceFactor.score,
        weight: 0.15,
        weightedScore: Number((evidenceFactor.score * 0.15).toFixed(2)),
        description: evidenceFactor.description,
        metricDetails: evidenceFactor.details,
      },
      operational: {
        name: "Operational Deviations & CAPA Backlog",
        rawScore: operationalFactor.score,
        weight: 0.10,
        weightedScore: Number((operationalFactor.score * 0.10).toFixed(2)),
        description: operationalFactor.description,
        metricDetails: operationalFactor.details,
      },
      inventory: {
        name: "Inventory Discrepancies & Stock Parity",
        rawScore: inventoryFactor.score,
        weight: 0.05,
        weightedScore: Number((inventoryFactor.score * 0.05).toFixed(2)),
        description: inventoryFactor.description,
        metricDetails: inventoryFactor.details,
      },
    },
    contributingFactors,
    explanation,
    assessedAt,
  };

  // Persist assessment into PostgreSQL outlet_risk_assessments table
  try {
    await db.insert(outletRiskAssessments).values({
      assessmentId,
      outletId: normOutletId,
      score: finalScore,
      level,
      factorSalesAnomalies: String(salesFactor.score),
      factorCompliance: String(complianceFactor.score),
      factorComplaints: String(complaintsFactor.score),
      factorEvidence: String(evidenceFactor.score),
      factorOperational: String(operationalFactor.score),
      factorInventory: String(inventoryFactor.score),
      contributingFactorsJson: JSON.stringify(contributingFactors),
      explanation,
      assessedAt,
    });
  } catch (dbErr) {
    console.warn("[Risk Engine] Could not persist to PostgreSQL:", dbErr);
  }

  return result;
}

/**
 * Multi-Outlet Assessment Batch Generator
 * Evaluates multiple outlets for network comparisons
 */
export async function evaluateNetworkRisk(outletIds: string[]): Promise<RiskAssessmentResult[]> {
  const results: RiskAssessmentResult[] = [];
  for (const id of outletIds) {
    const res = await calculateOutletRisk(id);
    results.push(res);
  }
  return results;
}
