import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B] block mb-1 font-semibold">
            Supply & Stock Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#064E3B]">
            Inventory & <span className="italic text-[#059669]">Stock-Sales Reconciliation</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Automated deterministic calculation: <code className="font-mono text-[#064E3B] font-semibold bg-[#E6F8EF] px-1.5 py-0.5 rounded border border-[#D1FAE5]">Expected Closing = Opening + Company Supply - Recorded Sales</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReconciliations}
            disabled={loading}
            className="gap-1.5 cursor-pointer text-xs border-[#D1FAE5] bg-white text-[#1F2937] hover:bg-[#F0FDF4] hover:text-[#064E3B]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#059669]" : "text-[#059669]"}`} />
            <span>Refresh</span>
          </Button>

          {!isReadOnly && (
            <Button
              size="sm"
              onClick={handleOpenAddModal}
              className="bg-[#059669] hover:bg-[#047857] text-white gap-1.5 cursor-pointer text-xs shadow-xs font-semibold"
            >
              <Calculator className="h-4 w-4" />
              <span>Calculate Reconciliation</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs: Stock Levels vs Reconciliation Audits */}
      <div className="flex items-center gap-3 border-b border-[#D1FAE5] pb-2">
        <Link
          to="/inventory"
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#64748B] hover:bg-[#E6F8EF] hover:text-[#064E3B] transition-colors flex items-center gap-1.5"
        >
          <Boxes className="h-3.5 w-3.5 text-[#059669]" />
          <span>On-Hand Physical Stock</span>
        </Link>
        <Link
          to="/inventory/reconciliation"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E6F8EF] text-[#064E3B] border border-[#D1FAE5] flex items-center gap-1.5 shadow-2xs"
        >
          <Scale className="h-3.5 w-3.5 text-[#059669]" />
          <span>Reconciliation & Anomaly Audits</span>
        </Link>
      </div>

      {/* Mandatory Human Review Ethics Policy Ribbon */}
      <div className="rounded-xl border border-[#D1FAE5] bg-white p-4 flex items-start gap-3 text-xs shadow-2xs">
        <Info className="h-5 w-5 text-[#059669] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#064E3B]">
            Enterprise Governance Protocol: Human Review Standard
          </span>
          <p className="text-[#64748B] leading-relaxed">
            In compliance with operational standards, variance between physical counts and system balances is <strong>never automatically labeled as fraud</strong>. Discrepancies designate operational variances requiring human physical count verification, supplier delivery notes review, or kitchen portioning adjustments.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#D1FAE5] bg-white shadow-2xs">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Total Reconciled SKUs
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#1F2937] font-mono">
                {summary.totalItems}
              </span>
              <Badge variant="outline" className="text-[10px] border-[#D1FAE5] bg-[#E6F8EF] text-[#064E3B]">
                {summary.normalItems} In Parity
              </Badge>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Active inventory batches under automated monitoring
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#D1FAE5] bg-white shadow-2xs">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Discrepancies Requiring Review
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-extrabold font-mono ${summary.discrepancyItems > 0 ? "text-amber-600" : "text-[#059669]"}`}>
                {summary.discrepancyItems}
              </span>
              {summary.discrepancyItems > 0 ? (
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                  Requires Review
                </Badge>
              ) : (
                <Badge className="bg-[#E6F8EF] text-[#064E3B] border-[#D1FAE5] text-[10px]">
                  Zero Discrepancy
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Flagged for store manager count verification
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#D1FAE5] bg-white shadow-2xs">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Total Variance Units
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#064E3B] font-mono">
                {summary.totalVarianceUnits} units
              </span>
              <span className="text-xs text-[#64748B] font-medium">net delta</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Cumulative difference between expected & physical stock
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#D1FAE5] bg-white shadow-2xs">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Stock Parity Health
            </span>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#059669] font-mono">
                {summary.systemHealthPct}%
              </span>
              <span className="text-xs text-[#64748B]">alignment</span>
            </div>
            <div className="w-full bg-[#E6F8EF] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${summary.systemHealthPct}%` }}
                className="bg-[#059669] h-full rounded-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discrepancy Alert Banner (Mandatory Notice) */}
      {summary.discrepancyItems > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm text-amber-900">
              Inventory discrepancy detected — requires review.
            </span>
            <p className="text-amber-800 leading-relaxed">
              {summary.discrepancyItems} inventory item(s) have variance exceeding standard 5% par tolerance between recorded sales and physical count. Please assign a shift supervisor to inspect delivery challans, physical store room bins, and kitchen portioning.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-[#D1FAE5] bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#059669]" />
            <Input
              placeholder="Search item, outlet, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-white border-[#D1FAE5] text-[#1F2937] placeholder:text-[#64748B] focus-visible:ring-[#059669] focus-visible:border-[#059669]"
            />
          </div>

          {/* Filter Outlet */}
          {!isFranchise && (
            <div>
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full h-9 rounded-md border border-[#D1FAE5] bg-white px-3 text-xs font-medium text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] cursor-pointer"
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
              className="w-full h-9 rounded-md border border-[#D1FAE5] bg-white px-3 text-xs font-medium text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] cursor-pointer"
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
              className="w-full h-9 rounded-md border border-[#D1FAE5] bg-white px-3 text-xs font-medium text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] cursor-pointer"
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
        <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#D1FAE5]">
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
              className="text-[#059669] hover:underline font-semibold cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Professional Reconciliation - Responsive Vertical Card Layout */}
      <div className="space-y-3 w-full max-w-full box-border">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#059669]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#064E3B]">
              Stock-Sales Reconciliation Matrix ({displayedRecords.length})
            </h3>
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            {displayedRecords.length} items verified
          </span>
        </div>

        {displayedRecords.length === 0 ? (
          <div className="rounded-xl border border-[#D1FAE5] bg-white p-12 text-center text-[#64748B] shadow-2xs">
            <Scale className="h-8 w-8 text-[#059669]/60 mx-auto mb-2" />
            <p className="font-semibold text-[#064E3B]">No reconciliation records found</p>
            <p className="text-xs text-[#64748B] mt-1">No reconciliation records match the active criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-full box-border">
            {displayedRecords.map((r) => {
              const varNum = Number(r.variance);

              // Distinct badge styling according to requirements
              let statusBadge = (
                <span className="bg-[#E6F8EF] text-[#064E3B] border border-[#D1FAE5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block">
                  {r.reviewStatus}
                </span>
              );

              if (r.hasDiscrepancy) {
                statusBadge = (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block">
                    Discrepancy Detected
                  </span>
                );
              } else if (r.reviewStatus === "Reviewed & Resolved") {
                statusBadge = (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md inline-block">
                    Reviewed & Resolved
                  </span>
                );
              }

              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-[#D1FAE5] bg-white p-4 sm:p-5 shadow-2xs hover:border-[#059669]/60 transition-all w-full max-w-full box-border min-w-0 space-y-3"
                >
                  {/* Header: Item, Outlet & Review Status */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#D1FAE5]/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#064E3B] bg-[#E6F8EF] px-2 py-0.5 rounded border border-[#D1FAE5]">
                          {r.outletId}
                        </span>
                        <span className="font-mono text-[11px] text-[#64748B]">
                          {r.periodDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#064E3B] mt-1">
                        {r.itemName}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {r.category} · Unit: {r.unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {statusBadge}
                    </div>
                  </div>

                  {/* Vertical Label-Value rows */}
                  <div className="space-y-2 text-xs divide-y divide-[#D1FAE5]/40">
                    {/* Opening Stock */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1 first:pt-0">
                      <span className="text-[#64748B] font-medium shrink-0">Opening Stock:</span>
                      <span className="font-mono font-medium text-[#1F2937] sm:text-right">
                        {Number(r.openingStock).toLocaleString()} {r.unit}
                      </span>
                    </div>

                    {/* Received Stock (Company Supply) */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                      <span className="text-[#64748B] font-medium shrink-0">Received (Company Supply):</span>
                      <span className="font-mono font-semibold text-[#059669] sm:text-right">
                        +{Number(r.companySupply).toLocaleString()} {r.unit}
                      </span>
                    </div>

                    {/* Recorded Sales (Depletion) */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                      <span className="text-[#64748B] font-medium shrink-0">Sold Quantity (Sales):</span>
                      <span className="font-mono font-medium text-[#1F2937] sm:text-right">
                        -{Number(r.recordedSales).toLocaleString()} {r.unit}
                      </span>
                    </div>

                    {/* Expected Closing Stock */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                      <span className="text-[#64748B] font-medium shrink-0">Expected Closing:</span>
                      <span className="font-mono font-bold text-[#064E3B] sm:text-right">
                        {Number(r.expectedClosingStock).toLocaleString()} {r.unit}
                      </span>
                    </div>

                    {/* Actual Physical Count */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                      <span className="text-[#64748B] font-medium shrink-0">Actual Physical Stock:</span>
                      <span className="font-mono font-bold text-[#1F2937] sm:text-right">
                        {Number(r.actualPhysicalStock).toLocaleString()} {r.unit}
                      </span>
                    </div>

                    {/* Variance & % */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                      <span className="text-[#64748B] font-medium shrink-0">Variance & Deviation:</span>
                      <div className="flex items-center gap-2 sm:justify-end">
                        <span className={`font-mono font-bold ${varNum !== 0 ? "text-amber-700" : "text-[#059669]"}`}>
                          {varNum > 0 ? `+${varNum}` : varNum} {r.unit}
                        </span>
                        <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${Number(r.variancePercentage) >= 5 ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-[#E6F8EF] text-[#064E3B] border border-[#D1FAE5]"}`}>
                          {r.variancePercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Notes if present */}
                    {r.notes && (
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 pt-2">
                        <span className="text-[#64748B] font-medium shrink-0">Notes:</span>
                        <span className="text-[#1F2937] italic text-[11px] sm:text-right sm:max-w-[70%]">
                          {r.notes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isReadOnly && (
                    <div className="pt-2 border-t border-[#D1FAE5]/60 flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReviewModalRecord(r);
                          setReviewStatusInput(r.reviewStatus);
                          setResolutionNotesInput(r.notes || "");
                        }}
                        className="h-8 text-xs gap-1.5 cursor-pointer bg-white text-[#064E3B] border border-[#D1FAE5] hover:bg-[#F0FDF4] hover:border-[#059669]"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-[#059669]" />
                        <span>Update Review</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(r)}
                        className="h-8 text-xs gap-1.5 cursor-pointer text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Calculation & Reconciliation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D1FAE5] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D1FAE5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#064E3B] flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#059669]" />
                  <span>Automated Stock-Sales Reconciliation</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Calculates Expected Closing Stock and flags variance for human review.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#64748B] hover:text-[#064E3B] p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Benchmark Button */}
            <div className="flex items-center justify-between bg-[#E6F8EF] p-2.5 rounded-lg border border-[#D1FAE5] text-xs">
              <span className="text-[#064E3B] font-medium">
                Try Example: Opening (100) + Supply (500) - Sales (450) vs Actual (92)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadBenchmarkExample}
                className="h-7 text-[11px] bg-white text-[#064E3B] border border-[#D1FAE5] hover:bg-[#F0FDF4] cursor-pointer"
              >
                Load Benchmark Values
              </Button>
            </div>

            <form onSubmit={handleSubmitReconciliation} className="space-y-4 text-xs">
              {/* Outlet and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-[#1F2937] block mb-1">
                    Outlet / Store
                  </label>
                  {isFranchise ? (
                    <div className="rounded border border-[#D1FAE5] bg-[#F0FDF4] px-3 py-1.5 font-mono text-xs text-[#064E3B] font-semibold">
                      {userOutlet} (Assigned)
                    </div>
                  ) : (
                    <select
                      value={formOutletId}
                      onChange={(e) => setFormOutletId(e.target.value)}
                      className="w-full h-8 rounded border border-[#D1FAE5] bg-white px-2.5 text-xs font-mono text-[#1F2937] focus:border-[#059669] focus:outline-none"
                    >
                      <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                      <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                      <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                      <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="font-medium text-[#1F2937] block mb-1">
                    Reconciliation Period Date
                  </label>
                  <Input
                    type="date"
                    value={formPeriodDate}
                    onChange={(e) => setFormPeriodDate(e.target.value)}
                    className="h-8 text-xs bg-white border-[#D1FAE5] text-[#1F2937]"
                    required
                  />
                </div>
              </div>

              {/* SKU / Item selection */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-medium text-[#1F2937] block mb-1">
                    Inventory SKU / Item
                  </label>
                  <select
                    value={formItemName}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full h-8 rounded border border-[#D1FAE5] bg-white px-2.5 text-xs text-[#1F2937] focus:border-[#059669] focus:outline-none"
                  >
                    {PRESET_ITEMS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-[#1F2937] block mb-1">
                    Unit
                  </label>
                  <Input
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="h-8 text-xs bg-white border-[#D1FAE5] text-[#1F2937]"
                    required
                  />
                </div>
              </div>

              {/* Automated Stock Calculation Inputs */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#F0FDF4] rounded-xl border border-[#D1FAE5]">
                <div>
                  <label className="font-bold text-[#1F2937] block mb-1">
                    Opening Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formOpeningStock}
                    onChange={(e) => setFormOpeningStock(Number(e.target.value))}
                    className="h-8 text-xs font-mono bg-white border-[#D1FAE5] text-[#1F2937]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#059669] block mb-1">
                    + Company Supply (Received)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formCompanySupply}
                    onChange={(e) => setFormCompanySupply(Number(e.target.value))}
                    className="h-8 text-xs font-mono bg-white border-[#D1FAE5] text-[#1F2937]"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-[#64748B] block mb-1">
                    - Recorded Sales (Sold)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formRecordedSales}
                    onChange={(e) => setFormRecordedSales(Number(e.target.value))}
                    className="h-8 text-xs font-mono bg-white border-[#D1FAE5] text-[#1F2937]"
                    required
                  />
                </div>
              </div>

              {/* AUTOMATED RESULT PREVIEW */}
              <div className="rounded-xl border border-[#D1FAE5] bg-[#E6F8EF] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#064E3B]">
                    Automated Expected Closing Stock:
                  </span>
                  <span className="text-lg font-bold font-mono text-[#064E3B]">
                    {calculatedExpectedClosing} {formUnit}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Formula: {formOpeningStock} (Opening) + {formCompanySupply} (Supply) - {formRecordedSales} (Sales) = {calculatedExpectedClosing} {formUnit}
                </p>
              </div>

              {/* Physical Count & Variance */}
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="font-bold text-[#064E3B] block mb-1">
                    Actual Physical Stock (Count)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formActualPhysicalStock}
                    onChange={(e) => setFormActualPhysicalStock(Number(e.target.value))}
                    className="h-8 text-xs font-mono font-bold bg-white border-[#D1FAE5] text-[#1F2937]"
                    required
                  />
                </div>

                <div className="p-2 rounded bg-[#F0FDF4] border border-[#D1FAE5]">
                  <span className="text-[10px] text-[#64748B] block font-bold uppercase">
                    Variance Delta
                  </span>
                  <span className={`text-base font-bold font-mono ${calculatedVariance !== 0 ? "text-amber-700" : "text-[#059669]"}`}>
                    {calculatedVariance} {formUnit}
                  </span>
                </div>

                <div className="p-2 rounded bg-[#F0FDF4] border border-[#D1FAE5]">
                  <span className="text-[10px] text-[#64748B] block font-bold uppercase">
                    Variance Percentage
                  </span>
                  <span className={`text-base font-bold font-mono ${calculatedVariancePct >= 5 ? "text-amber-700" : "text-[#064E3B]"}`}>
                    {calculatedVariancePct}%
                  </span>
                </div>
              </div>

              {/* Dynamic Discrepancy Alert */}
              {isDiscrepant ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50/90 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Inventory discrepancy detected — requires review.</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Important: This is treated strictly as an operational discrepancy requiring human physical review, not fraud.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-[#D1FAE5] bg-[#E6F8EF] p-2.5 flex items-center gap-2 text-[#064E3B]">
                  <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                  <span>Physical count matches expected closing inventory within standard par limits.</span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="font-medium text-[#1F2937] block mb-1">
                  Physical Audit Notes
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Bin count verified by supervisor, shift transition check"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="h-8 text-xs bg-white border-[#D1FAE5] text-[#1F2937]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D1FAE5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-[#D1FAE5] bg-white text-[#1F2937] hover:bg-[#F0FDF4]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#059669] hover:bg-[#047857] text-white font-semibold cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D1FAE5] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D1FAE5] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#064E3B]">
                  Update Review Checkpoint
                </h3>
                <p className="text-xs text-[#64748B]">
                  Reconciliation ID: {reviewModalRecord.reconciliationId}
                </p>
              </div>
              <button
                onClick={() => setReviewModalRecord(null)}
                className="text-[#64748B] hover:text-[#064E3B] p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateReviewStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="font-medium text-[#1F2937] block mb-1">
                  Review Status
                </label>
                <select
                  value={reviewStatusInput}
                  onChange={(e) => setReviewStatusInput(e.target.value)}
                  className="w-full h-8 rounded border border-[#D1FAE5] bg-white px-2.5 text-xs text-[#1F2937] focus:border-[#059669] focus:outline-none"
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
                <label className="font-medium text-[#1F2937] block mb-1">
                  Human Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="e.g. Physical recount verified 4 units in kitchen thawing tray. Parity restored."
                  className="w-full rounded border border-[#D1FAE5] bg-white p-2 text-xs text-[#1F2937] focus:border-[#059669] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D1FAE5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewModalRecord(null)}
                  className="border-[#D1FAE5] bg-white text-[#1F2937] hover:bg-[#F0FDF4]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#059669] hover:bg-[#047857] text-white font-semibold cursor-pointer shadow-xs"
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
