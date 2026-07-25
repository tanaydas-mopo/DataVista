import { Bell, Search, Moon, Sun, ChevronDown, Filter, Calendar } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

export function TopNavigation() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    document.documentElement.classList.contains("extra-dark") ||
    document.documentElement.classList.contains("cobalt-dark");

  return (
    <header className="flex flex-col border-b border-border bg-surface px-8 py-5 transition-colors duration-200">
      <div className="flex shrink-0 items-start justify-between">
        {/* Left */}
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
          <IconButton variant="ghost" title="Search">
            <Search className="h-4 h-4 text-textSecondary" />
          </IconButton>

          <div className="relative">
            <IconButton variant="ghost" title="Notifications">
              <Bell className="h-4 h-4 text-textSecondary" />
            </IconButton>
            <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger border border-surface" />
          </div>

          <IconButton
            variant="ghost"
            title="Appearance Settings"
            onClick={() => navigate("/settings")}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-textSecondary" />
            )}
          </IconButton>

          <div className="ml-2 pl-2 flex items-center gap-2">
            <Avatar size="md" src={avatarSrc} fallback={initial} title={user?.email || displayName} />
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
  );
}
