// academia.service.js
// Uses realistic mock data — replace with real SRM API when available

// ── Auth ─────────────────────────────────────────────────────
export async function loginUser(username, password) {
  // Demo login check
  if (username === "demo" && password === "demo123") {
    return { cookies: "demo-session-cookie" };
  }
  // Simulate wrong password
  throw new Error("Invalid credentials. Use demo / demo123 for now.");
}

export async function fetchUserInfo(cookies) {
  return {
    name:    "Divagar S",
    regNo:   "RA2311003010520",
    dept:    "B.Tech – Computer Science & Engineering",
    program: "B.Tech",
    sem:     "4th Semester",
    section: "SB-202",
    campus:  "SRM KTR",
    email:   "divagar@srmist.edu.in",
  };
}

// ── Mock Data ─────────────────────────────────────────────────
export async function fetchAttendance(cookies) {
  return [
    { id:1, code:"21CSC201J", name:"Data Structures",       short:"DS",   credits:4, col:"#818cf8", held:42, attended:38, absent:4,  percentage:90 },
    { id:2, code:"21MAB201T", name:"Probability & Stats",   short:"P&S",  credits:4, col:"#34d399", held:40, attended:29, absent:11, percentage:73 },
    { id:3, code:"21CSC202J", name:"Object Oriented Prog.", short:"OOP",  credits:4, col:"#fbbf24", held:38, attended:35, absent:3,  percentage:92 },
    { id:4, code:"21CSC204J", name:"Computer Networks",     short:"CN",   credits:3, col:"#f87171", held:36, attended:24, absent:12, percentage:67 },
    { id:5, code:"21ENG201T", name:"Technical English",     short:"TE",   credits:2, col:"#a78bfa", held:22, attended:20, absent:2,  percentage:91 },
    { id:6, code:"21CSC203L", name:"DBMS Lab",              short:"DBMS", credits:2, col:"#38bdf8", held:18, attended:16, absent:2,  percentage:89 },
  ];
}

export async function fetchMarks(cookies) {
  return [
    { id:1, course:"Data Structures",       short:"DS",   category:"Theory", cat1:{obtained:38,max:50}, cat2:{obtained:41,max:50}, assignment:{obtained:9, max:10}, practical:{obtained:0, max:0 } },
    { id:2, course:"Probability & Stats",   short:"P&S",  category:"Theory", cat1:{obtained:29,max:50}, cat2:{obtained:32,max:50}, assignment:{obtained:8, max:10}, practical:{obtained:0, max:0 } },
    { id:3, course:"Object Oriented Prog.", short:"OOP",  category:"Theory", cat1:{obtained:40,max:50}, cat2:{obtained:43,max:50}, assignment:{obtained:10,max:10}, practical:{obtained:0, max:0 } },
    { id:4, course:"Computer Networks",     short:"CN",   category:"Theory", cat1:{obtained:25,max:50}, cat2:{obtained:30,max:50}, assignment:{obtained:7, max:10}, practical:{obtained:0, max:0 } },
    { id:5, course:"Technical English",     short:"TE",   category:"Theory", cat1:{obtained:32,max:50}, cat2:{obtained:36,max:50}, assignment:{obtained:9, max:10}, practical:{obtained:0, max:0 } },
    { id:6, course:"DBMS Lab",              short:"DBMS", category:"Lab",    cat1:{obtained:0, max:0 }, cat2:{obtained:0, max:0 }, assignment:{obtained:10,max:10}, practical:{obtained:38,max:50} },
  ];
}

export async function fetchTimetable(cookies) {
  return {
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
  };
}