// DataVista Edge Function: generate-insights
// Follows Supabase Edge Runtime standards (Deno + TypeScript)
// Computes statistical summaries, anomalies, and chart recommendations

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InsightsRequest {
  datasetName: string;
  headers: string[];
  rows: Record<string, any>[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { datasetName, headers, rows } = (await req.json()) as InsightsRequest;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Non-empty rows array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const columnStats: Record<string, any> = {};
    const numericCols: string[] = [];
    const categoricalCols: string[] = [];
    const dateCols: string[] = [];

    // Classify columns & calculate basic stats
    for (const header of headers) {
      let nullCount = 0;
      const values: any[] = [];
      const numericVals: number[] = [];

      for (const row of rows) {
        const val = row[header];
        if (val === null || val === undefined || String(val).trim() === "") {
          nullCount++;
        } else {
          values.push(val);
          const num = Number(val);
          if (!isNaN(num)) numericVals.push(num);
        }
      }

      const isNumeric = numericVals.length >= values.length * 0.7 && values.length > 0;
      const sample = String(values[0] || "");
      const isDate =
        !isNumeric &&
        !isNaN(Date.parse(sample)) &&
        (sample.includes("-") || sample.includes("/") || sample.includes(":"));

      if (isNumeric) {
        numericCols.push(header);
        const sum = numericVals.reduce((a, b) => a + b, 0);
        const avg = sum / (numericVals.length || 1);
        const min = Math.min(...numericVals);
        const max = Math.max(...numericVals);
        columnStats[header] = {
          type: "Numeric",
          nullCount,
          nullPercentage: Math.round((nullCount / rows.length) * 100),
          min,
          max,
          avg: Math.round(avg * 100) / 100,
        };
      } else if (isDate) {
        dateCols.push(header);
        columnStats[header] = {
          type: "Date",
          nullCount,
          nullPercentage: Math.round((nullCount / rows.length) * 100),
        };
      } else {
        categoricalCols.push(header);
        const distinctCount = new Set(values).size;
        columnStats[header] = {
          type: "Categorical",
          nullCount,
          nullPercentage: Math.round((nullCount / rows.length) * 100),
          distinctCount,
        };
      }
    }

    // Generate intelligent visualization recommendations
    const recommendations: any[] = [];

    // 1. Time-series recommendation
    if (dateCols.length > 0 && numericCols.length > 0) {
      recommendations.push({
        chartType: "area",
        title: `${numericCols[0]} Trend Over Time`,
        xAxis: dateCols[0],
        yAxis: numericCols[0],
        reason: "Time series data detected; area or line chart visualizes temporal momentum effectively.",
      });
    }

    // 2. Categorical comparison recommendation
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      recommendations.push({
        chartType: "bar",
        title: `${numericCols[0]} by ${categoricalCols[0]}`,
        xAxis: categoricalCols[0],
        yAxis: numericCols[0],
        reason: "Categorical dimension paired with metric; bar chart provides direct category comparison.",
      });
    }

    // 3. Composition recommendation
    if (categoricalCols.length > 0) {
      recommendations.push({
        chartType: "donut",
        title: `Distribution of ${categoricalCols[0]}`,
        xAxis: categoricalCols[0],
        yAxis: numericCols[0] || categoricalCols[0],
        reason: "Shows percentage contribution across distinct category buckets.",
      });
    }

    // 4. Correlation recommendation
    if (numericCols.length >= 2) {
      recommendations.push({
        chartType: "scatter",
        title: `${numericCols[0]} vs ${numericCols[1]} Correlation`,
        xAxis: numericCols[0],
        yAxis: numericCols[1],
        reason: "Two continuous variables detected; scatter plot reveals distribution and linear clustering.",
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        datasetName,
        totalRows: rows.length,
        totalColumns: headers.length,
        columnStats,
        classification: {
          numeric: numericCols,
          categorical: categoricalCols,
          date: dateCols,
        },
        recommendations,
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
