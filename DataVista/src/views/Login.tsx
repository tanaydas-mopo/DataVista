"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../components/auth/AuthProvider";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  PieChart as PieIcon,
  Activity,
  Layers,
  ChevronRight
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

  const handleGoogleLogin = async () => {
    setError(null);
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/upload-dataset` : undefined,
      },
    });
    if (oAuthError) setError(oAuthError.message);
  };

  const handleGithubLogin = async () => {
    setError(null);
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/upload-dataset` : undefined,
      },
    });
    if (oAuthError) setError(oAuthError.message);
  };

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F8FAFC] p-3 sm:p-6 lg:p-8 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      {/* Centered Split-Screen Analytics Frame */}
      <div className="w-full max-w-6xl rounded-[32px] bg-white border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] lg:min-h-[740px]">
        
        {/* ── LEFT PANEL: DATAVISTA BRANDING & ANALYTICS VISUALS ── */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] p-8 xl:p-12 flex-col justify-between relative overflow-hidden text-white select-none">
          {/* Subtle Background Glows & Ambience */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none motion-safe:animate-glow-pulse" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

          {/* Subtle Grid Pattern Overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.04] stroke-white pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="login-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid-pattern)" />
          </svg>

          {/* 1. Header: DataVista Logo & Name Prominently at Top */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Data<span className="text-sky-400">Vista</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-sky-300 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise Suite
            </span>
          </div>

          {/* 2. Headlines: "Turn Data into Insights" + "Explore. Analyze. Visualize." */}
          <div className="relative z-10 my-6 xl:my-8 space-y-2.5">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Turn Data into <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Insights</span>
            </h2>
            <p className="text-xs xl:text-sm font-bold uppercase tracking-widest text-sky-400">
              Explore. Analyze. Visualize.
            </p>
            <p className="text-xs xl:text-sm text-slate-300/90 font-normal leading-relaxed max-w-md">
              Stay ahead with real-time insights, multi-dimensional charts, and data-driven intelligence all in one powerful analytics platform.
            </p>
          </div>

          {/* 3. Analytics Dashboard Mockup (Floating Charts, Bar Graphs, Donut & Sparklines) */}
          <div className="relative z-10 w-full rounded-2xl bg-slate-900/70 border border-white/15 shadow-2xl backdrop-blur-xl p-4 xl:p-5 flex flex-col gap-3.5 transition-all duration-300 hover:border-white/25">
            {/* Mini Dashboard Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-bold text-slate-200 text-[11px] ml-1">Live Analytics Dashboard</span>
              </div>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-500/15 border border-sky-400/20 px-2 py-0.5 rounded-md">
                15,600 Records
              </span>
            </div>

            {/* Mini KPI Cards Strip */}
            <div className="grid grid-cols-3 gap-2 text-left">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Total Matches</span>
                <span className="text-sm font-extrabold text-white mt-0.5">74</span>
                <span className="text-[9px] font-bold text-emerald-400 mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +12% YoY
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Runs / Margin</span>
                <span className="text-sm font-extrabold text-white mt-0.5">18,523</span>
                <span className="text-[9px] font-bold text-sky-400 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> Avg 125.6
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Data Quality</span>
                <span className="text-sm font-extrabold text-white mt-0.5">100%</span>
                <span className="text-[9px] font-bold text-purple-300 mt-1 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Clean Source
                </span>
              </div>
            </div>

            {/* Charts Split Area: Bar Chart & Donut Chart */}
            <div className="grid grid-cols-5 gap-3 pt-1">
              {/* Left: Animated Multi-Bar Chart (3 cols) */}
              <div className="col-span-3 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-slate-300 mb-2 font-semibold">
                  <span>Victory Breakdown</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[9px] text-sky-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> CSK
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-blue-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> RCB
                    </span>
                  </div>
                </div>

                {/* Animated Bars */}
                <div className="h-20 flex items-end justify-between gap-1.5 px-1 pt-2">
                  {[
                    { h1: 85, h2: 60, label: "MI" },
                    { h1: 70, h2: 90, label: "CSK" },
                    { h1: 65, h2: 80, label: "RCB" },
                    { h1: 95, h2: 70, label: "KKR" },
                    { h1: 50, h2: 45, label: "RR" },
                    { h1: 40, h2: 55, label: "SRH" },
                  ].map((b, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full flex items-end justify-center gap-0.5 h-16">
                        <div
                          style={{ height: `${b.h1}%` }}
                          className="w-2 bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-sm transition-all duration-500 hover:brightness-125"
                        />
                        <div
                          style={{ height: `${b.h2}%` }}
                          className="w-2 bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-sm transition-all duration-500 hover:brightness-125"
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: SVG Donut Chart (2 cols) */}
              <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between text-[10px] text-slate-300 font-semibold mb-1">
                  <span>Share</span>
                  <PieIcon className="w-3 h-3 text-sky-400" />
                </div>

                {/* Concentric Donut SVG */}
                <div className="relative w-16 h-16 flex items-center justify-center my-0.5">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      className="text-white/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 1: Blue */}
                    <path
                      className="text-sky-400"
                      strokeDasharray="45, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 2: Indigo */}
                    <path
                      className="text-indigo-400"
                      strokeDasharray="30, 100"
                      strokeDashoffset="-45"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-black text-white">84%</span>
                  </div>
                </div>

                <span className="text-[8px] font-medium text-slate-400 text-center">
                  Top 3 Teams
                </span>
              </div>
            </div>
          </div>

          {/* 4. Bottom Footer Note */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Client-side Privacy &amp; AES-256 Storage
            </span>
            <span className="text-slate-500 font-mono">DataVista v2.4</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: FOCUSED LOGIN FORM ── */}
        <div className="lg:col-span-6 xl:col-span-6 bg-white p-6 sm:p-10 xl:p-14 flex flex-col justify-between">
          <div className="w-full max-w-md mx-auto my-auto">
            
            {/* Mobile Logo Branding (visible on small screens) */}
            <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Data<span className="text-blue-600">Vista</span>
              </span>
            </div>

            {/* Header: Welcome Back! */}
            <div className="mb-6 sm:mb-8 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed font-normal">
                Sign in to your DataVista account.
              </p>
            </div>

            {/* Social Authentication Buttons */}
            <div className="space-y-2.5 mb-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all active:scale-[0.99] cursor-pointer"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all active:scale-[0.99] cursor-pointer"
              >
                <svg className="h-4 w-4 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sign in with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-white px-3 text-slate-400 font-medium select-none">
                  or
                </span>
              </div>
            </div>

            {/* Accessible Error Notice */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-200 animate-in fade-in duration-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Standard Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-700"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="block w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="block w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    id="login-remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Sign In Primary Gradient Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer mt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Create Account Link */}
            <div className="mt-7 text-center text-xs text-slate-500 font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-center pt-6 text-[11px] text-slate-400 font-medium">
            © 2026 DataVista. All rights reserved.
          </div>
        </div>

      </div>
    </main>
  );
}
