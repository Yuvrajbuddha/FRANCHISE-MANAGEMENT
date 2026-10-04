import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
  Store,
  Search,
  Filter,
  Building,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  UserCheck,
  Phone,
  Mail,
  RefreshCw,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface OutletRecord {
  id: number;
  outletId: string;
  name: string;
  city: string;
  state: string;
  address: string;
  operatingModel: string; // 'COCO' | 'FOCO'
  status: string; // 'Active' | 'Under Audit' | 'Grace Period' | 'Notice Issued' | 'Critical Escalation'
  assignedFranchiseUser: string;
  assignedFranchiseEmail: string;
  manager: string;
  contactPhone: string;
  contactEmail: string;
  openedDate: string;
  complianceScore: number;
  riskScore: number;
  revenueMonthly: string;
  ebitdaMargin: string;
}

const CITIES = [
  "All Cities",
  "Delhi",
  "Noida",
  "Gurgaon",
  "Lucknow",
  "Kanpur",
  "Jaipur",
  "Varanasi",
  "Mumbai",
  "Pune",
  "Bengaluru",
];

const MODELS = ["All Models", "COCO", "FOCO"];

const STATUSES = [
  "All Statuses",
  "Active",
  "Under Audit",
  "Grace Period",
  "Notice Issued",
  "Critical Escalation",
];

export default function OutletsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [outlets, setOutlets] = useState<OutletRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedModel, setSelectedModel] = useState("All Models");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const isFranchiseRole = user?.role === "FRANCHISE";

  const fetchOutlets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedCity !== "All Cities") params.append("city", selectedCity);
      if (selectedModel !== "All Models") params.append("model", selectedModel);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);

      const res = await fetch(`/api/outlets?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch outlets.");
      }

      setOutlets(data.outlets || []);
      setIsRestricted(!!data.restricted);
      setRestrictionReason(data.reason || "");
    } catch (err: any) {
      setError(err.message || "Failed to connect to PostgreSQL database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, [selectedCity, selectedModel, selectedStatus]);

  // Client-side search for instantaneous responsiveness
  const filteredOutlets = useMemo(() => {
    if (!searchQuery.trim()) return outlets;
    const q = searchQuery.toLowerCase().trim();
    return outlets.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.outletId.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.manager.toLowerCase().includes(q) ||
        o.assignedFranchiseUser.toLowerCase().includes(q)
    );
  }, [outlets, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
            Active
          </Badge>
        );
      case "Under Audit":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
            Under Audit
          </Badge>
        );
      case "Grace Period":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
            Grace Period
          </Badge>
        );
      case "Notice Issued":
        return (
          <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30">
            Notice Issued
          </Badge>
        );
      case "Critical Escalation":
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30">
            Critical Escalation
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
            Network Directory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-slate-100">
            Outlet Registry & <span className="italic text-indigo-400">Operations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-unit franchise monitoring, operating models (COCO/FOCO), and deterministic compliance.
          </p>
        </div>
      </div>

      {/* Franchise User Scope Notice (Enforcing: A franchise user must only see their assigned outlet) */}
      {isFranchiseRole && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-emerald-900 dark:text-emerald-200 text-xs">
          <Lock className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm">
              Franchise Single-Store Partition Enforced
            </span>
            <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              Your account is strictly isolated to your designated store location (<strong>{user?.assignedOutletId}</strong>). In accordance with enterprise RBAC privacy protocols, other network outlets are hidden from your session.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar (Only shown for multi-store roles) */}
      {!isFranchiseRole && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name, code, manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* City Filter */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "All Cities" ? "Filter by City: All" : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Filter */}
            <div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m === "All Models" ? "Filter by Model: All" : `${m} (Model)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "All Statuses" ? "Filter by Status: All" : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active summary counts */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Showing {filteredOutlets.length} of {outlets.length} outlets</span>
            {(selectedCity !== "All Cities" ||
              selectedModel !== "All Models" ||
              selectedStatus !== "All Statuses" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCity("All Cities");
                  setSelectedModel("All Models");
                  setSelectedStatus("All Statuses");
                  setSearchQuery("");
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-sm">Fetching verified outlets...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            <AlertCircle className="h-4 w-4" />
            <span>Database Query Error</span>
          </div>
          <p>{error}</p>
        </div>
      )}

      {/* Empty results state */}
      {!loading && !error && filteredOutlets.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3">
          <Store className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Outlets Match the Selected Criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, clearing status filters, or switching city boundaries.
          </p>
        </div>
      )}

      {/* Outlets Cards Grid */}
      {!loading && !error && filteredOutlets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOutlets.map((outlet) => (
            <Card
              key={outlet.outletId}
              className="border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {outlet.outletId}
                    </span>
                    <Badge variant="outline" className="font-semibold text-[11px]">
                      {outlet.operatingModel}
                    </Badge>
                  </div>
                  {getStatusBadge(outlet.status)}
                </div>

                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 truncate">
                  {outlet.name}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1.5 text-slate-500 truncate">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{outlet.city}, {outlet.state}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5 text-xs pt-0">
                {/* Assigned Franchise User & Manager Details */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">Assigned Franchisee:</span>
                    <span className="font-medium truncate max-w-[170px]" title={outlet.assignedFranchiseUser}>
                      {outlet.assignedFranchiseUser}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-[11px] text-slate-400">Store Manager:</span>
                    <span className="font-medium">{outlet.manager}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="text-slate-400">Contact:</span>
                    <span>{outlet.contactPhone}</span>
                  </div>
                </div>

                {/* Metrics: Compliance & Risk */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Compliance
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        outlet.complianceScore >= 90
                          ? "text-emerald-600 dark:text-emerald-400"
                          : outlet.complianceScore >= 75
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {outlet.complianceScore}%
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Risk Score
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        outlet.riskScore <= 15
                          ? "text-emerald-600 dark:text-emerald-400"
                          : outlet.riskScore <= 35
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {outlet.riskScore}
                    </span>
                  </div>
                </div>

                {/* View Details Action Button */}
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white text-xs h-9 cursor-pointer gap-1.5"
                  onClick={() => navigate(`/outlets/${outlet.outletId}`)}
                >
                  <span>View Outlet Dossier</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
