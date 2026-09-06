"use client";

import React, { useState, useRef } from 'react';
import {
  CloudUpload,
  FileUp,
  CheckCircle2,
  FolderOpen,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  RotateCcw,
  ShieldCheck,
  Activity,
  X,
  Database,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDataset } from '../context/DatasetContext';
import { DataVistaLogo } from '../components/ui/DataVistaLogo';
import Link from 'next/link';

export function UploadDataset() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { dataset, uploadDataset, removeDataset } = useDataset();

  const isDatasetActive = dataset.status === "active" && dataset.name !== "";

  // Helper to format file size intelligently (B, KB, MB)
  const getFormattedSize = (uploadFile: File | null) => {
    if (uploadFile && uploadFile.size > 0) {
      const bytes = uploadFile.size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return "0.00 MB";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadDataset(file);
      router.push('/dashboard');
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const hasSelectedFile = !!file;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-between bg-appBackground text-textPrimary font-sans p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <DataVistaLogo size="md" />

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary bg-surface hover:bg-primary-soft/40 rounded-xl border border-border transition-all shadow-xs"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-8 flex flex-col gap-6">
        {/* Header Title Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/20 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Data Ingestion Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-textPrimary tracking-tight">
            Import Dataset for Analysis
          </h1>
          <p className="text-sm text-textSecondary max-w-lg mx-auto mt-2 leading-relaxed font-medium">
            Upload your CSV, Excel, or JSON data file. DataVista will instantly infer data types, calculate KPI metrics, and prepare interactive visualizations.
          </p>
        </div>

        {/* Unified Upload Card */}
        <div className="w-full bg-surface rounded-3xl border border-border shadow-md p-6 sm:p-8 flex flex-col gap-6">
          {/* Accessible Dropzone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload dataset dropzone. Press enter or space to browse files, or drag and drop a file."
            onKeyDown={handleKeyDown}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full relative rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
              isDragging
                ? "border-primary bg-primary-soft/40 scale-[1.01]"
                : "border-border/80 bg-primary-soft/10 hover:border-primary/60 hover:bg-primary-soft/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              tabIndex={-1}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls,.tsv,.json"
            />

            {/* Icon */}
            <div
              className={`p-4 rounded-2xl mb-4 transition-all duration-300 shadow-sm ${
                hasSelectedFile
                  ? "bg-emerald-500 text-white scale-110"
                  : "bg-primary text-white shadow-blue-500/20"
              }`}
            >
              {hasSelectedFile ? <CheckCircle2 className="w-8 h-8" /> : <CloudUpload className="w-8 h-8" />}
            </div>

            {hasSelectedFile ? (
              <div className="space-y-2 mb-6">
                <p className="text-base font-bold text-textPrimary">
                  {file?.name}
                </p>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 inline-block px-3.5 py-1 rounded-full border border-emerald-500/30">
                  {getFormattedSize(file)} • Ready to inspect &amp; visualize
                </span>
              </div>
            ) : (
              <>
                <h3 className="text-base sm:text-lg font-bold text-textPrimary mb-1">
                  Drag &amp; drop your dataset file here
                </h3>
                <p className="text-xs text-textSecondary mb-4">
                  or press <kbd className="px-1.5 py-0.5 rounded bg-primary-soft text-primary font-mono text-[10px] font-bold border border-primary/20">Space</kbd> / click to browse your computer
                </p>

                {/* Formats Strip */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                  {["CSV (.csv)", "Excel (.xlsx, .xls)", "JSON (.json)", "TSV (.tsv)"].map((fmt) => (
                    <span
                      key={fmt}
                      className="px-3 py-1 bg-surface border border-border/80 rounded-lg text-xs font-semibold text-textSecondary shadow-2xs"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>

                <p className="text-[11px] text-textMuted mb-5">
                  Maximum file size: 100 MB • Up to 250,000 rows
                </p>
              </>
            )}

            {/* Action Buttons */}
            {!hasSelectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-primary bg-surface border border-primary/40 rounded-xl shadow-xs cursor-pointer hover:bg-primary hover:text-white transition-all active:scale-95"
              >
                <FolderOpen className="w-4 h-4" />
                Browse Files
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-primary rounded-xl shadow-md shadow-blue-500/20 hover:bg-primary-hover transition-all active:scale-95 cursor-pointer disabled:opacity-70"
                >
                  {isUploading ? (
                    <>
                      <svg className="w-4 h-4 text-white animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Parsing &amp; Validating...
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      Import &amp; Analyze
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-textSecondary bg-surface hover:bg-primary-soft/40 rounded-xl border border-border transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Quick-Load Sample Dataset Section */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary" />
                Or start instantly with sample verified data:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="p-3 bg-surface hover:bg-primary-soft/30 border border-border/80 hover:border-primary/40 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">
                    IPL 2024 Season Stats
                  </p>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    15 columns • 10 team records • Clean schema
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-primary transition-colors" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/visual-builder")}
                className="p-3 bg-surface hover:bg-primary-soft/30 border border-border/80 hover:border-primary/40 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">
                    Visual Chart Sandbox
                  </p>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    23 chart templates with live data bindings
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          {/* Active Dataset Status Bar */}
          {isDatasetActive && (
            <div className="p-3.5 rounded-2xl bg-primary-soft/30 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary text-white shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-textPrimary truncate max-w-[200px] sm:max-w-[300px]">
                      {dataset.name}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    {dataset.totalRows} rows • {dataset.totalColumns} columns indexed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => router.push("/data-schema")}
                  className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-soft rounded-lg transition-colors cursor-pointer"
                >
                  View Schema
                </button>
                <button
                  type="button"
                  onClick={() => removeDataset()}
                  title="Unload current dataset"
                  className="p-1.5 text-textMuted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features / Security Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-surface/80 border border-border/70 flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-primary mb-0.5" />
            <span className="text-xs font-bold text-textPrimary">Client-Side Privacy</span>
            <span className="text-[11px] text-textSecondary">Data parsed in-memory without third-party tracking</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface/80 border border-border/70 flex flex-col items-center gap-1">
            <Activity className="w-4 h-4 text-emerald-500 mb-0.5" />
            <span className="text-xs font-bold text-textPrimary">Instant Quality Audit</span>
            <span className="text-[11px] text-textSecondary">Detects missing values, duplicates, and column types</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface/80 border border-border/70 flex flex-col items-center gap-1">
            <Info className="w-4 h-4 text-primary mb-0.5" />
            <span className="text-xs font-bold text-textPrimary">23 Chart Visualizations</span>
            <span className="text-[11px] text-textSecondary">Ready to analyze across Bar, Line, Radar, and Heatmap</span>
          </div>
        </div>
      </main>

      {/* Clean Global Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textMuted">
        <p>© {new Date().getFullYear()} DataVista Analytics Platform. All rights reserved.</p>
        <div className="flex items-center gap-4 font-semibold">
          <Link href="/terms" className="hover:text-textPrimary transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-textPrimary transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:text-textPrimary transition-colors">
            Documentation
          </Link>
        </div>
      </footer>
    </div>
  );
}
