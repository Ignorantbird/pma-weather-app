import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SearchBar from "../components/SearchBar";
import CurrentWeather from "../components/CurrentWeather";
import Forecast from "../components/Forecast";
import MapEmbed from "../components/MapEmbed";
import YoutubeVideos from "../components/YoutubeVideos";
import WeatherRecords from "../components/WeatherRecords";
import ExportButtons from "../components/ExportButtons";
import RecordDetail from "../components/RecordDetail";
import WeatherDecorations from "../components/WeatherDecorations";
import {
  getCurrentWeather,
  getForecast,
  getYoutubeVideos,
  getMapsKey,
  createRecord,
} from "../api/weatherApi";
import { fmtT } from "../utils/temperature";

//Theme map keyed on OWM icon prefix
const THEME_MAP = {
  "01": {
    type: "sunny",
    overlay: "linear-gradient(160deg, rgba(251,146,60,0.72) 0%, rgba(234,88,12,0.55) 40%, rgba(15,23,42,0.5) 100%)",
    card:    "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
    contentBg: "#fefce8",
  },
  "02": {
    type: "cloudy",
    overlay: "linear-gradient(160deg, rgba(99,102,241,0.68) 0%, rgba(30,58,138,0.65) 50%, rgba(15,23,42,0.6) 100%)",
    card:    "linear-gradient(135deg, #4f46e5 0%, #3730a3 50%, #1e1b4b 100%)",
    contentBg: "#f8fafc",
  },
  "03": {
    type: "cloudy",
    overlay: "linear-gradient(160deg, rgba(71,85,105,0.72) 0%, rgba(30,41,59,0.70) 50%, rgba(15,23,42,0.65) 100%)",
    card:    "linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)",
    contentBg: "#f8fafc",
  },
  "04": {
    type: "cloudy",
    overlay: "linear-gradient(160deg, rgba(51,65,85,0.75) 0%, rgba(30,41,59,0.72) 50%, rgba(15,23,42,0.68) 100%)",
    card:    "linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)",
    contentBg: "#f1f5f9",
  },
  "09": {
    type: "drizzle",
    overlay: "linear-gradient(160deg, rgba(37,99,235,0.68) 0%, rgba(29,78,216,0.65) 40%, rgba(15,23,42,0.62) 100%)",
    card:    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)",
    contentBg: "#f0f9ff",
  },
  "10": {
    type: "rainy",
    overlay: "linear-gradient(160deg, rgba(29,78,216,0.72) 0%, rgba(15,23,42,0.72) 50%, rgba(7,9,25,0.70) 100%)",
    card:    "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 50%, #172554 100%)",
    contentBg: "#eff6ff",
  },
  "11": {
    type: "stormy",
    overlay: "linear-gradient(160deg, rgba(109,40,217,0.75) 0%, rgba(15,23,42,0.80) 50%, rgba(3,7,18,0.78) 100%)",
    card:    "linear-gradient(135deg, #6d28d9 0%, #4c1d95 50%, #2e1065 100%)",
    contentBg: "#faf5ff",
  },
  "13": {
    type: "snowy",
    overlay: "linear-gradient(160deg, rgba(148,163,184,0.65) 0%, rgba(100,116,139,0.62) 40%, rgba(15,23,42,0.58) 100%)",
    card:    "linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #334155 100%)",
    contentBg: "#f0f9ff",
  },
  "50": {
    type: "foggy",
    overlay: "linear-gradient(160deg, rgba(100,116,139,0.70) 0%, rgba(71,85,105,0.68) 40%, rgba(15,23,42,0.65) 100%)",
    card:    "linear-gradient(135deg, #64748b 0%, #475569 50%, #1e293b 100%)",
    contentBg: "#f8fafc",
  },
};

const DEFAULT_THEME = {
  type: "default",
  overlay: "linear-gradient(160deg, rgba(15,23,42,0.70) 0%, rgba(30,58,138,0.68) 50%, rgba(49,46,129,0.65) 100%)",
  card:    "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)",
  contentBg: "#f1f5f9",
};


//helper functions
function getTheme(icon) {
  if (!icon) return DEFAULT_THEME;
  return THEME_MAP[icon.slice(0, 2)] ?? DEFAULT_THEME;
}

