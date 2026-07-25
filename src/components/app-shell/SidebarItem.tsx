import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

export interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  className,
}: SidebarItemProps) {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
          isActive
            ? "bg-primary text-white shadow-sm shadow-blue-500/20"
            : "text-textSecondary hover:bg-primary-soft/40 hover:text-textPrimary",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-5 w-5 shrink-0 transition-colors",
              isActive ? "text-white" : "text-textMuted group-hover:text-textPrimary"
            )}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}
