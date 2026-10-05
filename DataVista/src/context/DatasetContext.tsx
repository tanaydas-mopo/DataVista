"use client";

import React, { createContext, useContext, useState } from 'react';
import * as XLSX from 'xlsx';

export interface DynamicKpi {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  color: 'primary' | 'success' | 'warning' | 'purple';
}

export interface DynamicChartItem {
  label: string;
  value: number;
  color: string;
}

export interface DatasetInfo {
  name: string;
  totalRows: string;
  totalColumns: string;
  missingValues: string;
  lastUpdated: string;
  fileSize?: string;
  status: 'active' | 'empty';
  type: 'sales' | 'ipl' | 'generic' | 'empty';
  kpis: DynamicKpi[];
  chartTitle: string;
  chartData: DynamicChartItem[];
  tableTitle: string;
  tableHeaders: string[];
  tableRows: Array<Record<string, any>>;
  rawHeaders: string[];
  rawRows: string[][];
}

interface DatasetContextType {
  dataset: DatasetInfo;
  uploadDataset: (file: File) => Promise<void>;
  switchDatasetPreset: (preset: 'ipl' | 'sales' | 'ecommerce') => void;
  loadPreviousDataset: (target: DatasetInfo) => void;
  removeDataset: () => void;
  updateChartVisual: (title: string, data: DynamicChartItem[]) => void;
  updateTableData: (headers: string[], rows: Array<Record<string, any>>) => void;
  notification: string | null;
  clearNotification: () => void;
  restorePreviousDataset: () => void;
  canUndoDataset: boolean;
}

// Default colors for chart bars
const CHART_COLORS = [
  "#2563EB", "#14B8A6", "#8B5CF6", "#F59E0B", "#EF4444",
  "#3B82F6", "#06B6D4", "#A855F7", "#10B981", "#F97316"
];

// IPL Default Mock Dataset
const defaultIplDataset: DatasetInfo = {
  name: "IPL Matches 2024.csv",
  totalRows: "15,600",
  totalColumns: "15",
  missingValues: "0",
  lastUpdated: "26 Jul 2026, 10:30 AM",
  fileSize: "4.82 MB",
  status: "active",
  type: "ipl",
  kpis: [
    { id: "k1", label: "Total Matches", value: "74", trend: "12% vs last season", trendDirection: "up", color: "primary" },
    { id: "k2", label: "Total Runs", value: "18,523", trend: "8% vs last season", trendDirection: "up", color: "success" },
    { id: "k3", label: "Total Wickets", value: "1,342", trend: "5% vs last season", trendDirection: "up", color: "warning" },
    { id: "k4", label: "Avg. Score", value: "125.64", trend: "3% vs last season", trendDirection: "down", color: "purple" },
  ],
  chartTitle: "Matches Won by Team",
  chartData: [
    { label: "CSK", value: 18, color: "#2563EB" },
    { label: "MI", value: 16, color: "#14B8A6" },
    { label: "RCB", value: 15, color: "#8B5CF6" },
    { label: "KKR", value: 12, color: "#F59E0B" },
    { label: "SRH", value: 8, color: "#EF4444" },
    { label: "RR", value: 5, color: "#2563EB" },
    { label: "DC", value: 4, color: "#14B8A6" },
    { label: "PBKS", value: 3, color: "#8B5CF6" },
    { label: "LSG", value: 2, color: "#F59E0B" },
    { label: "GT", value: 1, color: "#EF4444" },
  ],
  tableTitle: "Top Run Scorers",
  tableHeaders: ["Player", "Matches", "Runs", "Average", "Strike Rate", "100s", "50s"],
  tableRows: [
    { Player: "Virat Kohli", Matches: 15, Runs: 741, Average: 61.75, "Strike Rate": 139.04, "100s": 1, "50s": 5 },
    { Player: "Rohit Sharma", Matches: 14, Runs: 597, Average: 54.27, "Strike Rate": 142.61, "100s": 1, "50s": 4 },
    { Player: "Shubman Gill", Matches: 15, Runs: 527, Average: 37.64, "Strike Rate": 147.61, "100s": 0, "50s": 4 },
    { Player: "Ruturaj Gaikwad", Matches: 14, Runs: 493, Average: 35.21, "Strike Rate": 135.34, "100s": 0, "50s": 3 },
    { Player: "Suryakumar Yadav", Matches: 13, Runs: 472, Average: 39.33, "Strike Rate": 151.12, "100s": 0, "50s": 2 },
  ],
  rawHeaders: [
    "Team", "Season", "Matches_Played", "Matches_Won", "Matches_Lost",
    "Total_Runs", "Wickets", "Toss_Winner", "Margin_Runs", "High_Score",
    "Best_Bowling", "Economy_Rate", "Strike_Rate", "Fair_Play_Score", "Points"
  ],
  rawRows: [
    ["CSK", "2024", "15", "11", "4", "2480", "105", "CSK", "45", "223", "5/18", "8.12", "148.5", "142", "22"],
    ["MI", "2024", "15", "10", "5", "2350", "98", "MI", "38", "218", "4/20", "8.45", "144.2", "138", "20"],
    ["RCB", "2024", "15", "9", "6", "2410", "92", "RCB", "28", "241", "4/25", "9.05", "152.0", "136", "18"],
    ["KKR", "2024", "15", "9", "6", "2290", "110", "KKR", "35", "222", "5/22", "7.98", "146.1", "140", "18"],
    ["SRH", "2024", "15", "8", "7", "2520", "88", "SRH", "62", "287", "4/19", "9.42", "165.4", "132", "16"],
    ["RR", "2024", "15", "7", "8", "2180", "85", "RR", "20", "214", "4/24", "8.65", "139.8", "135", "14"],
    ["DC", "2024", "15", "6", "9", "2120", "79", "DC", "15", "208", "4/28", "8.90", "136.5", "130", "12"],
    ["PBKS", "2024", "15", "5", "10", "2050", "74", "PBKS", "12", "215", "3/26", "9.15", "138.2", "128", "10"],
    ["LSG", "2024", "15", "5", "10", "1990", "70", "LSG", "18", "199", "4/30", "8.75", "134.0", "134", "10"],
    ["GT", "2024", "15", "4", "11", "1950", "65", "GT", "8", "196", "3/22", "9.20", "131.5", "130", "8"]
  ],
};

