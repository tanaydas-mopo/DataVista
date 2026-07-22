import { CalendarDays, TrendingUp, Users, Target } from "lucide-react";
import type { KpiMetric, QuickAction } from "../types/dashboard";

export const kpiData: KpiMetric[] = [
  {
    id: "kpi-1",
    label: "Total Matches",
    value: "74",
    trend: "12% vs last season",
    trendDirection: "up",
    icon: CalendarDays,
    sparkline: [],
    color: "primary",
  },
  {
    id: "kpi-2",
    label: "Total Runs",
    value: "18,523",
    trend: "8% vs last season",
    trendDirection: "up",
    icon: TrendingUp,
    sparkline: [],
    color: "success",
  },
  {
    id: "kpi-3",
    label: "Total Wickets",
    value: "1,342",
    trend: "5% vs last season",
    trendDirection: "up",
    icon: Users,
    sparkline: [],
    color: "warning",
  },
  {
    id: "kpi-4",
    label: "Avg. Score",
    value: "125.64",
    trend: "3% vs last season",
    trendDirection: "down",
    icon: Target,
    sparkline: [],
    color: "purple",
  },
];

export const matchesWonData = [
  { team: "CSK", wins: 18, color: "#2563EB" },
  { team: "MI", wins: 16, color: "#14B8A6" },
  { team: "RCB", wins: 15, color: "#8B5CF6" },
  { team: "KKR", wins: 12, color: "#F59E0B" },
  { team: "SRH", wins: 8, color: "#EF4444" },
  { team: "RR", wins: 5, color: "#2563EB" },
  { team: "DC", wins: 4, color: "#14B8A6" },
  { team: "PBKS", wins: 3, color: "#8B5CF6" },
  { team: "LSG", wins: 2, color: "#F59E0B" },
  { team: "GT", wins: 1, color: "#EF4444" },
];

export const topScorers = [
  { name: "Virat Kohli", matches: 15, runs: 741, average: 61.75, strikeRate: 139.04, hundreds: 1, fifties: 5 },
  { name: "Rohit Sharma", matches: 14, runs: 597, average: 54.27, strikeRate: 142.61, hundreds: 1, fifties: 4 },
  { name: "Shubman Gill", matches: 15, runs: 527, average: 37.64, strikeRate: 147.61, hundreds: 0, fifties: 4 },
  { name: "Ruturaj Gaikwad", matches: 14, runs: 493, average: 35.21, strikeRate: 135.34, hundreds: 0, fifties: 3 },
  { name: "Suryakumar Yadav", matches: 13, runs: 472, average: 39.33, strikeRate: 151.12, hundreds: 0, fifties: 2 },
];

export const recentFiles = [
  { name: "IPL Matches 2024.csv", date: "22 May 2024" },
  { name: "E-Commerce Sales.csv", date: "20 May 2024" },
  { name: "Student Academic.csv", date: "18 May 2024" },
];

export const quickActions: QuickAction[] = [
  {
    id: "qa1",
    title: "Upload Dataset",
    description: "",
    action: "upload",
  },
  {
    id: "qa2",
    title: "Clean Data",
    description: "",
    action: "clean",
  },
  {
    id: "qa3",
    title: "Visual Builder",
    description: "",
    action: "chart",
  },
  {
    id: "qa4",
    title: "Compare with Power BI",
    description: "",
    action: "dashboard",
  },
];
