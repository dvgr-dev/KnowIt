// src/hooks/useStudentData.js
import { useState, useEffect, useCallback, useRef } from "react";
import { syncAll, ApiError } from "../services/api.js";

// ── Mock fallback data ─────────────────────────────────────────
export const MOCK = {
  attendance: [
    { id:1, code:"21CSC201J", name:"Data Structures",       short:"DS",   credits:4, col:"#818cf8", held:42, attended:38, absent:4,  percentage:90 },
    { id:2, code:"21MAB201T", name:"Probability & Stats",   short:"P&S",  credits:4, col:"#34d399", held:40, attended:29, absent:11, percentage:73 },
    { id:3, code:"21CSC202J", name:"Object Oriented Prog.", short:"OOP",  credits:4, col:"#fbbf24", held:38, attended:35, absent:3,  percentage:92 },
    { id:4, code:"21CSC204J", name:"Computer Networks",     short:"CN",   credits:3, col:"#f87171", held:36, attended:24, absent:12, percentage:67 },
    { id:5, code:"21ENG201T", name:"Technical English",     short:"TE",   credits:2, col:"#a78bfa", held:22, attended:20, absent:2,  percentage:91 },
    { id:6, code:"21CSC203L", name:"DBMS Lab",              short:"DBMS", credits:2, col:"#38bdf8", held:18, attended:16, absent:2,  percentage:89 },
  ],
  marks: [
    { id:1, course:"Data Structures",       short:"DS",   category:"Theory", cat1:{obtained:38,max:50}, cat2:{obtained:41,max:50}, assignment:{obtained:9, max:10}, practical:{obtained:0, max:0 } },
    { id:2, course:"Probability & Stats",   short:"P&S",  category:"Theory", cat1:{obtained:29,max:50}, cat2:{obtained:32,max:50}, assignment:{obtained:8, max:10}, practical:{obtained:0, max:0 } },
    { id:3, course:"Object Oriented Prog.", short:"OOP",  category:"Theory", cat1:{obtained:40,max:50}, cat2:{obtained:43,max:50}, assignment:{obtained:10,max:10}, practical:{obtained:0, max:0 } },
    { id:4, course:"Computer Networks",     short:"CN",   category:"Theory", cat1:{obtained:25,max:50}, cat2:{obtained:30,max:50}, assignment:{obtained:7, max:10}, practical:{obtained:0, max:0 } },
    { id:5, course:"Technical English",     short:"TE",   category:"Theory", cat1:{obtained:32,max:50}, cat2:{obtained:36,max:50}, assignment:{obtained:9, max:10}, practical:{obtained:0, max:0 } },
    { id:6, course:"DBMS Lab",              short:"DBMS", category:"Lab",    cat1:{obtained:0, max:0 }, cat2:{obtained:0, max:0 }, assignment:{obtained:10,max:10}, practical:{obtained:38,max:50} },
  ],
  timetable: {
    MON: [
      { short:"DS",   full:"Data Structures",       time:"8:00"  },
      { short:"DS",   full:"Data Structures",       time:"9:00"  },
      null,
      { short:"OOP",  full:"Object Oriented Prog.", time:"11:00" },
      { short:"OOP",  full:"Object Oriented Prog.", time:"12:00" },
      null,
      { short:"PE",   full:"Physical Education",    time:"2:00"  },
    ],
    TUE: [
      { short:"P&S",  full:"Probability & Stats",   time:"8:00"  },
      { short:"P&S",  full:"Probability & Stats",   time:"9:00"  },
      null,
      { short:"CN",   full:"Computer Networks",     time:"11:00" },
      { short:"CN",   full:"Computer Networks",     time:"12:00" },
      { short:"DBMS", full:"DBMS Lab",              time:"1:00"  },
      { short:"DBMS", full:"DBMS Lab",              time:"2:00"  },
    ],
    WED: [
      { short:"DS",   full:"Data Structures",       time:"8:00"  },
      { short:"TE",   full:"Technical English",     time:"9:00"  },
      null,
      { short:"OOP",  full:"Object Oriented Prog.", time:"11:00" },
      { short:"P&S",  full:"Probability & Stats",   time:"12:00" },
      null, null,
    ],
    THU: [
      { short:"CN",   full:"Computer Networks",     time:"8:00"  },
      { short:"CN",   full:"Computer Networks",     time:"9:00"  },
      null,
      { short:"DS",   full:"Data Structures",       time:"11:00" },
      { short:"OOP",  full:"Object Oriented Prog.", time:"12:00" },
      null,
      { short:"PE",   full:"Physical Education",    time:"2:00"  },
    ],
    FRI: [
      { short:"P&S",  full:"Probability & Stats",   time:"8:00"  },
      { short:"DS",   full:"Data Structures",       time:"9:00"  },
      null,
      { short:"TE",   full:"Technical English",     time:"11:00" },
      { short:"CN",   full:"Computer Networks",     time:"12:00" },
      null, null,
    ],
    SAT: [
      { short:"DBMS", full:"DBMS Lab",              time:"8:00"  },
      { short:"DBMS", full:"DBMS Lab",              time:"9:00"  },
      null, null, null, null, null,
    ],
  },
};

