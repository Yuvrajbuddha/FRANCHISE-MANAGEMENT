import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

interface TopNavProps {
  onToggleSidebar: () => void;
  selectedCity?: string;
  onCityChange?: (city: string) => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#050B1A]/90 px-4 backdrop-blur-md lg:px-6">
      {/* Mobile toggle + Page Context Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <Link to="/" className="hover:text-indigo-400 transition-colors">
            Franchise Performance & Compliance
          </Link>
        </div>
      </div>

      {/* Right Action: Sign Out button */}
      <div className="flex items-center gap-2">
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        ) : (
          <Button size="sm" onClick={() => navigate("/login")} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
