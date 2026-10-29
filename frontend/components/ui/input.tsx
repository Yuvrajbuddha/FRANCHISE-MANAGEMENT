import * as React from "react";
import { cn } from "@/utils/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-[#DDE5DC] bg-[#FFFDF8] px-3 py-1.5 text-xs text-[#18251F] shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-[#738078] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#073B2A] focus-visible:border-[#073B2A] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
