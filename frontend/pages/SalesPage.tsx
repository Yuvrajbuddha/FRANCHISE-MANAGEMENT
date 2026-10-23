import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Layers,
  Store,
  ShoppingBag,
  Trash2,
  Edit3,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  BarChart2,
  PieChart as PieIcon,
  CreditCard,
  Wallet,
  Banknote,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NetworkTrajectoryGraph } from "@/components/NetworkTrajectoryGraph";

// Client-side Zod Schema matching server rules
const SaleFormSchema = z.object({
  outletId: z.string().min(1, "Please select an outlet"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
  productName: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Unit price must be greater than 0"),
  netSales: z.number().positive("Net sales must be greater than 0"),
  grossSales: z.number().positive("Gross sales must be greater than 0"),
  orderCount: z.number().int().positive("Order count must be at least 1"),
  paymentMode: z.enum(["UPI", "Cash", "Card"]),
  cashCollection: z.number().nonnegative("Cash cannot be negative"),
  upiCollection: z.number().nonnegative("UPI cannot be negative"),
  cardCollection: z.number().nonnegative("Card cannot be negative"),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof SaleFormSchema>;

interface SaleRecord {
  id: number;
  outletId: string;
  date: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: string | number;
  netSales: string | number;
  grossSales: string | number;
  orderCount: number;
  avgTicket: string | number;
  paymentMode: string;
  cashCollection: string | number;
  upiCollection: string | number;
  cardCollection: string | number;
  posSettled: boolean;
  notes?: string;
  createdBy?: string;
}

const CATEGORIES = [
  "Burgers & Combos",
  "Pure Veg Bowls & Platters",
  "Vegetarian Specials",
  "Sides & Fries",
  "Beverages & Shakes",
  "Desserts",
];

const PRESET_PRODUCTS = [
  { name: "Signature Truffle Burger Meal", category: "Burgers & Combos", price: 380 },
  { name: "Crispy Paneer Feast Box", category: "Pure Veg Bowls & Platters", price: 420 },
  { name: "Paneer Supreme Brioche Combo", category: "Vegetarian Specials", price: 360 },
  { name: "Peri Peri Crinkle Fries (L)", category: "Sides & Fries", price: 150 },
  { name: "Belgian Chocolate Thickshake", category: "Beverages & Shakes", price: 210 },
  { name: "Smoky Tandoori Soya Chaap (8 pcs)", category: "Pure Veg Bowls & Platters", price: 290 },
];

export default function SalesPage() {
  const { user } = useAuth();

  // State
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [summary, setSummary] = useState<any>({
    totalNetRevenue: 0,
    totalGrossRevenue: 0,
    totalUnits: 0,
    totalOrders: 0,
    avgTicket: 0,
    cashShare: 0,
    upiShare: 0,
    cardShare: 0,
  });
  const [charts, setCharts] = useState<any>({
    dailySales: [],
    weeklySales: [],
    monthlySales: [],
    revenueTrend: [],
    productWiseSales: [],
    outletComparison: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState<string>("All Outlets");
  const [selectedProduct, setSelectedProduct] = useState<string>("All Products");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Active Chart View Tab
  const [activeChartTab, setActiveChartTab] = useState<
    "daily" | "weekly" | "monthly" | "trend" | "products" | "outlets" | "trajectory"
  >("daily");

  const isFranchise = user?.role === "FRANCHISE";
  const isReadOnly = user?.role === "OWNER" || user?.role === "OFFICER";
  const userOutlet = user?.assignedOutletId || "OUT-042";

  // Form State
  const [formData, setFormData] = useState<SaleFormData>({
    outletId: isFranchise ? userOutlet : "OUT-042",
    date: new Date().toISOString().split("T")[0],
    productName: PRESET_PRODUCTS[0].name,
    category: PRESET_PRODUCTS[0].category,
    quantity: 10,
    unitPrice: PRESET_PRODUCTS[0].price,
    netSales: 10 * PRESET_PRODUCTS[0].price,
    grossSales: Math.round(10 * PRESET_PRODUCTS[0].price * 1.05),
    orderCount: 10,
    paymentMode: "UPI",
    cashCollection: 0,
    upiCollection: 10 * PRESET_PRODUCTS[0].price,
    cardCollection: 0,
    notes: "",
  });

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const params = new URLSearchParams();
      if (selectedOutlet !== "All Outlets") params.append("outletId", selectedOutlet);
      if (selectedProduct !== "All Products") params.append("product", selectedProduct);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/sales?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load sales.");
      }

      setSales(data.sales || []);
      setSummary(data.summary || {});
      setCharts(data.charts || {});
    } catch (err: any) {
      setError(err.message || "Failed to connect to sales database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [selectedOutlet, selectedProduct, selectedCategory, startDate, endDate]);

  const handleOpenAdd = () => {
    setEditingSale(null);
    setFormErrors({});
    const initialPrice = PRESET_PRODUCTS[0].price;
    setFormData({
      outletId: isFranchise ? userOutlet : "OUT-042",
      date: new Date().toISOString().split("T")[0],
      productName: PRESET_PRODUCTS[0].name,
      category: PRESET_PRODUCTS[0].category,
      quantity: 10,
      unitPrice: initialPrice,
      netSales: 10 * initialPrice,
      grossSales: Math.round(10 * initialPrice * 1.05),
      orderCount: 10,
      paymentMode: "UPI",
      cashCollection: 0,
      upiCollection: 10 * initialPrice,
      cardCollection: 0,
      notes: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sale: SaleRecord) => {
    setEditingSale(sale);
    setFormErrors({});
    setFormData({
      outletId: sale.outletId,
      date: sale.date,
      productName: sale.productName,
      category: sale.category,
      quantity: Number(sale.quantity),
      unitPrice: Number(sale.unitPrice),
      netSales: Number(sale.netSales),
      grossSales: Number(sale.grossSales),
      orderCount: Number(sale.orderCount),
      paymentMode: (sale.paymentMode as any) || "UPI",
      cashCollection: Number(sale.cashCollection),
      upiCollection: Number(sale.upiCollection),
      cardCollection: Number(sale.cardCollection),
      notes: sale.notes || "",
    });
    setIsAddModalOpen(true);
  };

  const handleProductSelect = (productName: string) => {
    const matched = PRESET_PRODUCTS.find((p) => p.name === productName);
    if (matched) {
      const price = matched.price;
      const net = formData.quantity * price;
      setFormData((prev) => ({
        ...prev,
        productName: matched.name,
        category: matched.category,
        unitPrice: price,
        netSales: net,
        grossSales: Math.round(net * 1.05),
        upiCollection: prev.paymentMode === "UPI" ? net : prev.upiCollection,
        cashCollection: prev.paymentMode === "Cash" ? net : prev.cashCollection,
        cardCollection: prev.paymentMode === "Card" ? net : prev.cardCollection,
      }));
    }
  };

  const handleQuantityChange = (qty: number) => {
    const safeQty = Math.max(1, qty);
    const net = safeQty * formData.unitPrice;
    setFormData((prev) => ({
      ...prev,
      quantity: safeQty,
      orderCount: safeQty,
      netSales: net,
      grossSales: Math.round(net * 1.05),
      upiCollection: prev.paymentMode === "UPI" ? net : 0,
      cashCollection: prev.paymentMode === "Cash" ? net : 0,
      cardCollection: prev.paymentMode === "Card" ? net : 0,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side Zod validation
    const result = SaleFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setFormErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      const url = editingSale ? `/api/sales/${editingSale.id}` : "/api/sales";
      const method = editingSale ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(result.data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save sale.");
      }

      setIsAddModalOpen(false);
      fetchSales();
    } catch (err: any) {
      alert(err.message || "Failed to process sale.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sale: SaleRecord) => {
    if (
      !confirm(
        `Are you sure you want to delete this sale record for ${sale.productName} (₹${sale.netSales})?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("franchise_auth_token");
      const res = await fetch(`/api/sales/${sale.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete sale.");
      }

      fetchSales();
    } catch (err: any) {
      alert(err.message || "Failed to delete sale.");
    }
  };

  // Client-side quick filter
  const displayedSales = useMemo(() => {
    if (!searchQuery.trim()) return sales;
    const q = searchQuery.toLowerCase().trim();
    return sales.filter(
      (s) =>
        s.productName.toLowerCase().includes(q) ||
        s.outletId.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
    );
  }, [sales, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1 font-semibold">
            Financial Reconciliation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Sales Management & <span className="italic text-indigo-600">Revenue Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time daily transaction recording, revenue analytics, and cross-channel settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSales}
            disabled={loading}
            className="gap-1.5 cursor-pointer text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          {!isReadOnly && (
            <Button
              size="sm"
              onClick={handleOpenAdd}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer text-xs shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Record Sale</span>
            </Button>
          )}
        </div>
      </div>

      {/* Role Notice */}
      {isFranchise && (
        <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 px-3.5 py-2.5 text-xs text-emerald-900 dark:text-emerald-300">
          <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Single-Outlet Partition Active: You are viewing and recording sales strictly for your assigned outlet (<strong>{userOutlet}</strong>).
          </span>
        </div>
      )}

      {isReadOnly && (
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-[#0A1224] px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300">
          <Lock className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            Executive Read-Only Scope: Owners and Compliance Officers have access to monitor revenue and charts without modification privileges.
          </span>
        </div>
      )}

      {/* 4 Core Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Net Revenue */}
        <Card className="border border-white/10 bg-[#0B1020] text-slate-100 shadow-md">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Total Net Revenue
            </span>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                ₹{Number(summary.totalNetRevenue || 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span>Live</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Gross: <span className="text-white font-semibold">₹{Number(summary.totalGrossRevenue || 0).toLocaleString()}</span>{" "}
              <span className="text-slate-400 font-normal">(incl. taxes)</span>
            </p>
          </CardContent>
        </Card>

        {/* 2. Total Volume & Orders */}
        <Card className="border border-white/10 bg-[#0B1020] text-slate-100 shadow-md">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Total Volume & Orders
            </span>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                {Number(summary.totalOrders || 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/10 text-white border border-white/15 font-mono shadow-2xs">
                {Number(summary.totalUnits || 0).toLocaleString()} Units Sold
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Recorded across <span className="text-white font-semibold">{sales.length}</span> verified transaction batches
            </p>
          </CardContent>
        </Card>

        {/* 3. Average Ticket Size */}
        <Card className="border border-white/10 bg-[#0B1020] text-slate-100 shadow-md">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Average Ticket Size
            </span>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-violet-400 font-mono tracking-tight">
                ₹{Number(summary.avgTicket || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-300 font-medium bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                per order
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Normalized benchmark across QSR categories
            </p>
          </CardContent>
        </Card>

        {/* 4. Payment Settlement Mix */}
        <Card className="border border-white/10 bg-[#0B1020] text-slate-100 shadow-md">
          <CardHeader className="pb-1 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Payment Settlement Mix
            </span>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            <div className="space-y-1.5 mt-0.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-indigo-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  UPI {summary.upiShare}%
                </span>
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Cash {summary.cashShare}%
                </span>
                <span className="text-slate-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Card {summary.cardShare}%
                </span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-900/90 border border-white/10 p-0.5 gap-0.5">
                <div
                  style={{ width: `${summary.upiShare}%` }}
                  className="bg-indigo-500 rounded-full h-full transition-all"
                  title={`UPI: ${summary.upiShare}%`}
                />
                <div
                  style={{ width: `${summary.cashShare}%` }}
                  className="bg-emerald-500 rounded-full h-full transition-all"
                  title={`Cash: ${summary.cashShare}%`}
                />
                <div
                  style={{ width: `${summary.cardShare}%` }}
                  className="bg-slate-400 rounded-full h-full transition-all"
                  title={`Card: ${summary.cardShare}%`}
                />
              </div>
            </div>
            <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 pt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>100% daily POS reconciled</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section (6 Dedicated Views) */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sales Trends & Performance Visualizations
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time charting powered by PostgreSQL relational queries.
              </CardDescription>
            </div>

            {/* Chart Sub-Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveChartTab("daily")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeChartTab === "daily"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Daily Sales
              </button>
              <button
                onClick={() => setActiveChartTab("weekly")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeChartTab === "weekly"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Weekly Sales
              </button>
              <button
                onClick={() => setActiveChartTab("monthly")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeChartTab === "monthly"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Monthly Sales
              </button>
              <button
                onClick={() => setActiveChartTab("trend")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeChartTab === "trend"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Revenue Trend
              </button>
              <button
                onClick={() => setActiveChartTab("products")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeChartTab === "products"
                    ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                Product-Wise
              </button>
              {!isFranchise && (
                <>
                  <button
                    onClick={() => setActiveChartTab("outlets")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeChartTab === "outlets"
                        ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Outlet Comparison
                  </button>
                  <button
                    onClick={() => setActiveChartTab("trajectory")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeChartTab === "trajectory"
                        ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Network Trajectory
                  </button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            {/* 1. Daily Sales Chart */}
            {activeChartTab === "daily" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.dailySales || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(lbl) => `Date: ${lbl}`}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Daily Net Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 2. Weekly Sales Chart */}
            {activeChartTab === "weekly" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.weeklySales || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Weekly Revenue"]}
                    labelFormatter={(lbl) => `Week: ${lbl}`}
                  />
                  <Bar dataKey="revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Weekly Sales" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 3. Monthly Sales Chart */}
            {activeChartTab === "monthly" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlySales || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Monthly Revenue"]}
                    labelFormatter={(lbl) => `Month: ${lbl}`}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Monthly Sales" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 4. Revenue Trend Chart */}
            {activeChartTab === "trend" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(lbl) => `Date: ${lbl}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    name="Daily Trend"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* 5. Product-wise Sales Chart */}
            {activeChartTab === "products" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(charts.productWiseSales || []).slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 70, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="product" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === "revenue" ? `₹${Number(val).toLocaleString()}` : val,
                      name === "revenue" ? "Revenue" : "Units",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 6. Outlet Comparison Chart */}
            {activeChartTab === "outlets" && !isFranchise && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.outletComparison || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="outletId" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(lbl, p: any) => `${p[0]?.payload?.name || lbl} (${lbl})`}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Outlet Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* 7. Network Trajectory Graph */}
            {activeChartTab === "trajectory" && !isFranchise && (
              <div className="h-full w-full overflow-y-auto">
                <NetworkTrajectoryGraph />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3 w-full max-w-full box-border">
        <div className="flex flex-wrap items-center gap-3 w-full max-w-full box-border">
          {/* Search input */}
          <div className="relative flex-1 min-w-[220px] max-w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search product, outlet, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 w-full min-w-0 box-border"
            />
          </div>

          {/* Filter by Outlet */}
          {!isFranchise && (
            <div className="w-full sm:w-auto min-w-[170px] flex-1 sm:flex-initial max-w-full">
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer box-border"
              >
                <option value="All Outlets">Filter by Outlet: All</option>
                <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
                <option value="OUT-055">OUT-055 (Pune FC Road)</option>
                <option value="OUT-073">OUT-073 (Jaipur MI Road)</option>
              </select>
            </div>
          )}

          {/* Filter by Product */}
          <div className="w-full sm:w-auto min-w-[170px] flex-1 sm:flex-initial max-w-full">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer box-border"
            >
              <option value="All Products">Filter by Product: All</option>
              {PRESET_PRODUCTS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Category */}
          <div className="w-full sm:w-auto min-w-[160px] flex-1 sm:flex-initial max-w-full">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer box-border"
            >
              <option value="All Categories">Filter by Category: All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Date Range */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:flex-initial min-w-0 max-w-full box-border">
            <div className="flex-1 sm:w-36 min-w-0">
              <Input
                type="date"
                title="Starting Date"
                aria-label="Starting Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-[11px] sm:text-xs h-9 px-2 w-full min-w-0 box-border text-slate-700 dark:text-slate-200 cursor-pointer"
                placeholder="Start"
              />
            </div>
            <span className="text-slate-400 text-xs font-medium shrink-0 select-none">to</span>
            <div className="flex-1 sm:w-36 min-w-0">
              <Input
                type="date"
                title="Ending Date"
                aria-label="Ending Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-[11px] sm:text-xs h-9 px-2 w-full min-w-0 box-border text-slate-700 dark:text-slate-200 cursor-pointer"
                placeholder="End"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters helper */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Showing {displayedSales.length} recorded sales entries</span>
          {(selectedOutlet !== "All Outlets" ||
            selectedProduct !== "All Products" ||
            selectedCategory !== "All Categories" ||
            startDate ||
            endDate ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedOutlet("All Outlets");
                setSelectedProduct("All Products");
                setSelectedCategory("All Categories");
                setStartDate("");
                setEndDate("");
                setSearchQuery("");
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Sales Transactions Ledger - Responsive Vertical Card Layout */}
      <div className="space-y-3 w-full max-w-full box-border">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Verified Sales Ledger ({displayedSales.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {displayedSales.length} items
          </span>
        </div>

        {displayedSales.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
            <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No sales records found</p>
            <p className="text-xs text-slate-400 mt-1">No sales records match the active filters or search criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-full box-border">
            {displayedSales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 w-full max-w-full box-border min-w-0 space-y-3"
              >
                {/* Header: Product Name + Net Sales Amount */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                      Sale #{sale.id} · {sale.date}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {sale.productName}
                    </h4>
                    {sale.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        {sale.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 block">
                      ₹{Number(sale.netSales).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      POS Settled
                    </span>
                  </div>
                </div>

                {/* Vertical Label-Value rows */}
                <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* Outlet */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-1 first:pt-0">
                    <span className="text-slate-400 font-medium shrink-0">Outlet:</span>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 sm:self-end">
                      {sale.outletId}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                    <span className="text-slate-400 font-medium shrink-0">Category:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium sm:text-right">
                      {sale.category}
                    </span>
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pt-2">
                    <span className="text-slate-400 font-medium shrink-0">Quantity & Price:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 sm:text-right">
                      {sale.quantity} units @ ₹{sale.unitPrice}
                    </span>
                  </div>

                  {/* Payment Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-2">
                    <span className="text-slate-400 font-medium shrink-0">Payment Mode:</span>
                    <div className="sm:self-end">
                      <Badge
                        variant="outline"
                        className={
                          sale.paymentMode === "UPI"
                            ? "text-indigo-600 border-indigo-500/30 text-[10px]"
                            : sale.paymentMode === "Cash"
                            ? "text-emerald-600 border-emerald-500/30 text-[10px]"
                            : "text-slate-300 border-white/10 text-[10px]"
                        }
                      >
                        {sale.paymentMode}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions row if editable */}
                {!isReadOnly && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(sale)}
                      className="h-8 text-xs gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(sale)}
                      className="h-8 text-xs gap-1.5 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Sale Modal Dialog (Validated with Zod) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {editingSale ? "Edit Sale Record" : "Record New Sale"}
                </h3>
                <p className="text-xs text-slate-500">
                  PostgreSQL data validation enforced with Zod schemas.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {/* Outlet & Date */}
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
                      value={formData.outletId}
                      onChange={(e) => setFormData({ ...formData, outletId: e.target.value })}
                      className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="OUT-042">OUT-042 (Lucknow Flagship)</option>
                      <option value="OUT-089">OUT-089 (Noida Sector 18)</option>
                      <option value="OUT-114">OUT-114 (Bengaluru Koramangala)</option>
                      <option value="OUT-019">OUT-019 (Delhi CP Inner)</option>
                      <option value="OUT-055">OUT-055 (Pune FC Road)</option>
                      <option value="OUT-073">OUT-073 (Jaipur MI Road)</option>
                    </select>
                  )}
                  {formErrors.outletId && (
                    <span className="text-[10px] text-red-500">{formErrors.outletId}</span>
                  )}
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Transaction Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-8 text-xs"
                    required
                  />
                  {formErrors.date && (
                    <span className="text-[10px] text-red-500">{formErrors.date}</span>
                  )}
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Product / SKU
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.productName}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    {PRESET_PRODUCTS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name} — ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.productName && (
                  <span className="text-[10px] text-red-500">{formErrors.productName}</span>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-8 rounded border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Unit Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Quantity (Units)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                    required
                  />
                  {formErrors.quantity && (
                    <span className="text-[10px] text-red-500">{formErrors.quantity}</span>
                  )}
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Unit Price (₹)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.unitPrice}
                    onChange={(e) => {
                      const price = Number(e.target.value);
                      const net = formData.quantity * price;
                      setFormData({
                        ...formData,
                        unitPrice: price,
                        netSales: net,
                        grossSales: Math.round(net * 1.05),
                      });
                    }}
                    className="h-8 text-xs font-mono"
                    required
                  />
                  {formErrors.unitPrice && (
                    <span className="text-[10px] text-red-500">{formErrors.unitPrice}</span>
                  )}
                </div>
              </div>

              {/* Revenue Calculations */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    Calculated Net Sales
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    ₹{formData.netSales.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    Gross (with 5% GST)
                  </span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    ₹{formData.grossSales.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["UPI", "Cash", "Card"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMode: mode,
                          upiCollection: mode === "UPI" ? prev.netSales : 0,
                          cashCollection: mode === "Cash" ? prev.netSales : 0,
                          cardCollection: mode === "Card" ? prev.netSales : 0,
                        }))
                      }
                      className={`py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                        formData.paymentMode === mode
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Notes / Batch Description
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Peak lunch dine-in rush, takeout orders"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                >
                  {isSubmitting ? "Validating & Saving..." : editingSale ? "Update Sale" : "Save Sale to PostgreSQL"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
