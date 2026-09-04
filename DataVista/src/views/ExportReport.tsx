"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
  Settings,
  Sparkles,
  CheckCircle2,
  Table,
  BarChart2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";

export function ExportReport() {
  const { dataset } = useDataset();
  const [exportFormat, setExportFormat] = useState<"pdf" | "png" | "csv">("pdf");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("Landscape");
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formats = [
    { id: "pdf", icon: FileText, name: "PDF Document", desc: "Formatted executive report for sharing and printing" },
    { id: "png", icon: ImageIcon, name: "PNG Image Snapshot", desc: "High quality 1200x800 visual snapshot" },
    { id: "csv", icon: FileSpreadsheet, name: "CSV Data Export", desc: "Raw structured dataset table export for Excel" },
  ];

  const handleDownload = () => {
    setIsExporting(true);
    const fileNameBase = (dataset.name || "DataVista_Analytics").replace(/\.[^/.]+$/, "");

    try {
      if (exportFormat === "csv") {
        const headers = dataset.tableHeaders.length > 0 ? dataset.tableHeaders : ["Column 1", "Column 2"];
        const rows = dataset.tableRows.length > 0 ? dataset.tableRows : [];
        let csvContent = headers.join(",") + "\n";
        rows.forEach((r) => {
          csvContent += headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileNameBase}_Export.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`CSV file "${fileNameBase}_Export.csv" downloaded successfully!`);
      } else if (exportFormat === "png") {
        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Background
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(0, 0, 1200, 800);

          // Top Header Banner
          ctx.fillStyle = "#2563EB";
          ctx.fillRect(0, 0, 1200, 100);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 28px sans-serif";
          ctx.fillText(`DataVista Analytics — ${dataset.name || "Executive Report"}`, 50, 58);

          ctx.font = "14px sans-serif";
          ctx.fillStyle = "#E0F2FE";
          ctx.fillText(
            `Exported: ${new Date().toLocaleDateString()} | Total Rows: ${dataset.totalRows} | Total Columns: ${dataset.totalColumns}`,
            50,
            85
          );

          // KPI Cards
          const kpiList =
            dataset.kpis.length > 0
              ? dataset.kpis
              : [
                  { label: "Total Rows", value: dataset.totalRows },
                  { label: "Total Columns", value: dataset.totalColumns },
                ];

          kpiList.slice(0, 4).forEach((kpi, idx) => {
            const x = 50 + idx * 270;
            ctx.fillStyle = "#FFFFFF";
            ctx.shadowColor = "rgba(0,0,0,0.06)";
            ctx.shadowBlur = 12;
            ctx.fillRect(x, 140, 250, 110);
            ctx.shadowBlur = 0;

            ctx.fillStyle = "#64748B";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(kpi.label.toUpperCase(), x + 20, 175);

            ctx.fillStyle = "#2563EB";
            ctx.font = "bold 24px sans-serif";
            ctx.fillText(String(kpi.value), x + 20, 218);
          });

          // Data Table Container
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(50, 280, 1100, 470);

          // Table Header
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(50, 280, 1100, 45);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 13px sans-serif";
          const tableHeaders = dataset.tableHeaders.slice(0, 5);
          tableHeaders.forEach((h, i) => ctx.fillText(h.toUpperCase(), 70 + i * 210, 308));

          // Table Rows
          const displayRows = dataset.tableRows.slice(0, 7);
          displayRows.forEach((r, rIdx) => {
            ctx.fillStyle = rIdx % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
            ctx.fillRect(50, 325 + rIdx * 55, 1100, 55);

            ctx.fillStyle = "#334155";
            ctx.font = "13px sans-serif";
            tableHeaders.forEach((h, i) => {
              const val = String(r[h] ?? "-").slice(0, 22);
              ctx.fillText(val, 70 + i * 210, 358 + rIdx * 55);
            });
          });
        }

        const link = document.createElement("a");
        link.download = `${fileNameBase}_Snapshot.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`PNG Image "${fileNameBase}_Snapshot.png" saved!`);
      } else if (exportFormat === "pdf") {
        const printWin = window.open("", "_blank");
        if (printWin) {
          const headers = dataset.tableHeaders.length > 0 ? dataset.tableHeaders : ["Column 1", "Column 2"];
          const rows = dataset.tableRows.length > 0 ? dataset.tableRows : [];
          const kpis = dataset.kpis.length > 0 ? dataset.kpis : [{ label: "Total Rows", value: dataset.totalRows }, { label: "Total Cols", value: dataset.totalColumns }];

          printWin.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${fileNameBase}_Report</title>
                <style>
                  @page { size: ${pageSize} ${orientation.toLowerCase()}; margin: 15mm; }
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background: #ffffff; padding: 20px; }
                  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
                  .brand { font-size: 22px; font-weight: 800; color: #2563eb; }
                  .report-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
                  .report-date { font-size: 12px; color: #64748b; font-weight: 600; }
                  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
                  .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
                  .kpi-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                  .kpi-val { font-size: 22px; font-weight: 800; color: #2563eb; margin-top: 6px; }
                  .section-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
                  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
                  th { background: #2563eb; color: #ffffff; text-align: left; padding: 10px 14px; font-weight: 700; }
                  td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 500; }
                  tr:nth-child(even) { background: #f8fafc; }
                  .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div>
                    <div class="report-title">${dataset.name || "Executive Analytics Report"}</div>
                    <div class="report-date">Generated on ${new Date().toLocaleDateString()} • DataVista Analytics</div>
                  </div>
                  <div class="brand">DataVista</div>
                </div>

                <div class="kpi-grid">
                  ${kpis.map((k) => `
                    <div class="kpi-card">
                      <div class="kpi-lbl">${k.label}</div>
                      <div class="kpi-val">${k.value}</div>
                    </div>
                  `).join("")}
                </div>

                <div class="section-title">Dataset Table Summary (${rows.length} rows)</div>
                <table>
                  <thead>
                    <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
                  </thead>
                  <tbody>
                    ${rows.map((r) => `
                      <tr>${headers.map((h) => `<td>${r[h] ?? "-"}</td>`).join("")}</tr>
                    `).join("")}
                  </tbody>
                </table>

                <div class="footer">
                  © DataVista Analytics Platform • Official Executive Document • Confidential
                </div>
              </body>
            </html>
          `);
          printWin.document.close();
          setTimeout(() => {
            printWin.focus();
            printWin.print();
          }, 300);
        }
        showToast(`Preparing PDF document print/download window...`);
      }
    } catch (err) {
      console.error("Export error:", err);
      showToast("Error generating export file.");
    } finally {
      setIsExporting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Export Report</h1>
          <p className="text-sm text-textSecondary">Download your dashboards and insights in real time.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-soft text-primary border border-primary/20 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          Active: {dataset.name || "Default Dataset"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Settings Card */}
        <Card className="h-fit shadow-xs border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-textPrimary">
              <Settings className="w-5 h-5 text-primary" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <label className="text-xs font-bold text-textPrimary block mb-3 uppercase tracking-wider">Select Format</label>
              <div className="flex flex-col gap-3">
                {formats.map((format) => (
                  <label
                    key={format.id}
                    className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
                      exportFormat === format.id
                        ? "border-primary bg-primary-soft/40 shadow-xs ring-1 ring-primary/30"
                        : "border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.id}
                      checked={exportFormat === format.id}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="mt-1 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-textPrimary font-bold text-sm">
                        <format.icon className="w-4 h-4 text-primary" />
                        {format.name}
                      </div>
                      <p className="text-xs text-textSecondary mt-1 leading-relaxed">{format.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {exportFormat === "pdf" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-2 uppercase tracking-wider">Page Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-textPrimary block mb-2 uppercase tracking-wider">Orientation</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
                  >
                    <option value="Landscape">Landscape</option>
                    <option value="Portrait">Portrait</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full mt-2 px-4 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <svg className="w-4 h-4 text-white animate-spin shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Report ({exportFormat.toUpperCase()})
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Live Document & Data Preview Card */}
        <Card className="h-full bg-surface border-border shadow-xs flex flex-col">
          <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-textPrimary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Live Report Preview
            </CardTitle>
            <span className="text-[11px] font-bold text-primary bg-primary-soft/50 px-2.5 py-0.5 rounded-full border border-primary/20">
              {exportFormat.toUpperCase()} • {pageSize} {orientation}
            </span>
          </CardHeader>

          <CardContent className="pt-6 flex-1 flex flex-col justify-center items-center">
            {exportFormat === "pdf" && (
              <div className="w-full bg-surface border border-border rounded-2xl p-6 shadow-md flex flex-col gap-4 max-h-[480px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-textPrimary">{dataset.name || "Executive Analytics Report"}</h3>
                    <p className="text-[11px] text-textSecondary font-medium">Generated via DataVista • {new Date().toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-black text-primary tracking-wider uppercase">DataVista</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(dataset.kpis.length > 0 ? dataset.kpis.slice(0, 2) : [{ label: "Rows", value: dataset.totalRows }, { label: "Columns", value: dataset.totalColumns }]).map((k, i) => (
                    <div key={i} className="bg-primary-soft/20 border border-border p-3 rounded-xl">
                      <p className="text-[10px] font-bold text-textSecondary uppercase">{k.label}</p>
                      <p className="text-lg font-black text-primary mt-0.5">{k.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  <div className="bg-primary text-white font-bold px-3 py-2 text-[11px] flex justify-between">
                    <span>Summary Table</span>
                    <span>{dataset.tableRows.length} Rows</span>
                  </div>
                  <div className="divide-y divide-border bg-surface max-h-40 overflow-y-auto">
                    {dataset.tableRows.slice(0, 4).map((row, idx) => (
                      <div key={idx} className="px-3 py-2 flex items-center justify-between text-[11px] font-medium text-textPrimary">
                        <span className="truncate max-w-[160px]">{String(Object.values(row)[0] ?? "-")}</span>
                        <span className="font-bold text-primary">{String(Object.values(row)[1] ?? "-")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-textMuted text-center pt-2 border-t border-border/60 font-semibold">
                  Click "Download Report" to print or save the complete PDF document.
                </div>
              </div>
            )}

            {exportFormat === "png" && (
              <div className="w-full bg-surface border border-border rounded-2xl p-6 shadow-md flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                  <BarChart2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-extrabold text-textPrimary">Dashboard Image Snapshot (1200 x 800)</h3>
                <p className="text-xs text-textSecondary max-w-sm leading-relaxed">
                  High-resolution visual banner snapshot including top KPIs and chart distributions for {dataset.name}.
                </p>
              </div>
            )}

            {exportFormat === "csv" && (
              <div className="w-full bg-surface border border-border rounded-2xl p-4 shadow-md flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-emerald-500" /> Raw CSV Export Preview
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    {dataset.tableRows.length} Records
                  </span>
                </div>
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-primary-soft/30 text-textSecondary font-bold">
                      <tr>
                        {dataset.tableHeaders.slice(0, 4).map((h, i) => (
                          <th key={i} className="px-3 py-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dataset.tableRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-primary-soft/10">
                          {dataset.tableHeaders.slice(0, 4).map((h, i) => (
                            <td key={i} className="px-3 py-1.5 font-medium">{String(row[h] ?? "-")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface/95 backdrop-blur-xl text-textPrimary border border-border shadow-xl px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
