import * as React from "react";
import { cn } from "@/utils/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "emerald";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#073B2A] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      default: "bg-[#073B2A] text-white shadow-xs hover:bg-[#05291F] active:scale-[0.99]",
      destructive: "bg-rose-700 text-white shadow-xs hover:bg-rose-800",
      outline: "border border-[#DDE5DC] bg-[#FFFDF8] text-[#18251F] shadow-2xs hover:bg-[#F6F1E7] hover:text-[#073B2A]",
      secondary: "bg-[#EAE3D2] text-[#073B2A] hover:bg-[#DFD7C2]",
      emerald: "bg-[#13845B] text-white hover:bg-[#0E6847] shadow-xs",
      ghost: "text-[#18251F] hover:bg-[#EAE3D2]/50 hover:text-[#073B2A]",
      link: "text-[#073B2A] underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-xl px-6 text-sm font-semibold",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
