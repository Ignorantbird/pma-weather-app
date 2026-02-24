//Shared cloud shapes

function Cloud({ className, style }) {
  return (
    <svg viewBox="0 0 320 160" fill="currentColor" aria-hidden="true"
      className={className} style={style}>
      <ellipse cx="160" cy="135" rx="140" ry="32" />
      <ellipse cx="90"  cy="108" rx="66"  ry="60" />
      <ellipse cx="168" cy="82"  rx="82"  ry="74" />
      <ellipse cx="242" cy="112" rx="60"  ry="52" />
    </svg>
  );
}

function SmallCloud({ className, style }) {
  return (
    <svg viewBox="0 0 200 100" fill="currentColor" aria-hidden="true"
      className={className} style={style}>
      <ellipse cx="100" cy="84"  rx="86"  ry="20" />
      <ellipse cx="58"  cy="68"  rx="42"  ry="38" />
      <ellipse cx="108" cy="52"  rx="52"  ry="46" />
      <ellipse cx="152" cy="70"  rx="38"  ry="32" />
    </svg>
  );
}

//Rain shapes

const RAIN = [
  { left: "4%",  delay: 0.0, duration: 2.1 },
  { left: "9%",  delay: 0.7, duration: 1.8 },
  { left: "15%", delay: 0.3, duration: 2.4 },
  { left: "21%", delay: 1.2, duration: 1.7 },
  { left: "27%", delay: 0.5, duration: 2.2 },
  { left: "33%", delay: 1.5, duration: 1.9 },
  { left: "40%", delay: 0.2, duration: 2.3 },
  { left: "47%", delay: 0.9, duration: 1.6 },
  { left: "54%", delay: 1.3, duration: 2.0 },
  { left: "61%", delay: 0.4, duration: 1.8 },
  { left: "68%", delay: 1.1, duration: 2.5 },
  { left: "74%", delay: 0.6, duration: 1.7 },
  { left: "80%", delay: 1.8, duration: 2.1 },
  { left: "86%", delay: 0.1, duration: 2.3 },
  { left: "92%", delay: 1.0, duration: 1.9 },
  { left: "97%", delay: 0.8, duration: 2.2 },
];

function RainDecorations() {
  return (
    <>
      <Cloud className="absolute text-white" style={{ top: "-20px", left: "-80px", width: "340px", opacity: 0.12, animation: "cloud-float 11s ease-in-out infinite" }} />
      <SmallCloud className="absolute text-white" style={{ top: "10px", right: "-30px", width: "220px", opacity: 0.14, animation: "cloud-drift 14s ease-in-out infinite 2s" }} />
      <SmallCloud className="absolute text-white" style={{ bottom: "20px", left: "8%", width: "150px", opacity: 0.1, animation: "cloud-float 9s ease-in-out infinite 4s" }} />
      {RAIN.map((r, i) => (
        <div key={i} className="absolute top-0 rounded-full bg-white" aria-hidden="true"
          style={{
            left: r.left, width: "1.5px", height: "38px", opacity: 0,
            animation: `rain-fall ${r.duration}s linear infinite`,
            animationDelay: `${r.delay}s`,
          }}
        />
      ))}
    </>
  );
}

//Sunny

function SunRays({ cx, cy, r, rays, style }) {
  const angles = Array.from({ length: rays }, (_, i) => (i * 360) / rays);
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" style={style}>
      <circle cx={cx} cy={cy} r={r} fill="currentColor" opacity="0.9" />
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * (r + 8);
        const y1 = cy + Math.sin(rad) * (r + 8);
        const x2 = cx + Math.cos(rad) * (r + 28);
        const y2 = cy + Math.sin(rad) * (r + 28);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />;
      })}
    </svg>
  );
}

