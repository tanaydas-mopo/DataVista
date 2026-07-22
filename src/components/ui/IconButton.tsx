import React from "react";
import { cn } from "../../lib/utils";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "outline" | "surface";
  size?: "sm" | "md";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", ...props }, ref) => {
    const variants = {
      ghost: "text-textSecondary hover:text-textPrimary hover:bg-slate-100",
      outline: "border border-border text-textSecondary hover:bg-slate-50",
      surface: "bg-white text-textSecondary hover:bg-slate-50 shadow-sm border border-border",
    };

    const sizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";
