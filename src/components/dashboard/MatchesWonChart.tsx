import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { matchesWonData } from "../../data/dashboardMockData";
import { ChevronDown, MoreVertical } from "lucide-react";
import { IconButton } from "../ui/IconButton";

export function MatchesWonChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-white p-3 shadow-lg">
          <p className="mb-1 text-sm font-semibold text-textPrimary">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-textSecondary">Wins:</span>
            <span className="text-sm font-bold text-textPrimary">
              {payload[0].value}
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
        <CardTitle>Matches Won by Team</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-textSecondary hover:bg-slate-50 cursor-pointer">
            Bar Chart
            <ChevronDown className="h-3 w-3" />
          </div>
          <IconButton variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </IconButton>
        </div>
      </CardHeader>
      <CardContent className="flex-1 mt-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={matchesWonData}
              margin={{ top: 20, right: 0, left: -20, bottom: 20 }}
              barSize={24}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="team"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
                dy={10}
                label={{ value: 'Teams', position: 'bottom', offset: 0, fill: '#475569', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
                label={{ value: 'Matches Won', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 12, dy: 50 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="wins" radius={[4, 4, 0, 0]}>
                {matchesWonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
