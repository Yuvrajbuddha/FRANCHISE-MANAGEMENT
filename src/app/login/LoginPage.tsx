import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { DEMO_USERS } from "@/lib/auth-constants";
import {
  Building2,
  Store,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Video,
  ChevronDown,
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
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoadingRole, setIsLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual custom login state
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [isManualLoading, setIsManualLoading] = useState(false);
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

  // Custom credentials login
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail || !manualPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setIsManualLoading(true);

    const res = await login(manualEmail, manualPassword);
    setIsManualLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setErrorMessage(res.error || "Invalid email or password.");
    }
  };

  const scrollToPortals = () => {
    const el = document.getElementById("portals-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050B1A] text-[#F8FAFC] antialiased selection:bg-[#4F46FF] selection:text-white font-sans">
      {/* ======================================================== */}
      {/* 1. MINIMAL PREMIUM EDITORIAL NAVIGATION                  */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 bg-[#050B1A]/85 backdrop-blur-xl border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Project logo & name */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46FF] to-[#6366F1] text-white shadow-lg shadow-indigo-500/20 border border-white/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  FranchiseIQ
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Sentinel v4.2
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] hidden sm:block">
                Performance & Compliance Monitoring
              </p>
            </div>
          </div>

          {/* Center: Existing navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-medium text-[#94A3B8]">
            <a href="#overview" className="hover:text-white transition-colors">
              Overview
            </a>
            <a href="#why-platform" className="hover:text-white transition-colors">
              Operational Blindspots
            </a>
            <a href="#operations" className="hover:text-white transition-colors">
              Connected Telemetry
            </a>
            <a href="#performance" className="hover:text-white transition-colors">
              Financial Intelligence
            </a>
            <a href="#evidence" className="hover:text-white transition-colors">
              AI Verification
            </a>
            <a href="#risk-engine" className="hover:text-white transition-colors">
              Risk Engine
            </a>
            <a href="#capa-loop" className="hover:text-white transition-colors">
              CAPA Loop
            </a>
          </nav>

          {/* Right: Authentication / Access Action */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>10 Metros Active</span>
            </div>
            <button
              onClick={scrollToPortals}
              className="text-xs font-semibold bg-[#4F46FF] hover:bg-[#6366F1] text-white px-5 py-2.5 rounded-2xl transition-all shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer flex items-center gap-2"
            >
              <span>Access Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/10 bg-[#071126] px-6 py-6 space-y-4">
            <nav className="flex flex-col gap-3 text-sm text-[#94A3B8]">
              <a
                href="#overview"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Overview
              </a>
              <a
                href="#why-platform"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Operational Blindspots
              </a>
              <a
                href="#operations"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Connected Telemetry
              </a>
              <a
                href="#performance"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Financial Intelligence
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
                Risk Engine
              </a>
            </nav>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToPortals();
              }}
              className="w-full text-xs font-semibold bg-[#4F46FF] text-white py-3 rounded-2xl flex items-center justify-center gap-2"
            >
              <span>Access Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* SECTION 1: HERO / PORTAL SELECTION                       */}
      {/* ======================================================== */}
      <section id="overview" className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        {/* Subtle Enterprise Network Visualization in Background */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Subtle Connected Nodes SVG */}
          <svg
            className="absolute w-full h-full opacity-15 stroke-indigo-400/30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#4F46FF" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-dots)" />
            {/* Connected Network Vector Lines */}
            <path
              d="M 120,180 L 340,240 L 620,190 L 890,260 L 1150,210"
              strokeDasharray="4 6"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 280,360 L 520,320 L 780,380 L 1040,310"
              strokeDasharray="4 6"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          {/* Soft Node Glows */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[300px] bg-[#4F46FF]/12 rounded-full blur-3xl" />
          <div className="absolute top-48 right-1/4 w-[450px] h-[300px] bg-[#22D3EE]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[#00B894]/8 rounded-full blur-3xl" />

          {/* Subtle Floating Node Markers */}
          <div className="hidden lg:block absolute top-32 left-[12%] text-[10px] font-mono text-indigo-300/60 border border-indigo-500/20 bg-[#071126]/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
            ● NODE_DELHI_019 [SYNC OK]
          </div>
          <div className="hidden lg:block absolute top-52 right-[10%] text-[10px] font-mono text-cyan-300/60 border border-cyan-500/20 bg-[#071126]/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
            ● NODE_BLR_114 [CHILLER 3.4°C]
          </div>
          <div className="hidden lg:block absolute bottom-32 left-[18%] text-[10px] font-mono text-emerald-300/60 border border-emerald-500/20 bg-[#071126]/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
            ● NODE_LKO_042 [POS 100%]
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Small uppercase label */}
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-4 py-1.5 rounded-full border border-[#F59E0B]/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Closed-Loop Enterprise Operational Governance</span>
            </div>

            {/* Large editorial serif heading with highlighted phrase */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#F8FAFC] font-normal tracking-tight leading-[1.1]">
              Select Your{" "}
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#00B894]">
                Designated Operating Portal
              </span>
            </h1>

            {/* Supporting paragraph */}
            <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed font-sans">
              Cryptographically isolated portals designed for multi-outlet franchisees,
              on-the-ground store managers, and statutory compliance auditors.
            </p>

            {/* Current KPI / Information Chips */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0A1224]/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md shadow-inner">
                <Store className="h-3.5 w-3.5 text-[#22D3EE]" />
                <span>10 Live DB Metros</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0A1224]/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md shadow-inner">
                <TrendingUp className="h-3.5 w-3.5 text-[#00B894]" />
                <span>₹84.6 Cr Net GMV</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0A1224]/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md shadow-inner">
                <Video className="h-3.5 w-3.5 text-[#6366F1]" />
                <span>AI Vision Prep Line Audit</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0A1224]/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md shadow-inner">
                <ShieldCheck className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>8-Stage CAPA Resolution</span>
              </div>
            </div>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="max-w-2xl mx-auto mt-8 flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* LIVEDIN-STYLE PREMIUM ROLE CARDS (SECTION 1 PORTALS)     */}
          {/* ======================================================== */}
          <div id="portals-section" className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Franchisee */}
            <div className="group relative rounded-[28px] border border-white/10 bg-[#0A1224]/90 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 px-3 py-1 rounded-full">
                    12 Outlets
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
                    Portfolio Governance
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1 group-hover:text-indigo-400 transition-colors">
                    Franchisee
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2.5 leading-relaxed">
                    Consolidated multi-unit P&L visibility, real-time EBITDA
                    benchmarking, centralized inventory demand, and brand royalty
                    audits.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Designated Operator</span>
                    <span className="font-medium text-slate-200">Yash Gupta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Scope</span>
                    <span className="font-mono text-emerald-400">Multi-Store P&L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Access Level</span>
                    <span className="text-indigo-300">Full Network Owner</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  size="lg"
                  className="w-full bg-[#4F46FF] hover:bg-[#6366F1] text-white font-semibold text-xs h-12 rounded-2xl shadow-lg shadow-indigo-600/25 cursor-pointer gap-2 transition-all hover:scale-[1.01]"
                  disabled={isLoadingRole === "OWNER"}
                  onClick={() => handleQuickLogin("OWNER", "/")}
                >
                  <span>
                    {isLoadingRole === "OWNER" ? "Verifying Session..." : "Sign In as Franchisee"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Card 2: Store Operations */}
            <div className="group relative rounded-[28px] border border-white/10 bg-[#0A1224]/90 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 flex items-center justify-center">
                    <Store className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-cyan-300 bg-cyan-500/15 border border-cyan-500/20 px-3 py-1 rounded-full">
                    OUT-042 Partition
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#22D3EE]">
                    Unit-Level Execution
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors">
                    Store Operations
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2.5 leading-relaxed">
                    Cryptographically isolated outlet partition. Daily shift
                    opening protocols, tamper-seal packaging logs, and real-time POS
                    sync.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Station Target</span>
                    <span className="font-medium text-slate-200">Hazratganj Flagship</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Role Title</span>
                    <span className="font-mono text-cyan-400">Store GM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Data Isolation</span>
                    <span className="text-emerald-400">Strict Outlet Boundary</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  size="lg"
                  className="w-full bg-[#071126] hover:bg-[#0F1B35] text-white border border-white/15 font-semibold text-xs h-12 rounded-2xl shadow-md cursor-pointer gap-2 transition-all hover:scale-[1.01]"
                  onClick={() => navigate("/login/store")}
                >
                  <span>Sign In as Store</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Card 3: Quality & Compliance Officer */}
            <div className="group relative rounded-[28px] border border-white/10 bg-[#0A1224]/90 p-8 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full">
                    Officer Dashboard
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B894]">
                    Officer Review & Ratings
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                    Quality & Compliance Officer
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2.5 leading-relaxed">
                    Review store evidence, verify compliance and assign store ratings.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Designated Officer</span>
                    <span className="font-medium text-slate-200">Officer Yuvraj Buddha</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Operational Scope</span>
                    <span className="font-mono text-emerald-400">All Network Stores</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Verification Authority</span>
                    <span className="text-indigo-400">Direct Store Rating & Verification</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  size="lg"
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs h-12 rounded-2xl shadow-lg shadow-emerald-600/25 cursor-pointer gap-2 transition-all hover:scale-[1.01]"
                  disabled={isLoadingRole === "OFFICER"}
                  onClick={() => handleQuickLogin("OFFICER", "/compliance")}
                >
                  <span>
                    {isLoadingRole === "OFFICER" ? "Verifying Session..." : "Sign In as Quality Officer"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Collapsible Corporate Credentials Form */}
          <div className="mt-12 text-center max-w-xl mx-auto">
            <button
              onClick={() => setShowManualLogin(!showManualLogin)}
              className="text-xs font-medium text-slate-400 hover:text-white inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white/10 bg-[#0A1224] hover:bg-[#0E1A33] transition-all cursor-pointer shadow-sm"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>
                {showManualLogin
                  ? "Close Corporate Credentials Form"
                  : "Need to authenticate with custom enterprise credentials?"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  showManualLogin ? "rotate-180" : ""
                }`}
              />
            </button>

            {showManualLogin && (
              <div className="mt-6 p-7 rounded-[28px] border border-white/10 bg-[#0A1224] shadow-2xl text-left transition-all backdrop-blur-xl">
                <div className="mb-5">
                  <h4 className="font-serif text-lg font-bold text-white">
                    Corporate Single Sign-On
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    Enter your registered enterprise email address and password.
                  </p>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Corporate Email
                    </label>
                    <Input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="e.g. yuvraj.buddha@aurafoods.com"
                      className="bg-[#050B1A] border-white/10 text-white text-xs h-11 rounded-xl focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={manualPassword}
                      onChange={(e) => setManualPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-[#050B1A] border-white/10 text-white text-xs h-11 rounded-xl focus:border-indigo-500"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#4F46FF] hover:bg-[#6366F1] text-white text-xs h-11 rounded-xl font-semibold cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
                    disabled={isManualLoading}
                  >
                    {isManualLoading ? "Verifying Credentials..." : "Authenticate Session"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* CURVED WAVE TRANSITION 1: DARK NAVY TO LIGHTER NAVY     */}
      {/* ======================================================== */}
      <div className="w-full overflow-hidden leading-none -mb-1">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 text-[#071126] preserve-3d"
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
      <section id="why-platform" className="py-24 md:py-32 bg-[#071126] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#22D3EE] bg-[#22D3EE]/10 px-3.5 py-1.5 rounded-full border border-[#22D3EE]/20 inline-block">
              The Multi-Unit Challenge
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
              Eliminating operational blindspots across{" "}
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#00B894]">
                distributed franchise networks.
              </span>
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed max-w-2xl">
              Traditional franchise networks rely on unannounced quarterly paper
              visits that capture less than 0.1% of operational hours. Our
              system continuously monitors compliance 24 hours a day, 7 days a
              week.
            </p>
          </div>

          {/* 3 Alternating Editorial Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-[28px] p-8 bg-[#0A1224]/90 border border-white/10 hover:border-indigo-500/40 transition-all space-y-5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-bold">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                1. POS & Revenue Reconciliation
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Automated continuous sync with store POS terminals. Flags
                unrecorded cash ticket leakages, gross-to-net discrepancies, and
                calculates exact brand royalty deductions per contract terms.
              </p>
              <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-indigo-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Zero Manual Revenue Reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-400" />
                  <span>100% Tax & Invoicing Alignment</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] p-8 bg-[#0A1224]/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center font-bold">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                2. AI Vision Prep Line Hygiene
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Computer vision surveillance auditing kitchen assembly zones.
                Detects double-bag packaging seals, staff apron compliance,
                refrigeration temperatures, and handwash station adherence.
              </p>
              <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-amber-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400" />
                  <span>Unannounced Visual Frame Auditing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-amber-400" />
                  <span>Automatic Evidence Timestamping</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] p-8 bg-[#0A1224]/90 border border-white/10 hover:border-emerald-500/40 transition-all space-y-5 hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                3. 8-Stage Statutory CAPA Loop
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Enforces end-to-end accountability for non-compliances. Generates
                corrective tasks with strict SLA timers, requiring photographic
                remediation upload and officer re-inspection before issue closure.
              </p>
              <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-emerald-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Guaranteed FSSAI Defect Resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
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
          className="w-full h-14 sm:h-20 text-[#050B1A] preserve-3d"
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
      <section id="operations" className="py-24 md:py-32 bg-[#050B1A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Storytelling */}
            <div className="space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#00B894] bg-[#00B894]/10 px-3.5 py-1.5 rounded-full border border-[#00B894]/20 inline-block">
                Connected Enterprise Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                Unified telemetry across{" "}
                <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#00B894] via-[#22D3EE] to-[#6366F1]">
                  every operating franchise node.
                </span>
              </h2>
              <p className="text-base text-[#94A3B8] leading-relaxed">
                Connect point-of-sale streams, cold storage refrigeration loggers,
                and kitchen staging stations across multiple metropolitan hubs into
                one live operating grid.
              </p>

              <div className="pt-2 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Live Data Synchronization</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Sub-second ledger synchronization between regional stores and corporate headquarters.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Cold-Chain Temperature Telemetry</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Automated sensor monitoring with instant breach alerts when walk-in chillers exceed 4.0°C.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Strict Franchise Isolation</h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Cryptographic unit partition ensures store operators cannot inspect peer financial metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Showcase Visual Card */}
            <div className="rounded-[32px] border border-white/10 bg-[#0A1224] p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    NETWORK_GRID_TELEMETRY
                  </span>
                </div>
                <span className="text-[11px] font-mono text-indigo-400">10 Metros · 148 Nodes</span>
              </div>

              {/* Connected Nodes Mockup */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050B1A] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Hazratganj Flagship (OUT-042)</div>
                      <div className="text-[10px] text-slate-400">Lucknow Central · FOCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">100% Sync</div>
                    <div className="text-[10px] text-slate-400">Chiller: 3.4°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050B1A] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Sector 18 Market (OUT-089)</div>
                      <div className="text-[10px] text-slate-400">Noida Express · COCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">100% Sync</div>
                    <div className="text-[10px] text-slate-400">Chiller: 2.8°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050B1A] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <div>
                      <div className="font-semibold text-white">Koramangala 5th Block (OUT-114)</div>
                      <div className="text-[10px] text-slate-400">Bengaluru Hub · FOCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-bold">CAPA Active</div>
                    <div className="text-[10px] text-slate-400">Chiller: 3.9°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050B1A] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Connaught Place Inner (OUT-019)</div>
                      <div className="text-[10px] text-slate-400">New Delhi · COCO Model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">100% Sync</div>
                    <div className="text-[10px] text-slate-400">Chiller: 2.1°C</div>
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
      <section id="performance" className="py-24 md:py-32 bg-[#071126] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-3.5 py-1.5 rounded-full border border-[#F59E0B]/20 inline-block">
              Financial & Unit Economics
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
              Real-time EBITDA and{" "}
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#22D3EE]">
                revenue leakage prevention.
              </span>
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              Consolidate multi-store point-of-sale revenues, audit gross-to-net sales deductions,
              and protect corporate royalties with automated ledger verification.
            </p>
          </div>

          {/* Visual Showcase: Large KPI Cards & Financial Ledger Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-2">
              <div className="text-xs text-slate-400 font-medium">Verified Network GMV</div>
              <div className="font-serif text-3xl font-bold text-white">₹84.6 Cr</div>
              <div className="text-[11px] text-emerald-400 font-mono">+14.2% YoY Growth</div>
            </div>
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-2">
              <div className="text-xs text-slate-400 font-medium">Consolidated EBITDA</div>
              <div className="font-serif text-3xl font-bold text-indigo-400">₹12.8 Cr</div>
              <div className="text-[11px] text-indigo-300 font-mono">15.1% Net Margin</div>
            </div>
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-2">
              <div className="text-xs text-slate-400 font-medium">Royalty Compliance</div>
              <div className="font-serif text-3xl font-bold text-cyan-400">99.8%</div>
              <div className="text-[11px] text-cyan-300 font-mono">Zero Unreconciled Gaps</div>
            </div>
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-2">
              <div className="text-xs text-slate-400 font-medium">Inventory Freshness</div>
              <div className="font-serif text-3xl font-bold text-emerald-400">96.4%</div>
              <div className="text-[11px] text-emerald-300 font-mono">FIFO Stock Rotation</div>
            </div>
          </div>

          {/* Minimal Elegant SVG Graph Showcase */}
          <div className="rounded-[32px] border border-white/10 bg-[#0A1224] p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  Network Revenue Trajectory vs Statutory Royalty Yield
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Monthly aggregated billing with automatic POS ledger settlement
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" /> Gross GMV
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Settled Net
                </span>
              </div>
            </div>

            {/* SVG Minimal Line Chart */}
            <div className="h-48 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 800 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gmv-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46FF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4F46FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="40" x2="800" y2="40" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="800" y2="80" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="800" y2="120" stroke="#1E293B" strokeDasharray="3 3" />

                {/* Area fill */}
                <path
                  d="M0,130 C120,110 240,120 360,80 C480,90 600,40 800,20 L800,160 L0,160 Z"
                  fill="url(#gmv-grad)"
                />

                {/* Line 1: Gross GMV */}
                <path
                  d="M0,130 C120,110 240,120 360,80 C480,90 600,40 800,20"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                />

                {/* Line 2: Settled Net */}
                <path
                  d="M0,140 C120,125 240,130 360,95 C480,105 600,60 800,40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                />

                {/* Points */}
                <circle cx="360" cy="80" r="4" fill="#6366F1" />
                <circle cx="800" cy="20" r="4" fill="#6366F1" />
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
      <section id="evidence" className="py-24 md:py-32 bg-[#050B1A] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1] bg-[#6366F1]/10 px-3.5 py-1.5 rounded-full border border-[#6366F1]/20 inline-block">
              Computer Vision & CCTV Auditing
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
              AI assists.{" "}
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-white">
                Human verifies.
              </span>
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed max-w-2xl">
              High-resolution security feeds are sampled for food safety non-compliances,
              generating preliminary observations that require Quality Officer verification
              before any disciplinary action or penalty is issued.
            </p>
          </div>

          {/* Visual Step-by-Step Flow: CCTV VIDEO -> EXTRACTED FRAMES -> AI OBSERVATION -> OFFICER REVIEW -> VERIFIED RECORD */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 relative group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                  <Video className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">01</span>
              </div>
              <h4 className="font-semibold text-xs text-white">CCTV VIDEO</h4>
              <p className="text-[11px] text-[#94A3B8]">
                Continuous camera recording across food staging & storage zones.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 relative group hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
                  <Eye className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">02</span>
              </div>
              <h4 className="font-semibold text-xs text-white">EXTRACTED FRAMES</h4>
              <p className="text-[11px] text-[#94A3B8]">
                Computer vision isolates keyframe timestamps with Day-Dot indicators.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 relative group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">03</span>
              </div>
              <h4 className="font-semibold text-xs text-white">AI OBSERVATION</h4>
              <p className="text-[11px] text-[#94A3B8]">
                Preliminary confidence evaluation of hygiene, packaging seal, and temperature.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 relative group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">04</span>
              </div>
              <h4 className="font-semibold text-xs text-white">OFFICER REVIEW</h4>
              <p className="text-[11px] text-[#94A3B8]">
                Senior compliance officer inspects and corroborates evidence.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 relative group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">05</span>
              </div>
              <h4 className="font-semibold text-xs text-white">VERIFIED RECORD</h4>
              <p className="text-[11px] text-[#94A3B8]">
                Immutable audit dossier logged with deterministic impact on risk score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 6: RISK INTELLIGENCE & DETERMINISTIC SCORING     */}
      {/* ======================================================== */}
      <section id="risk-engine" className="py-24 md:py-32 bg-[#071126] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Prominent Risk Score Presentation */}
            <div className="rounded-[32px] border border-white/10 bg-[#0A1224] p-8 md:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B]">
                    Deterministic Risk Engine
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white mt-0.5">
                    Composite Risk Evaluation
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                  HIGH RISK (64/100)
                </span>
              </div>

              {/* Large Score Showcase */}
              <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Calculated Risk Index
                  </div>
                  <div className="font-serif text-6xl sm:text-7xl font-bold text-white mt-1">
                    64 <span className="text-2xl text-slate-400 font-sans font-normal">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    Algorithmic composite: Hygiene (40%) + CAPA SLA (30%) + Temperature (20%) + Complaints (10%)
                  </p>
                </div>

                {/* Score Status Circle Gauge */}
                <div className="h-28 w-28 rounded-full border-4 border-rose-500/30 border-t-rose-500 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-rose-400 font-mono">STATUS</span>
                  <span className="text-sm font-bold text-white">ESCALATED</span>
                </div>
              </div>

              {/* Contributing Factors: WHAT is the score? WHY is the score? WHAT needs review? */}
              <div className="pt-6 space-y-4 text-xs">
                <div>
                  <div className="font-semibold text-indigo-300 uppercase tracking-wider text-[10px]">
                    WHAT is the score?
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    Composite penalty rating aggregating open non-conformances, temperature excursions, and unverified hygiene observations.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-amber-300 uppercase tracking-wider text-[10px]">
                    WHY is the score?
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    2 unresolved high-severity CAPA tasks approaching statutory SLA deadline in Hazratganj Flagship (OUT-042).
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-emerald-300 uppercase tracking-wider text-[10px]">
                    WHAT needs review?
                  </div>
                  <p className="text-slate-300 mt-0.5">
                    Walk-in chiller sensor recalibration log and tamper-seal packaging photographic evidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Text Storytelling */}
            <div className="space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#22D3EE] bg-[#22D3EE]/10 px-3.5 py-1.5 rounded-full border border-[#22D3EE]/20 inline-block">
                Predictive Risk Engine
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                Predictive composite risk scoring{" "}
                <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] via-[#6366F1] to-[#00B894]">
                  with mathematical rigor.
                </span>
              </h2>
              <p className="text-base text-[#94A3B8] leading-relaxed">
                Rather than subjective ratings, FranchiseIQ computes risk using a deterministic formula that
                weights statutory non-conformances, SLA overdue counters, customer complaints, and refrigeration data.
              </p>

              <div className="pt-2 space-y-3 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Weighted penalty matrix compliant with statutory food safety regulations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Automatic risk downgrades upon verified corrective action completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" />
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
      <section id="roles" className="py-24 md:py-32 bg-[#050B1A] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#00B894] bg-[#00B894]/10 px-3.5 py-1.5 rounded-full border border-[#00B894]/20 inline-block">
              Cryptographic Data Isolation
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
              Tailored interfaces for{" "}
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#00B894] via-[#22D3EE] to-white">
                every governance tier.
              </span>
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed">
              Strict multi-tenant security architecture ensures users see only the data relevant to their role and authorized store nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 hover:border-indigo-500/40 transition-all">
              <Building2 className="h-8 w-8 text-indigo-400" />
              <h4 className="font-serif text-lg font-bold text-white">Franchise Owner</h4>
              <p className="text-xs text-[#94A3B8]">
                Multi-unit P&L, consolidated EBITDA, gross sales ledger, inventory demands.
              </p>
            </div>
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 hover:border-cyan-500/40 transition-all">
              <Store className="h-8 w-8 text-cyan-400" />
              <h4 className="font-serif text-lg font-bold text-white">Store Operator</h4>
              <p className="text-xs text-[#94A3B8]">
                Isolated unit portal, opening checklists, CCTV review, POS settlement.
              </p>
            </div>
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 hover:border-emerald-500/40 transition-all">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
              <h4 className="font-serif text-lg font-bold text-white">Quality Auditor</h4>
              <p className="text-xs text-[#94A3B8]">
                Cross-store inspections, non-conformance logs, CCTV video verification.
              </p>
            </div>
            <div className="rounded-[24px] p-6 bg-[#0A1224] border border-white/10 space-y-3 hover:border-amber-500/40 transition-all">
              <Scale className="h-8 w-8 text-amber-400" />
              <h4 className="font-serif text-lg font-bold text-white">System Admin</h4>
              <p className="text-xs text-[#94A3B8]">
                Network outlet registry, royalty fee rules, user permissions, audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 8: CORRECTIVE ACTION LOOP (CAPA)                 */}
      {/* ======================================================== */}
      <section id="capa-loop" className="py-24 md:py-32 bg-[#071126] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-3.5 py-1.5 rounded-full border border-[#F59E0B]/20 inline-block">
              Statutory Remediation Protocol
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
              Enforced accountability through the{" "}
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-[#22D3EE] to-white">
                8-stage CAPA loop.
              </span>
            </h2>
            <p className="text-base text-[#94A3B8] leading-relaxed max-w-2xl">
              Non-compliances trigger automated corrective and preventive action tickets with enforced SLA timers,
              photographic proof requirements, and mandatory officer sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-[24px] bg-[#0A1224] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-indigo-400">PHASE 1–2</span>
              <h4 className="font-semibold text-sm text-white">Detection & Root Cause</h4>
              <p className="text-xs text-[#94A3B8]">
                Observation flagged from CCTV or audit and classified by severity level.
              </p>
            </div>
            <div className="p-6 rounded-[24px] bg-[#0A1224] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-cyan-400">PHASE 3–4</span>
              <h4 className="font-semibold text-sm text-white">Action Plan & SLA</h4>
              <p className="text-xs text-[#94A3B8]">
                Store GM assigns remediation tasks with automatic countdown timers.
              </p>
            </div>
            <div className="p-6 rounded-[24px] bg-[#0A1224] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-amber-400">PHASE 5–6</span>
              <h4 className="font-semibold text-sm text-white">Implementation & Proof</h4>
              <p className="text-xs text-[#94A3B8]">
                Photo evidence uploaded directly from store tablet verifying resolution.
              </p>
            </div>
            <div className="p-6 rounded-[24px] bg-[#0A1224] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400">PHASE 7–8</span>
              <h4 className="font-semibold text-sm text-white">Verification & Closure</h4>
              <p className="text-xs text-[#94A3B8]">
                Quality & Compliance officer re-inspects, approves ticket, and clears risk deduction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 9: FINAL CTA / LOGIN PORTAL ANCHOR               */}
      {/* ======================================================== */}
      <section className="py-24 md:py-36 bg-gradient-to-b from-[#071126] to-[#050B1A] border-t border-white/5 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#22D3EE] bg-[#22D3EE]/10 px-4 py-1.5 rounded-full border border-[#22D3EE]/20 inline-block">
            Enterprise Access
          </span>
          <h2 className="font-serif text-4xl sm:text-6xl font-normal leading-tight text-white">
            Ready to verify your{" "}
            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#22D3EE] to-[#00B894]">
              franchise network?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Select your authorized operating role to access live telemetry, financial reconciliation, and CCTV auditing.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={scrollToPortals}
              className="w-full sm:w-auto bg-[#4F46FF] hover:bg-[#6366F1] text-white font-semibold text-sm h-13 px-8 rounded-2xl shadow-xl shadow-indigo-600/30 cursor-pointer gap-2 transition-all hover:scale-105"
            >
              <span>Select Your Operating Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleQuickLogin("ADMIN", "/")}
              className="w-full sm:w-auto border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm h-13 px-7 rounded-2xl cursor-pointer"
            >
              <span>Sign In as Corporate Admin</span>
            </Button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* EDITORIAL FOOTER                                         */}
      {/* ======================================================== */}
      <footer className="bg-[#050B1A] text-[#94A3B8] py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46FF] to-[#6366F1] text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="font-serif text-lg font-bold text-white">
                FranchiseIQ
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#94A3B8]">
              <a href="#overview" className="hover:text-white transition-colors">
                Overview
              </a>
              <a href="#why-platform" className="hover:text-white transition-colors">
                Operational Blindspots
              </a>
              <a href="#operations" className="hover:text-white transition-colors">
                Connected Telemetry
              </a>
              <a href="#performance" className="hover:text-white transition-colors">
                Financial Intelligence
              </a>
              <a href="#evidence" className="hover:text-white transition-colors">
                AI Verification
              </a>
              <a href="#risk-engine" className="hover:text-white transition-colors">
                Risk Engine
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © 2026 AI-Assisted Franchise Performance & Compliance Monitoring. Confidential & Proprietary.
            </p>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
              <span>10 Metros Active</span>
              <span>·</span>
              <span>Statutory Compliance Architecture</span>
              <span>·</span>
              <span>Single Sign-On Enabled</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
