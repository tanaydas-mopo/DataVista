import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Filter, Trash2, Edit3, ArrowRightLeft, Type, Sparkles, CheckCircle2, Database,
  X, ChevronDown, Merge, Scissors, SortAsc, Eye,
  MinusSquare, Search, Zap, Undo2, Check, Plus, Minus, Layers, RefreshCw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";

type AppliedStep = { id: string; icon: any; name: string; detail: string; timestamp: string; undo: () => void; };
type ModalType = null | "filter" | "duplicates" | "find-replace" | "change-type" | "rename" | "auto-clean" | "fill-missing" | "split-column" | "merge-columns" | "sort-rows" | "remove-columns" | "detect-outliers" | "remove-nulls";

function uid() { return Math.random().toString(36).slice(2, 9); }
function nowStr() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function mean(nums: number[]) { return nums.reduce((a, b) => a + b, 0) / nums.length; }
function median(nums: number[]) { const s = [...nums].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function modeVal(nums: number[]) { const freq: Record<number, number> = {}; let max = 0; let mode = nums[0]; for (const n of nums) { freq[n] = (freq[n] || 0) + 1; if (freq[n] > max) { max = freq[n]; mode = n; } } return mode; }

/* ─────────────────────────────────────────────
   PREMIUM MODAL CONTAINER & COMPONENTS
───────────────────────────────────────────── */
function Modal({ title, subtitle, icon: Icon, onClose, children }: {
  title: string; subtitle?: string; icon: any; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-surface border border-border/80 rounded-2xl shadow-2xl shadow-primary/5 flex flex-col max-h-[88vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-gradient-to-r from-primary-soft/30 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary/15 to-primary/5 p-2.5 rounded-xl text-primary ring-1 ring-primary/20 shadow-xs flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-textPrimary tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-textSecondary mt-0.5 font-medium">{subtitle}</p>}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl flex items-center justify-center text-textMuted hover:text-textPrimary hover:bg-primary-soft/60 transition-all duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
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

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer flex items-center gap-1.5 ${
        active 
          ? "bg-primary text-white border-primary shadow-sm shadow-primary/30 font-bold scale-[1.02]" 
          : "bg-surface text-textSecondary border-border hover:border-primary/40 hover:text-textPrimary hover:bg-primary-soft/20"
      }`}
    >
      {active && <Check className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

function SelectInput({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string; }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />{label}</label>}
      <div className="relative">
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full border border-border/80 bg-surface/90 text-textPrimary rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer pr-9 shadow-xs hover:border-primary/40"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 text-textMuted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />{label}</label>}
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="w-full border border-border/80 bg-surface/90 text-textPrimary rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-textMuted shadow-xs hover:border-primary/40" 
      />
    </div>
  );
}

function InfoBadge({ text, color = "primary", icon: Icon }: { text: string; color?: "primary" | "warning" | "success" | "danger"; icon?: any }) {
  const cls = { 
    primary: "bg-primary-soft/50 text-primary border-primary/25", 
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25", 
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25", 
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25" 
  }[color];
  
  return (
    <div className={`text-xs font-semibold px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${cls}`}>
      {Icon ? <Icon className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0 opacity-80" />}
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

function ActionRow({ onApply, onClose, applyLabel = "Apply", disabled = false }: { onApply: () => void; onClose: () => void; applyLabel?: string; disabled?: boolean; }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 mt-2">
      <button 
        onClick={onClose} 
        className="px-4 py-2.5 text-xs font-bold text-textSecondary bg-primary-soft/40 hover:bg-primary-soft/80 rounded-xl border border-border/60 transition-all cursor-pointer hover:text-textPrimary"
      >
        Cancel
      </button>
      <button 
        onClick={() => { if (!disabled) { onApply(); onClose(); } }} 
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

export function CleanTransform() {
  const { dataset, updateTableData } = useDataset();
  const [activeTab, setActiveTab] = useState("transform");
  const [modal, setModal] = useState<ModalType>(null);
  
  // Working active dataset state (headers & rows reflecting all applied steps)
  const [workingHeaders, setWorkingHeaders] = useState<string[]>(() => dataset.tableHeaders);
  const [workingRows, setWorkingRows] = useState<Record<string, any>[]>(() => dataset.tableRows);

  const [appliedSteps, setAppliedSteps] = useState<AppliedStep[]>(() => [
    { id: uid(), icon: Trash2, name: "Trimmed Whitespace", detail: `Cleaned text fields in ${dataset.name}`, timestamp: "10:30 AM", undo: () => {} },
    { id: uid(), icon: Type, name: "Verified Column Data Types", detail: `${dataset.totalColumns} columns indexed`, timestamp: "10:31 AM", undo: () => {} },
  ]);
  
  const isUploaded = dataset.status === "active";
  const [highlightedCells, setHighlightedCells] = useState<Record<string, boolean>>({});
  const [outlierRows, setOutlierRows] = useState<number[]>([]);
  const currentDatasetName = useRef(dataset.name);

  // Synchronize ONLY if a new dataset file or preset is loaded from Dashboard
  useEffect(() => {
    if (currentDatasetName.current !== dataset.name) {
      currentDatasetName.current = dataset.name;
      setWorkingHeaders(dataset.tableHeaders);
      setWorkingRows(dataset.tableRows);
      setHighlightedCells({});
      setOutlierRows([]);
    }
  }, [dataset.name, dataset.tableHeaders, dataset.tableRows]);

  // Commit transformed dataset to active state & global context
  const commitTransform = useCallback((headers: string[], rows: Record<string, any>[]) => {
    setWorkingHeaders(headers);
    setWorkingRows(rows);
    updateTableData(headers, rows);
  }, [updateTableData]);

  const addStep = useCallback((icon: any, name: string, detail: string, undo: () => void) => {
    const step: AppliedStep = { id: uid(), icon, name, detail, timestamp: nowStr(), undo };
    setAppliedSteps(prev => [step, ...prev]);
    setActiveTab("steps");
  }, []);

  const removeStep = (id: string) => {
    const step = appliedSteps.find(s => s.id === id);
    if (step && step.undo) step.undo(); // Execute undo before purging step
    setAppliedSteps(prev => prev.filter(s => s.id !== id));
  };

  /* ── 1. Remove Duplicates ── */
  const RemoveDuplicatesModal = () => {
    const [cols, setCols] = useState<string[]>(workingHeaders);
    const dupes = useMemo(() => {
      const seen = new Set<string>(); let count = 0;
      for (const row of workingRows) { const key = cols.map(c => String(row[c] ?? "")).join("||"); if (seen.has(key)) count++; else seen.add(key); }
      return count;
    }, [cols]);
    const toggle = (col: string) => setCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    const apply = () => {
      const seen = new Set<string>(); const snap = [...workingRows];
      const newRows = workingRows.filter(row => { const k = cols.map(c => String(row[c] ?? "")).join("||"); if (seen.has(k)) return false; seen.add(k); return true; });
      commitTransform(workingHeaders, newRows);
      addStep(Trash2, "Remove Duplicates", `Removed ${dupes} duplicate row(s)`, () => commitTransform(workingHeaders, snap));
    };
    return (
      <Modal title="Remove Duplicates" subtitle="Detect and eliminate duplicate records across columns" icon={Trash2} onClose={() => setModal(null)}>
        <p className="text-xs text-textSecondary leading-relaxed">Select the column subset to evaluate for uniqueness. Identical rows will be purged.</p>
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Target Columns</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={cols.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        <InfoBadge text={`${dupes} duplicate row${dupes !== 1 ? "s" : ""} identified across selected columns`} color={dupes > 0 ? "warning" : "success"} />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel={`Remove ${dupes} Duplicate${dupes !== 1 ? "s" : ""}`} />
      </Modal>
    );
  };

  /* ── 2. Remove Null Values ── */
  const RemoveNullsModal = () => {
    const [mode, setMode] = useState<"rows-any" | "rows-selected" | "cols">("rows-any");
    const [selectedCols, setSelectedCols] = useState<string[]>([]);
    const isNull = (v: any) => v === null || v === undefined || String(v).trim() === "";
    const toggle = (col: string) => setSelectedCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    const count = useMemo(() => {
      if (mode === "rows-any") return workingRows.filter(row => workingHeaders.some(h => isNull(row[h]))).length;
      if (mode === "rows-selected" && selectedCols.length > 0) return workingRows.filter(row => selectedCols.some(h => isNull(row[h]))).length;
      if (mode === "cols") return workingHeaders.filter(h => workingRows.some(row => isNull(row[h]))).length;
      return 0;
    }, [mode, selectedCols]);
    const apply = () => {
      const snap = { rows: [...workingRows], headers: [...workingHeaders] };
      const restore = () => commitTransform(snap.headers, snap.rows);
      if (mode === "rows-any") {
        const nr = workingRows.filter(row => !workingHeaders.some(h => isNull(row[h])));
        commitTransform(workingHeaders, nr);
        addStep(MinusSquare, "Remove Null Rows", `Removed ${count} row(s) with nulls`, restore);
      } else if (mode === "rows-selected" && selectedCols.length > 0) {
        const nr = workingRows.filter(row => !selectedCols.some(h => isNull(row[h])));
        commitTransform(workingHeaders, nr);
        addStep(MinusSquare, "Remove Null Rows", `Removed rows with nulls in: ${selectedCols.join(", ")}`, restore);
      } else if (mode === "cols") {
        const nullCols = workingHeaders.filter(h => workingRows.some(row => isNull(row[h])));
        const nh = workingHeaders.filter(h => !nullCols.includes(h));
        const nr = workingRows.map(row => { const r = { ...row }; nullCols.forEach(c => delete r[c]); return r; });
        commitTransform(nh, nr);
        addStep(MinusSquare, "Remove Null Columns", `Removed ${nullCols.length} column(s)`, restore);
      }
    };
    return (
      <Modal title="Remove Null Values" subtitle="Clean incomplete records or empty columns" icon={MinusSquare} onClose={() => setModal(null)}>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-1">Removal Strategy</p>
          {([{ v: "rows-any" as const, l: "Remove rows with ANY missing value" }, { v: "rows-selected" as const, l: "Remove rows with missing values in SELECTED columns" }, { v: "cols" as const, l: "Remove entire COLUMNS containing missing values" }]).map(o => (
            <button key={o.v} onClick={() => setMode(o.v)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${mode === o.v ? "bg-primary/10 border-primary text-primary font-bold shadow-xs" : "border-border/80 text-textSecondary hover:border-primary/40 hover:text-textPrimary bg-surface"}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${mode === o.v ? "border-primary bg-primary text-white" : "border-textMuted"}`}>{mode === o.v && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>{o.l}
            </button>
          ))}
        </div>
        {mode === "rows-selected" && <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2">Select Target Columns</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selectedCols.includes(col)} onClick={() => toggle(col)} />)}</div></div>}
        <InfoBadge text={`${count} ${mode === "cols" ? "column(s)" : "row(s)"} matched for removal`} color="warning" />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Execute Removal" />
      </Modal>
    );
  };

  /* ── 3. Fill Missing Values ── */
  const FillMissingModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [method, setMethod] = useState<"mean" | "median" | "mode" | "zero" | "custom" | "unknown">("mean");
    const [custom, setCustom] = useState("");
    const colNums = useMemo(() => workingRows.map(r => parseFloat(String(r[col]))).filter(n => !isNaN(n)), [col, workingRows]);
    const numericCol = colNums.length > 0;
    const fillValue = useMemo(() => {
      if (method === "mean" && numericCol) return mean(colNums).toFixed(2);
      if (method === "median" && numericCol) return median(colNums).toFixed(2);
      if (method === "mode" && numericCol) return modeVal(colNums).toString();
      if (method === "zero") return "0"; if (method === "unknown") return "Unknown"; if (method === "custom") return custom;
      return "-";
    }, [method, custom, colNums, numericCol]);
    const missingCount = workingRows.filter(r => r[col] === null || r[col] === undefined || String(r[col]).trim() === "").length;
    const apply = () => {
      const snap = [...workingRows]; const hl: Record<string, boolean> = {};
      const nr = workingRows.map((row, i) => { if (row[col] === null || row[col] === undefined || String(row[col]).trim() === "") { hl[`${i}-${col}`] = true; return { ...row, [col]: fillValue }; } return row; });
      commitTransform(workingHeaders, nr);
      setHighlightedCells(hl);
      addStep(Sparkles, "Fill Missing Values", `Filled ${missingCount} null(s) in "${col}" with ${method}`, () => { commitTransform(workingHeaders, snap); setHighlightedCells({}); });
    };
    return (
      <Modal title="Fill Missing Values" subtitle="Impute missing entries with statistical measures or custom values" icon={Sparkles} onClose={() => setModal(null)}>
        <SelectInput label="Target Column" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Imputation Method</p><div className="flex flex-wrap gap-2">{(["mean", "median", "mode", "zero", "custom", "unknown"] as const).map(m => <Chip key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} active={method === m} onClick={() => setMethod(m)} />)}</div></div>
        {method === "custom" && <TextInput label="Custom Fill Value" value={custom} onChange={setCustom} placeholder="Enter custom value..." />}
        <InfoBadge text={`Will fill ${missingCount} missing cell(s) in "${col}" with calculated value: ${fillValue}`} color={missingCount > 0 ? "primary" : "success"} />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Apply Imputation" />
      </Modal>
    );
  };

  /* ── 4. Rename Column ── */
  const RenameModal = () => {
    const [oldName, setOldName] = useState(workingHeaders[0] || "");
    const [newName, setNewName] = useState("");
    const isDupe = newName.trim() !== "" && workingHeaders.includes(newName.trim()) && newName.trim() !== oldName;
    const apply = () => {
      if (!newName.trim() || isDupe) return;
      const snapH = [...workingHeaders]; const snapR = workingRows.map(r => ({ ...r }));
      const nh = workingHeaders.map(h => h === oldName ? newName.trim() : h);
      const nr = workingRows.map(row => { const r = { ...row }; if (oldName in r) { r[newName.trim()] = r[oldName]; delete r[oldName]; } return r; });
      commitTransform(nh, nr);
      addStep(Edit3, "Rename Column", `Renamed "${oldName}" to "${newName.trim()}"`, () => commitTransform(snapH, snapR));
    };
    return (
      <Modal title="Rename Column" subtitle="Modify column header identifier" icon={Edit3} onClose={() => setModal(null)}>
        <SelectInput label="Select Existing Column" value={oldName} onChange={setOldName} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <TextInput label="New Header Name" value={newName} onChange={setNewName} placeholder="e.g. Total_Sales" />
        {isDupe && <InfoBadge text={`Header name "${newName}" already exists in dataset`} color="danger" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Update Header" />
      </Modal>
    );
  };

  /* ── 5. Change Data Type ── */
  const ChangeTypeModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [targetType, setTargetType] = useState("Text");
    const types = ["Text", "Integer", "Decimal", "Boolean", "Date", "DateTime", "Currency", "Percentage"];
    const convert = (val: any) => {
      const s = String(val ?? "");
      if (targetType === "Integer") { const n = parseInt(s); return isNaN(n) ? null : n; }
      if (targetType === "Decimal") { const n = parseFloat(s); return isNaN(n) ? null : n; }
      if (targetType === "Boolean") return s.toLowerCase() === "true" || s === "1" ? true : false;
      if (targetType === "Currency") { const n = parseFloat(s.replace(/[$,]/g, "")); return isNaN(n) ? null : `$${n.toFixed(2)}`; }
      if (targetType === "Percentage") { const n = parseFloat(s.replace(/%/g, "")); return isNaN(n) ? null : `${n}%`; }
      if (targetType === "Date") { const d = new Date(s); return isNaN(d.getTime()) ? null : d.toLocaleDateString(); }
      if (targetType === "DateTime") { const d = new Date(s); return isNaN(d.getTime()) ? null : d.toLocaleString(); }
      return s;
    };
    const errors = useMemo(() => workingRows.filter(row => convert(row[col]) === null).length, [col, targetType, workingRows]);
    const apply = () => {
      const snap = workingRows.map(r => ({ ...r })); const hl: Record<string, boolean> = {};
      const nr = workingRows.map((row, i) => { const v = convert(row[col]); if (v === null) hl[`${i}-${col}`] = true; return { ...row, [col]: v !== null ? v : row[col] }; });
      commitTransform(workingHeaders, nr);
      setHighlightedCells(hl);
      addStep(Type, "Change Data Type", `Changed "${col}" to ${targetType}${errors > 0 ? ` (${errors} errors)` : ""}`, () => { commitTransform(workingHeaders, snap); setHighlightedCells({}); });
    };
    return (
      <Modal title="Change Data Type" subtitle="Cast column elements to target format" icon={Type} onClose={() => setModal(null)}>
        <SelectInput label="Column" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Target Data Type</p><div className="flex flex-wrap gap-2">{types.map(t => <Chip key={t} label={t} active={targetType === t} onClick={() => setTargetType(t)} />)}</div></div>
        {errors > 0 ? <InfoBadge text={`${errors} row(s) cannot be cast and will preserve original value`} color="warning" /> : <InfoBadge text={`All ${workingRows.length} rows successfully valid for ${targetType}`} color="success" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Cast Data Type" />
      </Modal>
    );
  };

  /* ── 6. Split Column ── */
  const SplitColumnModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [splitBy, setSplitBy] = useState<"space" | "comma" | "dash" | "custom" | "fixed">("comma");
    const [custom, setCustom] = useState("");
    const [fixedLen, setFixedLen] = useState("5");
    const delim = splitBy === "space" ? " " : splitBy === "comma" ? "," : splitBy === "dash" ? "-" : splitBy === "custom" ? custom : "";
    const preview = useMemo(() => {
      const sample = workingRows[0]?.[col]; if (!sample) return [];
      if (splitBy === "fixed") { const len = parseInt(fixedLen) || 5; const p: string[] = []; for (let i = 0; i < String(sample).length; i += len) p.push(String(sample).slice(i, i + len)); return p; }
      return String(sample).split(delim);
    }, [col, splitBy, custom, fixedLen, workingRows]);
    const apply = () => {
      const snap = { rows: workingRows.map(r => ({ ...r })), headers: [...workingHeaders] };
      const nc = preview.map((_, i) => `${col}_${i + 1}`);
      const nh = [...workingHeaders.filter(h => h !== col), ...nc];
      const nr = workingRows.map(row => {
        const r = { ...row }; const val = String(r[col] ?? ""); let parts: string[];
        if (splitBy === "fixed") { const len = parseInt(fixedLen) || 5; parts = []; for (let i = 0; i < val.length; i += len) parts.push(val.slice(i, i + len)); } else { parts = val.split(delim); }
        delete r[col]; nc.forEach((c, i) => { r[c] = parts[i] ?? ""; }); return r;
      });
      commitTransform(nh, nr);
      addStep(Scissors, "Split Column", `Split "${col}" into ${nc.length} columns`, () => commitTransform(snap.headers, snap.rows));
    };
    return (
      <Modal title="Split Column" subtitle="Divide text column into multiple distinct fields" icon={Scissors} onClose={() => setModal(null)}>
        <SelectInput label="Column to Split" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Delimiter</p><div className="flex flex-wrap gap-2">{(["space", "comma", "dash", "custom", "fixed"] as const).map(s => <Chip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={splitBy === s} onClick={() => setSplitBy(s)} />)}</div></div>
        {splitBy === "custom" && <TextInput label="Custom Delimiter Character" value={custom} onChange={setCustom} placeholder="e.g. |" />}
        {splitBy === "fixed" && <TextInput label="Fixed Length (Number of Characters)" value={fixedLen} onChange={setFixedLen} placeholder="5" />}
        {preview.length > 0 && <div className="bg-primary-soft/30 rounded-xl p-3.5 border border-border/80 flex flex-col gap-1.5"><p className="text-[11px] font-bold uppercase text-textSecondary">First Row Extraction Preview</p><div className="flex flex-wrap gap-2">{preview.map((p, i) => <span key={i} className="px-2.5 py-1 bg-surface border border-border rounded-lg text-xs font-mono font-bold text-primary shadow-xs">{p || "(empty)"}</span>)}</div></div>}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Split Column" />
      </Modal>
    );
  };

  /* ── 7. Merge Columns ── */
  const MergeColumnsModal = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [sep, setSep] = useState(" ");
    const [newName, setNewName] = useState("merged_column");
    const [removeOrig, setRemoveOrig] = useState(true);
    const toggle = (col: string) => setSelected(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    const preview = selected.length >= 2 ? selected.map(c => String(workingRows[0]?.[c] ?? "")).join(sep) : "";
    const apply = () => {
      if (selected.length < 2) return;
      const snap = { rows: workingRows.map(r => ({ ...r })), headers: [...workingHeaders] };
      const nr = workingRows.map(row => { const r = { ...row }; r[newName] = selected.map(c => String(r[c] ?? "")).join(sep); if (removeOrig) selected.forEach(c => { if (c !== newName) delete r[c]; }); return r; });
      const nh = [...(removeOrig ? workingHeaders.filter(h => !selected.includes(h)) : workingHeaders), newName];
      commitTransform(nh, nr);
      addStep(Merge, "Merge Columns", `Merged ${selected.join(" + ")} into "${newName}"`, () => commitTransform(snap.headers, snap.rows));
    };
    return (
      <Modal title="Merge Columns" subtitle="Combine multiple fields into a single unified column" icon={Merge} onClose={() => setModal(null)}>
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Select Columns (Minimum 2)</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selected.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Separator Character</p><div className="flex flex-wrap gap-2">{[" ", ",", "-", "_"].map(s => <Chip key={s} label={s === " " ? "Space" : s} active={sep === s} onClick={() => setSep(s)} />)}</div></div>
        <TextInput label="Output Column Name" value={newName} onChange={setNewName} />
        <button onClick={() => setRemoveOrig(!removeOrig)} className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary cursor-pointer hover:text-textPrimary transition-colors">
          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${removeOrig ? "bg-primary border-primary text-white" : "border-border bg-surface"}`}>{removeOrig && <Check className="w-3 h-3" />}</div>
          Purge original columns post-merge
        </button>
        {preview && <InfoBadge text={`Sample Output: "${preview}"`} color="primary" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Merge Columns" />
      </Modal>
    );
  };

  /* ── 8. Filter Rows ── */
  const FilterRowsModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [op, setOp] = useState("equals");
    const [val, setVal] = useState("");

    const ops = [
      { value: "equals", label: "Equals (Case-insensitive)" },
      { value: "not-equals", label: "Not Equals" },
      { value: "contains", label: "Contains" },
      { value: "greater", label: "Greater Than" },
      { value: "less", label: "Less Than" },
      { value: "starts-with", label: "Starts With" },
      { value: "ends-with", label: "Ends With" },
      { value: "is-empty", label: "Is Empty" },
      { value: "is-not-empty", label: "Is Not Empty" }
    ];

    const sampleValues = useMemo(() => {
      const set = new Set<string>();
      workingRows.forEach(r => {
        const v = String(r[col] ?? "").trim();
        if (v.length > 0) set.add(v);
      });
      return Array.from(set).slice(0, 10);
    }, [col, workingRows]);

    const matches = (row: Record<string, any>) => {
      const rawCell = String(row[col] ?? "").trim();
      const cellLower = rawCell.toLowerCase();
      const targetLower = val.trim().toLowerCase();

      switch (op) {
        case "equals": return cellLower === targetLower;
        case "not-equals": return cellLower !== targetLower;
        case "greater": return parseFloat(rawCell) > parseFloat(val.trim());
        case "less": return parseFloat(rawCell) < parseFloat(val.trim());
        case "contains": return cellLower.includes(targetLower);
        case "starts-with": return cellLower.startsWith(targetLower);
        case "ends-with": return cellLower.endsWith(targetLower);
        case "is-empty": return rawCell === "";
        case "is-not-empty": return rawCell !== "";
        default: return true;
      }
    };

    const cnt = useMemo(() => workingRows.filter(matches).length, [col, op, val, workingRows]);
    const isZeroMatch = cnt === 0 && !["is-empty", "is-not-empty"].includes(op);

    const apply = () => {
      if (isZeroMatch) return;
      const snap = [...workingRows];
      const nr = workingRows.filter(matches);
      commitTransform(workingHeaders, nr);
      addStep(Filter, "Filter Rows", `Kept ${cnt} row(s) where "${col}" ${op} "${val}"`, () => commitTransform(workingHeaders, snap));
    };

    return (
      <Modal title="Filter Rows" subtitle="Filter dataset rows according to field conditions" icon={Filter} onClose={() => setModal(null)}>
        <SelectInput label="Select Column to Filter" value={col} onChange={v => { setCol(v); setVal(""); }} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <SelectInput label="Condition Operator" value={op} onChange={setOp} options={ops} />
        
        {!["is-empty", "is-not-empty"].includes(op) && (
          <div className="flex flex-col gap-2">
            <TextInput label="Target Filter Value" value={val} onChange={setVal} placeholder="Type value or select below..." />
            {sampleValues.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" /> Quick-select sample values from "{col}":
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {sampleValues.map((sv, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setVal(sv)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                        val.trim().toLowerCase() === sv.toLowerCase()
                          ? "bg-primary text-white border-primary shadow-xs font-bold scale-[1.02]"
                          : "bg-surface text-textSecondary border-border/80 hover:border-primary/40 hover:text-textPrimary hover:bg-primary-soft/20"
                      }`}
                    >
                      {sv}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <InfoBadge 
          text={isZeroMatch && val.trim() !== ""
            ? `⚠️ 0 of ${workingRows.length} rows match "${val}" in column "${col}". Select column "${col}" or choose a sample value above.`
            : `${cnt} of ${workingRows.length} row(s) satisfy this criteria`
          } 
          color={cnt > 0 ? "primary" : "warning"} 
        />
        <ActionRow 
          onApply={apply} 
          onClose={() => setModal(null)} 
          applyLabel={isZeroMatch ? "No Matches Found" : `Apply Filter (${cnt} Rows)`} 
          disabled={isZeroMatch}
        />
      </Modal>
    );
  };

  /* ── 9. Sort Rows ── */
  const SortRowsModal = () => {
    const [sorts, setSorts] = useState<{ col: string; dir: "asc" | "desc" }[]>([{ col: workingHeaders[0] || "", dir: "asc" }]);
    const addSort = () => setSorts(prev => [...prev, { col: workingHeaders[0] || "", dir: "asc" }]);
    const removeSort = (i: number) => setSorts(prev => prev.filter((_, idx) => idx !== i));
    const updateSort = (i: number, field: "col" | "dir", v: string) => setSorts(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: v } : s));
    const apply = () => {
      const snap = [...workingRows];
      const nr = [...workingRows].sort((a, b) => { for (const { col, dir } of sorts) { const na = parseFloat(String(a[col])); const nb = parseFloat(String(b[col])); const cmp = (!isNaN(na) && !isNaN(nb)) ? na - nb : String(a[col]).localeCompare(String(b[col])); if (cmp !== 0) return dir === "asc" ? cmp : -cmp; } return 0; });
      commitTransform(workingHeaders, nr);
      addStep(SortAsc, "Sort Rows", `Sorted by ${sorts.map(s => `${s.col} (${s.dir})`).join(", ")}`, () => commitTransform(workingHeaders, snap));
    };
    return (
      <Modal title="Sort Rows" subtitle="Re-order rows by single or multi-column criteria" icon={SortAsc} onClose={() => setModal(null)}>
        <div className="flex flex-col gap-3">
          {sorts.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 bg-primary-soft/20 p-2.5 rounded-xl border border-border/60">
              <div className="flex-1 relative"><select value={s.col} onChange={e => updateSort(i, "col", e.target.value)} className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer pr-7">{workingHeaders.map(h => <option key={h} value={h}>{h}</option>)}</select><ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
              <div className="relative"><select value={s.dir} onChange={e => updateSort(i, "dir", e.target.value)} className="border border-border/80 bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer pr-7"><option value="asc">Ascending (A-Z, 0-9)</option><option value="desc">Descending (Z-A, 9-0)</option></select><ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
              {i > 0 && <button onClick={() => removeSort(i)} className="text-textMuted hover:text-rose-500 p-1 transition-colors cursor-pointer"><Minus className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
        <button onClick={addSort} className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer w-fit"><Plus className="w-4 h-4" /> Add Sort Level</button>
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Execute Sort" />
      </Modal>
    );
  };

  /* ── 10. Remove Columns ── */
  const RemoveColumnsModal = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const toggle = (col: string) => setSelected(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    const apply = () => {
      if (selected.length === 0) return;
      const snap = { rows: workingRows.map(r => ({ ...r })), headers: [...workingHeaders] };
      const nh = workingHeaders.filter(h => !selected.includes(h));
      const nr = workingRows.map(row => { const r = { ...row }; selected.forEach(c => delete r[c]); return r; });
      commitTransform(nh, nr);
      addStep(Trash2, "Remove Columns", `Removed: ${selected.join(", ")}`, () => commitTransform(snap.headers, snap.rows));
    };
    return (
      <Modal title="Remove Columns" subtitle="Select columns to permanently delete" icon={Trash2} onClose={() => setModal(null)}>
        <p className="text-xs text-textSecondary leading-relaxed">Selected column headers and all corresponding data cells will be removed.</p>
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2">Select Columns ({selected.length} selected)</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selected.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        {selected.length > 0 && <InfoBadge text={`${selected.length} column(s) queued for deletion`} color="danger" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Delete Columns" />
      </Modal>
    );
  };

  /* ── 11. Find and Replace ── */
  const FindReplaceModal = () => {
    const [find, setFind] = useState("");
    const [replace, setReplace] = useState("");
    const [matchCase, setMatchCase] = useState(false);
    const [replaceAll, setReplaceAll] = useState(true);
    const [selCols, setSelCols] = useState<string[]>([]);
    const toggle = (col: string) => setSelCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
    const cols = selCols.length > 0 ? selCols : workingHeaders;
    const cnt = useMemo(() => { if (!find) return 0; let c = 0; workingRows.forEach(row => cols.forEach(col => { const v = matchCase ? String(row[col] ?? "") : String(row[col] ?? "").toLowerCase(); c += v.split(matchCase ? find : find.toLowerCase()).length - 1; })); return c; }, [find, matchCase, cols, workingRows]);
    const apply = () => {
      if (!find) return;
      const snap = workingRows.map(r => ({ ...r })); const hl: Record<string, boolean> = {};
      const esc = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(esc, (matchCase ? "" : "i") + (replaceAll ? "g" : ""));
      const nr = workingRows.map((row, i) => { const r = { ...row }; cols.forEach(col => { const v = String(r[col] ?? ""); const check = matchCase ? v : v.toLowerCase(); if (check.includes(matchCase ? find : find.toLowerCase())) { hl[`${i}-${col}`] = true; r[col] = v.replace(rx, replace); } }); return r; });
      commitTransform(workingHeaders, nr);
      setHighlightedCells(hl);
      addStep(Search, "Find and Replace", `Replaced "${find}" with "${replace}" (${cnt} match${cnt !== 1 ? "es" : ""})`, () => { commitTransform(workingHeaders, snap); setHighlightedCells({}); });
    };
    return (
      <Modal title="Find & Replace" subtitle="Locate specific values and substitute them" icon={ArrowRightLeft} onClose={() => setModal(null)}>
        <TextInput label="Find Query" value={find} onChange={setFind} placeholder="Search string..." />
        <TextInput label="Replacement Text" value={replace} onChange={setReplace} placeholder="Replace with..." />
        <div className="flex items-center gap-5 pt-1">
          {([{ v: matchCase, fn: () => setMatchCase(!matchCase), l: "Match Case" }, { v: replaceAll, fn: () => setReplaceAll(!replaceAll), l: "Replace All Matches" }] as const).map((o, idx) => (
            <button key={idx} onClick={o.fn} className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary cursor-pointer hover:text-textPrimary transition-colors">
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${o.v ? "bg-primary border-primary text-white" : "border-border bg-surface"}`}>{o.v && <Check className="w-3 h-3" />}</div>{o.l}
            </button>
          ))}
        </div>
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Target Columns (Optional)</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selCols.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        {find && <InfoBadge text={`${cnt} occurrence(s) found across ${cols.length} column(s)`} color={cnt > 0 ? "primary" : "success"} />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Execute Replace" />
      </Modal>
    );
  };

  /* ── 12. Detect Outliers ── */
  const DetectOutliersModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [method, setMethod] = useState<"iqr" | "zscore">("iqr");
    const [action, setAction] = useState<"remove" | "keep" | "replace-mean" | "replace-median">("remove");
    const numRows = useMemo(() => workingRows.map((row, i) => ({ val: parseFloat(String(row[col] ?? "")), i })).filter(r => !isNaN(r.val)), [col, workingRows]);
    const vals = numRows.map(r => r.val);
    const outIdx = useMemo(() => {
      if (vals.length < 4) return [];
      if (method === "iqr") { const s = [...vals].sort((a, b) => a - b); const q1 = s[Math.floor(s.length * 0.25)]; const q3 = s[Math.floor(s.length * 0.75)]; const iqr = q3 - q1; return numRows.filter(r => r.val < q1 - 1.5 * iqr || r.val > q3 + 1.5 * iqr).map(r => r.i); }
      const m = mean(vals); const std = Math.sqrt(vals.map(v => (v - m) ** 2).reduce((a, b) => a + b, 0) / vals.length);
      return numRows.filter(r => Math.abs(r.val - m) > 3 * std).map(r => r.i);
    }, [col, method, numRows, vals]);
    useEffect(() => { setOutlierRows(outIdx); return () => setOutlierRows([]); }, [outIdx]);
    const apply = () => {
      const snap = workingRows.map(r => ({ ...r })); const hl: Record<string, boolean> = {}; let rows = [...workingRows];
      const m = vals.length > 0 ? mean(vals) : 0; const med = vals.length > 0 ? median(vals) : 0;
      if (action === "remove") { rows = rows.filter((_, i) => !outIdx.includes(i)); }
      else if (action === "replace-mean" || action === "replace-median") { const rv = action === "replace-mean" ? m.toFixed(2) : med.toFixed(2); rows = rows.map((row, i) => { if (outIdx.includes(i)) { hl[`${i}-${col}`] = true; return { ...row, [col]: rv }; } return row; }); }
      commitTransform(workingHeaders, rows); setHighlightedCells(hl); setOutlierRows([]);
      addStep(Eye, "Detect Outliers", `${action} ${outIdx.length} outlier(s) in "${col}" (${method.toUpperCase()})`, () => { commitTransform(workingHeaders, snap); setHighlightedCells({}); setOutlierRows([]); });
    };
    return (
      <Modal title="Detect Outliers" subtitle="Identify statistical anomalies via IQR or Z-score algorithms" icon={Eye} onClose={() => setModal(null)}>
        <SelectInput label="Target Column" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Statistical Method</p><div className="flex gap-2.5"><Chip label="Interquartile Range (IQR)" active={method === "iqr"} onClick={() => setMethod("iqr")} /><Chip label="Z-Score Standard Deviation" active={method === "zscore"} onClick={() => setMethod("zscore")} /></div></div>
        <div><p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Action Strategy</p><div className="flex flex-wrap gap-2"><Chip label="Remove Outlier Rows" active={action === "remove"} onClick={() => setAction("remove")} /><Chip label="Highlight Only" active={action === "keep"} onClick={() => setAction("keep")} /><Chip label="Replace with Mean" active={action === "replace-mean"} onClick={() => setAction("replace-mean")} /><Chip label="Replace with Median" active={action === "replace-median"} onClick={() => setAction("replace-median")} /></div></div>
        <InfoBadge text={vals.length < 4 ? `"${col}" lacks sufficient numeric values` : `${outIdx.length} statistical anomaly outlier(s) detected (${method.toUpperCase()})`} color={outIdx.length > 0 ? "warning" : "success"} />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Apply Outlier Strategy" />
      </Modal>
    );
  };

  /* ── 13. AI Supercharged Auto Clean Modal ── */
  const AutoCleanModal = () => {
    const isNull = (v: any) => v === null || v === undefined || String(v).trim() === "" || ["n/a", "null", "nan", "none", "-"].includes(String(v).trim().toLowerCase());

    const isExcelDate = (val: any) => {
      const n = Number(val);
      return !isNaN(n) && n >= 35000 && n <= 50000;
    };

    const excelDateToStr = (serial: number) => {
      const utcDays = Math.floor(serial - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      return dateInfo.toISOString().split('T')[0];
    };

    const audit = useMemo(() => {
      const suggestions: {
        id: string;
        icon: any;
        title: string;
        detail: string;
        risk: "high" | "medium" | "low";
        action: () => void;
      }[] = [];

      let healthScore = 100;

      // 1. Duplicate Rows Audit
      const seen = new Set<string>();
      let dupes = 0;
      workingRows.forEach(row => {
        const key = workingHeaders.map(h => String(row[h] ?? "")).join("||");
        if (seen.has(key)) dupes++;
        else seen.add(key);
      });

      if (dupes > 0) {
        healthScore -= Math.min(25, dupes * 5);
        suggestions.push({
          id: "dupes",
          icon: Trash2,
          title: `Purge ${dupes} Duplicate Row${dupes > 1 ? "s" : ""}`,
          detail: `Identical records detected across all ${workingHeaders.length} columns.`,
          risk: "high",
          action: () => {
            const s = new Set<string>();
            const snap = [...workingRows];
            const nr = workingRows.filter(row => {
              const k = workingHeaders.map(h => String(row[h] ?? "")).join("||");
              if (s.has(k)) return false;
              s.add(k);
              return true;
            });
            commitTransform(workingHeaders, nr);
            addStep(Trash2, "AI Auto Clean: Purged Duplicates", `Removed ${dupes} duplicate row(s)`, () => commitTransform(workingHeaders, snap));
          }
        });
      }

      // 2. Untrimmed Whitespace Audit
      let untrimmedCells = 0;
      workingHeaders.forEach(h => {
        workingRows.forEach(row => {
          const raw = String(row[h] ?? "");
          if (raw !== raw.trim()) untrimmedCells++;
        });
      });

      if (untrimmedCells > 0) {
        healthScore -= 10;
        suggestions.push({
          id: "whitespace",
          icon: Sparkles,
          title: `Trim ${untrimmedCells} Untrimmed Text Cell${untrimmedCells > 1 ? "s" : ""}`,
          detail: "Leading or trailing spaces detected in text columns.",
          risk: "low",
          action: () => {
            const snap = [...workingRows];
            const nr = workingRows.map(row => {
              const r = { ...row };
              workingHeaders.forEach(h => {
                if (typeof r[h] === "string") r[h] = r[h].trim();
              });
              return r;
            });
            commitTransform(workingHeaders, nr);
            addStep(Sparkles, "AI Auto Clean: Trimmed Whitespace", `Cleaned whitespace in ${untrimmedCells} cell(s)`, () => commitTransform(workingHeaders, snap));
          }
        });
      }

      // 3. Excel Date Serial Conversion Audit
      let excelDates = 0;
      const dateCols: string[] = [];
      workingHeaders.forEach(h => {
        const isDateHeader = h.toLowerCase().includes("date") || h.toLowerCase().includes("time");
        let countInCol = 0;
        workingRows.forEach(row => {
          if (isExcelDate(row[h])) countInCol++;
        });
        if (isDateHeader && countInCol > 0) {
          excelDates += countInCol;
          dateCols.push(h);
        }
      });

      if (excelDates > 0) {
        healthScore -= 15;
        suggestions.push({
          id: "excel-dates",
          icon: Zap,
          title: `Format ${excelDates} Excel Serial Date${excelDates > 1 ? "s" : ""}`,
          detail: `Raw numeric dates (e.g. 41604) in column(s): ${dateCols.join(", ")} will be converted to YYYY-MM-DD.`,
          risk: "medium",
          action: () => {
            const snap = [...workingRows];
            const nr = workingRows.map(row => {
              const r = { ...row };
              dateCols.forEach(h => {
                if (isExcelDate(r[h])) r[h] = excelDateToStr(Number(r[h]));
              });
              return r;
            });
            commitTransform(workingHeaders, nr);
            addStep(Zap, "AI Auto Clean: Formatted Dates", `Converted ${excelDates} Excel serial date(s) to YYYY-MM-DD`, () => commitTransform(workingHeaders, snap));
          }
        });
      }

      // 4. Missing / Null Cells Audit
      let nullCnt = 0;
      workingHeaders.forEach(h => {
        workingRows.forEach(row => {
          if (isNull(row[h])) nullCnt++;
        });
      });

      if (nullCnt > 0) {
        healthScore -= Math.min(20, nullCnt * 2);
        suggestions.push({
          id: "nulls",
          icon: MinusSquare,
          title: `Impute ${nullCnt} Missing Value${nullCnt > 1 ? "s" : ""}`,
          detail: "Null or empty cells detected — fill with 'Unknown' or column mode.",
          risk: "medium",
          action: () => {
            const snap = [...workingRows];
            const hl: Record<string, boolean> = {};
            const nr = workingRows.map((row, i) => {
              const r = { ...row };
              workingHeaders.forEach(h => {
                if (isNull(r[h])) {
                  hl[`${i}-${h}`] = true;
                  r[h] = "Unknown";
                }
              });
              return r;
            });
            commitTransform(workingHeaders, nr);
            setHighlightedCells(hl);
            addStep(MinusSquare, "AI Auto Clean: Imputed Nulls", `Filled ${nullCnt} missing cell(s)`, () => { commitTransform(workingHeaders, snap); setHighlightedCells({}); });
          }
        });
      }

      // 5. Completely Empty / Zero Variance Columns Audit
      const emptyCols = workingHeaders.filter(h => workingRows.every(row => isNull(row[h])));
      if (emptyCols.length > 0) {
        healthScore -= 15;
        suggestions.push({
          id: "empty-cols",
          icon: Trash2,
          title: `Drop ${emptyCols.length} Empty Column${emptyCols.length > 1 ? "s" : ""}`,
          detail: `Column(s) ${emptyCols.join(", ")} contain 100% null entries.`,
          risk: "high",
          action: () => {
            const snap = { rows: [...workingRows], headers: [...workingHeaders] };
            const nh = workingHeaders.filter(h => !emptyCols.includes(h));
            const nr = workingRows.map(row => {
              const r = { ...row };
              emptyCols.forEach(c => delete r[c]);
              return r;
            });
            commitTransform(nh, nr);
            addStep(Trash2, "AI Auto Clean: Purged Empty Columns", `Removed: ${emptyCols.join(", ")}`, () => commitTransform(snap.headers, snap.rows));
          }
        });
      }

      if (suggestions.length === 0) {
        suggestions.push({
          id: "ok",
          icon: CheckCircle2,
          title: "Dataset Data Hygiene is Optimal!",
          detail: "No duplicates, missing values, date format errors, or whitespace issues detected.",
          risk: "low",
          action: () => {}
        });
      }

      return { healthScore: Math.max(40, healthScore), suggestions };
    }, [workingHeaders, workingRows, commitTransform, addStep]);

    const [applied, setApplied] = useState<string[]>([]);

    const applyAll = () => {
      audit.suggestions.filter(s => s.id !== "ok").forEach(s => s.action());
      setApplied(audit.suggestions.map(s => s.id));
      setModal(null);
    };

    return (
      <Modal title="AI Supercharged Auto Clean" subtitle="DataVista AI autonomous data hygiene & quality audit" icon={Zap} onClose={() => setModal(null)}>
        {/* AI Score Banner */}
        <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
              {audit.healthScore}
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-textPrimary">Dataset Hygiene Score</h4>
              <p className="text-[11px] text-textSecondary mt-0.5 font-medium">
                {audit.suggestions.filter(s => s.id !== "ok").length} Optimization Opportunity(ies) Identified
              </p>
            </div>
          </div>
          {audit.suggestions.some(s => s.id !== "ok") && (
            <button
              onClick={applyAll}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Apply All Fixes
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Audit Findings & Automated Cleaning Actions
          </p>
          {audit.suggestions.map(s => {
            const isDone = applied.includes(s.id);
            const riskColor = s.risk === "high" ? "bg-rose-500/10 border-rose-500/30 text-rose-600" : s.risk === "medium" ? "bg-amber-500/10 border-amber-500/30 text-amber-600" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600";
            
            return (
              <div
                key={s.id}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${isDone ? "bg-emerald-500/10 border-emerald-500/30" : "bg-surface border-border/80 hover:border-primary/40 shadow-xs"}`}
              >
                <div className="bg-primary-soft/60 p-2.5 rounded-xl text-primary shrink-0 flex items-center justify-center">
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-textPrimary truncate">{s.title}</p>
                    {s.id !== "ok" && (
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${riskColor}`}>
                        {s.risk} Priority
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-textSecondary mt-0.5 leading-snug">{s.detail}</p>
                </div>
                {s.id !== "ok" && !isDone && (
                  <button
                    onClick={() => { s.action(); setApplied(prev => [...prev, s.id]); }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    Fix
                  </button>
                )}
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60 mt-1">
          <button onClick={() => setModal(null)} className="px-4 py-2.5 text-xs font-bold text-textSecondary bg-primary-soft/40 hover:bg-primary-soft/80 rounded-xl border border-border/60 transition-all cursor-pointer">
            Close Audit
          </button>
        </div>
      </Modal>
    );
  };

  const operations = [
    { icon: Filter, name: "Filter Rows", desc: "Keep or remove rows based on conditions", modal: "filter" as ModalType },
    { icon: Trash2, name: "Remove Duplicates", desc: "Delete identical rows across selected columns", modal: "duplicates" as ModalType },
    { icon: MinusSquare, name: "Remove Null Values", desc: "Drop rows or columns containing missing values", modal: "remove-nulls" as ModalType },
    { icon: Sparkles, name: "Fill Missing Values", desc: "Impute null cells with mean, median, mode or custom", modal: "fill-missing" as ModalType },
    { icon: Edit3, name: "Rename Columns", desc: "Change the headers of your dataset", modal: "rename" as ModalType },
    { icon: Type, name: "Change Data Type", desc: "Convert column types (text, integer, date...)", modal: "change-type" as ModalType },
    { icon: Scissors, name: "Split Column", desc: "Split one column into multiple by a delimiter", modal: "split-column" as ModalType },
    { icon: Merge, name: "Merge Columns", desc: "Combine multiple columns into one", modal: "merge-columns" as ModalType },
    { icon: SortAsc, name: "Sort Rows", desc: "Sort rows by one or more columns", modal: "sort-rows" as ModalType },
    { icon: Trash2, name: "Remove Columns", desc: "Delete one or more columns permanently", modal: "remove-columns" as ModalType },
    { icon: ArrowRightLeft, name: "Find & Replace", desc: "Replace specific values with match-case support", modal: "find-replace" as ModalType },
    { icon: Eye, name: "Detect Outliers", desc: "Find and handle outliers using IQR or Z-Score", modal: "detect-outliers" as ModalType },
    { icon: Zap, name: "Auto Clean", desc: "AI-powered data cleaning suggestions", modal: "auto-clean" as ModalType },
  ];

  const discardChanges = () => {
    commitTransform(dataset.tableHeaders, dataset.tableRows);
    setHighlightedCells({}); setOutlierRows([]);
    setAppliedSteps([
      { id: uid(), icon: Trash2, name: "Trimmed Whitespace", detail: `Cleaned text fields in ${dataset.name}`, timestamp: nowStr(), undo: () => {} },
      { id: uid(), icon: Type, name: "Verified Column Data Types", detail: `${dataset.totalColumns} columns indexed`, timestamp: nowStr(), undo: () => {} },
    ]);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Clean &amp; Transform</h1>
          <p className="text-sm text-textSecondary mt-0.5">Prepare your dataset for analysis and visualization.</p>
        </div>
        {isUploaded && (
          <div className="flex gap-3">
            <button onClick={discardChanges} className="px-4 py-2 bg-surface text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/40 transition-all border border-border shadow-xs cursor-pointer flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-textMuted" />
              Discard Changes
            </button>
            <button onClick={() => setActiveTab("steps")} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer active:scale-[0.98]">
              <CheckCircle2 className="w-4 h-4" />Applied Steps ({appliedSteps.length})
            </button>
          </div>
        )}
      </div>

      {isUploaded ? (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          <Card className="lg:w-80 h-fit flex-shrink-0 border border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/60 pb-3 bg-surface/50">
              <div className="flex space-x-6">
                <button className={`text-xs font-bold pb-2.5 border-b-2 transition-all cursor-pointer ${activeTab === "transform" ? "border-primary text-primary font-extrabold" : "border-transparent text-textSecondary hover:text-textPrimary"}`} onClick={() => setActiveTab("transform")}>Transform Operations</button>
                <button className={`text-xs font-bold pb-2.5 border-b-2 transition-all cursor-pointer ${activeTab === "steps" ? "border-primary text-primary font-extrabold" : "border-transparent text-textSecondary hover:text-textPrimary"}`} onClick={() => setActiveTab("steps")}>Applied Steps ({appliedSteps.length})</button>
              </div>
            </CardHeader>
            <CardContent className="pt-3.5 pb-4 px-3">
              {activeTab === "transform" ? (
                <div className="flex flex-col gap-1.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                  {operations.map((op, idx) => (
                    <button key={idx} onClick={() => setModal(op.modal)} className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary-soft/40 transition-all text-left border border-transparent hover:border-border/80 cursor-pointer group">
                      <div className="mt-0.5 bg-primary-soft/70 p-2 rounded-xl text-primary group-hover:scale-110 transition-transform flex-shrink-0 flex items-center justify-center">
                        <op.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">{op.name}</p>
                        <p className="text-[11px] text-textSecondary mt-0.5 leading-snug">{op.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                  {appliedSteps.length === 0 && <p className="text-xs text-textSecondary text-center py-6">No steps applied yet.</p>}
                  {appliedSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border/80 shadow-xs hover:border-primary/30 transition-all">
                      <div className="bg-primary-soft/70 p-2 rounded-xl text-primary flex-shrink-0"><step.icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-textPrimary truncate">{step.name}</p>
                        <p className="text-[11px] text-textSecondary truncate mt-0.5">{step.detail}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button title="Undo step" onClick={() => { if (step.undo) step.undo(); removeStep(step.id); }} className="p-1.5 rounded-lg hover:bg-primary-soft text-textMuted hover:text-primary transition-colors cursor-pointer"><Undo2 className="w-3.5 h-3.5" /></button>
                        <button title="Remove step" onClick={() => removeStep(step.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-textMuted hover:text-rose-500 transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col min-w-0 border border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-bold text-textPrimary">Data Preview — {dataset.name}</CardTitle>
              </div>
              <span className="text-[11px] text-primary bg-primary-soft/50 px-3 py-1 rounded-full border border-primary/20 font-bold shadow-xs">
                {workingRows.length} rows loaded
              </span>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-primary-soft/20 text-textSecondary sticky top-0 shadow-xs border-b border-border/80 backdrop-blur-md">
                  <tr>{workingHeaders.map((header, idx) => <th key={idx} className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">{header}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-surface">
                  {workingRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={`hover:bg-primary-soft/15 transition-colors ${outlierRows.includes(rowIdx) ? "bg-amber-500/10" : ""}`}>
                      {workingHeaders.map((header, colIdx) => (
                        <td key={colIdx} className={`px-4 py-3 font-medium transition-colors ${highlightedCells[`${rowIdx}-${header}`] ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold" : "text-textPrimary"}`}>
                          {row[header] !== undefined ? String(row[header]) : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-border bg-surface shadow-xs rounded-2xl">
          <Database className="w-16 h-16 text-textMuted stroke-[1.5] animate-pulse" />
          <h3 className="text-lg font-bold text-textPrimary">No Active Dataset</h3>
          <p className="text-sm text-textSecondary max-w-md">Upload a CSV, Excel, or JSON dataset on the Dashboard to perform data cleaning, filtering, and transformation operations.</p>
        </Card>
      )}

      {modal === "duplicates" && <RemoveDuplicatesModal />}
      {modal === "remove-nulls" && <RemoveNullsModal />}
      {modal === "fill-missing" && <FillMissingModal />}
      {modal === "rename" && <RenameModal />}
      {modal === "change-type" && <ChangeTypeModal />}
      {modal === "split-column" && <SplitColumnModal />}
      {modal === "merge-columns" && <MergeColumnsModal />}
      {modal === "filter" && <FilterRowsModal />}
      {modal === "sort-rows" && <SortRowsModal />}
      {modal === "remove-columns" && <RemoveColumnsModal />}
      {modal === "find-replace" && <FindReplaceModal />}
      {modal === "detect-outliers" && <DetectOutliersModal />}
      {modal === "auto-clean" && <AutoCleanModal />}
    </div>
  );
}
