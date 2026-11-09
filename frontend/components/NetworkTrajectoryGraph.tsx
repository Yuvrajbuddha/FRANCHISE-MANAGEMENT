import React, { useState } from "react";
import { TrendingUp, ShieldCheck, Activity, ArrowUpRight } from "lucide-react";

interface MonthlyData {
  month: string;
  gmv: number; // in ₹ Cr
  settled: number; // in ₹ Cr
  royaltyRate: string;
  status: string;
}

const TRAJECTORY_DATA: MonthlyData[] = [
  { month: "Jan", gmv: 38.2, settled: 36.8, royaltyRate: "14.8%", status: "Settled" },
  { month: "Feb", gmv: 41.5, settled: 39.9, royaltyRate: "14.9%", status: "Settled" },
  { month: "Mar", gmv: 46.0, settled: 44.2, royaltyRate: "15.0%", status: "Settled" },
  { month: "Apr", gmv: 50.4, settled: 48.6, royaltyRate: "15.0%", status: "Settled" },
  { month: "May", gmv: 54.8, settled: 53.0, royaltyRate: "15.1%", status: "Settled" },
  { month: "Jun", gmv: 59.2, settled: 57.1, royaltyRate: "15.1%", status: "Settled" },
  { month: "Jul", gmv: 63.5, settled: 61.5, royaltyRate: "15.1%", status: "Settled" },
  { month: "Aug", gmv: 68.0, settled: 66.1, royaltyRate: "15.1%", status: "Settled" },
  { month: "Sep", gmv: 72.4, settled: 70.8, royaltyRate: "15.2%", status: "Settled" },
  { month: "Oct", gmv: 77.1, settled: 75.4, royaltyRate: "15.2%", status: "Settled" },
  { month: "Nov", gmv: 81.0, settled: 79.5, royaltyRate: "15.1%", status: "Settled" },
  { month: "Dec", gmv: 84.6, settled: 83.2, royaltyRate: "15.1%", status: "Active Q4" },
];

