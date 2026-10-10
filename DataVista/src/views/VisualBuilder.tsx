"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon,
  Activity, Layers, Sparkles, Compass, Settings2, Save, Database, CheckCircle2,
  Filter, Download, Maximize2, SlidersHorizontal, Bot, ArrowUpDown, X,
  Table, Grid, RefreshCw, Eye, Plus, Trash2, Search, Calendar, AlertCircle,
  Check, FileSpreadsheet, Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";
import type { DynamicChartItem } from "../context/DatasetContext";
import {
  BarChart as RechartsBarChart, Bar, LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, AreaChart as RechartsAreaChart, Area,
  RadarChart as RechartsRadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart as RechartsScatterChart, Scatter, ComposedChart as RechartsComposedChart,
  ZAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
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
  { id: "bar", name: "Bar Chart", icon: BarChartIcon, category: "Comparison", desc: "Compare values across categories" },
  { id: "stacked-bar", name: "Stacked Bar", icon: BarChartIcon, category: "Comparison", desc: "Show categorical sub-segment breakdown" },
  { id: "horizontal-bar", name: "Horizontal Bar", icon: BarChartIcon, category: "Comparison", desc: "Best for ranking and long text labels" },
  { id: "radar", name: "Radar Spider", icon: Compass, category: "Comparison", desc: "Multi-dimensional performance comparison" },
  { id: "combi", name: "Combo (Bar+Line)", icon: Sparkles, category: "Comparison", desc: "Dual-metric comparison (e.g. Volume & Rate)" },

  { id: "line", name: "Line Chart", icon: LineChartIcon, category: "Trend", desc: "Track continuous performance trends over time" },
  { id: "multi-line", name: "Multi-Line", icon: LineChartIcon, category: "Trend", desc: "Compare multiple trend trajectories" },
  { id: "area", name: "Area Chart", icon: Layers, category: "Trend", desc: "Volume accumulation over time" },
  { id: "stacked-area", name: "Stacked Area", icon: Layers, category: "Trend", desc: "Cumulative group contributions over time" },

  { id: "pie", name: "Pie Chart", icon: PieChartIcon, category: "Composition", desc: "Share of whole for small category counts" },
  { id: "donut", name: "Donut Chart", icon: PieChartIcon, category: "Composition", desc: "Ring breakdown with center metric focus" },
  { id: "treemap", name: "Treemap", icon: Layers, category: "Composition", desc: "Hierarchical nested rectangle areas" },

  { id: "scatter", name: "Scatter Plot", icon: Activity, category: "Distribution", desc: "Relationship & correlation between two metrics" },
  { id: "bubble", name: "Bubble Chart", icon: Activity, category: "Distribution", desc: "Three-dimensional distribution analysis" },
  { id: "histogram", name: "Histogram", icon: BarChartIcon, category: "Distribution", desc: "Frequency distribution across value buckets" },
  { id: "boxplot", name: "Box Plot", icon: Activity, category: "Distribution", desc: "Statistical quartiles and distribution spread" },

  { id: "funnel", name: "Funnel Chart", icon: Filter, category: "Process", desc: "Stage-by-stage pipeline drop-off rates" },
  { id: "waterfall", name: "Waterfall Chart", icon: BarChartIcon, category: "Process", desc: "Incremental positive & negative adjustments" },

  { id: "kpi", name: "KPI Card", icon: Sparkles, category: "KPI", desc: "High-impact single metric highlight card" },
  { id: "gauge", name: "Gauge Chart", icon: Activity, category: "KPI", desc: "Radial speedometer against target threshold" },

  { id: "table", name: "Data Table", icon: Table, category: "Data", desc: "Tabular view with raw aggregated values" },
  { id: "heatmap", name: "Heat Map", icon: Grid, category: "Data", desc: "2D intensity grid via color variations" },
  { id: "matrix", name: "Matrix Table", icon: Grid, category: "Data", desc: "Pivot style intersection table" },
];

/* ─────────────────────────────────────────────
   ROBUST DYNAMIC AGGREGATION ENGINE
   - Numeric columns: calculate real Sum, Avg, Max, Min, Median, StdDev, Variance, % of Total
   - Text columns: count record occurrences or count distinct unique items.
───────────────────────────────────────────── */
function computeSmartAgg(rawVals: any[], mode: string, totalSumForPct = 0): number {
  if (!rawVals || rawVals.length === 0) return 0;

  const cleaned = rawVals
    .map((v) => (v !== undefined && v !== null ? String(v).trim() : ""))
    .filter((v) => v.length > 0 && v.toLowerCase() !== "null" && v.toLowerCase() !== "nan");

  if (cleaned.length === 0) return 0;

  // Extract numbers (ignoring currency symbols, commas, and percentage signs)
  const numVals: number[] = [];
  for (const str of cleaned) {
    const parsed = Number(str.replace(/[$,%]/g, "").trim());
    if (!isNaN(parsed) && isFinite(parsed)) numVals.push(parsed);
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
    val = numVals.reduce((a, b) => a + b, 0) / Math.max(1, numVals.length);
  } else if (mode === "max") {
    val = Math.max(...numVals);
  } else if (mode === "min") {
    val = Math.min(...numVals);
  } else if (mode === "median") {
    const s = [...numVals].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    val = s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  } else if (mode === "stddev") {
    const mean = numVals.reduce((a, b) => a + b, 0) / Math.max(1, numVals.length);
    val = Math.sqrt(numVals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, numVals.length));
  } else if (mode === "variance") {
    const mean = numVals.reduce((a, b) => a + b, 0) / Math.max(1, numVals.length);
    val = numVals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, numVals.length);
  } else if (mode === "pct-total") {
    const sum = numVals.reduce((a, b) => a + b, 0);
    val = totalSumForPct > 0 ? (sum / totalSumForPct) * 100 : 0;
  } else {
    // Default sum
    val = numVals.reduce((a, b) => a + b, 0);
  }

  return Math.round(val * 100) / 100;
}

function formatVal(n: number, fmt: string, decimals: number, curr: string): string {
  if (isNaN(n) || !isFinite(n)) return "-";
  const formatted = parseFloat(n.toFixed(decimals)).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (fmt === "currency") return `${curr}${formatted}`;
  if (fmt === "percent") return `${formatted}%`;
  return formatted;
}

/* ── Date Helpers ── */
function isDateColumn(colName: string, sampleValues: any[]): boolean {
  const l = colName.toLowerCase();
  if (l.includes("date") || l.includes("year") || l.includes("month") || l.includes("time") || l.includes("dob")) {
    return true;
  }
  let dateMatches = 0;
  const nonEmpties = sampleValues.filter(
    (v) => v !== undefined && v !== null && String(v).trim().length > 0
  );
  if (nonEmpties.length === 0) return false;
  for (const v of nonEmpties) {
    const s = String(v).trim();
    if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(s) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(s)) {
      dateMatches++;
    } else {
      const parsed = Date.parse(s);
      if (!isNaN(parsed) && s.length >= 6 && isNaN(Number(s))) {
        dateMatches++;
      }
    }
  }
  return dateMatches / nonEmpties.length >= 0.5;
}

