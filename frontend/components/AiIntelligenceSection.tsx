import React, { useState } from "react";
import {
  Flame,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Receipt,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Sparkles,
} from "lucide-react";

interface AiCapability {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const AI_CAPABILITIES: AiCapability[] = [
  {
    id: "risk",
    title: "1. Multivariate Risk Detection",
    shortDesc: "Calculates a composite 0-100 risk score per outlet using 5 operational signals.",
    icon: Flame,
    tag: "Predictive Risk Model",
  },
  {
    id: "compliance",
    title: "2. Compliance Scoring",
    shortDesc: "Continuous 100-point benchmark evaluating kitchen prep, cold chain, and hygiene SOPs.",
    icon: ShieldCheck,
    tag: "Standard Audit Rubric",
  },
  {
    id: "performance",
    title: "3. Outlet Performance Analysis",
    shortDesc: "Benchmark real monthly GMV, EBITDA margins, and store operational rankings.",
    icon: TrendingUp,
    tag: "Financial Intelligence",
  },
  {
    id: "inventory",
    title: "4. Inventory & Commissary Monitoring",
    shortDesc: "Reconciles commissary shipments against POS recipe consumption to catch slippage.",
    icon: Boxes,
    tag: "Shrinkage Detection",
  },
  {
    id: "sales",
    title: "5. Sales & Cash Leakage Analysis",
    shortDesc: "Detects unrecorded transactions, cash slip mismatches, and void patterns.",
    icon: Receipt,
    tag: "Revenue Assurance",
  },
  {
    id: "alerts",
    title: "6. Automated Priority Alerts",
    shortDesc: "Real-time severity escalation notifying regional officers and franchise partners.",
    icon: BellRing,
    tag: "Action Triggers",
  },
];

// Actual 10 Outlets performance data from database
const OUTLET_PERFORMANCE_METRICS = [
  { code: "OUT-019", name: "Connaught Place", city: "Delhi", gmv: 92.0, compliance: 91, risk: 18, margin: "21.4%" },
  { code: "OUT-114", name: "Koramangala 5th", city: "Bengaluru", gmv: 81.0, compliance: 83, risk: 47, margin: "17.1%" },
  { code: "OUT-142", name: "Cyber Hub", city: "Gurgaon", gmv: 74.0, compliance: 92, risk: 12, margin: "19.0%" },
  { code: "OUT-128", name: "Bandra West", city: "Mumbai", gmv: 68.0, compliance: 86, risk: 24, margin: "16.2%" },
  { code: "OUT-089", name: "Sector 18", city: "Noida", gmv: 61.0, compliance: 88, risk: 26, margin: "19.5%" },
  { code: "OUT-042", name: "Hazratganj Flagship", city: "Lucknow", gmv: 54.0, compliance: 94, risk: 14, margin: "18.2%" },
  { code: "OUT-055", name: "FC Road Corner", city: "Pune", gmv: 48.0, compliance: 89, risk: 22, margin: "15.5%" },
  { code: "OUT-073", name: "MI Road Heritage", city: "Jaipur", gmv: 42.0, compliance: 82, risk: 36, margin: "16.0%" },
  { code: "OUT-061", name: "Civil Lines Cantt", city: "Kanpur", gmv: 39.0, compliance: 78, risk: 42, margin: "14.1%" },
  { code: "OUT-097", name: "Assi Ghat", city: "Varanasi", gmv: 34.0, compliance: 74, risk: 58, margin: "11.8%" },
];

export function AiIntelligenceSection() {
  const [activeTab, setActiveTab] = useState<string>("risk");

  return (
    <section className="py-20 md:py-28 bg-[#FFFDF8] border-t border-[#DDE5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#13845B] block">
            AI-POWERED AUDIT ENGINES
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#073B2A]">
            Comprehensive Franchise Intelligence
          </h2>
          <p className="text-sm sm:text-base text-[#738078]">
            Six integrated AI engines replacing subjective manual audits with objective, continuous quantitative monitoring across sales, stock, hygiene, and revenue.
          </p>
        </div>

        {/* 6 Capabilities Selector Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
          {AI_CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            const isSelected = activeTab === cap.id;
            return (
              <button
                key={cap.id}
                onClick={() => setActiveTab(cap.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#073B2A] text-white border-[#073B2A] shadow-md"
                    : "bg-[#FAF7F0] text-[#18251F] border-[#DDE5DC] hover:border-[#13845B]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon
                    className={`h-4 w-4 ${
                      isSelected ? "text-[#72D6A0]" : "text-[#13845B]"
                    }`}
                  />
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#72D6A0]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-snug truncate">
                    {cap.title.split(". ")[1]}
                  </h4>
                  <span
                    className={`text-[9px] font-mono mt-0.5 block truncate ${
                      isSelected ? "text-[#CAD5C9]" : "text-[#738078]"
                    }`}
                  >
                    {cap.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card Based on Active Tab */}
        <div className="rounded-3xl bg-[#FAF7F0] border border-[#DDE5DC] p-6 sm:p-8 shadow-sm">
          {/* TAB 1: Multivariate Risk Detection */}
          {activeTab === "risk" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E6F8EF] border border-[#C7F1DC] text-xs font-mono font-bold text-[#073B2A]">
                  <Flame className="h-3.5 w-3.5 text-[#13845B]" />
                  <span>DETERMINISTIC 5-SIGNAL RISK EQUATION</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#073B2A]">
                  Multivariate Risk Score (0-100)
                </h3>
                <p className="text-sm text-[#738078] leading-relaxed">
                  Instead of relying on arbitrary subjective scores, the Sentinel engine calculates an audit risk index by mathematically combining 5 operational datasets every 24 hours.
                </p>

                {/* 5 Risk Weights Breakdown */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#18251F]">CCTV Visual Cleanliness & Hygiene</span>
                    <span className="font-mono font-bold text-[#073B2A]">25% Weight</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#13845B] h-full w-[25%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#18251F]">POS End-of-Day Billing Variance</span>
                    <span className="font-mono font-bold text-[#073B2A]">25% Weight</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#073B2A] h-full w-[25%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#18251F]">Raw Material Inventory Shrinkage</span>
                    <span className="font-mono font-bold text-[#073B2A]">20% Weight</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#13845B] h-full w-[20%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#18251F]">Customer Complaints & Food Quality Sentiment</span>
                    <span className="font-mono font-bold text-[#073B2A]">15% Weight</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full w-[15%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#18251F]">Unresolved CAPA Ticket Aging (&gt;14 days)</span>
                    <span className="font-mono font-bold text-[#073B2A]">15% Weight</span>
                  </div>
                  <div className="w-full bg-[#DDE5DC] h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full w-[15%]" />
                  </div>
                </div>
              </div>

              {/* Right Side: Risk Distribution Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-3">
                    <span className="font-serif font-bold text-base text-[#073B2A]">Network Risk Spectrum</span>
                    <span className="text-xs font-mono text-[#738078]">10 Stores Analyzed</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-[#E6F8EF] border border-[#C7F1DC]">
                      <span className="text-[10px] font-mono text-[#073B2A] block font-bold uppercase">Low Risk (0-30)</span>
                      <span className="text-2xl font-bold font-mono text-[#13845B]">6 Stores</span>
                      <span className="text-[10px] text-[#738078] block mt-0.5">Nominal Audit State</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-[10px] font-mono text-amber-800 block font-bold uppercase">Moderate (31-50)</span>
                      <span className="text-2xl font-bold font-mono text-amber-700">3 Stores</span>
                      <span className="text-[10px] text-amber-600 block mt-0.5">Officer Review</span>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-[10px] font-mono text-rose-800 block font-bold uppercase">Critical (51-100)</span>
                      <span className="text-2xl font-bold font-mono text-rose-700">1 Store</span>
                      <span className="text-[10px] text-rose-600 block mt-0.5">Immediate CAPA</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#DDE5DC] text-xs text-[#18251F] space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Highest Risk Outlet:</span>
                      <span className="font-mono text-rose-600">Assi Ghat, Varanasi (OUT-097)</span>
                    </div>
                    <p className="text-[11px] text-[#738078]">
                      Triggered by inventory discrepancy (-3.9%) and 2 overdue CAPA hygiene tickets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Compliance Scoring */}
          {activeTab === "compliance" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E6F8EF] border border-[#C7F1DC] text-xs font-mono font-bold text-[#073B2A]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#13845B]" />
                  <span>CONTINUOUS 100-POINT BENCHMARK</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#073B2A]">
                  Standard Operating Procedures Rubric
                </h3>
                <p className="text-sm text-[#738078] leading-relaxed">
                  Evaluates kitchen hygiene, temperature probes, staff aprons, and packaging seals. Automated AI audits occur every shift, catching deviations before they impact food quality.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-1">
                    <span className="font-semibold text-[#073B2A]">Food Prep Hygiene</span>
                    <p className="text-[11px] text-[#738078]">Apron, hairnet, glove adherence verified via CCTV</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-1">
                    <span className="font-semibold text-[#073B2A]">Cold Chain Safety</span>
                    <p className="text-[11px] text-[#738078]">Walk-in cooler probes maintain +2°C to +4°C</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-1">
                    <span className="font-semibold text-[#073B2A]">Double-Bag Seal</span>
                    <p className="text-[11px] text-[#738078]">Tamper-evident seal inspection before customer handoff</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-1">
                    <span className="font-semibold text-[#073B2A]">Clean Prep Surface</span>
                    <p className="text-[11px] text-[#738078]">Stainless steel counter sanitized every 120 minutes</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Score Card */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] text-center space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#738078]">Network Average Compliance</span>
                  <div className="font-serif text-5xl font-bold text-[#13845B]">87.2%</div>
                  <p className="text-xs text-[#738078]">
                    +3.4% improvement compared to previous 30-day manual audit cycle
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#DDE5DC] text-left text-xs">
                    <div>
                      <span className="text-[#738078] block">Top Performer:</span>
                      <span className="font-bold text-[#073B2A]">Hazratganj Flagship (94%)</span>
                    </div>
                    <div>
                      <span className="text-[#738078] block">Audit Frequency:</span>
                      <span className="font-bold text-[#073B2A]">Continuous 24/7 AI Scans</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Outlet Performance Analysis */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#DDE5DC] pb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#073B2A]">
                    Network Stores Performance Benchmark
                  </h3>
                  <p className="text-xs text-[#738078] mt-0.5">
                    Live operational metrics across all 10 registered franchise outlets.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-[#738078]">Network Monthly GMV:</span>
                  <span className="text-xl font-bold font-mono text-[#073B2A] block">₹59.3M</span>
                </div>
              </div>

              {/* Compact High-Density Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EAE3D2] text-[#073B2A] font-mono text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Store Name</th>
                      <th className="py-2.5 px-3">City</th>
                      <th className="py-2.5 px-3 text-right">Monthly GMV</th>
                      <th className="py-2.5 px-3 text-right">EBITDA Margin</th>
                      <th className="py-2.5 px-3 text-center">Compliance</th>
                      <th className="py-2.5 px-3 text-center rounded-r-lg">Risk Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DDE5DC]">
                    {OUTLET_PERFORMANCE_METRICS.map((outlet) => (
                      <tr key={outlet.code} className="hover:bg-white transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#073B2A]">
                          {outlet.name}{" "}
                          <span className="text-[10px] font-mono text-[#738078] font-normal">
                            ({outlet.code})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#18251F]">{outlet.city}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#18251F]">
                          ₹{outlet.gmv.toFixed(1)}L
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#13845B]">
                          {outlet.margin}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#073B2A]">
                          {outlet.compliance}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              outlet.risk > 50
                                ? "bg-rose-100 text-rose-800"
                                : outlet.risk > 30
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {outlet.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Inventory & Commissary Monitoring */}
          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E6F8EF] border border-[#C7F1DC] text-xs font-mono font-bold text-[#073B2A]">
                  <Boxes className="h-3.5 w-3.5 text-[#13845B]" />
                  <span>COMMISSARY DISCREPANCY RECONCILIATION</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#073B2A]">
                  Deterministic Supply Ledger Verification
                </h3>
                <p className="text-sm text-[#738078] leading-relaxed">
                  Compares received raw material batches against POS item recipes. Surfaces unrecorded cash sales, ingredient theft, and excessive wastage with zero guesswork.
                </p>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#073B2A] block">Received Company Supply</span>
                      <span className="text-[11px] text-[#738078]">Invoiced bulk ingredients from AuraFoods commissary</span>
                    </div>
                    <span className="font-mono font-bold text-[#073B2A]">₹18.4M</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#073B2A] block">Expected Theoretical Consumption</span>
                      <span className="text-[11px] text-[#738078]">Derived by multiplying billed POS items by recipe grams</span>
                    </div>
                    <span className="font-mono font-bold text-[#073B2A]">₹18.2M</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#E6F8EF] border border-[#C7F1DC] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#13845B] block">Network Net Variance</span>
                      <span className="text-[11px] text-[#738078]">Within acceptable industry shrinkage allowance (&lt;1.5%)</span>
                    </div>
                    <span className="font-mono font-bold text-[#13845B]">0.4% (Nominal)</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Key Benefits */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-4 shadow-xs">
                  <h4 className="font-serif font-bold text-base text-[#073B2A]">
                    Automated Discrepancy Matrix
                  </h4>
                  <p className="text-xs text-[#738078]">
                    When stock variance exceeds 2.5%, the system automatically flags an inventory audit and prompts the franchise operator to upload physical count evidence.
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#DDE5DC] text-xs space-y-2">
                    <div className="flex items-center gap-2 text-[#073B2A] font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-[#13845B]" />
                      <span>Zero manual spreadsheet entry</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#073B2A] font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-[#13845B]" />
                      <span>Direct invoice upload (PDF, JPG, Excel)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#073B2A] font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-[#13845B]" />
                      <span>Automatic vendor ledger reconciliation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Sales & Cash Leakage Analysis */}
          {activeTab === "sales" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E6F8EF] border border-[#C7F1DC] text-xs font-mono font-bold text-[#073B2A]">
                  <Receipt className="h-3.5 w-3.5 text-[#13845B]" />
                  <span>REVENUE INTEGRITY MONITOR</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#073B2A]">
                  Cash Slip & Unrecorded Order Detection
                </h3>
                <p className="text-sm text-[#738078] leading-relaxed">
                  Correlates customer footfall density observed via dining room CCTV with POS transaction timestamps. Identifies unbilled table turnovers and off-book sales.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                    <span className="text-[10px] font-mono text-[#738078] block">Audited Transactions</span>
                    <span className="text-xl font-bold font-mono text-[#073B2A]">142,800+</span>
                    <span className="text-[10px] text-[#738078] block mt-0.5">Last 30 Days</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFFDF8] border border-[#DDE5DC]">
                    <span className="text-[10px] font-mono text-[#738078] block">Revenue Match Rate</span>
                    <span className="text-xl font-bold font-mono text-[#13845B]">99.4%</span>
                    <span className="text-[10px] text-[#738078] block mt-0.5">Audited Integrity</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Sales Features */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-3">
                  <h4 className="font-serif font-bold text-base text-[#073B2A]">
                    Automated Revenue Safeguards
                  </h4>
                  <ul className="text-xs text-[#738078] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#13845B] font-bold">·</span>
                      <span>POS void and cancellation pattern detection to prevent counter fraud.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#13845B] font-bold">·</span>
                      <span>Delivery aggregator split (Swiggy / Zomato vs in-store counter).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#13845B] font-bold">·</span>
                      <span>Direct export of royalty calculations for franchise investor transparency.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Automated Priority Alerts */}
          {activeTab === "alerts" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#E6F8EF] border border-[#C7F1DC] text-xs font-mono font-bold text-[#073B2A]">
                  <BellRing className="h-3.5 w-3.5 text-[#13845B]" />
                  <span>MULTI-TIER ESCALATION ENGINE</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#073B2A]">
                  Intelligent Automated Notifications
                </h3>
                <p className="text-sm text-[#738078] leading-relaxed">
                  Prioritizes critical incidents so leadership isn't overwhelmed with noise. Dispatches notifications directly to assigned store managers and regional compliance officers.
                </p>

                <div className="space-y-2.5 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-800 block">Critical: Chiller Temp Exceeded +5°C</span>
                      <span className="text-[11px] text-rose-600">Assi Ghat, Varanasi · Immediate SMS + WhatsApp Alert</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-900">
                      SEV-1
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-800 block">Warning: POS End-of-Day Slip Delay</span>
                      <span className="text-[11px] text-amber-600">Civil Lines, Kanpur · Automated reminder dispatched</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-200 text-amber-900">
                      SEV-2
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#E6F8EF] border border-[#C7F1DC] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#073B2A] block">Info: Monthly Audit Certification Complete</span>
                      <span className="text-[11px] text-[#738078]">Hazratganj Flagship, Lucknow · Score: 94%</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C7F1DC] text-[#073B2A]">
                      INFO
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Alert Protocol */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-3">
                  <h4 className="font-serif font-bold text-base text-[#073B2A]">
                    Automated CAPA Trigger
                  </h4>
                  <p className="text-xs text-[#738078] leading-relaxed">
                    Whenever an alert reaches Critical status, the Sentinel platform generates a Corrective and Preventive Action (CAPA) ticket with a 48-hour resolution clock, requiring re-inspection before case closure.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
