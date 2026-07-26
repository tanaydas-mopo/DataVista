import { useState } from "react";
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
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { cn } from "../../lib/utils";
import { DataVistaLogo } from "../ui/DataVistaLogo";
import { useDataset } from "../../context/DatasetContext";
import { useNavigate } from "react-router-dom";

export function Sidebar({ className }: { className?: string }) {
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const { dataset, switchDatasetPreset, removeDataset } = useDataset();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "flex h-full w-[260px] flex-col border-r border-border bg-sidebar transition-colors duration-200 transform-gpu",
        className
      )}
    >
      {/* Header / Animated DV Logo + Option 1 Three Dots (...) Dataset Switcher Menu */}
      <div className="relative flex items-center justify-between px-5 py-5 border-b border-border/50">
        <DataVistaLogo size="md" />

        {/* Option 1: Header Three Dots (...) Trigger Button */}
        <button
          onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
          title="Active Dataset Switcher & Controls"
          className="p-1.5 rounded-xl border border-border bg-surface text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {/* Option 1: Frosted Glassmorphism Context Menu */}
        {isHeaderMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsHeaderMenuOpen(false)}
            />

            <div
              className="absolute left-4 top-full mt-2 z-50 w-64 bg-surface/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 transform-gpu"
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

      {/* Option 2: Main Navigation Items with Individual Three Dots (...) Menus */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="space-y-1">
          <SidebarItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            quickActionLabel="View Dashboard"
          />
          <SidebarItem
            href="/data-schema"
            icon={Database}
            label="Data & Schema"
            quickActionLabel="Inspect Schema"
          />
          <SidebarItem
            href="/clean-transform"
            icon={Sparkles}
            label="Clean & Transform"
            quickActionLabel="Auto-Fix Nulls"
          />
          <SidebarItem
            href="/visual-builder"
            icon={BarChart}
            label="Visual Builder"
            quickActionLabel="Create Bar Chart"
          />
          <SidebarItem
            href="/dashboard-canvas"
            icon={Layout}
            label="Dashboard Canvas"
            quickActionLabel="Layout Canvas"
          />
          <SidebarItem
            href="/export-report"
            icon={Download}
            label="Export & Report"
            quickActionLabel="Generate PDF"
          />
          <SidebarItem
            href="/settings"
            icon={Settings}
            label="Settings"
            quickActionLabel="Theme Settings"
          />
        </div>
      </nav>
    </aside>
  );
}
