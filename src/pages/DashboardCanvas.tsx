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
import { useNavigate } from "react-router-dom";

export function DashboardCanvas() {
  const { dataset } = useDataset();
  const navigate = useNavigate();
  const isDatasetActive = dataset.status === "active";

  const widgetTypes = [
    { icon: BarChart2, name: "Chart Widget" },
    { icon: Type, name: "Text Box" },
    { icon: ImageIcon, name: "Image" },
    { icon: LayoutGrid, name: "KPI Grid" },
  ];

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
          <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
            Preview
          </button>
          <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
            Publish
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Widget Sidebar */}
        <Card className="lg:w-64 h-fit flex-shrink-0">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm">Widgets</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3">
            {widgetTypes.map((widget, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary-soft cursor-grab active:cursor-grabbing transition-colors"
                draggable
              >
                <div className="flex items-center gap-3">
                  <widget.icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-textPrimary">
                    {widget.name}
                  </span>
                </div>
                <Plus className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-300 p-6 overflow-y-auto min-h-[500px]">
          {!isDatasetActive ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/60 rounded-xl backdrop-blur-sm">
              <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
                <Database className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                No Active Dataset Loaded
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Upload a CSV, Excel, or JSON dataset to dynamically populate your dashboard canvas widgets.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 auto-rows-[auto]">
              {/* Dynamic KPI Widget placed on canvas */}
              <div className="col-span-12 row-span-1 bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex items-center justify-between group relative">
                <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full divide-x divide-slate-100">
                  {(dataset.kpis || []).map((kpi: DynamicKpi, idx: number) => (
                    <div
                      key={kpi.id || idx}
                      className={`text-center ${idx > 0 ? "pl-4" : ""}`}
                    >
                      <p className="text-xs text-textSecondary font-medium truncate">
                        {kpi.label}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-textPrimary mt-1">
                        {kpi.value}
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {kpi.trend}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Chart Widget */}
              <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-xl p-5 group relative flex flex-col min-h-[320px]">
                <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <h3 className="text-sm font-semibold text-textPrimary mb-4">
                  {dataset.chartTitle || "Visual Analysis"}
                </h3>
                <div className="flex-1 w-full h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={dataset.chartData || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={{ stroke: "#CBD5E1" }}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#E2E8F0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
              <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl p-5 group relative flex flex-col">
                <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <h3 className="text-sm font-semibold text-textPrimary mb-2">
                  Analysis Summary
                </h3>
                <div className="text-xs text-textSecondary leading-relaxed space-y-3">
                  <p>
                    <strong className="text-slate-800">Dataset:</strong> {dataset.name}
                  </p>
                  <p>
                    This custom canvas is dynamically linked to your active dataset. It currently tracks <strong className="text-slate-800">{dataset.totalRows}</strong> rows and <strong className="text-slate-800">{dataset.totalColumns}</strong> columns.
                  </p>
                  <p className="p-3 bg-blue-50/60 rounded-lg text-blue-900 border border-blue-100">
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
