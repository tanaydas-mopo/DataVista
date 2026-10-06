"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Filter, Trash2, Edit3, ArrowRightLeft, Type, Sparkles, CheckCircle2, Database,
  X, ChevronDown, Merge, Scissors, SortAsc, Eye,
  MinusSquare, Search, Zap, Undo2, Redo2, Check, Plus, Minus, Layers, RefreshCw, AlertTriangle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Download, Calendar, AlignLeft,
  Info, HelpCircle, Columns3, CheckSquare, Square, SlidersHorizontal, ArrowUpDown, FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";
import {
  ColumnDataType,
  ColumnQualityReport,
  DatasetQualityReport,
  AppliedStepRecord,
  isMissingValue,
  calculateDatasetQuality,
  auditDuplicates,
  executeRemoveDuplicates,
  executeRemoveMissing,
  executeFillMissing,
  executeFilterRows,
  executeSortRows,
  executeDetectOutliers,
  executeRenameColumn,
  executeChangeDataType,
  executeSplitColumn,
  executeMergeColumns,
  executeRemoveColumns,
  executeFindAndReplace,
  executeTrimAndCase,
  executeConvertDates,
  executeRemoveEmptyRowsAndCols,
  replayPipeline,
  calculateMean,
  calculateMedian,
  calculateMode,
} from "../lib/dataCleaningEngine";

type ModalType =
  | null
  | "filter"
  | "duplicates"
  | "find-replace"
  | "change-type"
  | "rename"
  | "auto-clean"
  | "fill-missing"
  | "split-column"
  | "merge-columns"
  | "sort-rows"
  | "remove-columns"
  | "detect-outliers"
  | "remove-nulls"
  | "trim-case"
  | "convert-dates"
  | "remove-empty"
  | "inspect-columns"
  | "export";

type OpCategory = "rows" | "columns" | "clean" | "ai";

