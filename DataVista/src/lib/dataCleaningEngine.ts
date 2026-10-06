/**
 * DataVista - Professional Data Cleaning & Transformation Engine
 * 
 * Dataset-independent, robust, pure TypeScript transformation engine.
 * Inspired by modern business intelligence engines and Power Query.
 */

export type ColumnDataType = "Integer" | "Decimal" | "Date" | "Boolean" | "Text";

export interface ColumnQualityReport {
  column: string;
  dataType: ColumnDataType;
  totalCount: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: any[];
  suggestedMethods: string[];
}

export interface DuplicateGroupInfo {
  key: string;
  rowIndices: number[];
}

export interface DuplicateAuditResult {
  mode: "all" | "selected";
  selectedCols: string[];
  duplicateGroupsCount: number;
  rowsInDuplicateGroups: number;
  excessDuplicatesCount: number;
  excessRowIndices: Set<number>;
  allGroupRowIndices: Set<number>;
  groups: DuplicateGroupInfo[];
}

export interface DatasetQualityReport {
  totalRows: number;
  totalColumns: number;
  totalCells: number;
  missingCells: number;
  missingPercentage: number;
  rowsWithMissingCount: number;
  rowsWithMissingIndices: Set<number>;
  columnReports: ColumnQualityReport[];
  duplicateReport: DuplicateAuditResult;
  healthScore: number;
}

export interface AppliedStepRecord {
  id: string;
  name: string;
  operationType: string;
  description: string;
  params: Record<string, any>;
  timestamp: string;
  affectedRows: number;
  affectedCells: number;
  headersSnapshot: string[];
  rowsSnapshot: Record<string, any>[];
}

/* ─────────────────────────────────────────────────────────────
   1. CORE VALUE & TYPE HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Determines whether a cell value is legitimately missing / null / empty.
 * Preserves 0 and false as legitimate, non-missing values.
 */
export function isMissingValue(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return true;
    const lower = trimmed.toLowerCase();
    if (lower === "null" || lower === "nan" || lower === "undefined") return true;
  }
  if (typeof val === "number" && isNaN(val)) return true;
  return false;
}

/**
 * Formats a value for display, handling nulls cleanly.
 */
export function formatCellValue(val: any): string {
  if (isMissingValue(val)) return "";
  return String(val);
}

/**
 * Checks if a string represents an Excel serial date (e.g. 45123)
 */
export function isExcelDateSerial(val: any): boolean {
  const n = Number(val);
  return !isNaN(n) && n >= 35000 && n <= 60000;
}

/**
 * Converts an Excel serial date number to YYYY-MM-DD
 */
export function excelSerialToDateString(serial: number): string {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  return dateInfo.toISOString().split("T")[0];
}

/**
 * Infer the semantic data type of a column based on non-missing sample values.
 * Handles preserved identifiers (e.g. strings with leading zeros like "00142").
 */
export function inferColumnDataType(values: any[]): ColumnDataType {
  const nonNull = values.filter(v => !isMissingValue(v));
  if (nonNull.length === 0) return "Text";

  let intCount = 0;
  let decCount = 0;
  let dateCount = 0;
  let boolCount = 0;

  for (const v of nonNull) {
    const s = String(v).trim();

    // Check Boolean
    if (s.toLowerCase() === "true" || s.toLowerCase() === "false") {
      boolCount++;
      continue;
    }

    // Identifiers with leading zeros (e.g. "0123") must be preserved as Text!
    if (/^0\d+$/.test(s)) {
      return "Text";
    }

    // Check Integer
    if (/^-?\d+$/.test(s)) {
      intCount++;
      continue;
    }

    // Check Decimal
    if (/^-?\d+\.\d+$/.test(s)) {
      decCount++;
      continue;
    }

    // Check Date format (YYYY-MM-DD, DD/MM/YYYY, etc.)
    if (!isNaN(Date.parse(s)) && (s.includes("-") || s.includes("/") || s.includes(":"))) {
      dateCount++;
      continue;
    }
  }

  const threshold = nonNull.length * 0.75;
  if (intCount >= threshold) return "Integer";
  if (intCount + decCount >= threshold) return "Decimal";
  if (dateCount >= threshold) return "Date";
  if (boolCount >= threshold) return "Boolean";
  return "Text";
}

/* ─────────────────────────────────────────────────────────────
   2. DATA QUALITY AUDIT & REPORTING
───────────────────────────────────────────────────────────── */

/**
 * Audits duplicate rows across workingRows under a given comparison scope & retention policy.
 */
