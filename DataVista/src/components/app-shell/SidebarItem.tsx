"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

export interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
  isCollapsed?: boolean;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  className,
  isCollapsed = false,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <div className="relative group w-full">
      <Link
        href={href}
        title={isCollapsed ? label : undefined}
        className={cn(
          "relative flex items-center rounded-full text-[14px] font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar transform-gpu",
          isCollapsed ? "justify-center px-2 py-2.5" : "justify-start px-3.5 py-2.5 gap-3",
          isActive
            ? "bg-primary text-white shadow-sm shadow-blue-500/20 font-bold"
            : "text-textSecondary hover:bg-primary-soft/40 hover:text-textPrimary",
          className
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors duration-200",
            isActive ? "text-white" : "text-textMuted group-hover:text-textPrimary"
          )}
        />
        
        <span
          className={cn(
            "truncate transition-all duration-200 ease-out",
            isCollapsed ? "w-0 opacity-0 pointer-events-none overflow-hidden" : "w-auto opacity-100"
          )}
        >
          {label}
        </span>
      </Link>
    </div>
  );
}
