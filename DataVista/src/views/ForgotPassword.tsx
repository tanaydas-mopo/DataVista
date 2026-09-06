"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { DataVistaLogo } from "../components/ui/DataVistaLogo";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Supabase password reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/login?reset=success`,
      });

      if (resetError) {
        // Safe handling - display operational message
        console.warn("Reset error notice:", resetError.message);
      }

      setSubmitted(true);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "Unable to send recovery link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-appBackground p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[440px] rounded-3xl bg-surface shadow-2xl border border-border overflow-hidden">
        <div className="p-8 sm:p-10">
          {/* Brand Header */}
          <div className="mb-6 flex flex-col items-center justify-center text-center">
            <DataVistaLogo size="lg" animate={true} />
            <p className="text-xs text-textSecondary mt-2 font-medium">
              Data Analytics &amp; Visualization Platform
            </p>
          </div>

          {!submitted ? (
            <>
              {/* Form Header */}
              <div className="text-center mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">
                  Reset your password
                </h1>
                <p className="text-xs sm:text-sm text-textSecondary mt-2 leading-relaxed">
                  Enter the email associated with your DataVista workspace and we&apos;ll dispatch a recovery link.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-4 flex items-center gap-2.5 rounded-xl bg-danger-soft p-3.5 text-xs font-semibold text-danger border border-danger/20"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="recovery-email"
                    className="block text-xs font-bold text-textPrimary uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Mail className="h-4 w-4 text-textMuted" />
                    </div>
                    <input
                      id="recovery-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="block w-full h-11 rounded-xl border border-borderStrong bg-surface pl-10 pr-4 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                      Sending Recovery Link...
                    </>
                  ) : (
                    "Send Recovery Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-2 space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-textPrimary">
                Check your inbox
              </h1>
              <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
                If an account exists for <strong className="text-textPrimary">{email}</strong>, we have dispatched a password recovery email with further instructions.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleSubmit}
                  className="text-xs font-bold text-primary hover:underline disabled:text-textMuted disabled:no-underline cursor-pointer"
                >
                  {resendCooldown > 0
                    ? `Resend available in ${resendCooldown}s`
                    : "Didn't receive an email? Click to resend"}
                </button>
              </div>
            </div>
          )}

          {/* Return path */}
          <div className="mt-8 pt-4 border-t border-border text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-textSecondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
