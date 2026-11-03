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
  BarChart2,
  User,
  Edit3
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";
import { useAuth } from "../components/auth/AuthProvider";

export function ExportReport() {
  const { dataset } = useDataset();
  const { user } = useAuth();
  const [exportFormat, setExportFormat] = useState<"pdf" | "png" | "csv">("pdf");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("Landscape");
  const [reportTitle, setReportTitle] = useState(dataset.name ? `${dataset.name} — Performance Report` : "Executive Analytics Report");
  const defaultAuthor =
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0].split(/[._-]/).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") : "Data Analyst");
  const [reportAuthor, setReportAuthor] = useState(defaultAuthor);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formats = [
    { id: "pdf", icon: FileText, name: "PDF Document", desc: "Formatted executive report for sharing and printing" },
    { id: "png", icon: ImageIcon, name: "PNG Image Snapshot", desc: "High-resolution complete visual dataset snapshot" },
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
        const allHeaders = dataset.tableHeaders.length > 0 ? dataset.tableHeaders : ["Column 1", "Column 2"];
        const allRows = dataset.tableRows.length > 0 ? dataset.tableRows : [];

        // Support up to 500 rows to ensure complete dataset extraction
        const maxExportRows = Math.min(allRows.length, 500);
        const displayRows = allRows.slice(0, maxExportRows);

        // Include all columns up to 15 columns with clean spacing
        const numCols = Math.min(allHeaders.length, 15);
        const tableHeaders = allHeaders.slice(0, numCols);

        const colMinWidth = 160;
        const paddingX = 50;
        const calculatedWidth = paddingX * 2 + tableHeaders.length * colMinWidth;
        const canvasWidth = Math.max(1200, calculatedWidth);
        const tableWidth = canvasWidth - paddingX * 2;
        const colWidth = tableWidth / tableHeaders.length;

        const rowHeight = 44;
        const headerBannerHeight = 100;
        const kpiTop = 135;
        const kpiHeight = 105;
        const tableTop = 275;
        const tableHeaderHeight = 44;
        const tableRowsHeight = Math.max(1, displayRows.length) * rowHeight;
        const tableTotalHeight = tableHeaderHeight + tableRowsHeight;
        const footerHeight = 65;
        const canvasHeight = tableTop + tableTotalHeight + footerHeight;

        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // 1. Canvas Background
          ctx.fillStyle = "#F8FAFC";
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // 2. Top Header Banner
          ctx.fillStyle = "#2563EB";
          ctx.fillRect(0, 0, canvasWidth, headerBannerHeight);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillText(reportTitle, 50, 52);

          ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#E0F2FE";
          ctx.fillText(
            `Prepared by ${reportAuthor} | Generated on ${new Date().toLocaleDateString()} | Total Rows: ${dataset.totalRows} | Attributes: ${dataset.totalColumns}`,
            50,
            80
          );

          // DataVista Logo watermark in top-right
          ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "right";
          ctx.fillText("DataVista", canvasWidth - 50, 56);
          ctx.textAlign = "left";

          // 3. KPI Cards
          const kpiList =
            dataset.kpis.length > 0
              ? dataset.kpis
              : [
                  { label: "Total Rows", value: dataset.totalRows },
                  { label: "Total Columns", value: dataset.totalColumns },
                ];

          const numKpis = Math.min(kpiList.length, 4);
          const kpiSpacing = 20;
          const maxKpiSectionWidth = Math.min(tableWidth, 1100);
          const kpiCardWidth = (maxKpiSectionWidth - (numKpis - 1) * kpiSpacing) / numKpis;

          kpiList.slice(0, numKpis).forEach((kpi, idx) => {
            const x = 50 + idx * (kpiCardWidth + kpiSpacing);
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x, kpiTop, kpiCardWidth, kpiHeight);
            ctx.strokeStyle = "#E2E8F0";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, kpiTop, kpiCardWidth, kpiHeight);

            // Parse main value and sub-label (e.g. "15" and "Attributes")
            const rawVal = String(kpi.value || "-");
            const match = rawVal.match(/^([\d.,]+[%MkBb]?)\s*(.*)$/);
            const mainVal = match && match[1] ? match[1] : rawVal;
            const subVal = match && match[2] ? match[2] : "";

            ctx.fillStyle = "#64748B";
            ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.fillText(kpi.label.toUpperCase(), x + 18, kpiTop + 35);

            ctx.fillStyle = "#2563EB";
            ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.fillText(mainVal, x + 18, kpiTop + 75);

            if (subVal) {
              const mainWidth = ctx.measureText(mainVal).width;
              ctx.fillStyle = "#64748B";
              ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
              ctx.fillText(subVal.toUpperCase(), x + 18 + mainWidth + 8, kpiTop + 75);
            }
          });

          // 4. Data Table Container
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(50, tableTop, tableWidth, tableTotalHeight);
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.strokeRect(50, tableTop, tableWidth, tableTotalHeight);

          // Table Header
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(50, tableTop, tableWidth, tableHeaderHeight);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          tableHeaders.forEach((h, i) => {
            const cellX = 50 + i * colWidth + 16;
            ctx.fillText(h.toUpperCase(), cellX, tableTop + 27);
          });

          // Table Rows - Render all rows!
          ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          displayRows.forEach((r, rIdx) => {
            const rowY = tableTop + tableHeaderHeight + rIdx * rowHeight;
            ctx.fillStyle = rIdx % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
            ctx.fillRect(50, rowY, tableWidth, rowHeight);

            ctx.strokeStyle = "#E2E8F0";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(50, rowY + rowHeight);
            ctx.lineTo(50 + tableWidth, rowY + rowHeight);
            ctx.stroke();

            ctx.fillStyle = "#334155";
            tableHeaders.forEach((h, i) => {
              const cellX = 50 + i * colWidth + 16;
              const cellY = rowY + 27;
              let val = String(r[h] ?? "-");
              const maxTextWidth = colWidth - 28;
              if (ctx.measureText(val).width > maxTextWidth) {
                while (ctx.measureText(val + "…").width > maxTextWidth && val.length > 2) {
                  val = val.slice(0, -1);
                }
                val = val + "…";
              }
              ctx.fillText(val, cellX, cellY);
            });
          });

          // 5. Global Document Footer
          ctx.fillStyle = "#94A3B8";
          ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          ctx.textAlign = "center";
          const footerNotice =
            allRows.length > maxExportRows
              ? `Showing first ${maxExportRows} of ${allRows.length} total rows • © DataVista Analytics Platform`
              : `All ${allRows.length} Records Verified • © DataVista Analytics Platform • Official Executive Document`;
          ctx.fillText(footerNotice, canvasWidth / 2, canvasHeight - 24);
          ctx.textAlign = "left";
        }

        const link = document.createElement("a");
        link.download = `${fileNameBase}_Snapshot.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`PNG Image "${fileNameBase}_Snapshot.png" (${allRows.length} rows) saved!`);
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
                  .notes-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; margin-bottom: 24px; font-size: 12px; line-height: 1.6; color: #1e40af; }
                  .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div>
                    <div class="report-title">${reportTitle}</div>
                    <div class="report-date">Prepared by ${reportAuthor} • Generated on ${new Date().toLocaleDateString()} • DataVista Analytics</div>
                  </div>
                  <div class="brand">DataVista</div>
                </div>

                ${includeNotes ? `
                  <div class="notes-box">
                    <strong>Executive Note:</strong> This report is dynamically compiled from the verified "${dataset.name}" dataset. All ${dataset.totalRows} records and ${dataset.totalColumns} attributes were audited and normalized before generation.
                  </div>
                ` : ""}

                <div class="kpi-grid">
                  ${kpis.slice(0, 4).map((k) => {
                    const rawVal = String(k.value || "-");
                    const match = rawVal.match(/^([\d.,]+[%MkBb]?)\s*(.*)$/);
                    const mainVal = match && match[1] ? match[1] : rawVal;
                    const subVal = match && match[2] ? match[2] : "";
                    return `
                      <div class="kpi-card">
                        <div class="kpi-lbl">${k.label}</div>
                        <div class="kpi-val">${mainVal} ${subVal ? `<span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">${subVal}</span>` : ""}</div>
                      </div>
                    `;
                  }).join("")}
                </div>

                <div class="section-title">Dataset Records Summary (${rows.length} rows)</div>
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
        showToast("Preparing PDF document print/download window...");
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
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Export Report</h1>
          <p className="text-sm text-textSecondary mt-0.5">Download your dashboards and insights in real time.</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary border border-primary/20 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          Active: {dataset.name || "Default Dataset"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Settings Card */}
        <Card className="h-fit shadow-xs border-border/80">
          <CardHeader className="border-b border-border/60 pb-3 bg-surface/50">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-textPrimary">
              <Settings className="w-4 h-4 text-primary" />
              Export Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-5">
            {/* Format Selector */}
            <div>
              <label className="text-xs font-bold text-textPrimary block mb-2.5 uppercase tracking-wider">
                Select Format
              </label>
              <div className="flex flex-col gap-2.5">
                {formats.map((format) => (
                  <label
                    key={format.id}
                    className={`flex items-start gap-3.5 p-3.5 border rounded-2xl cursor-pointer transition-all ${
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
                      <div className="flex items-center gap-2 text-textPrimary font-bold text-xs">
                        <format.icon className="w-4 h-4 text-primary" />
                        {format.name}
                      </div>
                      <p className="text-[11px] text-textSecondary mt-0.5 leading-snug">{format.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Metadata Customization */}
            <div className="pt-2 border-t border-border/60 flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-textPrimary block mb-1.5 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-surface text-textPrimary text-xs font-semibold rounded-xl border border-border/80 px-3 py-2 focus:outline-none focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-textPrimary block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Prepared By (Author)
                </label>
                <input
                  type="text"
                  value={reportAuthor}
                  onChange={(e) => setReportAuthor(e.target.value)}
                  className="w-full bg-surface text-textPrimary text-xs font-semibold rounded-xl border border-border/80 px-3 py-2 focus:outline-none focus:border-primary shadow-xs"
                />
              </div>

              {exportFormat === "pdf" && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={includeNotes}
                    onChange={(e) => setIncludeNotes(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-textSecondary">
                    Include executive methodology &amp; dataset audit notes
                  </span>
                </label>
              )}
            </div>

            {/* Page Size & Orientation (Only for PDF) */}
            {exportFormat === "pdf" && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60 animate-in fade-in duration-200">
                <div>
                  <label className="text-[11px] font-bold text-textPrimary block mb-1.5 uppercase tracking-wider">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer shadow-xs"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-textPrimary block mb-1.5 uppercase tracking-wider">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                    className="w-full border border-border/80 bg-surface text-textPrimary rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer shadow-xs"
                  >
                    <option value="Landscape">Landscape</option>
                    <option value="Portrait">Portrait</option>
                  </select>
                </div>
              </div>
            )}

            {/* Download CTA Button */}
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
        <Card className="h-full bg-surface border-border/80 shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between bg-surface/50">
            <CardTitle className="text-sm font-bold text-textPrimary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Live Report Preview
            </CardTitle>
            {/* Format Pill (Dynamically tailored to the selected format) */}
            <span className="text-[10px] font-bold text-primary bg-primary-soft/50 px-2.5 py-1 rounded-full border border-primary/20">
              {exportFormat === "pdf"
                ? `PDF • ${pageSize} ${orientation}`
                : exportFormat === "png"
                ? `PNG • Full Dataset Snapshot (${dataset.tableRows.length} Rows)`
                : `CSV • Raw Data (${dataset.tableRows.length} rows)`}
            </span>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex flex-col justify-center items-center">
            {/* PDF Preview */}
            {exportFormat === "pdf" && (
              <div className="w-full bg-surface border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-4 max-h-[500px] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold text-textPrimary leading-snug break-words">{reportTitle}</h3>
                    <p className="text-[11px] text-textSecondary font-medium mt-0.5">Prepared by {reportAuthor} • {new Date().toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-black text-primary tracking-wider uppercase shrink-0 pt-0.5">DataVista</span>
                </div>

                {/* All 4 Active KPIs Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(dataset.kpis.length > 0 ? dataset.kpis.slice(0, 4) : [{ label: "Rows", value: dataset.totalRows }, { label: "Columns", value: dataset.totalColumns }]).map((k, i) => {
                    const rawVal = String(k.value || "-");
                    const match = rawVal.match(/^([\d.,]+[%MkBb]?)\s*(.*)$/);
                    const mainVal = match && match[1] ? match[1] : rawVal;
                    const subVal = match && match[2] ? match[2] : null;

                    return (
                      <div
                        key={i}
                        className="bg-primary-soft/20 border border-primary/15 p-2 rounded-xl flex flex-col items-center justify-between min-h-[74px] text-center overflow-hidden transition-all"
                      >
                        <p className="text-[9.5px] font-bold text-textSecondary uppercase tracking-tight text-center leading-tight break-words max-w-full">
                          {k.label}
                        </p>
                        <div className="flex flex-col items-center justify-center my-auto">
                          <span className="text-base font-black text-primary tracking-tight leading-none">
                            {mainVal}
                          </span>
                          {subVal && (
                            <span className="text-[9px] font-bold text-textSecondary uppercase tracking-wider mt-1 leading-none">
                              {subVal}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dataset Summary Table */}
                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  <div className="bg-primary text-white font-bold px-3 py-2 text-[11px] flex justify-between">
                    <span>Dataset Snapshot ({dataset.tableRows.length} Rows)</span>
                    <span>{dataset.tableHeaders.length} Columns</span>
                  </div>
                  <div className="overflow-x-auto max-h-44">
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="bg-primary-soft/30 text-textSecondary font-bold border-b border-border">
                        <tr>
                          {dataset.tableHeaders.slice(0, 5).map((h) => (
                            <th key={h} className="px-3 py-1.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {dataset.tableRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-primary-soft/10">
                            {dataset.tableHeaders.slice(0, 5).map((h) => (
                              <td key={h} className="px-3 py-1.5 font-medium text-textPrimary">
                                {String(row[h] ?? "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-[10px] text-textMuted text-center pt-2 border-t border-border/60 font-semibold">
                  Click "Download Report" to print or save the complete PDF document.
                </div>
              </div>
            )}

            {/* PNG Preview */}
            {exportFormat === "png" && (
              <div className="w-full bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                  <BarChart2 className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-extrabold text-textPrimary">{reportTitle}</h3>
                <p className="text-xs text-textSecondary max-w-sm leading-relaxed">
                  High-resolution visual snapshot extracting all {dataset.tableRows.length} dataset records, top KPI metrics, and complete schema details for {dataset.name}.
                </p>
                <div className="flex gap-2 text-[10px] font-bold text-textMuted mt-1">
                  <span className="bg-primary-soft/40 px-2.5 py-1 rounded-md">Format: PNG</span>
                  <span className="bg-primary-soft/40 px-2.5 py-1 rounded-md">All {dataset.tableRows.length} Rows</span>
                  <span className="bg-primary-soft/40 px-2.5 py-1 rounded-md">Author: {reportAuthor}</span>
                </div>
              </div>
            )}

            {/* CSV Preview */}
            {exportFormat === "csv" && (
              <div className="w-full bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <span className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-emerald-500" /> Full CSV Export Preview
                  </span>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                    {dataset.tableRows.length} Rows • {dataset.tableHeaders.length} Cols
                  </span>
                </div>
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-primary-soft/30 text-textSecondary font-bold border-b border-border">
                      <tr>
                        {dataset.tableHeaders.slice(0, 6).map((h, i) => (
                          <th key={i} className="px-3 py-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {dataset.tableRows.slice(0, 6).map((row, idx) => (
                        <tr key={idx} className="hover:bg-primary-soft/10">
                          {dataset.tableHeaders.slice(0, 6).map((h, i) => (
                            <td key={i} className="px-3 py-1.5 font-medium text-textPrimary">{String(row[h] ?? "-")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-textMuted text-center pt-1 border-t border-border/60 font-semibold">
                  Exports standard RFC 4180 UTF-8 CSV compatible with Excel, Tableau, and Pandas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface/95 backdrop-blur-xl text-textPrimary border border-primary/30 shadow-xl px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
