"use client";

import { useState, useMemo } from "react";
import {
  BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Activity, Layers, Sparkles, Compass, Settings2, Save, Database, CheckCircle2,
  Filter, Download, Maximize2, SlidersHorizontal, Bot, ArrowUpDown, X,
  Table, Grid, HelpCircle, RefreshCw, Eye, Plus, Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";
import type { DynamicChartItem } from "../context/DatasetContext";
import {
  BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, AreaChart as RechartsAreaChart, Area,
  RadarChart as RechartsRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart as RechartsScatterChart, Scatter, ComposedChart as RechartsComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
  ReferenceLine
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
   ROBUST DYNAMIC AGGREGATION ENGINE
   - Numeric columns: calculate real Sum, Avg, Max, Min, Median, etc.
   - Text columns: count record occurrences or count distinct unique items.
───────────────────────────────────────────── */
function computeSmartAgg(rawVals: any[], mode: string): number {
  if (!rawVals || rawVals.length === 0) return 0;

  const cleaned = rawVals.map(v => String(v ?? "").trim()).filter(v => v.length > 0);
  if (cleaned.length === 0) return 0;

  // Extract numbers (ignoring currency & commas)
  const numVals: number[] = [];
  for (const str of cleaned) {
    const parsed = Number(str.replace(/[\$,]/g, ""));
    if (!isNaN(parsed)) numVals.push(parsed);
  }

  const isNumericCol = numVals.length >= cleaned.length * 0.5;

  if (mode === "count") return rawVals.length;
  if (mode === "count-distinct") return new Set(cleaned).size;

  // Non-numeric text column
  if (!isNumericCol) {
    if (mode === "count-distinct") return new Set(cleaned).size;
    return rawVals.length;
  }

  // Numeric column -> exact mathematical computation
  let val = 0;
  if (mode === "avg") {
    val = numVals.reduce((a, b) => a + b, 0) / numVals.length;
  } else if (mode === "max") {
    val = Math.max(...numVals);
  } else if (mode === "min") {
    val = Math.min(...numVals);
  } else if (mode === "median") {
    const s = [...numVals].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    val = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  } else if (mode === "stddev") {
    const mean = numVals.reduce((a, b) => a + b, 0) / numVals.length;
    val = Math.sqrt(numVals.reduce((a, b) => a + (b - mean) ** 2, 0) / numVals.length);
  } else if (mode === "variance") {
    const mean = numVals.reduce((a, b) => a + b, 0) / numVals.length;
    val = numVals.reduce((a, b) => a + (b - mean) ** 2, 0) / numVals.length;
  } else {
    // Default sum
    val = numVals.reduce((a, b) => a + b, 0);
  }

  return Math.round(val * 100) / 100;
}

function formatVal(n: number, fmt: string, decimals: number, curr: string): string {
  if (isNaN(n)) return "-";
  const formatted = parseFloat(n.toFixed(decimals)).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (fmt === "currency") return `${curr}${formatted}`;
  if (fmt === "percent") return `${formatted}%`;
  return formatted;
}

/* ─────────────────────────────────────────────
   SVG GAUGE CHART
───────────────────────────────────────────── */
function GaugeChart({ value, maxValue, color, label }: { value: number; maxValue: number; color: string; label: string }) {
  const pct = Math.min(Math.max(value / (maxValue || 1), 0), 1);
  const angle = -135 + pct * 270;
  const r = 80;
  const cx = 110, cy = 110;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startAngle = -135, endAngle = -135 + 270;

  const arcPath = (fromDeg: number, toDeg: number, stroke: string, opacity = 1) => {
    const sx = cx + r * Math.cos(toRad(fromDeg));
    const sy = cy + r * Math.sin(toRad(fromDeg));
    const ex = cx + r * Math.cos(toRad(toDeg));
    const ey = cy + r * Math.sin(toRad(toDeg));
    const largeArc = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    return (
      <path
        d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
        stroke={stroke}
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
        opacity={opacity}
      />
    );
  };
  const needleX = cx + (r - 10) * Math.cos(toRad(angle));
  const needleY = cy + (r - 10) * Math.sin(toRad(angle));

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={220} height={150} viewBox="0 0 220 150">
        {arcPath(startAngle, endAngle, "#E2E8F0")}
        {pct > 0 && arcPath(startAngle, startAngle + pct * 270, color)}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={6} fill={color} />
        <text x={cx} y={cy + 30} textAnchor="middle" fontSize={20} fontWeight="800" fill="currentColor">
          {formatVal(value, "number", 0, "")}
        </text>
        <text x={cx} y={cy + 46} textAnchor="middle" fontSize={10} fill="#64748B">
          of {formatVal(maxValue, "number", 0, "")} max
        </text>
      </svg>
      <span className="text-xs font-bold text-textSecondary">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HTML FUNNEL CHART
───────────────────────────────────────────── */
function FunnelChart({ data, palette }: { data: { label: string; value: number; color: string }[]; palette: string[] }) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-md mx-auto pt-4">
      {data.map((d, i) => {
        const pct = (d.value / maxVal) * 100;
        const sidePad = (100 - pct) / 2;
        return (
          <div key={i} className="flex flex-col items-center w-full">
            <div
              className="flex items-center justify-center rounded-xl transition-all py-2.5"
              style={{
                width: `${pct}%`,
                minWidth: "80px",
                backgroundColor: palette[i % palette.length] + "CC",
                boxShadow: `0 2px 8px ${palette[i % palette.length]}40`,
              }}
            >
              <span className="text-[11px] font-bold text-white drop-shadow truncate px-2">{d.label}</span>
              <span className="text-[11px] font-extrabold text-white ml-1.5">({d.value.toLocaleString()})</span>
            </div>
            {i < data.length - 1 && (
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: `${sidePad * 0.3 + 8}px solid transparent`,
                  borderRight: `${sidePad * 0.3 + 8}px solid transparent`,
                  borderTop: `12px solid ${palette[i % palette.length]}CC`,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
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

  /* ── Extract Available Columns ── */
  const columns = useMemo(() => {
    if (dataset.rawHeaders && dataset.rawHeaders.length > 0) return dataset.rawHeaders;
    if (dataset.tableHeaders && dataset.tableHeaders.length > 0) return dataset.tableHeaders;
    return ["Team", "Total_Runs", "Matches_Won", "Wickets"];
  }, [dataset]);

  /* ── Extract All Rows ── */
  const allRows = useMemo((): Record<string, any>[] => {
    if (!isUploaded) return [];
    if (dataset.rawRows && dataset.rawRows.length > 0 && dataset.rawHeaders) {
      return dataset.rawRows.map(rowArr => {
        const obj: Record<string, any> = {};
        dataset.rawHeaders.forEach((h, idx) => { obj[h] = rowArr[idx] ?? ""; });
        return obj;
      });
    }
    if (dataset.tableRows) return dataset.tableRows;
    return [];
  }, [dataset, isUploaded]);

  /* ── Detect numeric vs text columns for UI labels ── */
  const colTypes = useMemo(() => {
    const map: Record<string, boolean> = {};
    columns.forEach(col => {
      const vals = allRows.slice(0, 100).map(r => String(r[col] ?? "").trim()).filter(v => v.length > 0);
      const nums = vals.map(v => Number(v.replace(/[\$,]/g, ""))).filter(n => !isNaN(n));
      map[col] = nums.length >= vals.length * 0.5;
    });
    return map;
  }, [columns, allRows]);

  /* ── Intelligent Default Selections ── */
  const currentX = selectedX || columns.find(c => !colTypes[c]) || columns[0] || "Team";
  const defaultY = columns.find(c => colTypes[c] && c !== currentX) || columns[1] || columns[0] || "Total_Runs";
  const primaryY = selectedYCols[0] || defaultY;
  const yCols = selectedYCols.length > 0 ? selectedYCols : [primaryY];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  /* ── AI Recommendation ── */
  const aiRecommendation = useMemo(() => {
    if (yCols.length > 1) return { type: "combi", title: "Combo Chart" };
    const xLower = currentX.toLowerCase();
    if (xLower.includes("date") || xLower.includes("year") || xLower.includes("month")) {
      return { type: "line", title: "Line Chart" };
    }
    return { type: "bar", title: "Bar Chart" };
  }, [currentX, yCols]);

  /* ── Dynamic Dataset Aggregation ── */
  const { chartData, rawGroupedRows, scatterRawData } = useMemo(() => {
    if (!isUploaded || allRows.length === 0) {
      return { chartData: [], rawGroupedRows: {}, scatterRawData: [] };
    }

    // Apply Active In-Builder Filters
    const filteredRows = allRows.filter(row =>
      activeFilters.every(f => {
        const cell = String(row[f.col] ?? "");
        const fv = f.val;
        if (f.op === "equals") return cell === fv;
        if (f.op === "not-equals") return cell !== fv;
        if (f.op === "contains") return cell.toLowerCase().includes(fv.toLowerCase());
        if (f.op === "greater") return parseFloat(cell) > parseFloat(fv);
        if (f.op === "less") return parseFloat(cell) < parseFloat(fv);
        return true;
      })
    );

    // Build scatter raw data
    const scatterData = filteredRows.slice(0, 200).map(row => {
      const xVal = Number(String(row[currentX] ?? "").replace(/[\$,]/g, ""));
      const yVal = Number(String(row[primaryY] ?? "").replace(/[\$,]/g, ""));
      return {
        x: isNaN(xVal) ? 0 : xVal,
        y: isNaN(yVal) ? 0 : yVal,
        name: String(row[currentX] ?? ""),
      };
    });

    // Group rows by X-Axis dimension
    const grouped: Record<string, Record<string, any[]>> = {};
    const groupedRawRecords: Record<string, Record<string, any>[]> = {};

    filteredRows.forEach(row => {
      const xKey = row[currentX] !== undefined && row[currentX] !== null
        ? String(row[currentX]).trim()
        : "General";
      if (!xKey) return;

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

    // Build data points for each category key
    const dataPoints = keys.map((key, idx) => {
      const item: Record<string, any> = {
        label: key.length > 15 ? key.substring(0, 13) + ".." : key,
        fullLabel: key,
        color: palette[idx % palette.length],
      };

      yCols.forEach(yCol => {
        const rawVals = grouped[key][yCol] || [];
        const value = computeSmartAgg(rawVals, measureType);
        item[yCol] = value;
        if (yCols.length === 1) item.value = value;
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
      scatterRawData: scatterData,
    };
  }, [allRows, isUploaded, currentX, yCols, primaryY, measureType, activeFilters, sortOrder, palette]);

  /* ── Waterfall Data ── */
  const waterfallData = useMemo(() => {
    if (chartData.length === 0) return [];
    let running = 0;
    return chartData.map(d => {
      const val = Number(d[primaryY] ?? d.value ?? 0);
      const start = running;
      running += val;
      return { label: d.label, fullLabel: d.fullLabel, value: val, start, end: running, color: d.color };
    });
  }, [chartData, primaryY]);

  /* ── Box Plot Data ── */
  const boxPlotData = useMemo(() => {
    if (activeChartType !== "boxplot" || allRows.length === 0) return [];
    return chartData.map(d => {
      const rawVals = (allRows.filter(r => String(r[currentX] ?? "").trim() === d.fullLabel)
        .map(r => Number(String(r[primaryY] ?? "").replace(/[\$,]/g, "")))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b));
      if (rawVals.length === 0) return null;
      const q1 = rawVals[Math.floor(rawVals.length * 0.25)];
      const median = rawVals[Math.floor(rawVals.length * 0.5)];
      const q3 = rawVals[Math.floor(rawVals.length * 0.75)];
      const iqr = q3 - q1;
      const min = Math.max(rawVals[0], q1 - 1.5 * iqr);
      const max = Math.min(rawVals[rawVals.length - 1], q3 + 1.5 * iqr);
      return { label: d.label, fullLabel: d.fullLabel, min, q1, median, q3, max, color: d.color };
    }).filter(Boolean);
  }, [activeChartType, chartData, allRows, currentX, primaryY]);

  /* ── Histogram Bins ── */
  const histogramBins = useMemo(() => {
    if (activeChartType !== "histogram" || allRows.length === 0) return [];
    const vals = allRows.map(r => Number(String(r[primaryY] ?? "").replace(/[\$,]/g, ""))).filter(n => !isNaN(n));
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const step = (max - min) / 6 || 1;
    return Array.from({ length: 6 }, (_, i) => {
      const start = min + i * step;
      const end = min + (i + 1) * step;
      const count = vals.filter(v => v >= start && v < (i === 5 ? end + 1 : end)).length;
      return { label: `${Math.round(start)}-${Math.round(end)}`, value: count, color: palette[i % palette.length] };
    }).filter(b => b.value > 0);
  }, [activeChartType, allRows, primaryY, palette]);

  /* ── Save to Dashboard ── */
  const handleSaveToDashboard = () => {
    const formattedData: DynamicChartItem[] = chartData.map(d => ({
      label: String(d.label),
      value: Number(d[primaryY] ?? d.value ?? 0),
      color: String(d.color || palette[0]),
    }));
    const title = customTitle || `${currentX} vs ${yCols.join(" & ")}`;
    updateChartVisual(title, formattedData);
    showToast("Chart saved to Dashboard successfully!");
  };

  const tooltipStyle = {
    backgroundColor: "var(--color-surface, #FFFFFF)",
    color: "var(--color-textPrimary, #0F172A)",
    borderRadius: "12px",
    borderColor: "var(--color-border, #E2E8F0)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    fontSize: "12px",
  };

  const maxGaugeValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map(d => Number(d[primaryY] ?? d.value ?? 0)));
  }, [chartData, primaryY]);

  const CHART_MARGIN = { top: 20, right: 20, left: 10, bottom: 25 };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header */}
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
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in duration-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
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
          {/* Settings Sidebar */}
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
              {/* Chart Types */}
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
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected
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
                  <label className="text-xs font-bold text-textPrimary block mb-1">X-Axis (Dimension)</label>
                  <select
                    value={currentX}
                    onChange={(e) => setSelectedX(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs appearance-none cursor-pointer"
                  >
                    {columns.map((col, i) => (
                      <option key={i} value={col}>{col} {colTypes[col] ? "[numeric]" : "[text]"}</option>
                    ))}
                  </select>
                </div>

                {/* Y-Axis Multi Select */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-textPrimary">Y-Axis (Measures)</label>
                    <span className="text-[10px] text-textMuted font-semibold">{yCols.length} Selected</span>
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
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !yCols.includes(val)) setSelectedYCols([...yCols, val]);
                    }}
                    value=""
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs appearance-none cursor-pointer"
                  >
                    <option value="">+ Add Measure…</option>
                    {columns.filter(c => !yCols.includes(c)).map((col, i) => (
                      <option key={i} value={col}>{col} {colTypes[col] ? "[numeric]" : "[text]"}</option>
                    ))}
                  </select>
                </div>

                {/* Aggregation Mode */}
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1">Aggregation Mode</label>
                  <select
                    value={measureType}
                    onChange={(e) => setMeasureType(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs appearance-none cursor-pointer"
                  >
                    <option value="sum">Sum / Total</option>
                    <option value="avg">Average (Mean)</option>
                    <option value="count">Count of Records</option>
                    <option value="count-distinct">Count Distinct (Unique)</option>
                    <option value="max">Maximum Value</option>
                    <option value="min">Minimum Value</option>
                    <option value="median">Median Value</option>
                    <option value="stddev">Standard Deviation</option>
                    <option value="variance">Variance</option>
                  </select>
                </div>

                {/* Controls */}
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

          {/* Chart Canvas */}
          <Card className="flex-1 flex flex-col min-h-[460px] border border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-surface/50">
              <div>
                <CardTitle className="text-base font-bold text-textPrimary">
                  {customTitle || `${currentX} vs ${yCols.join(" & ")}`}
                </CardTitle>
                {customSubtitle && (
                  <p className="text-xs text-textSecondary mt-0.5 font-medium">{customSubtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveChartType(aiRecommendation.type)}
                  className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary-soft/60 px-3 py-1 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  AI: {aiRecommendation.title}
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title="Toggle Fullscreen"
                  className="p-1.5 text-textMuted hover:text-textPrimary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => showToast("Chart exported as PNG")}
                  title="Download Chart"
                  className="p-1.5 text-textMuted hover:text-textPrimary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 flex flex-col justify-center relative">
              {chartData.length === 0 && !["scatter", "bubble", "histogram", "boxplot"].includes(activeChartType) ? (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <img
                    src="/assets/illustrations/empty-states/illustration-empty-chart.svg"
                    alt="No data to visualize"
                    className="w-40 h-auto mb-2 opacity-90"
                  />
                  <h4 className="text-sm font-bold text-textPrimary">No data to visualize</h4>
                  <p className="text-xs text-textSecondary max-w-sm mt-0.5">
                    Select a different X-Axis dimension or clear active filters to display chart data.
                  </p>
                </div>
              ) : (
                <div className="w-full" style={{ height: "360px", minHeight: "340px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {/* BAR (Grouped / Stacked) */}
                    {activeChartType === "bar" || activeChartType === "stacked-bar" ? (
                      <RechartsBarChart data={chartData} margin={CHART_MARGIN} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[6, 6, 0, 0]} stackId={activeChartType === "stacked-bar" ? "a" : undefined} barSize={barWidth} isAnimationActive={false} />
                        ))}
                      </RechartsBarChart>

                    /* HORIZONTAL BAR */
                    ) : activeChartType === "horizontal-bar" ? (
                      <RechartsBarChart layout="vertical" data={chartData} margin={{ top: 20, right: 20, left: 30, bottom: 10 }} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} width={80} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[0, 6, 6, 0]} barSize={barWidth} isAnimationActive={false} />
                        ))}
                      </RechartsBarChart>

                    /* LINE / MULTI-LINE */
                    ) : activeChartType === "line" || activeChartType === "multi-line" ? (
                      <RechartsLineChart data={chartData} margin={CHART_MARGIN} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Line key={yCol} type="monotone" dataKey={yCol} name={yCol} stroke={palette[i % palette.length]} strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
                        ))}
                      </RechartsLineChart>

                    /* AREA / STACKED AREA */
                    ) : activeChartType === "area" || activeChartType === "stacked-area" ? (
                      <RechartsAreaChart data={chartData} margin={CHART_MARGIN} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
                        {showLegend && <Legend verticalAlign="top" />}
                        {yCols.map((yCol, i) => (
                          <Area key={yCol} type="monotone" dataKey={yCol} name={yCol} stroke={palette[i % palette.length]} fill={palette[i % palette.length]} fillOpacity={0.25} stackId={activeChartType === "stacked-area" ? "a" : undefined} isAnimationActive={false} />
                        ))}
                      </RechartsAreaChart>

                    /* PIE / DONUT */
                    ) : activeChartType === "pie" || activeChartType === "donut" ? (
                      <RechartsPieChart>
                        <Pie data={chartData} dataKey={primaryY} nameKey="label" cx="50%" cy="50%" outerRadius={120} innerRadius={activeChartType === "donut" ? 60 : 0} paddingAngle={3} label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`} isAnimationActive={false}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || palette[index % palette.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
                        {showLegend && <Legend verticalAlign="top" />}
                      </RechartsPieChart>

                    /* RADAR */
                    ) : activeChartType === "radar" ? (
                      <RechartsRadarChart cx="50%" cy="50%" outerRadius={110} data={chartData}>
                        <PolarGrid stroke="var(--color-border, #CBD5E1)" />
                        <PolarAngleAxis dataKey="label" tick={{ fill: "var(--color-textSecondary, #475569)", fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                        {yCols.map((yCol, i) => (
                          <Radar key={yCol} name={yCol} dataKey={yCol} stroke={palette[i % palette.length]} fill={palette[i % palette.length]} fillOpacity={0.4} isAnimationActive={false} />
                        ))}
                        <Tooltip contentStyle={tooltipStyle} />
                        {showLegend && <Legend verticalAlign="top" />}
                      </RechartsRadarChart>

                    /* SCATTER / BUBBLE */
                    ) : activeChartType === "scatter" || activeChartType === "bubble" ? (
                      <RechartsScatterChart margin={CHART_MARGIN}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis
                          type="number"
                          dataKey="x"
                          name={currentX}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }}
                          label={{ value: currentX, position: "insideBottom", offset: -10, fontSize: 11, fill: "var(--color-textSecondary, #64748B)" }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name={primaryY}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }}
                          label={{ value: primaryY, angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--color-textSecondary, #64748B)" }}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(val: any, name: any) => [formatVal(Number(val), valueFormat, decimalPlaces, currencySymbol), String(name ?? "")]}
                        />
                        <Scatter
                          name={`${currentX} vs ${primaryY}`}
                          data={scatterRawData}
                          fill={palette[0]}
                          fillOpacity={0.7}
                          isAnimationActive={false}
                        >
                          {scatterRawData.map((_, i) => (
                            <Cell key={i} fill={palette[i % palette.length]} />
                          ))}
                        </Scatter>
                      </RechartsScatterChart>

                    /* HISTOGRAM */
                    ) : activeChartType === "histogram" ? (
                      <RechartsBarChart data={histogramBins} margin={CHART_MARGIN}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" name="Frequency" isAnimationActive={false} radius={[4, 4, 0, 0]}>
                          {histogramBins.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                        </Bar>
                      </RechartsBarChart>

                    /* COMBO (Bar + Line) */
                    ) : activeChartType === "combi" ? (
                      <RechartsComposedChart data={chartData} margin={CHART_MARGIN} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
                        {showLegend && <Legend verticalAlign="top" />}
                        <Bar dataKey={primaryY} name={primaryY} fill={palette[0]} radius={[6, 6, 0, 0]} barSize={barWidth} isAnimationActive={false} />
                        {yCols.slice(1).map((yCol, i) => (
                          <Line key={yCol} type="monotone" dataKey={yCol} name={yCol} stroke={palette[(i + 1) % palette.length]} strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
                        ))}
                      </RechartsComposedChart>

                    /* WATERFALL */
                    ) : activeChartType === "waterfall" ? (
                      <RechartsComposedChart data={waterfallData} margin={CHART_MARGIN}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(val: any, name: any) => String(name) === "invisible" ? [null, null] : [formatVal(Number(val), valueFormat, decimalPlaces, currencySymbol), String(name ?? "")]}
                        />
                        {showLegend && <Legend verticalAlign="top" />}
                        <Bar dataKey="start" name="invisible" fill="transparent" stackId="wf" isAnimationActive={false} />
                        <Bar dataKey="value" name={primaryY} stackId="wf" isAnimationActive={false} radius={[4, 4, 0, 0]}>
                          {waterfallData.map((d, i) => (
                            <Cell key={i} fill={Number(d?.value) >= 0 ? palette[0] : "#EF4444"} />
                          ))}
                        </Bar>
                        <ReferenceLine y={0} stroke="var(--color-border, #E2E8F0)" strokeWidth={1.5} />
                      </RechartsComposedChart>

                    /* HEATMAP / MATRIX */
                    ) : activeChartType === "heatmap" || activeChartType === "matrix" ? (
                      <div className="w-full h-full overflow-auto p-1">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 h-full content-start">
                          {chartData.map((d, i) => {
                            const val = Number(d[primaryY] ?? d.value ?? 0);
                            const maxVal = Math.max(...chartData.map(x => Number(x[primaryY] ?? x.value ?? 0)));
                            const intensity = maxVal > 0 ? val / maxVal : 0;
                            return (
                              <div
                                key={i}
                                className="p-3 rounded-xl border flex flex-col gap-1 cursor-pointer hover:scale-105 transition-transform"
                                style={{
                                  backgroundColor: palette[i % palette.length] + Math.round(intensity * 200).toString(16).padStart(2, "0"),
                                  borderColor: palette[i % palette.length] + "40",
                                }}
                                onClick={() => setShowDrillThroughModal(d)}
                              >
                                <span className="text-[10px] font-bold text-textSecondary truncate">{d.label}</span>
                                <span className="text-sm font-extrabold text-textPrimary">{formatVal(val, valueFormat, decimalPlaces, currencySymbol)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    /* TREEMAP */
                    ) : activeChartType === "treemap" ? (
                      <RechartsBarChart data={chartData} margin={CHART_MARGIN}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
                        {yCols.map((yCol, i) => (
                          <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} isAnimationActive={false} />
                        ))}
                      </RechartsBarChart>

                    /* FUNNEL */
                    ) : activeChartType === "funnel" ? (
                      <div className="w-full h-full overflow-auto flex items-center justify-center">
                        <FunnelChart
                          data={chartData.map(d => ({ label: d.label, value: Number(d[primaryY] ?? d.value ?? 0), color: d.color }))}
                          palette={palette}
                        />
                      </div>

                    /* GAUGE */
                    ) : activeChartType === "gauge" ? (
                      <div className="w-full h-full flex flex-wrap items-center justify-center gap-6 overflow-auto p-4">
                        {yCols.map((yCol, i) => {
                          const total = chartData.reduce((a, b) => a + Number(b[yCol] ?? 0), 0);
                          const maxV = Math.max(maxGaugeValue, total) * 1.2;
                          return (
                            <GaugeChart key={yCol} value={total} maxValue={maxV} color={palette[i % palette.length]} label={yCol} />
                          );
                        })}
                      </div>

                    /* KPI CARD */
                    ) : activeChartType === "kpi" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full items-center justify-center p-4 overflow-auto">
                        {yCols.map((yCol, i) => {
                          const total = chartData.reduce((a, b) => a + Number(b[yCol] ?? 0), 0);
                          const avg = chartData.length > 0 ? total / chartData.length : 0;
                          const maxV = Math.max(...chartData.map(d => Number(d[yCol] ?? 0)));
                          return (
                            <div key={yCol} className="p-5 bg-surface border border-border/80 rounded-2xl shadow-xs flex flex-col gap-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">{yCol}</span>
                              <div className="text-3xl font-extrabold tracking-tight" style={{ color: palette[i % palette.length] }}>
                                {formatVal(total, valueFormat, decimalPlaces, currencySymbol)}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-textMuted border-t border-border/60 pt-2">
                                <div>Avg: <span className="text-textPrimary">{formatVal(avg, valueFormat, decimalPlaces, currencySymbol)}</span></div>
                                <div>Max: <span className="text-textPrimary">{formatVal(maxV, valueFormat, decimalPlaces, currencySymbol)}</span></div>
                                <div>Categories: <span className="text-textPrimary">{chartData.length}</span></div>
                                <div>Mode: <span className="text-textPrimary">{measureType}</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    /* TABLE */
                    ) : activeChartType === "table" ? (
                      <div className="w-full h-full overflow-auto border border-border/80 rounded-xl">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-primary-soft/30 sticky top-0 border-b border-border/80">
                            <tr>
                              <th className="px-4 py-2.5 font-bold">{currentX}</th>
                              {yCols.map(c => <th key={c} className="px-4 py-2.5 font-bold text-right">{c}</th>)}
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

                    /* BOX PLOT */
                    ) : activeChartType === "boxplot" ? (
                      <RechartsComposedChart data={boxPlotData} margin={CHART_MARGIN}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="min" name="Min" fill="transparent" isAnimationActive={false} />
                        <Bar dataKey="q1" name="Q1" fill="transparent" stackId="box" isAnimationActive={false} />
                        <Bar dataKey="median" name="Median" fill={palette[0]} stackId="box" barSize={barWidth} radius={[0, 0, 0, 0]} isAnimationActive={false} />
                        <Bar dataKey="q3" name="Q3" fill={palette[0] + "60"} stackId="box" barSize={barWidth} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        <Legend verticalAlign="top" />
                      </RechartsComposedChart>

                    /* DEFAULT FALLBACK */
                    ) : (
                      <RechartsBarChart data={chartData} margin={CHART_MARGIN}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        {yCols.map((yCol, i) => (
                          <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[6, 6, 0, 0]} barSize={barWidth} isAnimationActive={false} />
                        ))}
                      </RechartsBarChart>
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

      {/* MODAL: Customization */}
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
                <label className="font-bold text-textPrimary block mb-1">Subtitle / Description</label>
                <input type="text" value={customSubtitle} onChange={e => setCustomSubtitle(e.target.value)} placeholder="Enter subtitle…" className="w-full border border-border/80 bg-surface rounded-xl p-2.5 text-xs" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="font-bold text-textPrimary">Show Grid Lines</span>
                <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-textPrimary">Show Legend</span>
                <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="w-4 h-4 accent-primary rounded cursor-pointer" />
              </div>
              <div>
                <label className="font-bold text-textPrimary block mb-1.5">Value Formatting</label>
                <div className="flex gap-2">
                  {(["number", "currency", "percent"] as const).map(fmt => (
                    <button key={fmt} onClick={() => setValueFormat(fmt)} className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize ${valueFormat === fmt ? "bg-primary text-white border-primary" : "border-border"}`}>
                      {fmt === "currency" ? `${currencySymbol} Currency` : fmt === "percent" ? "% Percent" : "# Number"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-textPrimary block mb-1.5">Color Theme Palette</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PALETTES) as (keyof typeof PALETTES)[]).map(k => (
                    <button key={k} onClick={() => setPaletteKey(k)} className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${paletteKey === k ? "bg-primary text-white border-primary" : "border-border bg-surface text-textSecondary"}`}>
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 mt-2">
                  {PALETTES[paletteKey].map((c, i) => <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: c }} />)}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border/60 flex justify-end">
              <button onClick={() => setShowCustomizeModal(false)} className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Filters */}
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
              {activeFilters.length === 0 && (
                <p className="text-textMuted text-center py-2">No active filters. Add one below.</p>
              )}
              <div className="flex flex-col gap-2">
                {activeFilters.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-primary-soft/30 p-2.5 rounded-xl border border-border/80">
                    <span className="font-bold text-textPrimary">{f.col} <span className="text-primary">{f.op}</span> "{f.val}"</span>
                    <button onClick={() => setActiveFilters(prev => prev.filter((_, idx) => idx !== i))} className="text-textMuted hover:text-rose-500 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                <select value={filterCol || columns[0]} onChange={e => setFilterCol(e.target.value)} className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs">
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterOp} onChange={e => setFilterOp(e.target.value)} className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs">
                  <option value="contains">Contains</option>
                  <option value="equals">Equals (exact)</option>
                  <option value="not-equals">Not Equals</option>
                  <option value="greater">Greater Than</option>
                  <option value="less">Less Than</option>
                </select>
                <input type="text" value={filterVal} onChange={e => setFilterVal(e.target.value)} placeholder="Filter value…" className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs" />
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
            <div className="p-4 border-t border-border/60 flex justify-between">
              {activeFilters.length > 0 && (
                <button onClick={() => setActiveFilters([])} className="px-4 py-2 bg-rose-500/10 text-rose-500 font-bold rounded-xl text-xs cursor-pointer">Clear All</button>
              )}
              <button onClick={() => setShowFilterModal(false)} className="ml-auto px-5 py-2 bg-primary-soft text-textPrimary font-bold rounded-xl text-xs cursor-pointer">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Drill-Through */}
      {showDrillThroughModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowDrillThroughModal(null)}>
          <div className="w-full max-w-2xl bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-primary-soft/30">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-textPrimary">Drill-Through: {showDrillThroughModal.fullLabel || showDrillThroughModal.label}</h3>
                  <p className="text-[11px] text-textSecondary">Underlying row records for this data point</p>
                </div>
              </div>
              <button onClick={() => setShowDrillThroughModal(null)} className="text-textMuted hover:text-textPrimary p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-3 text-xs">
              {rawGroupedRows[showDrillThroughModal.fullLabel || showDrillThroughModal.label] ? (
                <div className="border border-border/80 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-primary-soft/30 border-b border-border/80">
                      <tr>{columns.map((c, i) => <th key={i} className="px-3.5 py-2 font-bold">{c}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 bg-surface">
                      {rawGroupedRows[showDrillThroughModal.fullLabel || showDrillThroughModal.label].slice(0, 100).map((r, i) => (
                        <tr key={i} className="hover:bg-primary-soft/10">
                          {columns.map((c, j) => <td key={j} className="px-3.5 py-2 text-textPrimary font-medium">{String(r[c] ?? "-")}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-textSecondary">No raw records found for this data point.</p>
              )}
            </div>
            <div className="p-4 border-t border-border/60 flex justify-end">
              <button onClick={() => setShowDrillThroughModal(null)} className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer">Close Inspector</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-surface p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold text-textPrimary">{customTitle || `${currentX} vs ${yCols.join(" & ")}`}</h2>
            <button onClick={() => setIsFullscreen(false)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer">Exit Fullscreen</button>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                {showLegend && <Legend />}
                {yCols.map((yCol, i) => (
                  <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[6, 6, 0, 0]} />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
