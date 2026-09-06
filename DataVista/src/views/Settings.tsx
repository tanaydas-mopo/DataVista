"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  CheckCircle2,
  LogOut,
  X,
  Sun,
  Moon,
  Sparkles,
  Compass,
  Database,
  Key,
  Globe,
  Sliders,
  HardDrive,
  Laptop,
  Check,
  RefreshCw,
  Zap,
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/auth/AuthProvider";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scope: "Read Only" | "Full Access";
  createdAt: string;
  lastUsed: string;
}

export function Settings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Tab synchronization with URL search params
  const tabParam = searchParams.get("tab");
  const validTabs = ["appearance", "general", "workspace", "notifications", "security", "integrations"];
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : "appearance";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/settings?tab=${tabId}`, { scroll: false });
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Settings State
  const [defaultLandingPage, setDefaultLandingPage] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("datavista_default_page") || "/dashboard";
      } catch {
        return "/dashboard";
      }
    }
    return "/dashboard";
  });
  const [autoCleanNulls, setAutoCleanNulls] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dataSyncNotifs, setDataSyncNotifs] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [glassEffectEnabled, setGlassEffectEnabled] = useState(true);

  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("datavista_theme");
        if (saved) return saved;
        if (document.documentElement.classList.contains("extra-dark")) return "extra-dark";
        if (document.documentElement.classList.contains("cobalt-dark")) return "cobalt-dark";
        if (document.documentElement.classList.contains("dark")) return "dark";
      } catch {
        return "light";
      }
    }
    return "light";
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setHasUnsavedChanges(true);
    localStorage.setItem("datavista_theme", newTheme);

    document.documentElement.classList.remove("dark", "extra-dark", "cobalt-dark");
    if (newTheme !== "light") {
      document.documentElement.classList.add(newTheme);
    }
  };

  const handleSave = () => {
    localStorage.setItem("datavista_default_page", defaultLandingPage);
    setHasUnsavedChanges(false);
    setSaveSuccess(true);
    showToast("Preferences saved to workspace profile.");
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password updated successfully.");
      }
    } catch {
      setPasswordError("Failed to update password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: "key-1",
      name: "Production Pipeline ETL",
      prefix: "dv_live_4a8f9c2e0b1d3a7e",
      scope: "Full Access",
      createdAt: "Aug 20, 2024",
      lastUsed: "2 hours ago",
    },
    {
      id: "key-2",
      name: "Tableau Connector Agent",
      prefix: "dv_live_7c3b1e9f2a0d4b8a",
      scope: "Read Only",
      createdAt: "Sep 01, 2024",
      lastUsed: "Yesterday",
    },
  ]);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<"Read Only" | "Full Access">("Read Only");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const randPart = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const fullKey = `dv_live_${randPart}`;
    const newItem: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `${fullKey.slice(0, 16)}...`,
      scope: newKeyScope,
      createdAt: "Today",
      lastUsed: "Never",
    };
    setApiKeys(prev => [newItem, ...prev]);
    setGeneratedKey(fullKey);
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    showToast("API Key revoked.");
  };

  const copyKeyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const tabs = [
    { id: "appearance", icon: Palette, label: "Appearance & Theme" },
    { id: "general", icon: User, label: "Account & Profile" },
    { id: "workspace", icon: Database, label: "Workspace & Data Defaults" },
    { id: "notifications", icon: Bell, label: "Notifications & Alerts" },
    { id: "security", icon: Shield, label: "Security & API Keys" },
    { id: "integrations", icon: Globe, label: "Integrations & Sync" },
  ];

  const themeOptions = [
    {
      id: "light",
      name: "Light Mode",
      desc: "Classic clean white layout",
      previewBg: "bg-[#F8FAFC]",
      previewCard: "bg-white border-slate-200 shadow-2xs",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark Mode",
      desc: "Midnight slate dark theme",
      previewBg: "bg-[#09090B]",
      previewCard: "bg-[#18181B] border-slate-700 shadow-2xs",
      icon: Moon,
    },
    {
      id: "extra-dark",
      name: "Extra Dark Charcoal",
      desc: "Deep OLED charcoal grey tone",
      previewBg: "bg-[#050505]",
      previewCard: "bg-[#121215] border-slate-800 shadow-2xs",
      icon: Sparkles,
    },
    {
      id: "cobalt-dark",
      name: "Deep Cobalt Navy",
      desc: "Cyberpunk deep navy blue tone",
      previewBg: "bg-[#0B132B]",
      previewCard: "bg-[#1C2541] border-[#2A365C] shadow-2xs",
      icon: Compass,
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <div className="flex flex-col gap-6 pb-12 h-full max-w-6xl mx-auto w-full font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-primary/30 shadow-xl px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-textPrimary animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold border border-primary/20">
              Settings &amp; Preferences
            </span>
            <span className="text-xs text-textMuted">• DataVista v2.4</span>
          </div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">
            System Workspace Settings
          </h1>
          <p className="text-xs text-textSecondary font-medium mt-1">
            Configure UI themes, default startup landing pages, API keys, data sync pipelines, and security controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saveSuccess ? "Changes Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <Card className="md:col-span-4 lg:col-span-3 rounded-2xl shadow-xs border-border/80">
          <CardContent className="p-3">
            <nav className="flex flex-col gap-1">
              <div className="px-3 py-2 text-[10px] font-bold text-textMuted uppercase tracking-wider">
                Preference Categories
              </div>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left font-bold text-xs cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-blue-500/20"
                        : "text-textSecondary hover:bg-primary-soft/40 hover:text-textPrimary"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-textMuted"}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}

              <div className="h-px bg-border/80 my-2" />

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-rose-600 hover:bg-rose-500/10 font-bold text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out Account</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Right Main Settings Panel */}
        <Card className="md:col-span-8 lg:col-span-9 rounded-2xl shadow-xs border-border/80">
          <CardHeader className="pb-4 border-b border-border/80 flex flex-row items-center justify-between bg-surface/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              {tabs.find((t) => t.id === activeTab)?.label}
            </CardTitle>

            {saveSuccess ? (
              <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5 animate-in fade-in duration-200">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Saved
              </span>
            ) : hasUnsavedChanges ? (
              <span className="text-[11px] font-bold text-amber-500 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5 animate-in fade-in duration-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Unsaved Changes
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-textMuted bg-primary-soft/20 px-2.5 py-1 rounded-lg border border-border">
                Synced
              </span>
            )}
          </CardHeader>

          <CardContent className="pt-6 pb-8">
            {/* TAB 1: APPEARANCE & THEME */}
            {activeTab === "appearance" && (
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-bold text-textPrimary block">
                      Theme Color Palette
                    </label>
                    <span className="text-xs font-semibold text-primary capitalize">
                      Current: {theme}
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary mb-4 font-medium">
                    Choose from 4 curated dark and light themes optimized for data inspection and chart readability.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {themeOptions.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = theme === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleThemeChange(opt.id)}
                          className={`flex flex-col gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary-soft/20 shadow-md scale-[1.01]"
                              : "border-border hover:border-borderStrong hover:bg-primary-soft/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconComp className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold text-textPrimary">{opt.name}</span>
                            </div>
                            <input
                              type="radio"
                              name="theme"
                              id={`theme-${opt.id}`}
                              value={opt.id}
                              checked={isSelected}
                              onChange={() => handleThemeChange(opt.id)}
                              className="text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                          </div>

                          <div className={`w-full h-20 rounded-xl border p-2 flex flex-col gap-1.5 ${opt.previewBg} border-slate-700/30`}>
                            <div className={`h-3 w-1/3 rounded ${opt.previewCard}`} />
                            <div className="flex-1 flex gap-2">
                              <div className={`flex-1 rounded ${opt.previewCard}`} />
                              <div className={`w-1/3 rounded ${opt.previewCard}`} />
                            </div>
                          </div>

                          <p className="text-[11px] text-textSecondary font-medium">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-border/80 pt-6">
                  <h4 className="text-xs font-bold text-textPrimary mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" /> UI Visual Enhancements
                  </h4>
                  <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-surface/60">
                    <div>
                      <label htmlFor="settings-glass-effects" className="text-xs font-bold text-textPrimary block cursor-pointer">
                        Frosted Glassmorphism Effects
                      </label>
                      <p className="text-[11px] text-textSecondary font-medium mt-0.5">
                        Enable backdrop blur and subtle glass styling across modals and dropdown context menus.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="settings-glass-effects"
                        type="checkbox"
                        checked={glassEffectEnabled}
                        onChange={(e) => {
                          setGlassEffectEnabled(e.target.checked);
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACCOUNT & PROFILE */}
            {activeTab === "general" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-5 p-4 border border-border rounded-2xl bg-surface/60">
                  <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center font-extrabold text-xl uppercase shadow-md">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-textPrimary capitalize">{userName}</h3>
                    <p className="text-xs text-textSecondary font-medium">{user?.email || "Authenticated User"}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/15 rounded-md border border-emerald-500/30">
                      Verified Data Scientist Account
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="settings-first-name" className="text-xs font-bold text-textPrimary block mb-1.5">
                      First Name
                    </label>
                    <input
                      id="settings-first-name"
                      type="text"
                      defaultValue={userName.split(" ")[0]}
                      onChange={() => setHasUnsavedChanges(true)}
                      className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="settings-last-name" className="text-xs font-bold text-textPrimary block mb-1.5">
                      Last Name
                    </label>
                    <input
                      id="settings-last-name"
                      type="text"
                      defaultValue={userName.split(" ")[1] || ""}
                      onChange={() => setHasUnsavedChanges(true)}
                      className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="settings-email" className="text-xs font-bold text-textPrimary block mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    defaultValue={user?.email || "user@example.com"}
                    className="w-full border border-border bg-surface/60 text-textSecondary rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    readOnly
                  />
                  <p className="text-[10px] text-textMuted mt-1 font-medium">
                    Email address is securely synced with Supabase authentication.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: WORKSPACE & DATA DEFAULTS */}
            {activeTab === "workspace" && (
              <div className="flex flex-col gap-6">
                <div>
                  <label htmlFor="settings-startup-page" className="text-xs font-bold text-textPrimary block mb-1.5">
                    Default Startup Landing Page
                  </label>
                  <p className="text-xs text-textSecondary mb-3 font-medium">
                    Choose which view automatically opens when you launch DataVista.
                  </p>

                  <select
                    id="settings-startup-page"
                    value={defaultLandingPage}
                    onChange={(e) => {
                      setDefaultLandingPage(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full sm:w-80 border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer shadow-xs"
                  >
                    <option value="/dashboard">📊 Dashboard Overview</option>
                    <option value="/data-schema">📁 Data &amp; Schema Inspector</option>
                    <option value="/clean-transform">🧹 Clean &amp; Transform</option>
                    <option value="/visual-builder">📈 Visual Chart Builder</option>
                    <option value="/upload-dataset">📤 Upload Dataset Page</option>
                  </select>
                </div>

                <div className="border-t border-border/80 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-textPrimary flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Automatic Dataset Processing
                  </h4>

                  <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-surface/60">
                    <div>
                      <label htmlFor="settings-autoclean" className="text-xs font-bold text-textPrimary block cursor-pointer">
                        Auto-Fix Missing Null Values
                      </label>
                      <p className="text-[11px] text-textSecondary font-medium mt-0.5">
                        Automatically impute missing null values with average column metrics during CSV import.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="settings-autoclean"
                        type="checkbox"
                        checked={autoCleanNulls}
                        onChange={(e) => {
                          setAutoCleanNulls(e.target.checked);
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>

                <div className="border-t border-border/80 pt-5">
                  <h4 className="text-xs font-bold text-textPrimary mb-3 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" /> Browser Storage Quota
                  </h4>
                  <div className="p-4 border border-border rounded-2xl bg-surface/60 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-textPrimary">Indexed Dataset Storage</span>
                      <span className="text-primary">1.2 MB / 5.0 MB Quota</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full w-1/4" />
                    </div>
                    <p className="text-[10px] text-textSecondary font-medium">
                      Datasets are safely cached in localStorage with automatic compaction.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS & ALERTS */}
            {activeTab === "notifications" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 border border-border bg-surface rounded-2xl">
                  <div>
                    <label htmlFor="settings-email-alerts" className="text-xs font-bold text-textPrimary block cursor-pointer">
                      Email Performance Alerts
                    </label>
                    <p className="text-xs text-textSecondary font-medium mt-0.5">Receive weekly dataset health digests and automated anomaly reports.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="settings-email-alerts"
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => {
                        setEmailAlerts(e.target.checked);
                        setHasUnsavedChanges(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-surface rounded-2xl">
                  <div>
                    <label htmlFor="settings-sync-notifs" className="text-xs font-bold text-textPrimary block cursor-pointer">
                      Data Sync Notifications
                    </label>
                    <p className="text-xs text-textSecondary font-medium mt-0.5">Get real-time browser popups when linked CSV files update.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="settings-sync-notifs"
                      type="checkbox"
                      checked={dataSyncNotifs}
                      onChange={(e) => {
                        setDataSyncNotifs(e.target.checked);
                        setHasUnsavedChanges(true);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY & API KEYS */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-6">
                {/* Real Password Change Subsystem */}
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <h4 className="text-xs font-bold text-textPrimary flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" /> Change Password
                  </h4>

                  {passwordError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Password changed successfully.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="settings-current-password" className="text-xs font-bold text-textPrimary block mb-1.5">
                        Current Password
                      </label>
                      <input
                        id="settings-current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-new-password" className="text-xs font-bold text-textPrimary block mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="settings-new-password"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 pr-10 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="settings-confirm-password" className="text-xs font-bold text-textPrimary block mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        id="settings-confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all w-fit shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? "Updating..." : "Update Security Password"}
                  </button>
                </form>

                {/* API Keys Management Panel */}
                <div className="border-t border-border/80 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" /> API Access Tokens
                      </h4>
                      <p className="text-[11px] text-textSecondary font-medium mt-0.5">
                        Authenticate programmatic requests to ingest data and query dashboard views.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateKeyModal(true);
                        setGeneratedKey(null);
                        setNewKeyName("");
                      }}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Generate New Key
                    </button>
                  </div>

                  {/* Active Keys List */}
                  <div className="flex flex-col gap-2.5">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="p-3.5 border border-border/80 bg-surface rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-textPrimary">{key.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-soft text-primary border border-primary/20">
                              {key.scope}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-textSecondary font-mono mt-1">
                            <span>{key.prefix}</span>
                            <span className="text-[10px] font-sans text-textMuted">• Created: {key.createdAt} • Used: {key.lastUsed}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => copyKeyToClipboard(key.prefix)}
                            className="p-1.5 text-textMuted hover:text-textPrimary hover:bg-primary-soft/40 rounded-lg transition-colors cursor-pointer"
                            title="Copy Key Identifier"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(key.id)}
                            className="p-1.5 text-textMuted hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Revoke Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Two Factor Auth */}
                <div className="border-t border-border/80 pt-5">
                  <div className="flex items-center justify-between p-4 border border-border bg-surface rounded-2xl">
                    <div>
                      <label htmlFor="settings-2fa" className="text-xs font-bold text-textPrimary block cursor-pointer">
                        Two-Factor Authentication (2FA)
                      </label>
                      <p className="text-xs text-textSecondary font-medium mt-0.5">Require an authenticator code on login for added account security.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="settings-2fa"
                        type="checkbox"
                        checked={twoFactorAuth}
                        onChange={(e) => {
                          setTwoFactorAuth(e.target.checked);
                          setHasUnsavedChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                </div>

                {/* Active Login Sessions */}
                <div className="border-t border-border/80 pt-5">
                  <h4 className="text-xs font-bold text-textPrimary mb-3 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-primary" /> Active Login Sessions
                  </h4>
                  <div className="p-3 border border-border rounded-2xl bg-surface/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary-soft text-primary">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-textPrimary">Chrome on Windows 11</p>
                        <p className="text-[10px] text-emerald-500 font-bold">Current Session • Active Now</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-textMuted font-bold">Primary</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: INTEGRATIONS & SYNC */}
            {activeTab === "integrations" && (
              <div className="flex flex-col gap-4">
                <div className="p-4 border border-border rounded-2xl bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary">Supabase Realtime Database</h4>
                      <p className="text-xs text-textSecondary font-medium">Connected to active cloud PostgreSQL storage.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/15 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                </div>

                <div className="p-4 border border-border rounded-2xl bg-surface flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary">Auto Sync Engine</h4>
                      <p className="text-xs text-textSecondary font-medium">Automatic file watching for live CSV updates.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("Webhook endpoint configured.")}
                    className="px-3 py-1.5 bg-primary-soft text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all cursor-pointer"
                  >
                    Configure Webhook
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generate API Key Modal */}
      {showCreateKeyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setShowCreateKeyModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface border border-border/80 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 cursor-default animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-textPrimary tracking-tight">
                  {generatedKey ? "API Key Created" : "Create New API Key"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateKeyModal(false)}
                className="text-textMuted hover:text-textPrimary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {generatedKey ? (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs">
                  <p className="font-bold">Copy your new secret key now</p>
                  <p className="mt-0.5">For security reasons, this token will never be displayed again.</p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-primary-soft/30 border border-primary/20 rounded-xl">
                  <span className="text-xs font-mono font-bold text-textPrimary truncate flex-1">
                    {generatedKey}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyKeyToClipboard(generatedKey)}
                    className="px-2.5 py-1 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateKeyModal(false)}
                  className="w-full mt-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="modal-key-name" className="text-xs font-bold text-textPrimary block mb-1.5">
                    Key Name / Purpose
                  </label>
                  <input
                    id="modal-key-name"
                    type="text"
                    placeholder="e.g. Production Analytics Ingestion"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1.5">
                    Token Permissions Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Read Only", "Full Access"] as const).map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setNewKeyScope(sc)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          newKeyScope === sc
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-surface text-textSecondary hover:text-textPrimary"
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setShowCreateKeyModal(false)}
                    className="px-4 py-2 text-xs font-bold text-textSecondary hover:text-textPrimary bg-primary-soft/40 hover:bg-primary-soft/80 rounded-xl border border-border/60 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateKey}
                    disabled={!newKeyName.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    Generate Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-[340px] rounded-2xl bg-surface border border-borderStrong shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/30 shadow-xs">
                <LogOut className="h-5 w-5 ml-0.5" />
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="text-textMuted hover:text-textPrimary transition-colors p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-textPrimary mb-2 tracking-tight">Sign Out?</h3>
            <p className="text-sm text-textSecondary mb-6 leading-relaxed">
              Are you sure you want to sign out of DataVista?
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white transition-all hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full rounded-xl bg-primary-soft text-textPrimary py-3 text-sm font-bold transition-all hover:bg-primary-soft/60 shadow-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
