
import { Sun, Upload, Plus } from "lucide-react";
import { Button } from "../ui/Button";

export function DashboardHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 shadow-sm border border-orange-100">
          <Sun className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[28px] font-bold tracking-tight text-textPrimary">
            Good morning, Alex
          </h2>
          <p className="text-sm text-textSecondary">
            Here's what's happening across your data workspace.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          Create dashboard
        </Button>
        <Button>
          <Upload className="h-4 w-4" />
          Upload dataset
        </Button>
      </div>
    </div>
  );
}
