import React, { useState, useEffect } from 'react';
import { Upload, FileUp, CheckCircle2, Sparkles, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function UploadDataset() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
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
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-50 selection:bg-primary/30">
      {/* Top right Sign Out button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl border border-white/10 transition-all backdrop-blur-sm shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
      {/* Dynamic Background Spotlight Effect */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.1), transparent 40%)`
        }}
      />
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6 ring-1 ring-white/10 shadow-2xl backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Welcome to DataVista
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your dataset to unlock powerful analytics, seamless transformations, and stunning visualizations.
          </p>
        </div>

        {/* Upload Dropzone */}
        <div
          className={`w-full relative rounded-3xl border border-white/10 p-12 transition-all duration-500 ease-out flex flex-col items-center justify-center gap-6 overflow-hidden backdrop-blur-md ${
            isDragging
              ? "bg-sky-500/10 border-sky-500/50 scale-[1.02] shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)]"
              : "bg-white/5 hover:bg-white/10 hover:border-white/20 shadow-2xl"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Subtle inner glow for dropzone */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          
          <div className={`relative p-6 rounded-full transition-all duration-500 ${
            file 
              ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 scale-110' 
              : 'bg-white/5 text-slate-300 ring-1 ring-white/10 group-hover:bg-white/10 group-hover:scale-110'
          }`}>
            {file ? <CheckCircle2 className="w-12 h-12" /> : <Upload className="w-12 h-12" />}
          </div>

          <div className="text-center relative z-10">
            {file ? (
              <div className="space-y-3 animate-in fade-in zoom-in duration-500">
                <p className="text-2xl font-semibold text-white">{file.name}</p>
                <p className="text-sm font-medium text-emerald-400/80 bg-emerald-500/10 inline-block px-3 py-1 rounded-full">
                  {(file.size / 1024 / 1024).toFixed(2)} MB Ready
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-2xl font-semibold text-white">
                  Drag & drop your file here
                </p>
                <p className="text-sm text-slate-400">
                  Supports CSV, Excel, JSON, and SQLite files up to 500MB
                </p>
              </div>
            )}
          </div>

          {!file && (
            <div className="relative z-10 mt-4">
              <label className="relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-slate-900 transition-all duration-300 bg-white rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] cursor-pointer hover:bg-slate-100 hover:scale-105 active:scale-95 focus:outline-none">
                Browse Files
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls,.json,.sqlite,.db"
                />
              </label>
            </div>
          )}
        </div>

        {/* Action Button */}
        {file && (
          <div className="mt-10 w-full flex justify-center animate-in slide-in-from-bottom-8 fade-in duration-700 z-10">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white transition-all duration-300 bg-sky-500 rounded-2xl shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] hover:bg-sky-400 hover:shadow-[0_0_60px_-15px_rgba(14,165,233,0.7)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              
              {isUploading ? (
                <>
                  <svg className="w-6 h-6 mr-3 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing Workspace...
                </>
              ) : (
                <>
                  <FileUp className="w-6 h-6 mr-3 transition-transform group-hover:-translate-y-1 group-hover:scale-110" />
                  Enter Dashboard
                </>
              )}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
