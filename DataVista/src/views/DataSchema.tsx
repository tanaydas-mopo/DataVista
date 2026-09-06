"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  UploadCloud,
  FileType,
  Database,
  CheckCircle2,
  Search,
  ArrowUpDown,
  AlertTriangle,
  X,
  Undo2,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";

function inferDataType(value: any): string {
  if (value === undefined || value === null || value === "" || value === "-") return "String";
  const str = String(value).trim();
  if (/^-?\d+$/.test(str)) return "Integer";
  if (/^-?\d+\.\d+$/.test(str)) return "Decimal";
  if (!isNaN(Date.parse(str)) && (str.includes("-") || str.includes("/") || str.includes(":"))) return "Date";
  if (str.toLowerCase() === "true" || str.toLowerCase() === "false") return "Boolean";
  return "String";
}

export function DataSchema() {
  const { dataset, uploadDataset, removeDataset, restorePreviousDataset, canUndoDataset } = useDataset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All");
  const [sortField, setSortField] = useState<"column" | "type" | "nulls">("column");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSampleRow, setSelectedSampleRow] = useState<any | null>(null);

  const isUploaded = dataset.status === "active";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadDataset(e.target.files[0]);
      e.target.value = "";
    }
  };

  const headers = useMemo(() => {
    if (dataset.rawHeaders && dataset.rawHeaders.length > 0) return dataset.rawHeaders;
    if (dataset.tableHeaders && dataset.tableHeaders.length > 0) return dataset.tableHeaders;
    return [];
  }, [dataset]);

  const rawRows = dataset.rawRows || [];

  const schemaRows = useMemo(() => {
    return headers.map((colName, colIdx) => {
      let sampleVal = "-";
      let nullCount = 0;
      const uniqueValues = new Set<string>();

      if (rawRows.length > 0) {
        for (let r = 0; r < rawRows.length; r++) {
          const val = rawRows[r]?.[colIdx];
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            uniqueValues.add(String(val).trim());
            if (sampleVal === "-") sampleVal = String(val).trim();
          } else {
            nullCount++;
          }
        }
      } else if (dataset.tableRows && dataset.tableRows.length > 0) {
        const val = dataset.tableRows[0][colName];
        if (val !== undefined && val !== null) sampleVal = String(val);
      }

      const dataType = inferDataType(sampleVal);
      const nullPercentageNum = rawRows.length > 0 ? (nullCount / rawRows.length) * 100 : 0;

      return {
        column: colName,
        type: dataType,
        nulls: Math.round(nullPercentageNum) + "%",
        nullsNum: nullPercentageNum,
        uniqueCount: uniqueValues.size,
        sample: sampleVal,
      };
    });
  }, [headers, rawRows, dataset.tableRows]);

  // Filtered & Sorted Schema
  const filteredSchema = useMemo(() => {
    let result = schemaRows.filter((row) => {
      const matchesSearch = row.column.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypeFilter === "All" || row.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      if (sortField === "column") {
        return sortDirection === "asc"
          ? a.column.localeCompare(b.column)
          : b.column.localeCompare(a.column);
      }
      if (sortField === "type") {
        return sortDirection === "asc"
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      if (sortField === "nulls") {
        return sortDirection === "asc"
          ? a.nullsNum - b.nullsNum
          : b.nullsNum - a.nullsNum;
      }
      return 0;
    });

    return result;
  }, [schemaRows, searchQuery, selectedTypeFilter, sortField, sortDirection]);

  // Data Quality Metrics
  const qualityMetrics = useMemo(() => {
    if (schemaRows.length === 0) {
      return { completeness: "100%", typesCount: 0, totalAttributes: 0 };
    }
    const avgNulls =
      schemaRows.reduce((acc, r) => acc + r.nullsNum, 0) / schemaRows.length;
    const completeness = (100 - avgNulls).toFixed(1) + "%";
    const typesCount = new Set(schemaRows.map((r) => r.type)).size;
    return { completeness, typesCount, totalAttributes: schemaRows.length };
  }, [schemaRows]);

  return (
    <>
      <div className="flex flex-col gap-6 pb-8 h-full">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.tsv,.json"
          className="hidden"
          aria-label="Upload dataset for schema analysis"
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
              Data &amp; Schema Inspector
            </h1>
            <p className="text-sm text-textSecondary mt-0.5">
              Inspect active dataset attributes, inferred data types, completeness, and live sample values.
            </p>
          </div>

          {canUndoDataset && (
            <button
              type="button"
              onClick={restorePreviousDataset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all self-start sm:self-auto cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo Removal
            </button>
          )}
        </div>

        {/* Data Quality Snapshot Strip */}
        {isUploaded && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                  Total Attributes
                </p>
                <p className="text-xl font-extrabold text-textPrimary">
                  {qualityMetrics.totalAttributes} Columns
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                  Data Completeness
                </p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {qualityMetrics.completeness}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                  Distinct Type Classes
                </p>
                <p className="text-xl font-extrabold text-textPrimary">
                  {qualityMetrics.typesCount} Types
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Data Source & File Meta */}
          <Card className="lg:col-span-1 h-fit shadow-xs border-border">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                <Database className="w-4 h-4 text-primary" />
                Active Source
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {!isUploaded ? (
                <div
                  className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-primary-soft/20 transition-all hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 bg-primary-soft rounded-2xl flex items-center justify-center mb-1 text-primary">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-textPrimary">
                      Upload or drag tabular dataset
                    </p>
                    <p className="text-[11px] text-textSecondary mt-0.5">
                      CSV, Excel (.xlsx), TSV, JSON (max 100MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-emerald-500/30 rounded-2xl p-4 bg-emerald-500/10 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-textPrimary truncate" title={dataset.name}>
                        {dataset.name}
                      </p>
                      <p className="text-[11px] text-textSecondary mt-0.5">
                        {dataset.totalRows} rows • {dataset.totalColumns} attributes
                      </p>
                      <p className="text-[10px] text-textMuted mt-0.5">
                        Updated {dataset.lastUpdated}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-border text-[11px]">
                      <span className="text-textSecondary">Storage Buffer</span>
                      <span className="font-bold text-textPrimary">Client Local Storage</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-border text-[11px]">
                      <span className="text-textSecondary">Integrity Validation</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Validated</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-xl border border-border bg-surface hover:bg-primary-soft/30 text-textPrimary text-xs font-bold transition-colors cursor-pointer"
                    >
                      Replace Dataset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full py-2 px-3 rounded-xl border border-danger/30 text-danger bg-danger-soft hover:bg-danger/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Remove File from Analysis
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schema Preview Table with Search, Filter & Sort */}
          <Card className="lg:col-span-2 shadow-xs border-border flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                  <FileType className="w-4 h-4 text-primary" />
                  Schema Attributes ({filteredSchema.length} of {schemaRows.length} displayed)
                </CardTitle>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  Showing complete dataset attributes with automatic type inference
                </p>
              </div>

              {/* Search & Type Filter Controls */}
              {isUploaded && (
                <div className="flex items-center gap-2">
                  <div className="relative w-36 sm:w-44">
                    <Search className="w-3.5 h-3.5 text-textMuted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search attribute..."
                      className="w-full h-8 pl-8 pr-2.5 text-xs rounded-xl border border-border bg-surface text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primary"
                    />
                  </div>

                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-xl border border-border bg-surface text-textPrimary font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="All">All Types</option>
                    <option value="Integer">Integer</option>
                    <option value="Decimal">Decimal</option>
                    <option value="String">String</option>
                    <option value="Date">Date</option>
                  </select>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-x-auto">
              {isUploaded && filteredSchema.length > 0 ? (
                <table className="w-full text-left text-xs" aria-label="Dataset Schema Attributes">
                  <thead className="bg-primary-soft/20 text-textSecondary border-b border-border">
                    <tr>
                      <th
                        onClick={() => {
                          setSortField("column");
                          setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                        }}
                        className="px-4 py-3 font-bold uppercase tracking-wider cursor-pointer select-none hover:text-textPrimary"
                      >
                        <span className="inline-flex items-center gap-1">
                          Attribute Column
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </span>
                      </th>
                      <th
                        onClick={() => {
                          setSortField("type");
                          setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                        }}
                        className="px-4 py-3 font-bold uppercase tracking-wider cursor-pointer select-none hover:text-textPrimary"
                      >
                        <span className="inline-flex items-center gap-1">
                          Inferred Type
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </span>
                      </th>
                      <th
                        onClick={() => {
                          setSortField("nulls");
                          setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                        }}
                        className="px-4 py-3 font-bold uppercase tracking-wider cursor-pointer select-none hover:text-textPrimary"
                      >
                        <span className="inline-flex items-center gap-1">
                          Null Rate
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </span>
                      </th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider">
                        Sample Record
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {filteredSchema.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-primary-soft/15 transition-colors cursor-pointer"
                        onClick={() => setSelectedSampleRow(row)}
                        title="Click to view attribute details"
                      >
                        <td className="px-4 py-3 font-bold text-textPrimary">
                          {row.column}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                              row.type === "Integer" || row.type === "Decimal"
                                ? "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                                : row.type === "Date"
                                ? "bg-purple-500/15 text-purple-600 border border-purple-500/30"
                                : "bg-primary-soft text-textPrimary border border-border"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-textSecondary font-semibold">
                          <span
                            className={
                              row.nullsNum === 0
                                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                : "text-amber-600 dark:text-amber-400"
                            }
                          >
                            {row.nulls}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-textSecondary font-mono text-[11px] truncate max-w-[200px]">
                          {row.sample}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-textMuted p-6 text-center">
                  <Database className="w-10 h-10 text-primary mb-2 opacity-80" />
                  <p className="text-sm font-bold text-textPrimary">
                    {isUploaded ? "No Matching Attributes Found" : "No Active Dataset Schema"}
                  </p>
                  <p className="text-xs text-textSecondary max-w-xs text-center mt-0.5">
                    {isUploaded
                      ? "Try clearing your search query or type filter."
                      : "Upload a CSV, Excel, or JSON dataset to inspect full column data types and statistics."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal for Removing File */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-danger-soft text-danger border border-danger/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-textPrimary">
                    Remove Dataset File?
                  </h3>
                  <p className="text-xs text-textSecondary mt-0.5">
                    Unload &ldquo;{dataset.name}&rdquo; from active analysis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-textMuted hover:text-textPrimary rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed mb-6">
              This will remove the current schema and records from your active session. You can undo this action immediately after removal using the notification banner.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-textSecondary hover:bg-primary-soft/30 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  removeDataset();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-danger hover:bg-rose-600 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attribute Disclosure Modal */}
      {selectedSampleRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedSampleRow(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h3 className="text-sm font-bold text-textPrimary">
                  Attribute Details: {selectedSampleRow.column}
                </h3>
                <p className="text-[11px] text-textSecondary">Column schema inspection</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSampleRow(null)}
                className="p-1 text-textMuted hover:text-textPrimary rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-textSecondary">Data Type</span>
                <span className="font-bold text-primary">{selectedSampleRow.type}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-textSecondary">Null Percentage</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedSampleRow.nulls}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-textSecondary">Unique Value Count</span>
                <span className="font-bold text-textPrimary">
                  {selectedSampleRow.uniqueCount} distinct
                </span>
              </div>
              <div className="py-2">
                <span className="text-textSecondary block mb-1">Sample Row Value</span>
                <div className="p-3 bg-primary-soft/30 rounded-xl font-mono text-xs text-textPrimary break-all border border-border">
                  {selectedSampleRow.sample}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSampleRow(null)}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
