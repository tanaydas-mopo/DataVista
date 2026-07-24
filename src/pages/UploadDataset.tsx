import React, { useState } from 'react';
import { Upload, FileUp, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UploadDataset() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[70vh] w-full animate-in fade-in zoom-in duration-500">
      <div className="max-w-2xl w-full flex flex-col items-center px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-textPrimary mb-3">
            Welcome to DataVista
          </h1>
          <p className="text-lg text-textSecondary">
            Upload your dataset to start exploring and visualizing your data.
          </p>
        </div>

        <div
          className={`w-full relative rounded-3xl border-2 border-dashed p-12 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-6 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border bg-surface hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
          } shadow-sm hover:shadow-md backdrop-blur-sm`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none" />
          
          <div className={`p-5 rounded-full ${file ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'} transition-colors duration-300 shadow-inner`}>
            {file ? <CheckCircle2 className="w-12 h-12" /> : <Upload className="w-12 h-12" />}
          </div>

          <div className="text-center z-10">
            {file ? (
              <div className="space-y-2">
                <p className="text-xl font-semibold text-textPrimary">{file.name}</p>
                <p className="text-sm font-medium text-textSecondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold text-textPrimary mb-2">
                  Drag and drop your dataset here
                </p>
                <p className="text-sm text-textSecondary mb-6">
                  Supports CSV, Excel, JSON, and SQLite files up to 500MB
                </p>
              </>
            )}
          </div>

          {!file && (
            <div className="z-10 mt-2">
              <label className="relative inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-white transition-all duration-200 bg-primary border border-transparent rounded-xl shadow-sm cursor-pointer hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
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

        {file && (
          <div className="mt-8 w-full flex justify-center animate-in slide-in-from-bottom-4 fade-in duration-300 z-10">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center justify-center px-10 py-4 text-base font-semibold text-white transition-all duration-200 bg-primary border border-transparent rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? (
                <>
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading & Analyzing...
                </>
              ) : (
                <>
                  <FileUp className="w-5 h-5 mr-2" />
                  Proceed to Dashboard
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
