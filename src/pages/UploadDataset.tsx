import React, { useState, useEffect, useRef } from 'react';
import { CloudUpload, FileUp, CheckCircle2, Clock, FolderOpen, LogOut, Trash2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDataset } from '../context/DatasetContext';

export function UploadDataset() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { uploadDataset, removeDataset } = useDataset();

  // Smooth hardware-accelerated parallax mouse movement
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (containerRef.current) {
            const moveX = (e.clientX - window.innerWidth / 2) / 45;
            const moveY = (e.clientY - window.innerHeight / 2) / 45;
            containerRef.current.style.setProperty('--tilt-x', `${-moveY * 0.07}deg`);
            containerRef.current.style.setProperty('--tilt-y', `${moveX * 0.07}deg`);
            containerRef.current.style.setProperty('--mouse-x', `${moveX}px`);
            containerRef.current.style.setProperty('--mouse-y', `${moveY}px`);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    uploadDataset(file);
    setTimeout(() => {
      setIsUploading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-between bg-appBackground text-textPrimary overflow-hidden font-sans p-6 transition-colors duration-200 will-change-transform"
      style={{
        '--tilt-x': '0deg',
        '--tilt-y': '0deg',
        '--mouse-x': '0px',
        '--mouse-y': '0px',
      } as React.CSSProperties}
    >
      {/* Hardware-Accelerated Soft Ambient Glowing Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translate(var(--mouse-x), var(--mouse-y))` }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translate(calc(var(--mouse-x) * -1), calc(var(--mouse-y) * -1))` }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-blue-500/20 transition-transform hover:scale-105">
            <div className="flex items-end gap-0.5 h-4">
              <div className="w-1 bg-white h-2 rounded-sm" />
              <div className="w-1 bg-white h-4 rounded-sm" />
              <div className="w-1 bg-white h-3 rounded-sm" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-textPrimary">
            DataVista
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-textSecondary bg-surface hover:bg-primary-soft/30 hover:text-textPrimary rounded-xl border border-border transition-all shadow-xs active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-2xl w-full flex flex-col items-center my-auto py-8">
        {/* Parallax Container */}
        <div
          className="w-full flex flex-col items-center transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `perspective(1000px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateZ(0)`,
          }}
        >
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/20 text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Data Analytics Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight mb-3">
              Create New Analysis
            </h1>
            <p className="text-sm md:text-base text-textSecondary max-w-lg mx-auto leading-relaxed">
              Upload your dataset to begin your analytics workflow. DataVista will inspect, clean, analyze, and visualize your data.
            </p>
          </div>

          {/* Main Glassmorphic Card: Dropzone */}
          <div className="w-full bg-surface/90 backdrop-blur-2xl rounded-3xl border border-border shadow-2xl p-6 sm:p-8 transition-all duration-200">
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
              {/* Cloud Icon */}
              <div
                className={`p-4 rounded-2xl mb-4 transition-all duration-200 shadow-md ${
                  file
                    ? 'bg-emerald-500 text-white scale-110'
                    : 'bg-primary text-white shadow-blue-500/20 group-hover:scale-110'
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

                  {/* Clean Format Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs">CSV</span>
                    <span className="text-textMuted">•</span>
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs">XLSX</span>
                    <span className="text-textMuted">•</span>
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs">TSV</span>
                    <span className="text-textMuted">•</span>
                    <span className="px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold text-textPrimary shadow-xs">JSON</span>
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
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 text-xs font-bold text-white bg-primary rounded-xl shadow-md shadow-blue-500/20 hover:bg-primary-hover transition-all duration-200 active:scale-95 disabled:opacity-70"
                  >
                    {isUploading ? (
                      <>
                        <svg className="w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-danger bg-danger-soft hover:bg-danger/20 rounded-xl border border-danger/30 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Dataset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Card: Recent Files / Status */}
          <div className="w-full mt-4 bg-surface/90 backdrop-blur-xl rounded-2xl border border-border p-5 shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-textPrimary flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Recent Files & Workflow
              </h4>
              <span className="text-[11px] font-semibold text-textMuted bg-primary-soft/30 px-2 py-0.5 rounded-md border border-border">Auto Sync</span>
            </div>
            <p className="text-xs text-textSecondary font-medium">
              No recent dataset files uploaded. Upload a file above to begin.
            </p>
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
