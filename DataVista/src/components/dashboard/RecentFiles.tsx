"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  FileSpreadsheet,
  Clock,
  FolderOpen,
  CheckCircle2,
  X,
  Search
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useDataset } from "../../context/DatasetContext";
import { useRouter } from "next/navigation";

interface RecentFileItem {
  id: string;
  name: string;
  type: "ipl" | "sales" | "ecommerce";
  format: string;
  date: string;
  size: string;
  rows: string;
  cols: string;
}

export function RecentFiles() {
  const { dataset, switchDatasetPreset } = useDataset();
  const router = useRouter();

  const [showAllFilesModal, setShowAllFilesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const files: RecentFileItem[] = [
    {
      id: "f1",
      name: "IPL Matches 2024.csv",
      type: "ipl",
      format: "CSV",
      date: "22 May 2024",
      size: "4.8 MB",
      rows: "15,600",
      cols: "15",
    },
    {
      id: "f2",
      name: "E-Commerce Revenue 2026.csv",
      type: "sales",
      format: "CSV",
      date: "20 May 2024",
      size: "6.1 MB",
      rows: "24,850",
      cols: "12",
    },
    {
      id: "f3",
      name: "Global Retail Analytics.csv",
      type: "ecommerce",
      format: "CSV",
      date: "18 May 2024",
      size: "9.5 MB",
      rows: "42,100",
      cols: "18",
    },
  ];

  const filteredFiles = files.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFile = (fileItem: RecentFileItem) => {
    switchDatasetPreset(fileItem.type);
    setShowAllFilesModal(false);
  };

  return (
    <>
      <Card className="flex h-full flex-col shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-textPrimary flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Datasets
          </CardTitle>
          <span className="text-[11px] font-bold text-textMuted">
            {files.length} Saved
          </span>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between pt-3 pb-4">
          <div className="flex flex-col gap-2.5">
            {files.map((file) => {
              const isActive = dataset.name === file.name;
              return (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isActive
                      ? "border-primary/50 bg-primary-soft/30 shadow-2xs"
                      : "border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/10"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-primary-soft text-primary"
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-textPrimary max-w-[140px] sm:max-w-[170px]">
                          {file.name}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 rounded-md border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-textSecondary mt-0.5">
                        {file.rows} rows • {file.cols} cols • {file.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => handleSelectFile(file)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Load
                      </button>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowAllFilesModal(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline transition-colors cursor-pointer p-1"
            >
              View Full Files Directory
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Full Files Management Modal */}
      {showAllFilesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowAllFilesModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="recent-files-modal-title"
        >
          <div
            className="w-full max-w-xl bg-surface border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary text-white">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="recent-files-modal-title" className="text-base font-bold text-textPrimary">
                    Workspace Datasets &amp; File Manager
                  </h3>
                  <p className="text-xs text-textSecondary mt-0.5">
                    Select a dataset to activate analysis across dashboards and charts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllFilesModal(false)}
                className="p-1 text-textMuted hover:text-textPrimary rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <div className="relative">
                <Search className="w-4 h-4 text-textMuted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search file name or format..."
                  className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-surface text-xs font-medium text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredFiles.map((file) => {
                const isActive = dataset.name === file.name;
                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? "border-primary/60 bg-primary-soft/30"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-xs">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-textPrimary">{file.name}</p>
                          <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-primary-soft text-primary rounded-md">
                            {file.format}
                          </span>
                        </div>
                        <p className="text-[11px] text-textSecondary mt-0.5">
                          {file.rows} rows • {file.cols} columns • {file.size} • Modified {file.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectFile(file);
                          router.push("/data-schema");
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-primary-soft/30 rounded-xl transition-colors cursor-pointer"
                      >
                        Inspect Schema
                      </button>
                      <button
                        type="button"
                        disabled={isActive}
                        onClick={() => handleSelectFile(file)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default"
                            : "bg-primary text-white hover:bg-primary-hover shadow-xs cursor-pointer active:scale-95"
                        }`}
                      >
                        {isActive ? "Active" : "Switch To"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowAllFilesModal(false);
                  router.push("/upload-dataset");
                }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                Upload a new file from your device
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowAllFilesModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-primary-soft/30 transition-colors cursor-pointer"
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
