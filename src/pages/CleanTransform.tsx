import { useState } from "react";
import { Filter, Trash2, Edit3, ArrowRightLeft, Type, Sparkles, CheckCircle2, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";

export function CleanTransform() {
  const { dataset } = useDataset();
  const [activeTab, setActiveTab] = useState("transform");

  const isUploaded = dataset.status === "active";

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
        {isUploaded && (
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-primary-soft text-textPrimary text-xs font-bold rounded-xl hover:bg-primary-soft/60 transition-colors border border-border">
              Discard Changes
            </button>
            <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              Apply Steps
            </button>
          </div>
        )}
      </div>

      {isUploaded ? (
        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Operations Sidebar */}
          <Card className="lg:w-80 h-fit flex-shrink-0">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex space-x-4">
                <button
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors ${
                    activeTab === "transform" ? "border-primary text-primary" : "border-transparent text-textSecondary"
                  }`}
                  onClick={() => setActiveTab("transform")}
                >
                  Transform
                </button>
                <button
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors ${
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
                    <button key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary-soft/30 transition-all text-left border border-transparent hover:border-border">
                      <div className="mt-0.5 bg-primary-soft p-1.5 rounded-lg text-primary">
                        <op.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-textPrimary">{op.name}</p>
                        <p className="text-xs text-textSecondary mt-0.5 leading-snug">{op.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                    <div className="bg-primary-soft p-1.5 rounded-lg text-primary shadow-xs">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-textPrimary">Trimmed Whitespace</p>
                      <p className="text-xs text-textSecondary">Cleaned text fields in {dataset.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
                    <div className="bg-primary-soft p-1.5 rounded-lg text-primary shadow-xs">
                      <Type className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-textPrimary">Verified Column Data Types</p>
                      <p className="text-xs text-textSecondary">{dataset.totalColumns} columns indexed</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Preview Area */}
          <Card className="flex-1 flex flex-col min-w-0">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Data Preview — {dataset.name}</CardTitle>
              <span className="text-xs text-textSecondary bg-primary-soft/30 px-2.5 py-1 rounded-full border border-border font-semibold">
                {dataset.totalRows} rows loaded
              </span>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-primary-soft/20 text-textSecondary sticky top-0 shadow-xs border-b border-border">
                  <tr>
                    {dataset.tableHeaders.map((header, idx) => (
                      <th key={idx} className="px-4 py-3 font-bold uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {dataset.tableRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-primary-soft/10 transition-colors">
                      {dataset.tableHeaders.map((header, colIdx) => (
                        <td key={colIdx} className="px-4 py-3 text-textPrimary font-medium">
                          {row[header] !== undefined ? String(row[header]) : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed border-border bg-surface">
          <Database className="w-16 h-16 text-textMuted stroke-[1.5]" />
          <h3 className="text-lg font-bold text-textPrimary">No Active Dataset</h3>
          <p className="text-sm text-textSecondary max-w-md">
            Upload a CSV, Excel, or JSON dataset on the Dashboard to perform data cleaning, filtering, and transformation operations.
          </p>
        </Card>
      )}
    </div>
  );
}
