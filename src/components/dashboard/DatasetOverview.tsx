import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { useDataset } from "../../context/DatasetContext";
import { Upload, Trash2, CheckCircle, Info } from "lucide-react";

export function DatasetOverview() {
  const { dataset, uploadDataset, removeDataset, notification } = useDataset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadDataset(e.target.files[0]);
      e.target.value = "";
    }
  };

  const isDatasetActive = dataset.status === "active";

  return (
    <Card className="flex flex-col relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls,.tsv,.json"
        className="hidden"
      />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>Dataset Overview</CardTitle>
        <span
          className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
            isDatasetActive
              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
              : "bg-primary-soft text-textMuted border border-border"
          }`}
        >
          {isDatasetActive ? "Active" : "No Dataset"}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col justify-between space-y-4">
        {notification && (
          <div className="p-2.5 rounded-xl bg-primary-soft border border-primary/30 text-primary text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {isDatasetActive ? (
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-primary shrink-0" />
            )}
            <span>{notification}</span>
          </div>
        )}

        <div className="flex flex-col space-y-2.5 text-sm">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-textSecondary text-xs font-medium">Dataset Name</span>
            <span
              className={`font-semibold text-xs text-right max-w-[180px] truncate ${
                isDatasetActive ? "text-textPrimary" : "text-textMuted italic"
              }`}
              title={dataset.name}
            >
              {dataset.name}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-textSecondary text-xs font-medium">Total Rows</span>
            <span className="font-semibold text-xs text-textPrimary">
              {dataset.totalRows}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-textSecondary text-xs font-medium">Total Columns</span>
            <span className="font-semibold text-xs text-textPrimary">
              {dataset.totalColumns}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-textSecondary text-xs font-medium">Missing Values</span>
            <span className="font-semibold text-xs text-textPrimary">
              {dataset.missingValues}
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-textSecondary text-xs font-medium">Last Updated</span>
            <span className="font-semibold text-xs text-textPrimary text-right">
              {dataset.lastUpdated}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4" />
            Upload Dataset
          </Button>
          <button
            type="button"
            disabled={!isDatasetActive}
            onClick={removeDataset}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              isDatasetActive
                ? "text-danger bg-danger-soft border border-danger/30 shadow-xs hover:bg-danger/20 active:scale-[0.98]"
                : "opacity-40 cursor-not-allowed text-textMuted bg-primary-soft border border-border"
            }`}
          >
            <Trash2 className="h-4 w-4 shrink-0 text-danger" />
            Remove Dataset
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
