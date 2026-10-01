import React from "react";
import { Store } from "lucide-react";
import { ModulePlaceholder } from "@/components/layout/ModulePlaceholder";

export default function OutletsPage() {
  return (
    <ModulePlaceholder
      title="Outlet Management & Profile Engine"
      phase="Phase 5"
      description="Central registry for 148 franchise units across 11 key metropolitan markets."
      icon={Store}
      features={[
        "COCO (Company-Owned, Company-Operated) and FOCO (Franchisee-Owned) directory",
        "City and territory filtering (Delhi, Mumbai, Bengaluru, Lucknow, etc.)",
        "Comprehensive 360° outlet dossiers with historical audit trail",
        "Manager assignments and direct operational metrics",
      ]}
    />
  );
}
