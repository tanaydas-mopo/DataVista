import { ArrowRight, Table } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useDataset } from "../../context/DatasetContext";
import { useNavigate } from "react-router-dom";

export function TopScorersTable() {
  const { dataset } = useDataset();
  const navigate = useNavigate();

  const isDatasetActive = dataset.status === "active" && dataset.tableRows.length > 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{dataset.tableTitle || "Dataset Records"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        {isDatasetActive ? (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs font-semibold text-textPrimary bg-slate-50">
                  <tr>
                    {dataset.tableHeaders.map((header, idx) => (
                      <th
                        key={idx}
                        className={`py-3 px-4 ${idx === 0 ? "pl-4" : "text-center"}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dataset.tableRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="bg-white transition-colors hover:bg-slate-50/70"
                    >
                      {dataset.tableHeaders.map((header, colIdx) => (
                        <td
                          key={colIdx}
                          className={`py-3 px-4 text-sm ${
                            colIdx === 0
                              ? "font-semibold text-textPrimary whitespace-nowrap pl-4"
                              : "text-textSecondary text-center"
                          }`}
                        >
                          {row[header] !== undefined ? String(row[header]) : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => navigate("/data-schema")}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-textPrimary shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                View Full Dataset Schema
                <ArrowRight className="h-4 w-4 text-textSecondary" />
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2 text-center">
            <Table className="w-12 h-12 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-600">No Dataset Records Available</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Upload a dataset to view structured table records and data preview.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
