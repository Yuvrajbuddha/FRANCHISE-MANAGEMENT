import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface TopNavProps {
  onToggleSidebar: () => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Executive Overview";
    if (path.startsWith("/outlets/")) return "Outlet Dossier";
    if (path === "/outlets") return "Stores Directory";
    if (path === "/compliance") return "Officer Dashboard";
    if (path.startsWith("/compliance/review/")) return "Evidence Review Audit";
    if (path === "/evidence") return "CCTV Evidence Vault";
    if (path === "/risk") return "Risk Intelligence";
    if (path === "/alerts") return "Active Alerts";
    if (path === "/complaints") return "Complaints Registry";
    if (path === "/sales") return "Sales & POS Reports";
    if (path === "/inventory") return "On-Hand Physical Stock";
    if (path.startsWith("/inventory/reconciliation")) return "Reconciliation & Anomaly Audits";
    if (path === "/supply") return "Company Supply";
    if (path === "/corrective-actions") return "Corrective Actions (CAPA)";
    if (path === "/reports") return "Audit & Compliance Reports";
    return "Workspace";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#DDE5DC] bg-[#FFFDF8]/90 px-4 backdrop-blur-md lg:px-6 shadow-2xs">
      {/* Mobile toggle + Contextual Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDE5DC] text-[#073B2A] hover:bg-[#F6F1E7] lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium">
          <Link to="/" className="text-[#738078] hover:text-[#073B2A] transition-colors">
            Franchise Standards
          </Link>
          <span className="text-[#DDE5DC]">/</span>
          <span className="font-semibold text-[#073B2A]">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right Controls: Role Badge + User Info + Sign Out */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAE3D2]/70 border border-[#DDE5DC] text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-[#13845B]" />
              <span className="font-medium text-[#073B2A]">
                {user.role === "FRANCHISE" ? `Store (${user.assignedOutletId})` : user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-[#073B2A] bg-[#FFFDF8] border border-[#DDE5DC] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => navigate("/login")}
            className="bg-[#073B2A] hover:bg-[#05291F] text-white rounded-lg text-xs shadow-xs font-semibold"
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
