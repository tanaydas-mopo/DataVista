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
import { DataVistaLogo } from "../ui/DataVistaLogo";

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex h-full w-[260px] flex-col border-r border-border bg-sidebar",
        className
      )}
    >
      {/* Header / Animated DV Logo */}
      <div className="flex items-center px-6 py-6 border-b border-border/50">
        <DataVistaLogo size="md" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
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
