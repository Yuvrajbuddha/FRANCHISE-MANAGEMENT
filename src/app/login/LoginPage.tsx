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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [isLoadingRole, setIsLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                AI-Assisted Franchise Performance & Compliance Monitoring
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-300 bg-slate-800/80">
                Enterprise v2.4
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Unit Operations, Quality Audits & Deterministic Risk Engine
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Deterministic Audit Engine
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Zero External Desk
          </span>
          <span className="text-slate-700">•</span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            ISO 27001 Rely
          </span>
        </div>
      </header>

      {/* Main Body: 3 Dedicated Login Sections (Zero-Scroll Layout) */}
      <main className="max-w-6xl mx-auto w-full my-auto py-6">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Select Your Designated Operational Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Enterprise role-based authentication with strict data partitioning and single-store isolation.
          </p>
        </div>

        {/* 3 Core Trust Pillars Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3.5 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                Deterministic Audit Engine
              </div>
              <div className="text-[11px] text-slate-400">
                Mathematical reproducibility & weighted scoring
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3.5 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Server className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                Zero External Desk
              </div>
              <div className="text-[11px] text-slate-400">
                Self-contained perimeter & strict data isolation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3.5 py-2.5 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight">
                ISO 27001 Rely
              </div>
              <div className="text-[11px] text-slate-400">
                Enterprise security controls & immutable audit log
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner if any */}
        {errorMessage && (
          <div className="mb-6 max-w-xl mx-auto flex items-center gap-2.5 rounded-lg bg-red-950/80 border border-red-700/60 p-3 text-xs text-red-200">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3 Core Login Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ========================================= */}
          {/* SECTION 1: FRANCHISEE OWNER */}
          {/* ========================================= */}
          <div className="relative flex flex-col justify-between rounded-xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-black/40 hover:border-blue-500/70 transition-all group">
            <div className="space-y-4">
              {/* Header & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="border-blue-500/30 bg-blue-950/50 text-blue-300 font-semibold text-[11px]">
                  Executive Access
                </Badge>
              </div>

              <div>
                <span className="text-[11px] font-mono text-blue-400 font-medium tracking-wider uppercase">
                  Portal 1
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Franchisee Owner
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Executive dashboard for multi-unit franchise owners and institutional stakeholders.
                </p>
              </div>

              {/* Universal Scope Box */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-700/80 p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Executive Multi-Unit Scope</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                    READ-ONLY
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" />
                    <span>Consolidated Revenue, EBITDA & Margins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" />
                    <span>Cross-Store Performance & City Benchmarks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" />
                    <span>Deterministic Anomaly & Risk Distributions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 mt-2">
              <Button
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 cursor-pointer shadow-md shadow-blue-900/30 gap-1.5"
                disabled={isLoadingRole === "OWNER"}
                onClick={() => handleQuickLogin("OWNER", "/")}
              >
                {isLoadingRole === "OWNER" ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Access Franchisee Owner Portal</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ========================================= */}
          {/* SECTION 2: STORE */}
          {/* ========================================= */}
          <div className="relative flex flex-col justify-between rounded-xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-black/40 hover:border-emerald-500/70 transition-all group">
            <div className="space-y-4">
              {/* Header & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Store className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-950/50 text-emerald-300 font-semibold text-[11px]">
                  Single-Store Access
                </Badge>
              </div>

              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-medium tracking-wider uppercase">
                  Portal 2
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Store
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  On-ground store operations, daily sales entry, and inventory reconciliation.
                </p>
              </div>

              {/* Universal Scope Box */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-700/80 p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Single-Outlet Partition</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    1 STORE ONLY
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Strict URL Isolation (Access only assigned store)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Daily Sales Batch & Payment Reconciliation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>Physical Stock Audits & Batch Reception</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button: Moves to dedicated Store Login page */}
            <div className="pt-4 mt-2">
              <Button
                variant="default"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 cursor-pointer shadow-md shadow-emerald-900/30 gap-1.5"
                onClick={() => navigate("/login/store")}
              >
                <span>Continue to Store Login</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>

          {/* ========================================= */}
          {/* SECTION 3: OFFICER */}
          {/* ========================================= */}
          <div className="relative flex flex-col justify-between rounded-xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-black/40 hover:border-amber-500/70 transition-all group">
            <div className="space-y-4">
              {/* Header & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-950/50 text-amber-300 font-semibold text-[11px]">
                  Quality & Audit
                </Badge>
              </div>

              <div>
                <span className="text-[11px] font-mono text-amber-400 font-medium tracking-wider uppercase">
                  Portal 3
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Officer
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Field inspections, AI vision CCTV frame verification, and CAPA enforcement.
                </p>
              </div>

              {/* Universal Scope Box */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-700/80 p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Field & Compliance Scope</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                    AUDIT / CAPA
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-amber-400 shrink-0" />
                    <span>CCTV Frame Verification (Human-in-the-Loop)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-amber-400 shrink-0" />
                    <span>Hygiene, SOP & Process Adherence Audits</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-amber-400 shrink-0" />
                    <span>Issue & Verify Corrective Actions (CAPA)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 mt-2">
              <Button
                variant="default"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs h-9 cursor-pointer shadow-md shadow-amber-900/30 gap-1.5"
                disabled={isLoadingRole === "OFFICER"}
                onClick={() => handleQuickLogin("OFFICER", "/compliance")}
              >
                {isLoadingRole === "OFFICER" ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Access Officer Portal</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Utility Strip: System Admin & Manual Credentials Drawer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-800/40 px-5 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-400" />
            <span>Need corporate platform configuration?</span>
            <button
              onClick={() => handleQuickLogin("ADMIN", "/")}
              className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
            >
              Sign in as System Admin (Vikram Malhotra)
            </button>
          </div>

          <div>
            <button
              onClick={() => setShowManualLogin(!showManualLogin)}
              className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer font-medium transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>{showManualLogin ? "Hide Custom Login Form" : "Custom Credentials Sign-In"}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Manual Login Card */}
        {showManualLogin && (
          <div className="mt-4 max-w-md mx-auto rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-1">Custom Credentials Authentication</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter any enterprise account email and password to log in directly.
            </p>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Corporate Email
                </label>
                <Input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="name@aurafoods.com"
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Account Password
                </label>
                <Input
                  type="password"
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-semibold"
                disabled={isManualLoading}
              >
                {isManualLoading ? "Verifying Credentials..." : "Authenticate"}
              </Button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
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