const STARS = [
  { top: "12%", left: "6%",  delay: 0.0, size: 3 },
  { top: "8%",  left: "18%", delay: 1.2, size: 2 },
  { top: "18%", left: "30%", delay: 2.4, size: 2 },
  { top: "6%",  left: "52%", delay: 0.7, size: 3 },
  { top: "14%", left: "67%", delay: 1.8, size: 2 },
  { top: "9%",  left: "80%", delay: 0.4, size: 3 },
  { top: "20%", left: "91%", delay: 2.1, size: 2 },
];

function SunnyDecorations() {
  return (
    <>
      {/* Main spinning sun */}
      <div className="absolute text-yellow-300" style={{ top: "-40px", right: "6%", width: "180px", opacity: 0.25, animation: "spin-slow 18s linear infinite" }}>
        <SunRays cx={100} cy={100} r={38} rays={12} style={{ width: "100%", height: "100%", color: "inherit" }} />
      </div>
      {/* Smaller secondary sun shimmer */}
      <div className="absolute text-amber-200" style={{ bottom: "10px", left: "4%", width: "100px", opacity: 0.15, animation: "spin-slow 26s linear infinite reverse" }}>
        <SunRays cx={100} cy={100} r={30} rays={8} style={{ width: "100%", height: "100%", color: "inherit" }} />
      </div>
      {/* Light sparkle dots */}
      {STARS.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-yellow-200"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size,
            animation: `twinkle ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${s.delay}s` }} />
      ))}
      {/* Thin cloud wisps */}
      <SmallCloud className="absolute text-white" style={{ top: "10px", left: "5%", width: "160px", opacity: 0.06, animation: "cloud-drift 18s ease-in-out infinite" }} />
    </>
  );
}

//Cloudy
function CloudyDecorations() {
  return (
    <>
      <Cloud className="absolute text-white" style={{ top: "-20px", left: "-80px", width: "340px", opacity: 0.07, animation: "cloud-float 11s ease-in-out infinite" }} />
      <SmallCloud className="absolute text-white" style={{ top: "10px", right: "-30px", width: "220px", opacity: 0.09, animation: "cloud-drift 14s ease-in-out infinite 2s" }} />
      <SmallCloud className="absolute text-white" style={{ bottom: "20px", left: "8%", width: "150px", opacity: 0.06, animation: "cloud-float 9s ease-in-out infinite 4s" }} />
      <Cloud className="absolute text-white" style={{ bottom: "-10px", right: "10%", width: "180px", opacity: 0.05, animation: "cloud-drift 16s ease-in-out infinite 1s" }} />
      {STARS.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size,
            animation: `twinkle ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${s.delay}s` }} />
      ))}
    </>
  );
}

//Stormy
function LightningBolt({ style }) {
  return (
    <svg viewBox="0 0 60 120" fill="currentColor" aria-hidden="true" style={style}>
      <polygon points="35,0 10,65 28,65 20,120 50,45 32,45" />
    </svg>
  );
}

function StormyDecorations() {
  return (
    <>
      <Cloud className="absolute text-slate-300" style={{ top: "-30px", left: "-60px", width: "400px", opacity: 0.18, animation: "cloud-float 8s ease-in-out infinite" }} />
      <Cloud className="absolute text-slate-300" style={{ top: "0px", right: "-40px", width: "300px", opacity: 0.15, animation: "cloud-drift 10s ease-in-out infinite 1s" }} />
      <SmallCloud className="absolute text-white" style={{ bottom: "10px", left: "20%", width: "200px", opacity: 0.1, animation: "cloud-float 7s ease-in-out infinite 2s" }} />
      <LightningBolt style={{ position: "absolute", top: "15%", left: "28%", width: "36px", color: "#fde68a", opacity: 0, animation: "lightning-flash 4s ease-in-out infinite" }} />
      <LightningBolt style={{ position: "absolute", top: "20%", right: "22%", width: "28px", color: "#fde68a", opacity: 0, animation: "lightning-flash 4s ease-in-out infinite 2.3s" }} />
      {RAIN.slice(0, 10).map((r, i) => (
        <div key={i} className="absolute top-0 rounded-full bg-slate-300" aria-hidden="true"
          style={{ left: r.left, width: "1.5px", height: "44px", opacity: 0,
            animation: `rain-fall ${r.duration * 0.7}s linear infinite`,
            animationDelay: `${r.delay}s` }} />
      ))}
    </>
  );
}