export function auditDuplicates(
  headers: string[],
  rows: Record<string, any>[],
  selectedCols?: string[],
  policy: "first" | "last" | "all" = "first"
): DuplicateAuditResult {
  const targetCols = (selectedCols && selectedCols.length > 0) ? selectedCols : headers;
  const seenMap = new Map<string, number[]>(); // key -> row indices

  rows.forEach((row, idx) => {
    const key = targetCols.map(c => String(row[c] ?? "")).join("||#||");
    const existing = seenMap.get(key) || [];
    existing.push(idx);
    seenMap.set(key, existing);
  });

  let duplicateGroupsCount = 0;
  let rowsInDuplicateGroups = 0;
  const excessRowIndices = new Set<number>();
  const allGroupRowIndices = new Set<number>();
  const groups: DuplicateGroupInfo[] = [];

  seenMap.forEach((indices, key) => {
    if (indices.length > 1) {
      duplicateGroupsCount++;
      rowsInDuplicateGroups += indices.length;
      indices.forEach(idx => allGroupRowIndices.add(idx));
      groups.push({ key, rowIndices: indices });

      if (policy === "first") {
        // Keep first occurrence (index 0), all subsequent indices are excess
        for (let i = 1; i < indices.length; i++) {
          excessRowIndices.add(indices[i]);
        }
      } else if (policy === "last") {
        // Keep last occurrence, earlier indices are excess
        for (let i = 0; i < indices.length - 1; i++) {
          excessRowIndices.add(indices[i]);
        }
      } else if (policy === "all") {
        // Purge entire group
        indices.forEach(idx => excessRowIndices.add(idx));
      }
    }
  });

  return {
    mode: (selectedCols && selectedCols.length < headers.length) ? "selected" : "all",
    selectedCols: targetCols,
    duplicateGroupsCount,
    rowsInDuplicateGroups,
    excessDuplicatesCount: excessRowIndices.size,
    excessRowIndices,
    allGroupRowIndices,
    groups,
  };
}

/**
 * Computes a comprehensive, dataset-independent data quality overview report.
 */
