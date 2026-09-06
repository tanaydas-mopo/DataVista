"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNavigation, ROUTE_METADATA } from "./TopNavigation";
import { Menu } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { cn } from "../../lib/utils";
import { DataVistaLogo } from "../ui/DataVistaLogo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("datavista_sidebar_collapsed");
        return saved ? JSON.parse(saved) : false;
      } catch {
        return false;
      }
    }
    return false;
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

  const currentMeta = ROUTE_METADATA[pathname] || {
    title: "Dashboard Overview",
    subtitle: "Welcome to DataVista Analytics",
  };

  return (
    <div className="flex min-h-[100dvh] h-[100dvh] w-full overflow-hidden bg-appBackground text-textPrimary">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-surface transition-[width,transform] duration-200 ease-out lg:static lg:translate-x-0 shrink-0 transform-gpu will-change-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-[72px] lg:w-[72px]" : "w-[230px] lg:w-[230px]"
        )}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          className="w-full"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 transition-[flex,width,padding] duration-200 ease-out transform-gpu">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
          <DataVistaLogo size="sm" />
          <IconButton
            onClick={() => setMobileOpen(true)}
            variant="ghost"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-5 w-5 text-textSecondary" />
          </IconButton>
        </div>

        {/* Desktop Top Navigation with Interactive Popovers */}
        <div className="hidden lg:block">
          <TopNavigation />
        </div>

        {/* Mobile route-aware title bar */}
        <div className="lg:hidden px-4 py-3 bg-surface border-b border-border flex flex-col">
          <h1 className="text-base font-bold tracking-tight text-textPrimary">
            {currentMeta.title}
          </h1>
          <p className="text-[11px] font-medium text-textSecondary truncate">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 transform-gpu">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
