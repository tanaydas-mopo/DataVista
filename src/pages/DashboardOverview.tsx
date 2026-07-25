import { KpiCard } from "../components/dashboard/KpiCard";
import { MatchesWonChart } from "../components/dashboard/MatchesWonChart";
import { DatasetOverview } from "../components/dashboard/DatasetOverview";
import { TopScorersTable } from "../components/dashboard/TopScorersTable";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentFiles } from "../components/dashboard/RecentFiles";
import { useDataset } from "../context/DatasetContext";

export function DashboardOverview() {
  const { dataset } = useDataset();

  const emptyKpis = [
    { id: "e1", label: "Total Metric", value: "-", trend: "No active dataset", trendDirection: "neutral", color: "primary" },
    { id: "e2", label: "Primary Aggregation", value: "-", trend: "Upload data file", trendDirection: "neutral", color: "success" },
    { id: "e3", label: "Secondary Metric", value: "-", trend: "Waiting for source", trendDirection: "neutral", color: "warning" },
    { id: "e4", label: "Data Quality", value: "-", trend: "No source selected", trendDirection: "neutral", color: "purple" },
  ];

  const currentKpis = dataset.status === "active" && dataset.kpis.length > 0 ? dataset.kpis : emptyKpis;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {currentKpis.map((kpi, idx) => (
          <KpiCard key={kpi.id || idx} metric={kpi} index={idx} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main Content Column */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          <MatchesWonChart />
          <TopScorersTable />
        </div>

        {/* Sidebar Content Column */}
        <div className="flex flex-col gap-6 xl:col-span-1">
          <DatasetOverview />
          <QuickActions />
          <RecentFiles />
        </div>
      </div>
    </div>
  );
}
