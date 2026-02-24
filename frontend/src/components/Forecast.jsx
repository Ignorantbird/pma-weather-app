import { fmtT } from "../utils/temperature";

export default function Forecast({ data, unit = "C" }) {
  if (!data || !data.forecast) return null;

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
        5-Day Forecast
      </p>
      <div className="grid grid-cols-5 gap-3">
        {data.forecast.map((day) => (
          <div
            key={day.date}
            className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 flex flex-col items-center gap-1 hover:shadow-md transition"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
            </p>
            <p className="text-xs text-slate-300">{day.date.slice(5)}</p>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              className="w-12 h-12"
            />
            <p className="text-lg font-bold text-slate-800">{fmtT(Math.round(day.temp), unit)}</p>
            <p className="text-xs text-slate-400 capitalize text-center leading-tight">{day.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
