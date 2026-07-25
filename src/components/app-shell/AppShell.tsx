import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";
import { Menu } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { cn } from "../../lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-appBackground text-textPrimary">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform bg-surface transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar className="w-[260px]" />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-6 items-end gap-1">
              <div className="h-4 w-1.5 rounded-sm bg-primary" />
              <div className="h-6 w-1.5 rounded-sm bg-primary" />
              <div className="h-5 w-1.5 rounded-sm bg-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-textPrimary">
              DataVista
            </span>
          </div>
          <IconButton onClick={() => setSidebarOpen(true)} variant="ghost">
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
