import React from "react";
import {
  TrendingUp,
  Store,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  FileCheck2,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

// Demo trend data
const revenueTrend = [
  { month: "Jan", revenue: 6.2, compliance: 84 },
  { month: "Feb", revenue: 6.8, compliance: 86 },
  { month: "Mar", revenue: 7.1, compliance: 85 },
  { month: "Apr", revenue: 7.4, compliance: 89 },
  { month: "May", revenue: 7.0, compliance: 88 },
  { month: "Jun", revenue: 7.5, compliance: 87 },
  { month: "Jul", revenue: 7.8, compliance: 86 },
  { month: "Aug", revenue: 8.2, compliance: 88 },
  { month: "Sep", revenue: 8.0, compliance: 87 },
  { month: "Oct", revenue: 8.6, compliance: 87 },
];

const cityDistribution = [
  { city: "Delhi NCR", outlets: 42, avgRisk: 22 },
  { city: "Mumbai", outlets: 28, avgRisk: 19 },
  { city: "Bengaluru", outlets: 24, avgRisk: 25 },
  { city: "Lucknow", outlets: 18, avgRisk: 31 },
  { city: "Hyderabad", outlets: 16, avgRisk: 20 },
  { city: "Pune", outlets: 12, avgRisk: 24 },
  { city: "Jaipur", outlets: 8, avgRisk: 28 },
];

const priorityOutlets = [
  {
    code: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    model: "FOCO",
    riskScore: 68,
    riskLevel: "High",
    compliance: "74%",
    issue: "Inventory discrepancy (58 units) · Repeated hygiene note",
    status: "Review Required",
  },
  {
    code: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    model: "COCO",
    riskScore: 54,
    riskLevel: "Elevated",
    compliance: "81%",
    issue: "WoW sales drop -28% · Peer baseline normal",
    status: "Under Review",
  },
  {
    code: "OUT-114",
    name: "Koramangala 5th Block",
    city: "Bengaluru",
    model: "FOCO",
    riskScore: 47,
    riskLevel: "Elevated",
    compliance: "83%",
    issue: "CCTV frame check unverified · 3 unresolved complaints",
    status: "Verification Pending",
  },
  {
    code: "OUT-019",
    name: "Connaught Place Inner",
    city: "Delhi",
    model: "COCO",
    riskScore: 16,
    riskLevel: "Low",
    compliance: "96%",
    issue: "Nominal operations · Zero stock variance",
    status: "Optimal",
  },
];

export function DashboardPlaceholder() {
  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Executive Performance & Compliance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            Phase 1 Environment Setup · Consolidated multi-unit telemetry across 148 franchise outlets (Sample Data)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>FY 2026-Q3</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Snapshot</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Outlets */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Outlets</span>
              <Store className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                148
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                +4 this month
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              92 FOCO · 56 COCO models
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Gross Revenue</span>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                ₹84.6 Cr
              </span>
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                <ArrowUpRight className="h-3 w-3" /> +12.4%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Annualized run-rate (Sample)
            </p>
          </CardContent>
        </Card>

        {/* EBITDA */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">System EBITDA</span>
              <Boxes className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                ₹12.8 Cr
              </span>
              <span className="flex items-center text-[11px] text-emerald-600 font-medium">
                15.1% margin
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Target baseline: 14.5%
            </p>
          </CardContent>
        </Card>

        {/* Compliance Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Compliance Index</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                87%
              </span>
              <span className="text-[11px] text-slate-500">
                HQ Standard: 85%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              1,240 inspections logged
            </p>
          </CardContent>
        </Card>

        {/* Overall Risk Score */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Overall Risk Score</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
                24/100
              </span>
              <Badge variant="outline" className="text-[10px] font-normal text-emerald-700 bg-emerald-50 border-emerald-200">
                Moderate Risk
              </Badge>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Explainable Risk Engine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Revenue & Compliance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Monthly Network Revenue Trend</CardTitle>
              <CardDescription>Consolidated gross sales volume across all operating units (₹ Crores)</CardDescription>
            </div>
            <span className="text-xs text-slate-500 tabular-nums font-mono">10 Months Track</span>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}Cr`} />
                  <Tooltip
                    formatter={(value: any) => [`₹${value} Cr`, "Gross Revenue"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: City-wise Footprint */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Territory Footprint</CardTitle>
            <CardDescription>Outlet counts & average risk index per metro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityDistribution} layout="vertical" margin={{ top: 0, right: 20, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="city" stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={(value: any, name: any) => [value, name === "outlets" ? "Outlets" : "Avg Risk Score"]}
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "6px", color: "#fff", fontSize: "12px" }}
                  />
                  <Bar dataKey="outlets" fill="#334155" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High-Priority Review Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Priority Outlets & Review Queue</CardTitle>
            <CardDescription>
              Units requiring compliance inspection, inventory reconciliation, or pattern analysis
            </CardDescription>
          </div>
          <span className="text-xs text-slate-500">Human-in-the-Loop Verification</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900">
                <tr>
                  <th className="px-5 py-3">Outlet Code</th>
                  <th className="px-4 py-3">Outlet & City</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3 text-right">Risk Score</th>
                  <th className="px-4 py-3 text-right">Compliance</th>
                  <th className="px-4 py-3">Observation / Indicator</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {priorityOutlets.map((outlet) => (
                  <tr key={outlet.code} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {outlet.code}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{outlet.name}</div>
                      <div className="text-[11px] text-slate-400">{outlet.city}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                      {outlet.model}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums">
                      <span
                        className={`font-semibold font-mono px-2 py-0.5 rounded text-[11px] ${
                          outlet.riskScore >= 60
                            ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                            : outlet.riskScore >= 40
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {outlet.riskScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {outlet.compliance}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {outlet.issue}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                        Audit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
