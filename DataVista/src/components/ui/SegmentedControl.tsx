
import { cn } from "../../lib/utils";

export interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-slate-100 p-1",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "bg-white text-textPrimary shadow-sm"
                : "text-textSecondary hover:text-textPrimary hover:bg-slate-200/50"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
