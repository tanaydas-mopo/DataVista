import {
  LayoutDashboard,
  Database,
  Sparkles,
  BarChart,
  Layout,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { cn } from "../../lib/utils";
import { DataVistaLogo } from "../ui/DataVistaLogo";

export interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ className, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-border bg-sidebar transition-colors duration-200 transform-gpu overflow-x-hidden select-none",
        className
      )}
    >
      {/* Clean Sidebar Header / DV Logo + Dedicated Collapse/Expand Hide Button */}
      <div className={cn(
        "relative flex items-center border-b border-border/50 transition-all duration-200 ease-out shrink-0",
        isCollapsed ? "px-3 py-4 justify-between" : "px-4 py-4 justify-between"
      )}>
        <div className="flex items-center gap-2 overflow-hidden shrink-0">
          <DataVistaLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
        </div>

        {/* Dedicated Sidebar Hide / Expand Arrow Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-xl border border-border bg-surface text-textSecondary hover:text-textPrimary hover:bg-primary-soft/50 hover:border-primary/40 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-primary" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-textSecondary" />
            )}
          </button>
        )}
      </div>

      {/* Main Navigation Items */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 no-scrollbar transition-all duration-200 ease-out",
        isCollapsed ? "px-2" : "px-3"
      )}>
        <div className="space-y-1">
          <SidebarItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/data-schema"
            icon={Database}
            label="Data & Schema"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/clean-transform"
            icon={Sparkles}
            label="Clean & Transform"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/visual-builder"
            icon={BarChart}
            label="Visual Builder"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/dashboard-canvas"
            icon={Layout}
            label="Dashboard Canvas"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/export-report"
            icon={Download}
            label="Export & Report"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/settings"
            icon={Settings}
            label="Settings"
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>
    </aside>
  );
}
