import { useState } from "react";
import { Bell, ChevronDown, Filter, Calendar, X, User } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export function TopNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);

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

  return (
    <>
      <header className="flex flex-col border-b border-border bg-surface px-8 py-5 transition-colors duration-200">
        <div className="flex shrink-0 items-start justify-between">
          {/* Left Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
              Dashboard
            </h1>
            <p className="text-sm font-medium text-textSecondary">
              Welcome back, <span className="capitalize font-bold text-textPrimary">{displayName}</span>!
            </p>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <IconButton variant="ghost" title="Notifications">
                <Bell className="h-4 w-4 text-textSecondary" />
              </IconButton>
              <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger border border-surface" />
            </div>

            {/* Profile Avatar with Zoom Handler */}
            <div
              onClick={() => setIsAvatarZoomed(true)}
              className="ml-2 pl-2 flex items-center gap-2 cursor-pointer group"
              title="Click to view profile picture"
            >
              <div className="relative rounded-full transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
                <Avatar size="md" src={avatarSrc} fallback={initial} title={user?.email || displayName} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-textSecondary hover:bg-primary-soft/30 hover:text-textPrimary transition-all cursor-pointer">
            <Calendar className="h-3.5 w-3.5" />
            <span>Jan 01, 2024 - Dec 31, 2024</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
          <Button variant="outline" className="gap-2 text-xs font-semibold rounded-xl">
            <Filter className="h-3.5 w-3.5 text-textSecondary" />
            Filters
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
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
                  navigate("/settings");
                }}
                className="w-full py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <User className="w-4 h-4" />
                Manage Account & Settings
              </button>
              <button
                onClick={() => setIsAvatarZoomed(false)}
                className="w-full py-2 px-4 bg-primary-soft/30 text-textSecondary text-xs font-semibold rounded-xl hover:bg-primary-soft/60 hover:text-textPrimary transition-all active:scale-95"
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