export function calculateDatasetQuality(
  headers: string[],
  rows: Record<string, any>[]
): DatasetQualityReport {
  const totalRows = rows.length;
  const totalColumns = headers.length;
  const totalCells = totalRows * totalColumns;

  let missingCells = 0;
  const rowsWithMissingIndices = new Set<number>();

  const colNullCounts: Record<string, number> = {};
  const colUniqueSets: Record<string, Set<string>> = {};
  const colSamples: Record<string, any[]> = {};

  headers.forEach(h => {
    colNullCounts[h] = 0;
    colUniqueSets[h] = new Set<string>();
    colSamples[h] = [];
  });

  rows.forEach((row, rowIdx) => {
    let rowHasMissing = false;
    headers.forEach(h => {
      const val = row[h];
      if (isMissingValue(val)) {
        missingCells++;
        colNullCounts[h]++;
        rowHasMissing = true;
      } else {
        const strVal = String(val);
        colUniqueSets[h].add(strVal);
        if (colSamples[h].length < 5 && !colSamples[h].includes(strVal)) {
          colSamples[h].push(strVal);
        }
      }
    });
    if (rowHasMissing) {
      rowsWithMissingIndices.add(rowIdx);
    }
  });

  const columnReports: ColumnQualityReport[] = headers.map(h => {
    const colValues = rows.map(r => r[h]);
    const dType = inferColumnDataType(colValues);
    const mCount = colNullCounts[h];
    const mPct = totalRows > 0 ? Number(((mCount / totalRows) * 100).toFixed(1)) : 0;
    const uCount = colUniqueSets[h].size;

    const suggestedMethods: string[] = [];
    if (mCount > 0) {
      if (dType === "Integer" || dType === "Decimal") {
        suggestedMethods.push("Median Imputation", "Mean Imputation", "Remove Missing Rows");
      } else if (dType === "Date") {
        suggestedMethods.push("Forward Fill", "Backward Fill", "Mode Date");
      } else {
        suggestedMethods.push("Mode Imputation", "Custom Label", "Remove Missing Rows");
      }
    }

    return {
      column: h,
      dataType: dType,
      totalCount: totalRows,
      missingCount: mCount,
      missingPercentage: mPct,
      uniqueCount: uCount,
      sampleValues: colSamples[h],
      suggestedMethods,
    };
  });

  const duplicateReport = auditDuplicates(headers, rows);

  // Health Score Calculation (100 base)
  let healthScore = 100;
  if (totalCells > 0) {
    const missingRatio = missingCells / totalCells;
    healthScore -= Math.min(40, Math.round(missingRatio * 100 * 1.5));
  }
  if (totalRows > 0) {
    const dupeRatio = duplicateReport.excessDuplicatesCount / totalRows;
    healthScore -= Math.min(30, Math.round(dupeRatio * 100 * 2));
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  const missingPercentage = totalCells > 0 ? Number(((missingCells / totalCells) * 100).toFixed(2)) : 0;

  return {
    totalRows,
    totalColumns,
    totalCells,
    missingCells,
    missingPercentage,
    rowsWithMissingCount: rowsWithMissingIndices.size,
    rowsWithMissingIndices,
    columnReports,
    duplicateReport,
    healthScore,
  };
}

/* ─────────────────────────────────────────────────────────────
   3. STATISTICAL UTILITIES
───────────────────────────────────────────────────────────── */

export function calculateMean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function calculateMedian(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function calculateMode(items: any[]): any {
  if (items.length === 0) return "";
  const freq: Record<string, number> = {};
  let maxCount = 0;
  let modeVal = items[0];

  for (const item of items) {
    const key = String(item);
    freq[key] = (freq[key] || 0) + 1;
    if (freq[key] > maxCount) {
      maxCount = freq[key];
      modeVal = item;
    }
  }
  return modeVal;
}

/* ─────────────────────────────────────────────────────────────
   4. TRANSFORMATION OPERATIONS (PURE FUNCTIONS)
───────────────────────────────────────────────────────────── */

/**
 * Remove duplicate rows under user-selected comparison scope and retention policy.
 */
export function executeRemoveDuplicates(
  headers: string[],
  rows: Record<string, any>[],
  selectedCols?: string[],
  policy: "first" | "last" | "all" = "first"
): { newRows: Record<string, any>[]; removedCount: number } {
  const audit = auditDuplicates(headers, rows, selectedCols, policy);
  const newRows = rows.filter((_, idx) => !audit.excessRowIndices.has(idx));
  return {
    newRows,
    removedCount: audit.excessDuplicatesCount,
  };
}

/**
 * Remove missing values by row strategy or column strategy.
 */
export function executeRemoveMissing(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    mode: "rows-any" | "rows-all" | "threshold" | "cols";
    selectedCols: string[];
    thresholdPercent?: number; // e.g. 50%
  }
): {
  newHeaders: string[];
  newRows: Record<string, any>[];
  affectedRows: number;
  affectedCols: number;
} {
  const { mode, selectedCols, thresholdPercent = 50 } = options;
  const targetCols = selectedCols.length > 0 ? selectedCols : headers;

  if (mode === "rows-any") {
    const initialCount = rows.length;
    const newRows = rows.filter(row => {
      return !targetCols.some(col => isMissingValue(row[col]));
    });
    return {
      newHeaders: headers,
      newRows,
      affectedRows: initialCount - newRows.length,
      affectedCols: 0,
    };
  }

  if (mode === "rows-all") {
    const initialCount = rows.length;
    const newRows = rows.filter(row => {
      // Keep row if at least one selected column has a non-missing value
      return !targetCols.every(col => isMissingValue(row[col]));
    });
    return {
      newHeaders: headers,
      newRows,
      affectedRows: initialCount - newRows.length,
      affectedCols: 0,
    };
  }

  if (mode === "threshold") {
    const initialCount = rows.length;
    const thresholdFraction = thresholdPercent / 100;
    const newRows = rows.filter(row => {
      let missingInRow = 0;
      targetCols.forEach(col => {
        if (isMissingValue(row[col])) missingInRow++;
      });
      const rowMissingFraction = targetCols.length > 0 ? missingInRow / targetCols.length : 0;
      return rowMissingFraction <= thresholdFraction;
    });
    return {
      newHeaders: headers,
      newRows,
      affectedRows: initialCount - newRows.length,
      affectedCols: 0,
    };
  }

  if (mode === "cols") {
    const colsToRemove = new Set(
      targetCols.filter(col => rows.some(r => isMissingValue(r[col])))
    );
    const newHeaders = headers.filter(h => !colsToRemove.has(h));
    const newRows = rows.map(row => {
      const r = { ...row };
      colsToRemove.forEach(c => delete r[c]);
      return r;
    });
    return {
      newHeaders,
      newRows,
      affectedRows: 0,
      affectedCols: colsToRemove.size,
    };
  }

  return { newHeaders: headers, newRows: rows, affectedRows: 0, affectedCols: 0 };
}

/**
 * Fill missing values with comprehensive imputation methods.
 */
export function executeFillMissing(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    column: string;
    method: "mean" | "median" | "mode" | "custom" | "ffill" | "bfill" | "group";
    customValue?: string;
    groupColumn?: string;
    groupMethod?: "mean" | "median" | "mode";
  }
): {
  newRows: Record<string, any>[];
  affectedCells: number;
  highlightedCells: Record<string, boolean>;
  filledValueSummary: string;
} {
  const { column, method, customValue = "", groupColumn, groupMethod = "mean" } = options;
  const highlightedCells: Record<string, boolean> = {};
  let affectedCells = 0;
  let filledValueSummary = "";

  // Collect non-missing values
  const nonNullValues = rows
    .map(r => r[column])
    .filter(v => !isMissingValue(v));

  const numericValues = nonNullValues
    .map(v => parseFloat(String(v)))
    .filter(n => !isNaN(n));

  // Determine standard single fill value if applicable
  let singleFillValue: any = null;
  if (method === "mean") {
    if (numericValues.length > 0) {
      const m = calculateMean(numericValues);
      singleFillValue = Number.isInteger(m) ? m : parseFloat(m.toFixed(2));
      filledValueSummary = `Mean (${singleFillValue})`;
    } else {
      singleFillValue = "0";
      filledValueSummary = "0 (no valid numbers)";
    }
  } else if (method === "median") {
    if (numericValues.length > 0) {
      const med = calculateMedian(numericValues);
      singleFillValue = Number.isInteger(med) ? med : parseFloat(med.toFixed(2));
      filledValueSummary = `Median (${singleFillValue})`;
    } else {
      singleFillValue = "0";
      filledValueSummary = "0 (no valid numbers)";
    }
  } else if (method === "mode") {
    singleFillValue = calculateMode(nonNullValues);
    filledValueSummary = `Mode (${singleFillValue})`;
  } else if (method === "custom") {
    singleFillValue = customValue;
    filledValueSummary = `Custom (${customValue})`;
  }

  let newRows: Record<string, any>[] = [];

  if (method === "ffill") {
    // Forward Fill: carry previous non-missing value down
    let lastValid: any = null;
    newRows = rows.map((row, i) => {
      const val = row[column];
      if (!isMissingValue(val)) {
        lastValid = val;
        return { ...row };
      }
      if (lastValid !== null) {
        highlightedCells[`${i}-${column}`] = true;
        affectedCells++;
        return { ...row, [column]: lastValid };
      }
      return { ...row };
    });
    filledValueSummary = "Forward Fill (carried down)";
  } else if (method === "bfill") {
    // Backward Fill: carry next non-missing value up
    newRows = [...rows].map(r => ({ ...r }));
    let nextValid: any = null;
    for (let i = newRows.length - 1; i >= 0; i--) {
      const val = newRows[i][column];
      if (!isMissingValue(val)) {
        nextValid = val;
      } else if (nextValid !== null) {
        highlightedCells[`${i}-${column}`] = true;
        affectedCells++;
        newRows[i][column] = nextValid;
      }
    }
    filledValueSummary = "Backward Fill (carried up)";
  } else if (method === "group" && groupColumn) {
    // Group-based Imputation: calculate fill value per group
    const groupValuesMap = new Map<string, any[]>();
    rows.forEach(r => {
      const gKey = String(r[groupColumn] ?? "");
      const val = r[column];
      if (!isMissingValue(val)) {
        const arr = groupValuesMap.get(gKey) || [];
        arr.push(val);
        groupValuesMap.set(gKey, arr);
      }
    });

    const groupFillMap = new Map<string, any>();
    groupValuesMap.forEach((vals, gKey) => {
      if (groupMethod === "mean") {
        const nums = vals.map(v => parseFloat(String(v))).filter(n => !isNaN(n));
        groupFillMap.set(gKey, nums.length > 0 ? parseFloat(calculateMean(nums).toFixed(2)) : 0);
      } else if (groupMethod === "median") {
        const nums = vals.map(v => parseFloat(String(v))).filter(n => !isNaN(n));
        groupFillMap.set(gKey, nums.length > 0 ? parseFloat(calculateMedian(nums).toFixed(2)) : 0);
      } else {
        groupFillMap.set(gKey, calculateMode(vals));
      }
    });

    // Fallback overall fill value
    const overallFallback = numericValues.length > 0 ? calculateMedian(numericValues) : calculateMode(nonNullValues);

    newRows = rows.map((row, i) => {
      if (isMissingValue(row[column])) {
        const gKey = String(row[groupColumn] ?? "");
        const fillVal = groupFillMap.has(gKey) ? groupFillMap.get(gKey) : overallFallback;
        highlightedCells[`${i}-${column}`] = true;
        affectedCells++;
        return { ...row, [column]: fillVal };
      }
      return { ...row };
    });
    filledValueSummary = `Group Imputation by ${groupColumn} (${groupMethod})`;
  } else {
    // Standard Single Fill (mean, median, mode, custom)
    newRows = rows.map((row, i) => {
      if (isMissingValue(row[column])) {
        highlightedCells[`${i}-${column}`] = true;
        affectedCells++;
        return { ...row, [column]: singleFillValue };
      }
      return { ...row };
    });
  }

  return {
    newRows,
    affectedCells,
    highlightedCells,
    filledValueSummary,
  };
}

