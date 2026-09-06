import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { DataVistaLogo } from "../../components/ui/DataVistaLogo";

export const metadata = {
  title: "Terms of Service | DataVista Analytics",
  description: "Terms of Service and legal usage terms for the DataVista analytics platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-appBackground text-textPrimary py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <DataVistaLogo size="md" />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-border pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/20 text-xs font-bold mb-3">
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-textSecondary mt-2">
            Last modified: September 2026 • Version 2.4
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm text-textSecondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">1. Agreement to Terms</h2>
            <p>
              By accessing, browsing, or using the DataVista Analytics application, API endpoints, or client interfaces, you
              confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree with any of
              these provisions, you must immediately terminate platform access.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">2. User Accounts & Workspace Security</h2>
            <p>
              When you create an account, you must provide accurate, current information. You are solely responsible for
              safeguarding your credentials, active browser session tokens, and API authorization keys. Any action performed
              under your authenticated identity will be attributed to your workspace.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">3. Complete Dataset Ownership Guarantee</h2>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-textPrimary space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Zero IP Claim on Customer Data
              </div>
              <p className="text-xs text-textSecondary">
                DataVista claims no intellectual property, copyright, or ownership rights over datasets, schemas, transforms,
                charts, or exported records created in your account. You maintain absolute title and control.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">4. Acceptable Usage Policy</h2>
            <p>
              You agree not to upload datasets that violate applicable privacy statutes, contain malicious software, or attempt
              to exploit parser memory limits. Fair-usage storage and compute limits apply to prevent denial-of-service across
              shared platform components.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">5. Termination</h2>
            <p>
              You may terminate your account at any time via Workspace Settings. DataVista reserves the right to suspend accounts
              that engage in deliberate security abuse or unauthorized automated scraping.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">6. Contact Information</h2>
            <p>
              For legal inquiries regarding these terms, contact{" "}
              <span className="font-semibold text-textPrimary">legal@datavista-analytics.com</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-textMuted py-4">
          © {new Date().getFullYear()} DataVista Analytics Platform. All rights reserved.
        </div>
      </div>
    </div>
  );
}
