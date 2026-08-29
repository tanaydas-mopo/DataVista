import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Database,
  Sparkles,
  BarChart,
  Layout,
  Download,
  Settings,
  MoreVertical,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Upload,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { cn } from "../../lib/utils";
import { DataVistaLogo } from "../ui/DataVistaLogo";
import { useDataset } from "../../context/DatasetContext";
import { useNavigate } from "react-router-dom";

export interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ className, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [headerMenuPos, setHeaderMenuPos] = useState<{ top: number; left: number } | null>(null);
  const { dataset, switchDatasetPreset, removeDataset } = useDataset();
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Global Click Outside, Touch, Scroll & Escape Key Dismissal Handler
  useEffect(() => {
    if (!isHeaderMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsHeaderMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHeaderMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setIsHeaderMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isHeaderMenuOpen]);

  const toggleHeaderMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isHeaderMenuOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHeaderMenuPos({ top: rect.bottom + 8, left: rect.left });
      setIsHeaderMenuOpen(true);
    } else {
      setIsHeaderMenuOpen(false);
    }
  };

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col border-r border-border bg-sidebar transition-colors duration-200 transform-gpu overflow-x-hidden select-none",
        className
      )}
    >
      {/* Header / Animated DV Logo + Option 1 Three Dots (...) Dataset Switcher Menu + Collapse Arrow */}
      <div className={cn(
        "relative flex items-center border-b border-border/50 transition-all duration-200 ease-out shrink-0",
        isCollapsed ? "px-3 py-4 justify-between" : "px-4 py-5 justify-between"
      )}>
        <div className="flex items-center gap-2 overflow-hidden shrink-0">
          <DataVistaLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Option 1: Header Three Dots (...) Trigger Button (when expanded) */}
          {!isCollapsed && (
            <button
              ref={buttonRef}
              type="button"
              onClick={toggleHeaderMenu}
              title="Active Dataset Switcher & Controls"
              className="p-1.5 rounded-xl border border-border bg-surface text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          )}

          {/* Collapse / Expand Arrow Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1.5 rounded-xl border border-border bg-surface text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-primary" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-textSecondary" />
              )}
            </button>
          )}
        </div>

        {/* Option 1: Fixed Position Frosted Glassmorphism Context Menu */}
        {isHeaderMenuOpen && headerMenuPos && !isCollapsed && (
          <>
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 z-[90] bg-black/5"
              onClick={() => setIsHeaderMenuOpen(false)}
            />

            <div
              ref={menuRef}
              style={{ top: headerMenuPos.top, left: headerMenuPos.left }}
              className="fixed z-[100] w-64 bg-surface/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 transform-gpu"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Active Dataset Status Header */}
              <div className="px-2.5 py-2 border-b border-border/60 mb-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-primary" /> Active Dataset
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-500 bg-emerald-500/15 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs font-bold text-textPrimary truncate">
                  {dataset.name}
                </p>
                <p className="text-[10px] text-textSecondary font-medium mt-0.5">
                  {dataset.totalRows} rows • {dataset.totalColumns} cols
                </p>
              </div>

              {/* Dataset Switcher List */}
              <div className="px-2.5 py-1 text-[10px] font-bold text-textMuted uppercase tracking-wider">
                Switch Dataset
              </div>

              <div className="space-y-0.5 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    switchDatasetPreset("ipl");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    dataset.type === "ipl"
                      ? "bg-primary-soft text-primary font-bold border border-primary/20"
                      : "text-textPrimary hover:bg-primary-soft/40"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-primary shrink-0" />
                    IPL Matches 2024
                  </span>
                  {dataset.type === "ipl" && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchDatasetPreset("sales");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    dataset.type === "sales"
                      ? "bg-primary-soft text-primary font-bold border border-primary/20"
                      : "text-textPrimary hover:bg-primary-soft/40"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    E-Commerce Revenue
                  </span>
                  {dataset.type === "sales" && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchDatasetPreset("ecommerce");
                    setIsHeaderMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    dataset.name.includes("Global Retail")
                      ? "bg-primary-soft text-primary font-bold border border-primary/20"
                      : "text-textPrimary hover:bg-primary-soft/40"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    Global Retail Analytics
                  </span>
                  {dataset.name.includes("Global Retail") && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    navigate("/upload-dataset");
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary-soft/60 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload New CSV/XLSX...
                </button>
              </div>

              {/* Quick Dataset Operations */}
              <div className="border-t border-border/60 pt-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    navigate("/export-report");
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-textPrimary hover:bg-primary-soft/40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-textSecondary" />
                  Export Workspace PDF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    removeDataset();
                    setIsHeaderMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-danger hover:bg-danger-soft transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                  Unload Dataset
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Option 2: Main Navigation Items */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4 no-scrollbar transition-all duration-200 ease-out",
        isCollapsed ? "px-2" : "px-3"
      )}>
        <div className="space-y-1">
          <SidebarItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            quickActionLabel="View Dashboard"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/data-schema"
            icon={Database}
            label="Data & Schema"
            quickActionLabel="Inspect Schema"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/clean-transform"
            icon={Sparkles}
            label="Clean & Transform"
            quickActionLabel="Auto-Fix Nulls"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/visual-builder"
            icon={BarChart}
            label="Visual Builder"
            quickActionLabel="Create Bar Chart"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/dashboard-canvas"
            icon={Layout}
            label="Dashboard Canvas"
            quickActionLabel="Layout Canvas"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/export-report"
            icon={Download}
            label="Export & Report"
            quickActionLabel="Generate PDF"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            href="/settings"
            icon={Settings}
            label="Settings"
            quickActionLabel="Theme Settings"
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>
    </aside>
  );
}