function formatDateValue(dateStr: string, grouping: "raw" | "month" | "year" | "dayOfWeek"): string {
  if (!dateStr || grouping === "raw") return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  if (grouping === "month") {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  if (grouping === "year") {
    return String(d.getFullYear());
  }
  if (grouping === "dayOfWeek") {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return dateStr;
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

/* ─────────────────────────────────────────────
   SVG TREEMAP COMPONENT
───────────────────────────────────────────── */
function SvgTreemap({
  data,
  palette,
  valueFormat,
  decimalPlaces,
  currencySymbol,
  onItemClick,
}: {
  data: { label: string; fullLabel: string; value: number; color?: string }[];
  palette: string[];
  valueFormat: string;
  decimalPlaces: number;
  currencySymbol: string;
  onItemClick?: (item: any) => void;
}) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((a, b) => a + Math.max(0, b.value), 0) || 1;

  return (
    <div className="w-full h-full p-2 flex flex-wrap gap-2 content-start overflow-auto">
      {data.map((item, idx) => {
        const pct = Math.max(0, item.value) / total;
        const color = item.color || palette[idx % palette.length];
        const minW = Math.max(100, Math.min(300, Math.round(pct * 500)));
        const flexGrow = Math.max(1, Math.round(pct * 100));

        return (
          <div
            key={idx}
            onClick={() => onItemClick && onItemClick(item)}
            className="p-3.5 rounded-xl border border-white/20 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer flex flex-col justify-between"
            style={{
              flexGrow,
              minWidth: `${minW}px`,
              minHeight: "80px",
              backgroundColor: color + "E6",
            }}
          >
            <div className="flex items-center justify-between gap-1 text-white">
              <span className="text-xs font-extrabold truncate drop-shadow-xs">{item.fullLabel || item.label}</span>
              <span className="text-[10px] font-bold bg-black/30 px-1.5 py-0.5 rounded-full shrink-0">
                {(pct * 100).toFixed(1)}%
              </span>
            </div>
            <span className="text-sm font-black text-white mt-1 drop-shadow-xs">
              {formatVal(item.value, valueFormat, decimalPlaces, currencySymbol)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   2D HEATMAP MATRIX COMPONENT
───────────────────────────────────────────── */
function HeatmapMatrix({
  data,
  yCols,
  palette,
  valueFormat,
  decimalPlaces,
  currencySymbol,
  onCellClick,
}: {
  data: any[];
  yCols: string[];
  palette: string[];
  valueFormat: string;
  decimalPlaces: number;
  currencySymbol: string;
  onCellClick?: (cell: any) => void;
}) {
  if (!data || data.length === 0) return null;

  const maxMap: Record<string, number> = {};
  yCols.forEach((col) => {
    const vals = data.map((d) => Number(d[col] ?? 0));
    maxMap[col] = Math.max(...vals, 1);
  });

  return (
    <div className="w-full h-full overflow-auto border border-border/70 rounded-xl bg-surface">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-primary-soft/40 sticky top-0 border-b border-border/80 backdrop-blur-xs">
          <tr>
            <th className="px-3.5 py-2.5 font-bold uppercase text-[11px] text-textSecondary tracking-wider">Dimension</th>
            {yCols.map((col) => (
              <th key={col} className="px-3.5 py-2.5 font-bold uppercase text-[11px] text-textSecondary text-right tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-primary-soft/20 transition-colors">
              <td className="px-3.5 py-2 font-bold text-textPrimary whitespace-nowrap">
                {row.fullLabel || row.label}
              </td>
              {yCols.map((col, cIdx) => {
                const val = Number(row[col] ?? 0);
                const max = maxMap[col] || 1;
                const ratio = Math.min(1, Math.max(0.08, val / max));
                const baseColor = palette[cIdx % palette.length];

                return (
                  <td
                    key={col}
                    onClick={() => onCellClick && onCellClick(row)}
                    className="px-3.5 py-2 text-right font-mono font-bold cursor-pointer transition-transform hover:scale-105"
                    style={{
                      backgroundColor: baseColor + Math.round(ratio * 210).toString(16).padStart(2, "0"),
                      color: ratio > 0.55 ? "#FFFFFF" : "var(--color-textPrimary, #0F172A)",
                    }}
                  >
                    {formatVal(val, valueFormat, decimalPlaces, currencySymbol)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PIVOT MATRIX TABLE WITH TOTALS
───────────────────────────────────────────── */
function PivotMatrixTable({
  data,
  currentX,
  yCols,
  measureType,
  valueFormat,
  decimalPlaces,
  currencySymbol,
  onRowClick,
}: {
  data: any[];
  currentX: string;
  yCols: string[];
  measureType: string;
  valueFormat: string;
  decimalPlaces: number;
  currencySymbol: string;
  onRowClick?: (row: any) => void;
}) {
  if (!data || data.length === 0) return null;

  const colTotals: Record<string, number> = {};
  yCols.forEach((col) => {
    colTotals[col] = data.reduce((a, b) => a + Number(b[col] ?? 0), 0);
  });

  return (
    <div className="w-full h-full overflow-auto border border-border/80 rounded-xl bg-surface">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-primary-soft/50 sticky top-0 border-b border-border/80 backdrop-blur-xs">
          <tr>
            <th className="px-4 py-2.5 font-bold uppercase text-[11px] text-textSecondary tracking-wider">{currentX}</th>
            {yCols.map((c) => (
              <th key={c} className="px-4 py-2.5 font-bold uppercase text-[11px] text-textSecondary text-right tracking-wider">
                {c} ({measureType.toUpperCase()})
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {data.map((d, i) => (
            <tr key={i} onClick={() => onRowClick && onRowClick(d)} className="hover:bg-primary-soft/20 cursor-pointer transition-colors">
              <td className="px-4 py-2.5 font-bold text-textPrimary whitespace-nowrap">{d.fullLabel || d.label}</td>
              {yCols.map((c) => (
                <td key={c} className="px-4 py-2.5 font-mono text-right text-textPrimary">
                  {formatVal(Number(d[c] ?? 0), valueFormat, decimalPlaces, currencySymbol)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-primary-soft/40 border-t-2 border-primary/30 font-bold sticky bottom-0 backdrop-blur-xs">
          <tr>
            <td className="px-4 py-2.5 text-primary uppercase text-[11px] font-black tracking-wider">
              Total ({data.length} categories)
            </td>
            {yCols.map((c) => (
              <td key={c} className="px-4 py-2.5 font-mono text-right text-primary font-black">
                {formatVal(colTotals[c], valueFormat, decimalPlaces, currencySymbol)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export function VisualBuilder() {
  const { dataset, updateChartVisual } = useDataset();

  /* ── Core State ── */
  const [activeChartType, setActiveChartType] = useState<string>("bar");
  const [chartFamily, setChartFamily] = useState<string>("All");
  const [chartSearch, setChartSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [tableViewType, setTableViewType] = useState<"aggregated" | "records">("aggregated");
  const [recordsSearch, setRecordsSearch] = useState<string>("");
  const [showWhyChart, setShowWhyChart] = useState<boolean>(true);
  const [selectedX, setSelectedX] = useState<string>("");
  const [selectedYCols, setSelectedYCols] = useState<string[]>([]);
  const [measureType, setMeasureType] = useState<string>("sum");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc" | "none">("desc");
  const [categoryLimit, setCategoryLimit] = useState<number>(15);
  const [dateGrouping, setDateGrouping] = useState<"raw" | "month" | "year" | "dayOfWeek">("raw");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [decimalPlaces, setDecimalPlaces] = useState(0);
  const [paletteKey, setPaletteKey] = useState<keyof typeof PALETTES>("default");
  const [barWidth, setBarWidth] = useState(24);

  /* ── Filter & Date Range State ── */
  const [filterCol, setFilterCol] = useState("");
  const [filterOp, setFilterOp] = useState("contains");
  const [filterVal, setFilterVal] = useState("");
  const [filterVal2, setFilterVal2] = useState("");
  const [activeFilters, setActiveFilters] = useState<{ col: string; op: string; val: string }[]>([]);
  const [activeDateCol, setActiveDateCol] = useState("");
  const [dateRangePreset, setDateRangePreset] = useState<"all" | "7d" | "30d" | "mtd" | "ytd" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isUploaded = dataset.status === "active";
  const palette = PALETTES[paletteKey] || PALETTES.default;

  /* ── Extract Available Columns (Prioritize active transformed tableHeaders) ── */
  const columns = useMemo(() => {
    if (dataset.tableHeaders && dataset.tableHeaders.length > 0) return dataset.tableHeaders;
    if (dataset.rawHeaders && dataset.rawHeaders.length > 0) return dataset.rawHeaders;
    return ["Category", "Metric_1", "Metric_2", "Metric_3"];
  }, [dataset]);

  /* ── Extract All Rows (Prioritize active transformed tableRows) ── */
  const allRows = useMemo((): Record<string, any>[] => {
    if (!isUploaded) return [];
    if (dataset.tableRows && dataset.tableRows.length > 0) return dataset.tableRows;
    if (dataset.rawRows && dataset.rawRows.length > 0 && dataset.rawHeaders) {
      return dataset.rawRows.map(rowArr => {
        const obj: Record<string, any> = {};
        dataset.rawHeaders.forEach((h, idx) => { obj[h] = rowArr[idx] ?? ""; });
        return obj;
      });
    }
    return [];
  }, [dataset, isUploaded]);

  /* ── Inferred Column Types (Categorical, Numeric, Date) ── */
  const columnTypeMap = useMemo(() => {
    const map: Record<string, "numeric" | "date" | "text"> = {};
    columns.forEach(col => {
      const sample = allRows.slice(0, 100).map(r => r[col]);
      if (isDateColumn(col, sample)) {
        map[col] = "date";
      } else {
        const nonNulls = sample.map(v => String(v ?? "").trim()).filter(v => v.length > 0);
        const nums = nonNulls.map(v => Number(v.replace(/[$,%]/g, ""))).filter(n => !isNaN(n) && isFinite(n));
        map[col] = nums.length >= nonNulls.length * 0.5 && nonNulls.length > 0 ? "numeric" : "text";
      }
    });
    return map;
  }, [columns, allRows]);

  const colTypes = useMemo(() => {
    const map: Record<string, boolean> = {};
    columns.forEach(col => {
      map[col] = columnTypeMap[col] === "numeric";
    });
    return map;
  }, [columns, columnTypeMap]);

  const dateColumns = useMemo(() => {
    return columns.filter(col => columnTypeMap[col] === "date");
  }, [columns, columnTypeMap]);

  /* ── Reset state safely when dataset changes ── */
  useEffect(() => {
    setSelectedX("");
    setSelectedYCols([]);
    setActiveFilters([]);
    setCustomTitle("");
    setCustomSubtitle("");
    setStartDate("");
    setEndDate("");
    setDateRangePreset("all");
    setDateGrouping("raw");
    if (dateColumns.length > 0) {
      setActiveDateCol(dateColumns[0]);
    } else {
      setActiveDateCol("");
    }
  }, [dataset.name]);

  useEffect(() => {
    if (!activeDateCol && dateColumns.length > 0) {
      setActiveDateCol(dateColumns[0]);
    }
  }, [dateColumns, activeDateCol]);

  /* ── Intelligent Dynamic Default Selections ── */
  const isYearOrIdCol = (c: string) => {
    const l = c.toLowerCase();
    return l.includes("season") || l.includes("year") || l === "id" || l.endsWith("_id");
  };

  const currentX = useMemo(() => {
    if (selectedX && columns.includes(selectedX)) return selectedX;
    return columns.find(c => columnTypeMap[c] !== "numeric") || columns[0] || "Category";
  }, [selectedX, columns, columnTypeMap]);

  const defaultY = useMemo(() => {
    return (
      columns.find(c => columnTypeMap[c] === "numeric" && c !== currentX && !isYearOrIdCol(c)) ||
      columns.find(c => columnTypeMap[c] === "numeric" && c !== currentX) ||
      columns.find(c => c !== currentX) ||
      columns[1] ||
      columns[0] ||
      "Metric_1"
    );
  }, [columns, columnTypeMap, currentX]);

  const primaryY = selectedYCols[0] || defaultY;
  const yCols = selectedYCols.length > 0 ? selectedYCols : [primaryY];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  /* ── Filtered Chart Types by Family & Search ── */
  const filteredChartTypes = useMemo(() => {
    return ALL_CHART_TYPES.filter(t => {
      const matchCat = chartFamily === "All" || t.category === chartFamily;
      const q = chartSearch.trim().toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [chartFamily, chartSearch]);

  /* ── Date Preset Handler ── */
  const handleDatePresetChange = (preset: "all" | "7d" | "30d" | "mtd" | "ytd" | "custom") => {
    setDateRangePreset(preset);
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }
    let maxDate = new Date();
    if (activeDateCol && allRows.length > 0) {
      const parsedTimes = allRows.map(r => new Date(r[activeDateCol]).getTime()).filter(t => !isNaN(t));
      if (parsedTimes.length > 0) {
        maxDate = new Date(Math.max(...parsedTimes));
      }
    }
    const endStr = maxDate.toISOString().split("T")[0];
    const sDate = new Date(maxDate);

    if (preset === "7d") {
      sDate.setDate(sDate.getDate() - 7);
    } else if (preset === "30d") {
      sDate.setDate(sDate.getDate() - 30);
    } else if (preset === "mtd") {
      sDate.setDate(1);
    } else if (preset === "ytd") {
      sDate.setMonth(0, 1);
    }
    setStartDate(sDate.toISOString().split("T")[0]);
    setEndDate(endStr);
  };

  /* ── Filter Rows Pipeline (Column Filters + Date Range) ── */
  const filteredRows = useMemo(() => {
    if (!isUploaded || allRows.length === 0) return [];

    return allRows.filter(row => {
      // Date Range Filter
      if (activeDateCol && (startDate || endDate)) {
        const rawDate = row[activeDateCol];
        if (rawDate) {
          const rowTime = new Date(rawDate).getTime();
          if (!isNaN(rowTime)) {
            if (startDate && rowTime < new Date(startDate).getTime()) return false;
            if (endDate) {
              const endObj = new Date(endDate);
              endObj.setHours(23, 59, 59, 999);
              if (rowTime > endObj.getTime()) return false;
            }
          }
        }
      }

      // In-Builder Column Filters
      return activeFilters.every(f => {
        const rawCell = row[f.col];
        const cell = String(rawCell ?? "").trim();
        const fv = f.val.trim();
        const op = f.op;

        if (op === "is-null") return rawCell === null || rawCell === undefined || cell === "";
        if (op === "is-not-null") return rawCell !== null && rawCell !== undefined && cell !== "";

        const numCell = Number(cell.replace(/[$,%]/g, ""));
        const numVal = Number(fv.replace(/[$,%]/g, ""));
        const isNumComp = !isNaN(numCell) && !isNaN(numVal) && fv !== "";

        if (op === "equals") {
          return isNumComp ? numCell === numVal : cell.toLowerCase() === fv.toLowerCase();
        }
        if (op === "not-equals") {
          return isNumComp ? numCell !== numVal : cell.toLowerCase() !== fv.toLowerCase();
        }
        if (op === "contains") {
          return cell.toLowerCase().includes(fv.toLowerCase());
        }
        if (op === "not-contains") {
          return !cell.toLowerCase().includes(fv.toLowerCase());
        }
        if (op === "starts-with") {
          return cell.toLowerCase().startsWith(fv.toLowerCase());
        }
        if (op === "ends-with") {
          return cell.toLowerCase().endsWith(fv.toLowerCase());
        }
        if (op === "greater") {
          return isNumComp ? numCell > numVal : cell > fv;
        }
        if (op === "less") {
          return isNumComp ? numCell < numVal : cell < fv;
        }
        if (op === "greater-equal") {
          return isNumComp ? numCell >= numVal : cell >= fv;
        }
        if (op === "less-equal") {
          return isNumComp ? numCell <= numVal : cell <= fv;
        }
        if (op === "between") {
          const parts = fv.split(",");
          const n1 = Number((parts[0] || "").trim());
          const n2 = Number((parts[1] || "").trim());
          if (!isNaN(n1) && !isNaN(n2) && !isNaN(numCell)) {
            return numCell >= Math.min(n1, n2) && numCell <= Math.max(n1, n2);
          }
          return true;
        }
        return true;
      });
    });
  }, [allRows, isUploaded, activeDateCol, startDate, endDate, activeFilters]);

  /* ── Dynamic Dataset Aggregation Engine ── */
  const { chartData, rawGroupedRows, scatterRawData, totalCategoryCount } = useMemo(() => {
    if (filteredRows.length === 0) {
      return { chartData: [], rawGroupedRows: {}, scatterRawData: [], totalCategoryCount: 0 };
    }

    const isBubble = activeChartType === "bubble";
    const zCol = yCols[1] || primaryY;
    const scatterData = filteredRows.slice(0, 300).map(row => {
      const xVal = Number(String(row[currentX] ?? "").replace(/[$,%]/g, ""));
      const yVal = Number(String(row[primaryY] ?? "").replace(/[$,%]/g, ""));
      const zVal = isBubble ? Number(String(row[zCol] ?? "").replace(/[$,%]/g, "")) : 10;
      return {
        x: isNaN(xVal) ? 0 : xVal,
        y: isNaN(yVal) ? 0 : yVal,
        z: isNaN(zVal) || zVal <= 0 ? 10 : zVal,
        name: String(row[currentX] ?? ""),
      };
    });

    const isXDate = columnTypeMap[currentX] === "date";
    const grouped: Record<string, Record<string, any[]>> = {};
    const groupedRawRecords: Record<string, Record<string, any>[]> = {};

    filteredRows.forEach(row => {
      let xKey = row[currentX] !== undefined && row[currentX] !== null ? String(row[currentX]).trim() : "Unspecified";
      if (!xKey) xKey = "Unspecified";

      if (isXDate && dateGrouping !== "raw") {
        xKey = formatDateValue(xKey, dateGrouping);
      }

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

    const grandTotals: Record<string, number> = {};
    if (measureType === "pct-total") {
      yCols.forEach(yCol => {
        const colVals = filteredRows.map(r => Number(String(r[yCol] ?? "").replace(/[$,%]/g, ""))).filter(n => !isNaN(n) && isFinite(n));
        grandTotals[yCol] = colVals.reduce((a, b) => a + b, 0) || 1;
      });
    }

    const dataPoints = keys.map((key, idx) => {
      const item: Record<string, any> = {
        label: key.length > 18 ? key.substring(0, 16) + "…" : key,
        fullLabel: key,
        color: palette[idx % palette.length],
      };

      yCols.forEach(yCol => {
        const rawVals = grouped[key][yCol] || [];
        const val = computeSmartAgg(rawVals, measureType, grandTotals[yCol] || 0);
        item[yCol] = val;
        if (yCols.length === 1) item.value = val;
      });
      return item;
    });

    if (sortOrder === "desc") {
      dataPoints.sort((a, b) => Number(b[primaryY] ?? b.value ?? 0) - Number(a[primaryY] ?? a.value ?? 0));
    } else if (sortOrder === "asc") {
      dataPoints.sort((a, b) => Number(a[primaryY] ?? a.value ?? 0) - Number(b[primaryY] ?? b.value ?? 0));
    }

    const totalCategories = dataPoints.length;
    const finalData = categoryLimit > 0 ? dataPoints.slice(0, categoryLimit) : dataPoints;

    return {
      chartData: finalData,
      rawGroupedRows: groupedRawRecords,
      scatterRawData: scatterData,
      totalCategoryCount: totalCategories,
    };
  }, [
    filteredRows, currentX, yCols, primaryY, measureType, sortOrder, palette,
    columnTypeMap, dateGrouping, activeChartType, categoryLimit
  ]);

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
    if (activeChartType !== "boxplot" || filteredRows.length === 0) return [];
    return chartData.map(d => {
      const rawVals = (rawGroupedRows[d.fullLabel || d.label] || [])
        .map(r => Number(String(r[primaryY] ?? "").replace(/[$,%]/g, "")))
        .filter(n => !isNaN(n) && isFinite(n))
        .sort((a, b) => a - b);
      if (rawVals.length === 0) return null;
      const q1 = rawVals[Math.floor(rawVals.length * 0.25)];
      const median = rawVals[Math.floor(rawVals.length * 0.5)];
      const q3 = rawVals[Math.floor(rawVals.length * 0.75)];
      const iqr = q3 - q1;
      const min = Math.max(rawVals[0], q1 - 1.5 * iqr);
      const max = Math.min(rawVals[rawVals.length - 1], q3 + 1.5 * iqr);
      return { label: d.label, fullLabel: d.fullLabel, min, q1, median, q3, max, color: d.color };
    }).filter(Boolean);
  }, [activeChartType, chartData, rawGroupedRows, primaryY]);

  /* ── Histogram Bins ── */
  const histogramBins = useMemo(() => {
    if (activeChartType !== "histogram" || filteredRows.length === 0) return [];
    const vals = filteredRows.map(r => Number(String(r[primaryY] ?? "").replace(/[$,%]/g, ""))).filter(n => !isNaN(n) && isFinite(n));
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const step = (max - min) / 6 || 1;
    return Array.from({ length: 6 }, (_, i) => {
      const start = min + i * step;
      const end = min + (i + 1) * step;
      const count = vals.filter(v => v >= start && v < (i === 5 ? end + 0.0001 : end)).length;
      return {
        label: `${Math.round(start)}-${Math.round(end)}`,
        value: count,
        color: palette[i % palette.length],
      };
    }).filter(b => b.value > 0);
  }, [activeChartType, filteredRows, primaryY, palette]);

  const maxGaugeValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map(d => Number(d[primaryY] ?? d.value ?? 0)), 1);
  }, [chartData, primaryY]);

  /* ── Intelligent Recommendation Engine ── */
  const recommendations = useMemo(() => {
    const list: { id: string; name: string; rationale: string }[] = [];
    const isXDate = columnTypeMap[currentX] === "date";
    const isXNumeric = columnTypeMap[currentX] === "numeric";
    const isYNumeric = columnTypeMap[primaryY] === "numeric";

    if (isXDate) {
      list.push({ id: "line", name: "Line Chart", rationale: "Temporal dimension detected: tracks continuous trend progression over time." });
      list.push({ id: "area", name: "Area Chart", rationale: "Visualizes cumulative volume buildup across timeline periods." });
    }

    if (yCols.length > 1) {
      list.push({ id: "combi", name: "Combo Chart", rationale: "Multiple measures selected: evaluates primary bars with secondary trend line." });
      list.push({ id: "stacked-bar", name: "Stacked Bar", rationale: "Compares aggregate totals broken down by measure components." });
    }

    if (isXNumeric && isYNumeric) {
      list.push({ id: "scatter", name: "Scatter Plot", rationale: "Both X and Y are numeric: reveals statistical correlations and clusters." });
    }

    if (!isXDate && chartData.length <= 7 && yCols.length === 1) {
      list.push({ id: "donut", name: "Donut Chart", rationale: "Compact category count: displays percentage contributions clearly." });
    }

    list.push({ id: "bar", name: "Bar Chart", rationale: "Standard categorical ranking across distinct values." });
    list.push({ id: "horizontal-bar", name: "Horizontal Bar", rationale: "Optimal readability for long labels and rank order." });

    const seen = new Set<string>();
    return list.filter(r => {
      if (seen.has(r.id) || r.id === activeChartType) return false;
      seen.add(r.id);
      return true;
    }).slice(0, 3);
  }, [columnTypeMap, currentX, primaryY, yCols, activeChartType, chartData.length]);

  /* ── Chart Validation Warnings ── */
  const chartValidationWarning = useMemo(() => {
    const isXNumeric = columnTypeMap[currentX] === "numeric";

    if ((activeChartType === "scatter" || activeChartType === "bubble") && !isXNumeric) {
      return {
        type: "warning",
        message: `Scatter and Bubble charts require a numeric Dimension (${currentX} is currently text/date) to plot X coordinates correctly.`,
      };
    }
    if (activeChartType === "combi" && yCols.length < 2) {
      return {
        type: "info",
        message: "Combo Chart shines when visualizing at least two measures (one as Bar, one as Line). Add another measure in the sidebar.",
      };
    }
    if ((activeChartType === "pie" || activeChartType === "donut") && chartData.length > 10) {
      return {
        type: "info",
        message: `Showing ${chartData.length} slices. Slices beyond 7 can become difficult to distinguish; consider using 'Top 5' or 'Top 10' in Category Limit.`,
      };
    }
    return null;
  }, [activeChartType, columnTypeMap, currentX, yCols.length, chartData.length]);

  /* ── Data-Grounded "Why this chart?" Contextual Explanation ── */
  const dynamicExplanation = useMemo(() => {
    const chartMeta = ALL_CHART_TYPES.find(c => c.id === activeChartType);
    const chartName = chartMeta?.name || "Chart";
    const xName = currentX;
    const yNames = yCols.join(", ");

    let statsSummary = "";
    if (chartData.length > 0) {
      const sortedByPrimary = [...chartData].sort((a, b) => Number(b[primaryY] ?? b.value ?? 0) - Number(a[primaryY] ?? a.value ?? 0));
      const top = sortedByPrimary[0];
      const bottom = sortedByPrimary[sortedByPrimary.length - 1];
      const total = chartData.reduce((acc, d) => acc + Number(d[primaryY] ?? d.value ?? 0), 0);
      const avg = chartData.length > 0 ? total / chartData.length : 0;

      statsSummary = `Top category is "${top?.fullLabel || top?.label}" with ${formatVal(Number(top?.[primaryY] ?? top?.value ?? 0), valueFormat, decimalPlaces, currencySymbol)}. Lowest is "${bottom?.fullLabel || bottom?.label}" (${formatVal(Number(bottom?.[primaryY] ?? bottom?.value ?? 0), valueFormat, decimalPlaces, currencySymbol)}). Total across ${chartData.length} categories: ${formatVal(total, valueFormat, decimalPlaces, currencySymbol)} (avg ${formatVal(avg, valueFormat, decimalPlaces, currencySymbol)}).`;
    }

    const isComparison = ["bar", "stacked-bar", "horizontal-bar", "radar", "combi"].includes(activeChartType);
    const isTrend = ["line", "multi-line", "area", "stacked-area"].includes(activeChartType);
    const isComposition = ["pie", "donut", "treemap"].includes(activeChartType);
    const isDistribution = ["scatter", "bubble", "histogram", "boxplot"].includes(activeChartType);
    const isKPI = ["kpi", "gauge"].includes(activeChartType);

    let rationale = "";
    let tip = "";

    if (isComparison) {
      rationale = `Comparing ${yNames} (${measureType.toUpperCase()}) across distinct ${xName} categories. ${chartName} reveals rankings and relative performance differences at a glance.`;
      tip = "Tip: Sort descending to spotlight high performers, or switch to Horizontal Bar if labels are long.";
    } else if (isTrend) {
      rationale = `Evaluating trajectory of ${yNames} across ${xName}. Ideal for visualizing continuity, momentum, and rate of change.`;
      tip = "Tip: Best when the X dimension has an inherent sequential order (e.g. chronological dates).";
    } else if (isComposition) {
      rationale = `Displaying relative segment proportions of ${primaryY} across ${xName}.`;
      tip = "Tip: Most effective with 2 to 7 slices. Hover over sections for precise percentage breakdown.";
    } else if (isDistribution) {
      rationale = `Examining dispersion, clusters, and statistical relationships for ${yNames} across ${xName}.`;
      tip = "Tip: Inspect outlier points lying noticeably outside the dominant group cluster.";
    } else if (isKPI) {
      rationale = `Providing quick executive summary numbers and operational target tracking.`;
      tip = "Tip: Click 'Save to Dashboard' to feature this metric on your team canvas.";
    } else {
      rationale = `Displaying tabular aggregated data matrix for ${currentX} against ${yNames}.`;
      tip = "Tip: Click table headers or toggle to chart view for visual pattern discovery.";
    }

    return { chartName, rationale, statsSummary, tip };
  }, [activeChartType, currentX, yCols, primaryY, measureType, chartData, valueFormat, decimalPlaces, currencySymbol]);

  /* ── Export Handlers ── */
  const exportChartPNG = () => {
    if (!chartContainerRef.current) {
      showToast("Chart container not ready for export.");
      return;
    }
    const svgEl = chartContainerRef.current.querySelector("svg");
    if (!svgEl) {
      showToast("Tabular/HTML views cannot be exported as SVG vector. Use Export CSV instead.");
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = 2;
        canvas.width = (svgEl.clientWidth || 800) * scale;
        canvas.height = (svgEl.clientHeight || 450) * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.scale(scale, scale);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, svgEl.clientWidth || 800, svgEl.clientHeight || 450);

        const pngURL = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${(customTitle || `${currentX}_vs_${primaryY}`).toLowerCase().replace(/\s+/g, "_")}.png`;
        downloadLink.href = pngURL;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
        showToast("High-resolution PNG downloaded!");
      };

      image.onerror = () => {
        showToast("PNG export failed. Rasterization error.");
      };

      image.src = blobURL;
    } catch (err) {
      showToast("PNG export error.");
    }
  };

  const exportConfigJSON = () => {
    const config = {
      title: customTitle || `${currentX} vs ${yCols.join(" & ")}`,
      subtitle: customSubtitle,
      chartType: activeChartType,
      dimension: currentX,
      measures: yCols,
      measureType,
      sortOrder,
      paletteKey,
      valueFormat,
      categoryLimit,
      dateGrouping,
      activeFilters,
      dateRange: { activeDateCol, startDate, endDate, dateRangePreset },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(customTitle || "chart_configuration").toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Chart specification JSON downloaded!");
  };

  const exportTableCSV = (mode: "aggregated" | "records" = tableViewType) => {
    if (mode === "records") {
      if (filteredRows.length === 0) return;
      const headers = columns.join(",");
      const rows = filteredRows.map(r =>
        columns.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")
      );
      const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const uri = encodeURI(csv);
      const link = document.createElement("a");
      link.href = uri;
      link.download = `${(customTitle || "source_records").toLowerCase().replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${filteredRows.length} source records as CSV.`);
      return;
    }

    if (chartData.length === 0) return;
    const headerRow = [currentX, ...yCols.map(c => `${c} (${measureType.toUpperCase()})`)].join(",");
    const dataRows = chartData.map(d => {
      const xVal = `"${String(d.fullLabel || d.label).replace(/"/g, '""')}"`;
      const yVals = yCols.map(c => Number(d[c] ?? 0));
      return [xVal, ...yVals].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, ...dataRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = `${(customTitle || "aggregated_data").toLowerCase().replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Aggregated table exported (${chartData.length} categories).`);
  };

  /* ── Save to Dashboard with Context & LocalStorage Persistence ── */
  const handleSaveToDashboard = () => {
    setIsSaving(true);
    try {
      const formattedData: DynamicChartItem[] = chartData.map(d => ({
        label: String(d.label),
        value: Number(d[primaryY] ?? d.value ?? 0),
        color: String(d.color || palette[0]),
      }));
      const title = customTitle || `${currentX} vs ${yCols.join(" & ")}`;

      updateChartVisual(title, formattedData);

      const savedChartsRaw = localStorage.getItem("datavista_saved_charts");
      const savedCharts: any[] = savedChartsRaw ? JSON.parse(savedChartsRaw) : [];
      const newChartEntry = {
        id: `chart_${Date.now()}`,
        title,
        subtitle: customSubtitle,
        chartType: activeChartType,
        xCol: currentX,
        yCols,
        measureType,
        savedAt: new Date().toISOString(),
        dataPreview: formattedData.slice(0, 10),
      };
      savedCharts.unshift(newChartEntry);
      localStorage.setItem("datavista_saved_charts", JSON.stringify(savedCharts.slice(0, 50)));

      showToast("Chart saved to Dashboard and stored locally!");
    } catch {
      showToast("Chart visual updated in session.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Clear Canvas Confirmation ── */
  const handleClearCanvas = () => {
    if (window.confirm("Reset canvas to default configuration? This clears custom filters, titles, and selections.")) {
      setSelectedX(columns.find(c => columnTypeMap[c] !== "numeric") || columns[0] || "");
      setSelectedYCols([]);
      setActiveChartType("bar");
      setMeasureType("sum");
      setActiveFilters([]);
      setCustomTitle("");
      setCustomSubtitle("");
      setStartDate("");
      setEndDate("");
      setDateRangePreset("all");
      setCategoryLimit(15);
      showToast("Canvas reset to default configuration.");
    }
  };

  const tooltipStyle = {
    backgroundColor: "var(--color-surface, #FFFFFF)",
    color: "var(--color-textPrimary, #0F172A)",
    borderRadius: "12px",
    borderColor: "var(--color-border, #E2E8F0)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    fontSize: "12px",
  };

  const CHART_MARGIN = { top: 20, right: 20, left: 10, bottom: 25 };

  /* ── Filtered Records for Source Records Table View ── */
  const displayedSourceRecords = useMemo(() => {
    if (!recordsSearch.trim()) return filteredRows.slice(0, 100);
    const q = recordsSearch.toLowerCase();
    return filteredRows
      .filter(row => columns.some(col => String(row[col] ?? "").toLowerCase().includes(q)))
      .slice(0, 100);
  }, [filteredRows, recordsSearch, columns]);

  /* ── UNIFIED CHART RENDERER (Supports all 23 Chart Types) ── */
  const renderActiveChart = (fullscreen = false) => {
    const height: number | `${number}%` = fullscreen ? "100%" : 360;

    if (chartData.length === 0 && !["scatter", "bubble", "histogram", "boxplot"].includes(activeChartType)) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px]">
          <div className="w-12 h-12 rounded-2xl bg-primary-soft/60 flex items-center justify-center text-primary mb-3">
            <Database className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-textPrimary">No data to visualize</h4>
          <p className="text-xs text-textSecondary max-w-sm mt-1">
            Adjust your active filters, choose a different X dimension, or expand the date range.
          </p>
        </div>
      );
    }

    /* BAR (Grouped / Stacked) */
    if (activeChartType === "bar" || activeChartType === "stacked-bar") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
        </ResponsiveContainer>
      );
    }

    /* HORIZONTAL BAR */
    if (activeChartType === "horizontal-bar") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart layout="vertical" data={chartData} margin={{ top: 20, right: 20, left: 35, bottom: 10 }} onClick={(e: any) => e?.activePayload && setShowDrillThroughModal(e.activePayload[0]?.payload)}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border, #E2E8F0)" />}
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
            <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} width={90} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
            {showLegend && <Legend verticalAlign="top" />}
            {yCols.map((yCol, i) => (
              <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[0, 6, 6, 0]} barSize={barWidth} isAnimationActive={false} />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    }

    /* LINE / MULTI-LINE */
    if (activeChartType === "line" || activeChartType === "multi-line") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
        </ResponsiveContainer>
      );
    }

    /* AREA / STACKED AREA */
    if (activeChartType === "area" || activeChartType === "stacked-area") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
        </ResponsiveContainer>
      );
    }

    /* PIE / DONUT */
    if (activeChartType === "pie" || activeChartType === "donut") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie data={chartData} dataKey={primaryY} nameKey="label" cx="50%" cy="50%" outerRadius={120} innerRadius={activeChartType === "donut" ? 60 : 0} paddingAngle={3} label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`} isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
            {showLegend && <Legend verticalAlign="top" />}
          </RechartsPieChart>
        </ResponsiveContainer>
      );
    }

    /* TREEMAP */
    if (activeChartType === "treemap") {
      return (
        <SvgTreemap
          data={chartData.map(d => ({
            label: d.label,
            fullLabel: d.fullLabel,
            value: Number(d[primaryY] ?? d.value ?? 0),
            color: d.color,
          }))}
          palette={palette}
          valueFormat={valueFormat}
          decimalPlaces={decimalPlaces}
          currencySymbol={currencySymbol}
          onItemClick={(item) => setShowDrillThroughModal(item)}
        />
      );
    }

    /* RADAR */
    if (activeChartType === "radar") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
        </ResponsiveContainer>
      );
    }

    /* SCATTER / BUBBLE */
    if (activeChartType === "scatter" || activeChartType === "bubble") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
            {activeChartType === "bubble" && (
              <ZAxis type="number" dataKey="z" range={[60, 420]} name={yCols[1] || primaryY} />
            )}
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
        </ResponsiveContainer>
      );
    }

    /* HISTOGRAM */
    if (activeChartType === "histogram") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={histogramBins} margin={CHART_MARGIN}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" name="Frequency" isAnimationActive={false} radius={[4, 4, 0, 0]}>
              {histogramBins.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    }

    /* COMBO (Bar + Line) */
    if (activeChartType === "combi") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
        </ResponsiveContainer>
      );
    }

    /* WATERFALL */
    if (activeChartType === "waterfall") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
        </ResponsiveContainer>
      );
    }

    /* HEATMAP */
    if (activeChartType === "heatmap") {
      return (
        <HeatmapMatrix
          data={chartData}
          yCols={yCols}
          palette={palette}
          valueFormat={valueFormat}
          decimalPlaces={decimalPlaces}
          currencySymbol={currencySymbol}
          onCellClick={(row) => setShowDrillThroughModal(row)}
        />
      );
    }

    /* MATRIX TABLE */
    if (activeChartType === "matrix") {
      return (
        <PivotMatrixTable
          data={chartData}
          currentX={currentX}
          yCols={yCols}
          measureType={measureType}
          valueFormat={valueFormat}
          decimalPlaces={decimalPlaces}
          currencySymbol={currencySymbol}
          onRowClick={(row) => setShowDrillThroughModal(row)}
        />
      );
    }

    /* FUNNEL */
    if (activeChartType === "funnel") {
      return (
        <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
          <FunnelChart
            data={chartData.map(d => ({ label: d.label, value: Number(d[primaryY] ?? d.value ?? 0), color: d.color }))}
            palette={palette}
          />
        </div>
      );
    }

    /* GAUGE */
    if (activeChartType === "gauge") {
      return (
        <div className="w-full h-full flex flex-wrap items-center justify-center gap-6 overflow-auto p-4">
          {yCols.map((yCol, i) => {
            const total = chartData.reduce((a, b) => a + Number(b[yCol] ?? 0), 0);
            const maxV = Math.max(maxGaugeValue, total) * 1.25;
            return (
              <GaugeChart key={yCol} value={total} maxValue={maxV} color={palette[i % palette.length]} label={yCol} />
            );
          })}
        </div>
      );
    }

    /* KPI CARD */
    if (activeChartType === "kpi") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-full items-center justify-center p-4 overflow-auto">
          {yCols.map((yCol, i) => {
            const total = chartData.reduce((a, b) => a + Number(b[yCol] ?? 0), 0);
            const avg = chartData.length > 0 ? total / chartData.length : 0;
            const maxV = Math.max(...chartData.map(d => Number(d[yCol] ?? 0)), 0);
            const minV = Math.min(...chartData.map(d => Number(d[yCol] ?? 0)), 0);
            return (
              <div key={yCol} className="p-5 bg-surface border border-border/80 rounded-2xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">{yCol}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                    {measureType.toUpperCase()}
                  </span>
                </div>
                <div className="text-3xl font-black tracking-tight" style={{ color: palette[i % palette.length] }}>
                  {formatVal(total, valueFormat, decimalPlaces, currencySymbol)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-textMuted border-t border-border/60 pt-2.5">
                  <div>Avg: <span className="text-textPrimary font-bold">{formatVal(avg, valueFormat, decimalPlaces, currencySymbol)}</span></div>
                  <div>Max: <span className="text-textPrimary font-bold">{formatVal(maxV, valueFormat, decimalPlaces, currencySymbol)}</span></div>
                  <div>Min: <span className="text-textPrimary font-bold">{formatVal(minV, valueFormat, decimalPlaces, currencySymbol)}</span></div>
                  <div>Categories: <span className="text-textPrimary font-bold">{chartData.length}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    /* TABLE */
    if (activeChartType === "table") {
      return (
        <div className="w-full h-full overflow-auto border border-border/80 rounded-xl bg-surface">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-primary-soft/40 sticky top-0 border-b border-border/80 backdrop-blur-xs">
              <tr>
                <th className="px-4 py-2.5 font-bold uppercase text-[11px] text-textSecondary tracking-wider">{currentX}</th>
                {yCols.map(c => (
                  <th key={c} className="px-4 py-2.5 font-bold uppercase text-[11px] text-textSecondary text-right tracking-wider">
                    {c} ({measureType.toUpperCase()})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 bg-surface">
              {chartData.map((d, i) => (
                <tr key={i} className="hover:bg-primary-soft/15 cursor-pointer transition-colors" onClick={() => setShowDrillThroughModal(d)}>
                  <td className="px-4 py-2.5 font-bold text-textPrimary">{d.fullLabel || d.label}</td>
                  {yCols.map(c => (
                    <td key={c} className="px-4 py-2.5 text-right font-mono text-textPrimary">
                      {formatVal(Number(d[c] ?? 0), valueFormat, decimalPlaces, currencySymbol)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    /* BOX PLOT */
    if (activeChartType === "boxplot") {
      return (
        <ResponsiveContainer width="100%" height={height}>
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
        </ResponsiveContainer>
      );
    }

    /* DEFAULT FALLBACK */
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={chartData} margin={CHART_MARGIN}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />}
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatVal(Number(v), valueFormat, decimalPlaces, currencySymbol)} />
          {yCols.map((yCol, i) => (
            <Bar key={yCol} dataKey={yCol} name={yCol} fill={palette[i % palette.length]} radius={[6, 6, 0, 0]} barSize={barWidth} isAnimationActive={false} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Visual Builder</h1>
          <p className="text-sm text-textSecondary mt-0.5">
            Build, customize, and analyze interactive charts from your active transformed dataset.
          </p>
        </div>
        {isUploaded && (
          <div className="flex gap-2.5 items-center flex-wrap">
            {toastMsg && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in duration-200 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {toastMsg}
              </span>
            )}
            <button
              onClick={handleClearCanvas}
              className="px-3.5 py-2 bg-surface text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/40 transition-all border border-border shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-textMuted" />
              Clear Canvas
            </button>
            <button
              onClick={handleSaveToDashboard}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving…" : "Save to Dashboard"}
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

            <CardContent className="pt-4 flex flex-col gap-4">
              {/* Chart Types */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-textPrimary">
                    Chart Type ({ALL_CHART_TYPES.length})
                  </label>
                  <span className="text-[10px] font-bold text-primary bg-primary-soft/60 px-2 py-0.5 rounded-md">
                    {ALL_CHART_TYPES.find(c => c.id === activeChartType)?.name || "Bar"}
                  </span>
                </div>

                {/* Family Categories Filter */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-2 scrollbar-none">
                  {["All", "Comparison", "Trend", "Composition", "Distribution", "Process", "KPI", "Data"].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setChartFamily(cat)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md shrink-0 cursor-pointer transition-colors ${
                        chartFamily === cat
                          ? "bg-primary text-white"
                          : "text-textSecondary hover:text-textPrimary hover:bg-primary-soft/40"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-textMuted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search 23 charts…"
                    value={chartSearch}
                    onChange={e => setChartSearch(e.target.value)}
                    className="w-full bg-surface text-textPrimary text-[11px] font-medium pl-8 pr-7 py-1.5 rounded-lg border border-border/70 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-textMuted"
                  />
                  {chartSearch && (
                    <button
                      type="button"
                      onClick={() => setChartSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary cursor-pointer"
                      aria-label="Clear chart search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-1.5 max-h-[190px] overflow-y-auto pr-1">
                  {filteredChartTypes.length === 0 ? (
                    <p className="col-span-2 text-xs text-textSecondary text-center py-4">No matching charts.</p>
                  ) : (
                    filteredChartTypes.map((type) => {
                      const IconComp = type.icon;
                      const isSelected = activeChartType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setActiveChartType(type.id)}
                          title={type.desc}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer group ${
                            isSelected
                              ? "border-primary bg-primary text-white font-bold shadow-xs scale-[1.02]"
                              : "border-border/80 hover:bg-primary-soft/30 text-textSecondary hover:text-textPrimary bg-surface"
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs truncate block">{type.name}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Data Field Selectors */}
              <div className="flex flex-col gap-3.5 pt-3 border-t border-border/60">
                {/* X-Axis Dimension */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-textPrimary">X-Axis (Dimension)</label>
                    <span className="text-[10px] font-semibold text-textMuted">
                      {columnTypeMap[currentX] === "date" ? "Date" : columnTypeMap[currentX] === "numeric" ? "Numeric" : "Text"}
                    </span>
                  </div>
                  <select
                    value={currentX}
                    onChange={(e) => setSelectedX(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs appearance-none cursor-pointer"
                  >
                    {columns.map((col, i) => (
                      <option key={i} value={col}>
                        {col} [{columnTypeMap[col] || "text"}]
                      </option>
                    ))}
                  </select>

                  {/* Temporal Grouping (if X is date) */}
                  {columnTypeMap[currentX] === "date" && (
                    <div className="mt-2 p-2 bg-primary-soft/30 rounded-xl border border-primary/20 flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date Grouping
                      </span>
                      <select
                        value={dateGrouping}
                        onChange={(e) => setDateGrouping(e.target.value as any)}
                        className="w-full border border-border/70 bg-surface text-textPrimary rounded-lg p-1.5 text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="raw">Exact Timestamp / Raw</option>
                        <option value="month">Month (e.g. Jan 2024)</option>
                        <option value="year">Year (e.g. 2024)</option>
                        <option value="dayOfWeek">Day of Week (e.g. Mon, Tue)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Y-Axis Multi Measures */}
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
                      <option key={i} value={col}>
                        {col} [{columnTypeMap[col] || "text"}]
                      </option>
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
                    <option value="median">Median Value</option>
                    <option value="min">Minimum Value</option>
                    <option value="max">Maximum Value</option>
                    <option value="count">Count of Records</option>
                    <option value="count-distinct">Count Distinct (Unique)</option>
                    <option value="stddev">Standard Deviation</option>
                    <option value="variance">Variance</option>
                    <option value="pct-total">% of Total</option>
                  </select>
                </div>

                {/* Category Limit (Top N) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-textPrimary">Category Limit</label>
                    {totalCategoryCount > 0 && (
                      <span className="text-[10px] text-textMuted font-semibold">
                        {categoryLimit > 0 ? `Top ${Math.min(categoryLimit, totalCategoryCount)} of ${totalCategoryCount}` : `${totalCategoryCount} total`}
                      </span>
                    )}
                  </div>
                  <select
                    value={categoryLimit}
                    onChange={(e) => setCategoryLimit(Number(e.target.value))}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-primary shadow-xs cursor-pointer"
                  >
                    <option value={5}>Top 5 Categories</option>
                    <option value={10}>Top 10 Categories</option>
                    <option value={15}>Top 15 Categories (Default)</option>
                    <option value={25}>Top 25 Categories</option>
                    <option value={50}>Top 50 Categories</option>
                    <option value={0}>All Categories (No Limit)</option>
                  </select>
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="flex-1 py-2 px-3 bg-surface hover:bg-primary-soft/30 border border-border/80 text-textSecondary hover:text-textPrimary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5 text-primary" />
                    Filter ({activeFilters.length + (startDate || endDate ? 1 : 0)})
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

          {/* Chart Canvas & Workspace */}
          <Card className="flex-1 flex flex-col min-h-[500px] border border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-surface/50">
              <div className="min-w-0 pr-2">
                <CardTitle className="text-base font-bold text-textPrimary truncate">
                  {customTitle || `${currentX} vs ${yCols.join(" & ")}`}
                </CardTitle>
                {customSubtitle ? (
                  <p className="text-xs text-textSecondary mt-0.5 font-medium truncate">{customSubtitle}</p>
                ) : (
                  <p className="text-[11px] text-textMuted mt-0.5">
                    {filteredRows.length.toLocaleString()} active rows filtered · {chartData.length} categories displayed
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* View Switcher: Chart vs Data Table */}
                <div className="flex items-center rounded-xl bg-primary-soft/40 p-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setViewMode("chart")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === "chart"
                        ? "bg-surface text-primary shadow-xs"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    <BarChartIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === "table"
                        ? "bg-surface text-primary shadow-xs"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Data Table</span>
                  </button>
                </div>

                {!showWhyChart && (
                  <button
                    type="button"
                    onClick={() => setShowWhyChart(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary-soft/60 px-2.5 py-1 rounded-lg border border-primary/20 hover:bg-primary-soft transition-colors cursor-pointer"
                    title="Show Why this chart explanation"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span className="hidden md:inline">Insight</span>
                  </button>
                )}

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title="Toggle Fullscreen"
                  className="p-1.5 text-textMuted hover:text-textPrimary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Export Action Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    title="Export options"
                    className="p-1.5 text-textMuted hover:text-textPrimary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer flex items-center"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-surface border border-border/80 rounded-xl shadow-xl z-30 py-1.5 text-xs animate-in fade-in duration-150">
                      <button
                        onClick={() => {
                          exportChartPNG();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-primary-soft/40 flex items-center gap-2 font-medium text-textPrimary cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-primary" />
                        Download Chart PNG
                      </button>
                      <button
                        onClick={() => {
                          exportTableCSV("aggregated");
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-primary-soft/40 flex items-center gap-2 font-medium text-textPrimary cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        Export Aggregated CSV
                      </button>
                      <button
                        onClick={() => {
                          exportTableCSV("records");
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-primary-soft/40 flex items-center gap-2 font-medium text-textPrimary cursor-pointer"
                      >
                        <Table className="w-3.5 h-3.5 text-indigo-600" />
                        Export Source Records CSV
                      </button>
                      <button
                        onClick={() => {
                          exportConfigJSON();
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-primary-soft/40 flex items-center gap-2 font-medium text-textPrimary cursor-pointer border-t border-border/60"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-500" />
                        Export Config (JSON)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 flex flex-col justify-start relative">
              {/* Contextual Recommendation Banner */}
              {recommendations.length > 0 && (
                <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-bold text-textMuted uppercase shrink-0 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-primary" /> Recommended:
                  </span>
                  {recommendations.map(rec => (
                    <button
                      key={rec.id}
                      onClick={() => setActiveChartType(rec.id)}
                      title={rec.rationale}
                      className="px-2.5 py-1 rounded-lg bg-primary-soft/60 hover:bg-primary text-primary hover:text-white border border-primary/20 text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>{rec.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chart Validation Warning (if any) */}
              {chartValidationWarning && (
                <div className={`mb-3 p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                  chartValidationWarning.type === "warning"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400"
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{chartValidationWarning.message}</span>
                </div>
              )}

              {/* "Why this chart?" Contextual Explanation Banner */}
              {showWhyChart && (
                <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-primary-soft/40 to-indigo-500/10 border border-primary/20 flex items-start justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-textPrimary tracking-tight">Why this chart: {dynamicExplanation.chartName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/20">
                          {currentX} vs {yCols.join(", ")}
                        </span>
                      </div>
                      <p className="text-textSecondary mt-1 leading-relaxed">{dynamicExplanation.rationale}</p>
                      {dynamicExplanation.statsSummary && (
                        <p className="text-textPrimary font-semibold mt-1 bg-surface/70 px-2.5 py-1 rounded-lg border border-border/50 text-[11px]">
                          {dynamicExplanation.statsSummary}
                        </p>
                      )}
                      <p className="text-[11px] text-textMuted mt-1 font-medium italic">{dynamicExplanation.tip}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWhyChart(false)}
                    className="text-textMuted hover:text-textPrimary p-1 rounded-lg hover:bg-primary-soft/40 transition-colors shrink-0 cursor-pointer"
                    title="Dismiss chart insight"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {viewMode === "table" ? (
                /* Accessible Dual-Mode Data Table View */
                <div className="flex-1 flex flex-col min-h-[380px] border border-border/70 rounded-xl overflow-hidden bg-surface shadow-xs">
                  {/* Table Sub-Mode Switcher */}
                  <div className="p-3 bg-surface/90 border-b border-border/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTableViewType("aggregated")}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          tableViewType === "aggregated"
                            ? "bg-primary text-white"
                            : "bg-primary-soft/40 text-textSecondary hover:text-textPrimary"
                        }`}
                      >
                        Aggregated Summary ({chartData.length})
                      </button>
                      <button
                        onClick={() => setTableViewType("records")}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          tableViewType === "records"
                            ? "bg-primary text-white"
                            : "bg-primary-soft/40 text-textSecondary hover:text-textPrimary"
                        }`}
                      >
                        Filtered Source Records ({filteredRows.length})
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {tableViewType === "records" && (
                        <div className="relative">
                          <Search className="w-3 h-3 text-textMuted absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search records…"
                            value={recordsSearch}
                            onChange={e => setRecordsSearch(e.target.value)}
                            className="bg-surface text-textPrimary text-[11px] pl-6 pr-2 py-1 rounded-lg border border-border/70 focus:outline-none focus:border-primary w-36"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => exportTableCSV(tableViewType)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-primary text-white hover:bg-primary-hover rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3 h-3" />
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {tableViewType === "aggregated" ? (
                    /* Aggregated Summary Table with Totals */
                    <div className="flex-1 overflow-auto max-h-[380px]">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-primary-soft/30 text-textSecondary sticky top-0 border-b border-border/80 backdrop-blur-xs">
                          <tr>
                            <th className="px-4 py-2.5 font-bold uppercase text-[11px] tracking-wider">{currentX}</th>
                            {yCols.map(col => (
                              <th key={col} className="px-4 py-2.5 font-bold uppercase text-[11px] tracking-wider text-right">{col} ({measureType.toUpperCase()})</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 bg-surface">
                          {chartData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-primary-soft/15 transition-colors">
                              <td className="px-4 py-2.5 font-semibold text-textPrimary flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color || palette[idx % palette.length] }} />
                                <span className="truncate">{row.fullLabel || row.label}</span>
                              </td>
                              {yCols.map(col => (
                                <td key={col} className="px-4 py-2.5 font-mono text-right text-textPrimary">
                                  {formatVal(Number(row[col] ?? 0), valueFormat, decimalPlaces, currencySymbol)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-primary-soft/40 border-t-2 border-primary/30 font-bold sticky bottom-0 backdrop-blur-xs">
                          <tr>
                            <td className="px-4 py-2.5 text-primary uppercase text-[11px] font-black">
                              Total ({chartData.length} categories)
                            </td>
                            {yCols.map(col => {
                              const colTotal = chartData.reduce((acc, row) => acc + Number(row[col] ?? 0), 0);
                              return (
                                <td key={col} className="px-4 py-2.5 font-mono text-right text-primary font-black">
                                  {formatVal(colTotal, valueFormat, decimalPlaces, currencySymbol)}
                                </td>
                              );
                            })}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    /* Filtered Source Records Table */
                    <div className="flex-1 overflow-auto max-h-[380px]">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-primary-soft/30 text-textSecondary sticky top-0 border-b border-border/80 backdrop-blur-xs">
                          <tr>
                            <th className="px-3.5 py-2 font-bold uppercase text-[10px] text-textMuted">#</th>
                            {columns.map(col => (
                              <th key={col} className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider text-textSecondary">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 bg-surface">
                          {displayedSourceRecords.map((row, idx) => (
                            <tr key={idx} className="hover:bg-primary-soft/15 transition-colors">
                              <td className="px-3.5 py-2 text-textMuted font-mono text-[10px]">{idx + 1}</td>
                              {columns.map(col => (
                                <td key={col} className="px-3.5 py-2 text-textPrimary font-medium">
                                  {String(row[col] ?? "-")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {displayedSourceRecords.length === 0 && (
                        <p className="text-center py-8 text-xs text-textSecondary">No matching source records found.</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Chart Canvas View Container */
                <div ref={chartContainerRef} className="w-full flex-1" style={{ height: "360px", minHeight: "340px" }}>
                  {renderActiveChart(false)}
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
                    <button key={fmt} onClick={() => setValueFormat(fmt)} className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize cursor-pointer ${valueFormat === fmt ? "bg-primary text-white border-primary" : "border-border"}`}>
                      {fmt === "currency" ? `${currencySymbol} Currency` : fmt === "percent" ? "% Percent" : "# Number"}
                    </button>
                  ))}
                </div>
              </div>
              {valueFormat === "currency" && (
                <div>
                  <label className="font-bold text-textPrimary block mb-1">Currency Symbol</label>
                  <input type="text" value={currencySymbol} onChange={e => setCurrencySymbol(e.target.value)} className="w-20 border border-border/80 bg-surface rounded-xl p-2 text-xs" />
                </div>
              )}
              <div>
                <label className="font-bold text-textPrimary block mb-1.5">Decimal Precision</label>
                <div className="flex gap-2">
                  {[0, 1, 2].map(dp => (
                    <button key={dp} onClick={() => setDecimalPlaces(dp)} className={`px-4 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${decimalPlaces === dp ? "bg-primary text-white border-primary" : "border-border"}`}>
                      {dp} Decimals
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-textPrimary block mb-1.5">Color Theme Palette</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PALETTES) as (keyof typeof PALETTES)[]).map(k => (
                    <button key={k} onClick={() => setPaletteKey(k)} className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${paletteKey === k ? "bg-primary text-white border-primary" : "border-border bg-surface text-textSecondary"}`}>
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

      {/* MODAL: Filters & Date Range */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowFilterModal(false)}>
          <div className="w-full max-w-lg bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-textPrimary">In-Builder Filters & Date Range</h3>
              </div>
              <button onClick={() => setShowFilterModal(false)} className="text-textMuted hover:text-textPrimary p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
              {/* Date Range Section */}
              {dateColumns.length > 0 && (
                <div className="p-3.5 bg-primary-soft/20 rounded-xl border border-primary/20 flex flex-col gap-2.5">
                  <span className="font-bold text-textPrimary flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Date Range Filter
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-textMuted block mb-0.5">Date Column</label>
                      <select
                        value={activeDateCol}
                        onChange={e => setActiveDateCol(e.target.value)}
                        className="w-full border border-border/70 bg-surface rounded-lg p-1.5 text-xs font-medium"
                      >
                        {dateColumns.map(dc => <option key={dc} value={dc}>{dc}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-textMuted block mb-0.5">Preset</label>
                      <select
                        value={dateRangePreset}
                        onChange={e => handleDatePresetChange(e.target.value as any)}
                        className="w-full border border-border/70 bg-surface rounded-lg p-1.5 text-xs font-medium"
                      >
                        <option value="all">All Dates (No filter)</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="mtd">Month to Date</option>
                        <option value="ytd">Year to Date</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-textMuted block mb-0.5">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => {
                          setStartDate(e.target.value);
                          setDateRangePreset("custom");
                        }}
                        className="w-full border border-border/70 bg-surface rounded-lg p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-textMuted block mb-0.5">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => {
                          setEndDate(e.target.value);
                          setDateRangePreset("custom");
                        }}
                        className="w-full border border-border/70 bg-surface rounded-lg p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filters List */}
              <div>
                <label className="font-bold text-textPrimary block mb-1.5">Active Dimension Rules</label>
                {activeFilters.length === 0 ? (
                  <p className="text-textMuted text-center py-2 text-xs">No active column rules. Add one below.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {activeFilters.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-primary-soft/30 p-2.5 rounded-xl border border-border/80">
                        <span className="font-bold text-textPrimary">
                          {f.col} <span className="text-primary">{f.op}</span> {f.op === "is-null" || f.op === "is-not-null" ? "" : `"${f.val}"`}
                        </span>
                        <button onClick={() => setActiveFilters(prev => prev.filter((_, idx) => idx !== i))} className="text-textMuted hover:text-rose-500 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Filter Rule Form */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                <span className="font-bold text-textPrimary">Add Filter Rule</span>
                <select value={filterCol || columns[0]} onChange={e => setFilterCol(e.target.value)} className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs">
                  {columns.map(c => <option key={c} value={c}>{c} [{columnTypeMap[c] || "text"}]</option>)}
                </select>
                <select value={filterOp} onChange={e => setFilterOp(e.target.value)} className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs">
                  <option value="contains">Contains (text)</option>
                  <option value="not-contains">Does Not Contain</option>
                  <option value="equals">Equals (exact)</option>
                  <option value="not-equals">Not Equals</option>
                  <option value="starts-with">Starts With</option>
                  <option value="ends-with">Ends With</option>
                  <option value="greater">Greater Than (&gt;)</option>
                  <option value="less">Less Than (&lt;)</option>
                  <option value="greater-equal">Greater or Equal (&ge;)</option>
                  <option value="less-equal">Less or Equal (&le;)</option>
                  <option value="between">Between (range)</option>
                  <option value="is-null">Is Null / Empty</option>
                  <option value="is-not-null">Is Not Null (populated)</option>
                </select>

                {filterOp === "between" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={filterVal}
                      onChange={e => setFilterVal(e.target.value)}
                      placeholder="Min value…"
                      className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={filterVal2}
                      onChange={e => setFilterVal2(e.target.value)}
                      placeholder="Max value…"
                      className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs"
                    />
                  </div>
                ) : filterOp !== "is-null" && filterOp !== "is-not-null" ? (
                  <input
                    type="text"
                    value={filterVal}
                    onChange={e => setFilterVal(e.target.value)}
                    placeholder="Filter value…"
                    className="w-full border border-border/80 bg-surface rounded-xl p-2 text-xs"
                  />
                ) : null}

                <button
                  onClick={() => {
                    const c = filterCol || columns[0];
                    if (filterOp === "is-null" || filterOp === "is-not-null") {
                      setActiveFilters([...activeFilters, { col: c, op: filterOp, val: "" }]);
                    } else if (filterOp === "between") {
                      if (filterVal.trim() && filterVal2.trim()) {
                        setActiveFilters([...activeFilters, { col: c, op: filterOp, val: `${filterVal.trim()},${filterVal2.trim()}` }]);
                        setFilterVal("");
                        setFilterVal2("");
                      }
                    } else if (filterVal.trim()) {
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
              {(activeFilters.length > 0 || startDate || endDate) && (
                <button
                  onClick={() => {
                    setActiveFilters([]);
                    setStartDate("");
                    setEndDate("");
                    setDateRangePreset("all");
                  }}
                  className="px-4 py-2 bg-rose-500/10 text-rose-500 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
              <button onClick={() => setShowFilterModal(false)} className="ml-auto px-5 py-2 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer">
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Drill-Through Inspector */}
      {showDrillThroughModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowDrillThroughModal(null)}>
          <div className="w-full max-w-2xl bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-primary-soft/30">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-textPrimary">Drill-Through: {showDrillThroughModal.fullLabel || showDrillThroughModal.label || showDrillThroughModal.name || "Category"}</h3>
                  <p className="text-[11px] text-textSecondary">
                    Underlying row records for this data point ({rawGroupedRows[showDrillThroughModal.fullLabel || showDrillThroughModal.label || showDrillThroughModal.name]?.length || 0} rows)
                  </p>
                </div>
              </div>
              <button onClick={() => setShowDrillThroughModal(null)} className="text-textMuted hover:text-textPrimary p-1 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-3 text-xs">
              {rawGroupedRows[showDrillThroughModal.fullLabel || showDrillThroughModal.label || showDrillThroughModal.name] ? (
                <div className="border border-border/80 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-primary-soft/30 border-b border-border/80">
                      <tr>{columns.map((c, i) => <th key={i} className="px-3.5 py-2 font-bold">{c}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 bg-surface">
                      {rawGroupedRows[showDrillThroughModal.fullLabel || showDrillThroughModal.label || showDrillThroughModal.name].slice(0, 100).map((r, i) => (
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

      {/* FULLSCREEN VIEW (Dynamically renders the active chart) */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-surface p-6 flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-bold text-textPrimary">{customTitle || `${currentX} vs ${yCols.join(" & ")}`}</h2>
              {customSubtitle && <p className="text-xs text-textSecondary">{customSubtitle}</p>}
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-primary-hover transition-colors"
            >
              Exit Fullscreen
            </button>
          </div>
          <div className="flex-1 w-full min-h-0">
            {renderActiveChart(true)}
          </div>
        </div>
      )}
    </div>
  );
}
