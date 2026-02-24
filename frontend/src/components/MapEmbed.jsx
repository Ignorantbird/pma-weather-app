import { useEffect, useState } from "react";
import { getMapsKey } from "../api/weatherApi";

export default function MapEmbed({ location, mapsKey: propKey }) {
  const [fetchedKey, setFetchedKey] = useState(null);

  useEffect(() => {
    if (propKey) return;
    getMapsKey().then((res) => setFetchedKey(res.data.key)).catch(() => {});
  }, [propKey]);

  const key = propKey ?? fetchedKey;
  //safety check
  if (!location || !key) return null;

  //maps embed url
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(location)}`;

  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
        Location Map
      </p>
      <div className="rounded-2xl overflow-hidden shadow-md ring-1 ring-black/5">
        <iframe
          title="location-map"
          src={src}
          width="100%"
          height="320"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
