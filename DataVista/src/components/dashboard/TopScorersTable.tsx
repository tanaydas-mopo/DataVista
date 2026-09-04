"use client";

import { ArrowRight, Table } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useDataset } from "../../context/DatasetContext";
import { useRouter } from "next/navigation";

export function TopScorersTable() {
  const { dataset } = useDataset();
  const router = useRouter();

  const isDatasetActive = dataset.status === "active" && dataset.tableRows.length > 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{dataset.tableTitle || "Dataset Records"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between">
        {isDatasetActive ? (
          <>
            <div className="overflow-x-auto w-full rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs font-bold text-textPrimary bg-primary-soft/20">
                  <tr>
                    {dataset.tableHeaders.map((header, idx) => (
                      <th
                        key={idx}
                        className={`py-3 px-4 uppercase tracking-wider ${idx === 0 ? "pl-4" : "text-center"}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {dataset.tableRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="transition-colors hover:bg-primary-soft/10"
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
                onClick={() => router.push("/data-schema")}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-textPrimary shadow-xs transition-colors hover:bg-primary-soft/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                View Full Dataset Schema
                <ArrowRight className="h-3.5 w-3.5 text-textSecondary" />
              </button>
            </div>
          </>
        ) : (
          <div className="py-10 border-2 border-dashed border-border rounded-2xl bg-surface/50 flex flex-col items-center justify-center text-center p-6">
            <img
              src="/assets/illustrations/empty-states/illustration-empty-data.svg"
              alt="No Dataset Records"
              className="w-36 h-auto mb-2 opacity-90"
            />
            <p className="text-sm font-bold text-textPrimary">No Dataset Records Available</p>
            <p className="text-xs text-textSecondary max-w-xs mt-0.5">
              Upload a dataset to view structured table records and data preview.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
