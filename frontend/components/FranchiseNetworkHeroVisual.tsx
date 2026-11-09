import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Store,
  Building2,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Eye,
  Camera,
} from "lucide-react";

export interface NetworkOutletNode {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  model: "FOCO" | "COCO";
  complianceScore: number;
  riskScore: number;
  status: "Healthy" | "Warning" | "Critical";
  monthlyRevenue: string;
  variance: string;
  cctvActive: boolean;
  x: number; // percentage in SVG (0 - 100)
  y: number; // percentage in SVG (0 - 100)
}

// 10 Genuine Franchise Outlets mapped across a balanced 2D radial constellation
const NETWORK_OUTLETS: NetworkOutletNode[] = [
  {
    id: "out-042",
    code: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    state: "Uttar Pradesh",
    model: "FOCO",
    complianceScore: 94,
    riskScore: 14,
    status: "Healthy",
    monthlyRevenue: "₹54.0L",
    variance: "+0.4%",
    cctvActive: true,
    x: 22,
    y: 20,
  },
  {
    id: "out-019",
    code: "OUT-019",
    name: "Connaught Place Inner",
    city: "Delhi",
    state: "Delhi NCR",
    model: "COCO",
    complianceScore: 91,
    riskScore: 18,
    status: "Healthy",
    monthlyRevenue: "₹92.0L",
    variance: "+0.2%",
    cctvActive: true,
    x: 50,
    y: 12,
  },
  {
    id: "out-142",
    code: "OUT-142",
    name: "Cyber Hub Galleria",
    city: "Gurgaon",
    state: "Haryana",
    model: "COCO",
    complianceScore: 92,
    riskScore: 12,
    status: "Healthy",
    monthlyRevenue: "₹74.0L",
    variance: "+0.1%",
    cctvActive: true,
    x: 78,
    y: 18,
  },
  {
    id: "out-089",
    code: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    state: "Uttar Pradesh",
    model: "COCO",
    complianceScore: 88,
    riskScore: 26,
    status: "Healthy",
    monthlyRevenue: "₹61.0L",
    variance: "-0.3%",
    cctvActive: true,
    x: 88,
    y: 42,
  },
  {
    id: "out-128",
    code: "OUT-128",
    name: "Bandra West Linking Rd",
    city: "Mumbai",
    state: "Maharashtra",
    model: "FOCO",
    complianceScore: 86,
    riskScore: 24,
    status: "Healthy",
    monthlyRevenue: "₹68.0L",
    variance: "+0.5%",
    cctvActive: true,
    x: 82,
    y: 72,
  },
  {
    id: "out-114",
    code: "OUT-114",
    name: "Koramangala 5th Block",
    city: "Bengaluru",
    state: "Karnataka",
    model: "FOCO",
    complianceScore: 83,
    riskScore: 47,
    status: "Warning",
    monthlyRevenue: "₹81.0L",
    variance: "-1.8%",
    cctvActive: true,
    x: 54,
    y: 86,
  },
  {
    id: "out-055",
    code: "OUT-055",
    name: "FC Road Corner",
    city: "Pune",
    state: "Maharashtra",
    model: "COCO",
    complianceScore: 89,
    riskScore: 22,
    status: "Healthy",
    monthlyRevenue: "₹48.0L",
    variance: "+0.3%",
    cctvActive: true,
    x: 24,
    y: 80,
  },
  {
    id: "out-073",
    code: "OUT-073",
    name: "MI Road Heritage",
    city: "Jaipur",
    state: "Rajasthan",
    model: "FOCO",
    complianceScore: 82,
    riskScore: 36,
    status: "Warning",
    monthlyRevenue: "₹42.0L",
    variance: "-1.1%",
    cctvActive: true,
    x: 12,
    y: 54,
  },
  {
    id: "out-061",
    code: "OUT-061",
    name: "Civil Lines Cantt",
    city: "Kanpur",
    state: "Uttar Pradesh",
    model: "FOCO",
    complianceScore: 78,
    riskScore: 42,
    status: "Warning",
    monthlyRevenue: "₹39.0L",
    variance: "-2.4%",
    cctvActive: true,
    x: 35,
    y: 36,
  },
  {
    id: "out-097",
    code: "OUT-097",
    name: "Assi Ghat Promenade",
    city: "Varanasi",
    state: "Uttar Pradesh",
    model: "COCO",
    complianceScore: 74,
    riskScore: 58,
    status: "Critical",
    monthlyRevenue: "₹34.0L",
    variance: "-3.9%",
    cctvActive: true,
    x: 68,
    y: 62,
  },
];

