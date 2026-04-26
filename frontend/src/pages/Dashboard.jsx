import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { useAuth }             from "../context/AuthContext.jsx";
import {
  StatCard, SyncBar, FadeIn, PageSkeleton, attColor,
  markGrade, cgpaCalc,
} from "../components/ui/index.jsx";

const DAY_KEYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const PALETTE  = [
  "#818cf8","#34d399","#fbbf24","#f87171",
  "#a78bfa","#38bdf8","#fb923c","#6ee7b7",
];

function SubjectDot({ col }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{ background: col }} />;
}

// Map short course name → attendance colour
function subjectColor(short, attendance, idx) {
  const match = attendance.find(a => a.short === short || a.name?.includes(short));
  return match?.col ?? PALETTE[idx % PALETTE.length];
}

export default function Dashboard({
  attendance, marks, timetable,
  isSyncing, lastSynced, syncError, isLive, onSync,
}) {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 380);
    return () => clearTimeout(t);
  }, []);

  if (!loaded) return <PageSkeleton />;

  // ── Computed values ────────────────────────────────────────
  const totalAtt  = attendance.reduce((s, a) => s + (a.attended ?? 0), 0);
  const totalHeld = attendance.reduce((s, a) => s + (a.held     ?? 0), 0);
  const overallPct = totalHeld > 0 ? Math.round(totalAtt / totalHeld * 100) : 0;

  // CGPA from marks
  const cgpaCourses = marks.map((m, i) => {
    const att    = attendance[i] ?? {};
    const isLab  = (m.category ?? "").toLowerCase().includes("lab");
    const c1     = m.cat1?.obtained ?? 0;
    const c2     = m.cat2?.obtained ?? 0;
    const c1m    = m.cat1?.max ?? 50;
    const c2m    = m.cat2?.max ?? 50;
    const asgnO  = m.assignment?.obtained ?? 0;
    const pracO  = m.practical?.obtained  ?? 0;
    const pracM  = m.practical?.max       ?? 50;
    const intPct = isLab
      ? (pracM > 0 ? Math.round(pracO / pracM * 100) : 0)
      : Math.round((c1 / c1m + c2 / c2m) / 2 * 75 + asgnO);
    return { grade: markGrade(intPct), credits: att.credits ?? m.credits ?? 3 };
  });
  const cgpa    = cgpaCalc(cgpaCourses);
  const cgpaNum = parseFloat(cgpa);
  const cgpaCol = cgpaNum >= 9 ? "#34d399" : cgpaNum >= 7.5 ? "#818cf8" : cgpaNum >= 6 ? "#fbbf24" : "#f87171";

  const lowAtt     = attendance.filter(a => (a.percentage ?? 0) < 75);
  const todayKey   = DAY_KEYS[new Date().getDay()];
  const todaySlots = (timetable[todayKey] ?? []).filter(Boolean);

  const hour  = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const STATS = [
    {
      label: "Overall Attendance",
      value: `${overallPct}%`,
      sub:   `${totalAtt} of ${totalHeld} classes`,
      color: attColor(overallPct),
      page:  "/attendance",
    },
    {
      label: "Semester SGPA",
      value: cgpa,
      sub:   "Based on internal marks",
      color: cgpaCol,
      page:  "/cgpa",
    },
    {
      label: "Low Attendance",
      value: lowAtt.length,
      sub:   lowAtt.length > 0 ? "Subjects below 75%" : "All subjects safe ✓",
      color: lowAtt.length > 0 ? "#f87171" : "#34d399",
      page:  "/attendance",
    },
    {
      label: "Today's Classes",
      value: todaySlots.length,
      sub:   todayKey === "SUN" ? "Weekend 🎉" : `${todayKey} schedule`,
      color: "#38bdf8",
      page:  "/timetable",
    },
  ];

  return (
    <FadeIn>
      {/* Sync bar */}
      <SyncBar
        isSyncing={isSyncing}
        lastSynced={lastSynced}
        syncError={syncError}
        isLive={isLive}
        onSync={onSync}
      />

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-xl tracking-tight leading-snug">
          {greet},{" "}
          <span className="text-sky text-glow-sky">
            {(user?.name ?? "Student").split(" ")[0]}
          </span>{" "}
          👋
        </h1>
        <p className="text-sm text-tx-2 mt-1.5">
          {user?.dept ?? "SRM KTR"} ·{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} onClick={() => navigate(s.page)} />
        ))}
      </div>

      {/* Low attendance alert */}
      {lowAtt.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3.5 mb-5
                        bg-red-900/12 border border-red-700/25 rounded-xl">
          <span className="text-red-400 text-base flex-shrink-0 mt-0.5">⚠</span>
          <div>
            <div className="text-sm font-semibold text-red-300 mb-0.5">
              Low Attendance Alert
            </div>
            <div className="text-xs text-tx-2 leading-relaxed">
              <span className="text-red-300">
                {lowAtt.map(a => a.short ?? a.name).join(", ")}
              </span>
              {" "}{lowAtt.length === 1 ? "is" : "are"} below 75%.
              Attend consistently to avoid debarment.
              {" "}
              <button
                onClick={() => navigate("/attendance")}
                className="text-sky underline underline-offset-2 hover:no-underline"
              >
                View details →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-column: attendance bars + today's timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Attendance per subject */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-display font-bold text-tx-3
                             uppercase tracking-widest">
              Attendance by Subject
            </span>
            <button
              onClick={() => navigate("/attendance")}
              className="text-[11px] text-sky hover:underline"
            >
              View all →
            </button>
          </div>

          {attendance.length === 0 ? (
            <p className="text-xs text-tx-3 italic text-center py-4">No data yet — sync with SRM</p>
          ) : (
            attendance.map((a, idx) => {
              const pct = a.percentage ?? (a.held > 0 ? Math.round(a.attended / a.held * 100) : 0);
              const col = a.col ?? PALETTE[idx % PALETTE.length];
              return (
                <div key={a.id ?? idx} className="mb-3.5 last:mb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[12.5px] flex items-center gap-2">
                      <SubjectDot col={col} />
                      <span className="truncate max-w-[160px]">{a.short ?? a.name}</span>
                    </span>
                    <span className="font-mono text-xs font-bold flex-shrink-0 ml-2"
                      style={{ color: attColor(pct) }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill"
                      style={{
                        width:      `${pct}%`,
                        background: col,
                        boxShadow:  `0 0 6px ${col}50`,
                      }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Today's timetable */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-display font-bold text-tx-3
                             uppercase tracking-widest">
              Today's Schedule
            </span>
            <span className="bg-sky/10 text-sky text-[10px] font-semibold
                             px-2.5 py-0.5 rounded-full">
              {todayKey}
            </span>
          </div>

          {(timetable[todayKey] ?? []).length === 0 ? (
            <p className="text-xs text-tx-3 italic text-center py-6">
              No classes today 🎉
            </p>
          ) : (
            (timetable[todayKey] ?? []).map((slot, i) => {
              const s       = typeof slot === "string" ? { short: slot } : slot;
              const isBreak = i === 2 || i === 5;
              const col     = s?.short ? subjectColor(s.short, attendance, i) : null;
              const time    = s?.time  ?? ["8:00","9:00","10:00","11:00","12:00","1:00","2:00"][i] ?? "";

              return (
                <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                  <span className="font-mono text-[10px] text-tx-3 w-11 flex-shrink-0">
                    {time}
                  </span>
                  {s?.short ? (
                    <div
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 truncate"
                      style={{
                        background: `${col}18`,
                        border:     `1px solid ${col}30`,
                        color:      col,
                      }}
                      title={s.full ?? s.short}
                    >
                      {s.full ?? s.short}
                    </div>
                  ) : (
                    <div className="flex-1 px-3 py-1.5 rounded-lg text-xs text-tx-3
                                    bg-raised italic">
                      {isBreak ? "Break" : "—"}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </FadeIn>
  );
}