interface AppliedStepItem {
  id: string;
  name: string;
  operationType: string;
  detail: string;
  params: Record<string, any>;
  timestamp: string;
  affectedRows: number;
  affectedCells: number;
  headersBefore: string[];
  rowsBefore: Record<string, any>[];
  headersAfter: string[];
  rowsAfter: Record<string, any>[];
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function nowStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ─────────────────────────────────────────────────────────────
   MODAL CONTAINER & UI HELPER COMPONENTS
───────────────────────────────────────────────────────────── */

function Modal({
  title,
  subtitle,
  icon: Icon,
  onClose,
  maxWidth = "max-w-xl",
  children,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200 cursor-pointer"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidth} bg-surface border border-border/80 rounded-2xl shadow-2xl shadow-primary/5 flex flex-col max-h-[88vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 cursor-default`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-gradient-to-r from-primary-soft/30 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-2.5 rounded-xl text-primary ring-1 ring-primary/20 shadow-xs flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-textPrimary tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-textSecondary mt-0.5 font-medium">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-textMuted hover:text-textPrimary hover:bg-primary-soft/60 transition-all duration-200 cursor-pointer active:scale-90"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 text-xs">
          {children}
        </div>
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border cursor-pointer flex items-center gap-1.5 ${
        active
          ? "bg-primary text-white border-primary shadow-xs font-bold scale-[1.01]"
          : "bg-surface text-textSecondary border-border/80 hover:border-primary/40 hover:text-textPrimary hover:bg-primary-soft/20"
      }`}
    >
      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
      <span className="truncate max-w-[180px]">{label}</span>
      {badge && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${active ? "bg-white/20 text-white" : "bg-primary-soft text-primary"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-border/80 bg-surface/90 text-textPrimary rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer pr-9 shadow-xs hover:border-primary/40"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-textMuted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border/80 bg-surface/90 text-textPrimary rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-textMuted shadow-xs hover:border-primary/40"
      />
    </div>
  );
}

function InfoBadge({
  text,
  color = "primary",
  icon: Icon,
}: {
  text: string;
  color?: "primary" | "warning" | "success" | "danger";
  icon?: any;
}) {
  const cls = {
    primary: "bg-primary-soft/50 text-primary border-primary/25",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
  }[color];

  return (
    <div className={`text-xs font-semibold px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${cls}`}>
      {Icon ? <Icon className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0 opacity-80" />}
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

function ActionRow({
  onApply,
  onClose,
  applyLabel = "Apply",
  disabled = false,
}: {
  onApply: () => void;
  onClose: () => void;
  applyLabel?: string;
  disabled?: boolean;
}) {
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onApply();
      onClose();
    }
  };

  return (
    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 mt-2">
      <button
        type="button"
        onClick={handleCancel}
        className="px-4 py-2.5 text-xs font-bold text-textSecondary bg-primary-soft/40 hover:bg-primary-soft/80 rounded-xl border border-border/60 transition-all cursor-pointer hover:text-textPrimary active:scale-95"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleApply}
        disabled={disabled}
        className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer ${
          disabled
            ? "bg-gray-400 opacity-50 cursor-not-allowed shadow-none"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] shadow-blue-500/20"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        {applyLabel}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT: CleanTransform
───────────────────────────────────────────────────────────── */

export function CleanTransform() {
  const { dataset, updateTableData } = useDataset();
  const [activeTab, setActiveTab] = useState<"transform" | "steps">("transform");
  const [modal, setModal] = useState<ModalType>(null);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  // Working active dataset state
  const [workingHeaders, setWorkingHeaders] = useState<string[]>(() => dataset.tableHeaders);
  const [workingRows, setWorkingRows] = useState<Record<string, any>[]>(() => dataset.tableRows);

  // Transformation history & pipeline
  const [appliedSteps, setAppliedSteps] = useState<AppliedStepItem[]>([]);
  const [undoneSteps, setUndoneSteps] = useState<AppliedStepItem[]>([]);

  const isUploaded = dataset.status === "active";
  const [highlightedCells, setHighlightedCells] = useState<Record<string, boolean>>({});
  const [outlierRows, setOutlierRows] = useState<number[]>([]);
  const currentDatasetName = useRef(dataset.name);

  // Synchronize ONLY if a completely new dataset file or preset is loaded
  useEffect(() => {
    if (currentDatasetName.current !== dataset.name) {
      currentDatasetName.current = dataset.name;
      setWorkingHeaders(dataset.tableHeaders);
      setWorkingRows(dataset.tableRows);
      setAppliedSteps([]);
      setUndoneSteps([]);
      setHighlightedCells({});
      setOutlierRows([]);
    }
  }, [dataset.name, dataset.tableHeaders, dataset.tableRows]);

  // Recalculate true dataset quality metrics after every operation
  const quality: DatasetQualityReport = useMemo(() => {
    return calculateDatasetQuality(workingHeaders, workingRows);
  }, [workingHeaders, workingRows]);

  // Commit transformed dataset to active state & global context
  const commitTransform = useCallback(
    (headers: string[], rows: Record<string, any>[]) => {
      setWorkingHeaders(headers);
      setWorkingRows(rows);
      updateTableData(headers, rows);
    },
    [updateTableData]
  );

  // Record an executed step into the reproducible pipeline
  const recordStep = useCallback(
    (
      name: string,
      operationType: string,
      detail: string,
      params: Record<string, any>,
      affectedRows: number,
      affectedCells: number,
      headersBefore: string[],
      rowsBefore: Record<string, any>[],
      headersAfter: string[],
      rowsAfter: Record<string, any>[]
    ) => {
      const stepItem: AppliedStepItem = {
        id: uid(),
        name,
        operationType,
        detail,
        params,
        timestamp: nowStr(),
        affectedRows,
        affectedCells,
        headersBefore,
        rowsBefore,
        headersAfter,
        rowsAfter,
      };

      setAppliedSteps((prev) => [stepItem, ...prev]);
      setUndoneSteps([]); // Clear redo stack on new action
      commitTransform(headersAfter, rowsAfter);
    },
    [commitTransform]
  );

  // Undo last transformation
  const handleUndo = useCallback(() => {
    if (appliedSteps.length === 0) return;
    const [lastStep, ...rest] = appliedSteps;
    setAppliedSteps(rest);
    setUndoneSteps((prev) => [lastStep, ...prev]);
    commitTransform(lastStep.headersBefore, lastStep.rowsBefore);
    setHighlightedCells({});
    setOutlierRows([]);
  }, [appliedSteps, commitTransform]);

  // Redo previously undone transformation
  const handleRedo = useCallback(() => {
    if (undoneSteps.length === 0) return;
    const [nextStep, ...rest] = undoneSteps;
    setUndoneSteps(rest);
    setAppliedSteps((prev) => [nextStep, ...prev]);
    commitTransform(nextStep.headersAfter, nextStep.rowsAfter);
    setHighlightedCells({});
    setOutlierRows([]);
  }, [undoneSteps, commitTransform]);

  // Safe removal & replay of a step from anywhere in the pipeline
  const handleRemoveStep = useCallback(
    (stepId: string) => {
      const remainingSteps = appliedSteps.filter((s) => s.id !== stepId);
      const replayRecords: AppliedStepRecord[] = [...remainingSteps]
        .reverse()
        .map((s) => ({
          id: s.id,
          name: s.name,
          operationType: s.operationType,
          description: s.detail,
          params: s.params,
          timestamp: s.timestamp,
          affectedRows: s.affectedRows,
          affectedCells: s.affectedCells,
          headersSnapshot: s.headersAfter,
          rowsSnapshot: s.rowsAfter,
        }));

      const replayResult = replayPipeline(dataset.tableHeaders, dataset.tableRows, replayRecords);
      if (replayResult.success) {
        setAppliedSteps(remainingSteps);
        commitTransform(replayResult.currentHeaders, replayResult.currentRows);
        setHighlightedCells({});
        setOutlierRows([]);
        setToastMsg("Step removed and pipeline recomputed successfully.");
      } else {
        alert(
          `Cannot safely remove step: ${replayResult.errorMessage}\nThe dataset has been preserved in its current state.`
        );
      }
    },
    [appliedSteps, dataset.tableHeaders, dataset.tableRows, commitTransform]
  );

  // Discard all changes & reset to original upload
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const discardChanges = () => {
    commitTransform(dataset.tableHeaders, dataset.tableRows);
    setAppliedSteps([]);
    setUndoneSteps([]);
    setHighlightedCells({});
    setOutlierRows([]);
    setShowDiscardConfirm(false);
    setToastMsg("Dataset reverted to original uploaded state.");
  };

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  /* ─────────────────────────────────────────────────────────────
     OPERATIONS CATALOG
  ───────────────────────────────────────────────────────────── */
  const [opCategory, setOpCategory] = useState<"all" | OpCategory>("all");
  const [opSearch, setOpSearch] = useState("");

  const operations: {
    icon: any;
    name: string;
    desc: string;
    modal: ModalType;
    category: OpCategory;
  }[] = [
    { icon: Filter, name: "Filter Rows", desc: "Keep or remove rows based on conditions", modal: "filter", category: "rows" },
    { icon: Trash2, name: "Remove Duplicates", desc: "Eliminate duplicate records across all or selected columns", modal: "duplicates", category: "rows" },
    { icon: SortAsc, name: "Sort Rows", desc: "Sort rows by single or multiple columns", modal: "sort-rows", category: "rows" },
    { icon: Eye, name: "Detect Outliers", desc: "Find and handle statistical anomalies using IQR or Z-Score", modal: "detect-outliers", category: "rows" },
    { icon: Edit3, name: "Rename Columns", desc: "Change the headers of your dataset", modal: "rename", category: "columns" },
    { icon: Type, name: "Change Data Type", desc: "Convert column types (text, integer, date...)", modal: "change-type", category: "columns" },
    { icon: Scissors, name: "Split Column", desc: "Split one column into multiple by a delimiter or width", modal: "split-column", category: "columns" },
    { icon: Merge, name: "Merge Columns", desc: "Combine multiple columns into one with custom separator", modal: "merge-columns", category: "columns" },
    { icon: Trash2, name: "Remove Columns", desc: "Delete one or more columns permanently", modal: "remove-columns", category: "columns" },
    { icon: MinusSquare, name: "Remove Null Values", desc: "Drop rows or columns containing missing values", modal: "remove-nulls", category: "clean" },
    { icon: Sparkles, name: "Fill Missing Values", desc: "Impute null cells with mean, median, mode, or custom", modal: "fill-missing", category: "clean" },
    { icon: ArrowRightLeft, name: "Find & Replace", desc: "Replace specific values with match-case support", modal: "find-replace", category: "clean" },
    { icon: AlignLeft, name: "Trim & Standardize Text", desc: "Clean leading/trailing spaces and standardize casing", modal: "trim-case", category: "clean" },
    { icon: Calendar, name: "Convert Date Formats", desc: "Normalize date strings and Excel serial date numbers", modal: "convert-dates", category: "clean" },
    { icon: MinusSquare, name: "Remove Empty Rows & Cols", desc: "Purge 100% blank rows and 100% blank columns", modal: "remove-empty", category: "clean" },
    { icon: Zap, name: "AI Auto Clean", desc: "AI-powered data audit and recipe recommendations", modal: "auto-clean", category: "ai" },
  ];

  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchCat = opCategory === "all" || op.category === opCategory;
      const q = opSearch.trim().toLowerCase();
      const matchSearch = !q || op.name.toLowerCase().includes(q) || op.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [operations, opCategory, opSearch]);

  /* ─────────────────────────────────────────────────────────────
     TABLE PREVIEW STATE & PAGINATION
  ───────────────────────────────────────────────────────────── */
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilterMode, setTableFilterMode] = useState<"all" | "nulls" | "duplicates" | "outliers">("all");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState<number>(25);

  useEffect(() => {
    setTablePage(1);
  }, [tableFilterMode, tableSearch, workingRows.length]);

  const filteredRowIndices = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    const indices: number[] = [];

    for (let idx = 0; idx < workingRows.length; idx++) {
      if (tableFilterMode === "nulls" && !quality.rowsWithMissingIndices.has(idx)) {
        continue;
      }
      if (tableFilterMode === "duplicates" && !quality.duplicateReport.allGroupRowIndices.has(idx)) {
        continue;
      }
      if (tableFilterMode === "outliers" && !outlierRows.includes(idx)) {
        continue;
      }
      if (q) {
        const row = workingRows[idx];
        const match = workingHeaders.some((h) => String(row[h] ?? "").toLowerCase().includes(q));
        if (!match) continue;
      }
      indices.push(idx);
    }
    return indices;
  }, [workingRows, workingHeaders, tableFilterMode, tableSearch, quality, outlierRows]);

  const totalFilteredCount = filteredRowIndices.length;
  const effectivePageSize = tablePageSize === -1 ? totalFilteredCount : tablePageSize;
  const totalPages = effectivePageSize > 0 ? Math.max(1, Math.ceil(totalFilteredCount / effectivePageSize)) : 1;
  const safePage = Math.min(tablePage, totalPages);

  const paginatedRowIndices = useMemo(() => {
    if (tablePageSize === -1) return filteredRowIndices;
    const start = (safePage - 1) * tablePageSize;
    return filteredRowIndices.slice(start, start + tablePageSize);
  }, [filteredRowIndices, safePage, tablePageSize]);

  /* ─────────────────────────────────────────────────────────────
     EXPORT UTILITIES
  ───────────────────────────────────────────────────────────── */
  const handleExportData = (format: "csv" | "xlsx" | "json") => {
    const baseName = (dataset.name || "Cleaned_Dataset").replace(/\.[^/.]+$/, "");
    if (format === "csv") {
      let csvContent = workingHeaders.join(",") + "\n";
      workingRows.forEach((r) => {
        csvContent +=
          workingHeaders
            .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
            .join(",") + "\n";
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_Cleaned.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(workingRows, { header: workingHeaders });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "CleanedData");
      XLSX.writeFile(wb, `${baseName}_Cleaned.xlsx`);
    } else if (format === "json") {
      const jsonStr = JSON.stringify(workingRows, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName}_Cleaned.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
    setToastMsg(`Dataset exported as ${format.toUpperCase()} successfully!`);
    closeModal();
  };

  /* ─────────────────────────────────────────────────────────────
     MODAL IMPLEMENTATIONS
  ───────────────────────────────────────────────────────────── */

  /* 1. Remove Duplicates Modal */
  const RemoveDuplicatesModal = () => {
    const [scope, setScope] = useState<"all" | "selected">("all");
    const [selectedCols, setSelectedCols] = useState<string[]>(workingHeaders);
    const [policy, setPolicy] = useState<"first" | "last" | "all">("first");

    const activeCols = scope === "all" ? workingHeaders : selectedCols;
    const dupeAudit = useMemo(() => {
      return auditDuplicates(workingHeaders, workingRows, activeCols, policy);
    }, [activeCols, policy]);

    const toggleCol = (col: string) => {
      setSelectedCols((prev) =>
        prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
      );
    };

    const apply = () => {
      const res = executeRemoveDuplicates(workingHeaders, workingRows, activeCols, policy);
      recordStep(
        "Remove Duplicates",
        "remove-duplicates",
        `Purged ${res.removedCount} duplicate row(s) [Policy: ${policy}, Scope: ${scope}]`,
        { selectedCols: activeCols, policy },
        res.removedCount,
        0,
        workingHeaders,
        workingRows,
        workingHeaders,
        res.newRows
      );
    };

    return (
      <Modal
        title="Remove Duplicate Records"
        subtitle="Detect and eliminate duplicate records across all or selected columns"
        icon={Trash2}
        onClose={closeModal}
      >
        <p className="text-xs text-textSecondary leading-relaxed">
          Select comparison scope and retention policy. Original row order will be strictly preserved.
        </p>

        {/* Scope Selector */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Comparison Scope
          </p>
          <div className="flex gap-2">
            <Chip label="Entire Row (All Columns)" active={scope === "all"} onClick={() => setScope("all")} />
            <Chip label="Selected Columns Subset" active={scope === "selected"} onClick={() => setScope("selected")} />
          </div>
        </div>

        {scope === "selected" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
                Select Key Columns ({selectedCols.length} of {workingHeaders.length})
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCols(workingHeaders)}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCols([])}
                  className="text-[11px] font-bold text-textSecondary hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 border border-border/40 rounded-xl bg-surface/50">
              {workingHeaders.map((col) => (
                <Chip key={col} label={col} active={selectedCols.includes(col)} onClick={() => toggleCol(col)} />
              ))}
            </div>
          </div>
        )}

        {/* Retention Policy */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Retention Strategy
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip label="Keep First Occurrence" active={policy === "first"} onClick={() => setPolicy("first")} />
            <Chip label="Keep Last Occurrence" active={policy === "last"} onClick={() => setPolicy("last")} />
            <Chip label="Remove All In Group" active={policy === "all"} onClick={() => setPolicy("all")} />
          </div>
        </div>

        {/* Real-time Audit Information */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-surface/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary">Duplicate Groups Detected:</span>
            <span className="text-xs font-bold text-textPrimary">{dupeAudit.duplicateGroupsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary">Total Rows in Duplicate Groups:</span>
            <span className="text-xs font-bold text-textPrimary">{dupeAudit.rowsInDuplicateGroups}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-xs font-bold text-textPrimary">Excess Rows to be Removed:</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {dupeAudit.excessDuplicatesCount} row(s)
            </span>
          </div>
        </div>

        <ActionRow
          onApply={apply}
          onClose={closeModal}
          applyLabel={`Purge ${dupeAudit.excessDuplicatesCount} Duplicate(s)`}
          disabled={dupeAudit.excessDuplicatesCount === 0 || (scope === "selected" && selectedCols.length === 0)}
        />
      </Modal>
    );
  };

  /* 2. Remove Null Values Modal */
  const RemoveNullsModal = () => {
    const [mode, setMode] = useState<"rows-any" | "rows-all" | "threshold" | "cols">("rows-any");
    const [selectedCols, setSelectedCols] = useState<string[]>(workingHeaders);
    const [thresholdPercent, setThresholdPercent] = useState<number>(50);

    const toggleCol = (col: string) => {
      setSelectedCols((prev) =>
        prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
      );
    };

    const preview = useMemo(() => {
      return executeRemoveMissing(workingHeaders, workingRows, {
        mode,
        selectedCols,
        thresholdPercent,
      });
    }, [mode, selectedCols, thresholdPercent]);

    const apply = () => {
      recordStep(
        mode === "cols" ? "Remove Null Columns" : "Remove Null Rows",
        "remove-nulls",
        mode === "cols"
          ? `Removed ${preview.affectedCols} column(s) containing nulls`
          : `Removed ${preview.affectedRows} row(s) with missing values [Mode: ${mode}]`,
        { mode, selectedCols, thresholdPercent },
        preview.affectedRows,
        0,
        workingHeaders,
        workingRows,
        preview.newHeaders,
        preview.newRows
      );
    };

    return (
      <Modal
        title="Remove Missing Values"
        subtitle="Clean incomplete records or empty columns based on configurable rules"
        icon={MinusSquare}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-1">
            Removal Strategy
          </p>
          {[
            { v: "rows-any" as const, l: "Remove rows with ANY missing value in selected columns" },
            { v: "rows-all" as const, l: "Remove rows where ALL selected columns are missing" },
            { v: "threshold" as const, l: `Remove rows where missing values exceed threshold (e.g. > ${thresholdPercent}%)` },
            { v: "cols" as const, l: "Remove entire COLUMNS containing missing values" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setMode(o.v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                mode === o.v
                  ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                  : "border-border/80 text-textSecondary hover:border-primary/40 hover:text-textPrimary bg-surface"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  mode === o.v ? "border-primary bg-primary text-white" : "border-textMuted"
                }`}
              >
                {mode === o.v && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              {o.l}
            </button>
          ))}
        </div>

        {mode === "threshold" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
              Missing Threshold Percentage: {thresholdPercent}%
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={thresholdPercent}
              onChange={(e) => setThresholdPercent(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
              Target Columns ({selectedCols.length} of {workingHeaders.length})
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCols(workingHeaders)}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedCols([])}
                className="text-[11px] font-bold text-textSecondary hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-border/40 rounded-xl bg-surface/50">
            {workingHeaders.map((col) => (
              <Chip key={col} label={col} active={selectedCols.includes(col)} onClick={() => toggleCol(col)} />
            ))}
          </div>
        </div>

        <InfoBadge
          text={
            mode === "cols"
              ? `${preview.affectedCols} column(s) will be deleted.`
              : `${preview.affectedRows} row(s) out of ${workingRows.length} will be removed (${workingRows.length - preview.affectedRows} remaining).`
          }
          color={preview.affectedRows > 0 || preview.affectedCols > 0 ? "warning" : "success"}
        />

        <ActionRow
          onApply={apply}
          onClose={closeModal}
          applyLabel={mode === "cols" ? `Delete ${preview.affectedCols} Column(s)` : `Remove ${preview.affectedRows} Row(s)`}
          disabled={preview.affectedRows === 0 && preview.affectedCols === 0}
        />
      </Modal>
    );
  };

  /* 3. Fill Missing Values Modal */
  const FillMissingModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [method, setMethod] = useState<"mean" | "median" | "mode" | "custom" | "ffill" | "bfill" | "group">("median");
    const [custom, setCustom] = useState("");
    const [groupCol, setGroupCol] = useState(workingHeaders[1] || workingHeaders[0]);
    const [groupMethod, setGroupMethod] = useState<"mean" | "median" | "mode">("median");

    const colQuality = useMemo(() => {
      return quality.columnReports.find((c) => c.column === col) || quality.columnReports[0];
    }, [col]);

    const isNumeric = colQuality?.dataType === "Integer" || colQuality?.dataType === "Decimal";

    const preview = useMemo(() => {
      return executeFillMissing(workingHeaders, workingRows, {
        column: col,
        method,
        customValue: custom,
        groupColumn: groupCol,
        groupMethod,
      });
    }, [col, method, custom, groupCol, groupMethod]);

    const apply = () => {
      recordStep(
        "Fill Missing Values",
        "fill-missing",
        `Filled ${preview.affectedCells} missing cell(s) in "${col}" using ${preview.filledValueSummary}`,
        { column: col, method, customValue: custom, groupColumn: groupCol, groupMethod },
        0,
        preview.affectedCells,
        workingHeaders,
        workingRows,
        workingHeaders,
        preview.newRows
      );
      setHighlightedCells(preview.highlightedCells);
    };

    return (
      <Modal
        title="Fill Missing Values"
        subtitle="Impute missing cells with statistical measures, text labels, or group metrics"
        icon={Sparkles}
        onClose={closeModal}
      >
        <SelectInput
          label="Target Column"
          value={col}
          onChange={setCol}
          options={workingHeaders.map((h) => ({
            value: h,
            label: `${h} (${quality.columnReports.find((c) => c.column === h)?.dataType || "Text"} · ${quality.columnReports.find((c) => c.column === h)?.missingCount || 0} nulls)`,
          }))}
        />

        {/* Method Selection */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Imputation Strategy
          </p>
          <div className="flex flex-wrap gap-2">
            {isNumeric && (
              <>
                <Chip label="Median" active={method === "median"} onClick={() => setMethod("median")} />
                <Chip label="Mean" active={method === "mean"} onClick={() => setMethod("mean")} />
              </>
            )}
            <Chip label="Mode (Most Frequent)" active={method === "mode"} onClick={() => setMethod("mode")} />
            <Chip label="Forward Fill (Carry Down)" active={method === "ffill"} onClick={() => setMethod("ffill")} />
            <Chip label="Backward Fill (Carry Up)" active={method === "bfill"} onClick={() => setMethod("bfill")} />
            <Chip label="Group Imputation" active={method === "group"} onClick={() => setMethod("group")} />
            <Chip label="Custom Value" active={method === "custom"} onClick={() => setMethod("custom")} />
          </div>
        </div>

        {method === "custom" && (
          <TextInput
            label="Custom Imputation Value"
            value={custom}
            onChange={setCustom}
            placeholder={isNumeric ? "e.g. 0 or -1" : "e.g. Unspecified or N/A"}
          />
        )}

        {method === "group" && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border/80 bg-surface/60">
            <SelectInput
              label="Grouping Column"
              value={groupCol}
              onChange={setGroupCol}
              options={workingHeaders.filter((h) => h !== col).map((h) => ({ value: h, label: h }))}
            />
            <SelectInput
              label="Group Strategy"
              value={groupMethod}
              onChange={(v: any) => setGroupMethod(v)}
              options={
                isNumeric
                  ? [
                      { value: "median", label: "Median per group" },
                      { value: "mean", label: "Mean per group" },
                      { value: "mode", label: "Mode per group" },
                    ]
                  : [{ value: "mode", label: "Mode per group" }]
              }
            />
          </div>
        )}

        <InfoBadge
          text={
            colQuality?.missingCount === 0
              ? `Column "${col}" has 0 missing cells. No imputation necessary.`
              : `Will impute ${preview.affectedCells} missing cell(s) in "${col}" using: ${preview.filledValueSummary}`
          }
          color={preview.affectedCells > 0 ? "primary" : "success"}
        />

        <ActionRow
          onApply={apply}
          onClose={closeModal}
          applyLabel={`Impute ${preview.affectedCells} Cell(s)`}
          disabled={preview.affectedCells === 0}
        />
      </Modal>
    );
  };

  /* 4. Filter Rows Modal */
  const FilterRowsModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [operator, setOperator] = useState<any>("equals");
    const [val, setVal] = useState("");
    const [val2, setVal2] = useState("");
    const [action, setAction] = useState<"keep" | "remove">("keep");

    const preview = useMemo(() => {
      return executeFilterRows(workingHeaders, workingRows, {
        column: col,
        operator,
        value: val,
        value2: val2,
        action,
      });
    }, [col, operator, val, val2, action]);

    const apply = () => {
      recordStep(
        "Filter Rows",
        "filter",
        `${action === "keep" ? "Kept" : "Removed"} ${preview.affectedRows} row(s) where "${col}" ${operator} "${val}"`,
        { column: col, operator, value: val, value2: val2, action },
        preview.affectedRows,
        0,
        workingHeaders,
        workingRows,
        workingHeaders,
        preview.newRows
      );
    };

    return (
      <Modal
        title="Filter Rows"
        subtitle="Keep or remove records based on configurable condition criteria"
        icon={Filter}
        onClose={closeModal}
      >
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="Filter Column"
            value={col}
            onChange={setCol}
            options={workingHeaders.map((h) => ({ value: h, label: h }))}
          />
          <SelectInput
            label="Condition Operator"
            value={operator}
            onChange={setOperator}
            options={[
              { value: "equals", label: "Equals (=)" },
              { value: "not_equals", label: "Does Not Equal (!=)" },
              { value: "contains", label: "Contains Text" },
              { value: "not_contains", label: "Does Not Contain" },
              { value: "starts_with", label: "Starts With" },
              { value: "ends_with", label: "Ends With" },
              { value: "greater_than", label: "Greater Than (>)" },
              { value: "less_than", label: "Less Than (<)" },
              { value: "greater_or_equal", label: "Greater or Equal (>=)" },
              { value: "less_or_equal", label: "Less or Equal (<=)" },
              { value: "between", label: "Between (Range)" },
              { value: "is_null", label: "Is Missing / Null" },
              { value: "is_not_null", label: "Is Populated (Not Null)" },
            ]}
          />
        </div>

        {operator !== "is_null" && operator !== "is_not_null" && (
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label={operator === "between" ? "Minimum Value" : "Target Match Value"}
              value={val}
              onChange={setVal}
              placeholder="Enter value..."
            />
            {operator === "between" && (
              <TextInput label="Maximum Value" value={val2} onChange={setVal2} placeholder="Max value..." />
            )}
          </div>
        )}

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Filter Action
          </p>
          <div className="flex gap-2.5">
            <Chip label="Keep Matching Rows" active={action === "keep"} onClick={() => setAction("keep")} />
            <Chip label="Remove Matching Rows" active={action === "remove"} onClick={() => setAction("remove")} />
          </div>
        </div>

        <InfoBadge
          text={`Will ${action} ${preview.newRows.length} row(s) (${preview.affectedRows} row(s) removed).`}
          color={preview.newRows.length > 0 ? "success" : "warning"}
        />

        <ActionRow
          onApply={apply}
          onClose={closeModal}
          applyLabel={`Apply Filter (${preview.newRows.length} Rows Retained)`}
          disabled={operator !== "is_null" && operator !== "is_not_null" && !val}
        />
      </Modal>
    );
  };

  /* 5. Sort Rows Modal */
  const SortRowsModal = () => {
    const [sorts, setSorts] = useState<Array<{ column: string; direction: "asc" | "desc" }>>([
      { column: workingHeaders[0] || "", direction: "asc" },
    ]);

    const addLevel = () => {
      setSorts((prev) => [...prev, { column: workingHeaders[0] || "", direction: "asc" }]);
    };

    const removeLevel = (idx: number) => {
      setSorts((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateLevel = (idx: number, field: "column" | "direction", val: any) => {
      setSorts((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
    };

    const apply = () => {
      const sorted = executeSortRows(workingHeaders, workingRows, sorts);
      recordStep(
        "Sort Rows",
        "sort",
        `Sorted by: ${sorts.map((s) => `${s.column} (${s.direction.toUpperCase()})`).join(", ")}`,
        { sortLevels: sorts },
        workingRows.length,
        0,
        workingHeaders,
        workingRows,
        workingHeaders,
        sorted
      );
    };

    return (
      <Modal
        title="Sort Rows"
        subtitle="Re-order records by single or multi-column criteria with natural sorting"
        icon={SortAsc}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-3">
          {sorts.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2.5 bg-primary-soft/20 p-2.5 rounded-xl border border-border/60">
              <span className="text-[10px] font-bold text-textMuted w-4">{idx + 1}.</span>
              <div className="flex-1 relative">
                <select
                  value={s.column}
                  onChange={(e) => updateLevel(idx, "column", e.target.value)}
                  className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold appearance-none cursor-pointer pr-7"
                >
                  {workingHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={s.direction}
                  onChange={(e) => updateLevel(idx, "direction", e.target.value)}
                  className="border border-border/80 bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold appearance-none cursor-pointer pr-7"
                >
                  <option value="asc">Ascending (A-Z, 0-9)</option>
                  <option value="desc">Descending (Z-A, 9-0)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => removeLevel(idx)}
                  className="p-1.5 text-textMuted hover:text-rose-500 rounded-lg cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLevel}
          className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" /> Add Sort Level
        </button>

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Execute Sort" />
      </Modal>
    );
  };

  /* 6. Detect Outliers Modal */
  const DetectOutliersModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [method, setMethod] = useState<"iqr" | "zscore">("iqr");
    const [action, setAction] = useState<"remove" | "keep" | "replace-mean" | "replace-median">("remove");

    const preview = useMemo(() => {
      return executeDetectOutliers(workingHeaders, workingRows, {
        column: col,
        method,
        action,
      });
    }, [col, method, action]);

    const apply = () => {
      recordStep(
        "Detect Outliers",
        "outliers",
        `${action} ${preview.outlierIndices.length} outlier(s) in "${col}" (${method.toUpperCase()})`,
        { column: col, method, action },
        preview.affectedRows,
        0,
        workingHeaders,
        workingRows,
        workingHeaders,
        preview.newRows
      );
      if (action === "keep") {
        setOutlierRows(preview.outlierIndices);
      } else {
        setOutlierRows([]);
      }
      setHighlightedCells(preview.highlightedCells);
    };

    return (
      <Modal
        title="Detect Outliers"
        subtitle="Identify statistical anomalies via IQR or Z-score algorithms"
        icon={Eye}
        onClose={closeModal}
      >
        <SelectInput
          label="Target Column"
          value={col}
          onChange={setCol}
          options={workingHeaders.map((h) => ({ value: h, label: h }))}
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Statistical Method
          </p>
          <div className="flex gap-2.5">
            <Chip label="Interquartile Range (IQR)" active={method === "iqr"} onClick={() => setMethod("iqr")} />
            <Chip label="Z-Score Standard Deviation" active={method === "zscore"} onClick={() => setMethod("zscore")} />
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Action Strategy
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip label="Remove Outlier Rows" active={action === "remove"} onClick={() => setAction("remove")} />
            <Chip label="Highlight Only" active={action === "keep"} onClick={() => setAction("keep")} />
            <Chip label="Replace with Mean" active={action === "replace-mean"} onClick={() => setAction("replace-mean")} />
            <Chip label="Replace with Median" active={action === "replace-median"} onClick={() => setAction("replace-median")} />
          </div>
        </div>

        <InfoBadge
          text={`${preview.outlierIndices.length} statistical anomaly outlier(s) detected in "${col}" (${method.toUpperCase()}).`}
          color={preview.outlierIndices.length > 0 ? "warning" : "success"}
        />

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Apply Outlier Strategy" />
      </Modal>
    );
  };

  /* 7. Rename Column Modal */
  const RenameModal = () => {
    const [oldName, setOldName] = useState(workingHeaders[0] || "");
    const [newName, setNewName] = useState("");

    const isDupe = newName.trim() !== "" && workingHeaders.includes(newName.trim()) && newName.trim() !== oldName;

    const apply = () => {
      const res = executeRenameColumn(workingHeaders, workingRows, oldName, newName);
      recordStep(
        "Rename Column",
        "rename",
        `Renamed "${oldName}" to "${newName.trim()}"`,
        { oldName, newName: newName.trim() },
        0,
        0,
        workingHeaders,
        workingRows,
        res.newHeaders,
        res.newRows
      );
    };

    return (
      <Modal title="Rename Column" subtitle="Modify column header identifier safely" icon={Edit3} onClose={closeModal}>
        <SelectInput
          label="Select Existing Column"
          value={oldName}
          onChange={setOldName}
          options={workingHeaders.map((h) => ({ value: h, label: h }))}
        />
        <TextInput label="New Header Name" value={newName} onChange={setNewName} placeholder="e.g. Total_Revenue" />
        {isDupe && <InfoBadge text={`Header name "${newName}" already exists in dataset.`} color="danger" />}
        <ActionRow
          onApply={apply}
          onClose={closeModal}
          applyLabel="Update Header"
          disabled={!newName.trim() || isDupe}
        />
      </Modal>
    );
  };

  /* 8. Change Data Type Modal */
  const ChangeTypeModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [targetType, setTargetType] = useState<any>("Text");
    const [onError, setOnError] = useState<"null" | "preserve">("null");

    const types = ["Text", "Integer", "Decimal", "Boolean", "Date", "DateTime", "Currency", "Percentage"];

    const preview = useMemo(() => {
      return executeChangeDataType(workingHeaders, workingRows, {
        column: col,
        targetType,
        onError,
      });
    }, [col, targetType, onError]);

    const apply = () => {
      recordStep(
        "Change Data Type",
        "change-type",
        `Cast "${col}" to ${targetType} (${preview.affectedCount} values formatted)`,
        { column: col, targetType, onError },
        0,
        preview.affectedCount,
        workingHeaders,
        workingRows,
        workingHeaders,
        preview.newRows
      );
      setHighlightedCells(preview.highlightedCells);
    };

    return (
      <Modal title="Change Data Type" subtitle="Cast column elements to target format with error safety" icon={Type} onClose={closeModal}>
        <SelectInput
          label="Target Column"
          value={col}
          onChange={setCol}
          options={workingHeaders.map((h) => ({ value: h, label: h }))}
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Target Data Type
          </p>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Chip key={t} label={t} active={targetType === t} onClick={() => setTargetType(t)} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            On Unparseable Value Error
          </p>
          <div className="flex gap-2.5">
            <Chip label="Coerce to Null / Blank" active={onError === "null"} onClick={() => setOnError("null")} />
            <Chip label="Preserve Original Raw Value" active={onError === "preserve"} onClick={() => setOnError("preserve")} />
          </div>
        </div>

        <InfoBadge
          text={`Ready to cast ${workingRows.length} values to ${targetType}.`}
          color="success"
        />

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Cast Data Type" />
      </Modal>
    );
  };

  /* 9. Split Column Modal */
  const SplitColumnModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [splitBy, setSplitBy] = useState<any>("comma");
    const [custom, setCustom] = useState("");
    const [fixedLen, setFixedLen] = useState(5);
    const [keepOrig, setKeepOrig] = useState(false);

    const apply = () => {
      const res = executeSplitColumn(workingHeaders, workingRows, {
        column: col,
        splitBy,
        customDelimiter: custom,
        fixedLen,
        keepOriginal: keepOrig,
      });

      recordStep(
        "Split Column",
        "split",
        `Split "${col}" into multiple fields [Delim: ${splitBy}]`,
        { column: col, splitBy, customDelimiter: custom, fixedLen, keepOriginal: keepOrig },
        0,
        0,
        workingHeaders,
        workingRows,
        res.newHeaders,
        res.newRows
      );
    };

    return (
      <Modal title="Split Column" subtitle="Divide text column into multiple distinct fields" icon={Scissors} onClose={closeModal}>
        <SelectInput
          label="Column to Split"
          value={col}
          onChange={setCol}
          options={workingHeaders.map((h) => ({ value: h, label: h }))}
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Split Criterion
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "comma", l: "Comma (,)" },
              { id: "space", l: "Space ( )" },
              { id: "dash", l: "Dash (-)" },
              { id: "custom", l: "Custom Delimiter" },
              { id: "fixed", l: "Fixed Length" },
            ].map((m) => (
              <Chip key={m.id} label={m.l} active={splitBy === m.id} onClick={() => setSplitBy(m.id)} />
            ))}
          </div>
        </div>

        {splitBy === "custom" && (
          <TextInput label="Custom Delimiter Character" value={custom} onChange={setCustom} placeholder="e.g. | or :" />
        )}

        {splitBy === "fixed" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
              Characters per Split: {fixedLen}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={fixedLen}
              onChange={(e) => setFixedLen(Number(e.target.value))}
              className="accent-primary cursor-pointer"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setKeepOrig(!keepOrig)}
          className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary cursor-pointer hover:text-textPrimary"
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
              keepOrig ? "bg-primary border-primary text-white" : "border-border bg-surface"
            }`}
          >
            {keepOrig && <Check className="w-3 h-3" />}
          </div>
          Keep original column after splitting
        </button>

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Split Column" />
      </Modal>
    );
  };

  /* 10. Merge Columns Modal */
  const MergeColumnsModal = () => {
    const [selected, setSelected] = useState<string[]>(workingHeaders.slice(0, 2));
    const [sep, setSep] = useState(" ");
    const [newName, setNewName] = useState("merged_field");
    const [purgeOrig, setPurgeOrig] = useState(true);

    const toggle = (colName: string) => {
      setSelected((prev) =>
        prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
      );
    };

    const apply = () => {
      const res = executeMergeColumns(workingHeaders, workingRows, {
        columns: selected,
        separator: sep,
        outputName: newName,
        purgeOriginal: purgeOrig,
      });

      recordStep(
        "Merge Columns",
        "merge",
        `Merged [${selected.join(" + ")}] into "${newName}"`,
        { columns: selected, separator: sep, outputName: newName, purgeOriginal: purgeOrig },
        0,
        0,
        workingHeaders,
        workingRows,
        res.newHeaders,
        res.newRows
      );
    };

    return (
      <Modal title="Merge Columns" subtitle="Combine multiple fields into a single unified column" icon={Merge} onClose={closeModal}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Select Columns to Merge (Minimum 2)
          </p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-border/40 rounded-xl bg-surface/50">
            {workingHeaders.map((colName) => (
              <Chip key={colName} label={colName} active={selected.includes(colName)} onClick={() => toggle(colName)} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Separator Character
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: " ", l: "Space" },
              { id: ", ", l: "Comma & Space" },
              { id: "-", l: "Dash (-)" },
              { id: "_", l: "Underscore (_)" },
              { id: "/", l: "Slash (/)" },
              { id: "", l: "None" },
            ].map((s) => (
              <Chip key={s.id} label={s.l} active={sep === s.id} onClick={() => setSep(s.id)} />
            ))}
          </div>
        </div>

        <TextInput label="Output Column Name" value={newName} onChange={setNewName} placeholder="merged_column" />

        <button
          type="button"
          onClick={() => setPurgeOrig(!purgeOrig)}
          className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary cursor-pointer hover:text-textPrimary"
        >
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
              purgeOrig ? "bg-primary border-primary text-white" : "border-border bg-surface"
            }`}
          >
            {purgeOrig && <Check className="w-3 h-3" />}
          </div>
          Purge original columns post-merge
        </button>

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Merge Columns" disabled={selected.length < 2 || !newName.trim()} />
      </Modal>
    );
  };

  /* 11. Remove Columns Modal */
  const RemoveColumnsModal = () => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (colName: string) => {
      setSelected((prev) =>
        prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
      );
    };

    const apply = () => {
      const res = executeRemoveColumns(workingHeaders, workingRows, selected);
      recordStep(
        "Remove Columns",
        "remove-columns",
        `Removed ${selected.length} column(s): ${selected.join(", ")}`,
        { columnsToRemove: selected },
        0,
        0,
        workingHeaders,
        workingRows,
        res.newHeaders,
        res.newRows
      );
    };

    return (
      <Modal title="Remove Columns" subtitle="Permanently delete selected attributes from dataset" icon={Trash2} onClose={closeModal}>
        <p className="text-xs text-textSecondary leading-relaxed">
          Select columns to remove. All corresponding values will be permanently excluded from working records.
        </p>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
              Target Columns ({selected.length} selected)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(workingHeaders.slice(1))}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-[11px] font-bold text-textSecondary hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 border border-border/40 rounded-xl bg-surface/50">
            {workingHeaders.map((colName) => (
              <Chip key={colName} label={colName} active={selected.includes(colName)} onClick={() => toggle(colName)} />
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <InfoBadge text={`${selected.length} column(s) queued for permanent deletion.`} color="danger" />
        )}

        <ActionRow
          onApply={apply}
          onClose={closeModal}
          applyLabel={`Delete ${selected.length} Column(s)`}
          disabled={selected.length === 0 || selected.length >= workingHeaders.length}
        />
      </Modal>
    );
  };

  /* 12. Find & Replace Modal */
  const FindReplaceModal = () => {
    const [find, setFind] = useState("");
    const [replace, setReplace] = useState("");
    const [matchCase, setMatchCase] = useState(false);
    const [replaceAll, setReplaceAll] = useState(true);
    const [selCols, setSelCols] = useState<string[]>([]);

    const toggle = (c: string) => {
      setSelCols((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    };

    const preview = useMemo(() => {
      return executeFindAndReplace(workingHeaders, workingRows, {
        find,
        replace,
        columns: selCols,
        matchCase,
        replaceAll,
      });
    }, [find, replace, selCols, matchCase, replaceAll]);

    const apply = () => {
      recordStep(
        "Find and Replace",
        "find-replace",
        `Replaced "${find}" with "${replace}" (${preview.matchCount} match${preview.matchCount !== 1 ? "es" : ""})`,
        { find, replace, columns: selCols, matchCase, replaceAll },
        0,
        preview.matchCount,
        workingHeaders,
        workingRows,
        workingHeaders,
        preview.newRows
      );
      setHighlightedCells(preview.highlightedCells);
    };

    return (
      <Modal title="Find & Replace" subtitle="Locate specific values and substitute them" icon={ArrowRightLeft} onClose={closeModal}>
        <TextInput label="Find Query" value={find} onChange={setFind} placeholder="Search string..." />
        <TextInput label="Replacement Text" value={replace} onChange={setReplace} placeholder="Replace with..." />

        <div className="flex items-center gap-5 pt-1">
          <button
            type="button"
            onClick={() => setMatchCase(!matchCase)}
            className="flex items-center gap-2 text-xs font-semibold text-textSecondary cursor-pointer hover:text-textPrimary"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                matchCase ? "bg-primary border-primary text-white" : "border-border bg-surface"
              }`}
            >
              {matchCase && <Check className="w-3 h-3" />}
            </div>
            Match Case
          </button>
          <button
            type="button"
            onClick={() => setReplaceAll(!replaceAll)}
            className="flex items-center gap-2 text-xs font-semibold text-textSecondary cursor-pointer hover:text-textPrimary"
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                replaceAll ? "bg-primary border-primary text-white" : "border-border bg-surface"
              }`}
            >
              {replaceAll && <Check className="w-3 h-3" />}
            </div>
            Replace All Occurrences
          </button>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Target Columns (Leave blank for all)
          </p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-border/40 rounded-xl bg-surface/50">
            {workingHeaders.map((c) => (
              <Chip key={c} label={c} active={selCols.includes(c)} onClick={() => toggle(c)} />
            ))}
          </div>
        </div>

        {find && (
          <InfoBadge
            text={`${preview.matchCount} occurrence(s) identified for replacement.`}
            color={preview.matchCount > 0 ? "primary" : "success"}
          />
        )}

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Execute Replace" disabled={!find} />
      </Modal>
    );
  };

  /* 13. Trim & Case Standardization Modal */
  const TrimCaseModal = () => {
    const [trimMode, setTrimMode] = useState<any>("both");
    const [caseMode, setCaseMode] = useState<any>("none");
    const [selectedCols, setSelectedCols] = useState<string[]>(workingHeaders);

    const toggle = (colName: string) => {
      setSelectedCols((prev) =>
        prev.includes(colName) ? prev.filter((c) => c !== colName) : [...prev, colName]
      );
    };

    const apply = () => {
      const res = executeTrimAndCase(workingHeaders, workingRows, {
        columns: selectedCols,
        trimMode,
        caseMode,
      });

      recordStep(
        "Trim & Standardize Text",
        "trim-case",
        `Cleaned text fields in ${selectedCols.length} column(s) [Trim: ${trimMode}, Case: ${caseMode}]`,
        { columns: selectedCols, trimMode, caseMode },
        0,
        res.affectedCount,
        workingHeaders,
        workingRows,
        workingHeaders,
        res.newRows
      );
    };

    return (
      <Modal title="Trim & Standardize Text" subtitle="Clean whitespace and normalize text casing" icon={AlignLeft} onClose={closeModal}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Whitespace Cleaning
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "both", l: "Trim Leading & Trailing Spaces" },
              { id: "extra-spaces", l: "Collapse Extra Internal Spaces" },
              { id: "none", l: "No Whitespace Changes" },
            ].map((m) => (
              <Chip key={m.id} label={m.l} active={trimMode === m.id} onClick={() => setTrimMode(m.id)} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Text Casing Standardization
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "none", l: "Preserve Original Casing" },
              { id: "title", l: "Title Case (John Doe)" },
              { id: "upper", l: "UPPERCASE" },
              { id: "lower", l: "lowercase" },
              { id: "sentence", l: "Sentence case" },
            ].map((m) => (
              <Chip key={m.id} label={m.l} active={caseMode === m.id} onClick={() => setCaseMode(m.id)} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
              Target Columns ({selectedCols.length} of {workingHeaders.length})
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedCols(workingHeaders)}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setSelectedCols([])}
                className="text-[11px] font-bold text-textSecondary hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-border/40 rounded-xl bg-surface/50">
            {workingHeaders.map((c) => (
              <Chip key={c} label={c} active={selectedCols.includes(c)} onClick={() => toggle(c)} />
            ))}
          </div>
        </div>

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Standardize Text" disabled={selectedCols.length === 0} />
      </Modal>
    );
  };

  /* 14. Convert Date Formats Modal */
  const ConvertDatesModal = () => {
    const [col, setCol] = useState(
      workingHeaders.find((h) => quality.columnReports.find((c) => c.column === h)?.dataType === "Date") ||
        workingHeaders[0]
    );
    const [targetFormat, setTargetFormat] = useState<any>("YYYY-MM-DD");

    const apply = () => {
      const res = executeConvertDates(workingHeaders, workingRows, {
        column: col,
        targetFormat,
      });

      recordStep(
        "Convert Date Formats",
        "convert-dates",
        `Converted ${res.convertedCount} date value(s) in "${col}" to ${targetFormat}`,
        { column: col, targetFormat },
        0,
        res.convertedCount,
        workingHeaders,
        workingRows,
        workingHeaders,
        res.newRows
      );
    };

    return (
      <Modal title="Convert Date Formats" subtitle="Standardize dates and parse Excel serial dates" icon={Calendar} onClose={closeModal}>
        <SelectInput
          label="Target Date Column"
          value={col}
          onChange={setCol}
          options={workingHeaders.map((h) => ({ value: h, label: h }))}
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            Standard Output Format
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "YYYY-MM-DD", l: "YYYY-MM-DD (ISO 8601 Standard)" },
              { id: "DD/MM/YYYY", l: "DD/MM/YYYY (UK / International)" },
              { id: "MM/DD/YYYY", l: "MM/DD/YYYY (US Standard)" },
            ].map((f) => (
              <Chip key={f.id} label={f.l} active={targetFormat === f.id} onClick={() => setTargetFormat(f.id)} />
            ))}
          </div>
        </div>

        <InfoBadge
          text={`Will normalize raw dates and Excel serial values (e.g. 45123) in column "${col}".`}
          color="primary"
        />

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Format Dates" />
      </Modal>
    );
  };

  /* 15. Remove Empty Rows & Columns Modal */
  const RemoveEmptyModal = () => {
    const preview = useMemo(() => {
      return executeRemoveEmptyRowsAndCols(workingHeaders, workingRows);
    }, [workingHeaders, workingRows]);

    const apply = () => {
      recordStep(
        "Purge Empty Rows & Columns",
        "remove-empty",
        `Purged ${preview.removedRowsCount} empty row(s) and ${preview.removedColsCount} empty column(s)`,
        {},
        preview.removedRowsCount,
        0,
        workingHeaders,
        workingRows,
        preview.newHeaders,
        preview.newRows
      );
    };

    return (
      <Modal
        title="Remove Empty Rows & Columns"
        subtitle="Instantly purge rows and columns where 100% of cells are blank"
        icon={MinusSquare}
        onClose={closeModal}
      >
        <p className="text-xs text-textSecondary leading-relaxed">
          Scans dataset for entirely blank rows or columns and eliminates them from the active model.
        </p>

        <div className="p-3.5 rounded-xl border border-border/80 bg-surface/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary">100% Blank Rows Identified:</span>
            <span className="text-xs font-bold text-textPrimary">{preview.removedRowsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-textSecondary">100% Blank Columns Identified:</span>
            <span className="text-xs font-bold text-textPrimary">{preview.removedColsCount}</span>
          </div>
        </div>

        <InfoBadge
          text={
            preview.removedRowsCount === 0 && preview.removedColsCount === 0
              ? "Dataset contains no 100% blank rows or columns."
              : `${preview.removedRowsCount} empty row(s) and ${preview.removedColsCount} empty column(s) will be purged.`
          }
          color={preview.removedRowsCount > 0 || preview.removedColsCount > 0 ? "warning" : "success"}
        />

        <ActionRow
          onApply={apply}
          onClose={closeModal}
          applyLabel="Purge Empty Records"
          disabled={preview.removedRowsCount === 0 && preview.removedColsCount === 0}
        />
      </Modal>
    );
  };

  /* 16. AI Supercharged Auto Clean Modal */
  const AutoCleanModal = () => {
    const [selectedRecipes, setSelectedRecipes] = useState<string[]>(["dupes", "whitespace", "dates", "nulls"]);

    const recipes = useMemo(() => {
      const recs: { id: string; name: string; desc: string; impact: string }[] = [];

      if (quality.duplicateReport.excessDuplicatesCount > 0) {
        recs.push({
          id: "dupes",
          name: `Purge ${quality.duplicateReport.excessDuplicatesCount} Duplicate Rows`,
          desc: "Identical duplicate records identified across all columns.",
          impact: "High",
        });
      }

      recs.push({
        id: "whitespace",
        name: "Trim Whitespace & Collapse Extra Spaces",
        desc: "Strip leading/trailing space padding across all text columns.",
        impact: "Medium",
      });

      recs.push({
        id: "dates",
        name: "Format & Normalize Excel Serial Dates",
        desc: "Convert raw Excel serial date numbers to standard YYYY-MM-DD.",
        impact: "Medium",
      });

      if (quality.missingCells > 0) {
        recs.push({
          id: "nulls",
          name: `Impute ${quality.missingCells} Missing Values with Column Median / Mode`,
          desc: "Fill numeric nulls with median and text nulls with mode.",
          impact: "High",
        });
      }

      return recs;
    }, [quality]);

    const toggleRecipe = (id: string) => {
      setSelectedRecipes((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    };

    const apply = () => {
      let currentH = [...workingHeaders];
      let currentR = [...workingRows];
      let totalPurgedRows = 0;
      let totalImputedCells = 0;

      // 1. Purge Duplicates
      if (selectedRecipes.includes("dupes") && quality.duplicateReport.excessDuplicatesCount > 0) {
        const dupeRes = executeRemoveDuplicates(currentH, currentR, currentH, "first");
        currentR = dupeRes.newRows;
        totalPurgedRows += dupeRes.removedCount;
      }

      // 2. Trim Whitespace
      if (selectedRecipes.includes("whitespace")) {
        const trimRes = executeTrimAndCase(currentH, currentR, {
          columns: currentH,
          trimMode: "both",
          caseMode: "none",
        });
        currentR = trimRes.newRows;
      }

      // 3. Impute Nulls
      if (selectedRecipes.includes("nulls")) {
        currentH.forEach((col) => {
          const colQ = quality.columnReports.find((c) => c.column === col);
          if (colQ && colQ.missingCount > 0) {
            const isNum = colQ.dataType === "Integer" || colQ.dataType === "Decimal";
            const fillRes = executeFillMissing(currentH, currentR, {
              column: col,
              method: isNum ? "median" : "mode",
            });
            currentR = fillRes.newRows;
            totalImputedCells += fillRes.affectedCells;
          }
        });
      }

      recordStep(
        "AI Supercharged Auto Clean",
        "auto-clean",
        `Executed multi-recipe data cleaning (Purged ${totalPurgedRows} dupes, Imputed ${totalImputedCells} cells)`,
        { selectedRecipes },
        totalPurgedRows,
        totalImputedCells,
        workingHeaders,
        workingRows,
        currentH,
        currentR
      );
    };

    return (
      <Modal
        title="AI Supercharged Auto Clean"
        subtitle="Dynamic, schema-aware automated data cleaning recipes"
        icon={Zap}
        onClose={closeModal}
      >
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary/20 bg-primary-soft/30">
          <div>
            <p className="text-xs font-bold text-textPrimary">Current Quality Score</p>
            <p className="text-[11px] text-textSecondary">Calculated from missing &amp; duplicate distributions</p>
          </div>
          <span className="text-lg font-extrabold text-primary">{quality.healthScore} / 100</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary">
            Recommended Cleaning Recipes
          </p>
          {recipes.map((r) => {
            const active = selectedRecipes.includes(r.id);
            return (
              <div
                key={r.id}
                onClick={() => toggleRecipe(r.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  active ? "bg-primary-soft/40 border-primary/40 shadow-xs" : "bg-surface border-border/80 opacity-70"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                    active ? "bg-primary border-primary text-white" : "border-border bg-surface"
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-textPrimary">{r.name}</p>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                      {r.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary mt-0.5 leading-snug">{r.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <ActionRow onApply={apply} onClose={closeModal} applyLabel="Execute Selected Recipes" disabled={selectedRecipes.length === 0} />
      </Modal>
    );
  };

  /* 17. Column Health Inspector Modal */
  const InspectColumnsModal = () => {
    return (
      <Modal
        title="Column-Level Health Inspector"
        subtitle="Detailed structural quality, missing values distribution, and schema inference"
        icon={Columns3}
        onClose={closeModal}
        maxWidth="max-w-4xl"
      >
        <div className="overflow-x-auto max-h-[60vh] border border-border/80 rounded-xl">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-primary-soft/20 text-textSecondary sticky top-0 shadow-xs border-b border-border/80 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Column Name</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Inferred Type</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Missing Count</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Missing %</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Unique Values</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px]">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-surface">
              {quality.columnReports.map((colReport, idx) => (
                <tr key={idx} className="hover:bg-primary-soft/10 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-textPrimary">{colReport.column}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-soft text-primary border border-primary/20">
                      {colReport.dataType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-textPrimary">
                    {colReport.missingCount > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">{colReport.missingCount}</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full ${colReport.missingPercentage > 0 ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, colReport.missingPercentage)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold">{colReport.missingPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-textSecondary">{colReport.uniqueCount}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1 max-w-xs overflow-hidden">
                      {colReport.sampleValues.slice(0, 3).map((val, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded text-[10px] bg-surface border border-border truncate">
                          {String(val)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-3 border-t border-border/60">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-bold text-textSecondary bg-primary-soft/40 hover:bg-primary-soft/80 rounded-xl border border-border/60 cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </Modal>
    );
  };

  /* 18. Export Dataset Modal */
  const ExportModal = () => {
    return (
      <Modal
        title="Export Cleaned Dataset"
        subtitle="Download active model records matching your applied transformations"
        icon={Download}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-3">
          {[
            { id: "csv" as const, name: "Comma-Separated Values (.csv)", desc: "Standard text format for Excel, Python, and R" },
            { id: "xlsx" as const, name: "Microsoft Excel Workbook (.xlsx)", desc: "Structured spreadsheet workbook with headers" },
            { id: "json" as const, name: "JavaScript Object Notation (.json)", desc: "Web and API ready structured JSON data array" },
          ].map((fmt) => (
            <button
              key={fmt.id}
              type="button"
              onClick={() => handleExportData(fmt.id)}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-primary-soft/20 text-left transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-primary-soft text-primary group-hover:scale-105 transition-transform shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">{fmt.name}</p>
                <p className="text-[11px] text-textSecondary mt-0.5">{fmt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER RETURN
  ───────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-5 pb-8 h-full">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-primary/30 shadow-xl px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-textPrimary animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Clean &amp; Transform</h1>
          <p className="text-sm text-textSecondary mt-0.5">
            Professional dataset preparation and reproducible transformation pipeline.
          </p>
        </div>

        {isUploaded && (
          <div className="flex items-center gap-2.5">
            {/* Undo & Redo Controls */}
            <div className="flex items-center bg-surface border border-border/80 rounded-xl p-1 shadow-xs">
              <button
                type="button"
                onClick={handleUndo}
                disabled={appliedSteps.length === 0}
                title="Undo last transformation (Ctrl+Z)"
                className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={undoneSteps.length === 0}
                title="Redo previously undone transformation (Ctrl+Y)"
                className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDiscardConfirm(true)}
              className="px-3.5 py-2 bg-surface text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/40 transition-all border border-border/80 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-textMuted" />
              Reset Dataset
            </button>

            <button
              type="button"
              onClick={() => setModal("export")}
              className="px-3.5 py-2 bg-surface text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/40 transition-all border border-border/80 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              Export
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("steps")}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
            >
              <CheckCircle2 className="w-4 h-4" />
              Applied Steps ({appliedSteps.length})
            </button>
          </div>
        )}
      </div>

      {isUploaded ? (
        <>
          {/* Universal Data Quality Overview Banner */}
          <Card className="border border-border/80 shadow-xs bg-surface/70 backdrop-blur-xs">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 flex-1">
                {/* Total Rows */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Total Records</span>
                  <span className="text-base font-extrabold text-textPrimary mt-0.5">
                    {quality.totalRows.toLocaleString()}
                  </span>
                </div>

                {/* Total Columns */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Attributes</span>
                  <span className="text-base font-extrabold text-textPrimary mt-0.5">
                    {quality.totalColumns} cols
                  </span>
                </div>

                {/* Total Cells */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Total Data Points</span>
                  <span className="text-base font-extrabold text-textPrimary mt-0.5">
                    {quality.totalCells.toLocaleString()}
                  </span>
                </div>

                {/* Missing Cells */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Missing Data</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-base font-extrabold ${
                        quality.missingCells > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {quality.missingCells.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-textSecondary font-bold">({quality.missingPercentage}%)</span>
                  </div>
                </div>

                {/* Duplicate Records */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Excess Duplicates</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-base font-extrabold ${
                        quality.duplicateReport.excessDuplicatesCount > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {quality.duplicateReport.excessDuplicatesCount}
                    </span>
                    <span className="text-[10px] text-textSecondary font-bold">
                      ({quality.duplicateReport.duplicateGroupsCount} groups)
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Score & Inspect Shortcut */}
              <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border/60 md:pl-4 shrink-0">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted">Health Score</span>
                  <span className="text-base font-extrabold text-primary">{quality.healthScore} / 100</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModal("inspect-columns")}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border/80 bg-primary-soft/40 hover:bg-primary-soft/80 text-textPrimary transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Columns3 className="w-3.5 h-3.5 text-primary" />
                  Inspect Schema
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Main Layout: Left Panel (Operations/Steps) + Right Panel (Data Preview) */}
          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
            {/* Left Control Card */}
            <Card className="lg:w-80 h-fit flex-shrink-0 border border-border/80 shadow-sm">
              <CardHeader className="border-b border-border/60 pb-3 bg-surface/50">
                <div className="flex space-x-6">
                  <button
                    type="button"
                    className={`text-xs font-bold pb-2.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === "transform"
                        ? "border-primary text-primary font-extrabold"
                        : "border-transparent text-textSecondary hover:text-textPrimary"
                    }`}
                    onClick={() => setActiveTab("transform")}
                  >
                    Transform Operations
                  </button>
                  <button
                    type="button"
                    className={`text-xs font-bold pb-2.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === "steps"
                        ? "border-primary text-primary font-extrabold"
                        : "border-transparent text-textSecondary hover:text-textPrimary"
                    }`}
                    onClick={() => setActiveTab("steps")}
                  >
                    Applied Steps ({appliedSteps.length})
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-3.5 pb-4 px-3">
                {activeTab === "transform" ? (
                  <div className="flex flex-col gap-2">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1.5 border-b border-border/40 scrollbar-none">
                      {(["all", "rows", "columns", "clean", "ai"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setOpCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all shrink-0 cursor-pointer ${
                            opCategory === cat
                              ? "bg-primary text-white shadow-xs"
                              : "text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40"
                          }`}
                        >
                          {cat === "ai" ? "AI Clean" : cat}
                        </button>
                      ))}
                    </div>

                    {/* Search Field */}
                    <div className="relative my-1">
                      <Search className="w-3.5 h-3.5 text-textMuted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={opSearch}
                        onChange={(e) => setOpSearch(e.target.value)}
                        placeholder="Search operations..."
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-surface border border-border/80 rounded-xl text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                      />
                      {opSearch && (
                        <button
                          type="button"
                          onClick={() => setOpSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Operations List */}
                    <div className="flex flex-col gap-1 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
                      {filteredOperations.length === 0 ? (
                        <p className="text-xs text-textSecondary text-center py-6">No matching operations found.</p>
                      ) : (
                        filteredOperations.map((op, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setModal(op.modal)}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-primary-soft/40 transition-all text-left border border-transparent hover:border-border/80 cursor-pointer group"
                          >
                            <div className="mt-0.5 bg-primary-soft/70 p-2 rounded-xl text-primary group-hover:scale-110 transition-transform shrink-0 flex items-center justify-center">
                              <op.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors truncate">
                                  {op.name}
                                </p>
                                <span className="text-[9px] uppercase font-bold text-textMuted bg-primary-soft/30 px-1.5 py-0.5 rounded tracking-wider">
                                  {op.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-textSecondary mt-0.5 leading-snug line-clamp-1">{op.desc}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* Applied Steps Pipeline List */
                  <div className="flex flex-col gap-2.5 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                    {appliedSteps.length === 0 ? (
                      <div className="text-center py-8 px-4 flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-textMuted stroke-1" />
                        <p className="text-xs font-bold text-textPrimary">No Steps Applied Yet</p>
                        <p className="text-[11px] text-textSecondary leading-relaxed">
                          Operations executed from the Transform panel will appear here as a reproducible transformation pipeline.
                        </p>
                      </div>
                    ) : (
                      appliedSteps.map((step, idx) => (
                        <div
                          key={step.id}
                          className="flex items-start gap-2.5 p-3 bg-surface rounded-xl border border-border/80 shadow-xs hover:border-primary/30 transition-all group"
                        >
                          <div className="bg-primary-soft/70 p-2 rounded-xl text-primary shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-textPrimary truncate">{step.name}</p>
                              <span className="text-[9px] text-textMuted font-mono">{step.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-textSecondary truncate mt-0.5">{step.detail}</p>
                            {(step.affectedRows > 0 || step.affectedCells > 0) && (
                              <p className="text-[10px] text-primary font-bold mt-1">
                                {step.affectedRows > 0 && `${step.affectedRows} row(s) affected `}
                                {step.affectedCells > 0 && `${step.affectedCells} cell(s) affected`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              title="Remove step and recompute pipeline"
                              onClick={() => handleRemoveStep(step.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-textMuted hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Card: Full Data Preview Table */}
            <Card className="flex-1 flex flex-col min-w-0 border border-border/80 shadow-sm overflow-hidden">
              {/* Table Header */}
              <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary-soft text-primary ring-1 ring-primary/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-textPrimary flex items-center gap-2">
                      Data Preview — {dataset.name}
                    </CardTitle>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      Live dataset preview synchronized with current active model
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-primary bg-primary-soft/60 px-3 py-1 rounded-full border border-primary/25 font-bold shadow-xs">
                    {workingRows.length.toLocaleString()} rows · {workingHeaders.length} cols
                  </span>
                  {quality.missingCells > 0 ? (
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/25 font-bold flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3 h-3" />
                      {quality.missingCells} nulls ({quality.rowsWithMissingCount} rows)
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 font-bold flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      0 nulls
                    </span>
                  )}
                  {quality.duplicateReport.excessDuplicatesCount > 0 ? (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25 font-bold flex items-center gap-1 shadow-xs">
                      <Copy className="w-3 h-3" />
                      {quality.duplicateReport.excessDuplicatesCount} excess dupes
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 font-bold flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      0 duplicates
                    </span>
                  )}
                </div>
              </CardHeader>

              {/* Table Toolbar Bar */}
              <div className="px-4 py-2.5 border-b border-border/60 bg-surface/80 flex flex-wrap items-center justify-between gap-3">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-primary-soft/30 p-1 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => setTableFilterMode("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tableFilterMode === "all"
                        ? "bg-primary text-white shadow-xs"
                        : "text-textSecondary hover:text-textPrimary hover:bg-surface/60"
                    }`}
                  >
                    All Rows ({workingRows.length.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableFilterMode("nulls")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      tableFilterMode === "nulls"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    With Nulls ({quality.rowsWithMissingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableFilterMode("duplicates")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      tableFilterMode === "duplicates"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                    Duplicates ({quality.duplicateReport.allGroupRowIndices.size})
                  </button>
                  {outlierRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTableFilterMode("outliers")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        tableFilterMode === "outliers"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      Outliers ({outlierRows.length})
                    </button>
                  )}
                </div>

                {/* Search & Page Size */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-textMuted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="Search preview..."
                      className="pl-8 pr-7 py-1 text-xs bg-surface border border-border/80 rounded-lg text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-52"
                    />
                    {tableSearch && (
                      <button
                        type="button"
                        onClick={() => setTableSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-textSecondary font-semibold">
                    <span className="hidden sm:inline">Rows:</span>
                    <select
                      value={tablePageSize}
                      onChange={(e) => setTablePageSize(Number(e.target.value))}
                      className="bg-surface border border-border/80 text-textPrimary text-xs font-bold rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={-1}>All</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Data Container */}
              <CardContent className="p-0 flex-1 overflow-auto max-h-[580px]">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-primary-soft/25 text-textSecondary sticky top-0 shadow-xs border-b border-border/80 backdrop-blur-md z-10">
                    <tr>
                      <th className="px-3.5 py-3 font-bold uppercase tracking-wider text-[10px] w-14 text-center border-r border-border/40 select-none">
                        #
                      </th>
                      {workingHeaders.map((header, idx) => {
                        const colReport = quality.columnReports.find((c) => c.column === header);
                        const typeTag = colReport ? colReport.dataType.slice(0, 3).toUpperCase() : "TXT";
                        return (
                          <th key={idx} className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span>{header}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-surface border border-border/80 text-textMuted font-mono">
                                {typeTag}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-surface">
                    {paginatedRowIndices.length === 0 ? (
                      <tr>
                        <td colSpan={workingHeaders.length + 1} className="py-12 text-center text-textSecondary">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Database className="w-8 h-8 text-textMuted stroke-1" />
                            <p className="text-xs font-bold text-textPrimary">No matching records found</p>
                            <p className="text-[11px] text-textSecondary">
                              {tableFilterMode === "nulls"
                                ? "Great! No missing or null values found in dataset."
                                : tableFilterMode === "duplicates"
                                ? "No duplicate records found in dataset."
                                : "No records match your search filter."}
                            </p>
                            {(tableFilterMode !== "all" || tableSearch) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTableFilterMode("all");
                                  setTableSearch("");
                                }}
                                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                Reset filters to view all rows
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRowIndices.map((rowIdx) => {
                        const row = workingRows[rowIdx] || {};
                        const isDupe = quality.duplicateReport.allGroupRowIndices.has(rowIdx);
                        const isExcessDupe = quality.duplicateReport.excessRowIndices.has(rowIdx);
                        const isOutlier = outlierRows.includes(rowIdx);
                        const hasNull = quality.rowsWithMissingIndices.has(rowIdx);

                        return (
                          <tr
                            key={rowIdx}
                            className={`transition-colors ${
                              isOutlier
                                ? "bg-purple-500/10 hover:bg-purple-500/15"
                                : isDupe
                                ? "bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-l-amber-500"
                                : "hover:bg-primary-soft/15"
                            }`}
                          >
                            {/* Row Index Column */}
                            <td className="px-3 py-2.5 text-center text-textMuted font-mono text-[11px] border-r border-border/40 font-semibold select-none">
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{rowIdx + 1}</span>
                                {isDupe && (
                                  <span
                                    title={isExcessDupe ? "Excess duplicate copy" : "Original duplicate occurrence"}
                                    className={`px-1 py-0.2 rounded text-[8px] font-extrabold uppercase border ${
                                      isExcessDupe
                                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                        : "bg-primary-soft text-primary border-primary/20"
                                    }`}
                                  >
                                    DUP
                                  </span>
                                )}
                                {hasNull && !isDupe && (
                                  <span title="Row contains missing cell" className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                )}
                              </div>
                            </td>

                            {/* Data Cells */}
                            {workingHeaders.map((header, colIdx) => {
                              const val = row[header];
                              const isNull = isMissingValue(val);
                              const isHl = highlightedCells[`${rowIdx}-${header}`];

                              return (
                                <td
                                  key={colIdx}
                                  className={`px-4 py-2.5 font-medium transition-colors ${
                                    isNull
                                      ? "bg-rose-500/5 text-rose-500"
                                      : isHl
                                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold"
                                      : "text-textPrimary"
                                  }`}
                                >
                                  {isNull ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 select-none">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      NULL
                                    </span>
                                  ) : (
                                    <span>{String(val)}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </CardContent>

              {/* Table Pagination Footer */}
              <div className="px-4 py-2.5 border-t border-border/60 bg-surface/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-textSecondary font-medium text-[11px]">
                  Showing rows{" "}
                  <span className="font-bold text-textPrimary">
                    {totalFilteredCount === 0 ? 0 : (safePage - 1) * (tablePageSize === -1 ? totalFilteredCount : tablePageSize) + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-textPrimary">
                    {tablePageSize === -1 ? totalFilteredCount : Math.min(safePage * tablePageSize, totalFilteredCount)}
                  </span>{" "}
                  of <span className="font-bold text-textPrimary">{totalFilteredCount.toLocaleString()}</span> entries
                  {tableFilterMode !== "all" && (
                    <span className="ml-1 text-primary">
                      (filtered from {workingRows.length.toLocaleString()} total)
                    </span>
                  )}
                </span>

                {totalPages > 1 && tablePageSize !== -1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setTablePage(1)}
                      className="p-1.5 rounded-lg border border-border/80 text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="First Page"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-border/80 text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="px-3 py-1 font-bold text-textPrimary text-xs">
                      Page {safePage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-border/80 text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setTablePage(totalPages)}
                      className="p-1.5 rounded-lg border border-border/80 text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="Last Page"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        /* Empty State */
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-border bg-surface shadow-xs rounded-2xl">
          <Database className="w-16 h-16 text-textMuted stroke-[1.5] animate-pulse" />
          <h3 className="text-lg font-bold text-textPrimary">No Active Dataset Loaded</h3>
          <p className="text-sm text-textSecondary max-w-md">
            Upload a CSV, Excel, or JSON dataset on the Dashboard to perform data cleaning, filtering, and transformation operations.
          </p>
        </Card>
      )}

      {/* Render Active Modals */}
      {modal === "duplicates" && <RemoveDuplicatesModal />}
      {modal === "remove-nulls" && <RemoveNullsModal />}
      {modal === "fill-missing" && <FillMissingModal />}
      {modal === "filter" && <FilterRowsModal />}
      {modal === "sort-rows" && <SortRowsModal />}
      {modal === "detect-outliers" && <DetectOutliersModal />}
      {modal === "rename" && <RenameModal />}
      {modal === "change-type" && <ChangeTypeModal />}
      {modal === "split-column" && <SplitColumnModal />}
      {modal === "merge-columns" && <MergeColumnsModal />}
      {modal === "remove-columns" && <RemoveColumnsModal />}
      {modal === "find-replace" && <FindReplaceModal />}
      {modal === "trim-case" && <TrimCaseModal />}
      {modal === "convert-dates" && <ConvertDatesModal />}
      {modal === "remove-empty" && <RemoveEmptyModal />}
      {modal === "auto-clean" && <AutoCleanModal />}
      {modal === "inspect-columns" && <InspectColumnsModal />}
      {modal === "export" && <ExportModal />}

      {/* Discard Transformations Confirmation Modal */}
      {showDiscardConfirm && (
        <Modal
          title="Reset Dataset to Original Upload?"
          subtitle="Revert all transformations back to raw imported state"
          icon={AlertTriangle}
          onClose={() => setShowDiscardConfirm(false)}
        >
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold">Are you sure you want to revert?</p>
                <p className="mt-1 text-textSecondary">
                  All <span className="font-bold text-textPrimary">{appliedSteps.length}</span> applied transformation steps will be purged, and your dataset will be reset to the original <span className="font-bold text-textPrimary">{dataset.totalRows} records</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-textSecondary hover:text-textPrimary bg-primary-soft/40 hover:bg-primary-soft/80 rounded-xl border border-border/60 transition-all cursor-pointer"
              >
                Keep Current State
              </button>
              <button
                type="button"
                onClick={discardChanges}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Reset
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
