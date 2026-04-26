import { useState, useEffect } from "react";

// ── SVG icon helper ───────────────────────────────────────────
export function Icon({ d, d2, size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d={d} />
      {d2 && <path d={d2} />}
    </svg>
  );
}

// ── Brand Logo (4-square grid) ────────────────────────────────
export function Logo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3"  y="3"  width="8" height="8" rx="2" fill="#38bdf8" opacity="0.9" />
      <rect x="13" y="3"  width="8" height="8" rx="2" fill="#38bdf8" opacity="0.5" />
      <rect x="3"  y="13" width="8" height="8" rx="2" fill="#38bdf8" opacity="0.5" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="#38bdf8" opacity="0.9" />
    </svg>
  );
}

// ── Circular progress ring ────────────────────────────────────
export function Ring({ pct = 0, size = 88, strokeWidth = 6, color }) {
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={off}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)",
            filter: `drop-shadow(0 0 5px ${color}80)`,
          }} />
      </svg>
      <span className="relative font-mono text-xs font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

// ── Skeleton shimmer ──────────────────────────────────────────
export function Skel({ w = "100%", h = 16, rounded = "rounded-lg", className = "" }) {
  return (
    <div className={`skeleton ${rounded} ${className}`}
      style={{ width: w, height: h }} />
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-up space-y-5 pt-2">
      <Skel h={28} w={200} rounded="rounded-lg" />
      <Skel h={14} w={280} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        {[0,1,2,3].map(i => <Skel key={i} h={88} rounded="rounded-xl" />)}
      </div>
      <Skel h={240} rounded="rounded-xl" className="mt-1" />
    </div>
  );
}

// ── Sync bar ──────────────────────────────────────────────────
export function SyncBar({ isSyncing, lastSynced, syncError, isLive, onSync }) {
  const fmtTime = (d) => d
    ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-5
                    bg-raised border border-bd-sub rounded-xl text-xs">
      {/* Status dot */}
      {isSyncing ? (
        <div className="w-2 h-2 rounded-full bg-sky/60 animate-pulse flex-shrink-0" />
      ) : isLive ? (
        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0
                        shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
      ) : (
        <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
      )}

      {/* Status text */}
      <span className="text-tx-2">
        {isSyncing ? "Syncing with SRM Academia…" : isLive
          ? <>Live data{lastSynced && <span className="text-tx-3"> · synced {fmtTime(lastSynced)}</span>}</>
          : syncError
            ? <span className="text-amber-400">Using demo data — {syncError}</span>
            : "Demo mode"}
      </span>

      <div className="flex-1" />

      {/* Error badge */}
      {syncError && !isSyncing && (
        <span className="badge bg-red-900/30 text-red-400 hidden sm:inline-flex">
          API unavailable
        </span>
      )}

      {/* Sync button */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                   bg-sky text-black transition-all duration-150
                   hover:opacity-90 hover:shadow-sky-glow
                   disabled:opacity-40 disabled:cursor-not-allowed">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={isSyncing ? "animate-spin" : ""}>
          <path d="M23 4v6h-6" />
          <path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
        {isSyncing ? "Syncing…" : "Sync with SRM"}
      </button>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, onClick }) {
  return (
    <div className="card-interactive" onClick={onClick}>
      <div className="text-[10.5px] font-display font-bold text-tx-3 uppercase tracking-widest mb-2.5">
        {label}
      </div>
      <div className="font-display font-extrabold text-3xl leading-none mb-1.5"
        style={{ color, textShadow: `0 0 20px ${color}50` }}>
        {value}
      </div>
      <div className="text-xs text-tx-3">{sub}</div>
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────
export function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="font-display font-bold text-xl tracking-tight text-tx-1">{title}</h1>
      {subtitle && <p className="text-sm text-tx-2 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Attendance color helper ───────────────────────────────────
export function attColor(p) {
  return p >= 85 ? "#34d399" : p >= 75 ? "#fbbf24" : "#f87171";
}

// ── Grade helpers ─────────────────────────────────────────────
export function markGrade(pct) {
  if (pct >= 91) return "O";
  if (pct >= 81) return "A+";
  if (pct >= 71) return "A";
  if (pct >= 61) return "B+";
  if (pct >= 51) return "B";
  if (pct >= 45) return "C";
  return "F";
}

export function gradeColor(g) {
  return { O:"#34d399","A+":"#34d399",A:"#818cf8","B+":"#a78bfa",
           B:"#fbbf24",C:"#fb923c",F:"#f87171" }[g] ?? "#555";
}

export const GP = { O:10,"A+":9,A:8,"B+":7,B:6,C:5,F:0 };

export function cgpaCalc(courses) {
  const tp = courses.reduce((s, c) => s + (GP[c.grade] ?? 0) * c.credits, 0);
  const tc = courses.reduce((s, c) => s + c.credits, 0);
  return tc === 0 ? "0.00" : (tp / tc).toFixed(2);
}

// ── Counter ───────────────────────────────────────────────────
export function Counter({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button className="btn-icon text-base" onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <span className="font-mono text-lg font-bold w-8 text-center">{value}</span>
      <button className="btn-icon text-base" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ message = "No data available" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-tx-3">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.2" className="mb-3 opacity-40">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 13h4" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Mounted animation wrapper ─────────────────────────────────
export function FadeIn({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.22s ease, transform 0.22s ease" }}>
      {children}
    </div>
  );
}
