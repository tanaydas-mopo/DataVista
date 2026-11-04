"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  ChevronDown,
  BarChart3,
  CloudUpload,
  FolderOpen,
  Sparkles,
  ShieldCheck,
  Eye,
  Clock,
  FileText,
  Table,
  Code2,
  FileSpreadsheet,
  Calendar,
  Columns3,
  MoreVertical,
  ArrowRight,
  CheckCircle2,
  Trash2,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useDataset } from '../context/DatasetContext';
import { useAuth } from '../components/auth/AuthProvider';

interface RecentDatasetItem {
  id: string;
  name: string;
  format: string;
  rows: string;
  cols: string;
  date: string;
  preset?: 'ipl' | 'sales' | 'ecommerce';
  fullData?: any;
}

const defaultRecentDatasets: RecentDatasetItem[] = [
  {
    id: "rec_1",
    name: "Sales_Data_2025",
    format: "XLSX",
    rows: "12,500",
    cols: "8",
    date: "Oct 28, 2025 • 2:15 PM",
    preset: "sales",
  },
  {
    id: "rec_2",
    name: "IPL_Dataset",
    format: "CSV",
    rows: "1,147",
    cols: "16",
    date: "Oct 25, 2025 • 11:32 AM",
    preset: "ipl",
  },
  {
    id: "rec_3",
    name: "Customer_Data",
    format: "JSON",
    rows: "5,230",
    cols: "12",
    date: "Oct 20, 2025 • 4:47 PM",
    preset: "ecommerce",
  },
];

