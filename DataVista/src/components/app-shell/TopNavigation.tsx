"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, Filter, Calendar, X, User, Search, Command } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { useRouter } from "next/navigation";

export function TopNavigation() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Global Command K Shortcut Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        searchInput?.focus();
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
    (user?.email ? user.email.split("@")[0] : "User");

  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  // Quick Navigation Search Options
  const searchOptions = [
    { label: "Dashboard Overview", path: "/dashboard" },
    { label: "Data & Schema Inspector", path: "/data-schema" },
    { label: "Clean & Transform AI", path: "/clean-transform" },
    { label: "Visual Chart Builder", path: "/visual-builder" },
    { label: "Dashboard Canvas", path: "/dashboard-canvas" },
    { label: "Export PDF / CSV Report", path: "/export-report" },
    { label: "Account & Theme Settings", path: "/settings" },
  ];

  const filteredOptions = searchQuery.trim()
    ? searchOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-surface px-6 py-3 transition-colors duration-200">
        {/* Left Section: Dashboard Title & Subtext */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight text-textPrimary leading-tight">
              Dashboard
            </h1>
            <p className="text-xs text-textSecondary font-medium">
              Welcome back, <span className="capitalize font-bold text-textPrimary">{displayName}</span>
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
              placeholder="Search datasets, charts, schema..."
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
                  onMouseDown={() => {
                    router.push(opt.path);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-primary-soft hover:text-primary rounded-xl transition-colors flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-textMuted">{opt.path}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Section: Date Filter, Actions & Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Date Picker Button */}
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-textSecondary hover:bg-primary-soft/30 hover:text-textPrimary transition-all cursor-pointer">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Jan 01, 2024 - Dec 31, 2024</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>

          {/* Filters Button */}
          <Button variant="outline" className="gap-1.5 text-xs font-semibold rounded-xl h-8 px-3">
            <Filter className="h-3.5 w-3.5 text-textSecondary" />
            Filters
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>

          {/* Notification Bell */}
          <div className="relative">
            <IconButton variant="ghost" title="Notifications" className="h-8 w-8">
              <Bell className="h-4 w-4 text-textSecondary" />
            </IconButton>
            <div className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger border border-surface" />
          </div>

          {/* Profile Avatar with Zoom Handler */}
          <div
            onClick={() => setIsAvatarZoomed(true)}
            className="flex items-center gap-2 cursor-pointer group pl-1"
            title="Click to view profile picture"
          >
            <div className="relative rounded-full transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <Avatar size="sm" src={avatarSrc} fallback={initial} title={user?.email || displayName} />
            </div>
          </div>
        </div>
      </header>

      {/* Clean Frosted Glass Profile Photo Zoom Modal */}
      {isAvatarZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setIsAvatarZoomed(false)}
        >
          <div
            className="relative flex flex-col items-center p-8 bg-surface/90 backdrop-blur-2xl border border-borderStrong/60 rounded-3xl shadow-2xl animate-in zoom-in-90 duration-300 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsAvatarZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-textMuted hover:text-textPrimary hover:bg-primary-soft/30 transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Clean Frameless Enlarged Profile Photo */}
            <div className="relative mb-5 animate-in zoom-in-95 duration-300">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-44 h-44 rounded-full object-cover shadow-2xl border-4 border-surface"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-44 h-44 rounded-full bg-primary text-white flex items-center justify-center font-bold text-5xl uppercase shadow-2xl border-4 border-surface">
                  {initial}
                </div>
              )}
            </div>

            {/* User Details */}
            <h3 className="text-xl font-bold text-textPrimary capitalize mb-1">
              {displayName}
            </h3>
            <p className="text-xs font-semibold text-textSecondary mb-6">
              {user?.email || "Authenticated User"}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => {
                  setIsAvatarZoomed(false);
                  router.push("/settings");
                }}
                className="w-full py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <User className="w-4 h-4" />
                Manage Account & Settings
              </button>
              <button
                onClick={() => setIsAvatarZoomed(false)}
                className="w-full py-2 px-4 bg-primary-soft/30 text-textSecondary text-xs font-semibold rounded-xl hover:bg-primary-soft/60 hover:text-textPrimary transition-all active:scale-95 cursor-pointer"
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
