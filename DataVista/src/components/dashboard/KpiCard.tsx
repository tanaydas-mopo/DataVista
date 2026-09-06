"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  Target,
  Trophy,
  Activity,
  Layers,
  Sparkles,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../lib/utils";

// Domain-aware icon mapping
function getKpiIcon(label: string, index: number) {
  const lbl = (label || "").toLowerCase();
  if (lbl.includes("match")) return CalendarDays;
  if (lbl.includes("run")) return Trophy;
  if (lbl.includes("wicket")) return Target;
  if (lbl.includes("score") || lbl.includes("avg")) return Activity;
  if (lbl.includes("revenue") || lbl.includes("sale")) return DollarSign;
  if (lbl.includes("order")) return ShoppingBag;
  if (lbl.includes("store") || lbl.includes("location")) return Layers;

  const fallbacks = [Trophy, Target, Activity, Sparkles];
  return fallbacks[index % fallbacks.length];
}

export function KpiCard({ metric, index = 0 }: { metric: any; index?: number }) {
  const Icon = metric.icon || getKpiIcon(metric.label, index);

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
            <h3 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight mb-2">
              {metric.value}
            </h3>
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