/**
 * Filter rows using configurable conditions.
 */
export function executeFilterRows(
  headers: string[],
  rows: Record<string, any>[],
  condition: {
    column: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "not_contains"
      | "starts_with"
      | "ends_with"
      | "greater_than"
      | "less_than"
      | "greater_or_equal"
      | "less_or_equal"
      | "between"
      | "is_null"
      | "is_not_null";
    value: string;
    value2?: string;
    action: "keep" | "remove";
  }
): { newRows: Record<string, any>[]; affectedRows: number } {
  const { column, operator, value, value2 = "", action } = condition;
  const numVal = parseFloat(value);
  const numVal2 = parseFloat(value2);
  const isNumeric = !isNaN(numVal);

  const isMatch = (row: Record<string, any>): boolean => {
    const raw = row[column];
    const isNull = isMissingValue(raw);

    if (operator === "is_null") return isNull;
    if (operator === "is_not_null") return !isNull;

    if (isNull) return false;

    const str = String(raw).toLowerCase();
    const query = value.toLowerCase();

    switch (operator) {
      case "equals":
        if (isNumeric) {
          const n = parseFloat(str);
          return !isNaN(n) && n === numVal;
        }
        return str === query;
      case "not_equals":
        if (isNumeric) {
          const n = parseFloat(str);
          return isNaN(n) || n !== numVal;
        }
        return str !== query;
      case "contains":
        return str.includes(query);
      case "not_contains":
        return !str.includes(query);
      case "starts_with":
        return str.startsWith(query);
      case "ends_with":
        return str.endsWith(query);
      case "greater_than": {
        const n = parseFloat(str);
        return !isNaN(n) && n > numVal;
      }
      case "less_than": {
        const n = parseFloat(str);
        return !isNaN(n) && n < numVal;
      }
      case "greater_or_equal": {
        const n = parseFloat(str);
        return !isNaN(n) && n >= numVal;
      }
      case "less_or_equal": {
        const n = parseFloat(str);
        return !isNaN(n) && n <= numVal;
      }
      case "between": {
        const n = parseFloat(str);
        return !isNaN(n) && !isNaN(numVal2) && n >= numVal && n <= numVal2;
      }
      default:
        return false;
    }
  };

  const initialCount = rows.length;
  const newRows = rows.filter(row => {
    const matched = isMatch(row);
    return action === "keep" ? matched : !matched;
  });

  return {
    newRows,
    affectedRows: initialCount - newRows.length,
  };
}