//Snowy
const SNOWFLAKES = [
  { left: "5%",  delay: 0.0, duration: 4.2, size: 6 },
  { left: "12%", delay: 1.1, duration: 3.8, size: 4 },
  { left: "20%", delay: 0.5, duration: 5.0, size: 5 },
  { left: "29%", delay: 2.0, duration: 3.5, size: 7 },
  { left: "38%", delay: 0.8, duration: 4.5, size: 4 },
  { left: "46%", delay: 1.6, duration: 3.9, size: 6 },
  { left: "55%", delay: 0.3, duration: 4.8, size: 5 },
  { left: "63%", delay: 1.9, duration: 3.6, size: 4 },
  { left: "72%", delay: 0.6, duration: 5.2, size: 7 },
  { left: "80%", delay: 2.3, duration: 4.0, size: 5 },
  { left: "88%", delay: 1.4, duration: 3.7, size: 6 },
  { left: "95%", delay: 0.2, duration: 4.6, size: 4 },
];

function SnowDecorations() {
  return (
    <>
      <SmallCloud className="absolute text-white" style={{ top: "-10px", left: "-20px", width: "260px", opacity: 0.12, animation: "cloud-float 12s ease-in-out infinite" }} />
      <Cloud className="absolute text-white" style={{ top: "-5px", right: "-50px", width: "300px", opacity: 0.1, animation: "cloud-drift 15s ease-in-out infinite 3s" }} />
      {SNOWFLAKES.map((s, i) => (
        <div key={i} className="absolute top-0 rounded-full bg-white" aria-hidden="true"
          style={{ left: s.left, width: s.size, height: s.size, opacity: 0,
            animation: `snow-fall ${s.duration}s linear infinite`,
            animationDelay: `${s.delay}s` }} />
      ))}
    </>
  );
}

//Foggy
const FOG_BANDS = [
  { top: "18%", opacity: 0.18, duration: 8,  delay: 0   },
  { top: "34%", opacity: 0.14, duration: 11, delay: 2   },
  { top: "52%", opacity: 0.12, duration: 9,  delay: 1   },
  { top: "68%", opacity: 0.16, duration: 13, delay: 3.5 },
];

function FogDecorations() {
  return (
    <>
      {FOG_BANDS.map((b, i) => (
        <div key={i} aria-hidden="true"
          style={{
            position: "absolute", top: b.top, left: 0, right: 0,
            height: "60px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.45) 60%, transparent)",
            filter: "blur(12px)",
            animation: `fog-drift ${b.duration}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
            opacity: b.opacity,
          }}
        />
      ))}
      <SmallCloud className="absolute text-white" style={{ top: "5%", left: "10%", width: "280px", opacity: 0.08, animation: "cloud-drift 20s ease-in-out infinite" }} />
      <Cloud className="absolute text-white" style={{ bottom: "0", right: "5%", width: "320px", opacity: 0.07, animation: "cloud-float 17s ease-in-out infinite 2s" }} />
    </>
  );
}

//Main export
export default function WeatherDecorations({ theme = "default" }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {theme === "sunny"   && <SunnyDecorations />}
      {theme === "rainy"   && <RainDecorations />}
      {theme === "drizzle" && <RainDecorations />}
      {theme === "stormy"  && <StormyDecorations />}
      {theme === "snowy"   && <SnowDecorations />}
      {theme === "foggy"   && <FogDecorations />}
      {(theme === "cloudy" || theme === "default") && <CloudyDecorations />}
    </div>
  );
}
