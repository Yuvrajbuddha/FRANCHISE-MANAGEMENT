import React from "react";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModulePlaceholderProps {
  title: string;
  phase: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

export function ModulePlaceholder({
  title,
  phase,
  description,
  icon: Icon,
  features,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {phase}
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          {title}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title} Architecture Ready
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              This module's routes, TypeScript definitions, and UI boundaries are established in Phase 1. Complete implementation scheduled for {phase}.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 text-left dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Upcoming Capabilities:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
