import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  Building,
  RefreshCw,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";

interface TopNavProps {
  onToggleSidebar: () => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

const cities = [
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
  "Hyderabad",
];

export function TopNav({
  onToggleSidebar,
  selectedCity = "All Cities",
  onCityChange,
}: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
      {/* Zone 1: Mobile toggle + Breadcrumb / Network Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <Link to="/" className="font-semibold text-slate-900 dark:text-slate-100 hover:underline">
            Franchise Performance & Compliance
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500 hidden sm:inline dark:text-slate-400">
            {user?.role === "FRANCHISE"
              ? `Assigned: ${user.assignedOutletName || user.assignedOutletId}`
              : "National Operations"}
          </span>
          {user?.role !== "FRANCHISE" && (
            <span className="hidden md:inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Building className="h-3 w-3" /> 148 Units
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: Search + Context Filter (Only for organization-wide roles) */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder={
              user?.role === "FRANCHISE"
                ? "Search your outlet records..."
                : "Search outlet code, city, franchisee, or manager..."
            }
            className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
          />
        </div>

        {user?.role !== "FRANCHISE" && (
          <select
            value={selectedCity}
            onChange={(e) => onCityChange?.(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Zone 3: Actions, Notifications & Role Indicator */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-tight text-slate-800 font-mono">
            {user?.role}
          </span>
        </div>

        {/* User quick menu or login link */}
        {user ? (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-500">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-slate-100 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button size="sm" onClick={() => navigate("/login")}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
