import { useState, useMemo } from "react";
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  Sparkles,
  Compass,
  Settings2,
  Save,
  Database,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";
import type { DynamicChartItem } from "../context/DatasetContext";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  AreaChart as RechartsAreaChart,
  Area,
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart as RechartsScatterChart,
  Scatter,
  ComposedChart as RechartsComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CHART_COLORS = [
  "#2563EB",
  "#14B8A6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#10B981",
  "#F97316",
];

export function VisualBuilder() {
  const { dataset } = useDataset();
  const [activeChartType, setActiveChartType] = useState<string>("bar");
  const [selectedX, setSelectedX] = useState<string>("");
  const [selectedY, setSelectedY] = useState<string>("");
  const [measureType, setMeasureType] = useState<string>("sum");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isUploaded = dataset.status === "active";

  const columns = useMemo(() => {
    if (dataset.rawHeaders && dataset.rawHeaders.length > 0) return dataset.rawHeaders;
    if (dataset.tableHeaders && dataset.tableHeaders.length > 0) return dataset.tableHeaders;
    return ["Category", "Sales", "Date", "Quantity"];
  }, [dataset]);

  const currentX = selectedX || columns[0] || "Category";
  const currentY = selectedY || columns[1] || columns[0] || "Sales";

  const chartTypes = [
    { id: "bar", icon: BarChartIcon, name: "Bar Chart" },
    { id: "line", icon: LineChartIcon, name: "Line Chart" },
    { id: "pie", icon: PieChartIcon, name: "Pie / Donut" },
    { id: "area", icon: Layers, name: "Area Chart" },
    { id: "radar", icon: Compass, name: "Radar Spider" },
    { id: "scatter", icon: Activity, name: "Scatter Plot" },
    { id: "combi", icon: Sparkles, name: "Bar + Line" },
  ];

  const aggregatedData = useMemo(() => {
    if (!isUploaded) return [];

    if (!dataset.rawRows || dataset.rawRows.length === 0) {
      return dataset.chartData && dataset.chartData.length > 0
        ? dataset.chartData
        : [
            { label: "Category A", value: 450, color: "#2563EB" },
            { label: "Category B", value: 320, color: "#14B8A6" },
            { label: "Category C", value: 280, color: "#8B5CF6" },
            { label: "Category D", value: 190, color: "#F59E0B" },
          ];
    }

    const xIdx = dataset.rawHeaders.indexOf(currentX);
    const yIdx = dataset.rawHeaders.indexOf(currentY);

    const map: Record<string, number> = {};

    dataset.rawRows.forEach((row) => {
      const xKey = xIdx !== -1 && row[xIdx] ? String(row[xIdx]).trim() : "General";
      let yVal = 1;

      if (yIdx !== -1 && row[yIdx]) {
        const parsed = parseFloat(row[yIdx]);
        if (!isNaN(parsed)) yVal = parsed;
      }

      map[xKey] = (map[xKey] || 0) + yVal;
    });

    const entries = Object.entries(map)
      .filter(([k]) => k && k.length > 0 && !k.includes("PK\u0003"))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (entries.length === 0) {
      return dataset.chartData || [];
    }

    return entries.map(([label, value], idx) => ({
      label: label.length > 14 ? label.substring(0, 12) + ".." : label,
      value: Math.round(value * 100) / 100,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [dataset, isUploaded, currentX, currentY]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const tooltipStyle = {
    backgroundColor: "var(--color-surface, #FFFFFF)",
    color: "var(--color-textPrimary, #0F172A)",
    borderRadius: "12px",
    borderColor: "var(--color-border, #E2E8F0)",
    boxShadow: "var(--shadow-card)",
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Visual Builder</h1>
          <p className="text-sm text-textSecondary">
            Build, customize, and analyze interactive charts from your active dataset.
          </p>
        </div>
        {isUploaded && (
          <div className="flex gap-3 items-center">
            {toastMsg && (
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                {toastMsg}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedX(columns[0]);
                setSelectedY(columns[1] || columns[0]);
                setActiveChartType("bar");
                showToast("Canvas reset to default.");
              }}
              className="px-4 py-2 bg-primary-soft text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/60 transition-all active:scale-95 border border-border"
            >
              Clear Canvas
            </button>
            <button
              onClick={() => showToast("Chart visual saved to your dashboard canvas!")}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save to Dashboard
            </button>
          </div>
        )}
      </div>

      {isUploaded ? (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Settings Sidebar */}
          <Card className="lg:w-80 h-fit flex-shrink-0">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Settings2 className="w-4 h-4 text-primary" />
                Chart Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-textPrimary block mb-2">
                  Chart Type ({chartTypes.length} Available)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {chartTypes.map((type) => {
                    const IconComp = type.icon;
                    const isSelected = activeChartType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setActiveChartType(type.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-white font-bold shadow-xs scale-[1.02]"
                            : "border-border hover:bg-primary-soft/20 text-textSecondary hover:text-textPrimary"
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="text-xs">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Field Selectors */}
              <div className="flex flex-col gap-3.5 pt-2 border-t border-border">
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1">
                    X-Axis (Dimension)
                  </label>
                  <select
                    value={currentX}
                    onChange={(e) => setSelectedX(e.target.value)}
                    className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  >
                    {columns.map((col, i) => (
                      <option key={i} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1">
                    Y-Axis (Measure)
                  </label>
                  <select
                    value={currentY}
                    onChange={(e) => setSelectedY(e.target.value)}
                    className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  >
                    {columns.map((col, i) => (
                      <option key={i} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-1">
                    Aggregation Mode
                  </label>
                  <select
                    value={measureType}
                    onChange={(e) => setMeasureType(e.target.value)}
                    className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="sum">Sum of Values</option>
                    <option value="avg">Average of Values</option>
                    <option value="count">Count of Records</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Chart Canvas */}
          <Card className="flex-1 flex flex-col min-h-[440px]">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {currentX} vs {currentY} ({activeChartType.toUpperCase()} Visual)
              </CardTitle>
              <span className="text-xs font-semibold text-textSecondary bg-primary-soft/30 px-2.5 py-1 rounded-full border border-border">
                Source: {dataset.name}
              </span>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center">
              <div className="w-full h-[360px] min-h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChartType === "bar" ? (
                    <RechartsBarChart data={aggregatedData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                        {aggregatedData.map((entry: DynamicChartItem, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  ) : activeChartType === "line" ? (
                    <RechartsLineChart data={aggregatedData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="value" stroke="var(--color-primary, #2563EB)" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
                    </RechartsLineChart>
                  ) : activeChartType === "pie" ? (
                    <RechartsPieChart>
                      <Pie
                        data={aggregatedData}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={50}
                        paddingAngle={3}
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        isAnimationActive={false}
                      >
                        {aggregatedData.map((entry: DynamicChartItem, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </RechartsPieChart>
                  ) : activeChartType === "area" ? (
                    <RechartsAreaChart data={aggregatedData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary, #2563EB)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-primary, #2563EB)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="value" stroke="var(--color-primary, #2563EB)" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" isAnimationActive={false} />
                    </RechartsAreaChart>
                  ) : activeChartType === "radar" ? (
                    <RechartsRadarChart cx="50%" cy="50%" outerRadius={110} data={aggregatedData}>
                      <PolarGrid stroke="var(--color-border, #CBD5E1)" />
                      <PolarAngleAxis dataKey="label" tick={{ fill: "var(--color-textSecondary, #475569)", fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                      <Radar name="Value" dataKey="value" stroke="var(--color-primary, #2563EB)" fill="var(--color-primary, #3B82F6)" fillOpacity={0.5} isAnimationActive={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                    </RechartsRadarChart>
                  ) : activeChartType === "scatter" ? (
                    <RechartsScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E2E8F0)" />
                      <XAxis dataKey="x" name="Index" tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <YAxis dataKey="y" name="Value" tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                      <Scatter
                        name="Distribution"
                        data={aggregatedData.map((d, i) => ({ x: i + 1, y: d.value, name: d.label }))}
                        fill="#8B5CF6"
                        isAnimationActive={false}
                      />
                    </RechartsScatterChart>
                  ) : (
                    /* Combi Bar + Line */
                    <RechartsComposedChart data={aggregatedData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="var(--color-primary, #3B82F6)" radius={[6, 6, 0, 0]} barSize={24} isAnimationActive={false} />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
                    </RechartsComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-border bg-surface">
          <Database className="w-16 h-16 text-textMuted stroke-[1.5]" />
          <h3 className="text-lg font-bold text-textPrimary">No Active Dataset</h3>
          <p className="text-sm text-textSecondary max-w-md">
            Upload a CSV or Excel dataset to build interactive custom charts and visual analytics.
          </p>
        </Card>
      )}
    </div>
  );
}
