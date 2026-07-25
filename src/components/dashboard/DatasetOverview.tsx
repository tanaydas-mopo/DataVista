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
      // Reset input value so re-uploading the same file works
      e.target.value = "";
    }
  };

  const isDatasetActive = dataset.status === "active";

  return (
    <Card className="flex flex-col relative">
      {/* Hidden File Input */}
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
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
            isDatasetActive
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {isDatasetActive ? "Active" : "No Dataset"}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col justify-between space-y-4">
        {/* Toast / Notification Banner */}
        {notification && (
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {isDatasetActive ? (
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
            )}
            <span>{notification}</span>
          </div>
        )}

        <div className="flex flex-col space-y-2.5 text-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-textSecondary">Dataset Name</span>
            <span
              className={`font-semibold text-right max-w-[180px] truncate ${
                isDatasetActive ? "text-textPrimary" : "text-slate-400 italic"
              }`}
              title={dataset.name}
            >
              {dataset.name}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-textSecondary">Total Rows</span>
            <span className="font-semibold text-textPrimary">
              {dataset.totalRows}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-textSecondary">Total Columns</span>
            <span className="font-semibold text-textPrimary">
              {dataset.totalColumns}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-textSecondary">Missing Values</span>
            <span className="font-semibold text-textPrimary">
              {dataset.missingValues}
            </span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-textSecondary">Last Updated</span>
            <span className="font-semibold text-textPrimary text-right">
              {dataset.lastUpdated}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-2.5"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4" />
            Upload Dataset
          </Button>
          <button
            type="button"
            disabled={!isDatasetActive}
            onClick={removeDataset}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              isDatasetActive
                ? "text-red-600 bg-white/70 backdrop-blur-md border border-red-200/80 shadow-sm hover:bg-red-50 hover:border-red-300 hover:text-red-700 active:scale-[0.98]"
                : "opacity-50 cursor-not-allowed text-slate-400 bg-slate-50 border border-slate-200"
            }`}
          >
            <Trash2 className="h-4 w-4 shrink-0 text-red-500" />
            Remove Dataset
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
