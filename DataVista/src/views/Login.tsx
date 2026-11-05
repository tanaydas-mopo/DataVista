"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/auth/AuthProvider";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

export function Login() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session) {
      router.replace("/upload-dataset");
    }
  }, [authLoading, session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/upload-dataset");
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F1F3F9] p-4 sm:p-6 lg:p-10 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Centered Split Card Frame */}
      <div className="w-full max-w-[1040px] rounded-[32px] bg-white border border-slate-200/80 shadow-[0_20px_60px_-15px_rgba(30,27,75,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[620px] lg:min-h-[660px]">
        
        {/* ── LEFT PANEL: BRANDING & 3D ANALYTICS VISUAL ── */}
        <div className="hidden lg:flex bg-[#F8F9FE] p-10 xl:p-14 flex-col justify-between relative overflow-hidden select-none border-r border-slate-100">
          
          {/* Soft Organic Ambient Shapes */}
          <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#EAE8FD] opacity-70 pointer-events-none blur-xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#EDEAFE] opacity-60 pointer-events-none blur-xl" />

          {/* 1. Header: Brand Logo & Title */}
          <div className="relative z-10 flex items-center gap-3">
            {/* Custom 3-Bar Brand Mark */}
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0"
              aria-hidden="true"
            >
              <rect x="2" y="15" width="4" height="6" rx="2" fill="#4F46E5" />
              <rect x="9" y="8" width="4" height="13" rx="2" fill="#4F46E5" />
              <rect x="16" y="2" width="4" height="19" rx="2" fill="#4F46E5" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              DataVista
            </span>
          </div>

          {/* 2. Hero Typography */}
          <div className="relative z-10 my-auto py-6">
            <h1 className="text-4xl xl:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Turn Data <br />
              into <span className="text-[#4F46E5]">Insights</span>
            </h1>
            <p className="text-slate-500 font-normal text-base mt-3">
              Explore. Analyze. Visualize.
            </p>
          </div>

          {/* 3. Frosted 3D Bar Chart with Glowing Trend Curve */}
          <div className="relative z-10 w-full mt-auto pt-4">
            <svg
              viewBox="0 0 360 170"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto max-h-[175px] overflow-visible"
              aria-hidden="true"
            >
              <defs>
                {/* Frosted Bar Linear Gradients */}
                <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E2E2FB" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ECEEFF" stopOpacity="0.25" />
                </linearGradient>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D9D8F9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ECEEFF" stopOpacity="0.3" />
                </linearGradient>
                <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D1CFF8" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#ECEEFF" stopOpacity="0.35" />
                </linearGradient>
                <linearGradient id="barGrad4" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8C5F7" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#ECEEFF" stopOpacity="0.4" />
                </linearGradient>

                {/* Soft Radial Glow Filter for Endpoint */}
                <filter id="glowHalo" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
                </filter>
              </defs>

              {/* 4 Frosted Vertical Bars */}
              <rect x="75" y="125" width="40" height="45" rx="8" fill="url(#barGrad1)" />
              <rect x="135" y="98" width="40" height="72" rx="8" fill="url(#barGrad2)" />
              <rect x="195" y="70" width="40" height="100" rx="8" fill="url(#barGrad3)" />
              <rect x="255" y="38" width="40" height="132" rx="8" fill="url(#barGrad4)" />

              {/* Smooth Upward Curve */}
              <path
                d="M 50 148 C 110 145, 175 130, 235 85 C 265 62, 285 45, 305 32"
                stroke="#4F46E5"
                strokeWidth="2.75"
                strokeLinecap="round"
                fill="none"
              />

              {/* Glowing Purple Endpoint Node */}
              <circle cx="305" cy="32" r="16" fill="#4F46E5" opacity="0.22" filter="url(#glowHalo)" />
              <circle cx="305" cy="32" r="8" fill="#4F46E5" opacity="0.35" />
              <circle cx="305" cy="32" r="5" fill="#4F46E5" />
            </svg>
          </div>
        </div>

        {/* ── RIGHT PANEL: FOCUSED LOGIN FORM ── */}
        <div className="bg-white p-8 sm:p-12 xl:p-16 flex flex-col justify-between">
          <div className="w-full max-w-sm mx-auto my-auto">
            
            {/* Mobile Logo Branding (visible on small screens) */}
            <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0"
                aria-hidden="true"
              >
                <rect x="2" y="15" width="4" height="6" rx="2" fill="#4F46E5" />
                <rect x="9" y="8" width="4" height="13" rx="2" fill="#4F46E5" />
                <rect x="16" y="2" width="4" height="19" rx="2" fill="#4F46E5" />
              </svg>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                DataVista
              </span>
            </div>

            {/* Header: Welcome Back! */}
            <div className="text-left">
              <h2 className="text-3xl sm:text-[34px] font-bold text-slate-900 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2 font-normal">
                Sign in to your DataVista account.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              
              {/* Accessible Error Notice */}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-200 animate-in fade-in duration-200"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:outline-none transition-all font-normal"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 focus:outline-none transition-all font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" strokeWidth={1.8} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={1.8} />
                  )}
                </button>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="login-remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-slate-600 font-normal">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Primary Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.99] text-white font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.2]" />
                  </>
                )}
              </button>
            </form>

            {/* Divider ("or") */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-normal select-none">
                  or
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center text-xs sm:text-sm text-slate-500 font-normal">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline transition-colors cursor-pointer"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center pt-8 text-xs text-slate-400 font-normal">
            © 2026 DataVista. All rights reserved.
          </div>
        </div>

      </div>
    </main>
  );
}
