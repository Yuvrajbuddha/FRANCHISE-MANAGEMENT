import * as React from "react";
import { cn } from "@/utils/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-[#073B2A] text-white shadow-2xs",
    secondary: "border border-[#DDE5DC] bg-[#EAE3D2] text-[#073B2A]",
    destructive: "border border-rose-200 bg-rose-50 text-rose-800",
    outline: "border border-[#DDE5DC] text-[#18251F] bg-[#FFFDF8]",
    success: "border border-[#C7F1DC] bg-[#E6F8EF] text-[#073B2A]",
    warning: "border border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors tabular-nums",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
