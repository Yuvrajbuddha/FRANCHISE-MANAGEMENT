import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEMO_USERS } from "@/utils/auth-constants";
import {
  Building2,
  Store,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Video,
  BarChart3,
  Scale,
  Activity,
  Layers,
  Check,
  Eye,
  AlertTriangle,
  Clock,
  Cpu,
  Lock,
  Menu,
  X,
  FileCheck,
  Search,
  Sliders,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalNetworkBackground } from "@/components/PortalNetworkBackground";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoadingRole, setIsLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1-Click Fast Role Sign-In
  const handleQuickLogin = async (
    roleKey: "OWNER" | "FRANCHISE" | "OFFICER" | "ADMIN",
    targetRoute?: string
  ) => {
    setErrorMessage(null);
    setIsLoadingRole(roleKey);

    const targetDemo = DEMO_USERS.find((u) => u.role === roleKey);
    if (!targetDemo) {
      setErrorMessage(`Demo user profile for ${roleKey} not found.`);
      setIsLoadingRole(null);
      return;
    }

    const res = await login(targetDemo.email, targetDemo.passwordHash);
    setIsLoadingRole(null);

    if (res.success) {
      navigate(targetRoute || "/");
    } else {
      setErrorMessage(res.error || "Authentication failed. Please retry.");
    }
  };

  const scrollToPortals = () => {
    const el = document.getElementById("portals-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans relative">
      <div className="relative z-10">
        {/* ======================================================== */}
        {/* 1. DARK NAVY ENTERPRISE NAVIGATION BAR                   */}
        {/* ======================================================== */}
        <header className="sticky top-0 z-50 bg-[#0D1F3C] backdrop-blur-md border-b border-[#1E3A66] transition-colors shadow-sm text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            {/* Left: Project logo & name */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#152E56] text-blue-300 border border-[#244A82] font-bold shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-white block leading-tight">
                  FranchiseIQ
                </span>
                <span className="text-[11px] text-slate-300 hidden sm:block">
                  Performance & Compliance Monitoring
                </span>
              </div>
            </div>

            {/* Center: Simplified quiet navigation links */}
            <nav className="hidden lg:flex items-center gap-7 text-xs text-slate-200 font-medium">
              <a href="#overview" className="hover:text-white transition-colors">
                Overview
              </a>
              <a href="#operations" className="hover:text-white transition-colors">
                Operations
              </a>
              <a href="#evidence" className="hover:text-white transition-colors">
                AI Verification
              </a>
              <a href="#risk-engine" className="hover:text-white transition-colors">
                Risk
              </a>
              <a href="#capa-loop" className="hover:text-white transition-colors">
                CAPA
              </a>
            </nav>

            {/* Right: Authentication / Access Action */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={scrollToPortals}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-9 px-4 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                Access Workspace
              </button>
            </div>

            {/* Mobile menu toggle */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#152E56]"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-b border-[#1E3A66] bg-[#0D1F3C] px-4 py-4 space-y-3 animate-in fade-in text-xs text-slate-200">
              <nav className="flex flex-col gap-2 text-slate-200">
                <a
                  href="#overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white py-1"
                >
                  Overview
                </a>
                <a
                  href="#operations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white py-1"
                >
                  Operations
                </a>
                <a
                  href="#evidence"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white py-1"
                >
                  AI Verification
                </a>
                <a
                  href="#risk-engine"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white py-1"
                >
                  Risk
                </a>
                <a
                  href="#capa-loop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-white py-1"
                >
                  CAPA
                </a>
              </nav>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToPortals();
                }}
                className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <span>Access Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </header>

        {/* ======================================================== */}
        {/* SECTION 1: HERO / PORTAL SELECTION                       */}
        {/* ======================================================== */}
        <section id="overview" className="relative pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden bg-[#EEF3F8]/80 backdrop-blur-xs border-b border-slate-200/80">
          {/* Interactive Network Background ONLY for this specific portal selection section */}
          <PortalNetworkBackground />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              {/* Small uppercase label */}
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-600 block">
                ENTERPRISE OPERATIONS
              </span>

              {/* Main heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 font-normal tracking-tight">
                Select Your Portal
              </h1>

              {/* Short description */}
              <p className="text-sm sm:text-base text-slate-600 font-sans">
                Choose your workspace to continue.
              </p>
            </div>

            {/* Global Error Banner */}
            {errorMessage && (
              <div className="max-w-md mx-auto mt-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* THREE COMPACT, CLEAN PORTAL CARDS (1 ROW ON DESKTOP)     */}
            {/* ======================================================== */}
            <div id="portals-section" className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Card 1: FRANCHISEE */}
              <div className="rounded-[24px] border border-[#DCE4EE] bg-gradient-to-b from-white to-[#F5F7FC] p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold">
                      FRANCHISEE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900">
                      Franchisee
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Manage your stores and overall business performance.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-11 rounded-xl shadow-xs cursor-pointer gap-2 transition-all uppercase tracking-wider"
                    disabled={isLoadingRole === "OWNER"}
                    onClick={() => handleQuickLogin("OWNER", "/")}
                  >
                    <span>{isLoadingRole === "OWNER" ? "Verifying..." : "Enter Portal →"}</span>
                  </Button>
                </div>
              </div>

              {/* Card 2: STORE */}
              <div className="rounded-[24px] border border-[#D5E6E0] bg-gradient-to-b from-white to-[#F1F8F5] p-6 shadow-xs flex flex-col justify-between hover:border-teal-400 hover:shadow-md transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                      <Store className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
                      STORE
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900">
                      Store
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Manage store operations and submit CCTV evidence.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-11 rounded-xl shadow-xs cursor-pointer gap-2 transition-all uppercase tracking-wider"
                    onClick={() => navigate("/login/store")}
                  >
                    <span>Select Store & Enter →</span>
                  </Button>
                </div>
              </div>

              {/* Card 3: QUALITY OFFICER */}
              <div className="rounded-[24px] border border-[#CFE8DC] bg-gradient-to-b from-white to-[#F0F8F4] p-6 shadow-xs flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                      QUALITY OFFICER
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900">
                      Quality & Compliance Officer
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Review store evidence and give compliance ratings.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs h-11 rounded-xl shadow-xs cursor-pointer gap-2 transition-all uppercase tracking-wider"
                    disabled={isLoadingRole === "OFFICER"}
                    onClick={() => handleQuickLogin("OFFICER", "/compliance")}
                  >
                    <span>{isLoadingRole === "OFFICER" ? "Verifying..." : "Enter Portal →"}</span>
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* CURVED WAVE TRANSITION 1: SOFT LIGHT SURFACE             */}
      {/* ======================================================== */}
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 text-[#F1F5F9] preserve-3d"
        >
          <path
            d="M0,0 C360,70 720,100 1080,60 C1260,40 1380,20 1440,0 L1440,100 L0,100 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: WHY THE PLATFORM EXISTS                       */}
      {/* ======================================================== */}
      <section id="why-platform" className="py-24 md:py-32 bg-[#F1F5F9] border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-500 block">
              THE MULTI-UNIT CHALLENGE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
              Eliminating operational blindspots across{" "}
              <span className="font-serif italic text-slate-700">
                distributed franchise networks.
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Traditional franchise networks rely on unannounced quarterly paper
              visits that capture less than 0.1% of operational hours. Our
              system continuously monitors compliance 24 hours a day, 7 days a
              week.
            </p>
          </div>

          {/* 3 Alternating Editorial Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-[28px] p-8 bg-white border border-slate-200/80 hover:border-indigo-300 transition-all space-y-5 hover:-translate-y-1 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                1. POS & Revenue Reconciliation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated continuous sync with store POS terminals. Flags
                unrecorded cash ticket leakages, gross-to-net discrepancies, and
                calculates exact brand royalty deductions per contract terms.
              </p>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Zero Manual Revenue Reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-600" />
                  <span>100% Tax & Invoicing Alignment</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] p-8 bg-white border border-slate-200/80 hover:border-amber-300 transition-all space-y-5 hover:-translate-y-1 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                2. AI Vision Prep Line Hygiene
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Computer vision surveillance auditing kitchen assembly zones.
                Detects double-bag packaging seals, staff apron compliance,
                refrigeration temperatures, and handwash station adherence.
              </p>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-600" />
                  <span>Unannounced Visual Frame Auditing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-600" />
                  <span>Automatic Evidence Timestamping</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] p-8 bg-white border border-slate-200/80 hover:border-emerald-300 transition-all space-y-5 hover:-translate-y-1 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                3. 8-Stage Statutory CAPA Loop
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enforces end-to-end accountability for non-compliances. Generates
                corrective tasks with strict SLA timers, requiring photographic
                remediation upload and officer re-inspection before issue closure.
              </p>
              <div className="pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Guaranteed FSSAI Defect Resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Real-Time Penalty Escalation Matrix</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* CURVED WAVE TRANSITION 2                                 */}
      {/* ======================================================== */}
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 text-white preserve-3d"
        >
          <path
            d="M0,0 C420,80 840,80 1440,0 L1440,90 L0,90 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: CONNECTED FRANCHISE OPERATIONS                */}
      {/* ======================================================== */}
      <section id="operations" className="py-24 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Storytelling */}
            <div className="space-y-6">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#10B981] block">
                CONNECTED ENTERPRISE ARCHITECTURE
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
                Unified telemetry across{" "}
                <span className="font-serif italic text-slate-700">
                  every operating franchise node.
                </span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Connect point-of-sale streams, cold storage refrigeration loggers,
                and kitchen staging stations across multiple metropolitan hubs into
                one live operating grid.
              </p>

              <div className="pt-2 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Live Data Synchronization</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sub-second ledger synchronization between regional stores and corporate headquarters.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Cold-Chain Temperature Telemetry</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Automated sensor monitoring with instant breach alerts when walk-in chillers exceed 4.0°C.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900">Strict Franchise Isolation</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Cryptographic unit partition ensures store operators cannot inspect peer financial metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Showcase Visual Card */}
            <div className="rounded-[32px] border border-slate-200 bg-[#F8FAFC] p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    NETWORK_GRID_TELEMETRY
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-600 font-semibold">10 Metros · 148 Nodes</span>
              </div>

              {/* Connected Nodes Mockup */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-900">Hazratganj Flagship (OUT-042)</div>
                      <div className="text-[10px] text-slate-500">Lucknow Central · FOCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-bold">100% Sync</div>
                    <div className="text-[10px] text-slate-500">Chiller: 3.4°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-900">Sector 18 Market (OUT-089)</div>
                      <div className="text-[10px] text-slate-500">Noida Express · COCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-bold">100% Sync</div>
                    <div className="text-[10px] text-slate-500">Chiller: 2.8°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <div>
                      <div className="font-semibold text-slate-900">Koramangala 5th Block (OUT-114)</div>
                      <div className="text-[10px] text-slate-500">Bengaluru Hub · FOCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-600 font-bold">CAPA Active</div>
                    <div className="text-[10px] text-slate-500">Chiller: 3.9°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-900">Connaught Place Inner (OUT-019)</div>
                      <div className="text-[10px] text-slate-500">New Delhi · COCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-bold">100% Sync</div>
                    <div className="text-[10px] text-slate-500">Chiller: 2.1°C</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 4: PERFORMANCE INTELLIGENCE                      */}
      {/* ======================================================== */}
      <section id="performance" className="py-24 md:py-32 bg-[#F1F5F9] border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#F59E0B] block">
              FINANCIAL & UNIT ECONOMICS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
              Real-time EBITDA and{" "}
              <span className="font-serif italic text-slate-700">
                revenue leakage prevention.
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Consolidate multi-store point-of-sale revenues, audit gross-to-net sales deductions,
              and protect corporate royalties with automated ledger verification.
            </p>
          </div>

          {/* Visual Showcase: Large KPI Cards & Financial Ledger Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-[24px] p-6 bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs text-slate-500 font-medium">Verified Network GMV</div>
              <div className="font-serif text-3xl font-bold text-slate-900">₹84.6 Cr</div>
              <div className="text-[11px] text-emerald-600 font-mono font-semibold">+14.2% YoY Growth</div>
            </div>
            <div className="rounded-[24px] p-6 bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs text-slate-500 font-medium">Consolidated EBITDA</div>
              <div className="font-serif text-3xl font-bold text-indigo-600">₹12.8 Cr</div>
              <div className="text-[11px] text-indigo-700 font-mono font-semibold">15.1% Net Margin</div>
            </div>
            <div className="rounded-[24px] p-6 bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs text-slate-500 font-medium">Royalty Compliance</div>
              <div className="font-serif text-3xl font-bold text-teal-600">99.8%</div>
              <div className="text-[11px] text-teal-700 font-mono font-semibold">Zero Unreconciled Gaps</div>
            </div>
            <div className="rounded-[24px] p-6 bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs text-slate-500 font-medium">Inventory Freshness</div>
              <div className="font-serif text-3xl font-bold text-emerald-600">96.4%</div>
              <div className="text-[11px] text-emerald-700 font-mono font-semibold">FIFO Stock Rotation</div>
            </div>
          </div>

          {/* Minimal Elegant SVG Graph Showcase */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Network Revenue Trajectory vs Statutory Royalty Yield
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Monthly aggregated billing with automatic POS ledger settlement
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" /> Gross GMV
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" /> Settled Net
                </span>
              </div>
            </div>

            {/* SVG Minimal Line Chart */}
            <div className="h-48 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gmv-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="800" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="800" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />

                {/* Area fill */}
                <path
                  d="M0,130 C120,110 240,120 360,80 C480,90 600,40 800,20 L800,160 L0,160 Z"
                  fill="url(#gmv-grad)"
                />

                {/* Line 1: Gross GMV */}
                <path
                  d="M0,130 C120,110 240,120 360,80 C480,90 600,40 800,20"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                />

                {/* Line 2: Settled Net */}
                <path
                  d="M0,140 C120,125 240,130 360,95 C480,105 600,60 800,40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Points */}
                <circle cx="360" cy="80" r="4" fill="#2563EB" />
                <circle cx="800" cy="20" r="4" fill="#2563EB" />
                <circle cx="360" cy="95" r="4" fill="#10B981" />
                <circle cx="800" cy="40" r="4" fill="#10B981" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 5: AI-ASSISTED EVIDENCE VERIFICATION             */}
      {/* ======================================================== */}
      <section id="evidence" className="py-24 md:py-32 bg-white border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-600 block">
              COMPUTER VISION & CCTV AUDITING
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
              AI assists.{" "}
              <span className="font-serif italic text-slate-700">
                Human verifies.
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              High-resolution security feeds are sampled for food safety non-compliances,
              generating preliminary observations that require Quality Officer verification
              before any disciplinary action or penalty is issued.
            </p>
          </div>

          {/* Visual Step-by-Step Flow: CCTV VIDEO -> EXTRACTED FRAMES -> AI OBSERVATION -> OFFICER REVIEW -> VERIFIED RECORD */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-slate-400 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold">
                  <Video className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">01</span>
              </div>
              <h4 className="font-semibold text-xs text-slate-900">CCTV VIDEO</h4>
              <p className="text-[11px] text-slate-600">
                Continuous camera recording across food staging & storage zones.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-teal-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">02</span>
              </div>
              <h4 className="font-semibold text-xs text-slate-900">EXTRACTED FRAMES</h4>
              <p className="text-[11px] text-slate-600">
                Computer vision isolates keyframe timestamps with Day-Dot indicators.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">03</span>
              </div>
              <h4 className="font-semibold text-xs text-slate-900">AI OBSERVATION</h4>
              <p className="text-[11px] text-slate-600">
                Preliminary confidence evaluation of hygiene, packaging seal, and temperature.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">04</span>
              </div>
              <h4 className="font-semibold text-xs text-slate-900">OFFICER REVIEW</h4>
              <p className="text-[11px] text-slate-600">
                Senior compliance officer inspects and corroborates evidence.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 relative group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">05</span>
              </div>
              <h4 className="font-semibold text-xs text-slate-900">VERIFIED RECORD</h4>
              <p className="text-[11px] text-slate-600">
                Immutable audit dossier logged with deterministic impact on risk score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: RISK INTELLIGENCE & DETERMINISTIC SCORING     */}
      {/* ======================================================== */}
      <section id="risk-engine" className="py-24 md:py-32 bg-[#F1F5F9] border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Prominent Risk Score Presentation */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 md:p-10 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
                    Deterministic Risk Engine
                  </span>
                  <h3 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
                    Composite Risk Evaluation
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                  HIGH RISK (64/100)
                </span>
              </div>

              {/* Large Score Showcase */}
              <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Calculated Risk Index
                  </div>
                  <div className="font-serif text-6xl sm:text-7xl font-bold text-slate-900 mt-1">
                    64 <span className="text-2xl text-slate-400 font-sans font-normal">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Algorithmic composite: Hygiene (40%) + CAPA SLA (30%) + Temperature (20%) + Complaints (10%)
                  </p>
                </div>

                {/* Score Status Circle Gauge */}
                <div className="h-28 w-28 rounded-full border-4 border-rose-200 border-t-rose-500 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-rose-600 font-mono">STATUS</span>
                  <span className="text-sm font-bold text-slate-900">ESCALATED</span>
                </div>
              </div>

              {/* Contributing Factors: WHAT is the score? WHY is the score? WHAT needs review? */}
              <div className="pt-6 space-y-4 text-xs">
                <div>
                  <div className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px]">
                    WHAT is the score?
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Composite penalty rating aggregating open non-conformances, temperature excursions, and unverified hygiene observations.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-amber-700 uppercase tracking-wider text-[10px]">
                    WHY is the score?
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    2 unresolved high-severity CAPA tasks approaching statutory SLA deadline in Hazratganj Flagship (OUT-042).
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-emerald-700 uppercase tracking-wider text-[10px]">
                    WHAT needs review?
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Walk-in chiller sensor recalibration log and tamper-seal packaging photographic evidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Text Storytelling */}
            <div className="space-y-6">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-500 block">
                PREDICTIVE RISK ENGINE
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
                Predictive composite risk scoring{" "}
                <span className="font-serif italic text-slate-700">
                  with mathematical rigor.
                </span>
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Rather than subjective ratings, FranchiseIQ computes risk using a deterministic formula that
                weights statutory non-conformances, SLA overdue counters, customer complaints, and refrigeration data.
              </p>

              <div className="pt-2 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Weighted penalty matrix compliant with statutory food safety regulations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Automatic risk downgrades upon verified corrective action completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Zero manual tampering or score overrides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 7: ROLE-BASED OPERATIONAL PORTALS                */}
      {/* ======================================================== */}
      <section id="roles" className="py-24 md:py-32 bg-white border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#10B981] block">
              CRYPTOGRAPHIC DATA ISOLATION
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
              Tailored interfaces for{" "}
              <span className="font-serif italic text-slate-700">
                every governance tier.
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Strict multi-tenant security architecture ensures users see only the data relevant to their role and authorized store nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 hover:border-indigo-300 transition-all">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <h4 className="font-serif text-lg font-bold text-slate-900">Franchise Owner</h4>
              <p className="text-xs text-slate-600">
                Multi-unit P&L, consolidated EBITDA, gross sales ledger, inventory demands.
              </p>
            </div>
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 hover:border-slate-300 transition-all">
              <Store className="h-8 w-8 text-slate-700" />
              <h4 className="font-serif text-lg font-bold text-slate-900">Store Operator</h4>
              <p className="text-xs text-slate-600">
                Isolated unit portal, opening checklists, CCTV review, POS settlement.
              </p>
            </div>
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 hover:border-emerald-300 transition-all">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <h4 className="font-serif text-lg font-bold text-slate-900">Quality Auditor</h4>
              <p className="text-xs text-slate-600">
                Cross-store inspections, non-conformance logs, CCTV video verification.
              </p>
            </div>
            <div className="rounded-[24px] p-6 bg-slate-50 border border-slate-200 space-y-3 hover:border-amber-300 transition-all">
              <Scale className="h-8 w-8 text-amber-600" />
              <h4 className="font-serif text-lg font-bold text-slate-900">System Admin</h4>
              <p className="text-xs text-slate-600">
                Network outlet registry, royalty fee rules, user permissions, audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 8: CORRECTIVE ACTION LOOP (CAPA)                 */}
      {/* ======================================================== */}
      <section id="capa-loop" className="py-24 md:py-32 bg-[#F1F5F9] border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-4">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#F59E0B] block">
              STATUTORY REMEDIATION PROTOCOL
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
              Enforced accountability through the{" "}
              <span className="font-serif italic text-slate-700">
                8-stage CAPA loop.
              </span>
            </h2>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Non-compliances trigger automated corrective and preventive action tickets with enforced SLA timers,
              photographic proof requirements, and mandatory officer sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-mono text-indigo-600 font-semibold">PHASE 1–2</span>
              <h4 className="font-semibold text-sm text-slate-900">Detection & Root Cause</h4>
              <p className="text-xs text-slate-600">
                Observation flagged from CCTV or audit and classified by severity level.
              </p>
            </div>
            <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-mono text-slate-500 font-semibold">PHASE 3–4</span>
              <h4 className="font-semibold text-sm text-slate-900">Action Plan & SLA</h4>
              <p className="text-xs text-slate-600">
                Store GM assigns remediation tasks with automatic countdown timers.
              </p>
            </div>
            <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-mono text-amber-600 font-semibold">PHASE 5–6</span>
              <h4 className="font-semibold text-sm text-slate-900">Implementation & Proof</h4>
              <p className="text-xs text-slate-600">
                Photo evidence uploaded directly from store tablet verifying resolution.
              </p>
            </div>
            <div className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] font-mono text-emerald-600 font-semibold">PHASE 7–8</span>
              <h4 className="font-semibold text-sm text-slate-900">Verification & Closure</h4>
              <p className="text-xs text-slate-600">
                Quality & Compliance officer re-inspects, approves ticket, and clears risk deduction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 9: FINAL CTA / LOGIN PORTAL ANCHOR               */}
      {/* ======================================================== */}
      <section className="py-24 md:py-36 bg-white border-t border-slate-200 relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-500 block">
            ENTERPRISE PLATFORM
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-slate-900">
            Ready to access your workspace?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Select your authorized portal to review store performance, daily CCTV evidence, and compliance ratings.
          </p>

          <div className="pt-2 flex items-center justify-center">
            <Button
              size="lg"
              onClick={scrollToPortals}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-12 px-8 rounded-xl shadow-xs cursor-pointer gap-2 transition-all uppercase tracking-wider"
            >
              <span>Select Your Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* EDITORIAL FOOTER                                         */}
      {/* ======================================================== */}
      <footer className="bg-[#0F172A] text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-serif text-lg font-bold text-white">
                FranchiseIQ
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <a href="#overview" className="hover:text-white transition-colors">
                Overview
              </a>
              <a href="#operations" className="hover:text-white transition-colors">
                Operations
              </a>
              <a href="#evidence" className="hover:text-white transition-colors">
                AI Verification
              </a>
              <a href="#risk-engine" className="hover:text-white transition-colors">
                Risk
              </a>
              <a href="#capa-loop" className="hover:text-white transition-colors">
                CAPA
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © 2026 AI-Assisted Franchise Performance & Compliance Monitoring. Confidential & Proprietary.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              <span>Enterprise Compliance Infrastructure</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
