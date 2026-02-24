import { exportData } from "../api/weatherApi";
import toast from "react-hot-toast";

async function parseBlobError(err) {
  try {
    const text = await err.response.data.text();
    const json = JSON.parse(text);
    return json.detail || "Export failed";
  } catch {
    return "Export failed";
  }
}

const FORMATS = [
  { key: "json", label: "Export JSON", color: "bg-emerald-600 hover:bg-emerald-700" },
  { key: "csv",  label: "Export CSV",  color: "bg-amber-500 hover:bg-amber-600" },
  { key: "pdf",  label: "Export PDF",  color: "bg-rose-600 hover:bg-rose-700" },
];

export default function ExportButtons() {
  const handleExport = async (format) => {
    try {
      const res = await exportData(format);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weather_records.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        toast.error("No saved records to export yet.");
      } else if (status === 404) {
        toast.error("Export endpoint not found — please restart the backend.");
      } else {
        const msg = await parseBlobError(err);
        toast.error(msg);
      }
    }
  };

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
        Export Records
      </p>
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
        <p className="text-sm text-slate-500 mb-4">
          Download your full search history as a structured file.
        </p>
        <div className="flex flex-wrap gap-3">
          {FORMATS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => handleExport(key)}
              className={`px-5 py-2.5 ${color} text-white text-sm font-semibold rounded-xl shadow-sm transition active:scale-95`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
