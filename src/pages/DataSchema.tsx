import { useRef } from "react";
import { UploadCloud, FileType, Database, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";

function inferDataType(value: any): string {
  if (value === undefined || value === null || value === "" || value === "-") return "String";
  const str = String(value).trim();
  if (/^-?\d+$/.test(str)) return "Integer";
  if (/^-?\d+\.\d+$/.test(str)) return "Decimal";
  if (!isNaN(Date.parse(str)) && (str.includes("-") || str.includes("/") || str.includes(":"))) return "Date";
  if (str.toLowerCase() === "true" || str.toLowerCase() === "false") return "Boolean";
  return "String";
}

export function DataSchema() {
  const { dataset, uploadDataset, removeDataset } = useDataset();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploaded = dataset.status === "active";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadDataset(e.target.files[0]);
      e.target.value = "";
    }
  };

  // Derive dynamic schema rows from active dataset headers and raw rows
  const headers =
    dataset.rawHeaders && dataset.rawHeaders.length > 0
      ? dataset.rawHeaders
      : dataset.tableHeaders && dataset.tableHeaders.length > 0
      ? dataset.tableHeaders
      : [];

  const rawRows = dataset.rawRows || [];

  const schemaRows = headers.map((colName, colIdx) => {
    // Find sample data from first non-empty row
    let sampleVal = "-";
    let nullCount = 0;

    if (rawRows.length > 0) {
      for (let r = 0; r < rawRows.length; r++) {
        const val = rawRows[r]?.[colIdx];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          if (sampleVal === "-") sampleVal = String(val).trim();
        } else {
          nullCount++;
        }
      }
    } else if (dataset.tableRows && dataset.tableRows.length > 0) {
      const val = dataset.tableRows[0][colName];
      if (val !== undefined && val !== null) sampleVal = String(val);
    }

    const dataType = inferDataType(sampleVal);
    const nullPercentage =
      rawRows.length > 0
        ? Math.round((nullCount / rawRows.length) * 100) + "%"
        : "0%";

    return {
      column: colName,
      type: dataType,
      nulls: nullPercentage,
      sample: sampleVal,
    };
  });

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls,.tsv,.json"
        className="hidden"
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Data & Schema</h1>
          <p className="text-sm text-textSecondary">
            Connect your data sources and manage dataset schemas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Upload / Data Source Section */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isUploaded ? (
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer hover:bg-slate-50 transition-colors hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center mb-2">
                  <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-textPrimary">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-textSecondary mt-1">
                    CSV, Excel (.xlsx), or JSON (max. 100MB)
                  </p>
                </div>
                <button className="mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
                  Select File
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-6 bg-emerald-50/40 flex flex-col items-center justify-center gap-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-1" />
                <div>
                  <p className="text-sm font-bold text-textPrimary">{dataset.name}</p>
                  <p className="text-xs text-textSecondary mt-1">
                    {dataset.totalRows} rows • {dataset.totalColumns} columns
                  </p>
                </div>
                <button
                  className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                  onClick={removeDataset}
                >
                  Remove file
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schema Preview Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileType className="w-5 h-5 text-primary" />
              Schema Preview {isUploaded && `(${schemaRows.length} attributes)`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUploaded && schemaRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-textSecondary">
                    <tr>
                      <th className="px-4 py-3 font-semibold rounded-tl-lg">
                        Column Name
                      </th>
                      <th className="px-4 py-3 font-semibold">Data Type</th>
                      <th className="px-4 py-3 font-semibold">Null %</th>
                      <th className="px-4 py-3 font-semibold rounded-tr-lg">
                        Sample Data
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schemaRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-textPrimary">
                          {row.column}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                              row.type === "Integer" || row.type === "Decimal"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : row.type === "Date"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-textSecondary font-medium">
                          {row.nulls}
                        </td>
                        <td className="px-4 py-3 text-textSecondary font-mono text-xs truncate max-w-[220px]">
                          {row.sample}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                <Database className="w-12 h-12 opacity-20" />
                <p className="text-sm font-semibold text-slate-600">
                  No Active Dataset Schema
                </p>
                <p className="text-xs text-slate-400 max-w-xs text-center">
                  Upload a dataset file to inspect column data types, null rates, and live sample values.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
