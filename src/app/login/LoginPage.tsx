import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { DEMO_USERS } from "@/lib/auth-constants";
import {
  Building2,
  Store,
  ShieldCheck,
  Crown,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  KeyRound,
  FileCheck2,
  BarChart3,
  Video,
  Layers,
  ChevronRight,
  ShieldAlert,
  Cpu,
  Server,
  Award,
  TrendingUp,
  DollarSign,
  Boxes,
  Clock,
  Activity,
  Radio,
  Wifi,
  Scale,
  MapPin,
  Check,
  ExternalLink,
  Shield,
  Eye,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoadingRole, setIsLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeContextTab, setActiveContextTab] = useState<"ALL" | "OWNER" | "FRANCHISE" | "OFFICER" | "ADMIN">("ALL");

  // Manual custom login state
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [isManualLoading, setIsManualLoading] = useState(false);

  // 1-Click Fast Role Sign-In
  const handleQuickLogin = async (roleKey: "OWNER" | "FRANCHISE" | "OFFICER" | "ADMIN", targetRoute?: string) => {
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

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-indigo-500 selection:text-white bg-slate-950 relative overflow-x-hidden"
      style={{
        backgroundImage: "url('/images/command_center_bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Ambient Gradient Overlays for Depth */}
      <div className="absolute inset-0 bg-slate-950/80 pointer-events-none -z-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-800/80 pb-4 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold border border-indigo-400/30">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                AI-Assisted Franchise Performance & Compliance Monitoring
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Integrated Multi-Unit Operations, AI Vision Auditing & Deterministic Risk Engine
            </p>
          </div>
        </div>

        {/* Live Network Health Status Ticker */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            148 Store Nodes Active
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Radio className="h-3.5 w-3.5 text-blue-400" />
            Zero External Desk
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            ISO 27001 Rely
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto w-full my-auto py-5 space-y-6">
        {/* HERO TITLE & EXPANDED OVERVIEW */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-sm shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Closed-Loop Enterprise Operational Governance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Select Your Designated Operating Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Role-partitioned access gateway enforcing cryptographic store isolation, POS sales auditing,
            food safety surveillance, and deterministic multi-unit risk scoring.
          </p>

          {/* Telemetry Highlight Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-300">
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              <span><strong>10 Live DB Metros:</strong> Lucknow, Noida, Bengaluru, Delhi, Mumbai, Pune</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span><strong>Net GMV:</strong> ₹84.6 Cr Network Run-Rate (15.2% EBITDA)</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-amber-400" />
              <span><strong>AI Vision:</strong> CCTV Prep Line Frame Audits</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-teal-400" />
              <span><strong>CAPA:</strong> 8-Stage Statutory Remediation Loop</span>
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-xl mx-auto flex items-center gap-2.5 rounded-lg bg-red-950/80 border border-red-700/60 p-2.5 text-xs text-red-200">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* COMPACT & ORGANIZED LOGIN BUTTONS SECTION                */}
        {/* ======================================================== */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Instant Role-Based Access Portals
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              1-Click Verified Sign-In
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Franchisee Owner Compact Button Card */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 hover:border-blue-500/60 transition-all flex flex-col justify-between gap-2.5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      Franchisee Owner
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Multi-Store P&L</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-300 bg-blue-950/40">
                  Owner
                </Badge>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Rajesh Singhania</span>
                <span className="font-mono text-blue-400">12 Outlets</span>
              </div>

              <Button
                size="sm"
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-7.5 cursor-pointer gap-1 shadow-sm"
                disabled={isLoadingRole === "OWNER"}
                onClick={() => handleQuickLogin("OWNER", "/")}
              >
                {isLoadingRole === "OWNER" ? "Signing In..." : "Sign In as Owner"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            {/* 2. Store Operations Compact Button Card */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 hover:border-emerald-500/60 transition-all flex flex-col justify-between gap-2.5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                    <Store className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Store
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono">OUT-042 Scoped</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-300 bg-emerald-950/40">
                  Isolated
                </Badge>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Vikram Malhotra</span>
                <span className="font-mono text-emerald-400">Store GM</span>
              </div>

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-1/2 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs h-7.5 cursor-pointer"
                  disabled={isLoadingRole === "FRANCHISE"}
                  onClick={() => handleQuickLogin("FRANCHISE", "/")}
                >
                  {isLoadingRole === "FRANCHISE" ? "..." : "1-Click"}
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-7.5 cursor-pointer shadow-sm gap-1"
                  onClick={() => navigate("/login/store")}
                >
                  <span>Store</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* 3. Quality & Compliance Officer Compact Button Card */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 hover:border-amber-500/60 transition-all flex flex-col justify-between gap-2.5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      Officer
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Audit & CAPA</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-300 bg-amber-950/40">
                  Auditor
                </Badge>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Officer Ananya Roy</span>
                <span className="font-mono text-amber-400">Lead Auditor</span>
              </div>

              <Button
                size="sm"
                variant="default"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-7.5 cursor-pointer gap-1 shadow-sm"
                disabled={isLoadingRole === "OFFICER"}
                onClick={() => handleQuickLogin("OFFICER", "/compliance")}
              >
                {isLoadingRole === "OFFICER" ? "Signing In..." : "Sign In as Auditor"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            {/* 4. System Admin Compact Button Card */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 hover:border-purple-500/60 transition-all flex flex-col justify-between gap-2.5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                    <Crown className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                      System Admin
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Cloud SQL / IT</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-300 bg-purple-950/40">
                  Root Admin
                </Badge>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Enterprise IT</span>
                <span className="font-mono text-purple-400">All Modules</span>
              </div>

              <Button
                size="sm"
                variant="default"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs h-7.5 cursor-pointer gap-1 shadow-sm"
                disabled={isLoadingRole === "ADMIN"}
                onClick={() => handleQuickLogin("ADMIN", "/")}
              >
                {isLoadingRole === "ADMIN" ? "Signing In..." : "Sign In as Admin"}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EXPANDED OPERATING PORTAL CONTEXT CARDS FOR EACH USER    */}
        {/* ======================================================== */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                <span>Operating Portal Architecture & Role Specifications</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed mandate, workflow stages, and security isolation parameters for each designated user type.
              </p>
            </div>

            {/* Filter Tabs to Inspect Specific User Types */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-[11px]">
              {(["ALL", "OWNER", "FRANCHISE", "OFFICER", "ADMIN"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveContextTab(tab)}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    activeContextTab === tab
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "ALL" ? "All Roles" : tab === "FRANCHISE" ? "Store" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CONTEXT CARD 1: FRANCHISEE OWNER */}
            {(activeContextTab === "ALL" || activeContextTab === "OWNER") && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-blue-500/50 transition-all backdrop-blur-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                      Mandate 01 • Executive Partner
                    </span>
                    <Badge className="bg-blue-950 border border-blue-800/80 text-blue-300 text-[9px]">
                      Read-Only Network
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">Franchisee Owner Scope</h3>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Oversees capital allocation, royalty yields, and network-wide operating margins across multiple franchisee stores.
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Workflows:</span>
                      <ul className="space-y-1 text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-blue-400 shrink-0" />
                          <span>Monitor consolidated ₹84.6 Cr annual run-rate</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-blue-400 shrink-0" />
                          <span>Audit 15.2% statutory EBITDA margin benchmarks</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-blue-400 shrink-0" />
                          <span>Cross-city outlet density comparisons (10 Metros)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Security & Boundaries:</span>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Read-only telemetry across all 148 outlets. Cannot tamper with on-ground POS sales entries or close statutory CAPA audits.
                      </p>
                    </div>

                    <div className="p-2 rounded bg-blue-950/30 border border-blue-900/40 text-[10px] text-blue-200">
                      <strong>14-Step Loop Position:</strong> Stages 1 & 6 (Company Governance & Analytics)
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickLogin("OWNER", "/")}
                  className="w-full border-blue-500/40 text-blue-300 hover:bg-blue-950 text-xs h-7 cursor-pointer mt-2"
                >
                  Enter Owner Portal →
                </Button>
              </div>
            )}

            {/* CONTEXT CARD 2: STORE OPERATIONS */}
            {(activeContextTab === "ALL" || activeContextTab === "FRANCHISE") && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-emerald-500/50 transition-all backdrop-blur-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Mandate 02 • Store Operations
                    </span>
                    <Badge className="bg-emerald-950 border border-emerald-800/80 text-emerald-300 text-[9px]">
                      Single-Store Partition
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">Store General Manager Scope</h3>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Manages daily storefront order intake, physical inventory audits, food prep adherence, and CAPA remedial proof.
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Workflows:</span>
                      <ul className="space-y-1 text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Close daily POS batches (₹54,200 avg daily net)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Verify walk-in chiller probe temps (+3.8°C par)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>Upload evidence photos for open CAPA tickets</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Security & Boundaries:</span>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Strict cryptographic URL isolation. Cannot view or access peer stores (e.g. OUT-089 or OUT-114).
                      </p>
                    </div>

                    <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-[10px] text-emerald-200">
                      <strong>14-Step Loop Position:</strong> Stages 3, 4, 5, 13 (Outlet, Stock, Sales, Evidence)
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/login/store")}
                  className="w-full border-emerald-500/40 text-emerald-300 hover:bg-emerald-950 text-xs h-7 cursor-pointer mt-2"
                >
                  Enter Store Portal →
                </Button>
              </div>
            )}

            {/* CONTEXT CARD 3: QUALITY & COMPLIANCE OFFICER */}
            {(activeContextTab === "ALL" || activeContextTab === "OFFICER") && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-amber-500/50 transition-all backdrop-blur-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                      Mandate 03 • Quality Auditor
                    </span>
                    <Badge className="bg-amber-950 border border-amber-800/80 text-amber-300 text-[9px]">
                      Audit & CAPA Write
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">Compliance Officer Scope</h3>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Executes unannounced inspections, verifies AI surveillance CCTV footage, calculates deterministic risk, and signs off CAPA closures.
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Workflows:</span>
                      <ul className="space-y-1 text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-amber-400 shrink-0" />
                          <span>Score digital HACCP/SOP hygiene audits (85% par)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-amber-400 shrink-0" />
                          <span>Human-in-the-loop AI vision CCTV frame review</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-amber-400 shrink-0" />
                          <span>Issue binding CAPAs and sign off verified closures</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Security & Boundaries:</span>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Authorized to conduct surprise inspections across any store in assigned territory and recalculate risk scores.
                      </p>
                    </div>

                    <div className="p-2 rounded bg-amber-950/30 border border-amber-900/40 text-[10px] text-amber-200">
                      <strong>14-Step Loop Position:</strong> Stages 7, 8, 9, 10, 11, 12 (Audits, AI Vision, CAPA)
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickLogin("OFFICER", "/compliance")}
                  className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-950 text-xs h-7 cursor-pointer mt-2"
                >
                  Enter Officer Portal →
                </Button>
              </div>
            )}

            {/* CONTEXT CARD 4: SYSTEM ADMIN */}
            {(activeContextTab === "ALL" || activeContextTab === "ADMIN") && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 hover:border-purple-500/50 transition-all backdrop-blur-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                      Mandate 04 • Super Admin
                    </span>
                    <Badge className="bg-purple-950 border border-purple-800/80 text-purple-300 text-[9px]">
                      Full Platform Root
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">System Admin & IT Scope</h3>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Controls PostgreSQL database clustering, RBAC credentials, user provisioning, security policies, and automated SLA escalations.
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Workflows:</span>
                      <ul className="space-y-1 text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Monitor Cloud SQL database health & replication</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Enforce cryptographic JWT token revocation</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-purple-400 shrink-0" />
                          <span>Automated overdue SLA escalation to senior VP</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-slate-950/60 border border-slate-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Security & Boundaries:</span>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Unrestricted root administrative access across all 14 stages of the operational governance loop.
                      </p>
                    </div>

                    <div className="p-2 rounded bg-purple-950/30 border border-purple-900/40 text-[10px] text-purple-200">
                      <strong>14-Step Loop Position:</strong> Stages 1–14 (Full Loop Infrastructure & Audits)
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickLogin("ADMIN", "/")}
                  className="w-full border-purple-500/40 text-purple-300 hover:bg-purple-950 text-xs h-7 cursor-pointer mt-2"
                >
                  Enter Admin Portal →
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Custom Credentials Bar & Drawer */}
        <div className="max-w-xl mx-auto text-center pt-2">
          <button
            onClick={() => setShowManualLogin(!showManualLogin)}
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 cursor-pointer font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-900/60"
          >
            <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
            <span>{showManualLogin ? "Hide Custom Login Form" : "Need to log in with custom corporate credentials?"}</span>
          </button>

          {showManualLogin && (
            <div className="mt-3 p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl text-left max-w-md mx-auto backdrop-blur-sm">
              <h3 className="text-xs font-bold text-white mb-1">Corporate Credentials Authentication</h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Enter any registered enterprise email address and password.
              </p>
              <form onSubmit={handleManualSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Corporate Email
                  </label>
                  <Input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="e.g. ananya.roy@aurafoods.in"
                    className="bg-slate-950 border-slate-800 text-white text-xs h-8"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-950 border-slate-800 text-white text-xs h-8"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-semibold cursor-pointer mt-1"
                  disabled={isManualLoading}
                >
                  {isManualLoading ? "Verifying..." : "Sign In with Credentials"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 backdrop-blur-xs">
        <span>© 2026 AI-Assisted Franchise Performance & Compliance Monitoring. Confidential & Proprietary.</span>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-slate-300 font-semibold">Deterministic Audit Engine</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-300 font-semibold">Zero External Desk</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-300 font-semibold">ISO 27001 Rely</span>
        </div>
      </footer>
    </div>
  );
}
