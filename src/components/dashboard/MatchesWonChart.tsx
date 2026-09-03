"use client";

import React from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useDataset } from "../../context/DatasetContext";
import { ChevronDown, MoreVertical, BarChart2 } from "lucide-react";
import { IconButton } from "../ui/IconButton";

export const MatchesWonChart = React.memo(function MatchesWonChart() {
  const { dataset } = useDataset();

  const isDatasetActive = dataset.status === "active" && dataset.chartData.length > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-white p-3 shadow-lg">
          <p className="mb-1 text-sm font-semibold text-textPrimary">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-textSecondary">Value:</span>
            <span className="text-sm font-bold text-textPrimary">
              {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{dataset.chartTitle || "Dataset Analysis"}</CardTitle>
        {isDatasetActive && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-textSecondary hover:bg-slate-50 cursor-pointer">
              Bar Chart
              <ChevronDown className="h-3 w-3" />
            </div>
            <IconButton variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </IconButton>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 mt-4">
        {isDatasetActive ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={dataset.chartData}
                margin={{ top: 20, right: 10, left: 0, bottom: 25 }}
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {dataset.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] w-full border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
            <BarChart2 className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-600">No Dataset Active</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Upload a dataset to generate interactive charts and visual breakdown.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
