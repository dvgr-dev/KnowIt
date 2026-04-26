import { useState, useEffect } from "react";
import { SyncBar, PageHeader, PageSkeleton, FadeIn } from "../components/ui/index.jsx";

const DAYS      = ["MON","TUE","WED","THU","FRI","SAT"];
const DAY_FULL  = { MON:"Monday",TUE:"Tuesday",WED:"Wednesday",THU:"Thursday",FRI:"Friday",SAT:"Saturday" };
const TIME_LABELS = ["8:00","9:00","10:00","11:00","12:00","1:00","2:00"];
const TODAY_KEY   = ["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date().getDay()];

const PALETTE = ["#818cf8","#34d399","#fbbf24","#f87171","#a78bfa",
                 "#38bdf8","#fb923c","#6ee7b7","#c084fc","#f472b6"];

// Build a color map from short → color using palette
function buildColorMap(timetable) {
  const map = {};
  let idx = 0;
  for (const slots of Object.values(timetable)) {
    if (!Array.isArray(slots)) continue;
    for (const s of slots) {
      const key = typeof s === "string" ? s : s?.short;
      if (key && !map[key]) {
        map[key] = PALETTE[idx % PALETTE.length];
        idx++;
      }
    }
  }
  return map;
}

function SlotCell({ slot, colMap }) {
  if (!slot) return <td className="px-1.5 py-2"><div className="w-full" /></td>;
  const s   = typeof slot === "string" ? { short: slot, full: slot } : slot;
  const key = s?.short;
  if (!key) return <td className="px-1.5 py-2"><div className="text-center text-tx-4 text-sm">—</div></td>;
  const col = colMap[key] ?? "#555";

  return (
    <td className="px-1.5 py-2">
      <div className="text-center text-[11.5px] font-semibold px-1 py-1.5 rounded-md
                      transition-shadow duration-200 hover:shadow-sm cursor-default"
        style={{ background: `${col}18`, border: `1px solid ${col}30`, color: col }}
        title={s.full ?? key}>
        {key}
      </div>
    </td>
  );
}

export default function Timetable({ timetable, attendance, isSyncing, lastSynced, syncError, isLive, onSync }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 350); return () => clearTimeout(t); }, []);
  if (!loaded) return <PageSkeleton />;

  const colMap   = buildColorMap(timetable);
  const todaySlots = (timetable[TODAY_KEY] ?? []).filter(Boolean);

  // Build unique subject list for legend
  const subjects = [];
  const seen = new Set();
  for (const [short, col] of Object.entries(colMap)) {
    if (short && short !== "PE" && !seen.has(short)) {
      const att = attendance.find(a => a.short === short);
      subjects.push({ short, full: att?.name ?? short, col });
      seen.add(short);
    }
  }

  return (
    <FadeIn>
      <SyncBar isSyncing={isSyncing} lastSynced={lastSynced}
               syncError={syncError} isLive={isLive} onSync={onSync} />
      <PageHeader title="Weekly Timetable"
                  subtitle="Academic schedule · current semester" />

      {/* Subject legend */}
      <div className="flex flex-wrap gap-2 mb-5">
        {subjects.map(s => (
          <span key={s.short} className="badge text-[11.5px] px-3 py-1"
            style={{ background: `${s.col}16`, color: s.col,
                     border: `1px solid ${s.col}28` }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {s.short}
          </span>
        ))}
      </div>

      {/* Main grid */}
      <div className="card p-0 overflow-hidden mb-5">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full border-collapse" style={{ minWidth: 580 }}>
            <thead>
              <tr className="bg-raised">
                <th className="px-4 py-3 text-left text-[10px] font-display font-bold
                               text-tx-3 uppercase tracking-widest border-b border-bd-sub w-14">
                  Day
                </th>
                {TIME_LABELS.map((t, i) => (
                  <th key={i} className="px-1.5 py-3 text-center text-[9.5px] font-display
                                         font-bold text-tx-3 uppercase tracking-wider
                                         border-b border-bd-sub">
                    <span className="font-mono">{t}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => {
                const isToday   = day === TODAY_KEY;
                const daySlots  = timetable[day] ?? [];
                return (
                  <tr key={day}
                    className={`transition-colors duration-100 ${isToday ? "bg-sky/[0.03]" : ""}`}>
                    <td className="px-4 py-2 border-b border-bd-sub">
                      <div className="flex items-center gap-2">
                        <span className={`text-[12.5px] font-semibold
                                          ${isToday ? "text-sky" : "text-tx-2"}`}>
                          {day}
                        </span>
                        {isToday && (
                          <span className="badge bg-sky/10 text-sky text-[8.5px] tracking-wider">
                            NOW
                          </span>
                        )}
                      </div>
                    </td>
                    {TIME_LABELS.map((_, i) => {
                      const slot    = daySlots[i];
                      const isBreak = i === 2 || i === 5;

                      if (isBreak && !slot) {
                        return (
                          <td key={i} className="px-1.5 py-2 border-b border-bd-sub">
                            <div className="text-center text-[9px] italic text-tx-4">brk</div>
                          </td>
                        );
                      }

                      return (
                        <td key={i} className="px-1.5 py-2 border-b border-bd-sub">
                          {slot ? (
                            <SlotCell slot={slot} colMap={colMap} />
                          ) : (
                            <div className="text-center text-tx-4 text-base leading-none">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's schedule detail */}
      <div className="mb-4">
        <div className="text-[11px] font-display font-bold text-tx-3 uppercase tracking-widest mb-3">
          {DAY_FULL[TODAY_KEY] ?? "Today"}'s Schedule
        </div>
        {todaySlots.length === 0 ? (
          <div className="card text-center py-8 text-tx-3 text-sm italic">
            No classes today 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(timetable[TODAY_KEY] ?? []).map((slot, i) => {
              if (!slot) return null;
              const s   = typeof slot === "string" ? { short: slot, full: slot, time: TIME_LABELS[i] } : slot;
              const col = colMap[s?.short] ?? "#555";
              const att = attendance.find(a => a.short === s?.short);

              return (
                <div key={i} className="card p-4"
                  style={{ borderLeft: `3px solid ${col}` }}>
                  <div className="font-semibold text-sm mb-0.5" style={{ color: col }}>
                    {s.full ?? s.short}
                  </div>
                  <div className="font-mono text-[10.5px] text-tx-3">{s.time ?? TIME_LABELS[i]}</div>
                  {s.venue && <div className="text-[10.5px] text-tx-3">📍 {s.venue}</div>}
                  {att && (
                    <div className="mt-2 pt-2 border-t border-bd-sub flex justify-between
                                    items-center text-[10.5px]">
                      <span className="text-tx-3">Attendance</span>
                      <span className="font-mono font-bold"
                        style={{ color: att.percentage >= 75 ? "#34d399" : "#f87171" }}>
                        {att.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject detail grid */}
      <div className="text-[11px] font-display font-bold text-tx-3 uppercase tracking-widest mb-3">
        Subject Reference
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {subjects.map(s => {
          const att = attendance.find(a => a.short === s.short);
          return (
            <div key={s.short} className="card py-3 px-4"
              style={{ borderLeft: `2.5px solid ${s.col}` }}>
              <div className="font-bold text-[13px] mb-0.5" style={{ color: s.col }}>{s.short}</div>
              <div className="text-[11.5px] text-tx-1 leading-tight">{s.full}</div>
              {att && (
                <div className="font-mono text-[10px] text-tx-3 mt-1">
                  {att.code} · {att.credits} cr
                </div>
              )}
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
