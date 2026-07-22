import React from "react";

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  sparkline: number[];
  color: "primary" | "success" | "warning" | "danger" | "purple";
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  action: "upload" | "clean" | "chart" | "dashboard" | "report";
}
