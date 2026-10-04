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
  Building2,
  LogOut,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
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
          title: userRole === "FRANCHISE" ? "My Assigned Outlet" : "Outlets Directory",
          href: userRole === "FRANCHISE" ? `/outlets/${user?.assignedOutletId || "OUT-042"}` : "/outlets",
          icon: Store,
          badge: userRole === "FRANCHISE" ? user?.assignedOutletId : "148",
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE", "OFFICER"],
        },
      ],
    },
    {
      label: "Supply & Sales",
      items: [
        {
          title: "Sales Analytics",
          href: "/sales",
          icon: TrendingUp,
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE"],
        },
        {
          title: "Inventory & Stock",
          href: "/inventory",
          icon: Boxes,
          allowedRoles: ["ADMIN", "OWNER", "FRANCHISE"],
        },
        {
          title: "Company Supply",
          href: "/supply",
          icon: Truck,
          allowedRoles: ["ADMIN", "OWNER"],
        },
      ],
    },
    {
      label: "Compliance & Risk",
      items: [
        {
          title: "Officer Dashboard",
          href: "/compliance",
          icon: ShieldCheck,
          allowedRoles: ["ADMIN", "OWNER", "OFFICER"],
        },
        {
          title: "Store Evidence",
          href: "/evidence",
          icon: Video,
          allowedRoles: ["ADMIN", "OWNER", "OFFICER", "FRANCHISE"],
        },
        {
          title: "Risk Intelligence",
          href: "/risk",
          icon: Flame,
          allowedRoles: ["ADMIN", "OWNER", "OFFICER"],
        },
        {
          title: "Active Alerts",
          href: "/alerts",
          icon: AlertTriangle,
          badge: "6",
          badgeVariant: "warning",
          allowedRoles: ["ADMIN", "OWNER", "OFFICER"],
        },
        {
          title: "Complaints Registry",
          href: "/complaints",
          icon: MessageSquareWarning,
          allowedRoles: ["ADMIN", "OWNER", "OFFICER"],
        },
      ],
    },
    {
      label: "Resolution & Audits",
      items: [
        {
          title: "Corrective Actions",
          href: "/corrective-actions",
          icon: FileCheck2,
          allowedRoles: ["ADMIN", "OFFICER", "FRANCHISE"],
        },
        {
          title: "Executive Reports",
          href: "/reports",
          icon: FileBarChart,
          allowedRoles: ["ADMIN", "OWNER"],
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-white/10 dark:bg-[#070B18] lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4F46FF]/15 text-[#818CF8] border border-[#4F46FF]/30 font-bold shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              FranchiseIQ
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Performance & Compliance
            </span>
          </div>
        </div>

        {/* Navigation list filtered by role */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.label} className="space-y-1">
                <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {group.label}
                </p>
                <div className="space-y-0.5 pt-0.5">
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
                          "group flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          isActive
                            ? "bg-[#4F46FF]/15 text-white font-semibold border-l-2 border-[#4F46FF] dark:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isActive
                                ? "text-[#818CF8]"
                                : "text-slate-500 group-hover:text-slate-300"
                            )}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                              item.badgeVariant === "warning"
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                                : "bg-white/5 text-slate-400 border border-white/10"
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
        <div className="border-t border-slate-200 p-3 dark:border-white/10">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-[#0B1020]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white font-semibold text-xs border border-white/10">
                {user?.name ? user.name[0] : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name || "Guest User"}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-[#818CF8]">{userRole}</span>
                  {user?.assignedOutletId && (
                    <span>· {user.assignedOutletId}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
