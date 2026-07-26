import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MoreVertical, Pin, Sparkles, ArrowRight, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  quickActionLabel?: string;
  className?: string;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  quickActionLabel = "Quick Open",
  className,
}: SidebarItemProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDefaultPage, setIsDefaultPage] = useState(() => {
    return localStorage.getItem("datavista_default_page") === href;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSetDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    localStorage.setItem("datavista_default_page", href);
    setIsDefaultPage(true);
    setIsMenuOpen(false);
    setToastMessage(`Set ${label} as startup page`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuickAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    navigate(href);
  };

  return (
    <div className="relative group w-full">
      <NavLink
        to={href}
        className={({ isActive }) =>
          cn(
            "relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[15px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar transform-gpu",
            isActive
              ? "bg-primary text-white shadow-sm shadow-blue-500/20"
              : "text-textSecondary hover:bg-primary-soft/40 hover:text-textPrimary",
            className
          )
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-textMuted group-hover:text-textPrimary"
                )}
              />
              <span className="truncate">{label}</span>

              {isDefaultPage && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-md border border-emerald-500/30 font-bold shrink-0">
                  Default
                </span>
              )}
            </div>

            {/* Option 2: Three Dots (...) Action Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen((prev) => !prev);
              }}
              title={`Options for ${label}`}
              className={cn(
                "p-1 rounded-lg transition-all duration-200 shrink-0",
                isActive
                  ? "text-white/80 hover:text-white hover:bg-white/20"
                  : "text-textMuted hover:text-textPrimary hover:bg-surface opacity-0 group-hover:opacity-100",
                isMenuOpen ? "opacity-100 bg-surface/80" : ""
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </>
        )}
      </NavLink>

      {/* Option 2: Frosted Glassmorphism Context Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          <div
            className="absolute left-full top-0 ml-2 z-50 w-56 bg-surface/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150 transform-gpu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1.5 border-b border-border/60 font-bold text-textMuted uppercase text-[10px] tracking-wider">
              {label} Actions
            </div>

            <button
              onClick={handleQuickAction}
              className="w-full text-left px-3 py-2 text-textPrimary hover:bg-primary-soft/50 hover:text-primary rounded-xl transition-all font-semibold flex items-center justify-between cursor-pointer my-0.5"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {quickActionLabel}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-textMuted" />
            </button>

            <button
              onClick={handleSetDefault}
              className="w-full text-left px-3 py-2 text-textPrimary hover:bg-primary-soft/50 hover:text-primary rounded-xl transition-all font-semibold flex items-center justify-between cursor-pointer my-0.5"
            >
              <span className="flex items-center gap-2">
                <Pin className="w-3.5 h-3.5 text-warning" />
                {isDefaultPage ? "Default Startup Page" : "Set as Default Page"}
              </span>
              {isDefaultPage && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface/95 backdrop-blur-xl text-textPrimary border border-border shadow-xl px-4 py-2.5 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