export function NetworkTrajectoryGraph() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const svgWidth = 900;
  const svgHeight = 240;
  const paddingLeft = 70;
  const paddingRight = 45;
  const paddingTop = 32;
  const paddingBottom = 42;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const maxVal = 100; // ₹100 Cr

  const getX = (index: number) => {
    return paddingLeft + (index / (TRAJECTORY_DATA.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxVal) * chartHeight;
  };

  const generateSmoothPath = (getData: (d: MonthlyData) => number) => {
    const points = TRAJECTORY_DATA.map((d, i) => ({ x: getX(i), y: getY(getData(d)) }));
    if (points.length === 0) return "";

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const gmvPath = generateSmoothPath((d) => d.gmv);
  const settledPath = generateSmoothPath((d) => d.settled);
  const gmvAreaPath = `${gmvPath} L ${getX(TRAJECTORY_DATA.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  const activeData = hoveredIndex !== null ? TRAJECTORY_DATA[hoveredIndex] : TRAJECTORY_DATA[TRAJECTORY_DATA.length - 1];

  return (
    <div className="w-full relative mt-10 z-20">
      {/* Corner Reticles */}
      <div className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full border border-[#72D6A0]/80 bg-[#031D15] shadow-[0_0_8px_rgba(114,214,160,0.7)] hidden sm:block pointer-events-none" />
      <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full border border-[#72D6A0]/80 bg-[#031D15] shadow-[0_0_8px_rgba(114,214,160,0.7)] hidden sm:block pointer-events-none" />
      <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border border-[#72D6A0]/80 bg-[#031D15] shadow-[0_0_8px_rgba(114,214,160,0.7)] hidden sm:block pointer-events-none" />
      <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border border-[#72D6A0]/80 bg-[#031D15] shadow-[0_0_8px_rgba(114,214,160,0.7)] hidden sm:block pointer-events-none" />

      {/* Main Glass-morphism Deep Forest Green Container */}
      <div className="rounded-[28px] border border-[#0D4E39] bg-[#031D15]/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_24px_60px_rgba(3,29,21,0.5)] relative overflow-hidden transition-all duration-300 hover:border-[#13845B]/60">
        <div
          className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#13845B]/40 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Top Header & Telemetry Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#0D4E39] pb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#72D6A0] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#72D6A0]" />
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-[#72D6A0]">
                NETWORK TELEMETRY · MULTI-OUTLET REVENUE TRAJECTORY
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              Network Revenue Trajectory vs Statutory Royalty Yield
            </h3>
            <p className="text-xs text-[#CAD5C9] mt-1 max-w-2xl font-sans leading-relaxed">
              Consolidated franchise sales trajectory synchronized across all metro outlets with automated statutory royalty yield verification.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#CAD5C9]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#72D6A0] shadow-[0_0_8px_rgba(114,214,160,0.8)]" />
              <span className="font-medium text-[11px]">Gross GMV (₹ Cr)</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#CAD5C9]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#13845B] shadow-[0_0_8px_rgba(19,132,91,0.8)]" />
              <span className="font-medium text-[11px]">Settled Net (Royalty Yield)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#073B2A] border border-[#13845B] text-[#72D6A0] font-semibold text-[11px]">
              <TrendingUp className="h-3.5 w-3.5 text-[#72D6A0]" />
              <span>15.1% Statutory Yield</span>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart Canvas */}
        <div className="relative pt-6 pb-2 w-full">
          <div className="w-full h-56 sm:h-64">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="net-gmv-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#72D6A0" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#13845B" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#073B2A" stopOpacity="0" />
                </linearGradient>

                <filter id="emerald-graph-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {[100, 75, 50, 25, 0].map((level) => {
                const y = getY(level);
                return (
                  <g key={level}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeDasharray={level === 0 ? "0" : "3 3"}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#CAD5C9"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="500"
                    >
                      ₹{level} Cr
                    </text>
                  </g>
                );
              })}

              {/* GMV Gradient Area */}
              <path d={gmvAreaPath} fill="url(#net-gmv-grad)" />

              {/* Line 1: Gross GMV (Mint Emerald) */}
              <path
                d={gmvPath}
                fill="none"
                stroke="#72D6A0"
                strokeWidth="2.5"
                filter="url(#emerald-graph-glow)"
              />

              {/* Line 2: Settled Net (Emerald Dashed) */}
              <path
                d={settledPath}
                fill="none"
                stroke="#13845B"
                strokeWidth="2"
                strokeDasharray="5 3"
              />

              {/* Vertical Scrubber Cursor Line */}
              {hoveredIndex !== null && (
                <line
                  x1={getX(hoveredIndex)}
                  y1={paddingTop}
                  x2={getX(hoveredIndex)}
                  y2={paddingTop + chartHeight}
                  stroke="rgba(114, 214, 160, 0.5)"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                />
              )}

              {/* Data Node Points */}
              {TRAJECTORY_DATA.map((d, i) => {
                const cx = getX(i);
                const cyGmv = getY(d.gmv);
                const cySettled = getY(d.settled);
                const isHovered = hoveredIndex === i;
                const isLast = i === TRAJECTORY_DATA.length - 1 && hoveredIndex === null;
                const isHighlighted = isHovered || isLast;

                return (
                  <g
                    key={d.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <rect
                      x={cx - chartWidth / (TRAJECTORY_DATA.length * 2)}
                      y={paddingTop}
                      width={chartWidth / TRAJECTORY_DATA.length}
                      height={chartHeight + paddingBottom}
                      fill="transparent"
                    />

                    {isHighlighted && (
                      <circle
                        cx={cx}
                        cy={cyGmv}
                        r="8"
                        fill="rgba(114, 214, 160, 0.25)"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cyGmv}
                      r={isHighlighted ? "4.5" : "3"}
                      fill="#031D15"
                      stroke="#72D6A0"
                      strokeWidth={isHighlighted ? "2.5" : "1.5"}
                    />
                    <circle
                      cx={cx}
                      cy={cyGmv}
                      r={isHighlighted ? "2" : "1"}
                      fill="#72D6A0"
                    />

                    {isHighlighted && (
                      <circle
                        cx={cx}
                        cy={cySettled}
                        r="7"
                        fill="rgba(19, 132, 91, 0.25)"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cySettled}
                      r={isHighlighted ? "4" : "2.5"}
                      fill="#031D15"
                      stroke="#13845B"
                      strokeWidth={isHighlighted ? "2.5" : "1.5"}
                    />

                    <text
                      x={cx}
                      y={paddingTop + chartHeight + 20}
                      textAnchor="middle"
                      fill={isHighlighted ? "#72D6A0" : "#CAD5C9"}
                      fontSize={isHighlighted ? "11" : "10"}
                      fontFamily="monospace"
                      fontWeight={isHighlighted ? "700" : "500"}
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Telemetry Footer Metrics Strip */}
        <div className="mt-4 pt-4 border-t border-[#0D4E39] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono relative z-10">
          <div className="bg-[#05291F] rounded-xl p-3 border border-[#0D4E39]">
            <span className="text-[10px] text-[#CAD5C9] block uppercase">
              {hoveredIndex !== null ? `${activeData.month} Gross GMV` : "Annual Run-Rate GMV"}
            </span>
            <div className="font-bold text-white text-sm sm:text-base flex items-center gap-1 mt-0.5">
              <span>₹{activeData.gmv} Cr</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-[#72D6A0]" />
            </div>
            <span className="text-[10px] text-[#72D6A0] mt-0.5 block">+14.2% YoY Growth</span>
          </div>

          <div className="bg-[#05291F] rounded-xl p-3 border border-[#0D4E39]">
            <span className="text-[10px] text-[#CAD5C9] block uppercase">
              {hoveredIndex !== null ? `${activeData.month} Settled Net` : "Statutory Royalty Yield"}
            </span>
            <div className="font-bold text-[#72D6A0] text-sm sm:text-base flex items-center gap-1 mt-0.5">
              <span>₹{activeData.settled} Cr</span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#72D6A0]" />
            </div>
            <span className="text-[10px] text-[#CAD5C9] mt-0.5 block">{activeData.royaltyRate} Realized Rate</span>
          </div>

          <div className="bg-[#05291F] rounded-xl p-3 border border-[#0D4E39]">
            <span className="text-[10px] text-[#CAD5C9] block uppercase">Reconciliation Status</span>
            <div className="font-bold text-[#72D6A0] text-sm sm:text-base flex items-center gap-1 mt-0.5">
              <span>99.8% Match</span>
            </div>
            <span className="text-[10px] text-[#CAD5C9] mt-0.5 block">Zero Unresolved Variances</span>
          </div>

          <div className="bg-[#05291F] rounded-xl p-3 border border-[#0D4E39]">
            <span className="text-[10px] text-[#CAD5C9] block uppercase">Franchise Nodes Sync</span>
            <div className="font-bold text-[#72D6A0] text-sm sm:text-base flex items-center gap-1 mt-0.5">
              <Activity className="h-3.5 w-3.5 text-[#72D6A0]" />
              <span>10 Metros Active</span>
            </div>
            <span className="text-[10px] text-[#CAD5C9] mt-0.5 block">All Stores Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkTrajectoryGraph;
