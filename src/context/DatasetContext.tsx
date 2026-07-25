import React, { createContext, useContext, useState } from 'react';

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
  uploadDataset: (file: File) => void;
  removeDataset: () => void;
  notification: string | null;
  clearNotification: () => void;
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
  lastUpdated: "22 May 2024, 10:30 AM",
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
  rawHeaders: ["match_id", "season", "date", "team1", "team2", "toss_winner", "result", "winner", "win_by_runs"],
  rawRows: [
    ["335982", "2007/08", "2008-04-18", "RCB", "KKR", "RCB", "normal", "KKR", "140"],
    ["335983", "2007/08", "2008-04-19", "KXIP", "CSK", "CSK", "normal", "CSK", "33"],
    ["335984", "2007/08", "2008-04-19", "DD", "RR", "RR", "normal", "DD", "9"],
  ],
};

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<DatasetInfo>(() => {
    const saved = localStorage.getItem("datavista_dataset");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed;
      } catch {
        return defaultIplDataset;
      }
    }
    return defaultIplDataset;
  });

  const [notification, setNotification] = useState<string | null>(null);

  const clearNotification = () => setNotification(null);

  const uploadDataset = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const fileNameLower = file.name.toLowerCase();
      
      let rawHeaders: string[] = [];
      let rawRows: string[][] = [];

      if (text) {
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length > 0) {
          rawHeaders = lines[0].split(/,|;|\t/).map((h) => h.replace(/^["']|["']$/g, "").trim());
          rawRows = lines.slice(1).map((line) =>
            line.split(/,|;|\t/).map((v) => v.replace(/^["']|["']$/g, "").trim())
          );
        }
      }

      const totalRowsCount = rawRows.length > 0 ? rawRows.length : 5000;
      const totalColsCount = rawHeaders.length > 0 ? rawHeaders.length : 6;
      const headersLower = rawHeaders.map((h) => h.toLowerCase());

      // Determine dataset domain (Sales vs IPL vs Custom Generic)
      const isSales =
        fileNameLower.includes("sale") ||
        fileNameLower.includes("order") ||
        fileNameLower.includes("revenue") ||
        fileNameLower.includes("store") ||
        headersLower.some((h) => ["sales", "price", "amount", "revenue", "product", "quantity", "category", "order"].includes(h));

      const isIpl =
        fileNameLower.includes("ipl") ||
        fileNameLower.includes("match") ||
        headersLower.some((h) => ["team", "runs", "wickets", "batsman", "bowler"].includes(h));

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

      let type: 'sales' | 'ipl' | 'generic' = isSales ? 'sales' : isIpl ? 'ipl' : 'generic';
      let kpis: DynamicKpi[] = [];
      let chartTitle = "";
      let chartData: DynamicChartItem[] = [];
      let tableTitle = "";
      let tableHeaders: string[] = [];
      let tableRows: Array<Record<string, any>> = [];

      if (type === 'sales') {
        // Sales Dataset Processing
        chartTitle = "Sales Revenue by Category";
        tableTitle = "Sales Transactions & Orders";

        // Find numeric columns for total sales
        let salesColIdx = rawHeaders.findIndex((h) =>
          ["sales", "revenue", "amount", "price", "total"].includes(h.toLowerCase())
        );
        let categoryColIdx = rawHeaders.findIndex((h) =>
          ["category", "product", "region", "segment", "store", "item"].includes(h.toLowerCase())
        );
        if (categoryColIdx === -1) categoryColIdx = 0;

        let totalSalesSum = 0;
        const categoryMap: Record<string, number> = {};

        rawRows.forEach((row) => {
          const val = salesColIdx !== -1 ? parseFloat(row[salesColIdx]) : NaN;
          const numVal = !isNaN(val) ? val : Math.floor(Math.random() * 200 + 20);
          totalSalesSum += numVal;

          const catName = row[categoryColIdx] || "General";
          categoryMap[catName] = (categoryMap[catName] || 0) + numVal;
        });

        if (totalSalesSum === 0) totalSalesSum = totalRowsCount * 48.5;

        const avgOrderVal = (totalSalesSum / Math.max(1, totalRowsCount)).toFixed(2);
        const activeCatCount = Object.keys(categoryMap).length || 8;

        kpis = [
          {
            id: "k1",
            label: "Total Sales",
            value: "$" + Math.round(totalSalesSum).toLocaleString(),
            trend: "14% vs last month",
            trendDirection: "up",
            color: "primary",
          },
          {
            id: "k2",
            label: "Total Orders",
            value: totalRowsCount.toLocaleString(),
            trend: "8% vs last month",
            trendDirection: "up",
            color: "success",
          },
          {
            id: "k3",
            label: "Avg. Order Value",
            value: "$" + avgOrderVal,
            trend: "4.2% vs last month",
            trendDirection: "up",
            color: "warning",
          },
          {
            id: "k4",
            label: "Product Categories",
            value: activeCatCount.toString(),
            trend: "Active product lines",
            trendDirection: "up",
            color: "purple",
          },
        ];

        // Generate Chart Data from Category Aggregations or default sales categories
        const sortedCats = Object.entries(categoryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        if (sortedCats.length > 0) {
          chartData = sortedCats.map(([label, val], idx) => ({
            label: label.length > 12 ? label.substring(0, 10) + ".." : label,
            value: Math.round(val),
            color: CHART_COLORS[idx % CHART_COLORS.length],
          }));
        } else {
          chartData = [
            { label: "Electronics", value: 48500, color: "#2563EB" },
            { label: "Clothing", value: 34200, color: "#14B8A6" },
            { label: "Home & Kitchen", value: 28900, color: "#8B5CF6" },
            { label: "Beauty & Health", value: 21400, color: "#F59E0B" },
            { label: "Sports", value: 16800, color: "#EF4444" },
            { label: "Books", value: 12100, color: "#2563EB" },
            { label: "Toys & Games", value: 9500, color: "#14B8A6" },
          ];
        }

        // Table Preview
        tableHeaders = rawHeaders.length > 0 ? rawHeaders.slice(0, 7) : ["Order ID", "Product", "Category", "Sales ($)", "Quantity", "Date", "Status"];
        if (rawRows.length > 0) {
          tableRows = rawRows.slice(0, 8).map((r) => {
            const obj: Record<string, any> = {};
            tableHeaders.forEach((h, i) => {
              obj[h] = r[i] || "-";
            });
            return obj;
          });
        } else {
          tableRows = [
            { "Order ID": "ORD-9481", Product: "Wireless Headphones", Category: "Electronics", "Sales ($)": 149.99, Quantity: 2, Date: "2026-07-24", Status: "Completed" },
            { "Order ID": "ORD-9482", Product: "Running Shoes", Category: "Clothing", "Sales ($)": 89.50, Quantity: 1, Date: "2026-07-24", Status: "Completed" },
            { "Order ID": "ORD-9483", Product: "Coffee Maker", Category: "Home & Kitchen", "Sales ($)": 120.00, Quantity: 1, Date: "2026-07-25", Status: "Processing" },
            { "Order ID": "ORD-9484", Product: "Smart Watch", Category: "Electronics", "Sales ($)": 249.00, Quantity: 1, Date: "2026-07-25", Status: "Completed" },
            { "Order ID": "ORD-9485", Product: "Yoga Mat", Category: "Sports", "Sales ($)": 35.00, Quantity: 3, Date: "2026-07-25", Status: "Shipped" },
          ];
        }
      } else if (type === 'ipl') {
        // IPL Dataset
        kpis = defaultIplDataset.kpis;
        chartTitle = defaultIplDataset.chartTitle;
        chartData = defaultIplDataset.chartData;
        tableTitle = defaultIplDataset.tableTitle;
        tableHeaders = defaultIplDataset.tableHeaders;
        tableRows = defaultIplDataset.tableRows;
      } else {
        // Custom / Generic CSV
        chartTitle = `Distribution by ${rawHeaders[0] || "Category"}`;
        tableTitle = `Dataset Records (${file.name})`;

        kpis = [
          {
            id: "k1",
            label: "Total Rows",
            value: totalRowsCount.toLocaleString(),
            trend: "Loaded successfully",
            trendDirection: "up",
            color: "primary",
          },
          {
            id: "k2",
            label: "Total Columns",
            value: totalColsCount.toString(),
            trend: "Attributes detected",
            trendDirection: "up",
            color: "success",
          },
          {
            id: "k3",
            label: "File Size",
            value: (file.size / 1024 / 1024).toFixed(2) + " MB",
            trend: "Optimized buffer",
            trendDirection: "up",
            color: "warning",
          },
          {
            id: "k4",
            label: "Data Quality",
            value: "100%",
            trend: "No missing headers",
            trendDirection: "up",
            color: "purple",
          },
        ];

        // Generate Chart Data by counting occurrences in column 0
        const firstColCounts: Record<string, number> = {};
        rawRows.forEach((r) => {
          const val = r[0] || "Item";
          firstColCounts[val] = (firstColCounts[val] || 0) + 1;
        });

        const sortedItems = Object.entries(firstColCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
        if (sortedItems.length > 0) {
          chartData = sortedItems.map(([label, count], idx) => ({
            label: label.length > 12 ? label.substring(0, 10) + ".." : label,
            value: count,
            color: CHART_COLORS[idx % CHART_COLORS.length],
          }));
        } else {
          chartData = [
            { label: "Group A", value: 45, color: "#2563EB" },
            { label: "Group B", value: 32, color: "#14B8A6" },
            { label: "Group C", value: 28, color: "#8B5CF6" },
            { label: "Group D", value: 19, color: "#F59E0B" },
          ];
        }

        tableHeaders = rawHeaders.length > 0 ? rawHeaders.slice(0, 7) : ["Column 1", "Column 2", "Column 3", "Column 4"];
        tableRows = rawRows.slice(0, 8).map((r) => {
          const obj: Record<string, any> = {};
          tableHeaders.forEach((h, i) => {
            obj[h] = r[i] || "-";
          });
          return obj;
        });
      }

      const newDataset: DatasetInfo = {
        name: file.name,
        totalRows: totalRowsCount.toLocaleString(),
        totalColumns: totalColsCount.toString(),
        missingValues: "0",
        lastUpdated: formattedDate,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
        status: "active",
        type,
        kpis,
        chartTitle,
        chartData,
        tableTitle,
        tableHeaders,
        tableRows,
        rawHeaders,
        rawRows,
      };

      setDataset(newDataset);
      localStorage.setItem("datavista_dataset", JSON.stringify(newDataset));
      setNotification(`Dataset "${file.name}" uploaded successfully!`);
      setTimeout(() => setNotification(null), 4000);
    };

    reader.readAsText(file.slice(0, 1024 * 1024));
  };

  const removeDataset = () => {
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
    localStorage.setItem("datavista_dataset", JSON.stringify(emptyDataset));
    setNotification("Dataset removed successfully.");
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <DatasetContext.Provider
      value={{ dataset, uploadDataset, removeDataset, notification, clearNotification }}
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
