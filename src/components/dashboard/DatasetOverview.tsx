import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

export function DatasetOverview() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle>Dataset Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col space-y-4 text-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-textSecondary">Dataset Name</span>
            <span className="font-semibold text-textPrimary text-right">
              IPL Matches 2024.csv
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-textSecondary">Total Rows</span>
            <span className="font-semibold text-textPrimary">15,600</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-textSecondary">Total Columns</span>
            <span className="font-semibold text-textPrimary">15</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-textSecondary">Missing Values</span>
            <span className="font-semibold text-textPrimary">0</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-textSecondary">Last Updated</span>
            <span className="font-semibold text-textPrimary text-right">
              22 May 2024, 10:30 AM
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button variant="primary" className="w-full">
            Upload Dataset
          </Button>
          <Button variant="secondary" className="w-full text-danger-DEFAULT hover:text-danger-hover">
            Remove Dataset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
