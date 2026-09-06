"use client";

import React, { useState, useMemo } from "react";
import { ArrowRight, ArrowUpDown, Search, Table as TableIcon, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useDataset } from "../../context/DatasetContext";
import { useRouter } from "next/navigation";

export function TopScorersTable() {
  const { dataset } = useDataset();
  const router = useRouter();

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterQuery, setFilterQuery] = useState("");

  const isDatasetActive = dataset.status === "active" && dataset.tableRows.length > 0;

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  };

  const processedRows = useMemo(() => {
    if (!isDatasetActive) return [];
    let rows = [...dataset.tableRows];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    if (sortColumn) {
      rows.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        const numA = Number(valA);
        const numB = Number(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }
        return sortDirection === "asc"
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }, [dataset.tableRows, isDatasetActive, filterQuery, sortColumn, sortDirection]);

  return (
    <Card className="flex h-full flex-col shadow-xs border-border">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <CardTitle className="text-sm font-bold text-textPrimary flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            {dataset.tableTitle || "Top Performers Summary"}
          </CardTitle>
          <p className="text-[11px] text-textSecondary mt-0.5">
            Top sample records • Showing {processedRows.length} of {dataset.totalRows} records
          </p>
        </div>

        {isDatasetActive && (
          <div className="relative max-w-xs w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-textMuted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter sample..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-xl border border-border bg-surface text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primary"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between p-4">
        {isDatasetActive ? (
          <>
            <div className="overflow-x-auto w-full rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-[11px] font-bold text-textSecondary bg-primary-soft/20">
                  <tr>
                    {dataset.tableHeaders.map((header, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleSort(header)}
                        className={`py-2.5 px-3 uppercase tracking-wider select-none hover:text-textPrimary hover:bg-primary-soft/40 cursor-pointer transition-colors ${
                          idx === 0 ? "pl-4" : "text-center"
                        }`}
                      >
                        <div
                          className={`inline-flex items-center gap-1 ${
                            idx === 0 ? "justify-start" : "justify-center"
                          }`}
                        >
                          <span>{header}</span>
                          <ArrowUpDown className="w-3 h-3 opacity-60" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {processedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={dataset.tableHeaders.length}
                        className="text-center py-6 text-xs text-textSecondary"
                      >
                        No rows match your filter query.
                      </td>
                    </tr>
                  ) : (
                    processedRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="transition-colors hover:bg-primary-soft/10">
                        {dataset.tableHeaders.map((header, colIdx) => (
                          <td
                            key={colIdx}
                            className={`py-2.5 px-3 text-xs ${
                              colIdx === 0
                                ? "font-bold text-textPrimary whitespace-nowrap pl-4"
                                : "text-textSecondary text-center font-medium"
                            }`}
                          >
                            {row[header] !== undefined ? String(row[header]) : "-"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border">
              <span className="text-[11px] text-textMuted font-medium">
                Click column headers to sort ascending or descending
              </span>
              <button
                type="button"
                onClick={() => router.push("/data-schema")}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-textPrimary shadow-2xs transition-colors hover:bg-primary-soft/30 hover:border-primary/40 cursor-pointer active:scale-95"
              >
                View Full Dataset ({dataset.totalRows} rows)
                <ArrowRight className="h-3.5 w-3.5 text-textSecondary" />
              </button>
            </div>
          </>
        ) : (
          <div className="py-10 border-2 border-dashed border-border rounded-2xl bg-surface/50 flex flex-col items-center justify-center text-center p-6">
            <TableIcon className="w-10 h-10 text-primary mb-2 opacity-80" />
            <p className="text-sm font-bold text-textPrimary">No Records Available</p>
            <p className="text-xs text-textSecondary max-w-xs mt-0.5">
              Upload a dataset to inspect structured table records.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
