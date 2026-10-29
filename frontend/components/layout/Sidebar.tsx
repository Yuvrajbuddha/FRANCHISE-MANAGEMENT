import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  TrendingUp,
  Boxes,
  ShieldCheck,
  Video,
  AlertTriangle,
  FileCheck2,
  FileBarChart,
  MessageSquareWarning,
  Flame,
  Truck,
  Shield,
  LogOut,
  Scale,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "warning" | "destructive";
  allowedRoles?: UserRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar({ isOpen = true, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userRole = user?.role || "OFFICER";

  const navGroups: NavGroup[] = [
    {
      label: "Core Overview",
      items: [
        {
          title: "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE", "OFFICER"],
        },
        {
          title: userRole === "FRANCHISE" ? "My Outlet Dossier" : "Stores Directory",
          href: userRole === "FRANCHISE" ? `/outlets/${user?.assignedOutletId || "OUT-042"}` : "/outlets",
          icon: Store,
          badge: userRole === "FRANCHISE" ? user?.assignedOutletId : "10 Outlets",
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE", "OFFICER"],
        },
      ],
    },
    {
      label: "Audits & Evidence",
      items: [
        {
          title: "Officer Dashboard",
          href: "/compliance",
          icon: ShieldCheck,
          allowedRoles: ["ADMIN", "OFFICER"],
        },
        {
          title: "CCTV Evidence Vault",
          href: "/evidence",
          icon: Video,
          allowedRoles: ["ADMIN", "OWNER", "OFFICER", "FRANCHISE"],
        },
        {
          title: "Inventory Stock",
          href: "/inventory",
          icon: Boxes,
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE"],
        },
        {
          title: "Reconciliation Audits",
          href: "/inventory/reconciliation",
          icon: Scale,
          allowedRoles: ["ADMIN", "OWNER", "OFFICER", "FRANCHISE"],
        },
        {
          title: "Company Supply",
          href: "/supply",
          icon: Truck,
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE"],
        },
        {
          title: "Sales & POS Reports",
          href: "/sales",
          icon: TrendingUp,
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE"],
        },
      ],
    },
    {
      label: "Risk & Complaints",
      items: [
        {
          title: "Risk Intelligence",
          href: "/risk",
          icon: Flame,
          allowedRoles: ["ADMIN", "OFFICER"],
        },
        {
          title: "Active Alerts",
          href: "/alerts",
          icon: AlertTriangle,
          badge: "6 Active",
          badgeVariant: "warning",
          allowedRoles: ["ADMIN", "OFFICER"],
        },
        {
          title: "Complaints Registry",
          href: "/complaints",
          icon: MessageSquareWarning,
          allowedRoles: ["ADMIN", "OFFICER", "OWNER"],
        },
      ],
    },
    {
      label: "Resolution & Reports",
      items: [
        {
          title: "Corrective Actions (CAPA)",
          href: "/corrective-actions",
          icon: FileCheck2,
          allowedRoles: ["ADMIN", "OFFICER", "FRANCHISE", "OWNER"],
        },
        {
          title: "Executive Reports",
          href: "/reports",
          icon: FileBarChart,
          allowedRoles: ["ADMIN", "OFFICER", "OWNER"],
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-68 flex-col border-r border-[#0D4E39] bg-[#073B2A] text-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center gap-3 border-b border-[#0D4E39] bg-[#05291F] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#13845B] text-[#72D6A0] border border-[#72D6A0]/30 font-bold shadow-xs shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-base font-bold tracking-tight text-white truncate">
              Franchise Standards
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#72D6A0] font-semibold">
              Auditor Platform
            </span>
          </div>
        </div>

        {/* Navigation list filtered by role */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.label} className="space-y-1.5">
                <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-[#72D6A0]/70 uppercase">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all",
                          isActive
                            ? "bg-[#0D4E39] text-[#72D6A0] font-semibold shadow-xs ring-1 ring-[#72D6A0]/30"
                            : "text-[#CAD5C9] hover:bg-[#05291F] hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive
                                ? "text-[#72D6A0]"
                                : "text-[#CAD5C9]/70 group-hover:text-white"
                            )}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold",
                              item.badgeVariant === "warning"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-[#05291F] text-[#72D6A0] border border-[#0D4E39]"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* User Card & Logout Button */}
        <div className="border-t border-[#0D4E39] bg-[#05291F] p-3.5">
          <div className="flex items-center justify-between rounded-xl border border-[#0D4E39] bg-[#073B2A] p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#13845B] text-white font-bold text-xs border border-[#72D6A0]/30">
                {user?.name ? user.name[0] : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.name || "Guest Officer"}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#CAD5C9]">
                  <span className="font-semibold text-[#72D6A0]">{userRole}</span>
                  {user?.assignedOutletId && (
                    <span className="text-[#CAD5C9]/80">· {user.assignedOutletId}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-[#CAD5C9] hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
