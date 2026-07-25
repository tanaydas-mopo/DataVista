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
      ghost: "text-textSecondary hover:text-textPrimary hover:bg-primary-soft/30",
      outline: "border border-border text-textSecondary hover:bg-primary-soft/20",
      surface: "bg-surface text-textSecondary hover:bg-primary-soft/20 shadow-xs border border-border",
    };

    const sizes = {
      sm: "h-8 w-8",
      md: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95",
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
