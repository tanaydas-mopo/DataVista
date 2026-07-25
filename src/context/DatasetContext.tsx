import React, { createContext, useContext, useState } from 'react';

export interface DatasetInfo {
  name: string;
  totalRows: string;
  totalColumns: string;
  missingValues: string;
  lastUpdated: string;
  fileSize?: string;
  status: 'active' | 'empty';
}

interface DatasetContextType {
  dataset: DatasetInfo;
  uploadDataset: (file: File) => void;
  removeDataset: () => void;
  notification: string | null;
  clearNotification: () => void;
}

const defaultDataset: DatasetInfo = {
  name: "IPL Matches 2024.csv",
  totalRows: "15,600",
  totalColumns: "15",
  missingValues: "0",
  lastUpdated: "22 May 2024, 10:30 AM",
  status: "active",
};

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<DatasetInfo>(() => {
    const saved = localStorage.getItem("datavista_dataset");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultDataset;
      }
    }
    return defaultDataset;
  });

  const [notification, setNotification] = useState<string | null>(null);

  const clearNotification = () => setNotification(null);

  const uploadDataset = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      let rowCount = "1";
      let colCount = "1";

      if (text) {
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          rowCount = (lines.length - 1 > 0 ? lines.length - 1 : lines.length).toLocaleString();
          const firstLine = lines[0];
          const cols = firstLine.split(/,|;|\t/);
          colCount = cols.length.toString();
        }
      }

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + `, ` + now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newDataset: DatasetInfo = {
        name: file.name,
        totalRows: rowCount,
        totalColumns: colCount,
        missingValues: "0",
        lastUpdated: formattedDate,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
        status: "active",
      };

      setDataset(newDataset);
      localStorage.setItem("datavista_dataset", JSON.stringify(newDataset));
      setNotification(`Dataset "${file.name}" uploaded successfully!`);
      setTimeout(() => setNotification(null), 4000);
    };

    reader.readAsText(file.slice(0, 1024 * 1024)); // Read first 1MB for preview analysis
  };

  const removeDataset = () => {
    const emptyDataset: DatasetInfo = {
      name: "No dataset loaded",
      totalRows: "-",
      totalColumns: "-",
      missingValues: "-",
      lastUpdated: "-",
      status: "empty",
    };
    setDataset(emptyDataset);
    localStorage.setItem("datavista_dataset", JSON.stringify(emptyDataset));
    setNotification("Dataset removed successfully.");
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <DatasetContext.Provider value={{ dataset, uploadDataset, removeDataset, notification, clearNotification }}>
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
