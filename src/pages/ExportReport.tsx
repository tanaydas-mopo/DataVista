import { useState } from "react";
import { FileText, Download, Image as ImageIcon, FileSpreadsheet, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

export function ExportReport() {
  const [exportFormat, setExportFormat] = useState("pdf");

  const formats = [
    { id: "pdf", icon: FileText, name: "PDF Document", desc: "Best for sharing and printing" },
    { id: "png", icon: ImageIcon, name: "PNG Image", desc: "High quality dashboard image" },
    { id: "csv", icon: FileSpreadsheet, name: "CSV Data", desc: "Raw data export for Excel" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-8 h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Export Report</h1>
          <p className="text-sm text-textSecondary">Download your dashboards and insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Settings */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            
            <div>
              <label className="text-sm font-semibold text-textPrimary block mb-3">Select Format</label>
              <div className="flex flex-col gap-3">
                {formats.map((format) => (
                  <label
                    key={format.id}
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                      exportFormat === format.id 
                        ? "border-primary bg-primary-soft/30" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.id}
                      checked={exportFormat === format.id}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-textPrimary font-medium">
                        <format.icon className="w-4 h-4 text-slate-500" />
                        {format.name}
                      </div>
                      <p className="text-xs text-textSecondary mt-1">{format.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {exportFormat === "pdf" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-2">Page Size</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-textPrimary focus:outline-none focus:border-primary">
                    <option>A4</option>
                    <option>Letter</option>
                    <option>Legal</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-textPrimary block mb-2">Orientation</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-textPrimary focus:outline-none focus:border-primary">
                    <option>Landscape</option>
                    <option>Portrait</option>
                  </select>
                </div>
              </div>
            )}

            <button className="w-full mt-2 px-4 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Download className="w-5 h-5" />
              Download Report
            </button>
            
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="h-fit bg-slate-50 border-dashed">
          <CardHeader className="pb-4">
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`border border-slate-200 bg-white shadow-sm flex items-center justify-center p-8 mx-auto transition-all ${
              exportFormat === "pdf" ? "aspect-[1/1.414] w-[60%]" : "aspect-[16/9] w-full rounded-lg"
            }`}>
              <div className="text-center opacity-30">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-bold text-slate-500">
                  {exportFormat === "pdf" ? "PDF Document Preview" : exportFormat === "png" ? "Image Preview" : "CSV Data Preview"}
                </p>
                <p className="text-sm text-slate-400 mt-2">Generated from current dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
