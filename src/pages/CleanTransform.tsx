import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Filter, Trash2, Edit3, ArrowRightLeft, Type, Sparkles, CheckCircle2, Database,
  X, ChevronDown, Merge, Scissors, SortAsc, Eye,
  MinusSquare, Search, Zap, Undo2, Check, Plus, Minus,
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

function Modal({ title, icon: Icon, onClose, children }: { title: string; icon: any; onClose: () => void; children: React.ReactNode; }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="bg-primary-soft p-1.5 rounded-lg text-primary"><Icon className="w-4 h-4" /></div>
            <h2 className="text-sm font-bold text-textPrimary">{title}</h2>
          </div>
          <button onClick={onClose} className="text-textMuted hover:text-textPrimary transition-colors p-1 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${active ? "bg-primary text-white border-primary" : "bg-surface text-textSecondary border-border hover:border-primary/50 hover:text-textPrimary"}`}>
      {label}
    </button>
  );
}

function SelectInput({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string; }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold text-textPrimary">{label}</label>}
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full border border-border bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8">
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-textMuted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold text-textPrimary">{label}</label>}
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-border bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary placeholder:text-textMuted" />
    </div>
  );
}

function InfoBadge({ text, color = "primary" }: { text: string; color?: "primary" | "warning" | "success" | "danger" }) {
  const cls = { primary: "bg-primary-soft text-primary border-primary/20", warning: "bg-amber-500/15 text-amber-600 border-amber-500/30", success: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", danger: "bg-red-500/15 text-red-600 border-red-500/30" }[color];
  return <div className={`text-xs font-semibold px-3 py-2 rounded-xl border ${cls}`}>{text}</div>;
}

function ActionRow({ onApply, onClose, applyLabel = "Apply" }: { onApply: () => void; onClose: () => void; applyLabel?: string; }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border mt-auto">
      <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-textSecondary bg-primary-soft hover:bg-primary-soft/60 rounded-xl border border-border transition-colors cursor-pointer">Cancel</button>
      <button onClick={() => { onApply(); onClose(); }} className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer">
        <CheckCircle2 className="w-3.5 h-3.5" />{applyLabel}
      </button>
    </div>
  );
}

