import { useState, useEffect } from "react";
import {
  SyncBar, Ring, PageHeader, PageSkeleton, Counter, FadeIn, attColor
} from "../components/ui/index.jsx";

const PALETTE = ["#818cf8","#34d399","#fbbf24","#f87171","#a78bfa",
                 "#38bdf8","#fb923c","#6ee7b7","#c084fc","#f472b6"];

function pct(held, attended) {
  return held > 0 ? Math.round(attended / held * 100) : 0;
}
function canSkip(held, attended) {
  return Math.max(0, Math.floor(attended / 0.75) - held);
}
function needMore(held, attended) {
  if (pct(held, attended) >= 75) return 0;
  return Math.max(0, Math.ceil((0.75 * held - attended) / 0.25));
}

function SubjectRow({ subject, idx, isOpen, onToggle }) {
  const [skip,  setSkip]  = useState(0);
  const [extra, setExtra] = useState(0);

  const col       = subject.col ?? PALETTE[idx % PALETTE.length];
  const held      = subject.held      ?? 0;
  const attended  = subject.attended  ?? 0;
  const p         = subject.percentage ?? pct(held, attended);
  const cs        = canSkip(held, attended);
  const nm        = needMore(held, attended);

  const simHeld     = held + skip + extra;
  const simAttended = attended + extra;
  const simP        = pct(simHeld, simAttended);

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 border
                  ${isOpen ? "border-bd-str bg-raised" : "border-bd-sub"}`}
      onClick={onToggle}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: col }} />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="min-w-0 pr-3">
              <span className="text-[13.5px] font-semibold">{subject.name}</span>
              <span className="font-mono text-[10px] text-tx-3 ml-2 hidden sm:inline">
                {subject.code}
              </span>
            </div>
            <span className="font-mono text-[15px] font-extrabold flex-shrink-0"
              style={{ color: attColor(p), textShadow: `0 0 10px ${attColor(p)}50` }}>
              {p}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="prog-track mb-2">
            <div className="prog-fill"
              style={{ width: `${p}%`, background: col,
                       boxShadow: `0 0 6px ${col}40` }} />
          </div>

          {/* Meta row */}
          <div className="flex justify-between items-center">
            <span className="text-[11.5px] text-tx-2">
              {attended}/{held} classes · {subject.credits ?? 3} cr
            </span>
            {cs > 0
              ? <span className="text-[11.5px] font-semibold text-green-400">Can skip {cs} ✓</span>
              : nm > 0
                ? <span className="text-[11.5px] font-semibold text-red-400">Need {nm} more ⚠</span>
                : <span className="text-[11.5px] font-semibold text-amber-400">At safe limit</span>}
          </div>
        </div>
      </div>

      {/* Simulator (expanded) */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/5" onClick={e => e.stopPropagation()}>
          <div className="text-[10px] font-display font-bold text-tx-3 uppercase tracking-widest mb-4">
            Skip / Attend Simulator
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[11.5px] text-tx-2 mb-2">Classes to Skip</div>
              <Counter value={skip} onChange={setSkip} />
            </div>
            <div>
              <div className="text-[11.5px] text-tx-2 mb-2">Extra to Attend</div>
              <Counter value={extra} onChange={setExtra} />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: `${attColor(simP)}0e`,
                     border: `1px solid ${attColor(simP)}28` }}>
            <div>
              <div className="text-[12.5px] text-tx-2">
                Projected: {simAttended}/{simHeld} classes
              </div>
              {simP < 75 && (
                <div className="text-[11.5px] text-red-400 mt-0.5">
                  Still {needMore(simHeld, simAttended)} short of 75%
                </div>
              )}
            </div>
            <span className="font-display font-extrabold text-2xl"
              style={{ color: attColor(simP), textShadow: `0 0 12px ${attColor(simP)}50` }}>
              {simP}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Attendance({ attendance, isSyncing, lastSynced, syncError, isLive, onSync }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [loaded,  setLoaded]  = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 350); return () => clearTimeout(t); }, []);
  if (!loaded) return <PageSkeleton />;

  const totalHeld    = attendance.reduce((s, a) => s + (a.held     ?? 0), 0);
  const totalAtt     = attendance.reduce((s, a) => s + (a.attended ?? 0), 0);
  const overallPct   = totalHeld > 0 ? Math.round(totalAtt / totalHeld * 100) : 0;
  const safe         = attendance.filter(a => (a.percentage ?? 0) >= 85).length;
  const borderline   = attendance.filter(a => { const p = a.percentage ?? 0; return p >= 75 && p < 85; }).length;
  const shortage     = attendance.filter(a => (a.percentage ?? 0) < 75).length;

  return (
    <FadeIn>
      <SyncBar isSyncing={isSyncing} lastSynced={lastSynced}
               syncError={syncError} isLive={isLive} onSync={onSync} />
      <PageHeader title="Attendance Tracker"
                  subtitle="Monitor class attendance and predict future standing" />

      {/* Overview ring card */}
      <div className="card flex items-center gap-6 mb-4">
        <Ring pct={overallPct} color={attColor(overallPct)} size={92} strokeWidth={7} />
        <div className="flex-1">
          <div className="text-[15px] font-semibold mb-1">Overall Attendance</div>
          <div className="text-sm text-tx-2 mb-3">
            {totalAtt} attended out of {totalHeld} classes held
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: `${safe} Safe`,        bg: "bg-green-900/20", col: "text-green-400" },
              { label: `${borderline} Borderline`, bg: "bg-amber-900/20", col: "text-amber-400" },
              { label: `${shortage} Shortage`,bg: "bg-red-900/20",   col: "text-red-400"   },
            ].map(b => (
              <span key={b.label} className={`badge ${b.bg} ${b.col} gap-1.5`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance table header */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[540px]">
            <thead>
              <tr>
                <th>Subject</th>
                <th className="text-center">Held</th>
                <th className="text-center">Attended</th>
                <th className="text-center">Absent</th>
                <th className="text-center">%</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, idx) => {
                const p   = a.percentage ?? pct(a.held ?? 0, a.attended ?? 0);
                const col = a.col ?? PALETTE[idx % PALETTE.length];
                return (
                  <tr key={a.id ?? idx}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
                        <div>
                          <div className="font-semibold text-[13px]">{a.name}</div>
                          <div className="font-mono text-[9.5px] text-tx-3">{a.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center font-mono">{a.held ?? 0}</td>
                    <td className="text-center font-mono text-green-400">{a.attended ?? 0}</td>
                    <td className="text-center font-mono text-red-400">{a.absent ?? 0}</td>
                    <td className="text-center">
                      <span className="font-mono font-bold"
                        style={{ color: attColor(p) }}>{p}%</span>
                    </td>
                    <td className="text-center">
                      {p >= 85
                        ? <span className="badge bg-green-900/20 text-green-400">Safe</span>
                        : p >= 75
                          ? <span className="badge bg-amber-900/20 text-amber-400">Borderline</span>
                          : <span className="badge bg-red-900/20 text-red-400">Shortage</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expandable subject rows with simulator */}
      <div className="text-[11px] font-display font-bold text-tx-3 uppercase tracking-widest mb-3">
        Skip / Attend Simulator — click a subject
      </div>
      <div className="space-y-2">
        {attendance.map((a, idx) => (
          <SubjectRow
            key={a.id ?? idx}
            subject={a}
            idx={idx}
            isOpen={openIdx === idx}
            onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
          />
        ))}
      </div>
    </FadeIn>
  );
}
