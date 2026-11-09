import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEMO_USERS } from "@/utils/auth-constants";
import {
  Shield,
  ShieldCheck,
  Camera,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  Store,
  ChevronRight,
  X,
  Menu,
  Activity,
  Layers,
  Sparkles,
  FileCheck2,
  Users,
  Compass,
} from "lucide-react";
import { FranchiseNetworkHeroVisual } from "@/components/FranchiseNetworkHeroVisual";
import { CctvEvidenceShowcase } from "@/components/CctvEvidenceShowcase";
import { AiIntelligenceSection } from "@/components/AiIntelligenceSection";
import { AuditWorkflowSection } from "@/components/AuditWorkflowSection";
import { NetworkTrajectoryGraph } from "@/components/NetworkTrajectoryGraph";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoadingRole, setIsLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSelectionModalOpen, setRoleSelectionModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeModalRole, setActiveModalRole] = useState<"ADMIN" | "OFFICER" | "OWNER" | "FRANCHISE">("OFFICER");

  // Credentials form state
  const [emailInput, setEmailInput] = useState("yuvraj.buddha@aurafoods.com");
  const [passwordInput, setPasswordInput] = useState("officer123");
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

  // Fast 1-Click Role Login
  const handleQuickLogin = async (
    roleKey: "OWNER" | "FRANCHISE" | "OFFICER" | "ADMIN",
    targetRoute?: string
  ) => {
    // When Store role is selected, direct to unified Store Login
    if (roleKey === "FRANCHISE") {
      setRoleSelectionModalOpen(false);
      setAuthModalOpen(false);
      navigate("/store-login");
      return;
    }

    setErrorMessage(null);
    setIsLoadingRole(roleKey);
    const targetDemo = DEMO_USERS.find((u) => u.role === roleKey);
    if (!targetDemo) {
      setErrorMessage(`Demo profile for ${roleKey} not found.`);
      setIsLoadingRole(null);
      return;
    }

    const res = await login(targetDemo.email, targetDemo.passwordHash);
    setIsLoadingRole(null);
    if (res.success) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      setRoleSelectionModalOpen(false);
      navigate(targetRoute || (roleKey === "OFFICER" ? "/compliance" : "/"));
    } else {
      setErrorMessage(res.error || "Authentication failed. Please retry.");
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmittingCredentials(true);
    const res = await login(emailInput, passwordInput);
    setIsSubmittingCredentials(false);
    if (res.success) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      setAuthModalOpen(false);
      if (activeModalRole === "OFFICER") {
        navigate("/compliance");
      } else if (activeModalRole === "FRANCHISE") {
        navigate("/store-login");
      } else {
        navigate("/");
      }
    } else {
      setErrorMessage(res.error || "Invalid username or password. Please use pre-filled demo accounts.");
    }
  };

  const openAuthWithRole = (role: "ADMIN" | "OFFICER" | "OWNER" | "FRANCHISE") => {
    if (role === "FRANCHISE") {
      setRoleSelectionModalOpen(false);
      setAuthModalOpen(false);
      navigate("/store-login");
      return;
    }
    setActiveModalRole(role);
    const matched = DEMO_USERS.find((u) => u.role === role);
    if (matched) {
      setEmailInput(matched.email);
      setPasswordInput(matched.passwordHash);
    }
    setRoleSelectionModalOpen(false);
    setAuthModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#18251F] font-sans antialiased selection:bg-[#073B2A] selection:text-white">
      {/* ======================================================== */}
      {/* 1. TOP BAR CONTRACT (Strict 3-Zone Architecture)         */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#F6F1E7]/92 backdrop-blur-md border-b border-[#DDE5DC] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <Link to="/" className="flex items-center gap-3 whitespace-nowrap shrink-0 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#073B2A] text-[#72D6A0] shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#073B2A] leading-none">
                Franchise Standards Auditor
              </span>
              <span className="text-[11px] text-[#738078] font-medium tracking-wide mt-0.5">
                Multi-Unit Intelligence & CCTV Audit System
              </span>
            </div>
          </Link>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#18251F]">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-[#073B2A] font-semibold hover:text-[#13845B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Command Center
            </button>
            <button
              onClick={() => scrollToSection("cctv-pipeline")}
              className="text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              CCTV Evidence
            </button>
            <button
              onClick={() => scrollToSection("ai-intelligence")}
              className="text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              AI Audit Engines
            </button>
            <button
              onClick={() => scrollToSection("workflow")}
              className="text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Audit Lifecycle
            </button>
            <button
              onClick={() => scrollToSection("portals")}
              className="text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Role Portals
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <Link
              to="/store-login"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#073B2A] bg-[#FFFDF8] border border-[#DDE5DC] hover:border-[#13845B] hover:text-[#13845B] hover:bg-[#F0FDF4] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Store className="h-3.5 w-3.5 text-[#13845B]" />
              <span>Store Login</span>
            </Link>

            <button
              onClick={() => setRoleSelectionModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] shadow-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#073B2A] hover:bg-[#EAE3D2] rounded-lg cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[#DDE5DC] bg-[#FFFDF8] px-4 py-4 space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("hero"); }}
              className="block w-full text-left py-1.5 text-sm font-semibold text-[#073B2A]"
            >
              Command Center
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("cctv-pipeline"); }}
              className="block w-full text-left py-1.5 text-sm text-[#738078]"
            >
              CCTV Evidence
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("ai-intelligence"); }}
              className="block w-full text-left py-1.5 text-sm text-[#738078]"
            >
              AI Audit Engines
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("workflow"); }}
              className="block w-full text-left py-1.5 text-sm text-[#738078]"
            >
              Audit Lifecycle
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("portals"); }}
              className="block w-full text-left py-1.5 text-sm text-[#738078]"
            >
              Role Portals
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/store-login"); }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-[#073B2A] bg-[#FAF7F0] border border-[#DDE5DC] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4 text-[#13845B]" />
                <span>Store Login (All 10 Stores)</span>
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); setRoleSelectionModalOpen(true); }}
              className="w-full mt-2 text-xs font-semibold bg-[#073B2A] text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION: FRANCHISE INTELLIGENCE COMMAND CENTER   */}
      {/* ======================================================== */}
      <section id="hero" className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-[#F6F1E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Copy, Action CTAs & Proof */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE3D2] border border-[#DDE5DC] text-xs font-medium text-[#073B2A]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#13845B]" />
                <span>Enterprise Multi-Unit Franchise Governance</span>
              </div>

              {/* Dominant Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#073B2A] font-bold tracking-tight leading-[1.08] text-balance">
                One Platform. <br />
                <span className="italic font-serif font-normal text-[#13845B]">
                  Complete Franchise Intelligence.
                </span>
              </h1>

              {/* Concise Domain-Specific Prose */}
              <p className="text-base sm:text-lg text-[#738078] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Connect, monitor, audit, and analyze multiple franchise outlets from one centralized command system. Automate CCTV hygiene verification, eliminate inventory slippage, and certify brand consistency across the entire network.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => setRoleSelectionModalOpen(true)}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection("ai-intelligence")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#FFFDF8] text-[#073B2A] border border-[#DDE5DC] hover:border-[#13845B] hover:bg-[#F0FDF4] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Compass className="h-4 w-4 text-[#13845B]" />
                  <span>Explore Platform</span>
                </button>
              </div>

              {/* 4 Quantitative Proof Metrics (Unboxed Text with Separators) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#DDE5DC] text-xs font-mono text-[#18251F]">
                <div>
                  <span className="text-lg font-bold text-[#073B2A] block tabular-nums">10 Nodes</span>
                  <span className="text-[11px] text-[#738078]">Connected Stores</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-[#13845B] block tabular-nums">99.4%</span>
                  <span className="text-[11px] text-[#738078]">Audit Accuracy</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-[#073B2A] block tabular-nums">₹59.3M</span>
                  <span className="text-[11px] text-[#738078]">Monthly GMV</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-[#13845B] block tabular-nums">24/7 AI</span>
                  <span className="text-[11px] text-[#738078]">CCTV Scans</span>
                </div>
              </div>
            </div>

            {/* Right Column: Animated Franchise Network Visualization (Command Center) */}
            <div className="lg:col-span-7">
              <FranchiseNetworkHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CCTV EVIDENCE INTELLIGENCE PIPELINE (Core Feature)    */}
      {/* ======================================================== */}
      <div id="cctv-pipeline">
        <CctvEvidenceShowcase />
      </div>

      {/* ======================================================== */}
      {/* 4. AI AUDIT INTELLIGENCE (6 Dedicated Engines)           */}
      {/* ======================================================== */}
      <div id="ai-intelligence">
        <AiIntelligenceSection />
      </div>

      {/* ======================================================== */}
      {/* 5. END-TO-END AUDIT WORKFLOW (7-Stage Closed Loop)       */}
      {/* ======================================================== */}
      <div id="workflow">
        <AuditWorkflowSection />
      </div>

      {/* ======================================================== */}
      {/* 6. NETWORK REVENUE & ROYALTY TRAJECTORY GRAPH             */}
      {/* ======================================================== */}
      <section className="py-20 md:py-28 bg-[#FFFDF8] border-t border-[#DDE5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#13845B] block">
              NETWORK PERFORMANCE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#073B2A]">
              Consolidated Revenue vs Royalty Trajectory
            </h2>
            <p className="text-sm text-[#738078]">
              Automated multi-unit ledger reconciliation ensuring prompt royalty settlements and verified financial transparency.
            </p>
          </div>

          <NetworkTrajectoryGraph />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. ROLE WORKSPACES & LOGIN SECTION                       */}
      {/* ======================================================== */}
      <section id="portals" className="py-20 md:py-28 bg-[#FAF7F0] border-t border-[#DDE5DC] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#073B2A] block">
              WORKSPACE ACCESS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#073B2A]">
              Select Your Role Workspace
            </h2>
            <p className="text-sm text-[#738078]">
              Choose your profile for immediate, authorized access to live platform data.
            </p>
          </div>

          {/* Global Error Message */}
          {errorMessage && (
            <div className="max-w-md mx-auto mb-8 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
              <Lock className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Exactly 3 User Role Cards Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Franchisee Owner Portal */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] hover:border-[#073B2A] transition-all flex flex-col justify-between space-y-5 shadow-xs group">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-xl bg-[#073B2A] text-white flex items-center justify-center font-bold">
                  <TrendingUp className="h-6 w-6 text-[#72D6A0]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Franchisee Owner Portal
                  </h3>
                  <span className="text-[10px] font-mono text-[#738078] uppercase">
                    Yash Gupta · Investor & Royalty ROI
                  </span>
                </div>
                <p className="text-xs text-[#738078] leading-relaxed">
                  Gross merchandise value, royalty settlements, commissary supplies, and store ratings.
                </p>
              </div>

              <button
                onClick={() => navigate("/franchisee-login")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Open Franchisee Owner Portal</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 2. Complaints Officer Portal */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border-2 border-[#13845B] hover:border-[#073B2A] transition-all flex flex-col justify-between space-y-5 shadow-md group">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-xl bg-[#13845B] text-white flex items-center justify-center font-bold">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Complaints Officer Portal
                  </h3>
                  <span className="text-[10px] font-mono text-[#13845B] font-bold uppercase">
                    Yuvraj Buddha · Field Inspections, Complaints & Audits
                  </span>
                </div>
                <p className="text-xs text-[#738078] leading-relaxed">
                  Field inspections, authentic CCTV video frame verification, customer complaint resolution, CAPA corrective actions, and official audit certifications.
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin("OFFICER")}
                disabled={isLoadingRole !== null}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#13845B] text-white hover:bg-[#0E6847] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{isLoadingRole === "OFFICER" ? "Signing In..." : "Open Complaints Officer Portal"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 3. Store Operators Portal */}
            <div className="p-6 rounded-2xl bg-white border-2 border-[#073B2A] hover:border-[#13845B] transition-all flex flex-col justify-between space-y-5 shadow-md group md:col-span-2 lg:col-span-1">
              <div className="space-y-3">
                <div className="h-11 w-11 rounded-xl bg-[#073B2A] text-white flex items-center justify-center font-bold">
                  <Store className="h-6 w-6 text-[#72D6A0]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Store Operators Portal
                  </h3>
                  <span className="text-[10px] font-mono text-[#13845B] font-bold uppercase">
                    10 Registered Stores · Outlet Operations
                  </span>
                </div>
                <p className="text-xs text-[#738078] leading-relaxed">
                  Select your specific outlet from all 10 registered stores, authenticate with store-specific credentials, and manage daily sales invoices and physical counts.
                </p>
              </div>

              <button
                onClick={() => navigate("/store-login")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#13845B] text-white hover:bg-[#0E6847] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Open Store Operators Portal</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Manual Credentials Modal Link */}
          <div className="mt-10 text-center">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs text-[#738078] hover:text-[#073B2A] underline underline-offset-4 cursor-pointer"
            >
              Prefer to enter custom email & password? Click here for credentials login
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. FOOTER — BRANCH & CREDITS                             */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#031D15] border-t border-[#0D4E39] text-[#CAD5C9] pt-12 pb-14 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Row: Brand & Quick Navigation */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs border-b border-[#0D4E39]/80 pb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#073B2A] border border-[#13845B] flex items-center justify-center text-[#72D6A0]">
                <Shield className="h-4 w-4" />
              </div>
              <div className="text-left">
                <span className="font-serif font-bold text-sm text-white block">
                  Franchise Standards Auditor
                </span>
                <span className="text-[#889B86]">Autonomous Multi-Unit Audit & CCTV Intelligence</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#CAD5C9]">
              <Link to="/store-login" className="hover:text-[#72D6A0] transition-colors">
                Store Login
              </Link>
              <button onClick={() => setRoleSelectionModalOpen(true)} className="hover:text-[#72D6A0] transition-colors cursor-pointer">
                Role Workspaces
              </button>
              <button onClick={() => scrollToSection("hero")} className="hover:text-[#72D6A0] transition-colors cursor-pointer">
                Back to Top
              </button>
            </div>

            <div className="text-xs text-[#889B86]">
              <span>© 2026 AuraFoods Franchise Network</span>
            </div>
          </div>

          {/* Centered Branch & Credits Section */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="text-xs sm:text-sm font-bold tracking-widest text-[#72D6A0] uppercase font-mono">
              Your Branch
            </div>
            <div className="font-serif text-base sm:text-xl text-white font-medium tracking-tight">
              Made by Yuvraj & Yash
            </div>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* ROLE SELECTION FAST-ACCESS MODAL                         */}
      {/* ======================================================== */}
      {roleSelectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#FFFDF8] border border-[#DDE5DC] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#073B2A] text-[#72D6A0] flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Select Your Role Workspace
                  </h3>
                  <p className="text-xs text-[#738078]">Instant access to live operational data</p>
                </div>
              </div>
              <button
                onClick={() => setRoleSelectionModalOpen(false)}
                className="p-1.5 rounded-lg text-[#738078] hover:bg-[#FAF7F0] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Franchisee Owner Portal */}
              <button
                onClick={() => {
                  setRoleSelectionModalOpen(false);
                  navigate("/franchisee-login");
                }}
                className="w-full p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#DDE5DC] hover:border-[#073B2A] transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#073B2A] text-white flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#72D6A0]" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#073B2A] block">
                      Franchisee Owner Portal
                    </span>
                    <span className="text-[11px] text-[#738078]">Yash Gupta · Investor & Royalty ROI</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#738078] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Complaints Officer Portal */}
              <button
                onClick={() => handleQuickLogin("OFFICER")}
                disabled={isLoadingRole !== null}
                className="w-full p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#DDE5DC] hover:border-[#13845B] transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#13845B] text-white flex items-center justify-center">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#073B2A] block">
                      Complaints Officer Portal
                    </span>
                    <span className="text-[11px] text-[#738078]">Yuvraj Buddha · Field Inspections, Complaints & Audits</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#738078] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Store Operators Portal */}
              <button
                onClick={() => {
                  setRoleSelectionModalOpen(false);
                  navigate("/store-login");
                }}
                className="w-full p-3.5 rounded-2xl bg-[#E6F8EF] border border-[#C7F1DC] hover:border-[#13845B] transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#073B2A] text-[#72D6A0] flex items-center justify-center">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-[#073B2A] block">
                      Store Operators Portal (All 10 Stores)
                    </span>
                    <span className="text-[11px] text-[#13845B] font-semibold">Select store & submit daily sales</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#13845B] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MANUAL CREDENTIALS LOGIN MODAL                           */}
      {/* ======================================================== */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-[#FFFDF8] border border-[#DDE5DC] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#073B2A] text-[#72D6A0] flex items-center justify-center font-bold">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Enter Credentials
                  </h3>
                  <p className="text-xs text-[#738078]">Sign in with authorized email and password</p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-lg text-[#738078] hover:bg-[#FAF7F0] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#073B2A] block">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-white text-xs text-[#18251F] focus:outline-none focus:border-[#13845B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#073B2A] block">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE5DC] bg-white text-xs text-[#18251F] focus:outline-none focus:border-[#13845B]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCredentials}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{isSubmittingCredentials ? "Authenticating..." : "Sign In to Workspace"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