export function CleanTransform() {
  const { dataset } = useDataset();
  const [activeTab, setActiveTab] = useState("transform");
  const [modal, setModal] = useState<ModalType>(null);
  const [appliedSteps, setAppliedSteps] = useState<AppliedStep[]>(() => [
    { id: uid(), icon: Trash2, name: "Trimmed Whitespace", detail: `Cleaned text fields in ${dataset.name}`, timestamp: "10:30 AM", undo: () => {} },
    { id: uid(), icon: Type, name: "Verified Column Data Types", detail: `${dataset.totalColumns} columns indexed`, timestamp: "10:31 AM", undo: () => {} },
  ]);
  const isUploaded = dataset.status === "active";
  const [workingHeaders, setWorkingHeaders] = useState<string[]>(() => dataset.tableHeaders);
  const [workingRows, setWorkingRows] = useState<Record<string, any>[]>(() => dataset.tableRows);
  const [highlightedCells, setHighlightedCells] = useState<Record<string, boolean>>({});
  const [outlierRows, setOutlierRows] = useState<number[]>([]);

  useEffect(() => {
    setWorkingHeaders(dataset.tableHeaders);
    setWorkingRows(dataset.tableRows);
    setHighlightedCells({});
    setOutlierRows([]);
  }, [dataset]);

  const addStep = useCallback((icon: any, name: string, detail: string, undo: () => void) => {
    const step: AppliedStep = { id: uid(), icon, name, detail, timestamp: nowStr(), undo };
    setAppliedSteps(prev => [step, ...prev]);
    setActiveTab("steps");
  }, []);

  const removeStep = (id: string) => setAppliedSteps(prev => prev.filter(s => s.id !== id));

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
      setWorkingRows(workingRows.filter(row => { const k = cols.map(c => String(row[c] ?? "")).join("||"); if (seen.has(k)) return false; seen.add(k); return true; }));
      addStep(Trash2, "Remove Duplicates", `Removed ${dupes} duplicate row(s)`, () => setWorkingRows(snap));
    };
    return (
      <Modal title="Remove Duplicates" icon={Trash2} onClose={() => setModal(null)}>
        <p className="text-xs text-textSecondary">Select columns to use for detecting duplicates.</p>
        <div><p className="text-xs font-bold text-textPrimary mb-2">Columns</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={cols.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        <InfoBadge text={`${dupes} duplicate row${dupes !== 1 ? "s" : ""} found`} color={dupes > 0 ? "warning" : "success"} />
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
      const restore = () => { setWorkingRows(snap.rows); setWorkingHeaders(snap.headers); };
      if (mode === "rows-any") { setWorkingRows(workingRows.filter(row => !workingHeaders.some(h => isNull(row[h])))); addStep(MinusSquare, "Remove Null Rows", `Removed ${count} row(s) with nulls`, restore); }
      else if (mode === "rows-selected" && selectedCols.length > 0) { setWorkingRows(workingRows.filter(row => !selectedCols.some(h => isNull(row[h])))); addStep(MinusSquare, "Remove Null Rows", `Removed rows with nulls in: ${selectedCols.join(", ")}`, restore); }
      else if (mode === "cols") { const nullCols = workingHeaders.filter(h => workingRows.some(row => isNull(row[h]))); setWorkingHeaders(workingHeaders.filter(h => !nullCols.includes(h))); setWorkingRows(workingRows.map(row => { const r = { ...row }; nullCols.forEach(c => delete r[c]); return r; })); addStep(MinusSquare, "Remove Null Columns", `Removed ${nullCols.length} column(s)`, restore); }
    };
    return (
      <Modal title="Remove Null Values" icon={MinusSquare} onClose={() => setModal(null)}>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-textPrimary">Removal Mode</p>
          {([{ v: "rows-any" as const, l: "Remove rows with any null values" }, { v: "rows-selected" as const, l: "Remove rows with nulls in selected columns" }, { v: "cols" as const, l: "Remove columns containing null values" }]).map(o => (
            <button key={o.v} onClick={() => setMode(o.v)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${mode === o.v ? "bg-primary text-white border-primary" : "border-border text-textSecondary hover:border-primary/50"}`}>
              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${mode === o.v ? "border-white bg-white" : "border-textMuted"}`} />{o.l}
            </button>
          ))}
        </div>
        {mode === "rows-selected" && <div><p className="text-xs font-bold text-textPrimary mb-2">Select Columns</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selectedCols.includes(col)} onClick={() => toggle(col)} />)}</div></div>}
        <InfoBadge text={`${count} ${mode === "cols" ? "column(s)" : "row(s)"} will be removed`} color="warning" />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Remove Nulls" />
      </Modal>
    );
  };

  /* ── 3. Fill Missing Values ── */
  const FillMissingModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [method, setMethod] = useState<"mean" | "median" | "mode" | "zero" | "custom" | "unknown">("mean");
    const [custom, setCustom] = useState("");
    const colNums = useMemo(() => workingRows.map(r => parseFloat(String(r[col]))).filter(n => !isNaN(n)), [col]);
    const numericCol = colNums.length > 0;
    const fillValue = useMemo(() => {
      if (method === "mean" && numericCol) return mean(colNums).toFixed(2);
      if (method === "median" && numericCol) return median(colNums).toFixed(2);
      if (method === "mode" && numericCol) return modeVal(colNums).toString();
      if (method === "zero") return "0"; if (method === "unknown") return "Unknown"; if (method === "custom") return custom;
      return "-";
    }, [method, col, custom, colNums, numericCol]);
    const missingCount = workingRows.filter(r => r[col] === null || r[col] === undefined || String(r[col]).trim() === "").length;
    const apply = () => {
      const snap = [...workingRows]; const hl: Record<string, boolean> = {};
      setWorkingRows(workingRows.map((row, i) => { if (row[col] === null || row[col] === undefined || String(row[col]).trim() === "") { hl[`${i}-${col}`] = true; return { ...row, [col]: fillValue }; } return row; }));
      setHighlightedCells(hl);
      addStep(Sparkles, "Fill Missing Values", `Filled ${missingCount} null(s) in "${col}" with ${method}`, () => { setWorkingRows(snap); setHighlightedCells({}); });
    };
    return (
      <Modal title="Fill Missing Values" icon={Sparkles} onClose={() => setModal(null)}>
        <SelectInput label="Select Column" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-xs font-bold text-textPrimary mb-2">Fill Method</p><div className="flex flex-wrap gap-2">{(["mean", "median", "mode", "zero", "custom", "unknown"] as const).map(m => <Chip key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} active={method === m} onClick={() => setMethod(m)} />)}</div></div>
        {method === "custom" && <TextInput label="Custom Value" value={custom} onChange={setCustom} placeholder="Enter value..." />}
        <InfoBadge text={`Will fill ${missingCount} missing cell(s) in "${col}" with: ${fillValue}`} color={missingCount > 0 ? "primary" : "success"} />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Fill Missing" />
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
      setWorkingHeaders(workingHeaders.map(h => h === oldName ? newName.trim() : h));
      setWorkingRows(workingRows.map(row => { const r = { ...row }; if (oldName in r) { r[newName.trim()] = r[oldName]; delete r[oldName]; } return r; }));
      addStep(Edit3, "Rename Column", `Renamed "${oldName}" to "${newName.trim()}"`, () => { setWorkingHeaders(snapH); setWorkingRows(snapR); });
    };
    return (
      <Modal title="Rename Column" icon={Edit3} onClose={() => setModal(null)}>
        <SelectInput label="Column to Rename" value={oldName} onChange={setOldName} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <TextInput label="New Column Name" value={newName} onChange={setNewName} placeholder="Enter new name..." />
        {isDupe && <InfoBadge text={`Column "${newName}" already exists`} color="danger" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Rename" />
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
    const errors = useMemo(() => workingRows.filter(row => convert(row[col]) === null).length, [col, targetType]);
    const apply = () => {
      const snap = workingRows.map(r => ({ ...r })); const hl: Record<string, boolean> = {};
      setWorkingRows(workingRows.map((row, i) => { const v = convert(row[col]); if (v === null) hl[`${i}-${col}`] = true; return { ...row, [col]: v !== null ? v : row[col] }; }));
      setHighlightedCells(hl);
      addStep(Type, "Change Data Type", `Changed "${col}" to ${targetType}${errors > 0 ? ` (${errors} errors)` : ""}`, () => { setWorkingRows(snap); setHighlightedCells({}); });
    };
    return (
      <Modal title="Change Data Type" icon={Type} onClose={() => setModal(null)}>
        <SelectInput label="Select Column" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-xs font-bold text-textPrimary mb-2">Target Data Type</p><div className="flex flex-wrap gap-2">{types.map(t => <Chip key={t} label={t} active={targetType === t} onClick={() => setTargetType(t)} />)}</div></div>
        {errors > 0 ? <InfoBadge text={`${errors} row(s) will fail conversion and keep original value`} color="warning" /> : <InfoBadge text={`All ${workingRows.length} rows can be converted to ${targetType}`} color="success" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Apply Type Change" />
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
    }, [col, splitBy, custom, fixedLen]);
    const apply = () => {
      const snap = { rows: workingRows.map(r => ({ ...r })), headers: [...workingHeaders] };
      const nc = preview.map((_, i) => `${col}_${i + 1}`);
      setWorkingHeaders([...workingHeaders.filter(h => h !== col), ...nc]);
      setWorkingRows(workingRows.map(row => {
        const r = { ...row }; const val = String(r[col] ?? ""); let parts: string[];
        if (splitBy === "fixed") { const len = parseInt(fixedLen) || 5; parts = []; for (let i = 0; i < val.length; i += len) parts.push(val.slice(i, i + len)); } else { parts = val.split(delim); }
        delete r[col]; nc.forEach((c, i) => { r[c] = parts[i] ?? ""; }); return r;
      }));
      addStep(Scissors, "Split Column", `Split "${col}" into ${nc.length} columns`, () => { setWorkingHeaders(snap.headers); setWorkingRows(snap.rows); });
    };
    return (
      <Modal title="Split Column" icon={Scissors} onClose={() => setModal(null)}>
        <SelectInput label="Column to Split" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-xs font-bold text-textPrimary mb-2">Split By</p><div className="flex flex-wrap gap-2">{(["space", "comma", "dash", "custom", "fixed"] as const).map(s => <Chip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={splitBy === s} onClick={() => setSplitBy(s)} />)}</div></div>
        {splitBy === "custom" && <TextInput label="Custom Delimiter" value={custom} onChange={setCustom} placeholder="e.g. |" />}
        {splitBy === "fixed" && <TextInput label="Fixed Length (chars)" value={fixedLen} onChange={setFixedLen} placeholder="5" />}
        {preview.length > 0 && <div className="bg-primary-soft/20 rounded-xl p-3 border border-border"><p className="text-xs font-bold text-textPrimary mb-1">Preview (first row)</p><div className="flex flex-wrap gap-1.5">{preview.map((p, i) => <span key={i} className="px-2 py-0.5 bg-surface border border-border rounded-lg text-xs font-mono text-textPrimary">{p}</span>)}</div></div>}
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
      setWorkingRows(workingRows.map(row => { const r = { ...row }; r[newName] = selected.map(c => String(r[c] ?? "")).join(sep); if (removeOrig) selected.forEach(c => { if (c !== newName) delete r[c]; }); return r; }));
      setWorkingHeaders([...(removeOrig ? workingHeaders.filter(h => !selected.includes(h)) : workingHeaders), newName]);
      addStep(Merge, "Merge Columns", `Merged ${selected.join(" + ")} into "${newName}"`, () => { setWorkingRows(snap.rows); setWorkingHeaders(snap.headers); });
    };
    return (
      <Modal title="Merge Columns" icon={Merge} onClose={() => setModal(null)}>
        <div><p className="text-xs font-bold text-textPrimary mb-2">Select Columns to Merge (min 2)</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selected.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        <div><p className="text-xs font-bold text-textPrimary mb-2">Separator</p><div className="flex flex-wrap gap-2">{[" ", ",", "-", "_"].map(s => <Chip key={s} label={s === " " ? "Space" : s} active={sep === s} onClick={() => setSep(s)} />)}</div></div>
        <TextInput label="New Column Name" value={newName} onChange={setNewName} />
        <button onClick={() => setRemoveOrig(!removeOrig)} className="flex items-center gap-2 text-xs font-semibold text-textSecondary cursor-pointer">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${removeOrig ? "bg-primary border-primary" : "border-border"}`}>{removeOrig && <Check className="w-2.5 h-2.5 text-white" />}</div>
          Remove original columns after merging
        </button>
        {preview && <InfoBadge text={`Preview: "${preview}"`} color="primary" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Merge Columns" />
      </Modal>
    );
  };

  /* ── 8. Filter Rows ── */
  const FilterRowsModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [op, setOp] = useState("equals");
    const [val, setVal] = useState("");
    const ops = [{ value: "equals", label: "Equals" }, { value: "not-equals", label: "Not Equals" }, { value: "greater", label: "Greater Than" }, { value: "less", label: "Less Than" }, { value: "contains", label: "Contains" }, { value: "starts-with", label: "Starts With" }, { value: "ends-with", label: "Ends With" }, { value: "is-empty", label: "Is Empty" }, { value: "is-not-empty", label: "Is Not Empty" }];
    const matches = (row: Record<string, any>) => {
      const v = String(row[col] ?? "");
      switch (op) { case "equals": return v === val; case "not-equals": return v !== val; case "greater": return parseFloat(v) > parseFloat(val); case "less": return parseFloat(v) < parseFloat(val); case "contains": return v.includes(val); case "starts-with": return v.startsWith(val); case "ends-with": return v.endsWith(val); case "is-empty": return v.trim() === ""; case "is-not-empty": return v.trim() !== ""; default: return true; }
    };
    const cnt = workingRows.filter(matches).length;
    const apply = () => { const snap = [...workingRows]; setWorkingRows(workingRows.filter(matches)); addStep(Filter, "Filter Rows", `Kept ${cnt} row(s) where "${col}" ${op} "${val}"`, () => setWorkingRows(snap)); };
    return (
      <Modal title="Filter Rows" icon={Filter} onClose={() => setModal(null)}>
        <SelectInput label="Column" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <SelectInput label="Operator" value={op} onChange={setOp} options={ops} />
        {!["is-empty", "is-not-empty"].includes(op) && <TextInput label="Value" value={val} onChange={setVal} placeholder="Filter value..." />}
        <InfoBadge text={`${cnt} of ${workingRows.length} row(s) match this filter`} color="primary" />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Apply Filter" />
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
      setWorkingRows([...workingRows].sort((a, b) => { for (const { col, dir } of sorts) { const na = parseFloat(String(a[col])); const nb = parseFloat(String(b[col])); const cmp = (!isNaN(na) && !isNaN(nb)) ? na - nb : String(a[col]).localeCompare(String(b[col])); if (cmp !== 0) return dir === "asc" ? cmp : -cmp; } return 0; }));
      addStep(SortAsc, "Sort Rows", `Sorted by ${sorts.map(s => `${s.col} (${s.dir})`).join(", ")}`, () => setWorkingRows(snap));
    };
    return (
      <Modal title="Sort Rows" icon={SortAsc} onClose={() => setModal(null)}>
        <div className="flex flex-col gap-3">
          {sorts.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 relative"><select value={s.col} onChange={e => updateSort(i, "col", e.target.value)} className="w-full border border-border bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer pr-7">{workingHeaders.map(h => <option key={h} value={h}>{h}</option>)}</select><ChevronDown className="w-3 h-3 text-textMuted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
              <div className="relative"><select value={s.dir} onChange={e => updateSort(i, "dir", e.target.value)} className="border border-border bg-surface text-textPrimary rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer pr-7"><option value="asc">Ascending</option><option value="desc">Descending</option></select><ChevronDown className="w-3 h-3 text-textMuted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
              {i > 0 && <button onClick={() => removeSort(i)} className="text-textMuted hover:text-red-500 cursor-pointer"><Minus className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
        <button onClick={addSort} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Sort Level</button>
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Sort Rows" />
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
      setWorkingHeaders(workingHeaders.filter(h => !selected.includes(h)));
      setWorkingRows(workingRows.map(row => { const r = { ...row }; selected.forEach(c => delete r[c]); return r; }));
      addStep(Trash2, "Remove Columns", `Removed: ${selected.join(", ")}`, () => { setWorkingRows(snap.rows); setWorkingHeaders(snap.headers); });
    };
    return (
      <Modal title="Remove Columns" icon={Trash2} onClose={() => setModal(null)}>
        <p className="text-xs text-textSecondary">Select one or more columns to permanently remove.</p>
        <div><p className="text-xs font-bold text-textPrimary mb-2">Columns ({selected.length} selected)</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selected.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        {selected.length > 0 && <InfoBadge text={`${selected.length} column(s) will be permanently removed`} color="danger" />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Remove Columns" />
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
    const cnt = useMemo(() => { if (!find) return 0; let c = 0; workingRows.forEach(row => cols.forEach(col => { const v = matchCase ? String(row[col] ?? "") : String(row[col] ?? "").toLowerCase(); c += v.split(matchCase ? find : find.toLowerCase()).length - 1; })); return c; }, [find, matchCase, cols]);
    const apply = () => {
      if (!find) return;
      const snap = workingRows.map(r => ({ ...r })); const hl: Record<string, boolean> = {};
      const esc = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(esc, (matchCase ? "" : "i") + (replaceAll ? "g" : ""));
      setWorkingRows(workingRows.map((row, i) => { const r = { ...row }; cols.forEach(col => { const v = String(r[col] ?? ""); const check = matchCase ? v : v.toLowerCase(); if (check.includes(matchCase ? find : find.toLowerCase())) { hl[`${i}-${col}`] = true; r[col] = v.replace(rx, replace); } }); return r; }));
      setHighlightedCells(hl);
      addStep(Search, "Find and Replace", `Replaced "${find}" with "${replace}" (${cnt} match${cnt !== 1 ? "es" : ""})`, () => { setWorkingRows(snap); setHighlightedCells({}); });
    };
    return (
      <Modal title="Find and Replace" icon={ArrowRightLeft} onClose={() => setModal(null)}>
        <TextInput label="Find" value={find} onChange={setFind} placeholder="Search value..." />
        <TextInput label="Replace With" value={replace} onChange={setReplace} placeholder="Replacement value..." />
        <div className="flex items-center gap-4">
          {([{ v: matchCase, fn: () => setMatchCase(!matchCase), l: "Match Case" }, { v: replaceAll, fn: () => setReplaceAll(!replaceAll), l: "Replace All" }] as const).map((o, idx) => (
            <button key={idx} onClick={o.fn} className="flex items-center gap-2 text-xs font-semibold text-textSecondary cursor-pointer">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${o.v ? "bg-primary border-primary" : "border-border"}`}>{o.v && <Check className="w-2.5 h-2.5 text-white" />}</div>{o.l}
            </button>
          ))}
        </div>
        <div><p className="text-xs font-bold text-textPrimary mb-2">Restrict to Columns (optional)</p><div className="flex flex-wrap gap-2">{workingHeaders.map(col => <Chip key={col} label={col} active={selCols.includes(col)} onClick={() => toggle(col)} />)}</div></div>
        {find && <InfoBadge text={`Found ${cnt} occurrence(s) across ${cols.length} column(s)`} color={cnt > 0 ? "primary" : "success"} />}
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Replace" />
      </Modal>
    );
  };

  /* ── 12. Detect Outliers ── */
  const DetectOutliersModal = () => {
    const [col, setCol] = useState(workingHeaders[0] || "");
    const [method, setMethod] = useState<"iqr" | "zscore">("iqr");
    const [action, setAction] = useState<"remove" | "keep" | "replace-mean" | "replace-median">("remove");
    const numRows = useMemo(() => workingRows.map((row, i) => ({ val: parseFloat(String(row[col] ?? "")), i })).filter(r => !isNaN(r.val)), [col]);
    const vals = numRows.map(r => r.val);
    const outIdx = useMemo(() => {
      if (vals.length < 4) return [];
      if (method === "iqr") { const s = [...vals].sort((a, b) => a - b); const q1 = s[Math.floor(s.length * 0.25)]; const q3 = s[Math.floor(s.length * 0.75)]; const iqr = q3 - q1; return numRows.filter(r => r.val < q1 - 1.5 * iqr || r.val > q3 + 1.5 * iqr).map(r => r.i); }
      const m = mean(vals); const std = Math.sqrt(vals.map(v => (v - m) ** 2).reduce((a, b) => a + b, 0) / vals.length);
      return numRows.filter(r => Math.abs(r.val - m) > 3 * std).map(r => r.i);
    }, [col, method]);
    useEffect(() => { setOutlierRows(outIdx); return () => setOutlierRows([]); }, [outIdx]);
    const apply = () => {
      const snap = workingRows.map(r => ({ ...r })); const hl: Record<string, boolean> = {}; let rows = [...workingRows];
      const m = vals.length > 0 ? mean(vals) : 0; const med = vals.length > 0 ? median(vals) : 0;
      if (action === "remove") { rows = rows.filter((_, i) => !outIdx.includes(i)); }
      else if (action === "replace-mean" || action === "replace-median") { const rv = action === "replace-mean" ? m.toFixed(2) : med.toFixed(2); rows = rows.map((row, i) => { if (outIdx.includes(i)) { hl[`${i}-${col}`] = true; return { ...row, [col]: rv }; } return row; }); }
      setWorkingRows(rows); setHighlightedCells(hl); setOutlierRows([]);
      addStep(Eye, "Detect Outliers", `${action} ${outIdx.length} outlier(s) in "${col}" (${method.toUpperCase()})`, () => { setWorkingRows(snap); setHighlightedCells({}); setOutlierRows([]); });
    };
    return (
      <Modal title="Detect Outliers" icon={Eye} onClose={() => setModal(null)}>
        <SelectInput label="Column" value={col} onChange={setCol} options={workingHeaders.map(h => ({ value: h, label: h }))} />
        <div><p className="text-xs font-bold text-textPrimary mb-2">Detection Method</p><div className="flex gap-2"><Chip label="IQR" active={method === "iqr"} onClick={() => setMethod("iqr")} /><Chip label="Z-Score" active={method === "zscore"} onClick={() => setMethod("zscore")} /></div></div>
        <div><p className="text-xs font-bold text-textPrimary mb-2">Action for Outliers</p><div className="flex flex-wrap gap-2"><Chip label="Remove" active={action === "remove"} onClick={() => setAction("remove")} /><Chip label="Keep (Highlight)" active={action === "keep"} onClick={() => setAction("keep")} /><Chip label="Replace with Mean" active={action === "replace-mean"} onClick={() => setAction("replace-mean")} /><Chip label="Replace with Median" active={action === "replace-median"} onClick={() => setAction("replace-median")} /></div></div>
        <InfoBadge text={vals.length < 4 ? `"${col}" has no numeric data` : `${outIdx.length} outlier(s) detected (${method.toUpperCase()})`} color={outIdx.length > 0 ? "warning" : "success"} />
        <ActionRow onApply={apply} onClose={() => setModal(null)} applyLabel="Apply Outlier Action" />
      </Modal>
    );
  };

  /* ── 13. Auto Clean ── */
  const AutoCleanModal = () => {
    const isNull = (v: any) => v === null || v === undefined || String(v).trim() === "";
    const suggestions = useMemo(() => {
      const list: { id: string; icon: any; title: string; detail: string; action: () => void }[] = [];
      const seen = new Set<string>(); let dupes = 0;
      workingRows.forEach(row => { const key = workingHeaders.map(h => String(row[h] ?? "")).join("||"); if (seen.has(key)) dupes++; else seen.add(key); });
      if (dupes > 0) list.push({ id: "dupes", icon: Trash2, title: `Remove ${dupes} Duplicate Rows`, detail: "Identical rows detected across all columns",
        action: () => { const s = new Set<string>(); const snap = [...workingRows]; setWorkingRows(workingRows.filter(row => { const k = workingHeaders.map(h => String(row[h] ?? "")).join("||"); if (s.has(k)) return false; s.add(k); return true; })); addStep(Trash2, "Auto Clean: Duplicates", `Removed ${dupes} rows`, () => setWorkingRows(snap)); } });
      let nullCnt = 0; workingHeaders.forEach(h => workingRows.forEach(row => { if (isNull(row[h])) nullCnt++; }));
      if (nullCnt > 0) list.push({ id: "nulls", icon: MinusSquare, title: `Fill ${nullCnt} Missing Values`, detail: "Null/empty cells found — will fill with 'Unknown'",
        action: () => { const snap = workingRows.map(r => ({ ...r })); const hl: Record<string, boolean> = {}; setWorkingRows(workingRows.map((row, i) => { const r = { ...row }; workingHeaders.forEach(h => { if (isNull(r[h])) { hl[`${i}-${h}`] = true; r[h] = "Unknown"; } }); return r; })); setHighlightedCells(hl); addStep(MinusSquare, "Auto Clean: Fill Nulls", `Filled ${nullCnt} cells`, () => { setWorkingRows(snap); setHighlightedCells({}); }); } });
      if (list.length === 0) list.push({ id: "ok", icon: CheckCircle2, title: "Dataset looks clean!", detail: "No duplicates or missing values detected", action: () => {} });
      return list;
    }, []);
    const [applied, setApplied] = useState<string[]>([]);
    const applyAll = () => { suggestions.filter(s => s.id !== "ok").forEach(s => s.action()); setApplied(suggestions.map(s => s.id)); setModal(null); };
    return (
      <Modal title="AI Auto Clean Suggestions" icon={Sparkles} onClose={() => setModal(null)}>
        <p className="text-xs text-textSecondary">DataVista analyzed your dataset. Apply suggestions individually or all at once.</p>
        <div className="flex flex-col gap-2">
          {suggestions.map(s => (
            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${applied.includes(s.id) ? "bg-emerald-500/10 border-emerald-500/30" : "bg-surface border-border"}`}>
              <div className="bg-primary-soft p-1.5 rounded-lg text-primary shrink-0"><s.icon className="w-4 h-4" /></div>
              <div className="flex-1"><p className="text-xs font-bold text-textPrimary">{s.title}</p><p className="text-xs text-textSecondary mt-0.5">{s.detail}</p></div>
              {s.id !== "ok" && !applied.includes(s.id) && <button onClick={() => { s.action(); setApplied(prev => [...prev, s.id]); }} className="px-3 py-1.5 text-xs font-bold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-xl border border-primary/30 transition-all cursor-pointer flex-shrink-0">Apply</button>}
              {applied.includes(s.id) && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            </div>
          ))}
        </div>
        {suggestions.some(s => s.id !== "ok") && (
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-xs font-bold text-textSecondary bg-primary-soft hover:bg-primary-soft/60 rounded-xl border border-border transition-colors cursor-pointer">Close</button>
            <button onClick={applyAll} className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"><Zap className="w-3.5 h-3.5" /> Apply All</button>
          </div>
        )}
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
    { icon: ArrowRightLeft, name: "Find and Replace", desc: "Replace specific values with match-case support", modal: "find-replace" as ModalType },
    { icon: Eye, name: "Detect Outliers", desc: "Find and handle outliers using IQR or Z-Score", modal: "detect-outliers" as ModalType },
    { icon: Zap, name: "Auto Clean", desc: "AI-powered data cleaning suggestions", modal: "auto-clean" as ModalType },
  ];

  const discardChanges = () => {
    setWorkingHeaders(dataset.tableHeaders); setWorkingRows(dataset.tableRows); setHighlightedCells({}); setOutlierRows([]);
    setAppliedSteps([
      { id: uid(), icon: Trash2, name: "Trimmed Whitespace", detail: `Cleaned text fields in ${dataset.name}`, timestamp: nowStr(), undo: () => {} },
      { id: uid(), icon: Type, name: "Verified Column Data Types", detail: `${dataset.totalColumns} columns indexed`, timestamp: nowStr(), undo: () => {} },
    ]);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Clean &amp; Transform</h1>
          <p className="text-sm text-textSecondary">Prepare your dataset for analysis and visualization.</p>
        </div>
        {isUploaded && (
          <div className="flex gap-3">
            <button onClick={discardChanges} className="px-4 py-2 bg-primary-soft text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/60 transition-colors border border-border cursor-pointer">Discard Changes</button>
            <button onClick={() => setActiveTab("steps")} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
              <CheckCircle2 className="w-4 h-4" />Apply Steps
            </button>
          </div>
        )}
      </div>

      {isUploaded ? (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          <Card className="lg:w-80 h-fit flex-shrink-0">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex space-x-4">
                <button className={`text-xs font-bold pb-2 border-b-2 transition-colors ${activeTab === "transform" ? "border-primary text-primary" : "border-transparent text-textSecondary"}`} onClick={() => setActiveTab("transform")}>Transform</button>
                <button className={`text-xs font-bold pb-2 border-b-2 transition-colors ${activeTab === "steps" ? "border-primary text-primary" : "border-transparent text-textSecondary"}`} onClick={() => setActiveTab("steps")}>Applied Steps ({appliedSteps.length})</button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {activeTab === "transform" ? (
                <div className="flex flex-col gap-2">
                  {operations.map((op, idx) => (
                    <button key={idx} onClick={() => setModal(op.modal)} className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary-soft/30 transition-all text-left border border-transparent hover:border-border cursor-pointer">
                      <div className="mt-0.5 bg-primary-soft p-1.5 rounded-lg text-primary flex-shrink-0"><op.icon className="w-4 h-4" /></div>
                      <div><p className="text-xs font-bold text-textPrimary">{op.name}</p><p className="text-xs text-textSecondary mt-0.5 leading-snug">{op.desc}</p></div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {appliedSteps.length === 0 && <p className="text-xs text-textSecondary text-center py-4">No steps applied yet.</p>}
                  {appliedSteps.map(step => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                      <div className="bg-primary-soft p-1.5 rounded-lg text-primary shadow-xs flex-shrink-0"><step.icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-textPrimary truncate">{step.name}</p>
                        <p className="text-xs text-textSecondary truncate">{step.detail}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button title="Undo" onClick={() => { step.undo(); removeStep(step.id); }} className="p-1 rounded-lg hover:bg-primary-soft/40 text-textMuted hover:text-primary transition-colors cursor-pointer"><Undo2 className="w-3.5 h-3.5" /></button>
                        <button title="Remove" onClick={() => removeStep(step.id)} className="p-1 rounded-lg hover:bg-red-500/10 text-textMuted hover:text-red-500 transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col min-w-0">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Data Preview - {dataset.name}</CardTitle>
              <span className="text-xs text-textSecondary bg-primary-soft/30 px-2.5 py-1 rounded-full border border-border font-semibold">{workingRows.length} rows loaded</span>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-primary-soft/20 text-textSecondary sticky top-0 shadow-xs border-b border-border">
                  <tr>{workingHeaders.map((header, idx) => <th key={idx} className="px-4 py-3 font-bold uppercase tracking-wider">{header}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {workingRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={`hover:bg-primary-soft/10 transition-colors ${outlierRows.includes(rowIdx) ? "bg-amber-500/10" : ""}`}>
                      {workingHeaders.map((header, colIdx) => (
                        <td key={colIdx} className={`px-4 py-3 font-medium transition-colors ${highlightedCells[`${rowIdx}-${header}`] ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "text-textPrimary"}`}>
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
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-border bg-surface">
          <Database className="w-16 h-16 text-textMuted stroke-[1.5]" />
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
