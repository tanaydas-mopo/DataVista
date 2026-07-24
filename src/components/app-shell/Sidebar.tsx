import {
  LayoutDashboard,
  Database,
  Sparkles,
  BarChart,
  Layout,
  Download,
  Settings,
  ChevronDown,
  Sun,
  Moon,
  UploadCloud
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../lib/utils";
import { useState } from "react";

export function Sidebar({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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
        <span className="text-xl font-bold tracking-tight text-[#0F172A]">
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

      {/* Footer Area */}
      <div className="mt-auto px-4 pb-6 space-y-4">


        {/* User Profile */}
        <button className="flex w-full items-center justify-between rounded-xl border border-border p-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">
          <div className="flex items-center gap-3">
            <Avatar size="md" src="https://i.pravatar.cc/150?u=tanay" fallback="T" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-textPrimary">
                Tanay Das
              </span>
              <span className="text-xs text-textSecondary">Admin</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {/* Theme Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-appBackground p-1">
          <button
            onClick={() => handleThemeChange("light")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all",
              theme === "light"
                ? "bg-surface text-textPrimary shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            )}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
          <button
            onClick={() => handleThemeChange("dark")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all",
              theme === "dark"
                ? "bg-surface text-textPrimary shadow-sm"
                : "text-textSecondary hover:text-textPrimary"
            )}
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
