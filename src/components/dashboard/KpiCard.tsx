import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import type { KpiMetric } from "../../types/dashboard";
import { cn } from "../../lib/utils";

export function KpiCard({ metric }: { metric: KpiMetric }) {
  const Icon = metric.icon;

  const colorStyles = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    purple: "bg-purple-soft text-purple",
  };

  return (
    <Card className="transition-all hover:border-borderStrong hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-textPrimary mb-3">
              {metric.label}
            </p>
            <h3 className="text-3xl font-bold text-textPrimary mb-3">
              {metric.value}
            </h3>
            <div className="flex items-center gap-1.5">
              {metric.trendDirection === "up" && (
                <TrendingUp className="h-4 w-4 text-success" />
              )}
              {metric.trendDirection === "down" && (
                <TrendingDown className="h-4 w-4 text-danger" />
              )}
              {metric.trendDirection === "neutral" && (
                <Minus className="h-4 w-4 text-slate-400" />
              )}
              <span
                className={cn(
                  "text-xs font-semibold",
                  metric.trendDirection === "up"
                    ? "text-success"
                    : metric.trendDirection === "down"
                    ? "text-danger"
                    : "text-slate-500"
                )}
              >
                {metric.trend}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
              colorStyles[metric.color]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
