import { KpiCard } from "../components/dashboard/KpiCard";
import { MatchesWonChart } from "../components/dashboard/MatchesWonChart";
import { DatasetOverview } from "../components/dashboard/DatasetOverview";
import { TopScorersTable } from "../components/dashboard/TopScorersTable";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentFiles } from "../components/dashboard/RecentFiles";
import { kpiData } from "../data/dashboardMockData";

export function DashboardOverview() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.id} metric={kpi} />
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
