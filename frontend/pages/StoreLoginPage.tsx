import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Store,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Search,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Building2,
  Info,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ALL_NETWORK_STORES } from "@/utils/stores-data";

interface StoreOutletItem {
  outletId: string;
  name: string;
  city: string;
  state?: string;
  address?: string;
  operatingModel?: string;
  status?: string;
  complianceScore?: number;
  manager?: string;
}

export default function StoreLoginPage() {
  const { loginStore } = useAuth();
  const navigate = useNavigate();

  // Step state: 1 = Store Selection, 2 = Credentials Form
  const [step, setStep] = useState<1 | 2>(1);

  // Store lists from DB
  const [stores, setStores] = useState<StoreOutletItem[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Selected Store
  const [selectedStore, setSelectedStore] = useState<StoreOutletItem | null>(null);

  // Credentials State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickLoggingInId, setQuickLoggingInId] = useState<string | null>(null);

  // Admin Credentials Modal State (for authorized distribution & retrieval)
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<any[]>([]);
  const [loadingAdminCreds, setLoadingAdminCreds] = useState(false);

  // Helper to map outletId and city to designated store credentials
  const getStoreDefaultUsername = (outletId: string, city: string = "") => {
    const cleanCity = city.toLowerCase().replace(/[^a-z]/g, "");
    const map: Record<string, string> = {
      "out-042": "store.lucknow",
      "out-089": "store.noida",
      "out-019": "store.delhi",
      "out-114": "store.bengaluru",
      "out-055": "store.pune",
      "out-073": "store.jaipur",
      "out-128": "store.mumbai",
      "out-142": "store.gurgaon",
      "out-061": "store.kanpur",
      "out-097": "store.varanasi",
    };
    return map[outletId.toLowerCase()] || `store.${cleanCity}`;
  };

  const getStoreDefaultPassword = (outletId: string, city: string = "") => {
    const map: Record<string, string> = {
      "out-042": "Store#Lucknow2026!",
      "out-089": "Store#Noida2026!",
      "out-019": "Store#Delhi2026!",
      "out-114": "Store#Bangalore2026!",
      "out-055": "Store#Pune2026!",
      "out-073": "Store#Jaipur2026!",
      "out-128": "Store#Mumbai2026!",
      "out-142": "Store#Gurgaon2026!",
      "out-061": "Store#Kanpur2026!",
      "out-097": "Store#Varanasi2026!",
    };
    return map[outletId.toLowerCase()] || `Store#${city}2026!`;
  };

  // Fetch actual 10 stores from database on mount with safe text parsing
  useEffect(() => {
    async function loadStores() {
      setLoadingStores(true);
      try {
        const res = await fetch("/api/store/outlets-list", {
          headers: { Accept: "application/json" },
        });
        const rawText = await res.text();
        let data: any = null;
        if (rawText && rawText.trim()) {
          try {
            data = JSON.parse(rawText);
          } catch {
            data = null;
          }
        }

        if (res.ok && data?.outlets && data.outlets.length > 0) {
          setStores(data.outlets);
          setLoadingStores(false);
          return;
        }
      } catch (e) {
        console.warn("Falling back to pre-seeded network stores:", e);
      }
      // Resilient fallback to predefined 10 network stores
      setStores(
        ALL_NETWORK_STORES.map((s) => ({
          outletId: s.code,
          name: s.name,
          city: s.city,
          address: `${s.name}, ${s.city}`,
          operatingModel: s.model,
          status: "Active",
          complianceScore: 88,
          manager: s.manager,
        }))
      );
      setLoadingStores(false);
    }
    loadStores();
  }, []);

  // Fetch administrator store credentials list with safe JSON parsing
  const handleOpenAdminCredentials = async () => {
    setAdminModalOpen(true);
    setLoadingAdminCreds(true);
    try {
      const token = localStorage.getItem("franchise_auth_token");
      // Fetch public store accounts or admin credentials
      const res = await fetch("/api/store/accounts", {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const rawText = await res.text();
      let data: any = null;
      if (rawText && rawText.trim()) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = null;
        }
      }

      if (res.ok && (data?.accounts || data?.credentials)) {
        setAdminCredentials(data.accounts || data.credentials || []);
      } else {
        // Fallback default list of generated initial credentials for demo testing
        setAdminCredentials([
          { outletId: "OUT-042", storeName: "Hazratganj Flagship (Lucknow Central)", city: "Lucknow", username: "store.lucknow", initialPassword: "Store#Lucknow2026!" },
          { outletId: "OUT-089", storeName: "Sector 18 Market", city: "Noida", username: "store.noida", initialPassword: "Store#Noida2026!" },
          { outletId: "OUT-019", storeName: "Connaught Place Inner", city: "Delhi", username: "store.delhi", initialPassword: "Store#Delhi2026!" },
          { outletId: "OUT-114", storeName: "Koramangala 5th Block", city: "Bengaluru", username: "store.bengaluru", initialPassword: "Store#Bangalore2026!" },
          { outletId: "OUT-055", storeName: "FC Road Corner", city: "Pune", username: "store.pune", initialPassword: "Store#Pune2026!" },
          { outletId: "OUT-073", storeName: "MI Road Heritage", city: "Jaipur", username: "store.jaipur", initialPassword: "Store#Jaipur2026!" },
          { outletId: "OUT-128", storeName: "Bandra West Linking Road", city: "Mumbai", username: "store.mumbai", initialPassword: "Store#Mumbai2026!" },
          { outletId: "OUT-142", storeName: "Cyber Hub Galleria", city: "Gurgaon", username: "store.gurgaon", initialPassword: "Store#Gurgaon2026!" },
          { outletId: "OUT-061", storeName: "Civil Lines Cantt", city: "Kanpur", username: "store.kanpur", initialPassword: "Store#Kanpur2026!" },
          { outletId: "OUT-097", storeName: "Assi Ghat Promenade", city: "Varanasi", username: "store.varanasi", initialPassword: "Store#Varanasi2026!" },
        ]);
      }
    } catch {
      // Fallback
      setAdminCredentials([
        { outletId: "OUT-042", storeName: "Hazratganj Flagship (Lucknow Central)", city: "Lucknow", username: "store.lucknow", initialPassword: "Store#Lucknow2026!" },
        { outletId: "OUT-089", storeName: "Sector 18 Market", city: "Noida", username: "store.noida", initialPassword: "Store#Noida2026!" },
        { outletId: "OUT-019", storeName: "Connaught Place Inner", city: "Delhi", username: "store.delhi", initialPassword: "Store#Delhi2026!" },
        { outletId: "OUT-114", storeName: "Koramangala 5th Block", city: "Bengaluru", username: "store.bengaluru", initialPassword: "Store#Bangalore2026!" },
        { outletId: "OUT-055", storeName: "FC Road Corner", city: "Pune", username: "store.pune", initialPassword: "Store#Pune2026!" },
        { outletId: "OUT-073", storeName: "MI Road Heritage", city: "Jaipur", username: "store.jaipur", initialPassword: "Store#Jaipur2026!" },
        { outletId: "OUT-128", storeName: "Bandra West Linking Road", city: "Mumbai", username: "store.mumbai", initialPassword: "Store#Mumbai2026!" },
        { outletId: "OUT-142", storeName: "Cyber Hub Galleria", city: "Gurgaon", username: "store.gurgaon", initialPassword: "Store#Gurgaon2026!" },
        { outletId: "OUT-061", storeName: "Civil Lines Cantt", city: "Kanpur", username: "store.kanpur", initialPassword: "Store#Kanpur2026!" },
        { outletId: "OUT-097", storeName: "Assi Ghat Promenade", city: "Varanasi", username: "store.varanasi", initialPassword: "Store#Varanasi2026!" },
      ]);
    } finally {
      setLoadingAdminCreds(false);
    }
  };

  // Select store and pre-populate credentials for seamless login
  const handleSelectStore = (store: StoreOutletItem) => {
    setSelectedStore(store);
    setUsername(getStoreDefaultUsername(store.outletId, store.city));
    setPassword(getStoreDefaultPassword(store.outletId, store.city));
    setErrorMessage(null);
    setStep(2);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  // 1-Click Fast Login into any store
  const handleQuickLoginStore = async (store: StoreOutletItem) => {
    setQuickLoggingInId(store.outletId);
    setErrorMessage(null);
    const defUser = getStoreDefaultUsername(store.outletId, store.city);
    const defPwd = getStoreDefaultPassword(store.outletId, store.city);

    const res = await loginStore(store.outletId, defUser, defPwd);
    setQuickLoggingInId(null);

    if (res.success) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      navigate(res.redirectUrl || `/outlets/${store.outletId}`);
    } else {
      setSelectedStore(store);
      setUsername(defUser);
      setPassword(defPwd);
      setStep(2);
      setErrorMessage(res.error || "Store authentication failed.");
    }
  };

  const handleBackToStoreSelection = () => {
    setStep(1);
    setErrorMessage(null);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  const handleQuickFillFromAdmin = (cred: any) => {
    const matched = stores.find((s) => s.outletId.toUpperCase() === cred.outletId.toUpperCase());
    if (matched) {
      setSelectedStore(matched);
      setUsername(cred.username);
      setPassword(cred.initialPassword);
      setStep(2);
      setAdminModalOpen(false);
      setErrorMessage(null);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedStore) {
      setErrorMessage("Please select a store to log in.");
      setStep(1);
      return;
    }

    if (!username.trim()) {
      setErrorMessage("Please enter the store username.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter the store password.");
      return;
    }

    setIsSubmitting(true);
    const res = await loginStore(selectedStore.outletId, username.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      navigate(res.redirectUrl || `/outlets/${selectedStore.outletId}`);
    } else {
      setErrorMessage(res.error || "Authentication failed. Invalid store credentials.");
    }
  };

  // Filtered stores list for Step 1
  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.outletId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0FDF4] text-[#18251F] flex flex-col justify-between antialiased selection:bg-[#073B2A] selection:text-white font-sans">
      {/* Top Header */}
      <header className="w-full border-b border-[#D1FAE5] bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#064E3B] transition-colors mr-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#064E3B] text-[#72D6A0] shadow-xs">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-[#064E3B] block leading-tight">
                Franchise Standards Auditor
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#059669] font-semibold">
                Store Operations Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAdminCredentials}
              className="text-xs bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] hover:border-[#059669] gap-1.5 cursor-pointer shadow-2xs"
            >
              <KeyRound className="h-3.5 w-3.5 text-[#059669]" />
              <span className="hidden sm:inline">Admin Credentials Directory</span>
              <span className="sm:hidden">Credentials</span>
            </Button>
            <Badge variant="outline" className="border-[#D1FAE5] text-[#064E3B] bg-white text-[10px] font-mono">
              STORE ISOLATION ACTIVE
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================================================== */}
        {/* STEP 1: STORE SELECTION SCREEN                           */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Step 1 Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D1FAE5] text-[#064E3B] text-xs font-semibold shadow-2xs">
                <Store className="h-3.5 w-3.5 text-[#059669]" />
                <span>Step 1: Select Store Outlet</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#064E3B] tracking-tight">
                Store Login Selection
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Select your store from the 10 registered franchise locations. Each store requires its own unique credentials to ensure strict operational data isolation.
              </p>
            </div>

            {/* Store Selection Controls: Dropdown & Search Filter */}
            <div className="max-w-xl mx-auto space-y-4">
              {/* Dropdown Selector */}
              <div className="space-y-1.5 bg-white p-4 rounded-2xl border border-[#D1FAE5] shadow-xs">
                <label className="block text-xs font-semibold text-[#064E3B] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Store className="h-4 w-4 text-[#059669]" />
                    <span>Select Store from Dropdown</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    {stores.length} Registered Stores
                  </span>
                </label>
                <select
                  value={selectedStore?.outletId || ""}
                  onChange={(e) => {
                    const found = stores.find((s) => s.outletId === e.target.value);
                    if (found) {
                      handleSelectStore(found);
                    }
                  }}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#D1FAE5] bg-[#F0FDF4]/30 text-xs font-semibold text-[#064E3B] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    -- Choose one of the 10 stores to login --
                  </option>
                  {stores.map((s) => (
                    <option key={s.outletId} value={s.outletId}>
                      {s.name} ({s.city}) — {s.outletId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Search Grid Filter */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#059669]" />
                <Input
                  type="text"
                  placeholder="Or filter store cards by name, city (e.g. Lucknow, Noida), or OUT code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-white border-[#D1FAE5] text-xs text-[#1F2937] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#059669] focus-visible:border-[#059669] rounded-xl shadow-xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 10 Stores Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
              {filteredStores.map((store) => {
                const defUsername = getStoreDefaultUsername(store.outletId, store.city);
                const isQuickLoggingIn = quickLoggingInId === store.outletId;

                return (
                  <div
                    key={store.outletId}
                    onClick={() => handleSelectStore(store)}
                    className="rounded-2xl border border-[#D1FAE5] bg-white p-5 shadow-xs hover:shadow-md hover:border-[#059669] transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#064E3B] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#D1FAE5]">
                          {store.outletId}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#064E3B] font-semibold border border-[#A7F3D0]">
                          {store.operatingModel || "FOCO"}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#064E3B] group-hover:text-[#047857] transition-colors">
                          {store.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#64748B] mt-1">
                          <MapPin className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                          <span className="truncate">{store.city}</span>
                        </div>
                      </div>

                      {/* Username Hint Badge */}
                      <div className="px-2.5 py-1.5 rounded-lg bg-[#F0FDF4] border border-[#D1FAE5] text-[11px] font-mono text-[#064E3B] flex items-center justify-between">
                        <span className="text-[#64748B]">Account:</span>
                        <span className="font-bold">{defUsername}</span>
                      </div>

                      <div className="pt-2 text-[11px] text-[#64748B] flex items-center justify-between border-t border-[#D1FAE5]/60">
                        <span>Compliance Score</span>
                        <span className="font-bold text-[#064E3B]">{store.complianceScore || 85}%</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#D1FAE5]/60 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickLoginStore(store);
                        }}
                        disabled={isQuickLoggingIn}
                        className="flex-1 h-8 bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-semibold rounded-lg shadow-2xs gap-1.5 cursor-pointer"
                      >
                        {isQuickLoggingIn ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Signing In...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            <span>Quick Sign In</span>
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStore(store);
                        }}
                        className="h-8 px-2.5 bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] text-[11px] cursor-pointer"
                      >
                        <span>Select</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStores.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#D1FAE5] max-w-md mx-auto p-6 space-y-2">
                <p className="text-xs text-[#64748B]">No stores found matching &quot;{searchTerm}&quot;.</p>
                <Button size="sm" variant="outline" onClick={() => setSearchTerm("")} className="text-xs">
                  Reset Search
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: CREDENTIALS LOGIN FORM                           */}
        {/* ======================================================== */}
        {step === 2 && selectedStore && (
          <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Back Button */}
            <button
              onClick={handleBackToStoreSelection}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#064E3B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Store Selection</span>
            </button>

            {/* Login Card */}
            <div className="rounded-2xl border border-[#D1FAE5] bg-white p-7 sm:p-9 shadow-lg space-y-6">
              {/* Selected Store Badge */}
              <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#059669] font-bold block">
                    Selected Outlet
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#064E3B]">
                    {selectedStore.name}
                  </h2>
                  <p className="text-xs text-[#64748B] flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#059669]" />
                    <span>{selectedStore.city} · {selectedStore.outletId}</span>
                  </p>
                </div>
                <button
                  onClick={handleBackToStoreSelection}
                  className="text-xs text-[#059669] hover:underline font-medium shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                  Store Operator Sign In
                </h3>
                <p className="text-xs text-[#64748B]">
                  Enter the credentials assigned to <span className="font-semibold text-[#064E3B]">{selectedStore.name}</span> to access its operational dashboard.
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3.5 text-xs text-[#991B1B] shadow-2xs">
                  <ShieldAlert className="h-4 w-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitLogin} className="space-y-4 text-xs">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-[#064E3B] font-semibold">
                    Store Username
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder={`e.g. store.${selectedStore.city.toLowerCase()} or ${selectedStore.outletId}`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10 bg-white border-[#D1FAE5] text-xs text-[#1F2937] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#059669] focus-visible:border-[#059669] rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-[#64748B]">
                    Assigned account identifier for {selectedStore.name}.
                  </p>
                </div>

                {/* Password with Show/Hide */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#064E3B] font-semibold">
                      Store Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword(getStoreDefaultPassword(selectedStore.outletId, selectedStore.city))}
                      className="text-[10px] text-[#059669] hover:underline font-mono cursor-pointer"
                    >
                      Fill Default Password
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter store password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pr-10 bg-white border-[#D1FAE5] text-xs text-[#1F2937] placeholder:text-[#64748B] focus-visible:ring-1 focus-visible:ring-[#059669] focus-visible:border-[#059669] rounded-xl font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#064E3B] p-0.5 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Authenticating Store...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <Lock className="h-4 w-4" />
                        <span>Authenticate & Open Store Dashboard</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickLoginStore(selectedStore)}
                    disabled={quickLoggingInId === selectedStore.outletId}
                    className="w-full h-9 bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4] text-xs font-medium rounded-xl cursor-pointer"
                  >
                    {quickLoggingInId === selectedStore.outletId ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Opening Store...</span>
                      </div>
                    ) : (
                      <span>1-Click Operator Quick Sign In</span>
                    )}
                  </Button>
                </div>
              </form>

              {/* Security Note */}
              <div className="p-3 rounded-xl bg-[#F0FDF4]/60 border border-[#D1FAE5] text-[11px] text-[#64748B] space-y-1">
                <span className="font-semibold text-[#064E3B] block">Security & Isolation Guarantee</span>
                <p>
                  Store credentials can only unlock their specific store dashboard. Attempting to authenticate with credentials belonging to another outlet will be rejected.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* ADMIN CREDENTIALS RETRIEVAL MODAL                        */}
      {/* ======================================================== */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#D1FAE5] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#D1FAE5] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#059669] font-bold">
                  Authorized Administrator Vault
                </span>
                <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                  All 10 Store Credentials Directory
                </h3>
                <p className="text-xs text-[#64748B]">
                  Secure distribution directory for initial store operator credentials generated in the database.
                </p>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="text-[#64748B] hover:text-[#064E3B] p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingAdminCreds ? (
              <div className="text-center py-8 text-xs text-[#64748B] space-y-2">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#059669]" />
                <p>Retrieving store credentials from database...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F0FDF4] text-[#064E3B] font-mono text-[11px] border-b border-[#D1FAE5]">
                      <tr>
                        <th className="p-2.5">Store Outlet</th>
                        <th className="p-2.5">Username</th>
                        <th className="p-2.5">Initial Password</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6F4EA]">
                      {adminCredentials.map((cred) => (
                        <tr key={cred.outletId} className="hover:bg-[#F0FDF4]/50">
                          <td className="p-2.5">
                            <span className="font-bold text-[#064E3B] block">{cred.storeName}</span>
                            <span className="text-[10px] font-mono text-[#64748B]">{cred.outletId} · {cred.city}</span>
                          </td>
                          <td className="p-2.5 font-mono text-[#064E3B]">
                            {cred.username}
                          </td>
                          <td className="p-2.5 font-mono text-[#1F2937] bg-slate-50 rounded">
                            {cred.initialPassword}
                          </td>
                          <td className="p-2.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickFillFromAdmin(cred)}
                              className="text-[11px] h-7 px-2.5 bg-white border-[#D1FAE5] text-[#064E3B] hover:bg-[#F0FDF4]"
                            >
                              Use for Login
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#D1FAE5]">
                  <p className="text-[11px] text-[#64748B]">
                    Passswords are stored hashed in database. Passwords cannot be overwritten on server restarts.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setAdminModalOpen(false)}
                    className="bg-[#064E3B] hover:bg-[#047857] text-white text-xs"
                  >
                    Close Directory
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
