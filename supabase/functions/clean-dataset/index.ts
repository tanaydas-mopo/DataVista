// DataVista Edge Function: clean-dataset
// Follows Supabase Edge Runtime standards (Deno + TypeScript)
// Serves server-side data transformation operations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CleaningRequest {
  action: "remove-duplicates" | "fill-missing" | "remove-nulls" | "detect-outliers";
  rows: Record<string, any>[];
  columns?: string[];
  options?: {
    strategy?: "mean" | "median" | "mode" | "constant";
    constantValue?: any;
    targetColumn?: string;
    threshold?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, rows, columns, options } = (await req.json()) as CleaningRequest;

    if (!rows || !Array.isArray(rows)) {
      return new Response(
        JSON.stringify({ error: "Invalid rows array provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let cleanedRows = [...rows];
    let affectedCount = 0;

    switch (action) {
      case "remove-duplicates": {
        const seen = new Set<string>();
        const unique: Record<string, any>[] = [];
        for (const row of cleanedRows) {
          const key = JSON.stringify(row);
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(row);
          } else {
            affectedCount++;
          }
        }
        cleanedRows = unique;
        break;
      }

      case "remove-nulls": {
        const targetCol = options?.targetColumn;
        const filtered: Record<string, any>[] = [];
        for (const row of cleanedRows) {
          if (targetCol) {
            const val = row[targetCol];
            if (val === null || val === undefined || String(val).trim() === "") {
              affectedCount++;
              continue;
            }
          } else {
            const hasNull = Object.values(row).some(
              (v) => v === null || v === undefined || String(v).trim() === ""
            );
            if (hasNull) {
              affectedCount++;
              continue;
            }
          }
          filtered.push(row);
        }
        cleanedRows = filtered;
        break;
      }

      case "fill-missing": {
        const targetCol = options?.targetColumn;
        const strategy = options?.strategy || "constant";
        const constantVal = options?.constantValue ?? "-";

        if (!targetCol) {
          throw new Error("Target column is required for fill-missing action");
        }

        // Calculate statistics if needed
        let fillVal = constantVal;
        if (strategy === "mean" || strategy === "median") {
          const numericVals = cleanedRows
            .map((r) => Number(r[targetCol]))
            .filter((n) => !isNaN(n));
          if (numericVals.length > 0) {
            if (strategy === "mean") {
              fillVal = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
            } else {
              const sorted = [...numericVals].sort((a, b) => a - b);
              const mid = Math.floor(sorted.length / 2);
              fillVal = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
            }
          }
        }

        cleanedRows = cleanedRows.map((r) => {
          const val = r[targetCol];
          if (val === null || val === undefined || String(val).trim() === "") {
            affectedCount++;
            return { ...r, [targetCol]: fillVal };
          }
          return r;
        });
        break;
      }

      case "detect-outliers": {
        const targetCol = options?.targetColumn;
        if (!targetCol) throw new Error("Target column required for outlier detection");

        const numericVals = cleanedRows
          .map((r) => Number(r[targetCol]))
          .filter((n) => !isNaN(n))
          .sort((a, b) => a - b);

        if (numericVals.length >= 4) {
          const q1 = numericVals[Math.floor(numericVals.length * 0.25)];
          const q3 = numericVals[Math.floor(numericVals.length * 0.75)];
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;

          cleanedRows = cleanedRows.map((r) => {
            const num = Number(r[targetCol]);
            const isOutlier = !isNaN(num) && (num < lowerBound || num > upperBound);
            if (isOutlier) affectedCount++;
            return { ...r, _is_outlier: isOutlier };
          });
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        affectedCount,
        totalRows: cleanedRows.length,
        data: cleanedRows,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