/**
 * Sort rows by single or multiple columns.
 */
export function executeSortRows(
  headers: string[],
  rows: Record<string, any>[],
  sortLevels: Array<{ column: string; direction: "asc" | "desc" }>
): Record<string, any>[] {
  return [...rows].sort((a, b) => {
    for (const { column, direction } of sortLevels) {
      const valA = a[column];
      const valB = b[column];

      const isNullA = isMissingValue(valA);
      const isNullB = isMissingValue(valB);

      // Place nulls at the end
      if (isNullA && !isNullB) return 1;
      if (!isNullA && isNullB) return -1;
      if (isNullA && isNullB) continue;

      const numA = parseFloat(String(valA));
      const numB = parseFloat(String(valB));

      let cmp = 0;
      if (!isNaN(numA) && !isNaN(numB)) {
        cmp = numA - numB;
      } else {
        cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      }

      if (cmp !== 0) {
        return direction === "asc" ? cmp : -cmp;
      }
    }
    return 0;
  });
}

/**
 * Detect outliers using IQR or Z-Score with customizable actions.
 */
export function executeDetectOutliers(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    column: string;
    method: "iqr" | "zscore";
    action: "remove" | "keep" | "replace-mean" | "replace-median";
  }
): {
  newRows: Record<string, any>[];
  outlierIndices: number[];
  highlightedCells: Record<string, boolean>;
  affectedRows: number;
} {
  const { column, method, action } = options;
  const numRows = rows
    .map((r, i) => ({ val: parseFloat(String(r[column] ?? "")), i }))
    .filter(r => !isNaN(r.val));

  const vals = numRows.map(r => r.val);
  let outlierIndices: number[] = [];

  if (vals.length >= 4) {
    if (method === "iqr") {
      const s = [...vals].sort((a, b) => a - b);
      const q1 = s[Math.floor(s.length * 0.25)];
      const q3 = s[Math.floor(s.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      outlierIndices = numRows
        .filter(r => r.val < lowerBound || r.val > upperBound)
        .map(r => r.i);
    } else {
      const m = calculateMean(vals);
      const variance = vals.reduce((sum, v) => sum + (v - m) ** 2, 0) / vals.length;
      const std = Math.sqrt(variance);
      outlierIndices = numRows
        .filter(r => Math.abs(r.val - m) > 3 * std)
        .map(r => r.i);
    }
  }

  const outlierSet = new Set(outlierIndices);
  const highlightedCells: Record<string, boolean> = {};

  if (action === "remove") {
    const newRows = rows.filter((_, i) => !outlierSet.has(i));
    return {
      newRows,
      outlierIndices,
      highlightedCells,
      affectedRows: rows.length - newRows.length,
    };
  }

  if (action === "replace-mean" || action === "replace-median") {
    const replacementVal =
      action === "replace-mean"
        ? calculateMean(vals).toFixed(2)
        : calculateMedian(vals).toFixed(2);

    const newRows = rows.map((row, i) => {
      if (outlierSet.has(i)) {
        highlightedCells[`${i}-${column}`] = true;
        return { ...row, [column]: replacementVal };
      }
      return { ...row };
    });

    return {
      newRows,
      outlierIndices,
      highlightedCells,
      affectedRows: outlierIndices.length,
    };
  }

  // "keep" -> highlight only
  outlierIndices.forEach(i => {
    highlightedCells[`${i}-${column}`] = true;
  });

  return {
    newRows: rows,
    outlierIndices,
    highlightedCells,
    affectedRows: outlierIndices.length,
  };
}

/**
 * Rename column header identifier safely without collisions.
 */
export function executeRenameColumn(
  headers: string[],
  rows: Record<string, any>[],
  oldName: string,
  newName: string
): { newHeaders: string[]; newRows: Record<string, any>[] } {
  const trimmedNew = newName.trim();
  if (!trimmedNew || trimmedNew === oldName || headers.includes(trimmedNew)) {
    return { newHeaders: headers, newRows: rows };
  }

  const newHeaders = headers.map(h => (h === oldName ? trimmedNew : h));
  const newRows = rows.map(row => {
    const r = { ...row };
    if (oldName in r) {
      r[trimmedNew] = r[oldName];
      delete r[oldName];
    }
    return r;
  });

  return { newHeaders, newRows };
}

/**
 * Convert column elements to target format safely.
 */
export function executeChangeDataType(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    column: string;
    targetType: "Text" | "Integer" | "Decimal" | "Boolean" | "Date" | "DateTime" | "Currency" | "Percentage";
    onError: "null" | "preserve";
  }
): {
  newRows: Record<string, any>[];
  affectedCount: number;
  highlightedCells: Record<string, boolean>;
} {
  const { column, targetType, onError } = options;
  const highlightedCells: Record<string, boolean> = {};
  let affectedCount = 0;

  const convert = (val: any): { result: any; isError: boolean } => {
    if (isMissingValue(val)) return { result: "", isError: false };
    const s = String(val).trim();

    if (targetType === "Text") {
      return { result: s, isError: false };
    }
    if (targetType === "Integer") {
      const n = parseInt(s, 10);
      return isNaN(n) ? { result: onError === "null" ? "" : val, isError: true } : { result: n, isError: false };
    }
    if (targetType === "Decimal") {
      const n = parseFloat(s);
      return isNaN(n) ? { result: onError === "null" ? "" : val, isError: true } : { result: n, isError: false };
    }
    if (targetType === "Boolean") {
      const lower = s.toLowerCase();
      if (lower === "true" || lower === "1" || lower === "yes") return { result: true, isError: false };
      if (lower === "false" || lower === "0" || lower === "no") return { result: false, isError: false };
      return { result: onError === "null" ? "" : val, isError: true };
    }
    if (targetType === "Currency") {
      const n = parseFloat(s.replace(/[$€£,]/g, ""));
      return isNaN(n) ? { result: onError === "null" ? "" : val, isError: true } : { result: `$${n.toFixed(2)}`, isError: false };
    }
    if (targetType === "Percentage") {
      const n = parseFloat(s.replace(/%/g, ""));
      return isNaN(n) ? { result: onError === "null" ? "" : val, isError: true } : { result: `${n}%`, isError: false };
    }
    if (targetType === "Date") {
      if (isExcelDateSerial(s)) {
        return { result: excelSerialToDateString(Number(s)), isError: false };
      }
      const d = new Date(s);
      return isNaN(d.getTime()) ? { result: onError === "null" ? "" : val, isError: true } : { result: d.toISOString().split("T")[0], isError: false };
    }
    if (targetType === "DateTime") {
      const d = new Date(s);
      return isNaN(d.getTime()) ? { result: onError === "null" ? "" : val, isError: true } : { result: d.toLocaleString(), isError: false };
    }
    return { result: s, isError: false };
  };

  const newRows = rows.map((row, i) => {
    const { result, isError } = convert(row[column]);
    if (isError) {
      highlightedCells[`${i}-${column}`] = true;
    }
    if (result !== row[column]) affectedCount++;
    return { ...row, [column]: result };
  });

  return { newRows, affectedCount, highlightedCells };
}

/**
 * Split column into multiple fields by delimiter or fixed position.
 */
export function executeSplitColumn(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    column: string;
    splitBy: "space" | "comma" | "dash" | "custom" | "fixed";
    customDelimiter?: string;
    fixedLen?: number;
    keepOriginal?: boolean;
  }
): { newHeaders: string[]; newRows: Record<string, any>[] } {
  const { column, splitBy, customDelimiter = "", fixedLen = 5, keepOriginal = false } = options;
  const delim =
    splitBy === "space" ? " " :
    splitBy === "comma" ? "," :
    splitBy === "dash" ? "-" :
    splitBy === "custom" ? customDelimiter : "";

  // Determine maximum split parts across rows
  let maxParts = 2;
  rows.slice(0, 100).forEach(row => {
    const val = String(row[column] ?? "");
    let parts: string[];
    if (splitBy === "fixed") {
      parts = [];
      for (let i = 0; i < val.length; i += fixedLen) {
        parts.push(val.slice(i, i + fixedLen));
      }
    } else {
      parts = val.split(delim);
    }
    if (parts.length > maxParts) maxParts = Math.min(parts.length, 10);
  });

  const newCols: string[] = [];
  for (let i = 1; i <= maxParts; i++) {
    newCols.push(`${column}_${i}`);
  }

  const colIdx = headers.indexOf(column);
  const newHeaders = [...headers];
  if (!keepOriginal && colIdx !== -1) {
    newHeaders.splice(colIdx, 1, ...newCols);
  } else {
    newHeaders.push(...newCols);
  }

  const newRows = rows.map(row => {
    const r = { ...row };
    const val = String(r[column] ?? "");
    let parts: string[] = [];
    if (splitBy === "fixed") {
      for (let i = 0; i < val.length; i += fixedLen) {
        parts.push(val.slice(i, i + fixedLen));
      }
    } else {
      parts = val.split(delim);
    }

    if (!keepOriginal) delete r[column];
    newCols.forEach((c, idx) => {
      r[c] = parts[idx] ?? "";
    });
    return r;
  });

  return { newHeaders, newRows };
}

