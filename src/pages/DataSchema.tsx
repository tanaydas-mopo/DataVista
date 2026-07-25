import { useRef } from "react";
import { UploadCloud, FileType, Database, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { useDataset } from "../context/DatasetContext";

const mockSchema = [
  { column: "match_id", type: "Integer", nulls: "0%", sample: "335982" },
  { column: "season", type: "String", nulls: "0%", sample: "2007/08" },
  { column: "date", type: "Date", nulls: "0%", sample: "2008-04-18" },
  { column: "team1", type: "String", nulls: "0%", sample: "RCB" },
  { column: "team2", type: "String", nulls: "0%", sample: "KKR" },
  { column: "toss_winner", type: "String", nulls: "0%", sample: "RCB" },
  { column: "toss_decision", type: "String", nulls: "0%", sample: "field" },
  { column: "result", type: "String", nulls: "0%", sample: "normal" },
  { column: "dl_applied", type: "Integer", nulls: "0%", sample: "0" },
  { column: "winner", type: "String", nulls: "0%", sample: "KKR" },
  { column: "win_by_runs", type: "Integer", nulls: "0%", sample: "140" },
];

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
          <p className="text-sm text-textSecondary">Connect your data sources and manage dataset schemas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Upload Section */}
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
                  <p className="text-sm font-semibold text-textPrimary">Click to upload or drag and drop</p>
                  <p className="text-xs text-textSecondary mt-1">CSV, Excel, or JSON (max. 100MB)</p>
                </div>
                <button className="mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors">
                  Select File
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-6 bg-success-soft/30 flex flex-col items-center justify-center gap-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-success-DEFAULT mb-2" />
                <div>
                  <p className="text-sm font-bold text-textPrimary">{dataset.name}</p>
                  <p className="text-xs text-textSecondary mt-1">{dataset.totalRows} rows • {dataset.totalColumns} columns</p>
                </div>
                <button 
                  className="mt-2 text-xs font-medium text-danger-DEFAULT hover:underline"
                  onClick={removeDataset}
                >
                  Remove file
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schema Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileType className="w-5 h-5 text-primary" />
              Schema Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isUploaded ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-textSecondary">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-tl-lg">Column Name</th>
                      <th className="px-4 py-3 font-medium">Data Type</th>
                      <th className="px-4 py-3 font-medium">Null %</th>
                      <th className="px-4 py-3 font-medium rounded-tr-lg">Sample Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockSchema.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-textPrimary">{row.column}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-textSecondary">{row.nulls}</td>
                        <td className="px-4 py-3 text-textSecondary truncate max-w-[200px]">{row.sample}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                <Database className="w-12 h-12 opacity-20" />
                <p className="text-sm">Upload a dataset to view its schema.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
