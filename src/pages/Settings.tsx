import { useState } from "react";
import { User, Bell, Shield, Palette, CheckCircle2, LogOut, X, Sun, Moon, Sparkles, Compass } from "lucide-react";
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
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: "appearance", icon: Palette, label: "Appearance & Theme" },
    { id: "general", icon: User, label: "General Information" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "security", icon: Shield, label: "Security & Privacy" },
  ];

  const themeOptions = [
    {
      id: "light",
      name: "Light Mode",
      desc: "Classic clean white layout",
      bgClass: "bg-[#F8FAFC]",
      previewBg: "bg-[#F8FAFC]",
      previewCard: "bg-white border-slate-200",
      accentColor: "#2563EB",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark Mode",
      desc: "Midnight slate dark theme",
      bgClass: "bg-[#09090B]",
      previewBg: "bg-[#09090B]",
      previewCard: "bg-[#18181B] border-slate-700",
      accentColor: "#3B82F6",
      icon: Moon,
    },
    {
      id: "extra-dark",
      name: "Extra Dark Charcoal",
      desc: "Deep OLED charcoal grey tone",
      bgClass: "bg-[#050505]",
      previewBg: "bg-[#050505]",
      previewCard: "bg-[#121215] border-slate-800",
      accentColor: "#3B82F6",
      icon: Sparkles,
    },
    {
      id: "cobalt-dark",
      name: "Deep Cobalt Navy",
      desc: "Cyberpunk deep navy blue tone",
      bgClass: "bg-[#0B132B]",
      previewBg: "bg-[#0B132B]",
      previewCard: "bg-[#1C2541] border-[#2A365C]",
      accentColor: "#38BDF8",
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
    <div className="flex flex-col gap-6 pb-8 h-full max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Settings</h1>
          <p className="text-sm text-textSecondary">Manage your theme appearance, account details, and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          {saveSuccess ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <Card className="md:w-72 h-fit flex-shrink-0">
          <CardContent className="p-3">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left font-semibold text-sm ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-xs"
                      : "text-textSecondary hover:bg-primary-soft/30 hover:text-textPrimary"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : "text-textMuted"}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
              
              <div className="h-px bg-border my-2"></div>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left text-danger hover:bg-danger-soft hover:text-danger font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card className="flex-1">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-lg font-bold">
              {tabs.find((t) => t.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            
            {activeTab === "appearance" && (
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-sm font-bold text-textPrimary block mb-1">
                    Theme Preference
                  </label>
                  <p className="text-xs text-textSecondary mb-4">
                    Choose from curated light, midnight dark, extra charcoal grey, or cobalt navy themes.
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
                              <span className="text-sm font-bold text-textPrimary">{opt.name}</span>
                            </div>
                            <input
                              type="radio"
                              name="theme"
                              value={opt.id}
                              checked={isSelected}
                              onChange={() => handleThemeChange(opt.id)}
                              className="text-primary focus:ring-primary h-4 w-4"
                            />
                          </div>

                          {/* Live Visual Theme Mini-Preview */}
                          <div className={`w-full h-20 rounded-xl border p-2 flex flex-col gap-1.5 ${opt.previewBg} border-slate-700/30`}>
                            <div className={`h-3 w-1/3 rounded ${opt.previewCard}`}></div>
                            <div className="flex-1 flex gap-2">
                              <div className={`flex-1 rounded ${opt.previewCard}`}></div>
                              <div className={`w-1/3 rounded ${opt.previewCard}`}></div>
                            </div>
                          </div>

                          <p className="text-xs text-textSecondary font-medium">{opt.desc}</p>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="flex flex-col gap-6 max-w-xl">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl uppercase shadow-md">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-textPrimary capitalize">{userName}</h3>
                    <p className="text-xs text-textSecondary">{user?.email || "Authenticated User"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-textPrimary block mb-1.5">First Name</label>
                    <input type="text" defaultValue={userName.split(" ")[0]} className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-textPrimary block mb-1.5">Last Name</label>
                    <input type="text" defaultValue={userName.split(" ")[1] || ""} className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1.5">Email Address</label>
                  <input type="email" defaultValue={user?.email || "user@example.com"} className="w-full border border-border bg-surface/60 text-textSecondary rounded-xl p-2.5 text-xs font-semibold focus:outline-none" readOnly />
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="flex flex-col gap-4 max-w-xl">
                <div className="flex items-center justify-between p-4 border border-border bg-surface rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">Email Alerts</h4>
                    <p className="text-xs text-textSecondary mt-0.5">Receive weekly performance summaries.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-border bg-surface rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">Data Refresh Notifications</h4>
                    <p className="text-xs text-textSecondary mt-0.5">Get notified when linked datasets sync.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            )}
            
            {activeTab === "security" && (
              <div className="flex flex-col gap-6 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1.5">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary" />
                </div>
                <button className="px-4 py-2 bg-primary-soft text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors w-fit">
                  Update Password
                </button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

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
                className="w-full rounded-xl bg-danger py-3 text-sm font-bold text-white transition-all hover:bg-red-600 shadow-sm"
              >
                Sign Out
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-full rounded-xl bg-primary-soft text-textPrimary py-3 text-sm font-bold transition-all hover:bg-primary-soft/60 shadow-xs"
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