/**
 * Merge two or more columns with customizable separator.
 */
export function executeMergeColumns(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    columns: string[];
    separator: string;
    outputName: string;
    purgeOriginal: boolean;
  }
): { newHeaders: string[]; newRows: Record<string, any>[] } {
  const { columns, separator, outputName, purgeOriginal } = options;
  if (columns.length < 2) return { newHeaders: headers, newRows: rows };

  const targetName = outputName.trim() || columns.join("_");
  const newHeaders = headers.filter(h => !purgeOriginal || !columns.includes(h) || h === targetName);
  if (!newHeaders.includes(targetName)) {
    newHeaders.push(targetName);
  }

  const newRows = rows.map(row => {
    const r = { ...row };
    r[targetName] = columns.map(c => String(r[c] ?? "")).join(separator);
    if (purgeOriginal) {
      columns.forEach(c => {
        if (c !== targetName) delete r[c];
      });
    }
    return r;
  });

  return { newHeaders, newRows };
}

/**
 * Delete specified columns permanently.
 */
export function executeRemoveColumns(
  headers: string[],
  rows: Record<string, any>[],
  columnsToRemove: string[]
): { newHeaders: string[]; newRows: Record<string, any>[] } {
  const toRemoveSet = new Set(columnsToRemove);
  const newHeaders = headers.filter(h => !toRemoveSet.has(h));
  const newRows = rows.map(row => {
    const r = { ...row };
    columnsToRemove.forEach(c => delete r[c]);
    return r;
  });

  return { newHeaders, newRows };
}

