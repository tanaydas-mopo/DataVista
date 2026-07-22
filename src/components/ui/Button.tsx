import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-primary text-white shadow-sm hover:bg-primary-hover focus-visible:ring-primary",
      secondary:
        "bg-surface text-textPrimary shadow-sm ring-1 ring-inset ring-borderStrong hover:bg-appBackground focus-visible:ring-primary",
      outline:
        "border border-primary text-primary hover:bg-primary-soft focus-visible:ring-primary",
      ghost:
        "text-textSecondary hover:text-textPrimary hover:bg-appBackground focus-visible:ring-primary",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2.5 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
