import { useEffect, useState } from "react";
import { getCurrentWeather, getYoutubeVideos } from "../api/weatherApi";
import MapEmbed from "./MapEmbed";
import YoutubeVideos from "./YoutubeVideos";
import { fmtT } from "../utils/temperature";

//helper to check if a date is furuture
function isFutureDate(dateStr) {
  const today = new Date().toISOString().split("T")[0];
  return dateStr > today;
}

export default function RecordDetail({ record, onClose, unit = "C" }) {
  //state variable for weather
  const [liveData, setLiveData]     = useState(null);
  const [videos, setVideos]         = useState([]);
  const [loadingLive, setLoadingLive] = useState(true);

  const future = record ? isFutureDate(record.query_date) : false;

  useEffect(() => {
    if (!record) return;

    getCurrentWeather(record.location)
      .then((r) => setLiveData(r.data))
      .catch(() => {})
      .finally(() => setLoadingLive(false));

    if (!isFutureDate(record.query_date)) {
      getYoutubeVideos(record.location).then((r) => setVideos(r.data)).catch(() => {});
    }
  }, [record]);

  if (!record) return null;

  return (
    //modal backdrop
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="print-content bg-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl my-8 overflow-hidden ring-1 ring-black/10">

        {/* Header */}
        <div className="relative bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 text-white px-7 py-6 flex justify-between items-start overflow-hidden">
          <svg viewBox="0 0 320 160" fill="currentColor" aria-hidden="true"
            className="absolute -bottom-4 -right-8 w-56 text-white/8 pointer-events-none">
            <ellipse cx="160" cy="135" rx="140" ry="32" />
            <ellipse cx="90"  cy="108" rx="66"  ry="60" />
            <ellipse cx="168" cy="82"  rx="82"  ry="74" />
            <ellipse cx="242" cy="112" rx="60"  ry="52" />
          </svg>
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
              {future ? "Forecast" : "Saved Record"}
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight">{record.location}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-blue-200 text-sm">{record.query_date}</p>
              {future && (
                <span className="bg-yellow-400/20 text-yellow-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-yellow-400/30">
                  Future forecast
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 print-hide">
            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/10 transition border border-white/10"
              aria-label="Print this record"
            >
              Print
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl leading-none font-light transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">

          {/* Weather card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-blue-600 capitalize text-lg font-semibold">{record.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {future
                      ? "Forecasted temperature · Live conditions shown below"
                      : "Saved temperature · Live conditions shown below"}
                  </p>
                </div>
                {liveData?.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${liveData.icon}@2x.png`}
                    alt={record.description}
                    className="w-16 h-16"
                  />
                )}
              </div>

              {loadingLive ? (
                <div className="flex items-center justify-center py-6">
                  <p className="text-sm text-slate-400">Loading weather details...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Temperature", value: fmtT(record.temperature, unit) },
                    { label: "Feels Like",  value: liveData ? fmtT(liveData.feels_like, unit) : null },
                    { label: "Humidity",    value: liveData ? `${liveData.humidity}%` : null },
                    { label: "Wind",        value: liveData ? `${liveData.wind_speed} m/s` : null },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
                      <p className="text-xl font-bold text-slate-800 mt-0.5">{s.value ?? "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <MapEmbed location={record.location} />

          {/* YouTube */}
          {future ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 text-center print-hide">
              <p className="text-sm text-slate-400">
                YouTube travel videos are only shown for past or present dates.
              </p>
            </div>
          ) : (
            videos.length > 0 && <YoutubeVideos videos={videos} />
          )}

        </div>
      </div>
    </div>
  );
}
