import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  Flame,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building,
  TrendingUp,
  Scale,
  Sparkles,
  Info,
  Layers,
  HelpCircle,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RiskAssessmentResult, RiskLevel } from "@/types/risk-types";

export function getRiskLevelBadge(level: RiskLevel | string) {
  switch (level?.toLowerCase()) {
    case "critical":
      return (
        <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-extrabold uppercase px-2.5 py-0.5">
          Critical Risk (81–100)
        </Badge>
      );
    case "high":
      return (
        <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 text-xs font-extrabold uppercase px-2.5 py-0.5">
          High Risk (61–80)
        </Badge>
      );
    case "elevated":
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-extrabold uppercase px-2.5 py-0.5">
          Elevated Risk (41–60)
        </Badge>
      );
    case "moderate":
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs font-extrabold uppercase px-2.5 py-0.5">
          Moderate Risk (21–40)
        </Badge>
      );
    case "low":
    default:
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-extrabold uppercase px-2.5 py-0.5">
          Low Risk (0–20)
        </Badge>
      );
  }
}

export function getScoreColor(score: number) {
  if (score > 80) return "text-red-600 dark:text-red-400";
  if (score > 60) return "text-orange-600 dark:text-orange-400";
  if (score > 40) return "text-amber-600 dark:text-amber-400";
  if (score > 20) return "text-blue-600 dark:text-blue-400";
  return "text-emerald-600 dark:text-emerald-400";
}

export function getProgressColor(score: number) {
  if (score > 80) return "bg-red-500";
  if (score > 60) return "bg-orange-500";
  if (score > 40) return "bg-amber-500";
  if (score > 20) return "bg-blue-500";
  return "bg-emerald-500";
}

const OUTLETS_LIST = [
  { id: "OUT-042", name: "Lucknow Flagship (OUT-042)" },
  { id: "OUT-089", name: "Noida Sector 18 (OUT-089)" },
  { id: "OUT-114", name: "Bengaluru Koramangala (OUT-114)" },
  { id: "OUT-019", name: "Delhi CP Inner (OUT-019)" },
];

