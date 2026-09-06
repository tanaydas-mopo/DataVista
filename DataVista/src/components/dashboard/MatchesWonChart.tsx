"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useDataset } from "../../context/DatasetContext";
import {
  ChevronDown,
  MoreVertical,
  Download,
  Sliders,
  Table,
  Check,
  BarChart2,
  TrendingUp,
  Layers,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

export const MatchesWonChart = React.memo(function MatchesWonChart() {
  const { dataset } = useDataset();
  const router = useRouter();

  const [chartType, setChartType] = useState<"bar" | "line" | "area">("bar");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  const [showDataAlternative, setShowDataAlternative] = useState(false);

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const overflowMenuRef = useRef<HTMLDivElement>(null);

  const isDatasetActive = dataset.status === "active" && dataset.chartData.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node)) {
        setIsOverflowMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadSVG = () => {
    const svgElement = document.querySelector(".recharts-responsive-container svg");
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(dataset.chartTitle || "Chart").replace(/\s+/g, "_")}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOverflowMenuOpen(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-md p-3 shadow-xl text-xs">
          <p className="font-bold text-textPrimary mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-textSecondary">Total:</span>
            <span className="font-extrabold text-primary">
              {Number(payload[0].value).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex h-full flex-col shadow-xs border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
        <div>
          <CardTitle className="text-sm font-bold text-textPrimary flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            {dataset.chartTitle || "Matches Won by Team"}
          </CardTitle>
          <p className="text-[11px] text-textSecondary mt-0.5">
            Active aggregation: Sum of Wins by Franchise Team
          </p>
        </div>

        {isDatasetActive && (
          <div className="flex items-center gap-2">
            {/* Chart Type Selector Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                aria-expanded={isTypeDropdownOpen}
                aria-label="Change chart visual type"
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-textSecondary hover:text-textPrimary hover:bg-primary-soft/30 transition-all cursor-pointer shadow-2xs"
              >
                {chartType === "bar" && <BarChart2 className="w-3.5 h-3.5 text-primary" />}
                {chartType === "line" && <TrendingUp className="w-3.5 h-3.5 text-primary" />}
                {chartType === "area" && <Layers className="w-3.5 h-3.5 text-primary" />}
                <span className="capitalize">{chartType} View</span>
                <ChevronDown className="h-3 w-3 text-textMuted" />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-border bg-surface p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 text-xs">
                  {[
                    { id: "bar", label: "Bar Chart", icon: BarChart2 },
                    { id: "line", label: "Line Chart", icon: TrendingUp },
                    { id: "area", label: "Area Chart", icon: Layers },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setChartType(type.id as any);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        chartType === type.id ? "bg-primary-soft text-primary font-bold" : "text-textSecondary hover:bg-surface hover:text-textPrimary"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <type.icon className="w-3.5 h-3.5" />
                        {type.label}
                      </span>
                      {chartType === type.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chart Overflow Menu */}
            <div className="relative" ref={overflowMenuRef}>
              <button
                type="button"
                onClick={() => setIsOverflowMenuOpen(!isOverflowMenuOpen)}
                aria-expanded={isOverflowMenuOpen}
                aria-label="Chart options menu"
                className="p-1.5 rounded-xl border border-border bg-surface text-textSecondary hover:text-textPrimary hover:bg-primary-soft/30 transition-all cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isOverflowMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDataAlternative(!showDataAlternative);
                      setIsOverflowMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-textPrimary hover:bg-primary-soft hover:text-primary transition-colors cursor-pointer"
                  >
                    <Table className="w-3.5 h-3.5" />
                    {showDataAlternative ? "Show Visual Chart" : "View Plotted Data"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSVG}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-textPrimary hover:bg-primary-soft hover:text-primary transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download as SVG
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOverflowMenuOpen(false);
                      router.push("/visual-builder");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-textPrimary hover:bg-primary-soft hover:text-primary transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Configure in Builder
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 mt-4">
        {isDatasetActive ? (
          showDataAlternative ? (
            /* Accessible Data Table Alternative */
            <div className="h-[280px] overflow-y-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-primary-soft/20 text-textSecondary border-b border-border sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider">Dimension (Team)</th>
                    <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-right">Plotted Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {dataset.chartData.map((d, i) => (
                    <tr key={i} className="hover:bg-primary-soft/10 transition-colors">
                      <td className="px-4 py-2 font-semibold text-textPrimary">{d.label}</td>
                      <td className="px-4 py-2 text-right font-bold text-primary">{d.value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <RechartsLineChart data={dataset.chartData} margin={{ top: 20, right: 10, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#2563EB" }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                ) : chartType === "area" ? (
                  <RechartsAreaChart data={dataset.chartData} margin={{ top: 20, right: 10, left: 0, bottom: 25 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#areaGrad)" />
                  </RechartsAreaChart>
                ) : (
                  <RechartsBarChart data={dataset.chartData} margin={{ top: 20, right: 10, left: 0, bottom: 25 }} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                      {dataset.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#2563EB"} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                )}
              </ResponsiveContainer>
            </div>
          )
        ) : (
          <div className="h-[280px] w-full border-2 border-dashed border-border rounded-2xl bg-surface/50 flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-10 h-10 text-primary mb-2 opacity-80" />
            <p className="text-sm font-bold text-textPrimary">No Dataset Active</p>
            <p className="text-xs text-textSecondary max-w-xs mt-0.5">
              Upload a dataset to generate interactive charts and visual breakdowns.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
