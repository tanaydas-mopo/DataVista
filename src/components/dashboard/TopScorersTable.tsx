import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { topScorers } from "../../data/dashboardMockData";

export function TopScorersTable() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Top Run Scorers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs font-semibold text-textPrimary">
              <tr>
                <th className="py-3 pr-4">Player</th>
                <th className="py-3 px-4 text-center">Matches</th>
                <th className="py-3 px-4 text-center">Runs</th>
                <th className="py-3 px-4 text-center">Average</th>
                <th className="py-3 px-4 text-center">Strike Rate</th>
                <th className="py-3 px-4 text-center">100s</th>
                <th className="py-3 pl-4 text-center">50s</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topScorers.map((player) => (
                <tr
                  key={player.name}
                  className="bg-white transition-colors hover:bg-slate-50"
                >
                  <td className="py-3 pr-4 font-medium text-textPrimary whitespace-nowrap">
                    {player.name}
                  </td>
                  <td className="py-3 px-4 text-textSecondary text-center">
                    {player.matches}
                  </td>
                  <td className="py-3 px-4 font-semibold text-textPrimary text-center">
                    {player.runs}
                  </td>
                  <td className="py-3 px-4 text-textSecondary text-center">
                    {player.average}
                  </td>
                  <td className="py-3 px-4 text-textSecondary text-center">
                    {player.strikeRate}
                  </td>
                  <td className="py-3 px-4 text-textSecondary text-center">
                    {player.hundreds}
                  </td>
                  <td className="py-3 pl-4 text-textSecondary text-center">
                    {player.fifties}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex items-center justify-end">
          <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-textPrimary shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            View Full Table
            <ArrowRight className="h-4 w-4 text-textSecondary" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
