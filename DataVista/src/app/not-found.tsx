"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-appBackground text-textPrimary font-sans p-6 text-center">
      <div className="max-w-md w-full flex flex-col items-center">
        {/* Error 404 SVG Illustration */}
        <div className="w-72 sm:w-80 max-w-full mb-6 animate-in fade-in zoom-in-95 duration-500">
          <img
            src="/assets/illustrations/system/illustration-error-404.svg"
            alt="Page Not Found"
            className="w-full h-auto"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary mb-2">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary max-w-xs sm:max-w-sm mb-8 leading-relaxed">
          The analytics dashboard or route you are looking for doesn't exist or has been relocated.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-border text-textPrimary text-xs font-bold hover:bg-primary-soft/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
