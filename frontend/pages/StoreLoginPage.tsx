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
    <div className="min-h-screen bg-[#050B1A]/95 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Top Bar Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A1224] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Back to all portals"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-tight text-white">
                  Store Operations Access
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400 bg-emerald-950/40">
                  Single-Store Isolated
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                AI-Assisted Franchise Performance & Compliance Monitoring
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
        >
          <span>All Portals</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto w-full my-auto py-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Unit Authentication Gate
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
            Select Your <span className="italic text-emerald-400">Assigned Store</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Please choose your specific store from the complete network directory below. Access is partitioned strictly to the selected location.
          </p>
        </div>

        {/* Global Error */}
        {errorMessage && (
          <div className="mb-6 max-w-md mx-auto flex items-center gap-2.5 rounded-lg bg-red-950/80 border border-red-700/60 p-3 text-xs text-red-200">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
          {/* Left Column: Store Outlet Code Entry & Network Stores (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Enter Store Outlet Code Section (ABOVE Available Stores) */}
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0A1428] p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Enter Store Outlet Code</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Direct Code Access</span>
              </div>
              <p className="text-[11px] text-slate-300">
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
                  className="bg-slate-900/90 border-slate-700 text-white font-mono text-xs h-10 uppercase flex-1 focus:border-emerald-500"
                />
                <Button
                  type="button"
                  onClick={handleQuickEnterCustom}
                  disabled={!customOutletCode.trim() || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 px-4 rounded-lg cursor-pointer shrink-0 transition-colors gap-1.5 disabled:opacity-50"
                >
                  <span>{isSubmitting && customOutletCode.trim() ? "Entering..." : "Enter Store →"}</span>
                </Button>
              </div>
            </div>

            {/* 2. Available Stores Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Available Stores ({ALL_NETWORK_STORES.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
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
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/60"
                          : "border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {outlet.code}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-slate-700 text-slate-300 py-0"
                          >
                            {outlet.city}
                          </Badge>
                        </div>
                        <div className="text-xs font-semibold text-white truncate">
                          {outlet.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                          <span>{outlet.model} Model · {outlet.activeStaff} Staff</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Mgr: {outlet.manager}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickEnterStore(outlet);
                          }}
                          disabled={isSubmitting}
                          className="text-[10px] font-bold text-emerald-400 hover:text-white px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-600 transition-colors cursor-pointer"
                        >
                          Enter →
                        </button>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 absolute top-3 right-3" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card (5 cols) */}
          <div className="lg:col-span-5 rounded-[28px] border border-white/10 bg-[#0A1224] p-6 shadow-2xl space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                  Single-Store Login
                </span>
                <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  {customOutletCode.trim()
                    ? `Outlet ${customOutletCode.trim()}`
                    : selectedOutlet
                    ? `Outlet ${selectedOutlet.code}`
                    : "No Store Selected"}
                </Badge>
              </div>
              <h2 className="font-serif text-lg font-bold text-white">
                Authorize Store Session
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedOutlet || customOutletCode.trim()
                  ? `Selected: ${customOutletCode.trim() || selectedOutlet?.name}`
                  : "Please select a store on the left to proceed."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Active Outlet Assignment
                </label>
                <div className="rounded-lg bg-slate-900/90 border border-slate-700 px-3 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>
                    {customOutletCode.trim() || selectedOutlet?.code || "— None Selected —"}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans truncate max-w-[160px]">
                    {customOutletCode.trim()
                      ? "Custom Outlet"
                      : selectedOutlet
                      ? selectedOutlet.name
                      : "Click a store to select"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Store Operator Email / ID
                </label>
                <Input
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  placeholder="Select store or enter email"
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Operator Access Key / PIN
                </label>
                <Input
                  type="password"
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-900 border-slate-700 text-white text-xs h-9 font-mono"
                  required
                />
              </div>

              {/* Single Store Isolation Notice */}
              <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/50 p-2.5 text-[11px] text-emerald-200/90 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                  <Lock className="h-3 w-3 shrink-0" />
                  <span>Strict Single-Store Boundary</span>
                </div>
                <p className="text-[10px] leading-relaxed text-emerald-200/80">
                  You will only be able to view and manage this store. Accessing or changing the URL to another store is automatically blocked.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || (!selectedOutlet && !customOutletCode.trim())}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs h-10 shadow-md shadow-emerald-900/40 cursor-pointer gap-2"
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
