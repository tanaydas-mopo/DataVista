import {
  LayoutDashboard,
  Database,
  Sparkles,
  BarChart,
  Layout,
  Download,
  Settings,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { cn } from "../../lib/utils";

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex h-full w-[260px] flex-col border-r border-border bg-sidebar",
        className
      )}
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-6 items-end gap-1">
          <div className="h-4 w-1.5 rounded-sm bg-primary" />
          <div className="h-6 w-1.5 rounded-sm bg-primary" />
          <div className="h-5 w-1.5 rounded-sm bg-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-textPrimary">
          DataVista
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
        <div className="space-y-1">
          <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem href="/data-schema" icon={Database} label="Data & Schema" />
          <SidebarItem
            href="/clean-transform"
            icon={Sparkles}
            label="Clean & Transform"
          />
          <SidebarItem
            href="/visual-builder"
            icon={BarChart}
            label="Visual Builder"
          />
          <SidebarItem
            href="/dashboard-canvas"
            icon={Layout}
            label="Dashboard Canvas"
          />
          <SidebarItem
            href="/export-report"
            icon={Download}
            label="Export & Report"
          />
          <SidebarItem href="/settings" icon={Settings} label="Settings" />
        </div>
      </nav>
    </aside>
  );
}
