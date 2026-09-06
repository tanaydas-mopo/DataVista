import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { DataVistaLogo } from "../../components/ui/DataVistaLogo";

export const metadata = {
  title: "Privacy Policy | DataVista Analytics",
  description: "Privacy policy and data retention disclosures for DataVista Analytics.",
};

export default function PrivacyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy & Trust
          </div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-textSecondary mt-2">
            Last modified: September 2026 • Version 2.4
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-sm text-textSecondary leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">1. Scope & Commitments</h2>
            <p>
              DataVista Analytics respects your privacy and is engineered around client-side data isolation. This Privacy Policy
              discloses our operational practices regarding personal identification, uploaded datasets, and storage retention.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">2. Client-First Architecture</h2>
            <div className="p-4 rounded-2xl bg-primary-soft/40 border border-primary/20 text-textPrimary space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Lock className="w-4 h-4" />
                Local Processing Guarantee
              </div>
              <p className="text-xs text-textSecondary">
                Your tabular files (CSV, XLSX, TSV, JSON) are parsed in-browser using WebAssembly and JavaScript runtimes.
                Unless you intentionally configure a remote sync endpoint, your dataset rows do not leave your client device.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">3. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1 text-xs text-textSecondary pl-2">
              <li>Account profile details (email address, full name) provided during registration.</li>
              <li>OAuth tokens when authenticating with Google or GitHub (used exclusively for session verification).</li>
              <li>Workspace UI preferences (chosen theme, layout presets, default landing screen).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">4. No AI Training on Customer Data</h2>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-textPrimary space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Zero Machine Learning Ingestion
              </div>
              <p className="text-xs text-textSecondary">
                We never feed, train, fine-tune, or distribute private customer datasets or analytical queries to public
                generative AI models. Your business metrics remain strictly confidential.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">5. Data Retention & Deletion Rights</h2>
            <p>
              Under GDPR and CCPA, you retain the full right to access, export, or erase all stored session data. Selecting
              &ldquo;Remove Dataset&rdquo; immediately clears cached records from browser memory and localStorage buffers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-textPrimary">6. Contact Our Data Protection Officer</h2>
            <p>
              For inquiries or data subject access requests, email{" "}
              <span className="font-semibold text-textPrimary">privacy@datavista-analytics.com</span>.
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
