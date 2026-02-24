export const toF   = (c) => Math.round(c * 9 / 5 + 32);
export const fmtT  = (c, unit) => unit === "F" ? `${toF(c)}°F` : `${c}°C`;
