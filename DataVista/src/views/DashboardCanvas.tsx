"use client";

import {
  LayoutGrid,
  Type,
  Image as ImageIcon,
  BarChart2,
  Plus,
  Database,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";
import type { DynamicKpi, DynamicChartItem } from "../context/DatasetContext";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";

export function DashboardCanvas() {
  const { dataset } = useDataset();
  const router = useRouter();
  const isDatasetActive = dataset.status === "active";

  const widgetTypes = [
    { icon: BarChart2, name: "Chart Widget" },
    { icon: Type, name: "Text Box" },
    { icon: ImageIcon, name: "Image" },
    { icon: LayoutGrid, name: "KPI Grid" },
  ];

  const tooltipStyle = {
    backgroundColor: "var(--color-surface, #FFFFFF)",
    color: "var(--color-textPrimary, #0F172A)",
    borderRadius: "12px",
    borderColor: "var(--color-border, #E2E8F0)",
    boxShadow: "var(--shadow-card)",
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Dashboard Canvas</h1>
          <p className="text-sm text-textSecondary">
            Drag and drop widgets to build your interactive dashboard.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-primary-soft text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/60 transition-colors border border-border">
            Preview
          </button>
          <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm">
            Publish
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Widget Sidebar */}
        <Card className="lg:w-64 h-fit flex-shrink-0">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-xs font-bold uppercase tracking-wider">Widgets</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3">
            {widgetTypes.map((widget, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-border bg-surface rounded-xl hover:border-primary hover:bg-primary-soft/20 cursor-grab active:cursor-grabbing transition-all"
                draggable
              >
                <div className="flex items-center gap-3">
                  <widget.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-textPrimary">
                    {widget.name}
                  </span>
                </div>
                <Plus className="w-4 h-4 text-textMuted" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <div className="flex-1 bg-surface/50 rounded-2xl border-2 border-dashed border-border p-6 overflow-y-auto min-h-[500px]">
          {!isDatasetActive ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-surface rounded-2xl border border-border">
              <div className="p-4 rounded-full bg-primary-soft text-primary mb-4">
                <Database className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-1">
                No Active Dataset Loaded
              </h3>
              <p className="text-xs text-textSecondary max-w-sm mb-6">
                Upload a CSV, Excel, or JSON dataset to dynamically populate your dashboard canvas widgets.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-hover shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 auto-rows-[auto]">
              {/* Dynamic KPI Widget placed on canvas */}
              <div className="col-span-12 row-span-1 bg-surface border border-border shadow-xs rounded-2xl p-5 flex items-center justify-between group relative">
                <div className="absolute inset-0 border-2 border-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full divide-x divide-border">
                  {(dataset.kpis || []).map((kpi: DynamicKpi, idx: number) => (
                    <div
                      key={kpi.id || idx}
                      className={`text-center ${idx > 0 ? "pl-4" : ""}`}
                    >
                      <p className="text-xs text-textSecondary font-semibold truncate">
                        {kpi.label}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-textPrimary mt-1">
                        {kpi.value}
                      </p>
                      <span className="text-[11px] font-bold text-emerald-500">
                        {kpi.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Chart Widget */}
              <div className="col-span-12 lg:col-span-8 bg-surface border border-border shadow-xs rounded-2xl p-5 group relative flex flex-col min-h-[320px]">
                <div className="absolute inset-0 border-2 border-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <h3 className="text-sm font-bold text-textPrimary mb-4">
                  {dataset.chartTitle || "Visual Analysis"}
                </h3>
                <div className="flex-1 w-full h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={dataset.chartData || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #E2E8F0)" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "var(--color-textSecondary, #64748B)", fontSize: 11 }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                        {(dataset.chartData || []).map((entry: DynamicChartItem, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || "#2563EB"}
                          />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dynamic Text Widget / Summary */}
              <div className="col-span-12 lg:col-span-4 bg-surface border border-border shadow-xs rounded-2xl p-5 group relative flex flex-col">
                <div className="absolute inset-0 border-2 border-primary rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <h3 className="text-sm font-bold text-textPrimary mb-2">
                  Analysis Summary
                </h3>
                <div className="text-xs text-textSecondary leading-relaxed space-y-3">
                  <p>
                    <strong className="text-textPrimary font-bold">Dataset:</strong> {dataset.name}
                  </p>
                  <p>
                    This custom canvas is dynamically linked to your active dataset. It currently tracks <strong className="text-textPrimary font-bold">{dataset.totalRows}</strong> rows and <strong className="text-textPrimary font-bold">{dataset.totalColumns}</strong> columns.
                  </p>
                  <p className="p-3 bg-primary-soft text-primary rounded-xl border border-primary/20 font-medium">
                    💡 All metric cards and visual widgets automatically update in real-time as you upload new CSV or Excel files.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
