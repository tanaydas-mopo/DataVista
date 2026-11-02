"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  Database,
  Columns3,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  Activity,
  DollarSign,
  ShoppingBag,
  Users,
  Percent,
  Layers
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../lib/utils";

// Data analytics domain icon mapping matching data criteria
function getKpiIcon(label: string, index: number) {
  const lbl = (label || "").toLowerCase();

  // 1. Data Structure: Rows, Records, Entries, Samples, Datasets
  if (
    lbl.includes("row") ||
    lbl.includes("record") ||
    lbl.includes("entry") ||
    lbl.includes("entries") ||
    lbl.includes("sample") ||
    lbl.includes("dataset")
  ) {
    return Database;
  }

  // 2. Data Structure: Columns, Attributes, Fields, Dimensions
  if (
    lbl.includes("column") ||
    lbl.includes("attr") ||
    lbl.includes("field") ||
    lbl.includes("dimension") ||
    lbl.includes("variable") ||
    lbl.includes("feature")
  ) {
    return Columns3;
  }

  // 3. Data Integrity & Quality (Health score, validation, completeness)
  if (
    lbl.includes("quality") ||
    lbl.includes("health") ||
    lbl.includes("valid") ||
    lbl.includes("clean") ||
    lbl.includes("complete") ||
    lbl.includes("integrity")
  ) {
    return ShieldCheck;
  }

  // 4. Data Hygiene Issues (Missing values, nulls, errors)
  if (lbl.includes("missing") || lbl.includes("null") || lbl.includes("error") || lbl.includes("anomaly")) {
    return AlertCircle;
  }

  // 5. Business, Commerce & Financial
  if (lbl.includes("revenue") || lbl.includes("sale") || lbl.includes("price") || lbl.includes("profit") || lbl.includes("cost") || lbl.includes("spend")) {
    return DollarSign;
  }
  if (lbl.includes("order") || lbl.includes("cart") || lbl.includes("checkout")) {
    return ShoppingBag;
  }
  if (lbl.includes("user") || lbl.includes("customer") || lbl.includes("client") || lbl.includes("visitor") || lbl.includes("member")) {
    return Users;
  }
  if (lbl.includes("rate") || lbl.includes("pct") || lbl.includes("%") || lbl.includes("ratio") || lbl.includes("conversion")) {
    return Percent;
  }
  if (lbl.includes("avg") || lbl.includes("mean") || lbl.includes("median") || lbl.includes("score")) {
    return Activity;
  }
  if (lbl.includes("date") || lbl.includes("year") || lbl.includes("month") || lbl.includes("time") || lbl.includes("period") || lbl.includes("season") || lbl.includes("match")) {
    return CalendarDays;
  }

  // 6. Quantitative Aggregations (Total Margin_Runs, Totals, Quantities, Counts)
  if (lbl.includes("total") || lbl.includes("sum") || lbl.includes("count") || lbl.includes("run") || lbl.includes("point")) {
    return BarChart3;
  }

  // Precise fallback sequence tailored to core analytics positions:
  // Position 0: Total Rows (Database)
  // Position 1: Total Columns (Columns3)
  // Position 2: Aggregated Metric (BarChart3)
  // Position 3: Quality / Health (ShieldCheck)
  const fallbacks = [Database, Columns3, BarChart3, ShieldCheck];
  return fallbacks[index % fallbacks.length];
}

export function KpiCard({ metric, index = 0 }: { metric: any; index?: number }) {
  const Icon = metric.icon || getKpiIcon(metric.label, index);

  // Clean value rendering: if value is "15 Attributes" or has a string suffix, format cleanly
  const rawValue = String(metric.value ?? "-");
  const match = rawValue.match(/^([\d.,]+[%MkBb]?)\s*(.*)$/);
  const mainVal = match && match[1] ? match[1] : rawValue;
  const subVal = match && match[2] ? match[2] : null;

  const colorStyles: Record<string, { bg: string; text: string; iconBg: string }> = {
    primary: {
      bg: "bg-primary-soft/40",
      text: "text-primary",
      iconBg: "bg-primary-soft text-primary",
    },
    success: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    danger: {
      bg: "bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    },
  };

  const scheme = colorStyles[metric.color] || colorStyles.primary;

  return (
    <Card className="transition-all hover:border-primary/40 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-wider text-textSecondary mb-2">
              {metric.label}
            </p>
            <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
                {mainVal}
              </h3>
              {subVal && (
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                  {subVal}
                </span>
              )}
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-semibold"
              aria-label={`Trend: ${metric.trend}`}
            >
              {metric.trendDirection === "up" && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  {metric.trend}
                </span>
              )}
              {metric.trendDirection === "down" && (
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                  <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                  {metric.trend}
                </span>
              )}
              {metric.trendDirection === "neutral" && (
                <span className="flex items-center gap-1 text-textMuted font-medium">
                  <Minus className="h-3.5 w-3.5 shrink-0" />
                  {metric.trend}
                </span>
              )}
            </div>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 shadow-2xs",
              scheme.iconBg
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
