import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { useAuth }             from "../context/AuthContext.jsx";
import { FadeIn, attColor, markGrade, gradeColor, GP, cgpaCalc } from "../components/ui/index.jsx";

// ── Info row ──────────────────────────────────────────────────
function InfoRow({ label, value, mono = false, copy = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="flex items-start justify-between py-3 border-b border-bd-sub last:border-0">
      <span className="text-[11px] font-display font-bold text-tx-3 uppercase tracking-wider
                       flex-shrink-0 w-32 pt-0.5">
        {label}
      </span>
      <div className="flex items-center gap-2 text-right min-w-0">
        <span className={`text-sm text-tx-1 break-all ${mono ? "font-mono text-[12px]" : ""}`}>
          {value ?? "—"}
        </span>
        {copy && value && (
          <button
            onClick={handleCopy}
            className="flex-shrink-0 text-tx-3 hover:text-sky transition-colors"
            title="Copy"
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="#34d399" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-card border border-bd-sub rounded-xl overflow-hidden mb-4">
      <div className="px-5 py-3 border-b border-bd-sub bg-raised">
        <span className="text-[10.5px] font-display font-bold text-tx-3 uppercase tracking-widest">
          {title}
        </span>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

export default function Profile({ attendance, marks }) {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 250); return () => clearTimeout(t); }, []);

  if (!loaded || !user) return null;

  const initials = (user.name ?? "?")
    .split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // ── Compute semester summary ──────────────────────────────
  const totalHeld   = attendance.reduce((s, a) => s + (a.held     ?? 0), 0);
  const totalAtt    = attendance.reduce((s, a) => s + (a.attended ?? 0), 0);
  const overallPct  = totalHeld > 0 ? Math.round(totalAtt / totalHeld * 100) : 0;
  const lowSubjects = attendance.filter(a => (a.percentage ?? 0) < 75);

  const cgpaCourses = marks.map((m, i) => {
    const att   = attendance[i];
    const isLab = (m.category ?? "").toLowerCase().includes("lab");
    const c1    = m.cat1?.obtained ?? 0;
    const c2    = m.cat2?.obtained ?? 0;
    const c1m   = m.cat1?.max ?? 50;
    const c2m   = m.cat2?.max ?? 50;
    const asgnO = m.assignment?.obtained ?? 0;
    const asgnM = m.assignment?.max ?? 10;
    const pracO = m.practical?.obtained ?? 0;
    const pracM = m.practical?.max ?? 50;
    const intPct = isLab
      ? (pracM > 0 ? Math.round(pracO / pracM * 100) : 0)
      : Math.round((c1 / c1m + c2 / c2m) / 2 * 75 + (asgnM > 0 ? asgnO : 0));
    return { grade: markGrade(intPct), credits: att?.credits ?? m.credits ?? 3 };
  });
  const cgpa    = cgpaCalc(cgpaCourses);
  const cgpaNum = parseFloat(cgpa);
  const cgpaCol = cgpaNum >= 9 ? "#34d399" : cgpaNum >= 7.5 ? "#818cf8" : cgpaNum >= 6 ? "#fbbf24" : "#f87171";

  const gradeDistrib = Object.keys(GP).map(g => ({
    grade:    g,
    count:    cgpaCourses.filter(c => c.grade === g).length,
    col:      gradeColor(g),
  })).filter(g => g.count > 0);

  const SUMMARY = [
    { label: "Overall Att.",  value: `${overallPct}%`, color: attColor(overallPct) },
    { label: "Semester SGPA", value: cgpa,             color: cgpaCol },
    { label: "Low Att. Subj", value: lowSubjects.length,
      color: lowSubjects.length > 0 ? "#f87171" : "#34d399" },
    { label: "Total Credits", value: cgpaCourses.reduce((s, c) => s + c.credits, 0),
      color: "#38bdf8" },
  ];

  return (
    <FadeIn>
      {/* Profile header card */}
      <div className="bg-card border border-bd-sub rounded-xl p-6 mb-5
                      bg-gradient-to-br from-card via-card to-sky/[0.03]">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-sky/10 border-2 border-sky/25
                          flex items-center justify-center flex-shrink-0
                          text-xl font-bold text-sky font-display
                          shadow-[0_0_24px_rgba(56,189,248,0.18)]">
            {initials}
          </div>

          {/* Name + meta */}
          <div className="min-w-0">
            <h1 className="font-display font-extrabold text-xl tracking-tight truncate">
              {user.name}
            </h1>
            <div className="font-mono text-[11px] text-tx-3 mt-1">{user.regNo}</div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {user.section && (
                <span className="bg-sky/10 text-sky text-[10px] font-semibold
                                 px-2.5 py-1 rounded-full">
                  {user.section}
                </span>
              )}
              {user.dept && (
                <span className="bg-bd-def text-tx-2 text-[10px] font-semibold
                                 px-2.5 py-1 rounded-full">
                  {user.dept}
                </span>
              )}
              {user.sem && (
                <span className="bg-bd-def text-tx-2 text-[10px] font-semibold
                                 px-2.5 py-1 rounded-full">
                  {user.sem}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Semester summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {SUMMARY.map((s, i) => (
          <div key={i} className="bg-card border border-bd-sub rounded-xl p-4 text-center">
            <div className="text-[10px] font-display font-bold text-tx-3
                            uppercase tracking-widest mb-2">{s.label}</div>
            <div className="font-display font-extrabold text-2xl"
              style={{ color: s.color, textShadow: `0 0 16px ${s.color}40` }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column info + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Academic info */}
        <Section title="Academic Information">
          <InfoRow label="Full Name"      value={user.name}     copy />
          <InfoRow label="Reg. Number"    value={user.regNo}    mono copy />
          <InfoRow label="Department"     value={user.dept} />
          <InfoRow label="Programme"      value={user.program} />
          <InfoRow label="Semester"       value={user.sem} />
          <InfoRow label="Section"        value={user.section} />
          <InfoRow label="Campus"         value={user.campus} />
          {user.email && <InfoRow label="Email" value={user.email} mono copy />}
        </Section>

        {/* Grade distribution */}
        <div>
          <Section title="Grade Distribution">
            {gradeDistrib.length === 0 ? (
              <p className="text-xs text-tx-3 py-4 text-center italic">No grade data yet</p>
            ) : (
              gradeDistrib.map(({ grade, count, col }) => (
                <div key={grade} className="flex items-center gap-3 py-2.5 border-b border-bd-sub last:border-0">
                  <span className="w-14 text-xs font-bold" style={{ color: col }}>
                    {grade}
                  </span>
                  <div className="flex-1 h-2 bg-bd-def rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:      `${(count / marks.length) * 100}%`,
                        background: col,
                        boxShadow:  `0 0 6px ${col}50`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-tx-2 w-6 text-right">{count}</span>
                </div>
              ))
            )}
          </Section>

          {/* Subject attendance summary */}
          <Section title="Attendance Summary">
            {attendance.slice(0, 6).map((a, i) => {
              const pct = a.percentage ?? 0;
              return (
                <div key={i}
                  className="flex items-center gap-3 py-2.5 border-b border-bd-sub last:border-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: a.col ?? "#555" }} />
                  <span className="flex-1 text-xs truncate">{a.short ?? a.name}</span>
                  <div className="w-16 h-1.5 bg-bd-def rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: attColor(pct) }} />
                  </div>
                  <span className="font-mono text-[11px] font-bold w-10 text-right"
                    style={{ color: attColor(pct) }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </Section>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
        {[
          { label: "View Attendance", to: "/attendance", col: "#34d399" },
          { label: "View Marks",      to: "/marks",      col: "#818cf8" },
          { label: "View Timetable",  to: "/timetable",  col: "#38bdf8" },
          { label: "CGPA Calculator", to: "/cgpa",       col: "#fbbf24" },
        ].map(link => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="bg-card border border-bd-sub rounded-xl p-3 text-center
                       text-xs font-semibold transition-all duration-150
                       hover:border-bd-str hover:-translate-y-0.5 hover:shadow-card"
            style={{ color: link.col }}
          >
            {link.label}
          </button>
        ))}
      </div>
    </FadeIn>
  );
}
