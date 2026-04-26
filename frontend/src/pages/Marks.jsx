import { useState, useEffect } from "react";
import { SyncBar, PageHeader, PageSkeleton, FadeIn, markGrade, gradeColor } from "../components/ui/index.jsx";

const PALETTE = ["#818cf8","#34d399","#fbbf24","#f87171","#a78bfa",
                 "#38bdf8","#fb923c","#6ee7b7","#c084fc","#f472b6"];

const GRADE_SCALE = [
  ["O",  "≥ 91",  "#34d399"],
  ["A+", "81–90", "#34d399"],
  ["A",  "71–80", "#818cf8"],
  ["B+", "61–70", "#a78bfa"],
  ["B",  "51–60", "#fbbf24"],
  ["C",  "45–50", "#fb923c"],
  ["F",  "< 45",  "#f87171"],
];

function ScoreCell({ obtained = 0, max = 0, hide = false }) {
  if (hide || max === 0) return <td className="text-center text-tx-4">—</td>;
  const p   = max > 0 ? Math.round(obtained / max * 100) : 0;
  const col = obtained / max >= 0.75 ? "#34d399" : obtained / max >= 0.5 ? "#fbbf24" : "#f87171";
  return (
    <td className="text-center">
      <span className="font-mono text-[13px]" style={{ color: col }}>{obtained}</span>
      <span className="text-tx-4 text-[10px]">/{max}</span>
    </td>
  );
}

function GradeBadge({ grade }) {
  const col = gradeColor(grade);
  return (
    <span className="badge font-bold text-[12.5px] tracking-wider"
      style={{ background: `${col}22`, color: col,
               boxShadow: `0 0 8px ${col}20` }}>
      {grade}
    </span>
  );
}

export default function Marks({ marks, isSyncing, lastSynced, syncError, isLive, onSync }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 400); return () => clearTimeout(t); }, []);
  if (!loaded) return <PageSkeleton />;

  // Compute grade per course
  const enriched = marks.map((m, idx) => {
    const isLab = (m.category ?? "").toLowerCase().includes("lab");
    let internalPct;
    if (isLab) {
      const pracMax = m.practical?.max ?? 50;
      internalPct = pracMax > 0
        ? Math.round((m.practical?.obtained ?? 0) / pracMax * 100)
        : 0;
    } else {
      const c1  = m.cat1?.obtained ?? 0;
      const c2  = m.cat2?.obtained ?? 0;
      const c1m = m.cat1?.max ?? 50;
      const c2m = m.cat2?.max ?? 50;
      const asgnMax = m.assignment?.max ?? 10;
      const asgnObt = m.assignment?.obtained ?? 0;
      const asgnContrib = asgnMax > 0 ? (asgnObt / asgnMax) * asgnMax : 0;
      internalPct = Math.round((c1 / c1m + c2 / c2m) / 2 * 75 + asgnContrib);
    }
    return { ...m, internalPct, grade: markGrade(internalPct),
             col: PALETTE[idx % PALETTE.length], isLab };
  });

  const avgGrade = enriched.length > 0
    ? (enriched.reduce((s, m) => s + m.internalPct, 0) / enriched.length).toFixed(1)
    : "0.0";

  return (
    <FadeIn>
      <SyncBar isSyncing={isSyncing} lastSynced={lastSynced}
               syncError={syncError} isLive={isLive} onSync={onSync} />
      <PageHeader title="Marks & Grades" subtitle="Internal assessment scores · current semester" />

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Avg Internal", value: `${avgGrade}%`, col: "#818cf8" },
          { label: "O / A+",       value: enriched.filter(m => ["O","A+"].includes(m.grade)).length, col: "#34d399" },
          { label: "Below B",      value: enriched.filter(m => ["C","F"].includes(m.grade)).length,  col: "#f87171" },
          { label: "Subjects",     value: enriched.length, col: "#38bdf8" },
        ].map((s, i) => (
          <div key={i} className="card text-center p-4">
            <div className="text-[10px] font-display font-bold text-tx-3 uppercase tracking-widest mb-2">{s.label}</div>
            <div className="font-display font-extrabold text-2xl"
              style={{ color: s.col, textShadow: `0 0 16px ${s.col}40` }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Marks table */}
      <div className="card p-0 overflow-hidden mb-4">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 190 }}>Subject</th>
                <th className="text-center">CAT 1<br /><span className="normal-case text-[9px] font-normal text-tx-4">/ max</span></th>
                <th className="text-center">CAT 2<br /><span className="normal-case text-[9px] font-normal text-tx-4">/ max</span></th>
                <th className="text-center">Assignment<br /><span className="normal-case text-[9px] font-normal text-tx-4">/ max</span></th>
                <th className="text-center">Practical<br /><span className="normal-case text-[9px] font-normal text-tx-4">/ max</span></th>
                <th className="text-center" style={{ minWidth: 90 }}>Internal</th>
                <th className="text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((m, idx) => (
                <tr key={m.id ?? idx}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: m.col }} />
                      <div>
                        <div className="font-semibold text-[13px]">{m.course}</div>
                        <div className="font-mono text-[9.5px] text-tx-3">{m.category}</div>
                      </div>
                    </div>
                  </td>
                  <ScoreCell obtained={m.cat1?.obtained}    max={m.cat1?.max}    hide={m.isLab} />
                  <ScoreCell obtained={m.cat2?.obtained}    max={m.cat2?.max}    hide={m.isLab} />
                  <ScoreCell obtained={m.assignment?.obtained} max={m.assignment?.max} hide={false} />
                  <ScoreCell obtained={m.practical?.obtained}  max={m.practical?.max}  hide={!m.isLab} />
                  <td className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="prog-track" style={{ width: 52, height: 3 }}>
                        <div className="prog-fill"
                          style={{ width: `${m.internalPct}%`, background: m.col,
                                   boxShadow: `0 0 5px ${m.col}50` }} />
                      </div>
                      <span className="font-mono text-[11px] text-tx-2">{m.internalPct}%</span>
                    </div>
                  </td>
                  <td className="text-center"><GradeBadge grade={m.grade} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade scale legend */}
      <div className="card p-4">
        <div className="text-[10px] font-display font-bold text-tx-3 uppercase tracking-widest mb-3">
          Grade Scale
        </div>
        <div className="flex flex-wrap gap-2">
          {GRADE_SCALE.map(([g, r, c]) => (
            <span key={g} className="badge px-3 py-1"
              style={{ background: `${c}18`, color: c }}>
              <span className="font-bold">{g}</span>
              <span className="text-tx-3 font-normal ml-1 text-[10px]">{r}</span>
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
