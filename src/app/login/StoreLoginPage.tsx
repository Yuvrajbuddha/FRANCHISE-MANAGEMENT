import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Store,
  Building2,
  Lock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  KeyRound,
  FileSpreadsheet,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Representative outlets available across network for fast selection or demo
const OUTLETS_LIST = [
  {
    code: "OUT-042",
    name: "Hazratganj Flagship",
    city: "Lucknow",
    model: "FOCO",
    manager: "Store Operator",
    email: "store.lucknow@franchiseops.com",
    activeStaff: 14,
  },
  {
    code: "OUT-089",
    name: "Sector 18 Market",
    city: "Noida",
    model: "COCO",
    manager: "Store Operator",
    email: "store.noida@franchiseops.com",
    activeStaff: 18,
  },
  {
    code: "OUT-114",
    name: "Koramangala 5th Block",
    city: "Bengaluru",
    model: "FOCO",
    manager: "Store Operator",
    email: "store.blr@franchiseops.com",
    activeStaff: 16,
  },
  {
    code: "OUT-019",
    name: "Connaught Place Inner",
    city: "Delhi",
    model: "COCO",
    manager: "Store Operator",
    email: "store.delhi@franchiseops.com",
    activeStaff: 22,
  },
  {
    code: "OUT-055",
    name: "FC Road Corner",
    city: "Pune",
    model: "COCO",
    manager: "Store Operator",
    email: "store.pune@franchiseops.com",
    activeStaff: 12,
  },
  {
    code: "OUT-073",
    name: "MI Road Heritage",
    city: "Jaipur",
    model: "FOCO",
    manager: "Store Operator",
    email: "store.jaipur@franchiseops.com",
    activeStaff: 15,
  },
];

export default function StoreLoginPage() {
  const { loginStore } = useAuth();
  const navigate = useNavigate();

  const [selectedOutlet, setSelectedOutlet] = useState(OUTLETS_LIST[0]);
  const [customOutletCode, setCustomOutletCode] = useState("");
  const [operatorEmail, setOperatorEmail] = useState(OUTLETS_LIST[0].email);
  const [accessPin, setAccessPin] = useState("store123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPreset = (outlet: (typeof OUTLETS_LIST)[0]) => {
    setSelectedOutlet(outlet);
    setCustomOutletCode("");
    setOperatorEmail(outlet.email);
    setAccessPin("store123");
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const targetCode = (customOutletCode.trim() || selectedOutlet.code).toUpperCase();
    const targetName = customOutletCode.trim()
      ? `Outlet ${targetCode}`
      : `${selectedOutlet.name} (${selectedOutlet.city})`;

    const res = await loginStore(targetCode, targetName, operatorEmail, accessPin);
    setIsSubmitting(false);

    if (res.success) {
      // Direct navigation straight into this specific outlet's dossier!
      navigate(`/outlets/${targetCode}`);
    } else {
      setErrorMessage(res.error || "Store authentication failed. Please verify credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050B1A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A1224] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
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
      <main className="max-w-5xl mx-auto w-full my-auto py-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Unit Authentication Gate
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
            Sign In to Your <span className="italic text-emerald-400">Assigned Store</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            For security, each store operator can access only one store. Choose or enter your outlet code below.
          </p>
        </div>

        {/* Global Error */}
        {errorMessage && (
          <div className="mb-6 max-w-md mx-auto flex items-center gap-2.5 rounded-lg bg-red-950/80 border border-red-700/60 p-3 text-xs text-red-200">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-4xl mx-auto">
          {/* Left Column: Preset Store Outlets (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select Store / Outlet Location
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Click any store to auto-fill
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {OUTLETS_LIST.map((outlet) => {
                const isSelected =
                  !customOutletCode && selectedOutlet.code === outlet.code;
                return (
                  <button
                    key={outlet.code}
                    type="button"
                    onClick={() => handleSelectPreset(outlet)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50"
                        : "border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {outlet.code}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-slate-700 text-slate-400 py-0"
                      >
                        {outlet.city}
                      </Badge>
                    </div>
                    <div className="text-xs font-medium text-white truncate">
                      {outlet.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>{outlet.model} Model · {outlet.activeStaff} Staff</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 absolute top-3 right-3" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Outlet Code Option */}
            <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3">
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                Or enter another custom Store Outlet Code:
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. OUT-101, OUT-077"
                  value={customOutletCode}
                  onChange={(e) => {
                    setCustomOutletCode(e.target.value.toUpperCase());
                    if (e.target.value) {
                      setOperatorEmail(`store.${e.target.value.toLowerCase()}@franchiseops.com`);
                    }
                  }}
                  className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-9 uppercase"
                />
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
                  Outlet {customOutletCode.trim() || selectedOutlet.code}
                </Badge>
              </div>
              <h2 className="font-serif text-lg font-bold text-white">
                Authorize Store Session
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Access is strictly partitioned to this single outlet.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Active Outlet Assignment
                </label>
                <div className="rounded-lg bg-slate-900/90 border border-slate-700 px-3 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>{customOutletCode.trim() || selectedOutlet.code}</span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    {customOutletCode.trim() ? "Custom Outlet" : selectedOutlet.name}
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
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 shadow-md shadow-emerald-900/40 cursor-pointer gap-2"
              >
                {isSubmitting ? (
                  <span>Verifying Store Authority...</span>
                ) : (
                  <>
                    <span>Enter Store Portal ({customOutletCode.trim() || selectedOutlet.code})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
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
