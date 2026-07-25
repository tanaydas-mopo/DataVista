import React, { useState } from 'react';
import { CloudUpload, FileUp, CheckCircle2, Clock, FolderOpen, LogOut, Trash2, Sparkles, ArrowRight, FileSpreadsheet, RotateCcw, TrendingUp, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDataset } from '../context/DatasetContext';
import { DataVistaLogo } from '../components/ui/DataVistaLogo';

export function UploadDataset() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { dataset, uploadDataset, removeDataset } = useDataset();

  const isDatasetActive = dataset.status === "active";

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
      navigate('/dashboard');
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between bg-appBackground text-textPrimary overflow-y-auto font-sans p-6 transition-colors duration-200 transform-gpu">
      {/* Dynamic Continuous Floating Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-36 -left-36 w-[550px] h-[550px] rounded-full bg-blue-500/15 dark:bg-blue-500/20 blur-3xl animate-glow-pulse" />
        <div className="absolute -bottom-36 -right-36 w-[600px] h-[600px] rounded-full bg-purple-500/15 dark:bg-purple-500/20 blur-3xl animate-glow-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-cyan-400/10 dark:bg-cyan-400/15 blur-3xl animate-pulse" />

        {/* Subtle Tech Pattern Grid Lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.08] stroke-textPrimary pointer-events-none z-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>

        {/* Floating Zero-Gravity Side Analytics Micro-Widgets */}
        <div className="hidden lg:flex absolute left-8 top-1/3 z-10 items-center gap-3 p-3 bg-surface/90 backdrop-blur-md rounded-2xl border border-border shadow-lg animate-float-slow transform-gpu">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-textPrimary">Auto Chart Engine</p>
            <p className="text-[10px] font-medium text-textSecondary">Real-time dynamic visualization</p>
          </div>
        </div>

        <div className="hidden lg:flex absolute right-8 bottom-1/3 z-10 items-center gap-3 p-3 bg-surface/90 backdrop-blur-md rounded-2xl border border-border shadow-lg animate-float-delayed transform-gpu">
          <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-textPrimary">Binary CSV/XLSX Inspection</p>
            <p className="text-[10px] font-medium text-textSecondary">100% data integrity validation</p>
          </div>
        </div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl flex items-center justify-between py-2">
        <DataVistaLogo size="md" />

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-textSecondary bg-surface hover:bg-primary-soft/30 hover:text-textPrimary rounded-xl border border-border transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-2xl w-full flex flex-col items-center my-auto py-8">
        <div className="w-full flex flex-col items-center transform-gpu">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-soft text-primary border border-primary/20 text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Data Analytics Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight mb-3">
              Create New Analysis
            </h1>
            <p className="text-sm md:text-base text-textSecondary max-w-lg mx-auto leading-relaxed">
              Upload your dataset to begin your analytics workflow. DataVista will inspect, clean, analyze, and visualize your data.
            </p>
          </div>

          {/* Main Card: Dropzone */}
          <div className="w-full bg-surface/95 rounded-3xl border border-border shadow-xl p-6 sm:p-8 transition-all duration-200">
            <div
              className={`w-full relative rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all duration-200 ease-out flex flex-col items-center justify-center text-center ${
                isDragging
                  ? "border-primary bg-primary-soft/40 scale-[1.01]"
                  : "border-border bg-primary-soft/10 hover:border-primary/60 hover:bg-primary-soft/20"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Cloud Icon with Continuous Breathing Pulse */}
              <div
                className={`p-4 rounded-2xl mb-4 transition-all duration-300 shadow-md ${
                  file
                    ? 'bg-emerald-500 text-white scale-110'
                    : 'bg-primary text-white shadow-blue-500/20 animate-float-slow'
                }`}
              >
                {file ? <CheckCircle2 className="w-8 h-8" /> : <CloudUpload className="w-8 h-8" />}
              </div>

              {file ? (
                <div className="space-y-2 mb-6">
                  <p className="text-base font-bold text-textPrimary">{file.name}</p>
                  <p className="text-xs font-bold text-emerald-500 bg-emerald-500/15 inline-block px-3.5 py-1 rounded-full border border-emerald-500/30">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-textPrimary mb-1">
                    Drag & Drop Your Dataset
                  </h3>
                  <p className="text-xs text-textSecondary mb-4">
                    Upload CSV, Excel (.xlsx), TSV, or JSON files.
                  </p>

                  {/* Floating Levitating Format Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs animate-float-pill-1">
                      CSV
                    </span>
                    <span className="text-textMuted">•</span>
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs animate-float-pill-2">
                      XLSX
                    </span>
                    <span className="text-textMuted">•</span>
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs animate-float-pill-1">
                      TSV
                    </span>
                    <span className="text-textMuted">•</span>
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs animate-float-pill-2">
                      JSON
                    </span>
                  </div>

                  <p className="text-[11px] text-textMuted mb-6">
                    Maximum upload size: 100 MB
                  </p>
                </>
              )}

              {/* Browse Button */}
              {!file ? (
                <label className="relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-primary bg-surface border border-primary/40 rounded-xl shadow-xs cursor-pointer hover:bg-primary hover:text-white transition-all duration-200 active:scale-95">
                  <FolderOpen className="w-4 h-4" />
                  Browse Files
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls,.tsv,.json,.sqlite,.db"
                  />
                </label>
              ) : (
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold text-white bg-primary rounded-xl shadow-md shadow-blue-500/20 hover:bg-primary-hover transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-70"
                  >
                    {isUploading ? (
                      <>
                        <svg className="w-4 h-4 text-white animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing Dataset...
                      </>
                    ) : (
                      <>
                        <FileUp className="w-4 h-4" />
                        Proceed to Analysis
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      removeDataset();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-danger bg-danger-soft hover:bg-danger/20 rounded-xl border border-danger/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Dataset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Card: Recent Files & Active Dataset Workflow */}
          <div className="w-full mt-4 bg-surface/95 rounded-2xl border border-border p-5 shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
              <h4 className="text-xs font-bold text-textPrimary flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Files & Workflow Details
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-textMuted bg-primary-soft/30 px-2.5 py-0.5 rounded-md border border-border">
                  Auto Sync
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    removeDataset();
                  }}
                  title="Clear Recent Dataset Details"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-danger bg-danger-soft hover:bg-danger/20 px-2.5 py-0.5 rounded-md border border-danger/30 transition-all active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear Recent
                </button>
              </div>
            </div>

            {isDatasetActive ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-textPrimary truncate max-w-[200px] sm:max-w-[280px]">
                        {dataset.name}
                      </p>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/15 rounded-full border border-emerald-500/30">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-textSecondary mt-0.5 font-medium">
                      {dataset.totalRows} rows • {dataset.totalColumns} columns • Updated {dataset.lastUpdated}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all active:scale-95 self-end sm:self-auto cursor-pointer"
                >
                  Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-textSecondary font-medium py-1">
                No recent dataset files uploaded. Upload a CSV or Excel file above to view live analysis details.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center py-4 text-xs text-textMuted font-medium">
        © DataVista Analytics • All rights reserved.
      </footer>
    </div>
  );
}
