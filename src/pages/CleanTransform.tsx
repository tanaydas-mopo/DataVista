import { useState } from "react";
import { Filter, Trash2, Edit3, ArrowRightLeft, Type, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

const dataPreview = [
  { match_id: "335982", season: "2007/08", date: "2008-04-18", team1: "RCB", team2: "KKR", winner: "KKR" },
  { match_id: "335983", season: "2007/08", date: "2008-04-19", team1: "KXIP", team2: "CSK", winner: "CSK" },
  { match_id: "335984", season: "2007/08", date: "2008-04-19", team1: "DD", team2: "RR", winner: "DD" },
  { match_id: "335985", season: "2007/08", date: "2008-04-20", team1: "MI", team2: "RCB", winner: "RCB" },
  { match_id: "335986", season: "2007/08", date: "2008-04-20", team1: "KKR", team2: "DC", winner: "KKR" },
];

export function CleanTransform() {
  const [activeTab, setActiveTab] = useState("transform");

  const operations = [
    { icon: Filter, name: "Filter Rows", desc: "Keep or remove rows based on conditions" },
    { icon: Trash2, name: "Remove Duplicates", desc: "Delete identical rows" },
    { icon: ArrowRightLeft, name: "Find & Replace", desc: "Replace specific values in columns" },
    { icon: Type, name: "Change Data Type", desc: "Convert column types (e.g., text to date)" },
    { icon: Edit3, name: "Rename Columns", desc: "Change the headers of your dataset" },
    { icon: Sparkles, name: "Auto Clean", desc: "AI-powered data cleaning suggestions" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Clean & Transform</h1>
          <p className="text-sm text-textSecondary">Prepare your dataset for analysis and visualization.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
            Discard Changes
          </button>
          <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Apply Steps
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Operations Sidebar */}
        <Card className="lg:w-80 h-fit flex-shrink-0">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex space-x-4">
              <button
                className={`text-sm font-semibold pb-2 border-b-2 ${
                  activeTab === "transform" ? "border-primary text-primary" : "border-transparent text-textSecondary"
                }`}
                onClick={() => setActiveTab("transform")}
              >
                Transform
              </button>
              <button
                className={`text-sm font-semibold pb-2 border-b-2 ${
                  activeTab === "steps" ? "border-primary text-primary" : "border-transparent text-textSecondary"
                }`}
                onClick={() => setActiveTab("steps")}
              >
                Applied Steps (2)
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {activeTab === "transform" ? (
              <div className="flex flex-col gap-2">
                {operations.map((op, idx) => (
                  <button key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-200">
                    <div className="mt-0.5 bg-slate-100 p-1.5 rounded-md text-slate-600">
                      <op.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{op.name}</p>
                      <p className="text-xs text-textSecondary mt-0.5 leading-snug">{op.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="bg-white p-1 rounded-md text-slate-500 shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-textPrimary">Removed Duplicates</p>
                    <p className="text-xs text-textSecondary">12 rows removed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="bg-white p-1 rounded-md text-slate-500 shadow-sm">
                    <Type className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-textPrimary">Changed Type</p>
                    <p className="text-xs text-textSecondary">'date' column to Date</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Preview Area */}
        <Card className="flex-1 flex flex-col min-w-0">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle>Data Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-textSecondary sticky top-0 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">match_id</th>
                  <th className="px-4 py-3 font-medium">season</th>
                  <th className="px-4 py-3 font-medium">date</th>
                  <th className="px-4 py-3 font-medium">team1</th>
                  <th className="px-4 py-3 font-medium">team2</th>
                  <th className="px-4 py-3 font-medium">winner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataPreview.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-textPrimary">{row.match_id}</td>
                    <td className="px-4 py-3 text-textSecondary">{row.season}</td>
                    <td className="px-4 py-3 text-textSecondary">{row.date}</td>
                    <td className="px-4 py-3 text-textSecondary">{row.team1}</td>
                    <td className="px-4 py-3 text-textSecondary">{row.team2}</td>
                    <td className="px-4 py-3 font-medium text-textPrimary">{row.winner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
