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
  Sparkles,
  ShieldCheck,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { DataVistaLogo } from "../components/ui/DataVistaLogo";

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
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-appBackground p-4 sm:p-6 lg:p-10 font-sans text-textPrimary">
      <div className="w-full max-w-5xl rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Column: Product Value & Analytical Showcase (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary/10 via-primary-soft/30 to-surface border-r border-border p-8 xl:p-10 flex-col justify-between relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <DataVistaLogo size="md" />
            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Analytics
              </span>
              <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-textPrimary leading-tight">
                Inspect, clean, and visualize data in seconds.
              </h2>
              <p className="text-xs xl:text-sm text-textSecondary leading-relaxed">
                Connect datasets directly in your browser with zero server data retention and instant visual analytics.
              </p>
            </div>
          </div>

          {/* Micro Analytical KPI Showcase */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-textPrimary">Instant Chart Builder</p>
                <p className="text-[11px] text-textSecondary">23 chart varieties with automatic measure detection</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface/90 border border-border shadow-sm backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-textPrimary">Client-Isolated Parsing</p>
                <p className="text-[11px] text-textSecondary">Your private records stay confidential inside your device</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between text-[11px] text-textMuted font-medium">
            <span>SOC2 &amp; GDPR Aligned</span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              DataVista v2.4
            </span>
          </div>
        </div>

        {/* Right Column: Focused Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-center max-w-lg mx-auto w-full">
          {/* Mobile Logo View */}
          <div className="lg:hidden flex justify-center mb-6">
            <DataVistaLogo size="md" />
          </div>

          {/* Page Heading & Positioning */}
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              Sign in to DataVista
            </h1>
            <p className="text-xs sm:text-sm text-textSecondary mt-2 leading-relaxed">
              Analyze datasets, build interactive charts, and export executive reports in one workspace.
            </p>
          </div>

          {/* Accessible Error Notice */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex items-center gap-2.5 rounded-xl bg-danger-soft p-3.5 text-xs font-semibold text-danger border border-danger/20 animate-in fade-in duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-textPrimary uppercase tracking-wider"
              >
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-textMuted" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="block w-full h-11 rounded-xl border border-borderStrong bg-surface pl-10 pr-4 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-textPrimary uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-textMuted" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full h-11 rounded-xl border border-borderStrong bg-surface pl-10 pr-11 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-textMuted hover:text-textPrimary transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-borderStrong text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <span className="text-xs text-textPrimary font-medium">
                  Remember me for 30 days
                </span>
              </label>
            </div>

            {/* Primary Action Button (DataVista Blue) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Social Sign-In Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-surface px-4 text-textMuted font-bold uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-borderStrong bg-surface px-4 text-xs font-bold text-textPrimary transition-all hover:bg-primary-soft/30 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs cursor-pointer active:scale-[0.98]"
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
              Google
            </button>

            <button
              onClick={handleGithubLogin}
              type="button"
              className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-borderStrong bg-surface px-4 text-xs font-bold text-textPrimary transition-all hover:bg-primary-soft/30 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center text-xs text-textSecondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-primary hover:underline transition-colors cursor-pointer"
            >
              Create workspace
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
