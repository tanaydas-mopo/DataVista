"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Filter,
  Calendar,
  X,
  User,
  Search,
  Command,
  Check,
  CheckCircle2,
  Trash2,
  SlidersHorizontal,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { useDataset } from "../../context/DatasetContext";
import { supabase } from "../../lib/supabase";

export const ROUTE_METADATA: Record<string, { title: string; subtitle: string; category: string }> = {
  "/dashboard": {
    title: "Dashboard Overview",
    subtitle: "High-level metrics, active chart breakdown, and dataset summary",
    category: "Analytics",
  },
  "/upload-dataset": {
    title: "Upload Dataset",
    subtitle: "Import and inspect CSV, Excel, TSV, or JSON tabular data",
    category: "Data Ingestion",
  },
  "/data-schema": {
    title: "Data & Schema",
    subtitle: "15-column schema attributes, type inference, and null rates",
    category: "Data Modeling",
  },
  "/clean-transform": {
    title: "Clean & Transform",
    subtitle: "Categorized operations, recipe pipeline, and audit recipes",
    category: "Data Preparation",
  },
  "/visual-builder": {
    title: "Visual Builder",
    subtitle: "23 customizable chart types with intelligent measure detection",
    category: "Visualization",
  },
  "/dashboard-canvas": {
    title: "Dashboard Canvas",
    subtitle: "Modular widget layout, live preview, and dashboard publishing",
    category: "Reporting",
  },
  "/export-report": {
    title: "Export & Report",
    subtitle: "High-resolution PDF documents, PNG snapshots, and clean CSV packages",
    category: "Exporting",
  },
  "/settings": {
    title: "Workspace Settings",
    subtitle: "Manage theme, profile, API keys, and workspace defaults",
    category: "Configuration",
  },
};

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export function TopNavigation() {
  const { user } = useAuth();
  const { dataset } = useDataset();
  const router = useRouter();
  const pathname = usePathname();

  // Route-aware metadata
  const currentMeta = ROUTE_METADATA[pathname] || {
    title: "Dashboard Overview",
    subtitle: "Data Analytics Platform",
    category: "Analytics",
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Popover States
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);

  // Date Range State
  const [selectedDatePreset, setSelectedDatePreset] = useState("Season 2024");
  const [dateDisplayLabel, setDateDisplayLabel] = useState("Jan 01, 2024 - Dec 31, 2024");

  // Filters State
  const [activeFilterChips, setActiveFilterChips] = useState<string[]>([]);
  const [tempFilterTeam, setTempFilterTeam] = useState("All Teams");
  const [tempFilterMinRuns, setTempFilterMinRuns] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "Dataset Initialized",
      message: `Loaded "${dataset.name}" with ${dataset.totalRows} rows and ${dataset.totalColumns} columns.`,
      time: "10 mins ago",
      read: false,
      type: "success",
    },
    {
      id: "n2",
      title: "Clean Engine Ready",
      message: "13 data cleaning transformations and auto-recipes stand ready.",
      time: "25 mins ago",
      read: false,
      type: "info",
    },
    {
      id: "n3",
      title: "Realtime Sync Verified",
      message: "Browser memory buffer integrity validated 100%.",
      time: "1 hour ago",
      read: true,
      type: "info",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Refs for click outside
  const dateRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDatePopoverOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterPopoverOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Command K Shortcut Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        searchInput?.focus();
      }
      if (e.key === "Escape") {
        setIsDatePopoverOpen(false);
        setIsFilterPopoverOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Extract Google / Gmail avatar photo URL or unavatar service fallback
  const avatarSrc =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    (user?.email ? `https://unavatar.io/${encodeURIComponent(user.email)}` : undefined);

  // Extract display name or email prefix
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "Analyst");

  const initial = displayName ? displayName.charAt(0).toUpperCase() : "A";

  // Quick Navigation Search Options
  const searchOptions = [
    { label: "Dashboard Overview", path: "/dashboard", desc: "KPIs and active visualizations" },
    { label: "Upload New Dataset", path: "/upload-dataset", desc: "Import CSV, Excel, or JSON" },
    { label: "Data & Schema Inspector", path: "/data-schema", desc: "15 columns schema inspection" },
    { label: "Clean & Transform AI", path: "/clean-transform", desc: "Recipes, imputation, filters" },
    { label: "Visual Chart Builder", path: "/visual-builder", desc: "23 charts & multidimensional plots" },
    { label: "Dashboard Canvas", path: "/dashboard-canvas", desc: "Interactive widget drag-drop canvas" },
    { label: "Export PDF / CSV Report", path: "/export-report", desc: "Executive document generator" },
    { label: "Workspace Settings", path: "/settings", desc: "Themes, profile, API keys" },
  ];

  const filteredOptions = searchQuery.trim()
    ? searchOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleApplyDateRange = (preset: string) => {
    setSelectedDatePreset(preset);
    if (preset === "Season 2024") {
      setDateDisplayLabel("Jan 01, 2024 - Dec 31, 2024");
    } else if (preset === "Last 30 Days") {
      setDateDisplayLabel("Last 30 Calendar Days");
    } else if (preset === "Year to Date") {
      setDateDisplayLabel("Jan 01, 2026 - Present");
    } else if (preset === "All Time") {
      setDateDisplayLabel("All Historical Records");
    }
    setIsDatePopoverOpen(false);
  };

  const handleApplyFilters = () => {
    const chips: string[] = [];
    if (tempFilterTeam !== "All Teams") chips.push(`Team: ${tempFilterTeam}`);
    if (tempFilterMinRuns.trim()) chips.push(`Min Runs: ${tempFilterMinRuns}`);
    setActiveFilterChips(chips);
    setIsFilterPopoverOpen(false);
  };

  const handleResetFilters = () => {
    setTempFilterTeam("All Teams");
    setTempFilterMinRuns("");
    setActiveFilterChips([]);
    setIsFilterPopoverOpen(false);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-surface px-6 py-3 transition-colors duration-200">
        {/* Left Section: Route-Aware Page Title & Subtext */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-textPrimary leading-tight">
                {currentMeta.title}
              </h1>
              <span className="hidden xl:inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-soft text-primary border border-primary/20">
                {currentMeta.category}
              </span>
            </div>
            <p className="text-xs text-textSecondary font-medium truncate max-w-xs xl:max-w-md">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Center Section: Global Command K Search Bar */}
        <div className="relative mx-6 max-w-md w-full hidden md:block">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 bg-primary-soft/20 text-xs transition-all ${
              isSearchFocused
                ? "border-primary bg-surface ring-2 ring-primary/20 shadow-sm"
                : "border-border hover:border-borderStrong hover:bg-primary-soft/30"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-textMuted shrink-0" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search datasets, schema, charts (⌘K)..."
              className="w-full bg-transparent text-textPrimary placeholder:text-textMuted focus:outline-none text-xs font-medium"
            />
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-bold text-textMuted shadow-2xs">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </div>

          {/* Quick Search Autocomplete Dropdown */}
          {isSearchFocused && filteredOptions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-border bg-surface shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold text-textMuted uppercase tracking-wider px-2 py-1">
                Navigation Shortcuts
              </div>
              {filteredOptions.map((opt) => (
                <button
                  key={opt.path}
                  type="button"
                  onMouseDown={() => {
                    router.push(opt.path);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-primary-soft hover:text-primary rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[10px] text-textMuted">{opt.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono text-textMuted">{opt.path}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Date Filter, Actions & Avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Interactive Date Range Button & Popover */}
          <div className="relative" ref={dateRef}>
            <button
              type="button"
              onClick={() => setIsDatePopoverOpen(!isDatePopoverOpen)}
              aria-expanded={isDatePopoverOpen}
              aria-label="Select date range"
              className="hidden lg:flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-textSecondary hover:bg-primary-soft/30 hover:text-textPrimary hover:border-primary/40 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-textPrimary">{dateDisplayLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-textMuted transition-transform ${isDatePopoverOpen ? "rotate-180" : ""}`} />
            </button>

            {isDatePopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-surface p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h4 className="text-xs font-bold text-textPrimary">Date Range Preset</h4>
                  <span className="text-[10px] text-primary font-bold">{selectedDatePreset}</span>
                </div>
                <div className="space-y-1 py-2">
                  {["Season 2024", "Last 30 Days", "Year to Date", "All Time"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleApplyDateRange(preset)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                        selectedDatePreset === preset
                          ? "bg-primary-soft text-primary font-bold"
                          : "text-textSecondary hover:bg-surface hover:text-textPrimary"
                      }`}
                    >
                      <span>{preset}</span>
                      {selectedDatePreset === preset && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-textMuted">Custom calendar range</span>
                  <button
                    type="button"
                    onClick={() => setIsDatePopoverOpen(false)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Filters Button & Popover */}
          <div className="relative" ref={filterRef}>
            <Button
              variant="outline"
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              aria-expanded={isFilterPopoverOpen}
              aria-label="Filter dataset attributes"
              className={`gap-1.5 text-xs font-semibold rounded-xl h-8 px-3 transition-all cursor-pointer ${
                activeFilterChips.length > 0 ? "border-primary text-primary bg-primary-soft/30" : ""
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterChips.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                  {activeFilterChips.length}
                </span>
              )}
              <ChevronDown className={`h-3 w-3 text-textMuted transition-transform ${isFilterPopoverOpen ? "rotate-180" : ""}`} />
            </Button>

            {isFilterPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-surface p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-textPrimary">Dataset Quick Filters</h4>
                  </div>
                  {activeFilterChips.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] font-bold text-danger hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-3 py-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-1.5">
                      Team Filter
                    </label>
                    <select
                      value={tempFilterTeam}
                      onChange={(e) => setTempFilterTeam(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-textPrimary focus:border-primary focus:outline-none"
                    >
                      <option value="All Teams">All Teams</option>
                      <option value="CSK">Chennai Super Kings (CSK)</option>
                      <option value="MI">Mumbai Indians (MI)</option>
                      <option value="RCB">Royal Challengers (RCB)</option>
                      <option value="KKR">Kolkata Knight Riders (KKR)</option>
                      <option value="SRH">Sunrisers Hyderabad (SRH)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-1.5">
                      Minimum Runs Threshold
                    </label>
                    <input
                      type="number"
                      value={tempFilterMinRuns}
                      onChange={(e) => setTempFilterMinRuns(e.target.value)}
                      placeholder="e.g. 2000"
                      className="w-full h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-textPrimary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 text-xs font-semibold text-textSecondary hover:bg-primary-soft/30 rounded-xl transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Notifications Bell & Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-expanded={isNotificationsOpen}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
              className="relative p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-primary-soft/30 border border-transparent hover:border-border transition-all cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-surface p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-textPrimary">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-soft text-primary">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllNotifications}
                        title="Clear all"
                        aria-label="Clear all notifications"
                        className="p-1 rounded-lg text-textMuted hover:text-danger cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-textMuted">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="font-bold text-textPrimary">All caught up!</p>
                      <p className="text-[11px] text-textSecondary mt-0.5">No pending notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-xl border text-xs transition-colors ${
                          notif.read
                            ? "bg-surface border-border text-textSecondary"
                            : "bg-primary-soft/20 border-primary/30 text-textPrimary font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-textPrimary">{notif.title}</p>
                          <span className="text-[10px] text-textMuted">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-textSecondary leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Interactive Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-expanded={isProfileOpen}
              aria-label="Open user profile menu"
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer group"
            >
              <Avatar size="sm" src={avatarSrc} fallback={initial} title={user?.email || displayName} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-surface p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Snapshot */}
                <div className="flex items-center gap-3 p-2 border-b border-border pb-3">
                  <div
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsAvatarZoomed(true);
                    }}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    title="Enlarge profile photo"
                  >
                    <Avatar size="md" src={avatarSrc} fallback={initial} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-textPrimary truncate capitalize">{displayName}</p>
                    <p className="text-[11px] text-textSecondary truncate">{user?.email || "Authenticated User"}</p>
                  </div>
                </div>

                {/* Quick Menu Links */}
                <div className="py-2 space-y-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/settings?tab=general");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary-soft hover:text-primary transition-colors flex items-center gap-2 text-textPrimary cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-textMuted" />
                    Account &amp; Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/settings?tab=appearance");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary-soft hover:text-primary transition-colors flex items-center gap-2 text-textPrimary cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-textMuted" />
                    Theme &amp; Preferences
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push("/settings?tab=security");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary-soft hover:text-primary transition-colors flex items-center gap-2 text-textPrimary cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-textMuted" />
                    API Keys &amp; Security
                  </button>
                </div>

                {/* Sign Out */}
                <div className="pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsProfileOpen(false);
                      try {
                        await supabase.auth.signOut();
                      } catch (err) {
                        console.error("Sign out error:", err);
                      }
                      router.push("/login");
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-danger-soft hover:text-danger text-textSecondary font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Photo Zoom Modal */}
      {isAvatarZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setIsAvatarZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged profile photo"
        >
          <div
            className="relative flex flex-col items-center p-8 bg-surface/90 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl animate-in zoom-in-90 duration-300 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAvatarZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-textMuted hover:text-textPrimary hover:bg-primary-soft/30 transition-all cursor-pointer"
              aria-label="Close enlarged photo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative mb-5">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-surface"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-primary text-white flex items-center justify-center font-bold text-5xl uppercase shadow-2xl border-4 border-surface">
                  {initial}
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-textPrimary capitalize mb-1">{displayName}</h3>
            <p className="text-xs font-semibold text-textSecondary mb-6">{user?.email || "Authenticated User"}</p>

            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsAvatarZoomed(false);
                  router.push("/settings?tab=general");
                }}
                className="w-full py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <User className="w-4 h-4" />
                Manage Account
              </button>
              <button
                type="button"
                onClick={() => setIsAvatarZoomed(false)}
                className="w-full py-2 px-4 bg-surface text-textSecondary text-xs font-semibold rounded-xl hover:bg-primary-soft/40 border border-border transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
