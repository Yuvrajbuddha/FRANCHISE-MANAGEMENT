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
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      default: "bg-[#059669] text-white shadow-xs hover:bg-[#047857] active:scale-[0.99]",
      destructive: "bg-rose-600 text-white shadow-xs hover:bg-rose-700",
      outline: "border border-[#D1FAE5] bg-white text-[#1F2937] shadow-2xs hover:bg-[#F0FDF4] hover:text-[#064E3B] hover:border-[#059669]",
      secondary: "bg-[#E6F8EF] text-[#064E3B] hover:bg-[#D1FAE5] border border-[#D1FAE5]",
      emerald: "bg-[#059669] text-white hover:bg-[#047857] shadow-xs",
      ghost: "text-[#1F2937] hover:bg-[#F0FDF4] hover:text-[#064E3B]",
      link: "text-[#059669] underline-offset-4 hover:underline",
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
