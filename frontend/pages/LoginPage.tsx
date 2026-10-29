import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DEMO_USERS } from "@/utils/auth-constants";
import {
  Shield,
  ShieldCheck,
  Camera,
  TrendingUp,
  MessageSquare,
  Flame,
  ArrowRight,
  Play,
  CheckCircle2,
  Video,
  FileCheck2,
  Lock,
  Layers,
  Store,
  Clock,
  Sparkles,
  Search,
  Check,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLoadingRole, setIsLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeModalRole, setActiveModalRole] = useState<"OFFICER" | "OWNER" | "FRANCHISE">("OFFICER");

  // Credentials form state
  const [emailInput, setEmailInput] = useState("officer@franchiseops.com");
  const [passwordInput, setPasswordInput] = useState("officer123");
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

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
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      navigate(targetRoute || (roleKey === "FRANCHISE" ? "/evidence" : "/"));
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
      navigate("/");
    } else {
      setErrorMessage(res.error || "Invalid email or password. Please use pre-filled demo accounts.");
    }
  };

  const openAuthWithRole = (role: "OFFICER" | "OWNER" | "FRANCHISE") => {
    setActiveModalRole(role);
    const matched = DEMO_USERS.find((u) => u.role === role);
    if (matched) {
      setEmailInput(matched.email);
      setPasswordInput(matched.passwordHash);
    }
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
      {/* 1. TOP NAVIGATION BAR (Light Theme)                      */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#F6F1E7]/90 backdrop-blur-md border-b border-[#DDE5DC] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#073B2A] text-[#72D6A0] shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#073B2A] leading-none">
                Franchise Standards Auditor
              </span>
              <span className="text-[11px] text-[#738078] font-medium tracking-wide">
                Compliance & Quality Intelligence
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#18251F]">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-[#073B2A] font-semibold hover:text-[#13845B] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("portals")}
              className="text-[#738078] hover:text-[#073B2A] transition-colors cursor-pointer"
            >
              Portals
            </button>
          </nav>

          {/* Right Action: Get Started / Sign In */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => openAuthWithRole("OFFICER")}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#073B2A] hover:bg-[#EAE3D2] rounded-lg cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#DDE5DC] bg-[#FFFDF8] px-4 py-4 space-y-3">
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("hero"); }}
              className="block w-full text-left py-1.5 text-sm font-semibold text-[#073B2A]"
            >
              Home
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("features"); }}
              className="block w-full text-left py-1.5 text-sm text-[#738078]"
            >
              Features
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("how-it-works"); }}
              className="block w-full text-left py-1.5 text-sm text-[#738078]"
            >
              How It Works
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); scrollToSection("portals"); }}
              className="block w-full text-left py-1.5 text-sm text-[#738078]"
            >
              Access Portals
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); openAuthWithRole("OFFICER"); }}
              className="w-full mt-2 text-xs font-semibold bg-[#073B2A] text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5"
            >
              <span>Sign In / Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 2. HERO SECTION (Warm Cream + Dark Green Headline)       */}
      {/* ======================================================== */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-[#F6F1E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Trust Badge / Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE3D2] border border-[#DDE5DC] text-xs font-medium text-[#073B2A]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#13845B]" />
                <span>Next-Gen Enterprise Franchise Governance</span>
              </div>

              {/* Large Serif Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#073B2A] font-bold tracking-tight leading-[1.1]">
                Smarter Audits. <br />
                <span className="italic font-serif font-normal text-[#13845B]">Stronger Franchises.</span>
              </h1>

              {/* Concise Description */}
              <p className="text-base sm:text-lg text-[#738078] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Automate store compliance, verify real CCTV video evidence, reconcile POS sales, and continuously protect your brand reputation across the entire network.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => openAuthWithRole("OFFICER")}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Start Free Audit</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold bg-[#FFFDF8] text-[#073B2A] border border-[#DDE5DC] hover:bg-[#FAF7F0] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="h-3.5 w-3.5 text-[#13845B] fill-[#13845B]" />
                  <span>Explore Capabilities</span>
                </button>
              </div>

              {/* Small Feature Indicators Under CTAs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#DDE5DC] text-xs font-medium text-[#18251F]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#13845B] shrink-0" />
                  <span>Image Verification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#13845B] shrink-0" />
                  <span>POS & Reports</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#13845B] shrink-0" />
                  <span>Reviews & Sentiment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#13845B] shrink-0" />
                  <span>Risk Score & Insights</span>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Visual Composition representing Store Audit */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl border border-[#DDE5DC] bg-[#FFFDF8] p-4 sm:p-6 shadow-xl space-y-4">
                {/* Audit Header Strip */}
                <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#E6F8EF] border border-[#C7F1DC] flex items-center justify-center text-[#073B2A] font-bold">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#073B2A]">
                          Lucknow Central Outlet
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#E6F8EF] text-[#073B2A] text-[10px] font-mono font-bold border border-[#C7F1DC]">
                          OUT-042
                        </span>
                      </div>
                      <p className="text-xs text-[#738078]">Hazratganj Main Flagship · Audited 04 Oct 2026</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#738078] block">Compliance Score</span>
                    <span className="font-serif text-2xl font-bold text-[#13845B]">94%</span>
                  </div>
                </div>

                {/* Simulated CCTV Evidence Screen with Real Hud */}
                <div className="relative rounded-2xl overflow-hidden border border-[#DDE5DC] bg-[#073B2A] aspect-video flex flex-col justify-between p-3.5 shadow-inner">
                  {/* Top HUD */}
                  <div className="flex items-center justify-between text-[11px] font-mono z-10">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-white border border-white/10">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>CAM-01: Kitchen Prep Counter</span>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[#72D6A0] font-bold border border-white/10">
                      REC 00:05:12
                    </div>
                  </div>

                  {/* Center HUD: Verification Target Crosshairs */}
                  <div className="my-auto mx-auto border border-[#72D6A0]/40 rounded-xl p-3 bg-black/40 backdrop-blur-xs text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white">
                      <ShieldCheck className="h-4 w-4 text-[#72D6A0]" />
                      <span>Packaging Double-Bag Seal: Verified</span>
                    </div>
                    <p className="text-[10px] font-mono text-[#CAD5C9]">
                      Cold-Storage Temperature probe: +3.2°C (Compliant)
                    </p>
                  </div>

                  {/* Bottom Telemetry HUD */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/90 z-10">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">FPS: 15.0</span>
                      <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10">1080p FHD</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-600/90 text-white font-bold">
                      GENUINE EXTRACTED FRAME
                    </span>
                  </div>
                </div>

                {/* 3 Metric Pills below frame */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDE5DC] text-center">
                    <span className="text-[10px] font-mono text-[#738078] block">POS Variance</span>
                    <span className="font-serif font-bold text-sm text-[#073B2A]">+0.4% (Normal)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDE5DC] text-center">
                    <span className="text-[10px] font-mono text-[#738078] block">Sentiment Rating</span>
                    <span className="font-serif font-bold text-sm text-[#13845B]">4.8 / 5.0 ★</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#DDE5DC] text-center">
                    <span className="text-[10px] font-mono text-[#738078] block">Composite Risk</span>
                    <span className="font-serif font-bold text-sm text-[#13845B]">14 (Low Risk)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURES SECTION (Dark Green Theme)                   */}
      {/* ======================================================== */}
      <section id="features" className="py-20 md:py-28 bg-[#073B2A] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#72D6A0] block">
              ENTERPRISE AUDIT CAPABILITIES
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Complete Visibility Across Every Franchise Node
            </h2>
            <p className="text-sm sm:text-base text-[#CAD5C9] font-sans">
              Four synchronized intelligence engines protecting brand consistency, food hygiene, revenue integrity, and operational standards.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Image Verification */}
            <div className="rounded-2xl p-6 bg-[#05291F] border border-[#0D4E39] hover:border-[#72D6A0]/50 transition-all space-y-4 hover:-translate-y-1 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#073B2A] text-[#72D6A0] border border-[#0D4E39] flex items-center justify-center font-bold">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  1. Image Verification
                </h3>
                <p className="text-xs text-[#CAD5C9] leading-relaxed">
                  Automatic extraction of authentic frames from uploaded CCTV surveillance recordings. Evaluates kitchen assembly hygiene, cold-chain temps, apron adherence, and packaging standards.
                </p>
              </div>

              <div className="pt-4 border-t border-[#0D4E39] text-[11px] font-mono text-[#72D6A0] flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                <span>Zero-synthetic genuine frames</span>
              </div>
            </div>

            {/* Card 2: POS & Reports Analysis */}
            <div className="rounded-2xl p-6 bg-[#05291F] border border-[#0D4E39] hover:border-[#72D6A0]/50 transition-all space-y-4 hover:-translate-y-1 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#073B2A] text-[#72D6A0] border border-[#0D4E39] flex items-center justify-center font-bold">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  2. POS & Reports Analysis
                </h3>
                <p className="text-xs text-[#CAD5C9] leading-relaxed">
                  Continuous reconciliation comparing commissary raw material shipments against recorded daily billing receipts. Surfaces unrecorded sales and inventory slippage.
                </p>
              </div>

              <div className="pt-4 border-t border-[#0D4E39] text-[11px] font-mono text-[#72D6A0] flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                <span>Deterministic discrepancy math</span>
              </div>
            </div>

            {/* Card 3: Reviews & Sentiment */}
            <div className="rounded-2xl p-6 bg-[#05291F] border border-[#0D4E39] hover:border-[#72D6A0]/50 transition-all space-y-4 hover:-translate-y-1 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#073B2A] text-[#72D6A0] border border-[#0D4E39] flex items-center justify-center font-bold">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  3. Reviews & Sentiment
                </h3>
                <p className="text-xs text-[#CAD5C9] leading-relaxed">
                  Monitors guest feedback across Google Maps, food delivery portals, and in-store complaints. Tracks quality sentiment spikes and customer escalation patterns.
                </p>
              </div>

              <div className="pt-4 border-t border-[#0D4E39] text-[11px] font-mono text-[#72D6A0] flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                <span>Real-time reputation alerts</span>
              </div>
            </div>

            {/* Card 4: Risk Score & Insights */}
            <div className="rounded-2xl p-6 bg-[#05291F] border border-[#0D4E39] hover:border-[#72D6A0]/50 transition-all space-y-4 hover:-translate-y-1 shadow-md flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-[#073B2A] text-[#72D6A0] border border-[#0D4E39] flex items-center justify-center font-bold">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-white">
                  4. Risk Score & Insights
                </h3>
                <p className="text-xs text-[#CAD5C9] leading-relaxed">
                  Calculates a weighted deterministic risk score (0-100) combining sales, visual evidence, customer grievances, and inventory variances into actionable audit priorities.
                </p>
              </div>

              <div className="pt-4 border-t border-[#0D4E39] text-[11px] font-mono text-[#72D6A0] flex items-center gap-2">
                <Check className="h-3.5 w-3.5" />
                <span>Weighted 6-factor algorithm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. HOW IT WORKS SECTION (Light Theme)                    */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#F6F1E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#13845B] block">
              WORKFLOW METHODOLOGY
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#073B2A]">
              From data to decisions in 4 simple steps.
            </h2>
            <p className="text-sm sm:text-base text-[#738078]">
              A continuous, closed-loop assurance framework transforming raw operational records into certified franchise excellence.
            </p>
          </div>

          {/* 4 Steps Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-4 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-[#13845B] px-2.5 py-1 rounded-md bg-[#E6F8EF] inline-block border border-[#C7F1DC]">
                STEP 01
              </span>
              <h3 className="font-serif text-xl font-bold text-[#073B2A]">
                Collect Data
              </h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Upload CCTV footage, store photographs, POS end-of-day reports, and commissary bills directly to the secure evidence vault.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-4 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-[#13845B] px-2.5 py-1 rounded-md bg-[#E6F8EF] inline-block border border-[#C7F1DC]">
                STEP 02
              </span>
              <h3 className="font-serif text-xl font-bold text-[#073B2A]">
                AI Analysis
              </h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Extract genuine video frames across custom durations and run deterministic discrepancy equations across stock and billing ledgers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-4 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-[#13845B] px-2.5 py-1 rounded-md bg-[#E6F8EF] inline-block border border-[#C7F1DC]">
                STEP 03
              </span>
              <h3 className="font-serif text-xl font-bold text-[#073B2A]">
                Get Insights
              </h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Display live compliance scores, detected deviations, risk breakdowns, and prioritized audit alerts on executive dashboards.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] space-y-4 shadow-xs relative">
              <span className="text-xs font-mono font-bold text-[#13845B] px-2.5 py-1 rounded-md bg-[#E6F8EF] inline-block border border-[#C7F1DC]">
                STEP 04
              </span>
              <h3 className="font-serif text-xl font-bold text-[#073B2A]">
                Take Action
              </h3>
              <p className="text-xs text-[#738078] leading-relaxed">
                Authorize compliance officers to confirm violations, assign statutory CAPA remediations, and verify corrective re-audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. ROLE PORTAL ACCESS & LOGIN SECTION                    */}
      {/* ======================================================== */}
      <section id="portals" className="py-20 md:py-28 bg-[#FFFDF8] border-t border-[#DDE5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="max-w-md mx-auto mb-8 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
              <Lock className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 3 Role Workspaces */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 2. Compliance Officer */}
            <div className="p-6 rounded-2xl bg-[#FAF7F0] border-2 border-[#13845B]/40 hover:border-[#13845B] transition-all flex flex-col justify-between space-y-5 shadow-xs group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#13845B] text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Compliance Officer
                  </h3>
                  <span className="text-[10px] font-mono text-[#13845B] font-semibold uppercase">Inspection & CCTV Audit</span>
                </div>
                <p className="text-xs text-[#738078] leading-relaxed">
                  Inspect authentic video frames, log photo decisions, assign ratings, and track CAPA tickets.
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin("OFFICER")}
                disabled={isLoadingRole !== null}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#13845B] text-white hover:bg-[#0E6847] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{isLoadingRole === "OFFICER" ? "Signing In..." : "Open Officer Portal"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 3. Franchisee Owner */}
            <div className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#DDE5DC] hover:border-[#073B2A] transition-all flex flex-col justify-between space-y-5 shadow-2xs group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#073B2A] text-white flex items-center justify-center font-bold">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Franchisee Owner
                  </h3>
                  <span className="text-[10px] font-mono text-[#738078] uppercase">Investor & Royalty ROI</span>
                </div>
                <p className="text-xs text-[#738078] leading-relaxed">
                  Gross merchandise value, royalty settlements, commissary supplies, and store ratings.
                </p>
              </div>

              <button
                onClick={() => handleQuickLogin("OWNER")}
                disabled={isLoadingRole !== null}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isLoadingRole === "OWNER" ? "Signing In..." : "Open Owner Portal"}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 4. Store Operations */}
            <div className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#DDE5DC] hover:border-[#073B2A] transition-all flex flex-col justify-between space-y-5 shadow-2xs group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#073B2A] text-white flex items-center justify-center font-bold">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#073B2A]">
                    Store Operations
                  </h3>
                  <span className="text-[10px] font-mono text-[#738078] uppercase">10 Registered Stores</span>
                </div>
                <p className="text-xs text-[#738078] leading-relaxed">
                  Select your specific outlet from all 10 registered stores, authenticate with store credentials, and manage sales invoices.
                </p>
              </div>

              <button
                onClick={() => navigate("/store-login")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#073B2A] text-white hover:bg-[#05291F] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Store Login (All 10 Stores)</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Credentials Sign-in Link */}
          <div className="mt-10 text-center">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs text-[#738078] hover:text-[#073B2A] underline underline-offset-4 cursor-pointer"
            >
              Prefer to enter email & password manually? Click here
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. MODAL: MANUAL CREDENTIALS SIGN-IN DIALOG              */}
      {/* ======================================================== */}
      {authModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setAuthModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 sm:p-8 shadow-2xl space-y-5 my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DDE5DC] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#073B2A]">
                  Franchise Standards Sign-In
                </h3>
                <p className="text-xs text-[#738078] mt-0.5">
                  Enter your credentials or choose a quick role below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-lg text-[#738078] hover:text-[#073B2A] hover:bg-[#FAF7F0] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Role Fill Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#738078] font-semibold block">
                Quick Preset:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["OFFICER", "OWNER", "FRANCHISE"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => openAuthWithRole(r)}
                    className={`py-1.5 px-2 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      activeModalRole === r
                        ? "bg-[#073B2A] text-white border-[#073B2A]"
                        : "bg-[#FAF7F0] text-[#18251F] border-[#DDE5DC] hover:bg-[#EAE3D2]"
                    }`}
                  >
                    {r === "FRANCHISE" ? "STORE" : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleManualLogin} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#18251F]">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[#DDE5DC] bg-white text-xs text-[#18251F] focus:outline-none focus:ring-2 focus:ring-[#073B2A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#18251F]">Password</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[#DDE5DC] bg-white text-xs text-[#18251F] focus:outline-none focus:ring-2 focus:ring-[#073B2A]"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmittingCredentials}
                className="w-full h-11 bg-[#073B2A] hover:bg-[#05291F] text-white font-semibold rounded-xl text-xs shadow-xs"
              >
                {isSubmittingCredentials ? "Authenticating..." : "Sign In to Workspace"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. QUIET MINIMAL FOOTER                                  */}
      {/* ======================================================== */}
      <footer className="py-12 bg-[#05291F] text-white border-t border-[#0D4E39]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#13845B] text-[#72D6A0]">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-serif font-bold text-sm tracking-tight text-white">
              Franchise Standards Auditor
            </span>
          </div>

          <p className="text-xs text-[#CAD5C9]">
            © 2026 Franchise Standards Auditor Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs text-[#CAD5C9]">
            <button onClick={() => scrollToSection("hero")} className="hover:text-white cursor-pointer">Back to top</button>
            <button onClick={() => openAuthWithRole("OFFICER")} className="hover:text-white cursor-pointer">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
