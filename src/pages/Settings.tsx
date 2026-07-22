import { useState } from "react";
import { User, Bell, Shield, Palette, CheckCircle2, LogOut, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [theme, setTheme] = useState(() => 
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const tabs = [
    { id: "general", icon: User, label: "General Information" },
    { id: "appearance", icon: Palette, label: "Appearance" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "security", icon: Shield, label: "Security & Privacy" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Settings</h1>
          <p className="text-sm text-textSecondary">Manage your account preferences and app settings.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Save Changes
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-primary-soft text-primary font-medium"
                      : "text-textSecondary hover:bg-slate-50 hover:text-textPrimary"
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-primary" : "text-slate-400"}`} />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
              
              <div className="h-px bg-border my-2"></div>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-danger hover:bg-danger-soft hover:text-danger font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Log Out</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <Card className="flex-1">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle>
              {tabs.find((t) => t.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            
            {activeTab === "general" && (
              <div className="flex flex-col gap-6 max-w-xl">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary-soft rounded-full flex items-center justify-center text-primary font-bold text-2xl border-4 border-white shadow-sm">
                    TD
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-textPrimary block mb-1.5">First Name</label>
                    <input type="text" defaultValue="Tanay" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-textPrimary block mb-1.5">Last Name</label>
                    <input type="text" defaultValue="Das" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-1.5">Email Address</label>
                  <input type="email" defaultValue="tanay.das@example.com" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="flex flex-col gap-6 max-w-xl">
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-3">Theme Preference</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label 
                      className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        theme === "light" ? "border-primary bg-primary-soft/20" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input type="radio" name="theme" value="light" checked={theme === "light"} onChange={() => handleThemeChange("light")} className="sr-only" />
                      <div className="w-full h-24 bg-white rounded-md border border-slate-200 shadow-sm flex flex-col gap-2 p-2">
                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-full bg-slate-50 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">Light Mode</span>
                    </label>

                    <label 
                      className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        theme === "dark" ? "border-primary bg-primary-soft/20" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input type="radio" name="theme" value="dark" checked={theme === "dark"} onChange={() => handleThemeChange("dark")} className="sr-only" />
                      <div className="w-full h-24 bg-slate-900 rounded-md border border-slate-700 shadow-sm flex flex-col gap-2 p-2">
                        <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                        <div className="h-full bg-slate-800 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">Dark Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="flex flex-col gap-4 max-w-xl">
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-textPrimary">Email Alerts</h4>
                    <p className="text-xs text-textSecondary mt-1">Receive weekly performance summaries.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-textPrimary">Data Refresh Notifications</h4>
                    <p className="text-xs text-textSecondary mt-1">Get notified when linked datasets sync.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            )}
            
            {activeTab === "security" && (
              <div className="flex flex-col gap-6 max-w-xl">
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-1.5">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors w-fit">
                  Update Password
                </button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {showLogoutModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLogoutModal(false)}
        >
          <div 
            className="w-full max-w-[340px] rounded-2xl bg-white dark:bg-surface border border-borderStrong shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#ff3344] border border-[#ff3344]/30 shadow-sm">
                <LogOut className="h-5 w-5 ml-1" />
              </div>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="text-[22px] font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Sign Out?</h3>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to sign out of DataVista?
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="w-full rounded-xl bg-[#ff3344] py-3 text-[15px] font-bold text-white transition-all hover:bg-[#e62e3d] shadow-sm"
              >
                Sign Out
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-full rounded-xl bg-[#4a5565] py-3 text-[15px] font-bold text-white transition-all hover:bg-[#3f4857] shadow-sm"
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
