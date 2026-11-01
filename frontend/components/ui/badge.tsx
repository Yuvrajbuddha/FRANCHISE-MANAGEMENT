import * as React from "react";
import { cn } from "@/utils/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-[#064E3B] text-white shadow-2xs",
    secondary: "border border-[#D1FAE5] bg-[#E6F8EF] text-[#064E3B]",
    destructive: "border border-red-200 bg-red-50 text-red-700",
    outline: "border border-[#D1FAE5] text-[#1F2937] bg-white",
    success: "border border-[#D1FAE5] bg-[#E6F8EF] text-[#059669]",
    warning: "border border-amber-200 bg-amber-50 text-amber-800",
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
