import { useState } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/auth/AuthProvider";

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("appearance");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings State
  const [defaultLandingPage, setDefaultLandingPage] = useState(() => {
    return localStorage.getItem("datavista_default_page") || "/dashboard";
  });
  const [autoCleanNulls, setAutoCleanNulls] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dataSyncNotifs, setDataSyncNotifs] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [glassEffectEnabled, setGlassEffectEnabled] = useState(true);

  // Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("datavista_theme");
    if (saved) return saved;
    if (document.documentElement.classList.contains("extra-dark")) return "extra-dark";
    if (document.documentElement.classList.contains("cobalt-dark")) return "cobalt-dark";
    if (document.documentElement.classList.contains("dark")) return "dark";
    return "light";
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("datavista_theme", newTheme);

    document.documentElement.classList.remove("dark", "extra-dark", "cobalt-dark");
    if (newTheme !== "light") {
      document.documentElement.classList.add(newTheme);
    }
  };

  const handleSave = () => {
    localStorage.setItem("datavista_default_page", defaultLandingPage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
    navigate('/login');
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "User");

  return (
    <div className="flex flex-col gap-6 pb-12 h-full max-w-6xl mx-auto w-full font-sans transition-colors duration-200 transform-gpu">
      {/* Top Header Card with User Overview & Global Save Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold border border-primary/20">
              Settings & Preferences
            </span>
            <span className="text-xs text-textMuted">• DataVista v2.4</span>
          </div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">
            System Workspace Settings
          </h1>
          <p className="text-xs text-textSecondary font-medium mt-1">
            Configure UI themes, default startup landing pages, data sync pipelines, and security controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saveSuccess ? "Changes Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Main Settings Navigation & Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation Menu */}
        <Card className="md:col-span-4 lg:col-span-3 rounded-2xl shadow-xs">
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
                    onClick={() => setActiveTab(tab.id)}
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

              <div className="h-px bg-border/80 my-2"></div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-danger hover:bg-danger-soft hover:text-danger font-bold text-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out Account</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Right Main Settings Panel */}
        <Card className="md:col-span-8 lg:col-span-9 rounded-2xl shadow-xs">
          <CardHeader className="pb-4 border-b border-border/80 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              {tabs.find((t) => t.id === activeTab)?.label}
            </CardTitle>
            <span className="text-[11px] font-semibold text-textMuted bg-primary-soft/30 px-2.5 py-1 rounded-lg border border-border">
              Auto-Saved Locally
            </span>
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
                        <label
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
                              value={opt.id}
                              checked={isSelected}
                              onChange={() => handleThemeChange(opt.id)}
                              className="text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                          </div>

                          <div className={`w-full h-20 rounded-xl border p-2 flex flex-col gap-1.5 ${opt.previewBg} border-slate-700/30`}>
                            <div className={`h-3 w-1/3 rounded ${opt.previewCard}`}></div>
                            <div className="flex-1 flex gap-2">
                              <div className={`flex-1 rounded ${opt.previewCard}`}></div>
                              <div className={`w-1/3 rounded ${opt.previewCard}`}></div>
                            </div>
                          </div>

                          <p className="text-[11px] text-textSecondary font-medium">{opt.desc}</p>
                        </label>
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
                      <p className="text-xs font-bold text-textPrimary">Frosted Glassmorphism Effects</p>
                      <p className="text-[11px] text-textSecondary font-medium mt-0.5">
                        Enable backdrop blur and glass styling across modals and three-dots context menus.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={glassEffectEnabled}
                        onChange={(e) => setGlassEffectEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                    <label className="text-xs font-bold text-textPrimary block mb-1.5">First Name</label>
                    <input
                      type="text"
                      defaultValue={userName.split(" ")[0]}
                      className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textPrimary block mb-1.5">Last Name</label>
                    <input
                      type="text"
                      defaultValue={userName.split(" ")[1] || ""}
                      className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || "user@example.com"}
                    className="w-full border border-border bg-surface/60 text-textSecondary rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    readOnly
                  />
                  <p className="text-[10px] text-textMuted mt-1 font-medium">Email address is synced with Supabase authentication provider.</p>
                </div>
              </div>
            )}

            {/* TAB 3: WORKSPACE & DATA DEFAULTS */}
            {activeTab === "workspace" && (
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1.5">
                    Default Startup Landing Page
                  </label>
                  <p className="text-xs text-textSecondary mb-3 font-medium">
                    Choose which view automatically opens when you launch DataVista.
                  </p>

                  <select
                    value={defaultLandingPage}
                    onChange={(e) => setDefaultLandingPage(e.target.value)}
                    className="w-full sm:w-80 border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="/dashboard">📊 Dashboard Overview</option>
                    <option value="/data-schema">📁 Data & Schema Inspector</option>
                    <option value="/clean-transform">🧹 Clean & Transform</option>
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
                      <p className="text-xs font-bold text-textPrimary">Auto-Fix Missing Null Values</p>
                      <p className="text-[11px] text-textSecondary font-medium mt-0.5">
                        Automatically impute missing null values with average column metrics during CSV import.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoCleanNulls}
                        onChange={(e) => setAutoCleanNulls(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                      <div className="bg-primary h-2 rounded-full w-1/4"></div>
                    </div>
                    <p className="text-[10px] text-textSecondary font-medium">
                      Datasets are safely truncated in localStorage to guarantee 100% quota compliance.
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
                    <h4 className="text-xs font-bold text-textPrimary">Email Performance Alerts</h4>
                    <p className="text-xs text-textSecondary font-medium mt-0.5">Receive weekly dataset health digests and automated anomaly reports.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-surface rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">Data Sync Notifications</h4>
                    <p className="text-xs text-textSecondary font-medium mt-0.5">Get real-time browser popups when linked CSV files update.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataSyncNotifs}
                      onChange={(e) => setDataSyncNotifs(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY & API KEYS */}
            {activeTab === "security" && (
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-textPrimary flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" /> Password & Security
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-textPrimary block mb-1.5">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-textPrimary block mb-1.5">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors w-fit shadow-xs">
                    Update Security Password
                  </button>
                </div>

                <div className="border-t border-border/80 pt-5">
                  <div className="flex items-center justify-between p-4 border border-border bg-surface rounded-2xl">
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-textSecondary font-medium mt-0.5">Require an authenticator code on login for added account security.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFactorAuth}
                        onChange={(e) => setTwoFactorAuth(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

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
                  <button className="px-3 py-1.5 bg-primary-soft text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all cursor-pointer">
                    Configure Webhook
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger border border-danger/30 shadow-xs">
                <LogOut className="h-5 w-5 ml-0.5" />
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-textMuted hover:text-textPrimary transition-colors p-1"
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
                onClick={handleLogout}
                className="w-full rounded-xl bg-danger py-3 text-sm font-bold text-white transition-all hover:bg-red-600 shadow-sm cursor-pointer"
              >
                Sign Out
              </button>
              <button
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
