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
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Settings className="w-5 h-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <label className="text-xs font-bold text-textPrimary block mb-3">Select Format</label>
              <div className="flex flex-col gap-3">
                {formats.map((format) => (
                  <label
                    key={format.id}
                    className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
                      exportFormat === format.id 
                        ? "border-primary bg-primary-soft/30 shadow-xs" 
                        : "border-border bg-surface hover:border-borderStrong hover:bg-primary-soft/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.id}
                      checked={exportFormat === format.id}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mt-1 text-primary focus:ring-primary h-4 w-4"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-textPrimary font-bold text-sm">
                        <format.icon className="w-4 h-4 text-primary" />
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
                  <label className="text-xs font-bold text-textPrimary block mb-2">Page Size</label>
                  <select className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary">
                    <option>A4</option>
                    <option>Letter</option>
                    <option>Legal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-2">Orientation</label>
                  <select className="w-full border border-border bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary">
                    <option>Landscape</option>
                    <option>Portrait</option>
                  </select>
                </div>
              </div>
            )}

            <button className="w-full mt-2 px-4 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="h-fit bg-surface border-dashed">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold">Preview</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className={`border border-border bg-primary-soft/10 shadow-xs flex items-center justify-center p-8 mx-auto transition-all rounded-2xl ${
              exportFormat === "pdf" ? "aspect-[1/1.414] w-[65%]" : "aspect-[16/9] w-full"
            }`}>
              <div className="text-center">
                <FileText className="w-14 h-14 mx-auto mb-4 text-primary opacity-60" />
                <p className="text-base font-bold text-textPrimary">
                  {exportFormat === "pdf" ? "PDF Document Preview" : exportFormat === "png" ? "Image Preview" : "CSV Data Preview"}
                </p>
                <p className="text-xs text-textSecondary mt-2">Generated from current dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
