"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle, User, Eye, EyeOff } from 'lucide-react';
import { DataVistaLogo } from '../components/ui/DataVistaLogo';

export function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace('/login');
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
  };

  const handleGithubSignup = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-appBackground p-4 font-sans">
      <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-surface shadow-card border border-border">
        <div className="p-6 pb-8">
          {/* Animated DV Logo Header */}
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            <DataVistaLogo size="lg" animate={true} />
            <p className="text-xs text-textSecondary mt-2 font-medium">
              Create your DataVista workspace
            </p>
          </div>
          
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-danger-soft p-3 text-sm text-danger border border-danger/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-textPrimary"
              >
                Full name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-textMuted" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-lg border border-borderStrong bg-surface p-2 pl-9 text-sm text-textPrimary placeholder:text-textMuted focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-textPrimary"
              >
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-textMuted" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-borderStrong bg-surface p-2 pl-9 text-sm text-textPrimary placeholder:text-textMuted focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-textPrimary"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-textMuted" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-borderStrong bg-surface p-2 pl-9 pr-9 text-sm text-textPrimary placeholder:text-textMuted focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-colors"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-textMuted hover:text-textPrimary focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-textPrimary"
              >
                Confirm password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-textMuted" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border border-borderStrong bg-surface p-2 pl-9 pr-9 text-sm text-textPrimary placeholder:text-textMuted focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-colors"
                  placeholder="Repeat password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-textMuted hover:text-textPrimary focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-borderStrong text-purple focus:ring-purple cursor-pointer accent-purple"
                />
                <span className="text-[13px] text-textPrimary font-medium">Keep me signed in for 30 days</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-borderStrong text-purple focus:ring-purple cursor-pointer accent-purple"
                />
                <span className="text-[13px] text-textPrimary font-medium">
                  I agree to the <a href="#" className="font-semibold text-purple hover:underline">Terms of Service</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-purple p-2.5 text-sm font-bold text-white transition-all hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-offset-2 focus:ring-offset-appBackground disabled:cursor-not-allowed disabled:opacity-70 mt-2 shadow-sm"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative mt-6 mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-surface px-4 text-textMuted font-medium uppercase tracking-wider">
                OR
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleSignup}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-borderStrong bg-surface p-2.5 text-sm font-semibold text-textPrimary transition-all hover:bg-slate-50 dark:hover:bg-sidebarElevated focus:outline-none focus:ring-2 focus:ring-borderStrong focus:ring-offset-2 focus:ring-offset-appBackground shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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
              Continue with Google
            </button>

            <button
              onClick={handleGithubSignup}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-borderStrong bg-surface p-2.5 text-sm font-semibold text-textPrimary transition-all hover:bg-slate-50 dark:hover:bg-sidebarElevated focus:outline-none focus:ring-2 focus:ring-borderStrong focus:ring-offset-2 focus:ring-offset-appBackground shadow-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-textSecondary">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-purple transition-colors hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
