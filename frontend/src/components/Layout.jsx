import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth }  from "../context/AuthContext.jsx";
import { attColor } from "./ui/index.jsx";

// ── Navigation items ──────────────────────────────────────────
const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
  },
  {
    to: "/timetable",
    label: "Timetable",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to: "/marks",
    label: "Marks",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    ),
  },
  {
    to: "/cgpa",
    label: "CGPA Calculator",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
        <polyline points="16,7 22,7 22,13"/>
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  "/dashboard":  "Dashboard",
  "/attendance": "Attendance",
  "/timetable":  "Timetable",
  "/marks":      "Marks & Grades",
  "/cgpa":       "CGPA Calculator",
  "/profile":    "Profile",
};

// ── Student card in sidebar ───────────────────────────────────
function StudentCard({ user }) {
  const initials = (user?.name ?? "?")
    .split(" ")
    .filter(Boolean)
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-hover border border-bd-sub rounded-xl p-3 my-2.5">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-lg bg-sky/10 border border-sky/20 flex-shrink-0
                        flex items-center justify-center text-[11px] font-bold text-sky">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold truncate leading-tight">
            {user?.name ?? "Student"}
          </div>
          <div className="font-mono text-[9px] text-tx-3 mt-0.5 truncate">
            {user?.regNo ?? "—"}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-tx-2 truncate">{user?.sem ?? ""}</span>
        {user?.section && (
          <span className="bg-sky/10 text-sky text-[9.5px] font-semibold
                           px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {user.section}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Sidebar content ───────────────────────────────────────────
function SidebarContent({ overallAtt, onNavClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full px-2 overflow-y-auto scrollbar-thin">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 py-5 border-b border-bd-sub flex-shrink-0">
        <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0
                        shadow-[0_0_12px_rgba(56,189,248,0.2)]">
          <img src="/logo.png" alt="KnowIt" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-display font-extrabold text-[15px] tracking-tight leading-tight">
            KnowIt
          </div>
          <div className="text-[9px] text-tx-4 uppercase tracking-widest">Academia</div>
        </div>
      </div>

      {/* Student chip */}
      <StudentCard user={user} />

      {/* Nav */}
      <div className="flex-1">
        <div className="text-[9.5px] font-display font-bold text-tx-4
                        uppercase tracking-widest px-3 py-3">
          Navigation
        </div>

        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `nav-item mb-0.5 ${isActive ? "active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <span className={`flex-shrink-0 transition-opacity duration-150
                                  ${isActive ? "opacity-90" : "opacity-45"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="h-px bg-bd-sub mx-2 my-2" />

        {/* Profile link */}
        <NavLink
          to="/profile"
          onClick={onNavClick}
          className={({ isActive }) => `nav-item mb-0.5 ${isActive ? "active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <span className={`flex-shrink-0 transition-opacity duration-150
                                ${isActive ? "opacity-90" : "opacity-45"}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.75"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <span>Profile</span>
            </>
          )}
        </NavLink>
      </div>

      {/* Bottom — attendance + logout */}
      <div className="border-t border-bd-sub pt-3 mt-2 pb-3 flex-shrink-0">
        {/* Overall attendance mini-bar */}
        <div className="px-3 mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-tx-3">Overall Attendance</span>
            <span className="font-mono font-bold text-[11.5px]"
              style={{ color: attColor(overallAtt) }}>
              {overallAtt}%
            </span>
          </div>
          <div className="h-1 bg-bd-def rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallAtt}%`,
                background: attColor(overallAtt),
                boxShadow: `0 0 6px ${attColor(overallAtt)}60`,
              }}
            />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="nav-item text-tx-3 hover:text-red-400 hover:bg-red-900/10 w-full"
        >
          <span className="opacity-50 flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.75"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Top navigation bar ────────────────────────────────────────
function TopNav({ isSyncing, onMenuClick }) {
  const { user }   = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const title      = PAGE_TITLES[location.pathname] ?? "KnowIt";
  const initials   = (user?.name ?? "?")
    .split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[220px] h-14 z-40
                       flex items-center justify-between px-5
                       bg-surf/80 backdrop-blur-xl border-b border-bd-sub">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger (mobile only) */}
        <button
          className="lg:hidden w-8 h-8 rounded-lg border border-bd-def bg-raised
                     flex items-center justify-center text-tx-2
                     hover:bg-hover hover:text-tx-1 transition-all flex-shrink-0"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-display font-bold text-[14.5px] tracking-tight truncate">
            {title}
          </h2>
          {user?.dept && (
            <>
              <span className="text-bd-str hidden sm:block flex-shrink-0">·</span>
              <span className="text-xs text-tx-3 hidden sm:block truncate max-w-[180px]">
                {user.dept}
              </span>
            </>
          )}
        </div>

        {/* Sync spinner */}
        {isSyncing && (
          <div className="w-4 h-4 rounded-full border-2 border-sky/20 border-t-sky
                          animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-mono text-[11px] text-tx-3 hidden sm:block">{date}</span>
        <div className="w-px h-4 bg-bd-def hidden sm:block" />

        {/* Avatar → Profile */}
        <button
          className="flex items-center gap-2 group"
          onClick={() => navigate("/profile")}
          title="View profile"
        >
          <div className="w-7 h-7 rounded-lg bg-sky/10 border border-sky/20
                          flex items-center justify-center text-[9.5px] font-bold text-sky
                          group-hover:shadow-[0_0_12px_rgba(56,189,248,0.3)]
                          transition-shadow duration-150">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-[12px] font-semibold leading-tight">
              {user?.name ?? "Student"}
            </div>
            <div className="text-[10.5px] text-tx-3 leading-tight">
              {user?.campus ?? "SRM KTR"}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}

// ── Layout shell ──────────────────────────────────────────────
export default function Layout({ children, overallAtt = 0, isSyncing = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  const location = useLocation();
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-base">
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[220px]
                      bg-surf border-r border-bd-sub z-50">
        <SidebarContent overallAtt={overallAtt} onNavClick={() => {}} />
      </div>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Panel */}
          <div className="w-[240px] bg-surf border-r border-bd-def flex flex-col
                          shadow-[4px_0_24px_rgba(0,0,0,0.6)]
                          animate-[slideIn_0.2s_ease]">
            <SidebarContent
              overallAtt={overallAtt}
              onNavClick={() => setSidebarOpen(false)}
            />
          </div>
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Top nav */}
      <TopNav isSyncing={isSyncing} onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content */}
      <main className="lg:ml-[220px] pt-14 min-h-screen">
        <div className="px-5 lg:px-7 py-7 max-w-[1080px]">
          {children}
        </div>
      </main>
    </div>
  );
}