export default function RiskPage() {
  const { user } = useAuth();
  const isFranchise = user?.role === "FRANCHISE";
  const defaultOutlet = user?.assignedOutletId || "OUT-042";

  const [selectedOutlet, setSelectedOutlet] = useState<string>(defaultOutlet);
  const [assessment, setAssessment] = useState<RiskAssessmentResult | null>(null);
  const [networkAssessments, setNetworkAssessments] = useState<RiskAssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRiskData = async (targetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/risk/${targetId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load risk assessment.");
      }
      setAssessment(data);

      // If enterprise role, also load network assessments
      if (!isFranchise) {
        const netRes = await fetch("/api/risk", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const netData = await netRes.json();
        if (netRes.ok && netData.assessments) {
          setNetworkAssessments(netData.assessments);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load risk intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData(selectedOutlet);
  }, [selectedOutlet]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/risk/recalculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ outletId: selectedOutlet }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to recalculate risk.");
      }
      setAssessment(data.assessment);
      fetchRiskData(selectedOutlet);
    } catch (err: any) {
      alert(err.message || "Failed to recalculate.");
    } finally {
      setRecalculating(false);
    }
  };

  if (loading && !assessment) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="text-sm">Evaluating multi-factor deterministic risk parameters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B] block mb-1">
            0–100 Deterministic Calculation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-slate-100">
            Explainable <span className="italic text-amber-400">Risk Intelligence Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mathematically transparent multi-factor risk scoring with deterministic weighting and explanatory synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isFranchise && (
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
            >
              {OUTLETS_LIST.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          )}

          <Button
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer text-xs shadow-sm h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}`} />
            <span>Recalculate Score</span>
          </Button>
        </div>
      </div>

      {/* Deterministic Mathematical Formula Banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/60 dark:bg-indigo-950/30 p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 text-sm">
            <Scale className="h-4 w-4 text-indigo-600" />
            <span>Deterministic Scoring Algorithm (Zero LLM Numerical Hallucination)</span>
          </span>
          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
            Normalized Range: 0–100
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
          Score = (Factor 1 [Sales] × 30%) + (Factor 2 [Compliance] × 20%) + (Factor 3 [Complaints] × 20%) + (Factor 4 [Evidence] × 15%) + (Factor 5 [Operations] × 10%) + (Factor 6 [Inventory] × 5%)
        </p>
      </div>

      {/* Main Scorecard and Primary Factors Display */}
      {assessment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Risk Gauge Card */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Composite Deterministic Risk
              </span>
              <div className="flex items-center justify-between pt-1">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {assessment.outletId}
                </CardTitle>
                {getRiskLevelBadge(assessment.level)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className={`text-6xl font-black font-mono tracking-tight ${getScoreColor(assessment.score)}`}>
                  {assessment.score}
                </span>
                <span className="text-2xl font-bold text-slate-400">/100</span>
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Risk Tier: {assessment.level}
                </span>
              </div>

              {/* Range Legend */}
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between font-semibold text-slate-500">
                  <span>0–20 Low</span>
                  <span>21–40 Moderate</span>
                  <span>41–60 Elevated</span>
                  <span>61–80 High</span>
                  <span>81–100 Critical</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="w-[20%] bg-emerald-500" title="Low (0-20)" />
                  <div className="w-[20%] bg-blue-500" title="Moderate (21-40)" />
                  <div className="w-[20%] bg-amber-500" title="Elevated (41-60)" />
                  <div className="w-[20%] bg-orange-500" title="High (61-80)" />
                  <div className="w-[20%] bg-red-500" title="Critical (81-100)" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Assessment ID: {assessment.assessmentId}</span>
                <span>{assessment.assessedAt}</span>
              </div>
            </CardContent>
          </Card>

          {/* Explainable AI Narrative Card: "Why this outlet received its score" */}
          <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Explainability Synthesis: Why {assessment.outletId} Received {assessment.score}/100</span>
                </CardTitle>
                <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[10px]">
                  Gemini Narrative Synthesis
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Objective natural-language breakdown based on the deterministic mathematical calculation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Natural Language Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                {assessment.explanation}
              </div>

              {/* Primary Contributing Factors List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider block">
                  Contributing Factors:
                </span>
                <ul className="space-y-1.5">
                  {assessment.contributingFactors.map((factor, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800"
                    >
                      <div className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <span className="font-medium text-xs">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 6 Deterministic Contributing Factor Breakdown Cards */}
      {assessment && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Deterministic Weighted Component Matrix (Weights Sum = 100%)
            </h3>
            <span className="text-xs text-slate-400">All factors normalized to 0–100 scale</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(assessment.factors).map(([key, f]) => (
              <Card key={key} className="border-slate-200 dark:border-slate-800 shadow-2xs">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Weight: {Math.round(f.weight * 100)}%
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      +{f.weightedScore} pts
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {f.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                      {f.rawScore}
                      <span className="text-xs font-normal text-slate-400">/100</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Contributes {f.weightedScore} to final score
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${f.rawScore}%` }}
                      className={`h-full rounded-full ${getProgressColor(f.rawScore)}`}
                    />
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pt-1">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Network Risk Comparison Table (Multi-Outlet Scenarios) */}
      {!isFranchise && networkAssessments.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Network Outlet Deterministic Risk Benchmark ({networkAssessments.length} Outlets)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Calculated Across Multi-Table PostgreSQL Realities
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">Outlet ID</th>
                  <th className="py-3 px-3.5 font-semibold">Risk Score</th>
                  <th className="py-3 px-3.5 font-semibold">Risk Level</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Sales (30%)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Compliance (20%)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Complaints (20%)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Evidence (15%)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Operations (10%)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Inventory (5%)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {networkAssessments.map((item) => (
                  <tr key={item.outletId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {item.outletId}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`font-mono font-extrabold text-sm ${getScoreColor(item.score)}`}>
                        {item.score}/100
                      </span>
                    </td>
                    <td className="py-3 px-3.5">{getRiskLevelBadge(item.level)}</td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      {item.factors.salesAnomalies.rawScore}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      {item.factors.compliance.rawScore}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      {item.factors.complaints.rawScore}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      {item.factors.evidence.rawScore}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      {item.factors.operational.rawScore}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      {item.factors.inventory.rawScore}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOutlet(item.outletId)}
                        className="h-7 text-[11px] cursor-pointer"
                      >
                        Inspect Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
