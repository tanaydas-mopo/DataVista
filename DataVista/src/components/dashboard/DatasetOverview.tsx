"use client";

import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { useDataset } from "../../context/DatasetContext";
import {
  Upload,
  Trash2,
  CheckCircle,
  Info,
  Database,
  Undo2,
  AlertTriangle,
  X
} from "lucide-react";

export function DatasetOverview() {
  const {
    dataset,
    uploadDataset,
    removeDataset,
    notification,
    restorePreviousDataset,
    canUndoDataset
  } = useDataset();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const confirmDelete = () => {
    setShowDeleteModal(false);
    removeDataset();
  };

  return (
    <>
      <Card className="flex flex-col relative shadow-xs border-border">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.tsv,.json"
          className="hidden"
          aria-label="Upload dataset file"
        />

        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/50">
          <CardTitle className="text-sm font-bold text-textPrimary flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Dataset Overview
          </CardTitle>
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
              isDatasetActive
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-primary-soft text-textMuted border border-border"
            }`}
          >
            {isDatasetActive ? "Active" : "No Dataset"}
          </span>
        </CardHeader>

        <CardContent className="flex flex-col justify-between space-y-4 pt-4">
          {notification && (
            <div className="p-3 rounded-xl bg-primary-soft/40 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {isDatasetActive ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Info className="h-4 w-4 text-primary shrink-0" />
                )}
                <span>{notification}</span>
              </div>
              {canUndoDataset && (
                <button
                  type="button"
                  onClick={restorePreviousDataset}
                  className="inline-flex items-center gap-1 font-bold text-xs bg-primary text-white px-2.5 py-1 rounded-lg hover:bg-primary-hover transition-all cursor-pointer shrink-0"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-textSecondary font-medium">Dataset Name</span>
              <span
                className={`font-bold text-right max-w-[180px] truncate ${
                  isDatasetActive ? "text-textPrimary" : "text-textMuted italic"
                }`}
                title={dataset.name}
              >
                {dataset.name}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-textSecondary font-medium">Total Rows</span>
              <span className="font-bold text-textPrimary">{dataset.totalRows}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-textSecondary font-medium">Total Columns</span>
              <span className="font-bold text-textPrimary">
                {dataset.totalColumns} Attributes
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-textSecondary font-medium">Missing Values</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {dataset.missingValues} (Clean)
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-textSecondary font-medium">Last Updated</span>
              <span className="font-semibold text-textPrimary text-right">
                {dataset.lastUpdated}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2 h-10 text-xs font-bold rounded-xl cursor-pointer active:scale-95"
              onClick={handleUploadClick}
            >
              <Upload className="h-4 w-4" />
              Upload New Dataset
            </Button>

            <button
              type="button"
              disabled={!isDatasetActive}
              onClick={() => setShowDeleteModal(true)}
              className={`w-full flex items-center justify-center gap-2 px-4 h-10 text-xs font-bold rounded-xl transition-all duration-200 ${
                isDatasetActive
                  ? "text-danger bg-danger-soft border border-danger/30 hover:bg-danger/20 active:scale-[0.98] cursor-pointer"
                  : "opacity-40 cursor-not-allowed text-textMuted bg-primary-soft/30 border border-border"
              }`}
            >
              <Trash2 className="h-4 w-4 shrink-0 text-danger" />
              Remove Dataset
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal before Removing Dataset */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dataset-title"
        >
          <div
            className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-danger-soft text-danger border border-danger/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="delete-dataset-title" className="text-base font-bold text-textPrimary">
                    Remove Dataset?
                  </h3>
                  <p className="text-xs text-textSecondary mt-0.5">
                    This will unload &ldquo;{dataset.name}&rdquo; from active analysis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-textMuted hover:text-textPrimary rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed mb-6">
              Removing the dataset detaches it from the active workspace view and resets dashboard KPI cards and visual plots. Your local disk file remains unaffected, and you can undo this action immediately from the top notification banner.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:bg-primary-soft/30 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-danger hover:bg-rose-600 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
