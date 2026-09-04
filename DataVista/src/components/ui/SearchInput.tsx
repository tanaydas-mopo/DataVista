import React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center w-full max-w-md", className)}>
        <Search className="absolute left-3 h-4 w-4 text-textSecondary" />
        <input
          ref={ref}
          type="text"
          className="h-10 w-full rounded-lg border border-border bg-slate-50 pl-10 pr-12 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          {...props}
        />
        <div className="absolute right-3 flex items-center justify-center rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-textMuted shadow-sm">
          Ctrl K
        </div>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