function buildSatelliteUrl(lat, lon, mapsKey) {
  if (!lat || !lon || !mapsKey) return null;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=13&size=1600x700&maptype=satellite&key=${mapsKey}`;
}

//Sun / Moon SVG icons
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" width="15" height="15" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      {[0,45,90,135,180,225,270,315].map((deg) => {
        const r = Math.PI * deg / 180;
        return <line key={deg} x1={12 + Math.cos(r)*6} y1={12 + Math.sin(r)*6}
          x2={12 + Math.cos(r)*9} y2={12 + Math.sin(r)*9} />;
      })}
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// Inline date range results panel
function DateRangeForecast({ record, onDayClick, unit }) {
  if (!record) return null;
  const sorted = [...(record.daily_data || [])].sort((a, b) =>
    a.date > b.date ? 1 : -1
  );

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden w-full ring-1 ring-black/5">
      <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white">
        <p className="font-bold text-xl tracking-tight">{record.location}</p>
        <p className="text-blue-100 text-sm mt-0.5">
          {record.start_date === record.end_date
            ? record.start_date
            : `${record.start_date} to ${record.end_date}`}
          <span className="ml-2 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {sorted.length} day{sorted.length !== 1 ? "s" : ""}
          </span>
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {sorted.map((day) => (
          <button
            key={day.date}
            onClick={() => onDayClick({
              id: record.id, location: record.location,
              query_date: day.date, temperature: day.temperature,
              description: day.description, lat: record.lat, lon: record.lon,
            })}
            className="w-full px-6 py-3.5 flex justify-between items-center hover:bg-slate-50 transition text-left group"
          >
            <div>
              <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-800">{day.date}</p>
              <p className="text-sm text-slate-600 mt-0.5">
                {fmtT(day.temperature, unit)} &mdash; {day.description}
              </p>
            </div>
            <span className="text-xs text-slate-400 group-hover:text-blue-500 shrink-0 ml-4 font-medium">
              View details &rarr;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

//Main page state variables and handlers
export default function Home() {
  const [loading, setLoading]               = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [searchKey, setSearchKey]           = useState(0);
  const [mapsKey, setMapsKey]               = useState("");

  const [weather, setWeather]               = useState(null);
  const [forecast, setForecast]             = useState(null);
  const [videos, setVideos]                 = useState(null);
  const [mapLocation, setMapLocation]       = useState("");
  const [dateRangeRecord, setDateRangeRecord] = useState(null);
  const [heroWeather, setHeroWeather]       = useState(null);

  const [unit, setUnit]     = useState(() => localStorage.getItem("pma-unit") || "C");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("pma-theme") === "dark");

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("pma-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleUnit = () => {
    const next = unit === "C" ? "F" : "C";
    setUnit(next);
    localStorage.setItem("pma-unit", next);
  };

  // Maps key on mount
  useEffect(() => {
    getMapsKey().then((r) => setMapsKey(r.data.key ?? "")).catch(() => { /* map key unavailable */ });
  }, []);

  // Silent geolocation to theme hero before any search
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        getCurrentWeather(coords).then((r) => setHeroWeather(r.data)).catch(() => { /* silent */ });
      },
      () => { /* geolocation denied — stay on default theme */ },
      { timeout: 8000 }
    );
  }, []);

  //theme calculations
  const theme      = getTheme(weather?.icon ?? heroWeather?.icon);
  const heroLat    = weather?.lat ?? dateRangeRecord?.lat ?? heroWeather?.lat;
  const heroLon    = weather?.lon ?? dateRangeRecord?.lon ?? heroWeather?.lon;
  const satelliteUrl = buildSatelliteUrl(heroLat, heroLon, mapsKey);

  // Content area bg changes with weather condition (light mode only)
  const contentBg  = isDark ? "#0f172a" : (theme.contentBg ?? "#f1f5f9");

  const resetResults = () => {
    setWeather(null); setForecast(null);
    setVideos(null);  setMapLocation(""); setDateRangeRecord(null);
  };

  const handleClear = () => { resetResults(); setSearchKey((k) => k + 1); };

  // Main search handler
  const handleSearch = async (location, startDate, endDate) => {
    setLoading(true);
    resetResults();
    const today = new Date().toISOString().split("T")[0];

    if (startDate && endDate) {
      try {
        const res = await createRecord({ location, start_date: startDate, end_date: endDate });
        const record = res.data;
        setDateRangeRecord(record);
        setMapLocation(record.location || location);
        setHistoryRefresh((k) => k + 1);
        try { const v = await getYoutubeVideos(record.location || location); setVideos(v.data); } catch {}
      } catch (err) {
        const detail = err.response?.data?.detail;
        const msg = Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : detail || "Search failed.";
        toast.error(msg);
      }
    } else {
      try {
        const [w, f, v] = await Promise.all([
          getCurrentWeather(location), getForecast(location), getYoutubeVideos(location),
        ]);
        setWeather(w.data); setForecast(f.data); setVideos(v.data); setMapLocation(w.data.location);
        try { await createRecord({ location, start_date: today, end_date: today }); setHistoryRefresh((k) => k + 1); } catch {}
      } catch (err) {
        toast.error(err.response?.data?.detail || "Location not found or API error");
      }
    }
    setLoading(false);
  };

  const isDateRange = !!dateRangeRecord;
  const isLocation  = !!weather;
  const hasResults  = isLocation || isDateRange;



  return (
    <div className="min-h-screen w-full transition-colors duration-500" style={{ backgroundColor: contentBg }}>
      <Toaster position="top-right"
        toastOptions={{ style: { fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", borderRadius: "12px" } }} />

      {selectedRecord && (
        <RecordDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} unit={unit} />
      )}

      {/* Hero */}
      <header
        className="relative w-full text-white overflow-hidden transition-all duration-700 no-print"
        style={{
          backgroundImage: satelliteUrl ? `${theme.overlay}, url("${satelliteUrl}")` : theme.overlay,
          backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#0f172a",
        }}
      >
        <WeatherDecorations theme={theme.type} />

        {/* Controls strip (top-right) */}
        <div className="relative z-10 flex justify-end gap-2 px-5 pt-4">
          {/* °C / °F toggle */}
          <button
            onClick={toggleUnit}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full transition backdrop-blur-sm"
            title="Switch temperature unit"
          >
            <span>{unit === "C" ? "°C" : "°F"}</span>
            <span className="text-white/50">|</span>
            <span className="text-white/60">{unit === "C" ? "°F" : "°C"}</span>
          </button>
          {/* Light / Dark toggle */}
          <button
            onClick={() => setIsDark((d) => !d)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition backdrop-blur-sm"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            <span>{isDark ? "Light" : "Dark"}</span>
          </button>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 flex flex-col items-center gap-8">
          {/* Branding */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-200 mb-5 tracking-widest uppercase">
              PMA Technical Assessment
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">PMA Weather App</h1>
            <p className="mt-3 text-blue-300 text-sm font-medium">Built by Sarmistha Debnath</p>
            <p className="mt-2 text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
              Product Manager Accelerator is designed to support PM professionals through every stage
              of their careers, from entry-level jobs to Director looking to take on a leadership role.
              Our program has helped hundreds of students fulfill their career aspirations.
            </p>
          </div>

          <div className="w-full">
            <SearchBar key={searchKey} onSearch={handleSearch} loading={loading} />
          </div>

          {hasResults && (
            <button onClick={handleClear}
              className="text-slate-400 hover:text-white text-sm font-medium transition -mt-4">
              Clear results
            </button>
          )}
        </div>
      </header>

      {/*Content*/}
      <main className="w-full max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">

        {isLocation && (
          <>
            <CurrentWeather data={weather} themeStyle={theme.card} unit={unit} />
            <Forecast data={forecast} unit={unit} />
          </>
        )}

        {isDateRange && (
          <DateRangeForecast record={dateRangeRecord} onDayClick={setSelectedRecord} unit={unit} />
        )}

        {mapLocation && <MapEmbed location={mapLocation} mapsKey={mapsKey} />}
        {videos && videos.length > 0 && <YoutubeVideos videos={videos} />}

        <WeatherRecords refreshKey={historyRefresh} onDayClick={setSelectedRecord} unit={unit} />

        <ExportButtons />
      </main>

      <footer className="w-full text-center text-xs text-slate-400 py-8 border-t border-slate-200 no-print">
        Built by <span className="font-semibold text-slate-500">Sarmistha Debnath</span>
        &nbsp;&middot;&nbsp; PMA Technical Assessment &nbsp;&middot;&nbsp; Data from OpenWeatherMap
      </footer>
    </div>
  );
}
