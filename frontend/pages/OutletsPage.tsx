import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  Search,
  Building,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  MapPin,
  UserCheck,
  Phone,
  Mail,
  RefreshCw,
  Lock,
  X,
  User,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
    } catch (err: any) {
      setError(err.message || "Failed to connect to database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, [selectedCity, selectedModel, selectedStatus]);

  // Client-side search for instantaneous feedback
  const filteredOutlets = useMemo(() => {
    if (!searchQuery.trim()) return outlets;
    const q = searchQuery.toLowerCase().trim();
    return outlets.filter(
      (o) =>
        o.name?.toLowerCase().includes(q) ||
        o.outletId?.toLowerCase().includes(q) ||
        o.city?.toLowerCase().includes(q) ||
        o.manager?.toLowerCase().includes(q) ||
        o.assignedFranchiseUser?.toLowerCase().includes(q)
    );
  }, [outlets, searchQuery]);

  // Summary counts for filter indicator
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCity !== "All Cities" ||
    selectedModel !== "All Models" ||
    selectedStatus !== "All Statuses";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCity("All Cities");
    setSelectedModel("All Models");
    setSelectedStatus("All Statuses");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "Under Audit":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Under Audit
          </span>
        );
      case "Grace Period":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Grace Period
          </span>
        );
      case "Notice Issued":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Notice Issued
          </span>
        );
      case "Critical Escalation":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Critical Escalation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. PROFESSIONAL PAGE HEADER                              */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
              <Store className="h-5 w-5" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Outlet Registry & Operations
            </h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time multi-unit franchise monitoring, operating models (COCO/FOCO), and deterministic compliance auditing across network stores.
          </p>
        </div>

        {/* Quick summary indicators */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              {outlets.length} {outlets.length === 1 ? "Outlet" : "Outlets"} Network Total
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchOutlets}
            disabled={loading}
            className="text-xs gap-1.5 h-9 cursor-pointer"
            title="Refresh outlet list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Franchise User Scope Notice (When logged in as FRANCHISE role) */}
      {isFranchiseRole && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 text-emerald-900 dark:text-emerald-200 text-xs shadow-2xs">
          <Lock className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm block">
              Single-Store Partition Active
            </span>
            <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              Your account access is isolated strictly to designated location{" "}
              <strong>{user?.assignedOutletId}</strong> ({user?.assignedOutletName || "Assigned Store"}). In accordance with enterprise RBAC privacy controls, other network stores are restricted.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SEARCH & FILTER PANEL (RESPONSIVE SINGLE ROW ON DESKTOP) */}
      {/* ======================================================== */}
      {!isFranchiseRole && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input Field */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by outlet name, code, city, or manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs h-10 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                aria-label="Search by outlet name, code, city, or manager"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                aria-label="Filter by City"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "All Cities" ? "City: All Cities" : c}
                  </option>
                ))}
              </select>

              {/* Operating Model Filter */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                aria-label="Filter by Operating Model"
              >
                {MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m === "All Models" ? "Model: All Models" : `${m} Model`}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                aria-label="Filter by Status"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === "All Statuses" ? "Status: All Statuses" : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active indicator & Clear filters row */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Showing{" "}
              <strong className="text-slate-900 dark:text-white">
                {filteredOutlets.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900 dark:text-white">
                {outlets.length}
              </strong>{" "}
              outlets
              {hasActiveFilters && (
                <span className="text-slate-400 ml-1.5 hidden sm:inline">
                  (filtered from network directory)
                </span>
              )}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear all filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Loading verified franchise outlets...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-3">
          <AlertOctagon className="h-5 w-5 shrink-0 text-red-600" />
          <div>
            <span className="font-bold block text-sm">Database Connection Error</span>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Empty results state */}
      {!loading && !error && filteredOutlets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Store className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
              No Outlets Match the Selected Criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No franchise outlets match your search and filter parameters. Try clearing or relaxing your filters."
                : "Zero outlet records found in the system registry."}
            </p>
          </div>
          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllFilters}
                className="text-xs cursor-pointer"
              >
                Reset Filter Settings
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. REDESIGNED CLEAN & MODERN OUTLET CARDS GRID           */}
      {/* ======================================================== */}
      {!loading && !error && filteredOutlets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOutlets.map((outlet) => {
            const isHighCompliance = outlet.complianceScore >= 90;
            const isMidCompliance = outlet.complianceScore >= 75;

            const isLowRisk = outlet.riskScore <= 15;
            const isMidRisk = outlet.riskScore <= 35;

            return (
              <div
                key={outlet.outletId}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
              >
                {/* Card Top: Code, Model, Status & Name */}
                <div className="space-y-3">
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 px-2.5 py-0.5 rounded-lg shadow-2xs">
                        {outlet.outletId}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                        {outlet.operatingModel} Model
                      </span>
                    </div>

                    {getStatusBadge(outlet.status)}
                  </div>

                  {/* Outlet Prominent Name & Location */}
                  <div>
                    <h3
                      className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug truncate"
                      title={outlet.name}
                    >
                      {outlet.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {outlet.city}, {outlet.state}
                      </span>
                      {outlet.address && (
                        <span className="text-slate-400 truncate hidden sm:inline">
                          · {outlet.address}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operational & Contact Info Box */}
                  <div className="rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3 space-y-2 text-xs">
                    {/* Assigned Franchisee */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 shrink-0">
                        <Building className="h-3 w-3 text-slate-400" />
                        <span>Franchisee:</span>
                      </span>
                      <span
                        className="font-medium text-slate-900 dark:text-slate-100 truncate text-right"
                        title={outlet.assignedFranchiseUser}
                      >
                        {outlet.assignedFranchiseUser}
                      </span>
                    </div>

                    {/* Store Manager */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 shrink-0">
                        <User className="h-3 w-3 text-slate-400" />
                        <span>Store Manager:</span>
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-right">
                        {outlet.manager}
                      </span>
                    </div>

                    {/* Contact Phone & Email */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 text-slate-500 shrink-0">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>Contact:</span>
                      </span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                        {outlet.contactPhone || outlet.contactEmail || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Compliance & Risk Progress Bars + Action Button */}
                <div className="space-y-3.5 pt-1">
                  {/* Compliance & Risk Indicators (Separated Sections with Progress Bars) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* 1. Compliance Indicator */}
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Compliance</span>
                        <span
                          className={`font-bold ${
                            isHighCompliance
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isMidCompliance
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {outlet.complianceScore}%
                        </span>
                      </div>
                      {/* Compact Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isHighCompliance
                              ? "bg-emerald-500"
                              : isMidCompliance
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(outlet.complianceScore, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block text-right font-medium">
                        {isHighCompliance
                          ? "Audit Compliant"
                          : isMidCompliance
                          ? "Review Required"
                          : "Non-Compliant"}
                      </span>
                    </div>

                    {/* 2. Deterministic Risk Score Indicator */}
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Risk Score</span>
                        <span
                          className={`font-bold ${
                            isLowRisk
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isMidRisk
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {outlet.riskScore}/100
                        </span>
                      </div>
                      {/* Compact Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isLowRisk
                              ? "bg-emerald-500"
                              : isMidRisk
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(Math.max(outlet.riskScore, 5), 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block text-right font-medium">
                        {isLowRisk ? "Low Risk" : isMidRisk ? "Moderate Risk" : "Elevated Risk"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button: View Outlet Dossier */}
                  <Button
                    onClick={() => navigate(`/outlets/${outlet.outletId}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Outlet Dossier</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
