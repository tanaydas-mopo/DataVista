import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";
import { Menu } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { cn } from "../../lib/utils";
import { DataVistaLogo } from "../ui/DataVistaLogo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("datavista_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("datavista_sidebar_collapsed", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save sidebar state to localStorage:", e);
      }
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-appBackground text-textPrimary">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar Container with Ultra-Smooth 200ms GPU Accelerated Transition */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-surface transition-[width,transform] duration-200 ease-out lg:static lg:translate-x-0 shrink-0 transform-gpu will-change-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[72px] lg:w-[72px]" : "w-[220px] lg:w-[220px]"
        )}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          className="w-full"
        />
      </div>

      {/* Main Content Area - GPU Accelerated Dynamic Resizing */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 transition-[flex,width,padding] duration-200 ease-out transform-gpu">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
          <DataVistaLogo size="md" />
          <IconButton onClick={() => setMobileOpen(true)} variant="ghost">
            <Menu className="h-6 w-6 text-textSecondary" />
          </IconButton>
        </div>

        <div className="hidden lg:block">
          <TopNavigation />
        </div>

        {/* Mobile alternative top nav info */}
        <div className="lg:hidden p-4 bg-surface border-b border-border">
          <h1 className="text-xl font-bold tracking-tight text-textPrimary">
            Dashboard
          </h1>
          <p className="text-xs font-medium text-textSecondary">
            Welcome back!
          </p>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 transform-gpu">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
