import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ALL_NETWORK_STORES, StoreOutletInfo } from "@/utils/stores-data";

export default function StoreLoginPage() {
  const { loginStore } = useAuth();
  const navigate = useNavigate();

  // Do NOT pre-select Lucknow Central or any store automatically
  const [selectedOutlet, setSelectedOutlet] = useState<StoreOutletInfo | null>(null);
  const [customOutletCode, setCustomOutletCode] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [accessPin, setAccessPin] = useState("store123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPreset = (outlet: StoreOutletInfo) => {
    setSelectedOutlet(outlet);
    setCustomOutletCode("");
    setOperatorEmail(outlet.email);
    setAccessPin("store123");
    setErrorMessage(null);
  };

  const handleQuickEnterStore = async (outlet: StoreOutletInfo) => {
    setSelectedOutlet(outlet);
    setCustomOutletCode("");
    setOperatorEmail(outlet.email);
    setErrorMessage(null);
    setIsSubmitting(true);

    const targetCode = outlet.code.toUpperCase();
    const targetName = `${outlet.name} (${outlet.city})`;

    const res = await loginStore(targetCode, targetName, outlet.email, "store123");
    setIsSubmitting(false);

    if (res.success) {
      navigate("/evidence");
    } else {
      setErrorMessage(res.error || "Store authentication failed. Please verify credentials.");
    }
  };

  const handleQuickEnterCustom = async () => {
    const code = customOutletCode.trim().toUpperCase();
    if (!code) {
      setErrorMessage("Please enter a Store Outlet Code.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    const targetName = `Outlet ${code}`;
    const email = operatorEmail.trim() || `store.${code.toLowerCase()}@franchiseops.com`;
    const res = await loginStore(code, targetName, email, accessPin || "store123");
    setIsSubmitting(false);

    if (res.success) {
      navigate("/evidence");
    } else {
      setErrorMessage(res.error || "Store authentication failed. Please verify credentials.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetCode = (customOutletCode.trim() || selectedOutlet?.code || "").toUpperCase();
    if (!targetCode) {
      setErrorMessage("Please select a store to continue.");
      return;
    }

    setIsSubmitting(true);
    const targetName = customOutletCode.trim()
      ? `Outlet ${targetCode}`
      : selectedOutlet
      ? `${selectedOutlet.name} (${selectedOutlet.city})`
      : `Store ${targetCode}`;

    const email = operatorEmail.trim() || `store.${targetCode.toLowerCase()}@franchiseops.com`;
    const res = await loginStore(targetCode, targetName, email, accessPin);
    setIsSubmitting(false);

    if (res.success) {
      navigate("/evidence");
    } else {
      setErrorMessage(res.error || "Store authentication failed. Please verify credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#18251F] flex flex-col justify-between antialiased selection:bg-[#073B2A] selection:text-white relative overflow-hidden">
      {/* Full-Width Top Bar Navigation */}
      <header className="w-full border-b border-[#DDE5DC] bg-[#FFFDF8]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFFDF8] border border-[#DDE5DC] text-[#738078] hover:text-[#073B2A] hover:border-[#073B2A]/30 transition-colors cursor-pointer"
              title="Back to all portals"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#073B2A] text-white shadow-sm">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base tracking-tight text-[#073B2A]">
                    Store Operations Access
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-[#13845B]/30 text-[#073B2A] bg-[#13845B]/10">
                    Single-Store Isolated
                  </Badge>
                </div>
                <p className="text-[11px] text-[#738078]">
                  Franchise Standards Auditor · Operational Unit Gate
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/login"
            className="text-xs text-[#073B2A] hover:text-[#13845B] flex items-center gap-1 font-semibold transition-colors"
          >
            <span>All Portals</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#073B2A] bg-[#073B2A]/5 border border-[#073B2A]/15 px-3 py-1 rounded-full font-semibold">
            Unit Authentication Gate
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#073B2A]">
            Select Your <span className="italic">Assigned Store</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#738078]">
            Choose your specific store outlet below. Operator sessions are partitioned strictly to the authorized location.
          </p>
        </div>

        {/* Global Error */}
        {errorMessage && (
          <div className="mb-6 max-w-md mx-auto flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800 shadow-sm">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
          {/* Left Column: Store Outlet Code Entry & Network Stores (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Enter Store Outlet Code Section */}
            <div className="rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#073B2A] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#13845B]" />
                  <span>Enter Store Outlet Code</span>
                </label>
                <span className="text-[10px] text-[#738078] font-mono">Direct Code Access</span>
              </div>
              <p className="text-[12px] text-[#738078]">
                Have a specific outlet code? Enter it below to access your store portal directly:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
                <Input
                  type="text"
                  placeholder="e.g. OUT-042, OUT-089, OUT-114..."
                  value={customOutletCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setCustomOutletCode(val);
                    if (val) {
                      setSelectedOutlet(null);
                      setOperatorEmail(`store.${val.toLowerCase()}@franchiseops.com`);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customOutletCode.trim()) {
                      e.preventDefault();
                      handleQuickEnterCustom();
                    }
                  }}
                  className="bg-white border-[#DDE5DC] text-[#18251F] font-mono text-xs h-10 uppercase flex-1 focus:border-[#073B2A]"
                />
                <Button
                  type="button"
                  onClick={handleQuickEnterCustom}
                  disabled={!customOutletCode.trim() || isSubmitting}
                  className="bg-[#073B2A] hover:bg-[#05291F] text-white font-semibold text-xs h-10 px-5 rounded-lg cursor-pointer shrink-0 transition-colors gap-1.5 disabled:opacity-50"
                >
                  <span>{isSubmitting && customOutletCode.trim() ? "Entering..." : "Enter Store →"}</span>
                </Button>
              </div>
            </div>

            {/* 2. Available Stores Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#073B2A]">
                  Available Stores ({ALL_NETWORK_STORES.length})
                </span>
                <span className="text-[11px] text-[#738078] font-mono">
                  Click any store to select or enter directly
                </span>
              </div>

              {/* Display ALL available stores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {ALL_NETWORK_STORES.map((outlet) => {
                  const isSelected =
                    !customOutletCode && selectedOutlet?.code === outlet.code;
                  return (
                    <div
                      key={outlet.code}
                      onClick={() => handleSelectPreset(outlet)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "border-[#073B2A] bg-[#FFFDF8] shadow-md ring-2 ring-[#073B2A]/20"
                          : "border-[#DDE5DC] bg-[#FFFDF8] hover:border-[#073B2A]/40 hover:shadow-sm"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-[#073B2A]">
                            {outlet.code}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-[#DDE5DC] text-[#738078] bg-[#F6F1E7] py-0"
                          >
                            {outlet.city}
                          </Badge>
                        </div>
                        <div className="text-xs font-bold text-[#18251F] truncate">
                          {outlet.name}
                        </div>
                        <div className="text-[11px] text-[#738078] mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-[#13845B] shrink-0" />
                          <span>{outlet.model} Model · {outlet.activeStaff} Staff</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-[#DDE5DC] flex items-center justify-between">
                        <span className="text-[10px] text-[#738078] font-mono">
                          Mgr: {outlet.manager}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickEnterStore(outlet);
                          }}
                          disabled={isSubmitting}
                          className="text-[11px] font-bold text-[#073B2A] hover:text-white px-2.5 py-1 rounded-md bg-[#073B2A]/10 border border-[#073B2A]/20 hover:bg-[#073B2A] transition-colors cursor-pointer"
                        >
                          Enter →
                        </button>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-[#13845B] absolute top-3.5 right-3.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-6 shadow-md space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-[#13845B] font-bold uppercase tracking-wider">
                  Single-Store Login
                </span>
                <Badge className="bg-[#073B2A]/10 text-[#073B2A] border-[#073B2A]/20 text-[10px] font-mono">
                  {customOutletCode.trim()
                    ? `Outlet ${customOutletCode.trim()}`
                    : selectedOutlet
                    ? `Outlet ${selectedOutlet.code}`
                    : "No Store Selected"}
                </Badge>
              </div>
              <h2 className="font-serif text-xl font-normal text-[#073B2A]">
                Authorize Store Session
              </h2>
              <p className="text-xs text-[#738078] mt-1">
                {selectedOutlet || customOutletCode.trim()
                  ? `Selected: ${customOutletCode.trim() || selectedOutlet?.name}`
                  : "Please select a store on the left to proceed."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#18251F] mb-1">
                  Active Outlet Assignment
                </label>
                <div className="rounded-lg bg-[#F6F1E7] border border-[#DDE5DC] px-3 py-2.5 text-xs font-mono text-[#073B2A] font-semibold flex items-center justify-between">
                  <span>
                    {customOutletCode.trim() || selectedOutlet?.code || "— None Selected —"}
                  </span>
                  <span className="text-[11px] text-[#738078] font-sans truncate max-w-[160px] font-normal">
                    {customOutletCode.trim()
                      ? "Custom Outlet"
                      : selectedOutlet
                      ? selectedOutlet.name
                      : "Click a store to select"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#18251F] mb-1">
                  Store Operator Email / ID
                </label>
                <Input
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  placeholder="Select store or enter email"
                  className="bg-white border-[#DDE5DC] text-[#18251F] text-xs h-9.5 focus:border-[#073B2A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#18251F] mb-1">
                  Operator Access Key / PIN
                </label>
                <Input
                  type="password"
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border-[#DDE5DC] text-[#18251F] text-xs h-9.5 font-mono focus:border-[#073B2A]"
                  required
                />
              </div>

              {/* Single Store Isolation Notice */}
              <div className="rounded-xl bg-[#073B2A]/5 border border-[#073B2A]/15 p-3 text-xs text-[#073B2A] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[#13845B]" />
                  <span>Strict Single-Store Boundary</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#738078]">
                  You will only be able to view and manage this store. Accessing or changing the URL to another store is automatically blocked.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || (!selectedOutlet && !customOutletCode.trim())}
                className="w-full bg-[#073B2A] hover:bg-[#05291F] disabled:opacity-50 text-white font-semibold text-xs h-10 shadow-sm cursor-pointer gap-2"
              >
                {isSubmitting ? (
                  <span>Verifying Store Authority...</span>
                ) : selectedOutlet || customOutletCode.trim() ? (
                  <>
                    <span>Enter Store Dashboard ({customOutletCode.trim() || selectedOutlet?.name})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <span>Please Select a Store Above</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Full-Width Footer */}
      <footer className="w-full border-t border-[#DDE5DC] bg-[#FFFDF8]/80 relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#738078] gap-2 max-w-7xl mx-auto">
          <span>© 2026 Franchise Standards Auditor. Enterprise Compliance & Performance System.</span>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="text-[#073B2A] font-semibold">Deterministic CCTV Pipeline</span>
            <span className="text-[#DDE5DC]">•</span>
            <span className="text-[#073B2A] font-semibold">Single-Store Isolation</span>
            <span className="text-[#DDE5DC]">•</span>
            <span className="text-[#073B2A] font-semibold">ISO 27001 Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
