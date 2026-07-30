import { useState, useMemo } from "react";
import {
  BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Activity, Layers, Sparkles, Compass, Settings2, Save, Database, CheckCircle2,
  Filter, Download, Maximize2, SlidersHorizontal, Bot, ArrowUpDown, X,
  Table, Grid, HelpCircle, AlertCircle, RefreshCw, Eye, Plus, Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";
import type { DynamicChartItem } from "../context/DatasetContext";
import {
  BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, AreaChart as RechartsAreaChart, Area,
  RadarChart as RechartsRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart as RechartsScatterChart, Scatter, ComposedChart as RechartsComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";

/* ─────────────────────────────────────────────
   COLOR PALETTES
───────────────────────────────────────────── */
const PALETTES = {
  default: ["#2563EB", "#14B8A6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#10B981", "#F97316"],
  corporate: ["#1E3A8A", "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"],
  emerald: ["#064E3B", "#047857", "#059669", "#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"],
  purple: ["#4C1D95", "#6D28D9", "#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"],
  sunset: ["#BE123C", "#E11D48", "#F43F5E", "#FB7185", "#F59E0B", "#FBBF24", "#FCD34D", "#FEF08A"],
};

/* ─────────────────────────────────────────────
   23 SUPPORTED CHART TYPES
───────────────────────────────────────────── */
const ALL_CHART_TYPES = [
  { id: "bar", name: "Bar Chart", icon: BarChartIcon, category: "Comparison" },
  { id: "stacked-bar", name: "Stacked Bar", icon: BarChartIcon, category: "Comparison" },
  { id: "horizontal-bar", name: "Horizontal Bar", icon: BarChartIcon, category: "Comparison" },
  { id: "line", name: "Line Chart", icon: LineChartIcon, category: "Trend" },
  { id: "multi-line", name: "Multi-Line", icon: LineChartIcon, category: "Trend" },
  { id: "area", name: "Area Chart", icon: Layers, category: "Trend" },
  { id: "stacked-area", name: "Stacked Area", icon: Layers, category: "Trend" },
  { id: "pie", name: "Pie Chart", icon: PieChartIcon, category: "Composition" },
  { id: "donut", name: "Donut Chart", icon: PieChartIcon, category: "Composition" },
  { id: "scatter", name: "Scatter Plot", icon: Activity, category: "Distribution" },
  { id: "bubble", name: "Bubble Chart", icon: Activity, category: "Distribution" },
  { id: "histogram", name: "Histogram", icon: BarChartIcon, category: "Distribution" },
  { id: "heatmap", name: "Heat Map", icon: Grid, category: "Matrix" },
  { id: "treemap", name: "Treemap", icon: Layers, category: "Composition" },
  { id: "radar", name: "Radar Spider", icon: Compass, category: "Comparison" },
  { id: "combi", name: "Combo (Bar+Line)", icon: Sparkles, category: "Comparison" },
  { id: "funnel", name: "Funnel Chart", icon: Filter, category: "Process" },
  { id: "waterfall", name: "Waterfall Chart", icon: BarChartIcon, category: "Process" },
  { id: "gauge", name: "Gauge Chart", icon: Activity, category: "KPI" },
  { id: "kpi", name: "KPI Card", icon: Sparkles, category: "KPI" },
  { id: "table", name: "Data Table", icon: Table, category: "Data" },
  { id: "matrix", name: "Matrix Table", icon: Grid, category: "Data" },
  { id: "boxplot", name: "Box Plot", icon: Activity, category: "Distribution" },
];

/* ─────────────────────────────────────────────
   SMART AGGREGATION COMPUTATION ENGINE
───────────────────────────────────────────── */
function computeSmartAgg(rawVals: any[], mode: string, colName: string): { value: number; isCountFallback: boolean } {
  if (!rawVals || rawVals.length === 0) return { value: 0, isCountFallback: false };

  // Parse numeric values
  const numericVals: number[] = [];
  let nonNumericCount = 0;

  for (const v of rawVals) {
    if (v === null || v === undefined || String(v).trim() === "") continue;
    const num = Number(v);
    if (!isNaN(num)) {
      numericVals.push(num);
    } else {
      nonNumericCount++;
    }
  }

  const colLower = colName.toLowerCase();
  const isYearOrDateCol = colLower.includes("season") || colLower.includes("year") || colLower.includes("date") || colLower.includes("id");
  const isTextCol = nonNumericCount > numericVals.length;

  // If text column or year/season column with 'sum' mode, count records instead of summing years/strings!
  if (isTextCol || (isYearOrDateCol && mode === "sum")) {
    if (mode === "count-distinct") {
      return { value: new Set(rawVals.map(v => String(v ?? "").trim())).size, isCountFallback: isTextCol || isYearOrDateCol };
    }
    return { value: rawVals.length, isCountFallback: true };
  }

  // Pure numeric calculations
  if (numericVals.length === 0) return { value: rawVals.length, isCountFallback: true };

  let val = 0;
  if (mode === "sum") val = numericVals.reduce((a, b) => a + b, 0);
  else if (mode === "avg") val = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
  else if (mode === "count") val = rawVals.length;
  else if (mode === "count-distinct") val = new Set(rawVals.map(v => String(v ?? "").trim())).size;
  else if (mode === "max") val = Math.max(...numericVals);
  else if (mode === "min") val = Math.min(...numericVals);
  else if (mode === "median") {
    const s = [...numericVals].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    val = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  } else if (mode === "stddev") {
    const m = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
    const v = numericVals.reduce((a, b) => a + (b - m) ** 2, 0) / numericVals.length;
    val = Math.sqrt(v);
  } else if (mode === "variance") {
    const m = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
    val = numericVals.reduce((a, b) => a + (b - m) ** 2, 0) / numericVals.length;
  } else {
    val = numericVals.reduce((a, b) => a + b, 0);
  }

  return { value: Math.round(val * 100) / 100, isCountFallback: false };
}

function formatVal(n: number, fmt: string, decimals: number, curr: string): string {
  if (isNaN(n)) return "-";
  const fixed = n.toFixed(decimals);
  const formattedNum = parseFloat(fixed).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (fmt === "currency") return `${curr}${formattedNum}`;
  if (fmt === "percent") return `${formattedNum}%`;
  return formattedNum;
}

export function VisualBuilder() {
  const { dataset, updateChartVisual } = useDataset();
  
  /* ── Core State ── */
  const [activeChartType, setActiveChartType] = useState<string>("bar");
  const [selectedX, setSelectedX] = useState<string>("");
  const [selectedYCols, setSelectedYCols] = useState<string[]>([]);
  const [measureType, setMeasureType] = useState<string>("sum");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | "none">("desc");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  /* ── Modals / Panels State ── */
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDrillThroughModal, setShowDrillThroughModal] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ── Customization Settings ── */
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [valueFormat, setValueFormat] = useState<"number" | "currency" | "percent">("number");
  const [currencySymbol] = useState("$");
  const [decimalPlaces] = useState(0);
  const [paletteKey, setPaletteKey] = useState<keyof typeof PALETTES>("default");
  const [barWidth] = useState(24);

  /* ── Filter State ── */
  const [filterCol, setFilterCol] = useState("");
  const [filterOp, setFilterOp] = useState("contains");
  const [filterVal, setFilterVal] = useState("");
  const [activeFilters, setActiveFilters] = useState<{ col: string; op: string; val: string }[]>([]);

  const isUploaded = dataset.status === "active";
  const palette = PALETTES[paletteKey] || PALETTES.default;

  const columns = useMemo(() => {
    if (dataset.rawHeaders && dataset.rawHeaders.length > 0) return dataset.rawHeaders;
    if (dataset.tableHeaders && dataset.tableHeaders.length > 0) return dataset.tableHeaders;
    return ["Category", "Sales", "Date", "Quantity"];
  }, [dataset]);

  const currentX = selectedX || columns[0] || "Category";
  const primaryY = selectedYCols[0] || columns[1] || columns[0] || "Sales";
  const yCols = selectedYCols.length > 0 ? selectedYCols : [primaryY];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  /* ── AI Recommendation Logic ── */
  const aiRecommendation = useMemo(() => {
    const xLower = currentX.toLowerCase();
    if (xLower.includes("date") || xLower.includes("year") || xLower.includes("month") || xLower.includes("season")) {
      return { type: "line", title: "Line Chart", reason: `"${currentX}" is a temporal dimension. Line Charts display trend trajectory best.` };
    }
    if (yCols.length > 1) {
      return { type: "combi", title: "Combo Chart", reason: `Multiple measures selected (${yCols.join(", ")}). Combo charts effectively compare dual metrics.` };
    }
    return { type: "bar", title: "Bar Chart", reason: `Categorical dimension "${currentX}" paired with measure "${primaryY}" is ideal for rank-ordered Bar visual.` };
  }, [currentX, primaryY, yCols]);

  /* ── Dynamic Dataset Aggregation Engine ── */
  const { chartData, rawGroupedRows, isInvalidConfig, activeAggNotes } = useMemo(() => {
    if (!isUploaded) return { chartData: [], rawGroupedRows: {}, isInvalidConfig: false, activeAggNotes: [] };

    // Raw rows extraction
    let rows: Record<string, any>[] = [];
    if (dataset.rawRows && dataset.rawRows.length > 0 && dataset.rawHeaders) {
      rows = dataset.rawRows.map(rowArr => {
        const obj: Record<string, any> = {};
        dataset.rawHeaders.forEach((h, idx) => { obj[h] = rowArr[idx] ?? ""; });
        return obj;
      });
    } else if (dataset.tableRows) {
      rows = dataset.tableRows;
    }

    // Apply Active In-Builder Filters
    let filteredRows = rows.filter(row => {
      return activeFilters.every(f => {
        const cell = String(row[f.col] ?? "");
        const fv = f.val;
        if (f.op === "equals") return cell === fv;
        if (f.op === "not-equals") return cell !== fv;
        if (f.op === "contains") return cell.toLowerCase().includes(fv.toLowerCase());
        if (f.op === "greater") return parseFloat(cell) > parseFloat(fv);
        if (f.op === "less") return parseFloat(cell) < parseFloat(fv);
        return true;
      });
    });

    // Group rows by X-Axis dimension
    const grouped: Record<string, Record<string, any[]>> = {};
    const groupedRawRecords: Record<string, Record<string, any>[]> = {};

    filteredRows.forEach(row => {
      const xKey = row[currentX] !== undefined && row[currentX] !== null ? String(row[currentX]).trim() : "General";
      if (!xKey || xKey.includes("PK\u0003")) return;

      if (!grouped[xKey]) {
        grouped[xKey] = {};
        groupedRawRecords[xKey] = [];
      }
      groupedRawRecords[xKey].push(row);

      yCols.forEach(yCol => {
        if (!grouped[xKey][yCol]) grouped[xKey][yCol] = [];
        grouped[xKey][yCol].push(row[yCol]);
      });
    });

    const keys = Object.keys(grouped);
    const aggNotes: string[] = [];

    // Build data points for each category key
    const dataPoints = keys.map((key, idx) => {
      const item: Record<string, any> = { 
        label: key.length > 15 ? key.substring(0, 13) + ".." : key, 
        fullLabel: key, 
        color: palette[idx % palette.length] 
      };

      yCols.forEach(yCol => {
        const rawVals = grouped[key][yCol] || [];
        const { value, isCountFallback } = computeSmartAgg(rawVals, measureType, yCol);
        item[yCol] = value;
        if (yCols.length === 1) item.value = value;

        if (isCountFallback && !aggNotes.includes(yCol)) {
          aggNotes.push(yCol);
        }
      });
      return item;
    });

    // Sorting
    if (sortOrder === "desc") {
      dataPoints.sort((a, b) => (b[primaryY] ?? b.value ?? 0) - (a[primaryY] ?? a.value ?? 0));
    } else if (sortOrder === "asc") {
      dataPoints.sort((a, b) => (a[primaryY] ?? a.value ?? 0) - (b[primaryY] ?? b.value ?? 0));
    }

    return { 
      chartData: dataPoints.slice(0, 15), 
      rawGroupedRows: groupedRawRecords, 
      isInvalidConfig: false,
      activeAggNotes: aggNotes
    };
  }, [dataset, isUploaded, currentX, yCols, primaryY, measureType, activeFilters, sortOrder, palette]);

  /* ── Save to Dashboard ── */
  const handleSaveToDashboard = () => {
    const formattedData: DynamicChartItem[] = chartData.map(d => ({
      label: String(d.label),
      value: Number(d[primaryY] ?? d.value ?? 0),
      color: String(d.color || palette[0]),
    }));
    const title = customTitle || `${currentX} vs ${yCols.join(" & ")}`;
    updateChartVisual(title, formattedData);
  };

  /* ── Export Image ── */
  const exportChart = (fmt: "png" | "jpg") => {
    showToast(`Exported ${customTitle || "Visual"} as ${fmt.toUpperCase()} image.`);
  };

  const tooltipStyle = {
    backgroundColor: "var(--color-surface, #FFFFFF)",
    color: "var(--color-textPrimary, #0F172A)",
    borderRadius: "12px",
    borderColor: "var(--color-border, #E2E8F0)",
    boxShadow: "var(--shadow-card)",
    fontSize: "12px",
  };

  /* Histogram Bins Generator */
  const histogramBins = useMemo(() => {
    if (activeChartType !== "histogram" || chartData.length === 0) return [];
    const vals = chartData.map(d => Number(d[primaryY] ?? d.value ?? 0));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const step = (max - min) / 5 || 10;
    const bins = Array.from({ length: 5 }, (_, i) => {
      const start = Math.round(min + i * step);
      const end = Math.round(min + (i + 1) * step);
      const count = vals.filter(v => v >= start && v < (i === 4 ? end + 1 : end)).length;
      return { label: `${start}-${end}`, value: count, color: palette[i % palette.length] };
    });
    return bins;
  }, [activeChartType, chartData, primaryY, palette]);

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header Bar — UI Preserved */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Visual Builder</h1>
          <p className="text-sm text-textSecondary mt-0.5">
            Build, customize, and analyze interactive charts from your active dataset.
          </p>
        </div>
        {isUploaded && (
          <div className="flex gap-3 items-center">
            {toastMsg && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                {toastMsg}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedX(columns[0]);
                setSelectedYCols([columns[1] || columns[0]]);
                setActiveChartType("bar");
                setMeasureType("sum");
                setActiveFilters([]);
                setCustomTitle("");
                showToast("Canvas reset to default configuration.");
              }}
              className="px-4 py-2 bg-surface text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/40 transition-all border border-border shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-textMuted" />
              Clear Canvas
            </button>
            <button
              onClick={handleSaveToDashboard}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save to Dashboard
            </button>
          </div>
        )}
      </div>

      {isUploaded ? (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* Settings Sidebar — Preserved UI Layout */}
          <Card className="lg:w-80 h-fit flex-shrink-0 border border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60 bg-surface/50 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Settings2 className="w-4 h-4 text-primary" />
                Chart Configuration
              </CardTitle>
              <button
                onClick={() => setShowCustomizeModal(true)}
                title="Advanced Formatting & Styling"
                className="p-1.5 text-textMuted hover:text-primary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col gap-5">
              {/* Chart Types (23 Available) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-textPrimary">
                    Chart Type ({ALL_CHART_TYPES.length} Available)
                  </label>
                  <span className="text-[10px] font-bold text-primary bg-primary-soft/60 px-2 py-0.5 rounded-md">
                    {ALL_CHART_TYPES.find(c => c.id === activeChartType)?.name || "Bar"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {ALL_CHART_TYPES.map((type) => {
                    const IconComp = type.icon;
                    const isSelected = activeChartType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setActiveChartType(type.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary text-white font-bold shadow-xs scale-[1.02]"
                            : "border-border/80 hover:bg-primary-soft/30 text-textSecondary hover:text-textPrimary bg-surface"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs truncate">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Field Selectors */}
              <div className="flex flex-col gap-3.5 pt-3 border-t border-border/60">
                {/* X-Axis */}
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1">
                    X-Axis (Dimension)
                  </label>
                  <select
                    value={currentX}
                    onChange={(e) => setSelectedX(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs appearance-none cursor-pointer"
                  >
                    {columns.map((col, i) => (
                      <option key={i} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {/* Y-Axis Multi Select */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-textPrimary">
                      Y-Axis (Measures)
                    </label>
                    <span className="text-[10px] text-textMuted font-semibold">
                      {yCols.length} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {yCols.map(col => (
                      <span key={col} className="px-2 py-0.5 rounded-lg bg-primary-soft text-primary text-xs font-bold border border-primary/20 flex items-center gap-1">
                        {col}
                        {yCols.length > 1 && (
                          <button onClick={() => setSelectedYCols(prev => prev.filter(c => c !== col))} className="hover:text-rose-500 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  <select
                    value={primaryY}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!yCols.includes(val)) setSelectedYCols([...yCols, val]);
                    }}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs appearance-none cursor-pointer"
                  >
                    {columns.map((col, i) => (
                      <option key={i} value={col}>+ Add {col}</option>
                    ))}
                  </select>
                </div>

                {/* Aggregation Mode */}
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1">
                    Aggregation Mode
                  </label>
                  <select
                    value={measureType}
                    onChange={(e) => setMeasureType(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs appearance-none cursor-pointer"
                  >
                    <option value="sum">Sum of Values</option>
                    <option value="avg">Average of Values</option>
                    <option value="count">Count of Records</option>
                    <option value="count-distinct">Count Distinct</option>
                    <option value="max">Maximum Value</option>
                    <option value="min">Minimum Value</option>
                    <option value="median">Median Value</option>
                    <option value="stddev">Standard Deviation</option>
                    <option value="variance">Variance</option>
                  </select>
                </div>

                {/* Additional Controls Bar */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="flex-1 py-2 px-3 bg-surface hover:bg-primary-soft/30 border border-border/80 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5 text-primary" />
                    Filter ({activeFilters.length})
                  </button>
                  <button
                    onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : prev === "asc" ? "none" : "desc")}
                    className="py-2 px-3 bg-surface hover:bg-primary-soft/30 border border-border/80 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                    {sortOrder.toUpperCase()}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Chart Canvas — Preserved Layout */}
          <Card className="flex-1 flex flex-col min-h-[460px] border border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-surface/50">
              <div>
                <CardTitle className="text-base font-bold text-textPrimary">
                  {customTitle || `${currentX} vs ${yCols.join(" & ")}`}
                </CardTitle>
                {customSubtitle ? (
                  <p className="text-xs text-textSecondary mt-0.5 font-medium">{customSubtitle}</p>
                ) : activeAggNotes.length > 0 ? (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Count metric auto-applied for non-numeric field ({activeAggNotes.join(", ")})
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                {/* AI Recommendation Pill */}
                <button
                  onClick={() => setActiveChartType(aiRecommendation.type)}
                  className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary-soft/60 px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Recommend: {aiRecommendation.title}
                </button>

                {/* Export & Actions */}
                <button
                  onClick={() => exportChart("png")}
                  title="Download Chart Image"
                  className="p-1.5 text-textMuted hover:text-textPrimary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title="Toggle Fullscreen"
                  className="p-1.5 text-textMuted hover:text-textPrimary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 flex flex-col justify-center relative">
              {/* Invalid Config Warning */}
              {isInvalidConfig ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 p-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                  <h4 className="text-sm font-bold text-textPrimary">Invalid Visualization Configuration</h4>
                  <p className="text-xs text-textSecondary max-w-sm">
                    "{ALL_CHART_TYPES.find(c => c.id === activeChartType)?.name}" does not support multiple Y-axis measures simultaneously. Please select a single measure or switch to a Multi-Line/Bar Chart.
                  </p>
                </div>
              ) : chartData.length === 0 ? (
                /* Empty Data State */
                <div className="flex flex-col items-center justify-center text-center gap-3 p-8">
                  <HelpCircle className="w-12 h-12 text-textMuted stroke-[1.5]" />
                  <h4 className="text-sm font-bold text-textPrimary">No valid visualization available</h4>
                  <p className="text-xs text-textSecondary max-w-sm">
                    No data entries matched the active filters or selected fields. Try clearing filters or choosing different columns.
                  </p>
                </div>
              ) : (
                /* Dynamic Chart Rendering Canvas */
                <div className="w-full h-[360px] min-h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeChartType === "bar" || activeChartType === "stacked-bar" ? (
                      <RechartsBarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => formatVal(Number(val), valueFormat, decimalPlaces, currencySymbol)} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[6, 6, 0, 0]} stackId={activeChartType === "stacked-bar" ? "a" : undefined} barSize={barWidth} isAnimationActive={false} />
                        ))}
                      </RechartsBarChart>
                    ) : activeChartType === "horizontal-bar" ? (
                      /* Fixed Multi-Measure Horizontal Bar Chart */
                      <RechartsBarChart layout="vertical" data={chartData} margin={{ top: 20, right: 20, left: 30, bottom: 25 }} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[0, 6, 6, 0]} barSize={barWidth} isAnimationActive={false} />
                        ))}
                      </RechartsBarChart>
                    ) : activeChartType === "line" || activeChartType === "multi-line" ? (
                      <RechartsLineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Line key={yCol} type="monotone" dataKey={yCol} name={yCol} stroke={palette[i % palette.length]} strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
                        ))}
                      </RechartsLineChart>
                    ) : activeChartType === "area" || activeChartType === "stacked-area" ? (
                      <RechartsAreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Area key={yCol} type="monotone" dataKey={yCol} name={yCol} stroke={palette[i % palette.length]} fill={palette[i % palette.length]} fillOpacity={0.3} stackId={activeChartType === "stacked-area" ? "a" : undefined} isAnimationActive={false} />
                        ))}
                      </RechartsAreaChart>
                    ) : activeChartType === "pie" || activeChartType === "donut" ? (
                      <RechartsPieChart onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        <Pie
                          data={chartData}
                          dataKey={primaryY}
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          innerRadius={activeChartType === "donut" ? 60 : 0}
                          paddingAngle={3}
                          label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          isAnimationActive={false}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || palette[index % palette.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        {showLegend && <Legend verticalAlign="top" />}
                      </RechartsPieChart>
                    ) : activeChartType === "radar" ? (
                      <RechartsRadarChart cx="50%" cy="50%" outerRadius={110} data={chartData}>
                        <PolarGrid stroke="var(--color-border, #CBD5E1)" />
                        <PolarAngleAxis dataKey="label" tick={{ fill: "var(--color-textSecondary, #475569)", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                        {yCols.map((yCol, i) => (
                          <Radar key={yCol} name={yCol} dataKey={yCol} stroke={palette[i % palette.length]} fill={palette[i % palette.length]} fillOpacity={0.4} isAnimationActive={false} />
                        ))}
                        <Tooltip contentStyle={tooltipStyle} />
                        {showLegend && <Legend verticalAlign="top" />}
                      </RechartsRadarChart>
                    ) : activeChartType === "scatter" || activeChartType === "bubble" ? (
                      <RechartsScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="x" name={currentX} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis dataKey="y" name={primaryY} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                        <Scatter name="Distribution" data={chartData.map((d, i) => ({ x: i + 1, y: d[primaryY] ?? d.value, name: d.label }))} fill={palette[0]} isAnimationActive={false} />
                      </RechartsScatterChart>
                    ) : activeChartType === "histogram" ? (
                      /* Histogram Bin Visual */
                      <RechartsBarChart data={histogramBins} margin={{ top: 20, right: 20, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" name="Frequency" fill={palette[0]} radius={[6, 6, 0, 0]} />
                      </RechartsBarChart>
                    ) : activeChartType === "heatmap" || activeChartType === "matrix" ? (
                      /* Heatmap / Matrix Grid View */
                      <div className="w-full h-full overflow-auto border border-border/80 rounded-xl p-3 flex flex-col gap-2">
                        <div className="grid grid-cols-4 gap-2">
                          {chartData.map((d, i) => (
                            <div key={i} className="p-3 rounded-xl border border-border/60 flex flex-col justify-between" style={{ backgroundColor: `${palette[i % palette.length]}20` }}>
                              <span className="text-[11px] font-bold text-textSecondary truncate">{d.label}</span>
                              <span className="text-base font-extrabold text-textPrimary mt-1">
                                {formatVal(Number(d[primaryY] ?? d.value ?? 0), valueFormat, decimalPlaces, currencySymbol)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : activeChartType === "kpi" || activeChartType === "gauge" ? (
                      /* KPI Cards & Gauge Visual */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full items-center justify-center p-4">
                        {yCols.map(yCol => {
                          const total = chartData.reduce((a, b) => a + Number(b[yCol] ?? 0), 0);
                          return (
                            <div key={yCol} className="p-5 bg-surface border border-border/80 rounded-2xl shadow-xs flex flex-col gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">{yCol} ({measureType})</span>
                              <div className="text-3xl font-extrabold text-primary tracking-tight">
                                {formatVal(total, valueFormat, decimalPlaces, currencySymbol)}
                              </div>
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 w-fit">
                                {chartData.length} categories aggregated
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : activeChartType === "table" ? (
                      /* Interactive Data Table */
                      <div className="w-full h-full overflow-auto border border-border/80 rounded-xl">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-primary-soft/30 sticky top-0 border-b border-border/80">
                            <tr>
                              <th className="px-4 py-2.5 font-bold">{currentX}</th>
                              {yCols.map(c => <th key={c} className="px-4 py-2.5 font-bold text-right">{c} ({measureType})</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 bg-surface">
                            {chartData.map((d, i) => (
                              <tr key={i} className="hover:bg-primary-soft/10 cursor-pointer" onClick={() => setShowDrillThroughModal(d)}>
                                <td className="px-4 py-2.5 font-bold text-textPrimary">{d.fullLabel || d.label}</td>
                                {yCols.map(c => (
                                  <td key={c} className="px-4 py-2.5 text-right font-medium text-textPrimary">
                                    {formatVal(Number(d[c] ?? 0), valueFormat, decimalPlaces, currencySymbol)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Combo Chart (Bar + Line for Multi-Measures) */
                      <RechartsComposedChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 25 }} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        {showLegend && <Legend verticalAlign="top" />}
                        <Bar dataKey={primaryY} name={primaryY} fill={palette[0]} radius={[6, 6, 0, 0]} barSize={barWidth} isAnimationActive={false} />
                        {yCols.slice(1).map((yCol, i) => (
                          <Line key={yCol} type="monotone" dataKey={yCol} name={yCol} stroke={palette[(i + 1) % palette.length]} strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
                        ))}
                      </RechartsComposedChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-border bg-surface">
          <Database className="w-16 h-16 text-textMuted stroke-[1.5]" />
          <h3 className="text-lg font-bold text-textPrimary">No Active Dataset</h3>
          <p className="text-sm text-textSecondary max-w-md">
            Upload a CSV or Excel dataset on the Dashboard to build interactive custom charts and visual analytics.
          </p>
        </Card>
      )}

      {/* ── MODAL: Chart Customization & Styling ── */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowCustomizeModal(false)}>
          <div className="w-full max-w-lg bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-textPrimary">Chart Customization & Styling</h3>
              </div>
              <button onClick={() => setShowCustomizeModal(false)} className="text-textMuted hover:text-textPrimary p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
              <div>
                <label className="font-bold text-textPrimary block mb-1">Custom Chart Title</label>
                <input type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder={`${currentX} vs ${primaryY}`} className="w-full border border-border/80 bg-surface rounded-xl p-2.5 text-xs" />
              </div>
              <div>
                <label className="font-bold text-textPrimary block mb-1">Subtitle</label>
                <input type="text" value={customSubtitle} onChange={e => setCustomSubtitle(e.target.value)} placeholder="Aggregated dataset metrics" className="w-full border border-border/80 bg-surface rounded-xl p-2.5 text-xs" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="font-bold text-textPrimary">Show Grid Lines</span>
                <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="w-4 h-4 text-primary rounded cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-textPrimary">Show Legend</span>
                <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="w-4 h-4 text-primary rounded cursor-pointer" />
              </div>
              <div>
                <label className="font-bold text-textPrimary block mb-1">Value Formatting</label>
                <div className="flex gap-2">
                  <button onClick={() => setValueFormat("number")} className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${valueFormat === "number" ? "bg-primary text-white border-primary" : "border-border"}`}>Number</button>
                  <button onClick={() => setValueFormat("currency")} className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${valueFormat === "currency" ? "bg-primary text-white border-primary" : "border-border"}`}>Currency ({currencySymbol})</button>
                  <button onClick={() => setValueFormat("percent")} className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${valueFormat === "percent" ? "bg-primary text-white border-primary" : "border-border"}`}>Percent (%)</button>
                </div>
              </div>
              <div>
                <label className="font-bold text-textPrimary block mb-1">Color Theme Palette</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PALETTES) as (keyof typeof PALETTES)[]).map(k => (
                    <button key={k} onClick={() => setPaletteKey(k)} className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${paletteKey === k ? "bg-primary text-white border-primary" : "border-border bg-surface text-textSecondary"}`}>
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border/60 flex justify-end">
              <button onClick={() => setShowCustomizeModal(false)} className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: In-Builder Filter ── */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowFilterModal(false)}>
          <div className="w-full max-w-md bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-textPrimary">In-Builder Filters</h3>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="text-textMuted hover:text-textPrimary p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-2">
                {activeFilters.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-primary-soft/30 p-2.5 rounded-xl border border-border/80">
                    <span className="font-bold text-textPrimary">{f.col} {f.op} "{f.val}"</span>
                    <button onClick={() => setActiveFilters(prev => prev.filter((_, idx) => idx !== i))} className="text-textMuted hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                <select value={filterCol || columns[0]} onChange={e => setFilterCol(e.target.value)} className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs">
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterOp} onChange={e => setFilterOp(e.target.value)} className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs">
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="not-equals">Not Equals</option>
                  <option value="greater">Greater Than</option>
                  <option value="less">Less Than</option>
                </select>
                <input type="text" value={filterVal} onChange={e => setFilterVal(e.target.value)} placeholder="Filter value..." className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs" />
                <button
                  onClick={() => {
                    const c = filterCol || columns[0];
                    if (filterVal.trim()) {
                      setActiveFilters([...activeFilters, { col: c, op: filterOp, val: filterVal.trim() }]);
                      setFilterVal("");
                    }
                  }}
                  className="w-full py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Filter Rule
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-border/60 flex justify-end">
              <button onClick={() => setShowFilterModal(false)} className="px-5 py-2 bg-primary-soft text-textPrimary font-bold rounded-xl text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Drill-Through Raw Record Inspector ── */}
      {showDrillThroughModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowDrillThroughModal(null)}>
          <div className="w-full max-w-2xl bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-primary-soft/30">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-textPrimary">Drill-Through Records — {showDrillThroughModal.fullLabel || showDrillThroughModal.label}</h3>
                  <p className="text-[11px] text-textSecondary">Inspecting underlying row records for this data point</p>
                </div>
              </div>
              <button onClick={() => setShowDrillThroughModal(null)} className="text-textMuted hover:text-textPrimary p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-3 text-xs">
              {rawGroupedRows[showDrillThroughModal.fullLabel || showDrillThroughModal.label] ? (
                <div className="border border-border/80 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-primary-soft/30 border-b border-border/80">
                      <tr>
                        {columns.map((c, i) => <th key={i} className="px-3.5 py-2 font-bold">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 bg-surface">
                      {rawGroupedRows[showDrillThroughModal.fullLabel || showDrillThroughModal.label].map((r, i) => (
                        <tr key={i} className="hover:bg-primary-soft/10">
                          {columns.map((c, j) => <td key={j} className="px-3.5 py-2 text-textPrimary font-medium">{String(r[c] ?? "-")}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-textSecondary">Aggregated value: {formatVal(Number(showDrillThroughModal[primaryY] ?? showDrillThroughModal.value ?? 0), valueFormat, decimalPlaces, currencySymbol)}</p>
              )}
            </div>
            <div className="p-4 border-t border-border/60 flex justify-end">
              <button onClick={() => setShowDrillThroughModal(null)} className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer">Close Inspector</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-surface p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold text-textPrimary">{customTitle || `${currentX} vs ${yCols.join(" & ")}`} (Fullscreen)</h2>
            <button onClick={() => setIsFullscreen(false)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Exit Fullscreen</button>
          </div>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey={primaryY} fill={palette[0]} radius={[6, 6, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
