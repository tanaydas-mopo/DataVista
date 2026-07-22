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
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
          isActive
            ? "bg-[#0F172A] text-white shadow-sm"
            : "text-textSecondary hover:bg-slate-100 hover:text-textPrimary",
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-5 w-5",
              isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
            )}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}
