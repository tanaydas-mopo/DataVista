import { useState } from "react";
import { BarChart, LineChart, PieChart, Activity, Settings2, Save, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";

export function VisualBuilder() {
  const { dataset } = useDataset();
  const [activeChartType, setActiveChartType] = useState("bar");

  const isUploaded = dataset.status === "active";

  const chartTypes = [
    { id: "bar", icon: BarChart, name: "Bar" },
    { id: "line", icon: LineChart, name: "Line" },
    { id: "pie", icon: PieChart, name: "Pie" },
    { id: "scatter", icon: Activity, name: "Scatter" },
  ];

  const columns = dataset.tableHeaders.length > 0 ? dataset.tableHeaders : ["Category", "Sales", "Date", "Quantity"];

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Visual Builder</h1>
          <p className="text-sm text-textSecondary">Create custom charts and visualizations from your datasets.</p>
        </div>
        {isUploaded && (
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
              Clear Canvas
            </button>
            <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2">
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
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Chart Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-6">
              
              {/* Chart Type Selection */}
              <div>
                <label className="text-sm font-semibold text-textPrimary block mb-2">Chart Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {chartTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveChartType(type.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                        activeChartType === type.id
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-slate-200 hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      <type.icon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Mapping */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-1">X-Axis (Dimension)</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm text-textPrimary focus:outline-none focus:border-primary">
                    {columns.map((col, i) => (
                      <option key={i} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-1">Y-Axis (Measure)</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm text-textPrimary focus:outline-none focus:border-primary">
                    <option value="count">Count of {columns[0]}</option>
                    {columns.length > 1 && <option value="sum">Sum of {columns[1]}</option>}
                    {columns.length > 2 && <option value="avg">Avg of {columns[2]}</option>}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-1">Color (Group By)</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-sm text-textPrimary focus:outline-none focus:border-primary">
                    <option value="none">None</option>
                    {columns.map((col, i) => (
                      <option key={i} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
              
            </CardContent>
          </Card>

          {/* Visualization Area */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle>{dataset.chartTitle} ({activeChartType.toUpperCase()} Visual)</CardTitle>
              <span className="text-xs text-slate-500">Source: {dataset.name}</span>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex items-center justify-center min-h-[400px]">
              <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center relative p-8">
                {activeChartType === "bar" && <BarChart className="w-28 h-28 text-blue-400 opacity-60" />}
                {activeChartType === "line" && <LineChart className="w-28 h-28 text-emerald-400 opacity-60" />}
                {activeChartType === "pie" && <PieChart className="w-28 h-28 text-purple-400 opacity-60" />}
                {activeChartType === "scatter" && <Activity className="w-28 h-28 text-amber-400 opacity-60" />}
                <p className="text-sm font-bold text-slate-600 mt-4">Rendering Visualization for {dataset.name}</p>
                <p className="text-xs text-slate-400 mt-1">Configured for {columns[0] || "Category"} vs {columns[1] || "Value"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-slate-200 bg-slate-50">
          <Database className="w-16 h-16 text-slate-300 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-slate-700">No Active Dataset</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Upload a CSV or Excel dataset to build custom charts and visual analytics.
          </p>
        </Card>
      )}
    </div>
  );
}
