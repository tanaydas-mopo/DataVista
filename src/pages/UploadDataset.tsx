import React, { useState, useEffect } from 'react';
import { CloudUpload, FileUp, CheckCircle2, Clock, FolderOpen, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useDataset } from '../context/DatasetContext';

// Floating ambient node particle for Antigravity effect
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export function UploadDataset() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const navigate = useNavigate();

  // Initialize floating zero-gravity particles
  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 4,
      speedX: (Math.random() - 0.5) * 0.05,
      speedY: (Math.random() - 0.5) * 0.05,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(initialParticles);

    // Antigravity floating animation loop
    let animationFrameId: number;
    const updateParticles = () => {
      setParticles(prev =>
        prev.map(p => {
          let newX = p.x + p.speedX;
          let newY = p.y + p.speedY;
          if (newX < 0 || newX > 100) p.speedX *= -1;
          if (newY < 0 || newY > 100) p.speedY *= -1;
          return { ...p, x: newX, y: newY };
        })
      );
      animationFrameId = requestAnimationFrame(updateParticles);
    };

    animationFrameId = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Parallax mouse movement listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) / 45;
      const moveY = (clientY - window.innerHeight / 2) / 45;
      setMousePos({ x: moveX, y: moveY });
    };

    window.addEventListener('mousemove', handleMouseMove);
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

  const { uploadDataset, removeDataset } = useDataset();

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    uploadDataset(file);
    setTimeout(() => {
      setIsUploading(false);
      navigate('/dashboard');
    }, 1200);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans p-6">
      
      {/* Google Antigravity Zero-G Ambient Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-blue-500/20 blur-[1px] transition-transform duration-1000 ease-out"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              transform: `translate(${mousePos.x * (p.id % 3 + 1)}px, ${mousePos.y * (p.id % 3 + 1)}px)`
            }}
          />
        ))}

        {/* Floating Glowing Orbs */}
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse pointer-events-none"
          style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)` }}
        />
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse pointer-events-none"
          style={{ transform: `translate(${-mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px)` }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-transform hover:scale-105">
            <div className="flex items-end gap-0.5 h-4">
              <div className="w-1 bg-white h-2 rounded-sm" />
              <div className="w-1 bg-white h-4 rounded-sm" />
              <div className="w-1 bg-white h-3 rounded-sm" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            DataVista
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 rounded-xl border border-slate-200/80 transition-all shadow-sm active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-2xl w-full flex flex-col items-center my-auto py-8">
        
        {/* Antigravity Floating Parallax Container */}
        <div 
          className="w-full flex flex-col items-center transition-transform duration-500 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${-mousePos.y * 0.08}deg) rotateY(${mousePos.x * 0.08}deg) translateZ(0)`
          }}
        >
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Create New Analysis
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
              Upload a dataset to begin your analytics workflow. DataVista will inspect, clean, analyze, and visualize your data.
            </p>
          </div>

          {/* Main Card: Dropzone */}
          <div className="w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300">
            <div
              className={`w-full relative rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all duration-300 ease-out flex flex-col items-center justify-center text-center ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                  : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/20"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Cloud Icon */}
              <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${
                file 
                  ? 'bg-emerald-100 text-emerald-600 scale-110' 
                  : 'bg-blue-50 text-blue-600 group-hover:scale-110'
              }`}>
                {file ? <CheckCircle2 className="w-8 h-8" /> : <CloudUpload className="w-8 h-8" />}
              </div>

              {file ? (
                <div className="space-y-2 mb-6">
                  <p className="text-lg font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-200">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Drag & Drop Your Dataset
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Upload CSV, Excel (.xlsx), TSV, or JSON files.
                  </p>

                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-md text-[11px] font-semibold text-slate-600 shadow-2xs">CSV</span>
                    <span className="text-slate-300">•</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-md text-[11px] font-semibold text-slate-600 shadow-2xs">XLSX</span>
                    <span className="text-slate-300">•</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-md text-[11px] font-semibold text-slate-600 shadow-2xs">TSV</span>
                    <span className="text-slate-300">•</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200/80 rounded-md text-[11px] font-semibold text-slate-600 shadow-2xs">JSON</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-6">
                    Maximum upload size: 100 MB
                  </p>
                </>
              )}

              {/* Browse Button */}
              {!file ? (
                <label className="relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-blue-600 bg-white border border-blue-600/30 rounded-xl shadow-2xs cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-all duration-200 active:scale-95">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
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
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-70"
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
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Dataset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Card: Recent Files */}
          <div className="w-full mt-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-800">Recent Files</h4>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400">
              No recent dataset files.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl text-center py-4 text-xs text-slate-400">
        © DataVista Analytics • All rights reserved.
      </footer>
    </div>
  );
}