// ── localStorage cache ─────────────────────────────────────────
const CACHE_KEY = "knowit_v2_cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.ts ?? 0) > CACHE_TTL) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, ts: Date.now() }));
  } catch { /* storage quota exceeded — ignore */ }
}

export function clearCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
}

// ── Hook ───────────────────────────────────────────────────────
export function useStudentData(enabled) {
  const [attendance, setAttendance] = useState(MOCK.attendance);
  const [marks,      setMarks]      = useState(MOCK.marks);
  const [timetable,  setTimetable]  = useState(MOCK.timetable);

  const [isSyncing,  setIsSyncing]  = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncError,  setSyncError]  = useState(null);
  const [isLive,     setIsLive]     = useState(false);

  const initialised = useRef(false);

  // Apply a syncAll response ─────────────────────────────────
  const apply = useCallback((res) => {
    let anyLive = false;

    if (res.attendance?.success && Array.isArray(res.attendance.data) && res.attendance.data.length > 0) {
      setAttendance(res.attendance.data);
      anyLive = true;
    }
    if (res.marks?.success && Array.isArray(res.marks.data) && res.marks.data.length > 0) {
      setMarks(res.marks.data);
      anyLive = true;
    }
    if (res.timetable?.success && res.timetable.data &&
        Object.keys(res.timetable.data).length > 0) {
      setTimetable(res.timetable.data);
      anyLive = true;
    }

    if (anyLive) {
      setIsLive(true);
      setLastSynced(new Date(res.fetchedAt ?? Date.now()));
      writeCache({
        attendance: res.attendance,
        marks:      res.marks,
        timetable:  res.timetable,
        fetchedAt:  res.fetchedAt,
      });
    }
  }, []);

  // Manual / automatic sync ─────────────────────────────────
  const sync = useCallback(async () => {
    if (!enabled || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const res = await syncAll();
      apply(res);
    } catch (err) {
      let msg;
      if (err instanceof ApiError) {
        if (err.code === "NETWORK_ERROR") {
          msg = "Backend unreachable — showing demo data";
        } else if (err.status === 401) {
          msg = "Session expired — please log in again";
        } else {
          msg = err.message ?? "Sync failed";
        }
      } else {
        msg = "Sync failed — showing demo data";
      }
      setSyncError(msg);
    } finally {
      setIsSyncing(false);
    }
  }, [enabled, isSyncing, apply]);

  // Initialise on login ─────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      // Reset on logout
      initialised.current = false;
      setAttendance(MOCK.attendance);
      setMarks(MOCK.marks);
      setTimetable(MOCK.timetable);
      setIsLive(false);
      setLastSynced(null);
      setSyncError(null);
      return;
    }

    if (initialised.current) return;
    initialised.current = true;

    // 1. Hydrate from cache immediately (instant render)
    const cached = readCache();
    if (cached) {
      apply({
        attendance: cached.attendance,
        marks:      cached.marks,
        timetable:  cached.timetable,
        fetchedAt:  cached.fetchedAt,
      });
    }

    // 2. Always follow with a live fetch
    sync();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { attendance, marks, timetable, isSyncing, lastSynced, syncError, isLive, sync };
}
