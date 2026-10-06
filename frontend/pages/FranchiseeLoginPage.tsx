import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Lock,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function FranchiseeLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim();

    // Strict validation: Username must be Yash, Password must be 0000
    if (cleanUsername.toLowerCase() !== "yash" || password !== "0000") {
      setErrorMessage("Invalid username or password");
      return;
    }

    setIsSubmitting(true);
    // Authenticate through AuthContext/API
    const res = await login(cleanUsername, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate("/");
    } else {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#050B1A]/95 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Bar Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A1224] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Back to all portals"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base tracking-tight text-white">
                  Franchisee Portal Access
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-indigo-500/30 text-indigo-400 bg-indigo-950/40">
                  Owner Authentication
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
      <main className="max-w-md mx-auto w-full my-auto py-10 relative z-10">
        <div className="text-center mb-8 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Unit Authentication Gate
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white">
            Franchisee <span className="italic text-indigo-400">Owner Login</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your Franchisee Owner credentials to access your multi-store operational dashboard.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-rose-950/80 border border-rose-700/60 p-3.5 text-xs text-rose-200 shadow-md">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="rounded-[28px] border border-white/10 bg-[#0A1224] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase">
                Owner Credentials
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Lock className="h-3 w-3 text-indigo-400" />
                <span>Protected Session</span>
              </div>
            </div>
            <h2 className="font-serif text-lg font-bold text-white">
              Authorize Owner Access
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Username
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white text-xs h-10 px-3.5 rounded-xl placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field (Masked while typing) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white text-xs h-10 px-3.5 rounded-xl placeholder:text-slate-500 font-mono tracking-widest focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="rounded-xl bg-indigo-950/30 border border-indigo-900/40 p-3 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <UserCheck className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span>Franchisee Executive Access</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Multi-store territory overview, regional performance analytics, and store compliance monitoring.
              </p>
            </div>

            {/* Submit / Login Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !username.trim() || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs h-11 rounded-xl shadow-lg shadow-indigo-900/30 cursor-pointer gap-2 transition-all mt-2 uppercase tracking-wider"
            >
              <span>{isSubmitting ? "Authenticating..." : "Login / Continue →"}</span>
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 relative z-10">
        <span>© 2026 AI-Assisted Franchise Performance & Compliance Monitoring. Confidential & Proprietary.</span>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-slate-300 font-semibold">Franchisee Owner Desk</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-300 font-semibold">Zero External Desk</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-300 font-semibold">ISO 27001 Rely</span>
        </div>
      </footer>
    </div>
  );
}
