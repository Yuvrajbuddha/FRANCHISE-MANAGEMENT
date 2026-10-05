import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Boxes,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Info,
  Edit3,
  Scale,
  Building,
  TrendingDown,
  DollarSign,
  PackageCheck,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ALL_NETWORK_STORES } from "@/utils/stores-data";

interface StockItem {
  id: number;
  outletId: string;
  itemName: string;
  category: string;
  stockQuantity: string | number;
  unit: string;
  reorderLevel: string | number;
  unitCost: string | number;
  variancePct: string | number;
  status: string; // 'In Stock' | 'Low Stock' | 'Critical Shortage'
  lastAudited: string;
}

const CATEGORIES = [
  "All Categories",
  "Raw Meat & Proteins",
  "Vegetarian Proteins & Dairy",
  "Bakery & Breads",
  "Dressings & Condiments",
  "Hygiene & Cleaning",
  "Beverages & Shakes",
  "Packaging Material",
];

const STOCK_STATUSES = [
  "All Statuses",
  "In Stock",
  "Low Stock",
  "Critical Shortage",
];

export default function InventoryStockPage() {
  const { user } = useAuth();

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState({
    totalSkus: 0,
    inStockCount: 0,
    lowStockCount: 0,
    criticalStockCount: 0,
    totalInventoryValue: 0,
    healthScorePct: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("All Outlets");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Audit Modal State
  const [auditItem, setAuditItem] = useState<StockItem | null>(null);
  const [physicalCountInput, setPhysicalCountInput] = useState<number>(0);
  const [auditNotes, setAuditNotes] = useState("");
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isFranchise = user?.role === "FRANCHISE";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  const fetchStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/inventory/stock?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load stock: ${res.statusText}`);
      }

      const data = await res.json();
      setStockItems(data.stockItems || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve inventory stock.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [selectedOutlet, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock();
  };

  const openAuditModal = (item: StockItem) => {
    setAuditItem(item);
    setPhysicalCountInput(Number(item.stockQuantity));
    setAuditNotes("");
  };

  const handleSaveAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditItem) return;
    setIsSubmittingAudit(true);
    setError(null);

    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/inventory/stock/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: auditItem.id,
          physicalCount: physicalCountInput,
          notes: auditNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update physical audit count.");
      }

      setSuccessMessage(`Physical stock count updated for ${auditItem.itemName}.`);
      setAuditItem(null);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchStock();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                  Inventory Stock
                </h1>
                <Badge variant="outline" className="text-[11px] font-medium border-blue-200 text-blue-700 bg-blue-50/80">
                  Store On-Hand Physical Stock
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Current on-hand store inventory levels, physical counts, reorder thresholds, and warehouse valuation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStock}
            disabled={loading}
            className="h-9 gap-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Tracked SKUs</span>
              <Boxes className="h-4 w-4 text-blue-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-slate-900">
              {summary.totalSkus}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active warehouse items</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">In Stock</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-700">
              {summary.inStockCount}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Healthy availability</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Low Stock</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-amber-700">
              {summary.lowStockCount}
            </div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Below reorder point</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Critical Shortage</span>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-rose-700">
              {summary.criticalStockCount}
            </div>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">Urgent restock required</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Stock Valuation</span>
              <DollarSign className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-slate-900">
              ₹{(summary.totalInventoryValue / 100000).toFixed(2)}L
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Total holding asset</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by SKU name, category, or outlet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl border-slate-200 w-full"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Outlet Filter (If Franchisee with all outlets access) */}
              {!isFranchise && (
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                    className="w-full sm:w-48 h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All Outlets">All Network Outlets</option>
                    {ALL_NETWORK_STORES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-44 h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full sm:w-40 h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {STOCK_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stock Table */}
      <Card className="rounded-2xl border-slate-200 shadow-xs bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-3">Store Outlet</th>
                <th className="py-3 px-3 text-right">Physical On-Hand Stock</th>
                <th className="py-3 px-3 text-right">Reorder Level</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-3 text-right">Stock Valuation</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Last Physical Audit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <span>Loading current inventory stock...</span>
                  </td>
                </tr>
              ) : stockItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Boxes className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No inventory stock items match your criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try resetting the outlet, category, or status filters.</p>
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => {
                  const qty = Number(item.stockQuantity);
                  const reorder = Number(item.reorderLevel);
                  const cost = Number(item.unitCost);
                  const value = qty * cost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{item.itemName}</div>
                        <div className="text-[11px] text-slate-500">{item.category}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-medium text-slate-700">{item.outletId}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        {qty} <span className="text-[10px] text-slate-500 font-sans">{item.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {reorder} <span className="text-[10px] text-slate-400 font-sans">{item.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                        ₹{value.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.status === "In Stock" ? (
                          <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] font-medium">
                            In Stock
                          </Badge>
                        ) : item.status === "Low Stock" ? (
                          <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 text-[10px] font-medium">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 text-[10px] font-semibold">
                            Critical Shortage
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 font-mono text-[11px]">
                        {item.lastAudited || "Pending"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAuditModal(item)}
                          className="h-8 px-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium gap-1"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Audit Count</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Stock Modal */}
      {auditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Audit Physical Count
                </h3>
              </div>
              <button
                onClick={() => setAuditItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAudit} className="mt-4 space-y-4">
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                  Item Details
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-900 text-sm">{auditItem.itemName}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Outlet: <strong className="font-mono text-slate-700">{auditItem.outletId}</strong></span>
                    <span>Reorder Level: <strong className="font-mono text-slate-700">{auditItem.reorderLevel} {auditItem.unit}</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Verified Physical Count ({auditItem.unit})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={physicalCountInput}
                  onChange={(e) => setPhysicalCountInput(Number(e.target.value))}
                  required
                  className="h-10 text-sm font-mono rounded-xl border-slate-200"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Current system registered quantity: {auditItem.stockQuantity} {auditItem.unit}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Auditor Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Physical count confirmed in main walk-in chiller."
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAuditItem(null)}
                  disabled={isSubmittingAudit}
                  className="h-9 px-4 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingAudit}
                  className="h-9 px-5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {isSubmittingAudit ? "Saving Audit..." : "Save Audit Count"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
