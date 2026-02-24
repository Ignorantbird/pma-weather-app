import { toF, fmtT } from "../utils/temperature";

export default function CurrentWeather({ data, themeStyle, unit = "C" }) {
  if (!data) return null;

  const stats = [
    { label: "Feels Like", value: fmtT(data.feels_like, unit) },
    { label: "Humidity",   value: `${data.humidity}%` },
    { label: "Wind Speed", value: `${data.wind_speed} m/s` },
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/10">
      {/* Gradient header */}
      <div
        className="relative text-white px-7 py-7 overflow-hidden"
        style={{ background: themeStyle ?? "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #4f46e5 100%)" }}
      >
        {/* Decorative background clouds */}
        <svg viewBox="0 0 320 160" fill="currentColor" aria-hidden="true"
          className="absolute -bottom-6 -right-10 w-64 text-white/10 pointer-events-none">
          <ellipse cx="160" cy="135" rx="140" ry="32" />
          <ellipse cx="90"  cy="108" rx="66"  ry="60" />
          <ellipse cx="168" cy="82"  rx="82"  ry="74" />
          <ellipse cx="242" cy="112" rx="60"  ry="52" />
        </svg>
        <svg viewBox="0 0 200 100" fill="currentColor" aria-hidden="true"
          className="absolute -top-4 -left-8 w-40 text-white/5 pointer-events-none">
          <ellipse cx="100" cy="84" rx="86" ry="20" />
          <ellipse cx="58"  cy="68" rx="42" ry="38" />
          <ellipse cx="108" cy="52" rx="52" ry="46" />
          <ellipse cx="152" cy="70" rx="38" ry="32" />
        </svg>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-1">
              Current Weather
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">{data.location}</h2>
            <p className="text-blue-200 capitalize text-sm mt-1 font-medium">{data.description}</p>
          </div>
          {data.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
              alt={data.description}
              className="w-20 h-20 drop-shadow-lg -mt-1"
            />
          )}
        </div>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-8xl font-thin leading-none">
            {unit === "F" ? toF(data.temperature) : Math.round(data.temperature)}
          </span>
          <span className="text-4xl font-light mb-2">{unit === "F" ? "°F" : "°C"}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white grid grid-cols-3 divide-x divide-slate-100">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center py-4 gap-0.5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
            <p className="text-xl font-bold text-slate-800">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
