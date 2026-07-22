import { LayoutGrid, Type, Image as ImageIcon, BarChart2, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

export function DashboardCanvas() {
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
          <p className="text-sm text-textSecondary">Drag and drop widgets to build your interactive dashboard.</p>
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
            {widgetTypes.map((widget, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary-soft cursor-grab active:cursor-grabbing transition-colors"
                draggable
              >
                <div className="flex items-center gap-3">
                  <widget.icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-textPrimary">{widget.name}</span>
                </div>
                <Plus className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-100/50 rounded-xl border-2 border-dashed border-slate-300 p-6 overflow-y-auto min-h-[500px]">
          <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">
            {/* KPI Widget placed on canvas */}
            <div className="col-span-12 lg:col-span-12 row-span-1 bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex items-center justify-between group relative">
              <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="flex justify-around w-full">
                <div className="text-center">
                  <p className="text-xs text-textSecondary font-medium">Total Matches</p>
                  <p className="text-2xl font-bold text-textPrimary mt-1">74</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-8">
                  <p className="text-xs text-textSecondary font-medium">Total Runs</p>
                  <p className="text-2xl font-bold text-textPrimary mt-1">18,523</p>
                </div>
                <div className="text-center border-l border-slate-100 pl-8">
                  <p className="text-xs text-textSecondary font-medium">Avg Score</p>
                  <p className="text-2xl font-bold text-textPrimary mt-1">125.6</p>
                </div>
              </div>
            </div>

            {/* Chart Widget 1 */}
            <div className="col-span-12 lg:col-span-8 row-span-3 bg-white border border-slate-200 shadow-sm rounded-xl p-4 group relative flex flex-col">
              <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <h3 className="text-sm font-semibold text-textPrimary mb-4">Matches Won by Team</h3>
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-16 h-16 text-slate-300" />
              </div>
            </div>

            {/* Text Widget */}
            <div className="col-span-12 lg:col-span-4 row-span-3 bg-white border border-slate-200 shadow-sm rounded-xl p-4 group relative flex flex-col">
              <div className="absolute inset-0 border-2 border-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <h3 className="text-sm font-semibold text-textPrimary mb-2">Analysis Summary</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                This dashboard shows the overall performance of teams across all seasons. CSK and MI have dominated with 18 and 16 wins respectively. 
                <br /><br />
                The average score remains stable around 125.64, though specific venues show higher scoring patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