// Sales Revenue Preset Dataset
const defaultSalesDataset: DatasetInfo = {
  name: "E-Commerce Revenue 2026.csv",
  totalRows: "24,850",
  totalColumns: "12",
  missingValues: "0",
  lastUpdated: "26 Jul 2026, 11:15 AM",
  fileSize: "6.12 MB",
  status: "active",
  type: "sales",
  kpis: [
    { id: "k1", label: "Total Revenue", value: "$1,482,900", trend: "18.4% vs last quarter", trendDirection: "up", color: "primary" },
    { id: "k2", label: "Total Orders", value: "24,850", trend: "12.1% vs last quarter", trendDirection: "up", color: "success" },
    { id: "k3", label: "Avg. Order Value", value: "$59.67", trend: "4.8% vs last quarter", trendDirection: "up", color: "warning" },
    { id: "k4", label: "Product Categories", value: "8", trend: "Active catalog lines", trendDirection: "up", color: "purple" },
  ],
  chartTitle: "Revenue by Product Category ($)",
  chartData: [
    { label: "Electronics", value: 485000, color: "#2563EB" },
    { label: "Clothing", value: 342000, color: "#14B8A6" },
    { label: "Home & Kitchen", value: 289000, color: "#8B5CF6" },
    { label: "Beauty & Personal", value: 178000, color: "#F59E0B" },
    { label: "Sports & Outdoors", value: 124000, color: "#EF4444" },
    { label: "Books & Media", value: 64900, color: "#3B82F6" },
  ],
  tableTitle: "Recent E-Commerce Orders",
  tableHeaders: ["Order ID", "Product Name", "Category", "Revenue ($)", "Quantity", "Order Date", "Status"],
  tableRows: [
    { "Order ID": "ORD-8891", "Product Name": "Noise-Canceling Headphones", Category: "Electronics", "Revenue ($)": 249.99, Quantity: 1, "Order Date": "2026-07-26", Status: "Completed" },
    { "Order ID": "ORD-8892", "Product Name": "Ultra-Light Running Shoes", Category: "Clothing", "Revenue ($)": 129.50, Quantity: 2, "Order Date": "2026-07-26", Status: "Completed" },
    { "Order ID": "ORD-8893", "Product Name": "Espresso Coffee Machine", Category: "Home & Kitchen", "Revenue ($)": 349.00, Quantity: 1, "Order Date": "2026-07-25", Status: "Processing" },
    { "Order ID": "ORD-8894", "Product Name": "Smart Fitness Watch V2", Category: "Electronics", "Revenue ($)": 199.99, Quantity: 1, "Order Date": "2026-07-25", Status: "Completed" },
    { "Order ID": "ORD-8895", "Product Name": "Organic Cotton Bed Sheets", Category: "Home & Kitchen", "Revenue ($)": 85.00, Quantity: 2, "Order Date": "2026-07-24", Status: "Shipped" },
  ],
  rawHeaders: ["order_id", "product_name", "category", "price", "quantity", "order_date", "status"],
  rawRows: [
    ["ORD-8891", "Noise-Canceling Headphones", "Electronics", "249.99", "1", "2026-07-26", "Completed"],
    ["ORD-8892", "Ultra-Light Running Shoes", "Clothing", "129.50", "2", "2026-07-26", "Completed"],
    ["ORD-8893", "Espresso Coffee Machine", "Home & Kitchen", "349.00", "1", "2026-07-25", "Processing"],
  ],
};

