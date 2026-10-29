import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
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
    const res = await login(cleanUsername, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate("/");
    } else {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#18251F] flex flex-col justify-between antialiased selection:bg-[#073B2A] selection:text-white relative font-sans">
      {/* Top Header */}
      <header className="w-full border-b border-[#DDE5DC] bg-[#FFFDF8]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#738078] hover:text-[#073B2A] transition-colors mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#073B2A] text-[#72D6A0]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-[#073B2A] block leading-tight">
                Franchise Standards Auditor
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#13845B] font-semibold">
                Franchisee Owner Portal
              </span>
            </div>
          </div>

          <Badge variant="outline" className="border-[#DDE5DC] text-[#073B2A] bg-[#FAF7F0] text-[10px] font-mono">
            SECURE ACCESS
          </Badge>
        </div>
      </header>

      {/* Main Centered Login Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md rounded-2xl border border-[#DDE5DC] bg-[#FFFDF8] p-7 sm:p-9 shadow-xl space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F8EF] border border-[#C7F1DC] text-[#073B2A]">
              <UserCheck className="h-6 w-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#073B2A] tracking-tight pt-2">
              Franchisee Sign In
            </h1>
            <p className="text-xs text-[#738078]">
              Authorized franchisee investor and store owner credential checkpoint.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#18251F]">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (Yash)"
                className="bg-[#FFFDF8] border-[#DDE5DC] text-[#18251F] text-xs h-10"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#18251F]">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="bg-[#FFFDF8] border-[#DDE5DC] text-[#18251F] text-xs h-10 font-mono"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#073B2A] hover:bg-[#05291F] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer gap-2 mt-2"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In to Franchisee Portal"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Helper hint */}
          <div className="pt-4 border-t border-[#DDE5DC] text-center text-[11px] text-[#738078]">
            <span>Demo credentials: username: </span>
            <strong className="text-[#073B2A]">Yash</strong>
            <span> · password: </span>
            <strong className="text-[#073B2A]">0000</strong>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#DDE5DC] bg-[#FAF7F0] py-4 text-center text-xs text-[#738078]">
        © 2026 Franchise Standards Auditor. All rights reserved.
      </footer>
    </div>
  );
}
