import { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    if (startDate && endDate && endDate < startDate) {
      alert("End date must be on or after start date.");
      return;
    }
    onSearch(location.trim(), startDate || null, endDate || null);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords.latitude + "," + pos.coords.longitude;
        onSearch(coords, startDate || null, endDate || null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          alert("Location access was denied. Please allow location permission in your browser settings and try again.");
        } else {
          alert("Unable to retrieve your location. Please try again.");
        }
      },
      { timeout: 10000 }
    );
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3 w-full ring-1 ring-black/5"
    >
      {/* ── Location row ── */}
      <div className="flex gap-2">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city, zip code, PIN code, or coordinates..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 text-slate-800 placeholder-slate-400 text-sm font-medium transition"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 shrink-0 text-sm transition shadow-sm"
        >
          {loading ? "Searching..." : "Search"}
        </button>
        <button
          type="button"
          onClick={handleGPS}
          disabled={loading}
          className="px-5 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 active:bg-slate-900 disabled:opacity-50 shrink-0 text-sm transition shadow-sm"
        >
          Use GPS
        </button>
      </div>

      {/* ── Date range row ── */}
      <div className="flex flex-col sm:flex-row items-center gap-2 px-1">
        <span className="text-xs text-slate-400 font-medium shrink-0">
          Date range
          <span className="ml-1 text-slate-300">(optional)</span>:
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            if (!e.target.value) setEndDate("");
          }}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-slate-700 bg-slate-50 transition"
        />
        <span className="text-slate-300 text-sm shrink-0 font-light">to</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          disabled={!startDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-slate-700 bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        />
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={clearDates}
            className="text-xs text-slate-400 hover:text-rose-500 shrink-0 font-medium transition"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}
