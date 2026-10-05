import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");

  return (
    <div className="flex min-h-screen bg-transparent text-slate-900 antialiased selection:bg-[#4F46FF] selection:text-white relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden relative z-10">
        <TopNav
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
