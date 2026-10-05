import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Boxes,
  Calculator,
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Info,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ClipboardCheck,
  Scale,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ReconciliationRecord {
  id: number;
  reconciliationId: string;
  outletId: string;
  itemName: string;
  category: string;
  unit: string;
  openingStock: string | number;
  companySupply: string | number;
  recordedSales: string | number;
  expectedClosingStock: string | number;
  actualPhysicalStock: string | number;
  variance: string | number;
  variancePercentage: string | number;
  reviewStatus: string;
  hasDiscrepancy: boolean;
  alertMessage?: string | null;
  periodDate: string;
  notes?: string | null;
  reconciledBy?: string | null;
}

const PRESET_ITEMS = [
  { name: "Crispy Herb Potato & Corn Patty (Pure Veg)", category: "Vegetarian Proteins & Dairy", unit: "kg" },
  { name: "Organic Brioche Buns (4-inch)", category: "Bakery & Breads", unit: "trays" },
  { name: "Signature Truffle Sauce", category: "Dressings & Condiments", unit: "bottles" },
  { name: "Sanitizer Solution Concentrate (FSSAI)", category: "Hygiene & Cleaning", unit: "liters" },
  { name: "Belgian Chocolate Shake Mix", category: "Beverages & Shakes", unit: "liters" },
  { name: "Paper Takeaway Kraft Bags (L)", category: "Packaging Material", unit: "units" },
];

const CATEGORIES = [
  "All Categories",
  "Vegetarian Proteins & Dairy",
  "Bakery & Breads",
  "Dressings & Condiments",
  "Hygiene & Cleaning",
  "Beverages & Shakes",
  "Packaging Material",
];

const REVIEW_STATUSES = [
  "All Statuses",
  "Normal",
  "Discrepancy Detected — Requires Review",
  "Reviewed & Resolved",
];

