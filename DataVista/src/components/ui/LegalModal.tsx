"use client";

import React, { useEffect, useRef } from "react";
import { X, ShieldCheck, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "terms" | "privacy";
}

export function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTerms = type === "terms";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-primary-soft/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-white shadow-xs">
              {isTerms ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base font-bold text-textPrimary">
                {isTerms ? "Terms of Service" : "Privacy Policy"}
              </h2>
              <p className="text-xs text-textSecondary font-medium mt-0.5">
                Version 2.4 • Effective September 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-textSecondary space-y-5 leading-relaxed">
          {isTerms ? (
            <>
              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">1. Agreement to Terms</h3>
                <p>
                  By accessing or using DataVista Analytics (&ldquo;DataVista&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;),
                  you agree to be bound by these Terms of Service. If you are registering an account on behalf of a company or legal entity,
                  you represent that you hold the authority to bind such entity.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">2. Data Ownership & Intellectual Property</h3>
                <p>
                  <strong className="text-textPrimary">You retain 100% ownership of all uploaded datasets, schemas, and analytical outputs.</strong>{" "}
                  DataVista never acquires intellectual property rights to your business records. Uploaded files are processed in-memory or encrypted
                  in isolated workspaces according to your preference settings.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">3. Permitted Platform Usage</h3>
                <p>
                  You agree to use DataVista only for lawful data transformation, analysis, visualization, and reporting. You may not attempt to reverse
                  engineer platform binaries, probe for unauthorized multi-tenant access, or inject malicious payload files into parser engines.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">4. Service Availability & Quotas</h3>
                <p>
                  DataVista provides high availability analytics with client-side buffer safety. Local storage and file upload sizes are subject to standard
                  fair-usage tier thresholds (default 100 MB per file).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">5. Limitation of Liability</h3>
                <p>
                  Analytical visualizations and automated statistical aggregations are delivered &ldquo;as is&rdquo;. Users maintain ultimate discretion
                  in applying generated insights to financial, medical, or life-critical operational decisions.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">1. Information We Collect</h3>
                <p>
                  We collect account identity information (email address, full name, encrypted credentials) necessary to secure your workspace.
                  When using third-party sign-in (Google or GitHub), we only receive public profile identifiers with your explicit consent.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">2. Client-Side Dataset Isolation</h3>
                <p>
                  <strong className="text-textPrimary">Your datasets remain under your direct control.</strong> Raw CSV, Excel, and JSON files are parsed
                  and processed inside your local browser runtime. Cloud synchronization occurs only when you configure authenticated remote endpoints.
                  We never train public foundation AI models on private customer dataset contents.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">3. Data Retention & Account Deletion</h3>
                <p>
                  You have the unilateral right to export or permanently remove your stored datasets and account records at any time from Workspace Settings.
                  Upon account deletion, all cached indices and session tokens are purged immediately.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-textPrimary text-sm">4. Compliance & Security Standards</h3>
                <p>
                  DataVista aligns with GDPR, CCPA, and modern SOC2 privacy controls. Network transmissions utilize TLS 1.3 encryption and zero-knowledge tokens.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface shrink-0">
          <Link
            href={isTerms ? "/terms" : "/privacy"}
            onClick={onClose}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Open full {isTerms ? "Terms" : "Privacy"} page
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
