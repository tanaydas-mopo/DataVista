import { Bell, Search, Moon, ChevronDown, Filter, Calendar } from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useAuth } from "../auth/AuthProvider";

export function TopNavigation() {
  const { user } = useAuth();

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
    <header className="flex flex-col border-b border-border bg-surface px-8 py-5">
      <div className="flex shrink-0 items-start justify-between">
        {/* Left */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-textSecondary">
            Welcome back, <span className="capitalize font-semibold text-slate-800">{displayName}</span>!
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <IconButton variant="ghost">
            <Search className="h-5 w-5" />
          </IconButton>
          <div className="relative">
            <IconButton variant="ghost">
              <Bell className="h-5 w-5" />
            </IconButton>
            <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger border border-white" />
          </div>
          <IconButton variant="ghost">
            <Moon className="h-5 w-5" />
          </IconButton>
          <div className="ml-2 pl-2 flex items-center gap-2">
            <Avatar size="md" src={avatarSrc} fallback={initial} title={user?.email || displayName} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-textSecondary hover:bg-slate-50 cursor-pointer">
          <Calendar className="h-4 w-4" />
          <span>Jan 01, 2024 - Dec 31, 2024</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4 text-textSecondary" />
          Filters
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
