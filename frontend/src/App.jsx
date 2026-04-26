import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { useStudentData }        from "./hooks/useStudentData.js";
import ErrorBoundary             from "./components/ErrorBoundary.jsx";
import Layout                    from "./components/Layout.jsx";
import Login                     from "./pages/Login.jsx";
import Dashboard                 from "./pages/Dashboard.jsx";
import Attendance                from "./pages/Attendance.jsx";
import Timetable                 from "./pages/Timetable.jsx";
import Marks                     from "./pages/Marks.jsx";
import CGPACalculator            from "./pages/CGPACalculator.jsx";
import Profile                   from "./pages/Profile.jsx";
import NotFound                  from "./pages/NotFound.jsx";

// ── Protected route guard ─────────────────────────────────────
function ProtectedRoute({ children }) {
  const { loggedIn } = useAuth();
  const location     = useLocation();
  if (!loggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// ── Dashboard shell — owns data fetching ──────────────────────
function DashboardShell() {
  const { loggedIn } = useAuth();

  const {
    attendance, marks, timetable,
    isSyncing, lastSynced, syncError, isLive, sync,
  } = useStudentData(loggedIn);

  // Overall attendance for sidebar progress bar
  const totalHeld = attendance.reduce((s, a) => s + (a.held     ?? 0), 0);
  const totalAtt  = attendance.reduce((s, a) => s + (a.attended ?? 0), 0);
  const overallAtt = totalHeld > 0 ? Math.round(totalAtt / totalHeld * 100) : 0;

  // Shared props passed to every data page
  const dataProps = {
    attendance,
    marks,
    timetable,
    isSyncing,
    lastSynced,
    syncError,
    isLive,
    onSync: sync,
  };

  return (
    <Layout overallAtt={overallAtt} isSyncing={isSyncing}>
      <ErrorBoundary>
        <Routes>
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard      {...dataProps} />} />
          <Route path="attendance"    element={<Attendance     {...dataProps} />} />
          <Route path="timetable"     element={<Timetable      {...dataProps} />} />
          <Route path="marks"         element={<Marks          {...dataProps} />} />
          <Route path="cgpa"          element={<CGPACalculator attendance={attendance} marks={marks} />} />
          <Route path="profile"       element={<Profile        {...dataProps} />} />
          <Route path="*"             element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}

// ── Root routes ───────────────────────────────────────────────
function AppRoutes() {
  const { loggedIn } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={loggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected dashboard shell handles all /dashboard, /attendance etc. */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}
