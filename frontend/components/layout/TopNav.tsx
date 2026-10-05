import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1E3A66] bg-[#0D1F3C] px-4 backdrop-blur-md lg:px-6 shadow-sm">
      {/* Mobile toggle + Page Context Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1E3A66] text-slate-200 hover:text-white hover:bg-[#152E56] lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <Link to="/" className="hover:text-blue-300 transition-colors">
            Franchise Performance & Compliance
          </Link>
        </div>
      </div>

      {/* Right Action: Sign Out button */}
      <div className="flex items-center gap-2">
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        ) : (
          <Button size="sm" onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs shadow-xs font-semibold">
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
