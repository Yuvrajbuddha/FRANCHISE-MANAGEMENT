import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Truck,
  Search,
  Filter,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileText,
  Building,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_NETWORK_STORES } from "@/utils/stores-data";

interface SupplyConsignment {
  id: number;
  consignmentId: string;
  reconciliationId: string;
  outletId: string;
  itemName: string;
  category: string;
  unit: string;
  quantitySupplied: number;
  dispatchDate: string;
  deliveryStatus: string; // 'Delivered & Verified' | 'In Transit' | 'Discrepancy Flagged'
  carrier: string;
  invoiceNumber: string;
  reconciledBy: string;
  notes: string;
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

const DELIVERY_STATUSES = [
  "All Statuses",
  "Delivered & Verified",
  "In Transit",
  "Discrepancy Flagged",
];

const PRESET_SUPPLY_ITEMS = [
  { name: "Crispy Herb Potato & Corn Patty (Pure Veg)", category: "Vegetarian Proteins & Dairy", unit: "kg" },
  { name: "Organic Brioche Buns (4-inch)", category: "Bakery & Breads", unit: "trays" },
  { name: "Signature Truffle Sauce", category: "Dressings & Condiments", unit: "bottles" },
  { name: "Sanitizer Solution Concentrate (FSSAI)", category: "Hygiene & Cleaning", unit: "liters" },
  { name: "Belgian Chocolate Shake Mix", category: "Beverages & Shakes", unit: "liters" },
  { name: "Paper Takeaway Kraft Bags (L)", category: "Packaging Material", unit: "units" },
];

export default function CompanySupplyPage() {
  const { user } = useAuth();

  const [consignments, setConsignments] = useState<SupplyConsignment[]>([]);
  const [summary, setSummary] = useState({
    totalShipments: 0,
    totalUnitsSupplied: 0,
    verifiedCount: 0,
    inTransitCount: 0,
    flaggedCount: 0,
    fulfillmentRate: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("All Outlets");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  // Requisition Modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderOutletId, setOrderOutletId] = useState(user?.assignedOutletId || "OUT-042");
  const [orderItemName, setOrderItemName] = useState(PRESET_SUPPLY_ITEMS[0].name);
  const [orderCategory, setOrderCategory] = useState(PRESET_SUPPLY_ITEMS[0].category);
  const [orderUnit, setOrderUnit] = useState(PRESET_SUPPLY_ITEMS[0].unit);
  const [orderQuantity, setOrderQuantity] = useState<number>(250);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isFranchise = user?.role === "FRANCHISE";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  const fetchConsignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (selectedStatus !== "All Statuses") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/supply/consignments?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load company supplies: ${res.statusText}`);
      }

      const data = await res.json();
      setConsignments(data.consignments || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve company supply consignments.");
      // Resilient fallback for preview/offline
      setConsignments((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: 1,
            consignmentId: "SUP-2026-101",
            reconciliationId: "REC-2026-101",
            outletId: "OUT-042",
            itemName: "Frozen Patty Premium (Veg/Non-Veg)",
            category: "Raw Meat & Proteins",
            unit: "kg",
            quantitySupplied: 350,
            dispatchDate: "2026-10-01",
            deliveryStatus: "Delivered & Verified",
            carrier: "ColdChain Express (Fleet #12)",
            invoiceNumber: "INV-HQ-9941",
            reconciledBy: "Aura Central Warehouse",
            notes: "Routine bi-weekly dispatch. Temperature log verified at -18°C.",
          },
          {
            id: 2,
            consignmentId: "SUP-2026-102",
            reconciliationId: "REC-2026-102",
            outletId: "OUT-042",
            itemName: "Organic Brioche Buns (4-inch)",
            category: "Bakery & Breads",
            unit: "trays",
            quantitySupplied: 200,
            dispatchDate: "2026-10-02",
            deliveryStatus: "Delivered & Verified",
            carrier: "FreshBake Logistics",
            invoiceNumber: "INV-HQ-9948",
            reconciledBy: "Aura Central Warehouse",
            notes: "Morning delivery batch #4. Seals intact.",
          },
          {
            id: 3,
            consignmentId: "SUP-2026-103",
            reconciliationId: "REC-2026-103",
            outletId: "OUT-042",
            itemName: "Signature Truffle Sauce",
            category: "Dressings & Condiments",
            unit: "bottles",
            quantitySupplied: 40,
            dispatchDate: "2026-10-02",
            deliveryStatus: "In Transit",
            carrier: "Aura Logistics Van #04",
            invoiceNumber: "INV-HQ-9952",
            reconciledBy: "Regional Depot North",
            notes: "Urgent replenishment for low stock alert.",
          },
        ];
      });
      setSummary((prev) => prev.totalShipments > 0 ? prev : {
        totalShipments: 3,
        totalUnitsSupplied: 590,
        verifiedCount: 2,
        inTransitCount: 1,
        flaggedCount: 0,
        fulfillmentRate: 98,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignments();
  }, [selectedOutlet, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConsignments();
  };

  const handleItemSelect = (itemName: string) => {
    setOrderItemName(itemName);
    const found = PRESET_SUPPLY_ITEMS.find((p) => p.name === itemName);
    if (found) {
      setOrderCategory(found.category);
      setOrderUnit(found.unit);
    }
  };

  const handleCreateSupplyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    setError(null);

    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch("/api/supply/consignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          outletId: isFranchise ? userOutlet : orderOutletId,
          itemName: orderItemName,
          category: orderCategory,
          unit: orderUnit,
          quantityRequested: orderQuantity,
          periodDate: orderDate,
          notes: orderNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit company supply order.");
      }

      const result = await res.json();
      setSuccessMessage(result.message || "Company supply request submitted to HQ Central Commissary.");
      setIsOrderModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchConsignments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
                  Company Supply
                </h1>
                <Badge variant="outline" className="text-[11px] font-medium border-teal-200 text-teal-700 bg-teal-50/80">
                  HQ Commissary Inward Shipments
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Inward company deliveries, commissary warehouse dispatches, batch tracking, and supplier receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConsignments}
            disabled={loading}
            className="h-9 gap-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsOrderModalOpen(true)}
            className="h-9 gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Request Company Supply</span>
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Total Supplied</span>
              <Package className="h-4 w-4 text-teal-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-slate-900">
              {summary.totalUnitsSupplied.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Total units received from HQ</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Shipments</span>
              <Truck className="h-4 w-4 text-blue-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-slate-900">
              {summary.totalShipments}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Total consignments logged</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Verified Received</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-700">
              {summary.verifiedCount}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Successfully acknowledged</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">In Transit</span>
              <Clock className="h-4 w-4 text-sky-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-sky-700">
              {summary.inTransitCount}
            </div>
            <p className="text-[11px] text-sky-600 font-medium mt-0.5">On the way to stores</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Fulfillment Rate</span>
              <Sparkles className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="font-serif text-2xl font-bold text-slate-900">
              {summary.fulfillmentRate}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">HQ SLA delivery benchmark</p>
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
                placeholder="Search by Consignment ID, item name, or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl border-slate-200 w-full"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Outlet Filter */}
              {!isFranchise && (
                <div className="w-full sm:w-auto">
                  <select
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                    className="w-full sm:w-48 h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                  className="w-full sm:w-44 h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                  className="w-full sm:w-44 h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {DELIVERY_STATUSES.map((st) => (
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

      {/* Supply Consignments Records Section Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{consignments.length}</strong> supply consignments
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Vertical Card Layout · All 9 Fields Visible
        </span>
      </div>

      {/* Main Company Supply Cards Grid */}
      {loading ? (
        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white p-12 text-center text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-teal-600 mb-2" />
          <span>Loading company supply consignments...</span>
        </Card>
      ) : consignments.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-xs bg-white p-12 text-center text-slate-500">
          <Truck className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="font-medium text-slate-700">No company supply shipments found.</p>
          <p className="text-[11px] text-slate-400 mt-1">Try resetting the outlet, category, or status filters.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {consignments.map((c) => (
            <Card
              key={c.id}
              className="rounded-2xl border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all bg-white p-5 flex flex-col justify-between"
            >
              {/* Card Header: Consignment Ref & Delivery Status Badge */}
              <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-200/80 shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                      Consignment Ref
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900 block leading-tight">
                      {c.consignmentId}
                    </span>
                    {c.invoiceNumber && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Inv: {c.invoiceNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge in Header */}
                <div className="shrink-0">
                  {c.deliveryStatus === "Delivered & Verified" ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-300 text-emerald-800 bg-emerald-50 text-xs font-semibold px-2.5 py-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                      Delivered & Verified
                    </Badge>
                  ) : c.deliveryStatus === "In Transit" ? (
                    <Badge
                      variant="outline"
                      className="border-blue-300 text-blue-800 bg-blue-50 text-xs font-semibold px-2.5 py-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
                      In Transit
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-rose-300 text-rose-800 bg-rose-50 text-xs font-semibold px-2.5 py-1"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1.5" />
                      Discrepancy Flagged
                    </Badge>
                  )}
                </div>
              </div>

              {/* Vertical Card Rows: All 9 Fields in clear Label-Value Format */}
              <div className="py-2 space-y-2 text-xs divide-y divide-slate-100 flex-1">
                {/* 1. Consignment Reference */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1.5 first:pt-0">
                  <span className="text-slate-500 font-medium shrink-0">Consignment Reference:</span>
                  <span className="font-mono font-bold text-slate-900 sm:text-right">
                    {c.consignmentId}
                  </span>
                </div>

                {/* 2. Supply Item & Category */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Supply Item & Category:</span>
                  <span className="text-slate-900 font-semibold sm:text-right">
                    {c.itemName}{" "}
                    <span className="text-slate-500 font-normal text-[11px]">
                      ({c.category})
                    </span>
                  </span>
                </div>

                {/* 3. Destination Outlet */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Destination Outlet:</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded text-[11px] sm:self-end">
                    {c.outletId}
                  </span>
                </div>

                {/* 4. Supplied Quantity */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Supplied Quantity:</span>
                  <span className="font-mono font-bold text-teal-700 sm:text-right text-sm">
                    {c.quantitySupplied.toLocaleString()}{" "}
                    <span className="text-xs text-slate-600 font-sans font-medium">{c.unit}</span>
                  </span>
                </div>

                {/* 5. Dispatch Date */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Dispatch Date:</span>
                  <span className="font-mono text-slate-700 sm:text-right">
                    {c.dispatchDate}
                  </span>
                </div>

                {/* 6. Delivery Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Delivery Status:</span>
                  <div>
                    {c.deliveryStatus === "Delivered & Verified" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Delivered & Verified
                      </span>
                    ) : c.deliveryStatus === "In Transit" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        In Transit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Discrepancy Flagged
                      </span>
                    )}
                  </div>
                </div>

                {/* 7. Carrier / Fleet */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Carrier / Fleet:</span>
                  <span className="text-slate-700 font-medium sm:text-right">
                    {c.carrier || "—"}
                  </span>
                </div>

                {/* 8. Acknowledged By */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Acknowledged By:</span>
                  <span className="text-slate-700 font-mono text-[11px] sm:text-right break-all">
                    {c.reconciledBy || "—"}
                  </span>
                </div>

                {/* 9. Batch Notes */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 pt-2">
                  <span className="text-slate-500 font-medium shrink-0">Batch Notes:</span>
                  <span className="text-slate-600 sm:text-right sm:max-w-[65%] italic text-[11px] leading-relaxed">
                    {c.notes || "Normal variance within machine distribution."}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Request Company Supply Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-teal-600" />
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Request Company Supply Order
                </h3>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplyOrder} className="mt-4 space-y-4">
              {!isFranchise && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Destination Outlet
                  </label>
                  <select
                    value={orderOutletId}
                    onChange={(e) => setOrderOutletId(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {ALL_NETWORK_STORES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Preset Supply Item
                </label>
                <select
                  value={orderItemName}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {PRESET_SUPPLY_ITEMS.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Quantity Requested
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    required
                    className="h-10 text-xs font-mono rounded-xl border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Unit of Measurement
                  </label>
                  <Input
                    type="text"
                    value={orderUnit}
                    readOnly
                    className="h-10 text-xs bg-slate-50 font-mono rounded-xl border-slate-200 text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Required Delivery Date
                </label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  required
                  className="h-10 text-xs font-mono rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Requisition Notes / Instructions for Central Commissary
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Expedited weekend batch restock request for flagship store."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOrderModalOpen(false)}
                  disabled={isSubmittingOrder}
                  className="h-9 px-4 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingOrder}
                  className="h-9 px-5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  {isSubmittingOrder ? "Submitting Request..." : "Submit Supply Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