export function UploadDataset() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [recentDatasets, setRecentDatasets] = useState<RecentDatasetItem[]>(defaultRecentDatasets);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { dataset, uploadDataset, switchDatasetPreset, loadPreviousDataset } = useDataset();
  const { user } = useAuth();

  const isDatasetActive = dataset.status === "active" && dataset.name !== "" && dataset.name !== "No dataset loaded";

  // Derive user display name & initials
  const rawName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : "Tanay Das");
  const userName = rawName
    .split(/[._-]/)
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  const userEmail = user?.email || "tanay@datavista.io";
  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TD";

  // Load recent datasets from localStorage & active dataset
  useEffect(() => {
    try {
      const raw = localStorage.getItem("datavista_previous_datasets");
      let storedList: RecentDatasetItem[] = [];

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          storedList = parsed.map((item: any, idx: number) => {
            const ext = item.name?.split('.').pop()?.toUpperCase() || "CSV";
            return {
              id: item.id || `hist_${idx}`,
              name: item.name,
              format: ext,
              rows: Number(item.totalRows || 0).toLocaleString(),
              cols: String(item.totalColumns || 0),
              date: item.lastUpdated || "Recently",
              fullData: item.fullData,
            };
          });
        }
      }

      // If active dataset exists and not in stored list, prepend it
      if (isDatasetActive && !storedList.some(s => s.name === dataset.name)) {
        const activeExt = dataset.name.split('.').pop()?.toUpperCase() || "CSV";
        storedList.unshift({
          id: "active_ds",
          name: dataset.name,
          format: activeExt,
          rows: Number(dataset.totalRows || 0).toLocaleString(),
          cols: String(dataset.totalColumns || 0),
          date: dataset.lastUpdated || "Just now",
        });
      }

      // Merge with defaults to maintain 3 clean rows
      const merged = [...storedList];
      for (const def of defaultRecentDatasets) {
        if (merged.length >= 3) break;
        if (!merged.some(m => m.name === def.name)) {
          merged.push(def);
        }
      }
      setRecentDatasets(merged.slice(0, 3));
    } catch (err) {
      console.warn("Could not load recent datasets from localStorage", err);
    }
  }, [isDatasetActive, dataset.name, dataset.totalRows, dataset.totalColumns, dataset.lastUpdated]);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format file size
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

  const handleUploadOrProceed = async () => {
    if (file) {
      setIsUploading(true);
      try {
        await uploadDataset(file);
        router.push('/dashboard');
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setIsUploading(false);
      }
    } else if (isDatasetActive) {
      router.push('/dashboard');
    }
  };

  const handleCancelStagedFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectRecent = (item: RecentDatasetItem) => {
    if (item.fullData) {
      loadPreviousDataset(item.fullData);
      router.push('/dashboard');
    } else if (item.preset) {
      switchDatasetPreset(item.preset);
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    router.push('/login');
  };

  const getFormatBadgeStyle = (format: string) => {
    const f = format.toUpperCase();
    if (f.includes('XLSX') || f.includes('XLS')) {
      return 'bg-emerald-500 text-white';
    }
    if (f.includes('CSV')) {
      return 'bg-blue-600 text-white';
    }
    if (f.includes('JSON')) {
      return 'bg-purple-600 text-white';
    }
    if (f.includes('TSV')) {
      return 'bg-indigo-600 text-white';
    }
    return 'bg-slate-600 text-white';
  };

  const hasStagedFile = !!file;
  const displayName = file ? file.name : "";
  const displaySize = file ? getFormattedSize(file) : "0.00 MB";

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#F8FAFC] text-slate-900 font-sans p-4 sm:p-6 sm:px-8 overflow-x-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* Background Ambient Glows & Subtle Tech Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-blue-400/12 blur-3xl motion-safe:animate-glow-pulse" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-indigo-400/12 blur-3xl motion-safe:animate-glow-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-sky-300/10 blur-3xl" />

        {/* Subtle Background Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.05] stroke-slate-600 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="upload-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#upload-grid-pattern)" />
        </svg>
      </div>

      {/* Top Navigation Bar: Breadcrumb on left, User Avatar Pill on right */}
      <header className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between py-2 sm:py-3">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="text-slate-600 hover:text-blue-600 transition-colors p-1 rounded-md cursor-pointer"
            title="Go to Home"
          >
            <Home className="w-4 h-4" />
          </button>
          <span className="text-slate-300">›</span>
          <span className="text-slate-400 font-medium">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">New analysis</span>
        </div>

        {/* Right: User Profile Pill with Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {userInitials}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              {userName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/dashboard');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center my-auto py-6 sm:py-8">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 max-w-xl mx-auto motion-safe:animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/60 border border-blue-200/80 text-blue-600 text-xs font-semibold mb-3 shadow-2xs">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Data Analytics Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Upload your <span className="text-blue-600">Dataset</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-2 font-normal leading-relaxed">
            Drag and drop your data file or browse to get started with DataVista.
          </p>
        </div>

        {/* Central Upload Section with Flanking Feature Cards */}
        <div className="relative w-full max-w-5xl flex items-center justify-center motion-safe:animate-fade-in-up-delay-1">
          {/* Left Feature Card & Connecting Curved Line (Desktop xl/lg) */}
          <div className="hidden lg:flex absolute -left-2 xl:-left-10 top-12 z-20 flex-col items-start pointer-events-none">
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100/90 p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] w-[190px] text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.1),0_4px_12px_rgba(37,99,235,0.06)] hover:border-blue-200/60">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Auto-detect<br />data types
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Smart detection for faster analysis
              </p>
            </div>

            {/* Curved Connector SVG with Glowing Sphere */}
            <div className="absolute left-[130px] top-[70px] w-36 h-28 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 140 110" fill="none">
                <path
                  d="M 10 10 C 60 10, 80 80, 135 95"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
              {/* Glowing Orb along connector */}
              <div className="absolute left-[56px] top-[40px] w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_0_14px_rgba(79,70,229,0.7)] motion-safe:animate-pulse" />
            </div>
          </div>

          {/* Right Feature Cards & Connecting Curved Line (Desktop xl/lg) */}
          <div className="hidden lg:flex absolute -right-2 xl:-right-10 top-6 z-20 flex-col items-start gap-3.5 pointer-events-none">
            {/* Top Right Card: Secure file processing */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100/90 p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] w-[190px] text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.1),0_4px_12px_rgba(37,99,235,0.06)] hover:border-blue-200/60">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2.5 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Secure file<br />processing
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Your data is safe with us
              </p>
            </div>

            {/* Bottom Right Card: Preview before analysis */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100/90 p-4 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] w-[190px] text-left transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.1),0_4px_12px_rgba(37,99,235,0.06)] hover:border-blue-200/60">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center mb-2.5">
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Preview before<br />analysis
              </p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Check your data first
              </p>
            </div>

            {/* Curved Connector SVG with Glowing Sphere */}
            <div className="absolute -left-[125px] top-[140px] w-36 h-28 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 140 110" fill="none">
                <path
                  d="M 130 10 C 80 10, 50 80, 5 95"
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
              {/* Glowing Orb along connector */}
              <div className="absolute left-[64px] top-[40px] w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_0_14px_rgba(139,92,246,0.7)] motion-safe:animate-pulse" />
            </div>
          </div>

          {/* Center Card: Main Rounded Upload Container with Soft Shadow */}
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl border border-slate-100 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.08),0_10px_30px_-10px_rgba(0,0,0,0.03)] p-5 sm:p-7 md:p-8 z-10 transition-all duration-200">
            {/* Inner Dashed Drag-and-Drop Area */}
            <div
              className={`w-full rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all duration-300 ease-out flex flex-col items-center justify-center text-center ${
                isDragging
                  ? "border-blue-600 bg-blue-100/40 shadow-[0_0_30px_rgba(37,99,235,0.22)] ring-4 ring-blue-500/10 scale-[1.01]"
                  : "border-blue-400/60 bg-blue-50/20 hover:border-blue-500 hover:bg-blue-50/35 hover:shadow-[0_0_20px_rgba(37,99,235,0.08)]"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {hasStagedFile ? (
                /* Staged File Ready State */
                <div className="w-full flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3 transition-transform duration-300 scale-105">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <p className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-sm">
                    {displayName}
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full mt-1.5 mb-5 inline-block">
                    {displaySize} • Ready to analyze
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={handleUploadOrProceed}
                      disabled={isUploading}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.98] active:shadow-md cursor-pointer disabled:opacity-70 disabled:hover:translate-y-0"
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
                          <ArrowRight className="w-4 h-4" />
                          Proceed to Analysis
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelStagedFile}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Idle Drag-and-Drop Area matching Reference Image */
                <>
                  {/* Cloud Upload Icon with 3 Accent Rays & Gentle Floating Motion */}
                  <div className="relative mb-3 motion-safe:animate-cloud-float">
                    {/* Top-right accent sparks */}
                    <div className="absolute -top-1.5 -right-2 flex items-center gap-0.5 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                      <span className="w-1 h-3.5 rotate-45 rounded-full bg-blue-500" />
                      <span className="w-1 h-2 -rotate-12 rounded-full bg-blue-400" />
                    </div>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                      <CloudUpload className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Upload your dataset
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Drag and drop your file here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 font-semibold underline hover:text-blue-700 cursor-pointer inline"
                    >
                      browse
                    </button>
                  </p>

                  {/* Format Pills: CSV, XLSX, JSON, TSV */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 my-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      CSV
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                      <Table className="w-3.5 h-3.5 text-emerald-500" />
                      XLSX
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                      <Code2 className="w-3.5 h-3.5 text-amber-500" />
                      JSON
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                      TSV
                    </div>
                  </div>

                  {/* Size Limit Divider */}
                  <div className="relative w-full max-w-xs flex items-center justify-center my-3">
                    <div className="w-full border-t border-slate-200" />
                    <span className="absolute bg-blue-50/90 px-3 text-[11px] font-medium text-slate-400 select-none">
                      Maximum upload size: 100 MB
                    </span>
                  </div>

                  {/* Primary Browse Files Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.98] active:shadow-md cursor-pointer mt-1"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Browse files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls,.tsv,.json,.sqlite,.db"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Feature Cards (< lg screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl lg:hidden mt-4 motion-safe:animate-fade-in-up-delay-1">
          <div className="flex items-center sm:flex-col sm:items-start gap-3 p-3.5 bg-white/95 rounded-2xl border border-slate-100 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200/60 transition-all duration-300 ease-out">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Auto-detect data types</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Smart detection for faster analysis</p>
            </div>
          </div>
          <div className="flex items-center sm:flex-col sm:items-start gap-3 p-3.5 bg-white/95 rounded-2xl border border-slate-100 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200/60 transition-all duration-300 ease-out">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Secure file processing</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Your data is safe with us</p>
            </div>
          </div>
          <div className="flex items-center sm:flex-col sm:items-start gap-3 p-3.5 bg-white/95 rounded-2xl border border-slate-100 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200/60 transition-all duration-300 ease-out">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Preview before analysis</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Check your data first</p>
            </div>
          </div>
        </div>

        {/* Bottom Card: Recent Datasets Section */}
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] p-4 sm:p-5 mt-7 sm:mt-8 motion-safe:animate-fade-in-up-delay-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Recent Datasets
              </h2>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            {recentDatasets.map((ds) => (
              <div
                key={ds.id}
                onClick={() => handleSelectRecent(ds)}
                className="flex items-center justify-between gap-3 py-3 px-2 sm:px-3 rounded-xl hover:bg-blue-50/50 hover:border-blue-100/60 border border-transparent transition-all duration-200 ease-out cursor-pointer group"
                title={`Load "${ds.name}"`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 shadow-2xs ${getFormatBadgeStyle(ds.format)}`}>
                    {ds.format}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {ds.name}
                  </span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-slate-500 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ds.rows} rows</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Columns3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ds.cols} columns</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ds.date}</span>
                  </div>
                  <div className="p-1 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto text-center py-3 text-xs text-slate-400 font-medium">
        © DataVista Analytics • All rights reserved.
      </footer>
    </div>
  );
}
