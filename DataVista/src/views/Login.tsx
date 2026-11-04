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
  ArrowUpRight,
  PieChart as PieIcon
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
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-[#F1F3F9] p-3 sm:p-6 lg:p-8 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
      {/* Centered Split-Screen Analytics Frame */}
      <div className="w-full max-w-6xl rounded-[28px] bg-white border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(30,27,75,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] lg:min-h-[730px]">
        
        {/* ── LEFT PANEL: WARM HUMAN SAAS INDIGO & ANALYTICS PREVIEW ── */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 bg-gradient-to-br from-[#4F46E5] via-[#4338CA] to-[#3730A3] p-8 xl:p-10 flex-col justify-between relative overflow-hidden text-white select-none">
          
          {/* Subtle soft gradient ambient lighting (human, warm, non-glowing) */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-950/30 blur-3xl pointer-events-none" />

          {/* 1. Header: Clean DataVista Logo & Title */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/25 shadow-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                DataVista
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-semibold text-white border border-white/25 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Analytics Platform
            </span>
          </div>

          {/* 2. Headlines: Clean, warm human-designed typography */}
          <div className="relative z-10 my-5 xl:my-6 space-y-2">
            <h2 className="text-3xl xl:text-[34px] font-bold tracking-tight text-white leading-tight">
              Turn Data into Insights
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
              Explore. Analyze. Visualize.
            </p>
            <p className="text-xs xl:text-sm text-indigo-100/90 font-normal leading-relaxed max-w-md">
              Stay ahead with real-time insights, performance analytics, and data-driven strategies. All in one powerful dashboard.
            </p>
          </div>

          {/* 3. Crisp Light Dashboard Mockup (Warm human SaaS UI) */}
          <div className="relative z-10 w-full rounded-2xl bg-white text-slate-800 shadow-[0_20px_50px_rgba(30,27,75,0.22)] border border-white/50 p-4 xl:p-5 flex flex-col gap-3.5 transition-all duration-300">
            {/* Mockup Window Header Bar */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#4F46E5] flex items-center justify-center text-white">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block leading-tight">DataVista Dashboard</span>
                  <span className="text-[9px] text-slate-400 font-medium">Live Analytics Overview</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                Last 30 days
              </span>
            </div>

            {/* KPI Stat Cards (Warm Human Analytics Palette) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Highlight Card: Dark Indigo Tone */}
              <div className="p-2.5 rounded-xl bg-slate-900 text-white flex flex-col justify-between shadow-xs">
                <span className="text-[10px] text-slate-300 font-medium">Total Revenue</span>
                <span className="text-sm font-extrabold text-white mt-1">$84,230</span>
                <span className="text-[9px] font-semibold text-emerald-400 mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +14.8%
                </span>
              </div>

              {/* Stat Card 2 */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Active Users</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1">24,510</span>
                <span className="text-[9px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" /> +8.2%
                </span>
              </div>

              {/* Stat Card 3: Warm Coral Accent */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500 font-medium">Conversion</span>
                <span className="text-sm font-extrabold text-slate-800 mt-1">3.85%</span>
                <span className="text-[9px] font-semibold text-indigo-600 mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> +1.2%
                </span>
              </div>
            </div>

            {/* Visualizations Section: Clean Dual Bar Chart + Distribution Donut */}
            <div className="grid grid-cols-5 gap-3 pt-1">
              {/* Left: Monthly Revenue Bars (3 cols) */}
              <div className="col-span-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] text-slate-700 font-bold mb-1.5">
                  <span>Monthly Revenue</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[9px] text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" /> Direct
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-slate-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Offline
                    </span>
                  </div>
                </div>

                {/* Human Two-Tone Chart Bars (Warm Indigo + Soft Amber) */}
                <div className="h-20 flex items-end justify-between gap-1.5 px-0.5 pt-1">
                  {[
                    { h1: 45, h2: 25, label: "Jan" },
                    { h1: 65, h2: 35, label: "Feb" },
                    { h1: 55, h2: 30, label: "Mar" },
                    { h1: 85, h2: 45, label: "Apr" },
                    { h1: 75, h2: 40, label: "May" },
                    { h1: 95, h2: 50, label: "Jun" },
                    { h1: 90, h2: 45, label: "Jul" },
                  ].map((b, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full flex items-end justify-center gap-0.5 h-16">
                        <div
                          style={{ height: `${b.h1}%` }}
                          className="w-2 bg-[#4F46E5] rounded-t-xs hover:bg-[#4338CA] transition-colors"
                        />
                        <div
                          style={{ height: `${b.h2}%` }}
                          className="w-2 bg-amber-400/90 rounded-t-xs hover:bg-amber-500 transition-colors"
                        />
                      </div>
                      <span className="text-[8px] font-medium text-slate-400">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Distribution Donut Chart (2 cols) */}
              <div className="col-span-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col items-center justify-between">
                <div className="w-full flex items-center justify-between text-[10px] text-slate-700 font-bold mb-1">
                  <span>Distribution</span>
                  <PieIcon className="w-3 h-3 text-slate-400" />
                </div>

                {/* Concentric Ring SVG (Warm Indigo + Warm Amber) */}
                <div className="relative w-16 h-16 flex items-center justify-center my-0.5">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      className="text-[#4F46E5]"
                      strokeDasharray="62, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="11"
                      className="text-amber-500"
                      strokeDasharray="28, 100"
                      strokeDashoffset="-20"
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-extrabold text-slate-800">76%</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[8px] font-semibold text-slate-500">
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" /> Online</span>
                  <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Direct</span>
                </div>
              </div>
            </div>

            {/* Bottom Mini Trend Line: Customer Growth */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-medium">Customer Growth Rate</span>
              <div className="flex items-center gap-2">
                <svg className="w-24 h-4 text-emerald-500 stroke-current fill-none stroke-[1.8]" viewBox="0 0 100 20">
                  <path d="M0 16 Q 25 18, 40 10 T 75 8 T 100 2" />
                </svg>
                <span className="font-bold text-emerald-600 text-[10px]">+22.4%</span>
              </div>
            </div>
          </div>

          {/* 4. Bottom Footer Security Note */}
          <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-indigo-100/80 font-medium">
            <span>Enterprise-grade security • AES-256</span>
            <span className="text-white/70 font-mono">DataVista Platform</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: FOCUSED LOGIN FORM ── */}
        <div className="lg:col-span-6 xl:col-span-6 bg-white p-6 sm:p-10 xl:p-14 flex flex-col justify-between">
          <div className="w-full max-w-md mx-auto my-auto">
            
            {/* Mobile Logo Branding (visible on small screens) */}
            <div className="lg:hidden flex items-center justify-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                DataVista
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
                    className="block w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 transition-all font-medium"
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
                    className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline transition-colors cursor-pointer"
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
                    className="block w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F46E5] focus:outline-none focus:ring-4 focus:ring-[#4F46E5]/10 transition-all font-medium"
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
                    className="h-4 w-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] accent-[#4F46E5] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Remember me
                  </span>
                </label>
              </div>

              {/* Sign In Primary Solid Button (Warm Indigo Pill) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 text-sm font-bold text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer mt-1"
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
                className="font-bold text-[#4F46E5] hover:text-[#4338CA] hover:underline transition-colors cursor-pointer"
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