export function FranchiseNetworkHeroVisual() {
  const [selectedOutlet, setSelectedOutlet] = useState<NetworkOutletNode>(NETWORK_OUTLETS[0]);
  const [hoveredOutlet, setHoveredOutlet] = useState<NetworkOutletNode | null>(null);
  const [pulseTick, setPulseTick] = useState(0);

  // HQ Central coordinates (Percentage in SVG viewbox)
  const hqX = 50;
  const hqY = 48;

  // Animation cycle for data packets traveling across network lines
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 100);
    }, 45);
    return () => clearInterval(timer);
  }, []);

  const activeOutlet = hoveredOutlet || selectedOutlet;

  // Status color mapping for nodes
  const getStatusColor = (status: NetworkOutletNode["status"]) => {
    switch (status) {
      case "Healthy":
        return {
          fill: "#13845B",
          stroke: "#72D6A0",
          glow: "rgba(114, 214, 160, 0.4)",
          badgeBg: "bg-emerald-950/60",
          badgeBorder: "border-emerald-500/40",
          badgeText: "text-[#72D6A0]",
        };
      case "Warning":
        return {
          fill: "#D97706",
          stroke: "#FBBF24",
          glow: "rgba(251, 191, 36, 0.4)",
          badgeBg: "bg-amber-950/60",
          badgeBorder: "border-amber-500/40",
          badgeText: "text-amber-300",
        };
      case "Critical":
        return {
          fill: "#DC2626",
          stroke: "#F87171",
          glow: "rgba(248, 113, 113, 0.4)",
          badgeBg: "bg-rose-950/60",
          badgeBorder: "border-rose-500/40",
          badgeText: "text-rose-300",
        };
    }
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#031D15] border border-[#0D4E39] shadow-[0_25px_60px_rgba(3,29,21,0.6)] overflow-hidden p-4 sm:p-6 text-white select-none">
      {/* Background Radial Light & Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_48%,rgba(19,132,91,0.35)_0%,rgba(3,29,21,0.85)_70%)]"
        aria-hidden="true"
      />

      {/* Top Command Center Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#0D4E39]/80">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#72D6A0] shadow-[0_0_10px_#72D6A0]" />
          <span className="text-xs font-semibold tracking-wide text-[#F6F1E7]">
            Franchise Intelligence Command Center
          </span>
          <span className="text-white/40 hidden sm:inline">/</span>
          <span className="text-[11px] font-mono text-[#72D6A0] hidden sm:inline">
            10 Active Nodes Synced
          </span>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1.5 text-[#CAD5C9]">
            <span className="h-2 w-2 rounded-full bg-[#72D6A0]" />
            <span>Healthy (6)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#CAD5C9]">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Warning (3)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#CAD5C9]">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span>Critical (1)</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Visual Area */}
      <div className="relative z-10 w-full aspect-[4/3] sm:aspect-[16/11] mt-2 flex items-center justify-center">
        {/* SVG Network Layer */}
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Glow Filter for Emerald Lines & Headquarters */}
            <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Subtle Gradient for Connection Beams */}
            <radialGradient id="hq-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#72D6A0" />
              <stop offset="50%" stopColor="#13845B" />
              <stop offset="100%" stopColor="#073B2A" />
            </radialGradient>
          </defs>

          {/* Radar Echo Rings radiating from Central Headquarters */}
          <circle
            cx={hqX}
            cy={hqY}
            r="16"
            fill="none"
            stroke="#13845B"
            strokeWidth="0.4"
            opacity="0.3"
            strokeDasharray="1 2"
          />
          <circle
            cx={hqX}
            cy={hqY}
            r="30"
            fill="none"
            stroke="#13845B"
            strokeWidth="0.3"
            opacity="0.25"
          />
          <circle
            cx={hqX}
            cy={hqY}
            r="44"
            fill="none"
            stroke="#13845B"
            strokeWidth="0.2"
            opacity="0.18"
            strokeDasharray="2 3"
          />

          {/* Connection Lines from HQ to all 10 Outlet Nodes */}
          {NETWORK_OUTLETS.map((outlet, index) => {
            const isSelected = activeOutlet.id === outlet.id;
            const statusConfig = getStatusColor(outlet.status);

            // Compute curved control point for subtle organic arc
            const midX = (hqX + outlet.x) / 2 + (index % 2 === 0 ? 3 : -3);
            const midY = (hqY + outlet.y) / 2 + (index % 3 === 0 ? -3 : 2);
            const pathData = `M ${hqX} ${hqY} Q ${midX} ${midY} ${outlet.x} ${outlet.y}`;

            // Compute animated particle position along the line
            // Stagger particles by index so they flow organically
            const t = ((pulseTick + index * 10) % 100) / 100;
            // Quadratic Bezier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
            const particleX = (1 - t) * (1 - t) * hqX + 2 * (1 - t) * t * midX + t * t * outlet.x;
            const particleY = (1 - t) * (1 - t) * hqY + 2 * (1 - t) * t * midY + t * t * outlet.y;

            return (
              <g key={`connection-${outlet.id}`}>
                {/* Background Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? statusConfig.stroke : "#0D4E39"}
                  strokeWidth={isSelected ? "0.9" : "0.4"}
                  strokeOpacity={isSelected ? "0.9" : "0.5"}
                />

                {/* Animated Data Particle traveling between HQ and Outlet */}
                <circle
                  cx={particleX}
                  cy={particleY}
                  r={isSelected ? "1.1" : "0.7"}
                  fill={isSelected ? "#72D6A0" : statusConfig.stroke}
                  opacity={0.85}
                  filter="url(#emerald-glow)"
                />
              </g>
            );
          })}

          {/* Central Headquarters Node */}
          <g>
            {/* Outer Pulsing Halo */}
            <circle
              cx={hqX}
              cy={hqY}
              r="6.5"
              fill="#13845B"
              fillOpacity="0.25"
            />
            {/* Mid Ring */}
            <circle
              cx={hqX}
              cy={hqY}
              r="4.2"
              fill="#073B2A"
              stroke="#72D6A0"
              strokeWidth="0.8"
            />
            {/* Core Center Dot */}
            <circle cx={hqX} cy={hqY} r="2.2" fill="#72D6A0" />
          </g>

          {/* Franchise Outlet Nodes */}
          {NETWORK_OUTLETS.map((outlet) => {
            const isSelected = activeOutlet.id === outlet.id;
            const statusConfig = getStatusColor(outlet.status);

            return (
              <g
                key={`node-${outlet.id}`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedOutlet(outlet)}
                onMouseEnter={() => setHoveredOutlet(outlet)}
                onMouseLeave={() => setHoveredOutlet(null)}
              >
                {/* Hover / Selection Glow Disc */}
                {isSelected && (
                  <circle
                    cx={outlet.x}
                    cy={outlet.y}
                    r="4.5"
                    fill={statusConfig.fill}
                    fillOpacity="0.3"
                    stroke={statusConfig.stroke}
                    strokeWidth="0.4"
                  />
                )}

                {/* Outer Node Ring */}
                <circle
                  cx={outlet.x}
                  cy={outlet.y}
                  r={isSelected ? "2.8" : "2.0"}
                  fill="#031D15"
                  stroke={statusConfig.stroke}
                  strokeWidth={isSelected ? "0.9" : "0.6"}
                />

                {/* Inner Core Dot */}
                <circle
                  cx={outlet.x}
                  cy={outlet.y}
                  r={isSelected ? "1.4" : "0.9"}
                  fill={statusConfig.stroke}
                />
              </g>
            );
          })}
        </svg>

        {/* Central HQ Label Anchor */}
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 translate-y-5 flex flex-col items-center"
          style={{ left: `${hqX}%`, top: `${hqY}%` }}
        >
          <span className="px-2 py-0.5 rounded-md bg-[#073B2A]/90 border border-[#72D6A0]/40 text-[9px] font-mono font-bold tracking-wider text-[#72D6A0] whitespace-nowrap shadow-md">
            AuraFoods HQ Command
          </span>
        </div>

        {/* Floating Node Labels (Clean, subtle unboxed markers on the canvas) */}
        {NETWORK_OUTLETS.map((outlet) => {
          const isSelected = activeOutlet.id === outlet.id;
          const statusConfig = getStatusColor(outlet.status);

          return (
            <button
              key={`label-${outlet.id}`}
              onClick={() => setSelectedOutlet(outlet)}
              onMouseEnter={() => setHoveredOutlet(outlet)}
              onMouseLeave={() => setHoveredOutlet(null)}
              className={`absolute transform -translate-x-1/2 -translate-y-6 px-1.5 py-0.5 rounded text-[9px] font-mono tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-[#073B2A] text-white border border-[#72D6A0] shadow-md z-30 scale-105"
                  : "bg-[#031D15]/80 text-[#CAD5C9] border border-[#0D4E39]/70 hover:border-[#72D6A0]/50 z-20"
              }`}
              style={{ left: `${outlet.x}%`, top: `${outlet.y}%` }}
            >
              <span>{outlet.code}</span>
              <span className="hidden sm:inline text-white/50"> · </span>
              <span className="hidden sm:inline">{outlet.city}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Active Outlet Dossier Card (Requirement 1: Detailed metrics on click/hover) */}
      <div className="relative z-20 mt-3 rounded-2xl bg-[#05291F] border border-[#0D4E39] p-4 shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Outlet Identity */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#073B2A] border border-[#13845B] flex items-center justify-center text-[#72D6A0] shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-white">
                  {activeOutlet.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#073B2A] text-[#72D6A0] border border-[#0D4E39]">
                  {activeOutlet.code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getStatusColor(activeOutlet.status).badgeBg} ${getStatusColor(activeOutlet.status).badgeBorder} ${getStatusColor(activeOutlet.status).badgeText}`}>
                  {activeOutlet.status}
                </span>
              </div>
              <p className="text-xs text-[#CAD5C9] mt-0.5">
                {activeOutlet.city}, {activeOutlet.state} · Model: {activeOutlet.model}
              </p>
            </div>
          </div>

          {/* 4 Quantitative Live Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto text-xs">
            {/* Compliance */}
            <div className="p-2.5 rounded-xl bg-[#031D15] border border-[#0D4E39] min-w-[100px]">
              <span className="text-[10px] font-mono text-[#CAD5C9] block">Compliance</span>
              <span className="text-base font-bold font-mono text-[#72D6A0]">
                {activeOutlet.complianceScore}%
              </span>
            </div>

            {/* Risk Index */}
            <div className="p-2.5 rounded-xl bg-[#031D15] border border-[#0D4E39] min-w-[100px]">
              <span className="text-[10px] font-mono text-[#CAD5C9] block">Risk Index</span>
              <span
                className={`text-base font-bold font-mono ${
                  activeOutlet.riskScore > 50
                    ? "text-rose-400"
                    : activeOutlet.riskScore > 30
                    ? "text-amber-400"
                    : "text-[#72D6A0]"
                }`}
              >
                {activeOutlet.riskScore}/100
              </span>
            </div>

            {/* Monthly Volume */}
            <div className="p-2.5 rounded-xl bg-[#031D15] border border-[#0D4E39] min-w-[100px]">
              <span className="text-[10px] font-mono text-[#CAD5C9] block">Monthly GMV</span>
              <span className="text-base font-bold font-mono text-white">
                {activeOutlet.monthlyRevenue}
              </span>
            </div>

            {/* CCTV / POS Variance */}
            <div className="p-2.5 rounded-xl bg-[#031D15] border border-[#0D4E39] min-w-[100px]">
              <span className="text-[10px] font-mono text-[#CAD5C9] block">POS Variance</span>
              <span className="text-base font-bold font-mono text-white">
                {activeOutlet.variance}
              </span>
            </div>
          </div>

          {/* Direct Navigation Button */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Link
              to={`/outlets/${activeOutlet.code}`}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#13845B] hover:bg-[#0E6847] text-white flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
            >
              <span>Inspect Outlet Dossier</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