/**
 * Find and replace specific patterns across columns.
 */
export function executeFindAndReplace(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    find: string;
    replace: string;
    columns: string[];
    matchCase: boolean;
    replaceAll: boolean;
  }
): {
  newRows: Record<string, any>[];
  matchCount: number;
  highlightedCells: Record<string, boolean>;
} {
  const { find, replace, columns, matchCase, replaceAll } = options;
  if (!find) return { newRows: rows, matchCount: 0, highlightedCells: {} };

  const targetCols = columns.length > 0 ? columns : headers;
  const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, (matchCase ? "" : "i") + (replaceAll ? "g" : ""));

  let matchCount = 0;
  const highlightedCells: Record<string, boolean> = {};

  const newRows = rows.map((row, rowIdx) => {
    const r = { ...row };
    targetCols.forEach(col => {
      const val = String(r[col] ?? "");
      const check = matchCase ? val : val.toLowerCase();
      const findCheck = matchCase ? find : find.toLowerCase();
      if (check.includes(findCheck)) {
        highlightedCells[`${rowIdx}-${col}`] = true;
        const countInCell = val.split(regex).length - 1;
        matchCount += Math.max(1, countInCell);
        r[col] = val.replace(regex, replace);
      }
    });
    return r;
  });

  return { newRows, matchCount, highlightedCells };
}

/**
 * Text Transformation: Trim whitespace and standardize case.
 */
export function executeTrimAndCase(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    columns: string[];
    trimMode: "both" | "extra-spaces" | "none";
    caseMode: "upper" | "lower" | "title" | "sentence" | "none";
  }
): { newRows: Record<string, any>[]; affectedCount: number } {
  const { columns, trimMode, caseMode } = options;
  const targetCols = columns.length > 0 ? columns : headers;
  let affectedCount = 0;

  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

  const toSentenceCase = (str: string) =>
    str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();

  const newRows = rows.map(row => {
    const r = { ...row };
    targetCols.forEach(col => {
      let val = r[col];
      if (typeof val === "string") {
        const orig = val;
        if (trimMode === "both") val = val.trim();
        if (trimMode === "extra-spaces") val = val.replace(/\s+/g, " ").trim();

        if (caseMode === "upper") val = val.toUpperCase();
        if (caseMode === "lower") val = val.toLowerCase();
        if (caseMode === "title") val = toTitleCase(val);
        if (caseMode === "sentence") val = toSentenceCase(val);

        if (val !== orig) affectedCount++;
        r[col] = val;
      }
    });
    return r;
  });

  return { newRows, affectedCount };
}

/**
 * Convert Date Formats across rows.
 */
export function executeConvertDates(
  headers: string[],
  rows: Record<string, any>[],
  options: {
    column: string;
    targetFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  }
): { newRows: Record<string, any>[]; convertedCount: number } {
  const { column, targetFormat } = options;
  let convertedCount = 0;

  const formatDate = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    if (targetFormat === "DD/MM/YYYY") return `${dd}/${mm}/${yyyy}`;
    if (targetFormat === "MM/DD/YYYY") return `${mm}/${dd}/${yyyy}`;
    return `${yyyy}-${mm}-${dd}`;
  };

  const newRows = rows.map(row => {
    const r = { ...row };
    const val = r[column];
    if (isMissingValue(val)) return r;

    let parsedDate: Date | null = null;
    if (isExcelDateSerial(val)) {
      parsedDate = new Date((Number(val) - 25569) * 86400 * 1000);
    } else {
      const d = new Date(String(val));
      if (!isNaN(d.getTime())) parsedDate = d;
    }

    if (parsedDate) {
      r[column] = formatDate(parsedDate);
      convertedCount++;
    }
    return r;
  });

  return { newRows, convertedCount };
}

