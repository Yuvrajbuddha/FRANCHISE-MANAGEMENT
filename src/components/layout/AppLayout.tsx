import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <TopNav
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