// Global Retail Preset Dataset
const defaultEcommerceDataset: DatasetInfo = {
  name: "Global Retail Analytics.csv",
  totalRows: "42,100",
  totalColumns: "18",
  missingValues: "0",
  lastUpdated: "26 Jul 2026, 12:00 PM",
  fileSize: "9.45 MB",
  status: "active",
  type: "generic",
  kpis: [
    { id: "k1", label: "Active Stores", value: "142", trend: "9 new locations", trendDirection: "up", color: "primary" },
    { id: "k2", label: "Total Transactions", value: "42,100", trend: "22% vs last month", trendDirection: "up", color: "success" },
    { id: "k3", label: "Customer Satisfaction", value: "94.8%", trend: "+2.1% CSAT", trendDirection: "up", color: "warning" },
    { id: "k4", label: "Fulfillment Rate", value: "99.2%", trend: "Optimal logistics", trendDirection: "up", color: "purple" },
  ],
  chartTitle: "Regional Sales Distribution ($)",
  chartData: [
    { label: "North America", value: 620000, color: "#2563EB" },
    { label: "Europe & UK", value: 480000, color: "#14B8A6" },
    { label: "Asia Pacific", value: 390000, color: "#8B5CF6" },
    { label: "Latin America", value: 210000, color: "#F59E0B" },
    { label: "Middle East", value: 145000, color: "#EF4444" },
  ],
  tableTitle: "Global Retail Outlets Summary",
  tableHeaders: ["Region", "Country", "Store ID", "Monthly Sales ($)", "CSAT Score", "Status"],
  tableRows: [
    { Region: "North America", Country: "USA", "Store ID": "US-NYC-01", "Monthly Sales ($)": 185000, "CSAT Score": "96.4%", Status: "Active" },
    { Region: "Europe & UK", Country: "UK", "Store ID": "UK-LDN-04", "Monthly Sales ($)": 142000, "CSAT Score": "94.8%", Status: "Active" },
    { Region: "Asia Pacific", Country: "Japan", "Store ID": "JP-TYO-02", "Monthly Sales ($)": 168000, "CSAT Score": "97.1%", Status: "Active" },
    { Region: "Latin America", Country: "Brazil", "Store ID": "BR-SAO-01", "Monthly Sales ($)": 94000, "CSAT Score": "92.5%", Status: "Active" },
  ],
  rawHeaders: ["region", "country", "store_id", "monthly_sales", "csat_score", "status"],
  rawRows: [
    ["North America", "USA", "US-NYC-01", "185000", "96.4%", "Active"],
    ["Europe & UK", "UK", "UK-LDN-04", "142000", "94.8%", "Active"],
  ],
};

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<DatasetInfo>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("datavista_dataset");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            parsed.name &&
            !String(parsed.name).includes("PK\u0003") &&
            !JSON.stringify(parsed.rawHeaders || []).includes("Content_Types")
          ) {
            return parsed;
          }
        }
      } catch {
        return defaultIplDataset;
      }
    }
    return defaultIplDataset;
  });

  const [previousDataset, setPreviousDataset] = useState<DatasetInfo | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const clearNotification = () => setNotification(null);

  const switchDatasetPreset = (preset: 'ipl' | 'sales' | 'ecommerce') => {
    let targetDataset = defaultIplDataset;
    if (preset === 'sales') targetDataset = defaultSalesDataset;
    if (preset === 'ecommerce') targetDataset = defaultEcommerceDataset;

    setDataset(targetDataset);
    try {
      localStorage.setItem("datavista_dataset", JSON.stringify(targetDataset));
    } catch (e) {
      console.warn("Could not save preset to localStorage:", e);
    }
    setNotification(`Switched active dataset to "${targetDataset.name}"`);
    setTimeout(() => setNotification(null), 4000);
  };

  const loadPreviousDataset = (targetDataset: DatasetInfo) => {
    if (!targetDataset) return;
    setDataset(targetDataset);
    try {
      localStorage.setItem("datavista_dataset", JSON.stringify(targetDataset));
    } catch (e) {
      console.warn("Could not save dataset to localStorage:", e);
    }
    setNotification(`Resumed dataset "${targetDataset.name}"`);
    setTimeout(() => setNotification(null), 4000);
  };

  const uploadDataset = (file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => {
        setNotification("Failed to read dataset file.");
        reject(new Error("FileReader failed"));
      };

      reader.onload = (e) => {
        setTimeout(() => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const fileNameLower = file.name.toLowerCase();
            
            let rawHeaders: string[] = [];
            let rawRows: string[][] = [];

            // 1. JSON Support: parse directly if JSON format
            if (fileNameLower.endsWith(".json")) {
              try {
                const textDecoder = new TextDecoder("utf-8");
                const text = textDecoder.decode(buffer);
                const parsed = JSON.parse(text);
                const jsonArray = Array.isArray(parsed) ? parsed : [parsed];
                if (jsonArray.length > 0) {
                  const keysSet = new Set<string>();
                  jsonArray.forEach((item) => {
                    if (item && typeof item === "object") {
                      Object.keys(item).forEach((k) => keysSet.add(k));
                    }
                  });
                  rawHeaders = Array.from(keysSet);
                  rawRows = jsonArray.map((item) => {
                    return rawHeaders.map((k) => {
                      const val = item?.[k];
                      return val !== undefined && val !== null ? String(val) : "";
                    });
                  });
                }
              } catch (jsonErr) {
                console.error("JSON parsing error:", jsonErr);
              }
            }

            // 2. XLSX / CSV Support: parse all sheet cells without discarding or trimming values
            if (rawHeaders.length === 0) {
              try {
                const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                const sheetData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
                  header: 1,
                  defval: "",
                  raw: false,
                });

                if (sheetData && sheetData.length > 0) {
                  const firstRow = sheetData[0] || [];
                  rawHeaders = firstRow.map((h, idx) => {
                    const headerStr = h !== null && h !== undefined ? String(h).replace(/\uFFFD/g, "").trim() : "";
                    return headerStr.length > 0 ? headerStr : `Column_${idx + 1}`;
                  });

                  // Retain all rows and values exactly as uploaded
                  rawRows = sheetData.slice(1).map((row) => {
                    return rawHeaders.map((_, colIdx) => {
                      const cell = row ? row[colIdx] : undefined;
                      return cell !== null && cell !== undefined ? String(cell).replace(/\uFFFD/g, "") : "";
                    });
                  });
                }
              } catch (err) {
                console.error("XLSX parsing error, falling back to text parser", err);
              }
            }

            // 3. Robust Text Fallback (supports commas inside quoted strings)
            if (rawHeaders.length === 0) {
              try {
                const textDecoder = new TextDecoder("utf-8");
                const text = textDecoder.decode(buffer);
                const lines = text.split(/\r\n|\n/).filter((l) => l.length > 0);
                if (lines.length > 0) {
                  const parseCsvLine = (line: string): string[] => {
                    const result: string[] = [];
                    let cur = "";
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                      const ch = line[i];
                      if (ch === '"') {
                        if (inQuotes && line[i + 1] === '"') {
                          cur += '"';
                          i++;
                        } else {
                          inQuotes = !inQuotes;
                        }
                      } else if ((ch === ',' || ch === '\t' || ch === ';') && !inQuotes) {
                        result.push(cur);
                        cur = "";
                      } else {
                        cur += ch;
                      }
                    }
                    result.push(cur);
                    return result;
                  };

                  rawHeaders = parseCsvLine(lines[0]).map((h, idx) => {
                    const trimmed = h.replace(/^["']|["']$/g, "").replace(/\uFFFD/g, "").trim();
                    return trimmed.length > 0 ? trimmed : `Column_${idx + 1}`;
                  });

                  rawRows = lines.slice(1).map((line) => {
                    const parsed = parseCsvLine(line);
                    return rawHeaders.map((_, colIdx) => {
                      const val = parsed[colIdx];
                      return val !== undefined && val !== null ? val.replace(/^["']|["']$/g, "").replace(/\uFFFD/g, "") : "";
                    });
                  });
                }
              } catch (textErr) {
                console.error("Text fallback failed", textErr);
              }
            }

            const totalRowsCount = rawRows.length;
            const totalColsCount = rawHeaders.length;

            // Retain ALL values and columns without dropping or modifying user data
            const tableHeaders = [...rawHeaders];
            const tableRows: Array<Record<string, any>> = rawRows.map((row) => {
              const obj: Record<string, any> = {};
              rawHeaders.forEach((header, idx) => {
                obj[header] = row[idx] ?? "";
              });
              return obj;
            });

            // Count true missing / empty values across the dataset
            let missingValuesCount = 0;
            for (let r = 0; r < rawRows.length; r++) {
              const row = rawRows[r];
              for (let c = 0; c < rawHeaders.length; c++) {
                const val = row[c];
                if (val === undefined || val === null || String(val).trim() === "" || String(val).toLowerCase() === "null" || String(val).toLowerCase() === "nan") {
                  missingValuesCount++;
                }
              }
            }

            const now = new Date();
            const formattedDate =
              now.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }) +
              `, ` +
              now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

            // Identify numeric vs categorical columns for dynamic charts & KPIs
            const numericColIndices: number[] = [];
            const categoricalColIndices: number[] = [];

            rawHeaders.forEach((_, colIdx) => {
              let numCount = 0;
              let sampleCount = 0;
              const sampleLimit = Math.min(rawRows.length, 100);
              for (let r = 0; r < sampleLimit; r++) {
                const cell = rawRows[r]?.[colIdx];
                if (cell !== undefined && cell !== null && String(cell).trim() !== "") {
                  sampleCount++;
                  const cleaned = String(cell).replace(/[$,%]/g, "").trim();
                  if (!isNaN(Number(cleaned)) && isFinite(Number(cleaned))) {
                    numCount++;
                  }
                }
              }
              if (sampleCount > 0 && numCount / sampleCount >= 0.7) {
                numericColIndices.push(colIdx);
              } else {
                categoricalColIndices.push(colIdx);
              }
            });

            // Pick the best categorical column to group and visualize
            let chartColIdx = categoricalColIndices.length > 0 ? categoricalColIndices[0] : 0;
            const preferredKeywords = ["team", "winner", "category", "product", "city", "status", "country", "type", "region", "state", "brand"];
            for (const kw of preferredKeywords) {
              const found = rawHeaders.findIndex((h) => h.toLowerCase().includes(kw));
              if (found !== -1) {
                chartColIdx = found;
                break;
              }
            }

            const chartColName = rawHeaders[chartColIdx] || "Category";
            const valCounts: Record<string, number> = {};
            rawRows.forEach((row) => {
              const rawVal = row[chartColIdx];
              const val = rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "" ? String(rawVal).trim() : "(Empty)";
              valCounts[val] = (valCounts[val] || 0) + 1;
            });

            const sortedChart = Object.entries(valCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const chartData: DynamicChartItem[] = sortedChart.length > 0
              ? sortedChart.map(([label, count], idx) => ({
                  label: label.length > 18 ? label.substring(0, 15) + "..." : label,
                  value: count,
                  color: CHART_COLORS[idx % CHART_COLORS.length],
                }))
              : [{ label: "Records", value: totalRowsCount, color: CHART_COLORS[0] }];

            const chartTitle = `${chartColName} Distribution`;

            // Detect primary numeric column for KPI calculation (e.g. sales, revenue, runs, points, score, price)
            let primaryNumIdx = -1;
            const numKeywords = ["sales", "revenue", "runs", "amount", "score", "points", "total", "price", "profit", "value"];
            for (const kw of numKeywords) {
              const found = numericColIndices.find((idx) => rawHeaders[idx]?.toLowerCase().includes(kw));
              if (found !== undefined) {
                primaryNumIdx = found;
                break;
              }
            }
            if (primaryNumIdx === -1 && numericColIndices.length > 0) {
              primaryNumIdx = numericColIndices[0];
            }

            let numSum = 0;
            let numValid = 0;
            if (primaryNumIdx !== -1) {
              rawRows.forEach((row) => {
                const cell = row[primaryNumIdx];
                if (cell !== undefined && cell !== null && String(cell).trim() !== "") {
                  const n = Number(String(cell).replace(/[$,%]/g, "").trim());
                  if (!isNaN(n) && isFinite(n)) {
                    numSum += n;
                    numValid++;
                  }
                }
              });
            }

            const primaryNumName = primaryNumIdx !== -1 ? rawHeaders[primaryNumIdx] : null;
            const totalCells = Math.max(1, totalRowsCount * totalColsCount);
            const completenessPct = Math.max(0, Math.min(100, Math.round(((totalCells - missingValuesCount) / totalCells) * 100)));

            const kpis: DynamicKpi[] = [
              {
                id: "k1",
                label: "Total Rows",
                value: totalRowsCount.toLocaleString(),
                trend: "All uploaded rows preserved",
                trendDirection: "up",
                color: "primary",
              },
              {
                id: "k2",
                label: "Total Columns",
                value: `${totalColsCount} Attributes`,
                trend: "All uploaded columns active",
                trendDirection: "up",
                color: "success",
              },
              {
                id: "k3",
                label: primaryNumName ? `Total ${primaryNumName}` : "Missing Values",
                value: primaryNumName
                  ? (numSum > 1000000 ? (numSum / 1000000).toFixed(2) + "M" : Math.round(numSum).toLocaleString())
                  : missingValuesCount.toLocaleString(),
                trend: primaryNumName
                  ? `Avg ${(numSum / Math.max(1, numValid)).toFixed(1)} per row`
                  : (missingValuesCount === 0 ? "100% complete data" : `${missingValuesCount} nulls pending clean`),
                trendDirection: missingValuesCount === 0 ? "up" : "down",
                color: "warning",
              },
              {
                id: "k4",
                label: "Data Quality",
                value: `${completenessPct}%`,
                trend: missingValuesCount === 0 ? "Clean dataset" : `${missingValuesCount} nulls detected (raw)`,
                trendDirection: completenessPct >= 90 ? "up" : "down",
                color: "purple",
              },
            ];

            const newDataset: DatasetInfo = {
              name: file.name,
              totalRows: totalRowsCount.toLocaleString(),
              totalColumns: totalColsCount.toString(),
              missingValues: missingValuesCount.toLocaleString(),
              lastUpdated: formattedDate,
              fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
              status: "active",
              type: fileNameLower.includes("sale") ? "sales" : fileNameLower.includes("ipl") || fileNameLower.includes("match") ? "ipl" : "generic",
              kpis,
              chartTitle,
              chartData,
              tableTitle: `${file.name} - Dataset Records`,
              tableHeaders,
              tableRows,
              rawHeaders,
              rawRows,
            };

            setDataset(newDataset);

            try {
              const storageDataset = {
                ...newDataset,
                tableRows: newDataset.tableRows.slice(0, 1000),
                rawRows: newDataset.rawRows.slice(0, 1000),
              };
              localStorage.setItem("datavista_dataset", JSON.stringify(storageDataset));

              // Record into previous datasets history
              const prevItem = {
                id: "ds_" + Date.now(),
                name: newDataset.name,
                totalRows: newDataset.totalRows,
                totalColumns: newDataset.totalColumns,
                lastUpdated: newDataset.lastUpdated,
                fileSize: newDataset.fileSize,
                status: "active",
                fullData: storageDataset,
              };

              const existingHist = localStorage.getItem("datavista_previous_datasets");
              let hist = existingHist ? JSON.parse(existingHist) : [];
              if (!Array.isArray(hist)) hist = [];
              hist = hist.filter((item: any) => item.name !== newDataset.name);
              hist.unshift(prevItem);
              localStorage.setItem("datavista_previous_datasets", JSON.stringify(hist.slice(0, 3)));
            } catch (storageErr) {
              console.warn("localStorage quota reached, active dataset stored safely in memory:", storageErr);
            }

            setNotification(`Dataset "${file.name}" parsed & uploaded successfully!`);
            setTimeout(() => setNotification(null), 4000);
            resolve();
          } catch (parseError) {
            console.error("Dataset parse error:", parseError);
            setNotification("Dataset uploaded with fallback state.");
            resolve();
          }
        }, 100);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const removeDataset = () => {
    setPreviousDataset(dataset);
    const emptyDataset: DatasetInfo = {
      name: "No dataset loaded",
      totalRows: "-",
      totalColumns: "-",
      missingValues: "-",
      lastUpdated: "-",
      status: "empty",
      type: "empty",
      kpis: [],
      chartTitle: "No Active Dataset",
      chartData: [],
      tableTitle: "No Active Data",
      tableHeaders: [],
      tableRows: [],
      rawHeaders: [],
      rawRows: [],
    };
    setDataset(emptyDataset);
    try {
      localStorage.setItem("datavista_dataset", JSON.stringify(emptyDataset));
    } catch {
      // Ignore storage errors on remove
    }
    setNotification("Dataset removed. Click Undo to restore.");
    setTimeout(() => setNotification(null), 6000);
  };

  const restorePreviousDataset = () => {
    if (previousDataset) {
      setDataset(previousDataset);
      try {
        localStorage.setItem("datavista_dataset", JSON.stringify(previousDataset));
      } catch (e) {
        console.warn("Could not save restored dataset:", e);
      }
      setNotification(`Restored dataset "${previousDataset.name}"`);
      setPreviousDataset(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const updateChartVisual = (title: string, data: DynamicChartItem[]) => {
    setDataset(prev => {
      const updated = { ...prev, chartTitle: title, chartData: data };
      try {
        localStorage.setItem("datavista_dataset", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save updated chart to localStorage:", e);
      }
      return updated;
    });
    setNotification(`Saved chart "${title}" to Dashboard canvas.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const updateTableData = (headers: string[], rows: Array<Record<string, any>>) => {
    setDataset(prev => {
      const rawRows = rows.map(r => headers.map(h => String(r[h] ?? "")));
      let missingCount = 0;
      rows.forEach(r => {
        headers.forEach(h => {
          const val = r[h];
          if (val === undefined || val === null || String(val).trim() === "" || String(val).toLowerCase() === "null" || String(val).toLowerCase() === "nan") {
            missingCount++;
          }
        });
      });
      const updated: DatasetInfo = {
        ...prev,
        totalRows: rows.length.toLocaleString(),
        totalColumns: headers.length.toString(),
        missingValues: missingCount.toLocaleString(),
        tableHeaders: headers,
        tableRows: rows,
        rawHeaders: headers,
        rawRows: rawRows,
      };
      try {
        localStorage.setItem("datavista_dataset", JSON.stringify({
          ...updated,
          tableRows: rows.slice(0, 1000),
          rawRows: rawRows.slice(0, 1000),
        }));
      } catch (e) {
        console.warn("Could not save updated table data to localStorage:", e);
      }
      return updated;
    });
  };

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        uploadDataset,
        switchDatasetPreset,
        loadPreviousDataset,
        removeDataset,
        updateChartVisual,
        updateTableData,
        notification,
        clearNotification,
        restorePreviousDataset,
        canUndoDataset: !!previousDataset
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return context;
}