export default function InventoryPage() {
  const { user } = useAuth();

  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [summary, setSummary] = useState<any>({
    totalItems: 0,
    discrepancyItems: 0,
    normalItems: 0,
    totalVarianceUnits: 0,
    systemHealthPct: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("All Outlets");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewModalRecord, setReviewModalRecord] = useState<ReconciliationRecord | null>(null);
  const [reviewStatusInput, setReviewStatusInput] = useState("Reviewed & Resolved");
  const [resolutionNotesInput, setResolutionNotesInput] = useState("");

  const isFranchise = user?.role === "FRANCHISE";
  const isReadOnly = user?.role === "OWNER";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  // Form State for new reconciliation
  const [formOutletId, setFormOutletId] = useState(isFranchise ? userOutlet : "OUT-042");
  const [formItemName, setFormItemName] = useState(PRESET_ITEMS[0].name);
  const [formCategory, setFormCategory] = useState(PRESET_ITEMS[0].category);
  const [formUnit, setFormUnit] = useState(PRESET_ITEMS[0].unit);
  const [formOpeningStock, setFormOpeningStock] = useState<number>(100);
  const [formCompanySupply, setFormCompanySupply] = useState<number>(500);
  const [formRecordedSales, setFormRecordedSales] = useState<number>(450);
  const [formActualPhysicalStock, setFormActualPhysicalStock] = useState<number>(92);
  const [formPeriodDate, setFormPeriodDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("");

  // AUTOMATED CALCULATION (Deterministic algorithm)
  // Expected Closing Stock = Opening Stock + Company Supply - Recorded Sales
  const calculatedExpectedClosing = formOpeningStock + formCompanySupply - formRecordedSales;
  // Variance = Expected Closing Stock - Actual Physical Stock
  const calculatedVariance = calculatedExpectedClosing - formActualPhysicalStock;
  // Variance Percentage
  const calculatedVariancePct =
    calculatedExpectedClosing > 0
      ? Number(((Math.abs(calculatedVariance) / calculatedExpectedClosing) * 100).toFixed(2))
      : 0;

  const isDiscrepant = Math.abs(calculatedVariance) >= 5 || calculatedVariancePct >= 5;

  const fetchReconciliations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/inventory/reconciliations?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load reconciliations.");
      }

      setRecords(data.reconciliations || []);
      setSummary(data.summary || {});
    } catch (err: any) {
      setError(err.message || "Failed to connect to PostgreSQL inventory server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliations();
  }, [selectedOutlet, selectedCategory, selectedStatus]);

  const handleOpenAddModal = () => {
    setFormOutletId(isFranchise ? userOutlet : "OUT-042");
    setFormItemName(PRESET_ITEMS[0].name);
    setFormCategory(PRESET_ITEMS[0].category);
    setFormUnit(PRESET_ITEMS[0].unit);
    // User requested benchmark example
    setFormOpeningStock(100);
    setFormCompanySupply(500);
    setFormRecordedSales(450);
    setFormActualPhysicalStock(92);
    setFormPeriodDate(new Date().toISOString().split("T")[0]);
    setFormNotes("");
    setIsModalOpen(true);
  };

  const handlePresetSelect = (name: string) => {
    const matched = PRESET_ITEMS.find((p) => p.name === name);
    if (matched) {
      setFormItemName(matched.name);
      setFormCategory(matched.category);
      setFormUnit(matched.unit);
    }
  };

  const handleLoadBenchmarkExample = () => {
    setFormOpeningStock(100);
    setFormCompanySupply(500);
    setFormRecordedSales(450);
    setFormActualPhysicalStock(92);
  };

  const handleSubmitReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/inventory/reconciliations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          outletId: formOutletId,
          itemName: formItemName,
          category: formCategory,
          unit: formUnit,
          openingStock: Number(formOpeningStock),
          companySupply: Number(formCompanySupply),
          recordedSales: Number(formRecordedSales),
          actualPhysicalStock: Number(formActualPhysicalStock),
          periodDate: formPeriodDate,
          notes: formNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to record reconciliation.");
      }

      setIsModalOpen(false);
      fetchReconciliations();
    } catch (err: any) {
      alert(err.message || "Failed to save reconciliation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReviewStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalRecord) return;

    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/inventory/reconciliations/${reviewModalRecord.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reviewStatus: reviewStatusInput,
          resolutionNotes: resolutionNotesInput,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update review status.");
      }

      setReviewModalRecord(null);
      fetchReconciliations();
    } catch (err: any) {
      alert(err.message || "Failed to update review status.");
    }
  };

  const handleDelete = async (record: ReconciliationRecord) => {
    if (
      !confirm(
        `Are you sure you want to delete reconciliation ${record.reconciliationId} for ${record.itemName}?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/inventory/reconciliations/${record.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete reconciliation.");
      }

      fetchReconciliations();
    } catch (err: any) {
      alert(err.message || "Failed to delete record.");
    }
  };

  const displayedRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase().trim();
    return records.filter(
      (r) =>
        r.itemName.toLowerCase().includes(q) ||
        r.outletId.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.reconciliationId.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1 font-semibold">
            Supply & Stock Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Inventory & <span className="italic text-indigo-600">Stock-Sales Reconciliation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Automated deterministic calculation: <code className="font-mono text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">Expected Closing = Opening + Company Supply - Recorded Sales</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReconciliations}
            disabled={loading}
            className="gap-1.5 cursor-pointer text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {!isReadOnly && (
            <Button
              size="sm"
              onClick={handleOpenAddModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculate Reconciliation</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mandatory Human Review Ethics Policy Ribbon */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40 p-4 flex items-start gap-3 text-xs">
        <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            Enterprise Governance Protocol: Human Review Standard
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            In compliance with operational standards, variance between physical counts and system balances is <strong>never automatically labeled as fraud</strong>. Discrepancies designate operational variances requiring human physical count verification, supplier delivery notes review, or kitchen portioning adjustments.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Reconciled SKUs
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {summary.totalItems}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {summary.normalItems} In Parity
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Active inventory batches under automated monitoring
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Discrepancies Requiring Review
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold font-mono ${summary.discrepancyItems > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`}>
                {summary.discrepancyItems}
              </span>
              {summary.discrepancyItems > 0 ? (
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                  Requires Review
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px]">
                  Zero Discrepancy
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Flagged for store manager count verification
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Variance Units
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {summary.totalVarianceUnits} units
              </span>
              <span className="text-xs text-slate-400 font-medium">net delta</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cumulative difference between expected & physical stock
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Stock Parity Health
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                {summary.systemHealthPct}%
              </span>
              <span className="text-xs text-slate-400">alignment</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${summary.systemHealthPct}%` }}
                className="bg-emerald-500 h-full rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Alert Banner (Mandatory Notice) */}
      {summary.discrepancyItems > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/20 p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm">
              Inventory discrepancy detected — requires review.
            </span>
            <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
              {summary.discrepancyItems} inventory item(s) have variance exceeding standard 5% par tolerance between recorded sales and physical count. Please assign a shift supervisor to inspect delivery challans, physical store room bins, and kitchen portioning.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search item, outlet, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Filter Outlet */}
          {!isFranchise && (
            <div>
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All Outlets">Filter by Outlet: All</option>
                <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
              </select>
            </div>
          )}

          {/* Filter Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "All Categories" ? "Filter by Category: All" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Review Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {REVIEW_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All Statuses" ? "Filter by Status: All" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Showing {displayedRecords.length} reconciliation records</span>
          {(selectedOutlet !== "All Outlets" ||
            selectedCategory !== "All Categories" ||
            selectedStatus !== "All Statuses" ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedOutlet("All Outlets");
                setSelectedCategory("All Categories");
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

      {/* Professional Reconciliation Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Stock-Sales Reconciliation Matrix (PostgreSQL Stored)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {displayedRecords.length} items verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 font-semibold">Date & Outlet</th>
                <th className="py-3 px-3 font-semibold">SKU / Item</th>
                <th className="py-3 px-3 font-semibold text-right">Opening Stock</th>
                <th className="py-3 px-3 font-semibold text-right">Received Stock</th>
                <th className="py-3 px-3 font-semibold text-right">Sold Quantity</th>
                <th className="py-3 px-3 font-semibold text-right text-indigo-600 dark:text-indigo-400">
                  Expected Closing
                </th>
                <th className="py-3 px-3 font-semibold text-right">Actual Physical</th>
                <th className="py-3 px-3 font-semibold text-right">Variance</th>
                <th className="py-3 px-3 font-semibold text-right">Variance %</th>
                <th className="py-3 px-3 font-semibold">Review Status</th>
                {!isReadOnly && <th className="py-3 px-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {displayedRecords.map((r) => {
                const varNum = Number(r.variance);
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] block">{r.periodDate}</span>
                      <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                        {r.outletId}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {r.itemName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {r.category} • {r.unit}
                      </span>
                    </td>
                    {/* Opening Stock */}
                    <td className="py-3 px-3 text-right font-mono font-medium">
                      {Number(r.openingStock).toLocaleString()}
                    </td>
                    {/* Received Stock (Company Supply) */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-600 font-medium">
                      +{Number(r.companySupply).toLocaleString()}
                    </td>
                    {/* Sold Quantity (Recorded Sales) */}
                    <td className="py-3 px-3 text-right font-mono text-slate-500 font-medium">
                      -{Number(r.recordedSales).toLocaleString()}
                    </td>
                    {/* Expected Closing Stock */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                      {Number(r.expectedClosingStock).toLocaleString()}
                    </td>
                    {/* Actual Physical Stock */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {Number(r.actualPhysicalStock).toLocaleString()}
                    </td>
                    {/* Variance */}
                    <td className={`py-3 px-3 text-right font-mono font-bold ${varNum !== 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}`}>
                      {varNum > 0 ? `+${varNum}` : varNum}
                    </td>
                    {/* Variance Percentage */}
                    <td className={`py-3 px-3 text-right font-mono font-semibold ${Number(r.variancePercentage) >= 5 ? "text-amber-600" : "text-slate-500"}`}>
                      {r.variancePercentage}%
                    </td>
                    {/* Review Status */}
                    <td className="py-3 px-3">
                      {r.hasDiscrepancy ? (
                        <div className="space-y-0.5">
                          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                            Discrepancy Detected — Requires Review
                          </Badge>
                          {r.notes && (
                            <span className="block text-[10px] text-slate-400 truncate max-w-[160px]" title={r.notes}>
                              {r.notes}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                          {r.reviewStatus}
                        </Badge>
                      )}
                    </td>
                    {/* Actions */}
                    {!isReadOnly && (
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setReviewModalRecord(r);
                              setReviewStatusInput(r.reviewStatus);
                              setResolutionNotesInput(r.notes || "");
                            }}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Update Review Status / Add Notes"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {displayedRecords.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No reconciliation records found for the active criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Calculation & Reconciliation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-indigo-600" />
                  <span>Automated Stock-Sales Reconciliation</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Calculates Expected Closing Stock and flags variance for human review.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Benchmark Button */}
            <div className="flex items-center justify-between bg-indigo-50/60 dark:bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs">
              <span className="text-indigo-900 dark:text-indigo-300 font-medium">
                Try Example: Opening (100) + Supply (500) - Sales (450) vs Actual (92)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadBenchmarkExample}
                className="h-7 text-[11px] bg-white dark:bg-slate-900 text-indigo-600 cursor-pointer"
              >
                Load Benchmark Values
              </Button>
            </div>

            <form onSubmit={handleSubmitReconciliation} className="space-y-4 text-xs">
              {/* Outlet and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Outlet / Store
                  </label>
                  {isFranchise ? (
                    <div className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {userOutlet} (Assigned)
                    </div>
                  ) : (
                    <select
                      value={formOutletId}
                      onChange={(e) => setFormOutletId(e.target.value)}
                      className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                      <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                      <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                      <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Reconciliation Period Date
                  </label>
                  <Input
                    type="date"
                    value={formPeriodDate}
                    onChange={(e) => setFormPeriodDate(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              {/* SKU / Item selection */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Inventory SKU / Item
                  </label>
                  <select
                    value={formItemName}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    {PRESET_ITEMS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Unit
                  </label>
                  <Input
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Automated Stock Calculation Inputs */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Opening Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formOpeningStock}
                    onChange={(e) => setFormOpeningStock(Number(e.target.value))}
                    className="h-8 text-xs font-mono bg-white dark:bg-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-emerald-600 block mb-1">
                    + Company Supply (Received)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formCompanySupply}
                    onChange={(e) => setFormCompanySupply(Number(e.target.value))}
                    className="h-8 text-xs font-mono bg-white dark:bg-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">
                    - Recorded Sales (Sold)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formRecordedSales}
                    onChange={(e) => setFormRecordedSales(Number(e.target.value))}
                    className="h-8 text-xs font-mono bg-white dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              {/* AUTOMATED RESULT PREVIEW */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200">
                    Automated Expected Closing Stock:
                  </span>
                  <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {calculatedExpectedClosing} {formUnit}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Formula: {formOpeningStock} (Opening) + {formCompanySupply} (Supply) - {formRecordedSales} (Sales) = {calculatedExpectedClosing} {formUnit}
                </p>
              </div>

              {/* Physical Count & Variance */}
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Actual Physical Stock (Count)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formActualPhysicalStock}
                    onChange={(e) => setFormActualPhysicalStock(Number(e.target.value))}
                    className="h-8 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Variance Delta
                  </span>
                  <span className={`text-base font-bold font-mono ${calculatedVariance !== 0 ? "text-amber-600" : "text-emerald-600"}`}>
                    {calculatedVariance} {formUnit}
                  </span>
                </div>

                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Variance Percentage
                  </span>
                  <span className={`text-base font-bold font-mono ${calculatedVariancePct >= 5 ? "text-amber-600" : "text-slate-600"}`}>
                    {calculatedVariancePct}%
                  </span>
                </div>
              </div>

              {/* Dynamic Discrepancy Alert */}
              {isDiscrepant ? (
                <div className="rounded-lg border border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Inventory discrepancy detected — requires review.</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                    Important: This is treated strictly as an operational discrepancy requiring human physical review, not fraud.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Physical count matches expected closing inventory within standard par limits.</span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Physical Audit Notes
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Bin count verified by supervisor, shift transition check"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                >
                  {isSubmitting ? "Calculating & Saving..." : "Store Reconciliation in PostgreSQL"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Status & Notes Modal */}
      {reviewModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Update Review Checkpoint
                </h3>
                <p className="text-xs text-slate-500">
                  Reconciliation ID: {reviewModalRecord.reconciliationId}
                </p>
              </div>
              <button
                onClick={() => setReviewModalRecord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateReviewStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Review Status
                </label>
                <select
                  value={reviewStatusInput}
                  onChange={(e) => setReviewStatusInput(e.target.value)}
                  className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Reviewed & Resolved">Reviewed & Resolved</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Discrepancy Detected — Requires Review">
                    Discrepancy Detected — Requires Review
                  </option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Human Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="e.g. Physical recount verified 4 units in kitchen thawing tray. Parity restored."
                  className="w-full rounded border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalRecord(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                >
                  Update Status
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
