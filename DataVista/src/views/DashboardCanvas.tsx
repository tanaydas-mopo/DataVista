"use client";

import { useState } from "react";
import {
  LayoutGrid,
  Type,
  Image as ImageIcon,
  BarChart2,
  Plus,
  Database,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Share2,
  Check,
  Copy,
  Lightbulb,
  Sparkles,
  X,
  Table as TableIcon,
  Globe,
  Lock,
  Users,
  CheckCircle2,
  Sliders
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

interface CanvasWidget {
  id: string;
  type: "kpi-grid" | "chart" | "text" | "image" | "table";
  title: string;
  colSpan: "col-span-12" | "col-span-12 lg:col-span-8" | "col-span-12 lg:col-span-6" | "col-span-12 lg:col-span-4";
  content?: string;
  imageUrl?: string;
}

export function DashboardCanvas() {
  const { dataset } = useDataset();
  const router = useRouter();
  const isDatasetActive = dataset.status === "active";

  /* ── Canvas State ── */
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  /* ── Publish Modal State ── */
  const [publishTitle, setPublishTitle] = useState("IPL 2024 Executive Overview");
  const [publishVisibility, setPublishVisibility] = useState<"public" | "team" | "private">("team");
  const [publishSlug, setPublishSlug] = useState("ipl-2024-overview");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  /* ── Dynamic Widgets ── */
  const [widgets, setWidgets] = useState<CanvasWidget[]>([
    {
      id: "w-kpis",
      type: "kpi-grid",
      title: "Key Performance Indicators",
      colSpan: "col-span-12",
    },
    {
      id: "w-chart",
      type: "chart",
      title: dataset.chartTitle || "Visual Analysis",
      colSpan: "col-span-12 lg:col-span-8",
    },
    {
      id: "w-text",
      type: "text",
      title: "Executive Analysis Notes",
      colSpan: "col-span-12 lg:col-span-4",
      content: `This executive dashboard is connected to the "${dataset.name}" dataset. Real-time metric computations automatically update across all linked visual charts and summary components whenever the underlying data changes.`,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const widgetPalette = [
    { type: "chart" as const, icon: BarChart2, name: "Chart Widget", desc: "Interactive bar or metric visual" },
    { type: "kpi-grid" as const, icon: LayoutGrid, name: "KPI Metrics Strip", desc: "Four high-level KPI cards" },
    { type: "table" as const, icon: TableIcon, name: "Data Table", desc: "Tabular view of current records" },
    { type: "text" as const, icon: Type, name: "Text & Notes", desc: "Rich text narrative or context block" },
    { type: "image" as const, icon: ImageIcon, name: "Image / Logo", desc: "Custom banner or brand asset" },
  ];

  const addWidget = (type: CanvasWidget["type"], name: string) => {
    const newId = `w-${Date.now()}`;
    let newWidget: CanvasWidget;

    switch (type) {
      case "chart":
        newWidget = {
          id: newId,
          type: "chart",
          title: `Visual Chart ${widgets.filter(w => w.type === "chart").length + 1}`,
          colSpan: "col-span-12 lg:col-span-8",
        };
        break;
      case "kpi-grid":
        newWidget = {
          id: newId,
          type: "kpi-grid",
          title: "KPI Metrics Overview",
          colSpan: "col-span-12",
        };
        break;
      case "table":
        newWidget = {
          id: newId,
          type: "table",
          title: "Dataset Snapshot Table",
          colSpan: "col-span-12",
        };
        break;
      case "text":
        newWidget = {
          id: newId,
          type: "text",
          title: "Analyst Commentary",
          colSpan: "col-span-12 lg:col-span-4",
          content: "Add your custom observations, data caveats, or action items here.",
        };
        break;
      case "image":
        newWidget = {
          id: newId,
          type: "image",
          title: "Brand Banner",
          colSpan: "col-span-12 lg:col-span-4",
          imageUrl: "/assets/illustrations/empty-states/illustration-empty-chart.svg",
        };
        break;
    }

    setWidgets(prev => [...prev, newWidget]);
    showToast(`Added ${name} to canvas`);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    showToast("Widget removed from canvas");
  };

  const cycleColSpan = (id: string) => {
    setWidgets(prev =>
      prev.map(w => {
        if (w.id !== id) return w;
        const spans: CanvasWidget["colSpan"][] = [
          "col-span-12 lg:col-span-4",
          "col-span-12 lg:col-span-6",
          "col-span-12 lg:col-span-8",
          "col-span-12",
        ];
        const currentIdx = spans.indexOf(w.colSpan);
        const nextSpan = spans[(currentIdx + 1) % spans.length];
        return { ...w, colSpan: nextSpan };
      })
    );
  };

  const updateWidgetContent = (id: string, content: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, content } : w));
  };

  const tooltipStyle = {
    backgroundColor: "var(--color-surface, #FFFFFF)",
    color: "var(--color-textPrimary, #0F172A)",
    borderRadius: "12px",
    borderColor: "var(--color-border, #E2E8F0)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  };

  const shareUrl = `https://datavista.io/d/${publishSlug}`;

  const copyShareLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface border border-primary/30 shadow-xl px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-textPrimary animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Dashboard Canvas</h1>
            {isPreviewMode && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                Presentation Mode
              </span>
            )}
          </div>
          <p className="text-sm text-textSecondary mt-0.5">
            {isPreviewMode
              ? "Clean presentation view for stakeholders and executive review."
              : "Click or drag widgets from the palette to construct your custom analytical layout."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
              isPreviewMode
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-surface text-textPrimary border-border hover:bg-primary-soft/40 shadow-xs"
            }`}
          >
            {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            Publish
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Widget Sidebar (Hidden in Preview Mode) */}
        {!isPreviewMode && (
          <Card className="lg:w-72 h-fit flex-shrink-0 border border-border/80 shadow-sm animate-in fade-in">
            <CardHeader className="pb-3 border-b border-border/60 bg-surface/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-textPrimary">
                <LayoutGrid className="w-4 h-4 text-primary" />
                Widget Palette
              </CardTitle>
              <span className="text-[10px] font-bold text-textMuted bg-primary-soft/40 px-2 py-0.5 rounded">
                Click to add
              </span>
            </CardHeader>
            <CardContent className="pt-3 pb-4 px-3 flex flex-col gap-2">
              {widgetPalette.map((w) => (
                <button
                  key={w.type}
                  type="button"
                  onClick={() => addWidget(w.type, w.name)}
                  className="flex items-start gap-3 p-2.5 rounded-xl border border-border/70 bg-surface hover:border-primary/50 hover:bg-primary-soft/20 text-left transition-all cursor-pointer group"
                >
                  <div className="mt-0.5 bg-primary-soft/80 p-2 rounded-xl text-primary group-hover:scale-110 transition-transform shrink-0">
                    <w.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-textPrimary group-hover:text-primary transition-colors">
                        {w.name}
                      </span>
                      <Plus className="w-3.5 h-3.5 text-textMuted group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-[11px] text-textSecondary mt-0.5 leading-snug line-clamp-1">{w.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Canvas Area */}
        <div
          className={`flex-1 rounded-2xl p-6 overflow-y-auto min-h-[500px] transition-all ${
            isPreviewMode
              ? "bg-surface/20 border border-border/40"
              : "bg-surface/50 border-2 border-dashed border-border/80"
          }`}
        >
          {!isDatasetActive ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-surface rounded-2xl border border-border shadow-xs">
              <div className="p-4 rounded-2xl bg-primary-soft text-primary mb-4">
                <Database className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-textPrimary mb-1">
                No Active Dataset Loaded
              </h3>
              <p className="text-xs text-textSecondary max-w-sm mb-6">
                Upload a CSV, Excel, or JSON dataset to dynamically populate your dashboard canvas widgets.
              </p>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-hover shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 auto-rows-[auto]">
              {widgets.map((widget) => {
                return (
                  <div
                    key={widget.id}
                    className={`${widget.colSpan} bg-surface border border-border/80 shadow-xs rounded-2xl p-5 flex flex-col group relative transition-all`}
                  >
                    {/* Widget Action Toolbar (Hidden in Preview Mode) */}
                    {!isPreviewMode && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/90 backdrop-blur-xs px-2 py-1 rounded-xl border border-border shadow-xs z-10">
                        <button
                          type="button"
                          onClick={() => cycleColSpan(widget.id)}
                          title="Resize width"
                          className="p-1 text-textMuted hover:text-textPrimary hover:bg-primary-soft/50 rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWidget(widget.id)}
                          title="Delete widget"
                          className="p-1 text-textMuted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* WIDGET: KPI Grid */}
                    {widget.type === "kpi-grid" && (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                            {widget.title}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full divide-x divide-border/60">
                          {(dataset.kpis || []).map((kpi: DynamicKpi, idx: number) => (
                            <div key={kpi.id || idx} className={`text-center ${idx > 0 ? "pl-4" : ""}`}>
                              <p className="text-xs text-textSecondary font-semibold truncate">
                                {kpi.label}
                              </p>
                              <p className="text-xl md:text-2xl font-extrabold text-textPrimary mt-1 tracking-tight">
                                {kpi.value}
                              </p>
                              <span className="text-[11px] font-bold text-emerald-500">
                                {kpi.trend}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* WIDGET: Chart Widget */}
                    {widget.type === "chart" && (
                      <div className="flex flex-col flex-1 min-h-[280px]">
                        <h3 className="text-sm font-bold text-textPrimary mb-3">
                          {widget.title}
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
                    )}

                    {/* WIDGET: Text / Summary Block */}
                    {widget.type === "text" && (
                      <div className="flex flex-col flex-1">
                        <h3 className="text-sm font-bold text-textPrimary mb-2">
                          {widget.title}
                        </h3>
                        {isPreviewMode ? (
                          <p className="text-xs text-textSecondary leading-relaxed whitespace-pre-wrap">
                            {widget.content}
                          </p>
                        ) : (
                          <textarea
                            value={widget.content}
                            onChange={(e) => updateWidgetContent(widget.id, e.target.value)}
                            rows={4}
                            className="w-full bg-surface text-textPrimary text-xs rounded-xl border border-border/70 p-2.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                          />
                        )}
                        <div className="mt-4 p-3 bg-primary-soft/50 text-primary rounded-xl border border-primary/20 flex items-start gap-2 text-xs">
                          <Lightbulb className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                          <span className="font-medium leading-relaxed">
                            Metrics and visuals refresh synchronously as new CSV/Excel data files are uploaded.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* WIDGET: Data Table */}
                    {widget.type === "table" && (
                      <div className="flex flex-col flex-1">
                        <h3 className="text-sm font-bold text-textPrimary mb-3">
                          {widget.title}
                        </h3>
                        <div className="overflow-x-auto max-h-[220px] rounded-xl border border-border/60">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-primary-soft/30 text-textSecondary sticky top-0 border-b border-border/80">
                              <tr>
                                {dataset.tableHeaders.slice(0, 6).map((h) => (
                                  <th key={h} className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 bg-surface">
                              {dataset.tableRows.slice(0, 5).map((row, i) => (
                                <tr key={i} className="hover:bg-primary-soft/15 transition-colors">
                                  {dataset.tableHeaders.slice(0, 6).map((h) => (
                                    <td key={h} className="px-3.5 py-2 text-textPrimary font-medium">
                                      {String(row[h] ?? "—")}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* WIDGET: Image Asset */}
                    {widget.type === "image" && (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-textSecondary mb-2 self-start">
                          {widget.title}
                        </h3>
                        <img
                          src={widget.imageUrl}
                          alt="Dashboard asset"
                          className="w-32 h-auto opacity-80"
                        />
                        <p className="text-[11px] text-textMuted mt-2">Active brand visual</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Publish Dashboard */}
      {showPublishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="w-full max-w-lg bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-default animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-gradient-to-r from-primary-soft/30 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-textPrimary tracking-tight">Publish Dashboard</h2>
                  <p className="text-xs text-textSecondary mt-0.5">Share your interactive canvas with your team or the public</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-textMuted hover:text-textPrimary hover:bg-primary-soft/60 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4 text-xs">
              {/* Dashboard Title */}
              <div>
                <label className="text-xs font-bold text-textPrimary block mb-1.5">
                  Dashboard Title
                </label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full bg-surface text-textPrimary rounded-xl border border-border/80 px-3.5 py-2.5 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
              </div>

              {/* Visibility Options */}
              <div>
                <label className="text-xs font-bold text-textPrimary block mb-1.5">
                  Access &amp; Visibility
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "team" as const, label: "Team Only", icon: Users, desc: "Workspace members" },
                    { id: "public" as const, label: "Public", icon: Globe, desc: "Anyone with link" },
                    { id: "private" as const, label: "Private", icon: Lock, desc: "Only you" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPublishVisibility(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        publishVisibility === opt.id
                          ? "border-primary bg-primary-soft/40 shadow-xs ring-1 ring-primary"
                          : "border-border/70 hover:bg-primary-soft/20 bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <opt.icon className={`w-3.5 h-3.5 ${publishVisibility === opt.id ? "text-primary" : "text-textMuted"}`} />
                        <span className="font-bold text-textPrimary">{opt.label}</span>
                      </div>
                      <span className="text-[10px] text-textSecondary">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="text-xs font-bold text-textPrimary block mb-1.5">
                  Custom Shareable URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-surface border border-border/80 rounded-xl px-3.5 py-2 text-xs font-mono text-textSecondary shadow-xs overflow-hidden">
                    <span className="text-textMuted truncate">https://datavista.io/d/</span>
                    <input
                      type="text"
                      value={publishSlug}
                      onChange={(e) => setPublishSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      className="bg-transparent text-textPrimary font-semibold focus:outline-none w-full"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="px-3.5 py-2 bg-surface hover:bg-primary-soft/40 border border-border text-textPrimary rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-textMuted" />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {isPublished && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span className="font-semibold">Dashboard is live! Anyone with the URL can view it.</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/60 bg-surface/50">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-bold text-textSecondary hover:text-textPrimary bg-primary-soft/40 hover:bg-primary-soft/80 rounded-xl border border-border/60 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPublished(true);
                  showToast("Dashboard published successfully!");
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Publish Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
