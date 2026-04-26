import { useState, useEffect } from "react";
import {
  PageHeader, PageSkeleton, FadeIn,
  markGrade, gradeColor, GP, cgpaCalc
} from "../components/ui/index.jsx";

const PALETTE    = ["#818cf8","#34d399","#fbbf24","#f87171","#a78bfa","#38bdf8"];
const GRADE_OPTS = Object.keys(GP); // O A+ A B+ B C F

function GradeSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-raised border border-bd-def rounded-lg px-3 py-1.5 text-sm
                 text-tx-1 font-sans cursor-pointer outline-none
                 focus:border-sky focus:ring-2 focus:ring-sky/10
                 transition-all duration-150"
    >
      {GRADE_OPTS.map(g => (
        <option key={g} value={g}>{g} · {GP[g]}</option>
      ))}
    </select>
  );
}

function cgpaToColor(n) {
  if (n >= 9)   return "#34d399";
  if (n >= 7.5) return "#818cf8";
  if (n >= 6)   return "#fbbf24";
  return "#f87171";
}

export default function CGPACalculator({ marks, attendance }) {
  const [loaded,   setLoaded]   = useState(false);
  const [courses,  setCourses]  = useState([]);
  const [extras,   setExtras]   = useState([]);
  const [newName,  setNewName]  = useState("");
  const [newCr,    setNewCr]    = useState(4);
  const [newGrade, setNewGrade] = useState("A");

  useEffect(() => { const t = setTimeout(() => setLoaded(true), 300); return () => clearTimeout(t); }, []);

  // Initialise from marks + attendance on first load
  useEffect(() => {
    if (!marks?.length) return;
    const init = marks.map((m, idx) => {
      const att    = attendance[idx] ?? attendance.find(a => a.short === m.short);
      const isLab  = (m.category ?? "").toLowerCase().includes("lab");
      const c1     = m.cat1?.obtained  ?? 0;
      const c2     = m.cat2?.obtained  ?? 0;
      const c1m    = m.cat1?.max   ?? 50;
      const c2m    = m.cat2?.max   ?? 50;
      const asgnObt= m.assignment?.obtained ?? 0;
      const asgnMax= m.assignment?.max ?? 10;
      const pracObt= m.practical?.obtained  ?? 0;
      const pracMax= m.practical?.max   ?? 50;

      const internalPct = isLab
        ? (pracMax > 0 ? Math.round(pracObt / pracMax * 100) : 0)
        : Math.round((c1 / c1m + c2 / c2m) / 2 * 75 +
                     (asgnMax > 0 ? (asgnObt / asgnMax) * asgnMax : 0));

      return {
        id:      m.id ?? idx,
        name:    m.course ?? `Subject ${idx+1}`,
        short:   m.short  ?? `S${idx+1}`,
        credits: att?.credits ?? m.credits ?? 3,
        grade:   markGrade(internalPct),
        col:     att?.col ?? PALETTE[idx % PALETTE.length],
        fixed:   true, // from API
      };
    });
    setCourses(init);
  }, [marks, attendance]);

  const allCourses = [...courses, ...extras];
  const cgpa       = cgpaCalc(allCourses);
  const cgpaNum    = parseFloat(cgpa);
  const cgpaCol    = cgpaToColor(cgpaNum);
  const totalCr    = allCourses.reduce((s, c) => s + c.credits, 0);

  const updateGrade = (id, grade, isExtra) => {
    if (isExtra) setExtras(p => p.map(c => c.id === id ? { ...c, grade } : c));
    else         setCourses(p => p.map(c => c.id === id ? { ...c, grade } : c));
  };

  const addPlanned = () => {
    if (!newName.trim()) return;
    setExtras(p => [...p, {
      id:      Date.now(),
      name:    newName.trim(),
      short:   newName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 4),
      credits: newCr,
      grade:   newGrade,
      col:     "#38bdf8",
      fixed:   false,
    }]);
    setNewName("");
  };

  const removePlanned = id => setExtras(p => p.filter(c => c.id !== id));

  if (!loaded) return <PageSkeleton />;

  return (
    <FadeIn>
      <PageHeader title="CGPA Calculator"
                  subtitle="Adjust grades to project your semester outcome" />

      {/* Big SGPA display */}
      <div className="card text-center py-10 mb-5"
        style={{ boxShadow: `inset 0 0 80px ${cgpaCol}06` }}>
        <div className="text-[10.5px] font-display font-bold text-tx-3 uppercase tracking-widest mb-4">
          Calculated SGPA
        </div>
        <div className="font-display font-extrabold leading-none mb-3"
          style={{
            fontSize: "clamp(52px,10vw,72px)",
            letterSpacing: "-4px",
            color: cgpaCol,
            textShadow: `0 0 40px ${cgpaCol}40`,
          }}>
          {cgpa}
        </div>
        <div className="text-sm text-tx-3 mb-6">
          {totalCr} total credits · {allCourses.length} subjects
        </div>

        {/* Tier chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "O / A+", range: "9.0 – 10",  col: "#34d399", min: 9 },
            { label: "A",      range: "8.0 – 8.9",  col: "#818cf8", min: 8 },
            { label: "B+ / B", range: "6.0 – 7.9",  col: "#fbbf24", min: 6 },
            { label: "C / F",  range: "< 6.0",       col: "#f87171", min: 0 },
          ].map(t => {
            const tierMax = ([9,8,6,999][["O / A+","A","B+ / B","C / F"].indexOf(t.label)] ?? 999);
const active = cgpaNum >= t.min && cgpaNum < tierMax;
            return (
              <div key={t.label} className="card px-4 py-2 text-center"
                style={{
                  borderColor: active ? `${t.col}50` : undefined,
                  boxShadow:   active ? `0 0 16px ${t.col}20` : undefined,
                }}>
                <div className="font-bold text-xs" style={{ color: t.col }}>{t.label}</div>
                <div className="text-[10px] text-tx-3 mt-0.5">{t.range}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade table */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-bd-sub">
          <span className="font-semibold text-[13px]">Subject Grades</span>
          <span className="text-[11px] text-tx-3">Change a grade to recalculate</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table" style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th>Subject</th>
                <th className="text-center">Credits</th>
                <th className="text-center">Grade</th>
                <th className="text-center">Points</th>
                <th className="text-center">Contribution</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {courses.map(c => {
                const pts = GP[c.grade] ?? 0;
                const gc  = gradeColor(c.grade);
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: c.col }} />
                        <div>
                          <div className="font-semibold text-[13px]">{c.name}</div>
                          <div className="font-mono text-[9.5px] text-tx-3">{c.short}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center font-mono">{c.credits}</td>
                    <td className="text-center">
                      <GradeSelect value={c.grade}
                        onChange={g => updateGrade(c.id, g, false)} />
                    </td>
                    <td className="text-center">
                      <span className="font-mono font-bold text-sm"
                        style={{ color: gc, textShadow: `0 0 8px ${gc}40` }}>{pts}</span>
                    </td>
                    <td className="text-center font-mono text-tx-2">{pts * c.credits}</td>
                    <td />
                  </tr>
                );
              })}

              {/* Planned subjects */}
              {extras.map(c => {
                const pts = GP[c.grade] ?? 0;
                const gc  = gradeColor(c.grade);
                return (
                  <tr key={c.id} className="bg-sky/[0.025]">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0 bg-sky" />
                        <div>
                          <div className="font-semibold text-[13px] text-sky">{c.name}</div>
                          <span className="badge bg-sky/10 text-sky text-[9px]">PLANNED</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center font-mono">{c.credits}</td>
                    <td className="text-center">
                      <GradeSelect value={c.grade}
                        onChange={g => updateGrade(c.id, g, true)} />
                    </td>
                    <td className="text-center">
                      <span className="font-mono font-bold text-sm" style={{ color: gc }}>{pts}</span>
                    </td>
                    <td className="text-center font-mono text-tx-2">{pts * c.credits}</td>
                    <td className="text-center">
                      <button onClick={() => removePlanned(c.id)}
                        className="text-tx-3 hover:text-red-400 transition-colors text-lg leading-none">
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add planned subject */}
      <div className="card">
        <div className="text-[10.5px] font-display font-bold text-tx-3 uppercase
                        tracking-widest mb-4">
          Add Planned Subject
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1" style={{ minWidth: 180 }}>
            <label className="label">Subject Name</label>
            <input className="input" placeholder="e.g. Machine Learning"
              value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addPlanned()} />
          </div>
          <div>
            <label className="label">Credits</label>
            <select className="input" style={{ width: 90 }}
              value={newCr} onChange={e => setNewCr(Number(e.target.value))}>
              {[1,2,3,4,5].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Expected Grade</label>
            <GradeSelect value={newGrade} onChange={setNewGrade} />
          </div>
          <button className="btn-primary px-5 py-2.5 text-sm" onClick={addPlanned}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5"  y1="12" x2="19" y2="12" />
            </svg>
            Add Subject
          </button>
        </div>
        {extras.length > 0 && (
          <div className="mt-4 px-4 py-3 bg-sky/5 border border-sky/15 rounded-xl
                          text-[12px] text-tx-2">
            ✦ SGPA above includes {extras.length} planned subject{extras.length > 1 ? "s" : ""} — live calculation
          </div>
        )}
      </div>
    </FadeIn>
  );
}
