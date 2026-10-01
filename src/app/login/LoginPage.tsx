import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { DEMO_USERS } from "@/lib/auth";
import { UserRole } from "@/types";
import {
  Building2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Store,
  Crown,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("officer.sen@aurafoods.com");
  const [password, setPassword] = useState("officer123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "Authentication failed");
    }
  };

  const handleSelectDemoUser = (demoUser: (typeof DEMO_USERS)[0]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.passwordHash);
    setError(null);
  };

  const roleMeta: Record<
    UserRole,
    { label: string; icon: React.ComponentType<{ className?: string }>; color: string; desc: string }
  > = {
    ADMIN: {
      label: "System Admin",
      icon: Crown,
      color: "bg-purple-100 text-purple-700 border-purple-200",
      desc: "Full organization authority, user management, and configuration controls",
    },
    OWNER: {
      label: "Franchise Owner",
      icon: Building2,
      color: "bg-blue-100 text-blue-700 border-blue-200",
      desc: "Executive P&L, EBITDA, risk intelligence, and network comparisons (read-only)",
    },
    FRANCHISE: {
      label: "Franchise Partner",
      icon: Store,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      desc: "Single-outlet scope: sales submission, inventory counts, evidence uploads",
    },
    OFFICER: {
      label: "Compliance Officer",
      icon: ShieldCheck,
      color: "bg-amber-100 text-amber-700 border-amber-200",
      desc: "Inspection review, CCTV AI verification, CAPA remediation, and case closure",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900">
          <Building2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          FranchiseIQ Enterprise Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          AI-Assisted Performance & Compliance Monitoring SaaS
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Main Credentials Card (3 cols) */}
          <Card className="md:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Sign in to your account</CardTitle>
              <CardDescription>Enter your credentials or click any demo profile</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {user && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 p-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>Currently logged in as <strong>{user.name}</strong> ({user.role})</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[11px] px-2"
                    onClick={() => navigate("/")}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.sen@aurafoods.com"
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-xs font-semibold py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Sign In to Workspace"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Demo Role Selector (2 cols) */}
          <Card className="md:col-span-2 bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                1-Click Demo Profiles
              </CardTitle>
              <CardDescription className="text-[11px]">
                Switch roles to evaluate distinct RBAC permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {DEMO_USERS.map((demo) => {
                const meta = roleMeta[demo.role];
                const Icon = meta.icon;
                const isSelected = email === demo.email;

                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(demo)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? "border-slate-900 bg-white shadow-xs dark:border-slate-100"
                        : "border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                        <Icon className="h-3.5 w-3.5" />
                        <span>{demo.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium ${meta.color}`}>
                        {demo.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{meta.desc}</p>
                    {demo.assignedOutletName && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded inline-block">
                        Scope: {demo.assignedOutletName}
                      </span>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* RBAC Matrix Explainer Card */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Role-Based Access Enforcement Matrix:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
            <div className="space-y-1">
              <span className="font-bold text-purple-700">ADMIN</span>
              <p className="text-slate-500">Full system access, manage outlets and users, view all enterprise reports.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-blue-700">OWNER</span>
              <p className="text-slate-500">View revenue, EBITDA, KPIs, and compare outlets. Read-only for operational data.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-emerald-700">FRANCHISE</span>
              <p className="text-slate-500">Strictly isolated to assigned outlet. Submits daily sales and physical stock counts.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-700">OFFICER</span>
              <p className="text-slate-500">Audits compliance, inspects CCTV frames, confirms AI hints, and issues CAPA.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
