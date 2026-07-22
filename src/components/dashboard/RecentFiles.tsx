import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { recentFiles } from "../../data/dashboardMockData";

export function RecentFiles() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Files</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col gap-4">
          {recentFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border bg-slate-50 p-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-slate-400" />
                <span className="truncate text-sm font-medium text-textPrimary">
                  {file.name}
                </span>
              </div>
              <span className="shrink-0 text-xs text-textSecondary">
                {file.date}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-center">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-textPrimary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1">
            View Full Files
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