/**
 * Remove 100% empty rows and 100% empty columns.
 */
export function executeRemoveEmptyRowsAndCols(
  headers: string[],
  rows: Record<string, any>[]
): {
  newHeaders: string[];
  newRows: Record<string, any>[];
  removedRowsCount: number;
  removedColsCount: number;
} {
  // Purge rows where every single cell is null or empty
  const initialRowsCount = rows.length;
  const newRowsFiltered = rows.filter(row => {
    return headers.some(h => !isMissingValue(row[h]));
  });

  // Purge columns where every single row is null or empty
  const emptyCols = new Set(
    headers.filter(h => newRowsFiltered.every(row => isMissingValue(row[h])))
  );

  const newHeaders = headers.filter(h => !emptyCols.has(h));
  const newRows = newRowsFiltered.map(row => {
    const r = { ...row };
    emptyCols.forEach(c => delete r[c]);
    return r;
  });

  return {
    newHeaders,
    newRows,
    removedRowsCount: initialRowsCount - newRows.length,
    removedColsCount: emptyCols.size,
  };
}

/* ─────────────────────────────────────────────────────────────
   5. REPRODUCIBLE TRANSFORMATION RECIPE PIPELINE
───────────────────────────────────────────────────────────── */

/**
 * Replays a pipeline of applied steps from the original upload snapshot.
 * Safe, fault-tolerant execution; returns error details if a step fails.
 */
export function replayPipeline(
  baseHeaders: string[],
  baseRows: Record<string, any>[],
  steps: AppliedStepRecord[]
): {
  success: boolean;
  currentHeaders: string[];
  currentRows: Record<string, any>[];
  failedStepIndex?: number;
  errorMessage?: string;
} {
  let headers = [...baseHeaders];
  let rows = baseRows.map(r => ({ ...r }));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    try {
      switch (step.operationType) {
        case "remove-duplicates": {
          const res = executeRemoveDuplicates(headers, rows, step.params.selectedCols, step.params.policy);
          rows = res.newRows;
          break;
        }
        case "remove-nulls": {
          const res = executeRemoveMissing(headers, rows, step.params as any);
          headers = res.newHeaders;
          rows = res.newRows;
          break;
        }
        case "fill-missing": {
          const res = executeFillMissing(headers, rows, step.params as any);
          rows = res.newRows;
          break;
        }
        case "filter": {
          const res = executeFilterRows(headers, rows, step.params as any);
          rows = res.newRows;
          break;
        }
        case "sort": {
          rows = executeSortRows(headers, rows, step.params.sortLevels || []);
          break;
        }
        case "rename": {
          const res = executeRenameColumn(headers, rows, step.params.oldName, step.params.newName);
          headers = res.newHeaders;
          rows = res.newRows;
          break;
        }
        case "change-type": {
          const res = executeChangeDataType(headers, rows, step.params as any);
          rows = res.newRows;
          break;
        }
        case "split": {
          const res = executeSplitColumn(headers, rows, step.params as any);
          headers = res.newHeaders;
          rows = res.newRows;
          break;
        }
        case "merge": {
          const res = executeMergeColumns(headers, rows, step.params as any);
          headers = res.newHeaders;
          rows = res.newRows;
          break;
        }
        case "remove-columns": {
          const res = executeRemoveColumns(headers, rows, step.params.columnsToRemove || []);
          headers = res.newHeaders;
          rows = res.newRows;
          break;
        }
        case "find-replace": {
          const res = executeFindAndReplace(headers, rows, step.params as any);
          rows = res.newRows;
          break;
        }
        case "trim-case": {
          const res = executeTrimAndCase(headers, rows, step.params as any);
          rows = res.newRows;
          break;
        }
        case "convert-dates": {
          const res = executeConvertDates(headers, rows, step.params as any);
          rows = res.newRows;
          break;
        }
        case "outliers": {
          const res = executeDetectOutliers(headers, rows, step.params as any);
          rows = res.newRows;
          break;
        }
        case "remove-empty": {
          const res = executeRemoveEmptyRowsAndCols(headers, rows);
          headers = res.newHeaders;
          rows = res.newRows;
          break;
        }
        default:
          break;
      }
    } catch (err: any) {
      return {
        success: false,
        currentHeaders: headers,
        currentRows: rows,
        failedStepIndex: i,
        errorMessage: `Step "${step.name}" could not be replayed: ${err?.message || "Unknown error"}`,
      };
    }
  }

  return {
    success: true,
    currentHeaders: headers,
    currentRows: rows,
  };
}
