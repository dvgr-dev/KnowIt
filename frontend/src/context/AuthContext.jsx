import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { login as apiLogin, logout as apiLogout, getMe, ApiError } from "../services/api.js";

// ── Demo user ─────────────────────────────────────────────────
const DEMO_USER = {
  name:    "Divagar S",
  regNo:   "RA2311003010520",
  dept:    "B.Tech – Computer Science & Engineering",
  program: "B.Tech",
  sem:     "4th Semester",
  section: "SB-202",
  campus:  "SRM KTR",
  email:   "divagar@srmist.edu.in",
  demo:    true,
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [loggedIn,  setLoggedIn]  = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading,   setLoading]   = useState(false);

  // ── Login ──────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setAuthError("");

    // Demo shortcut — no backend call
    if (username.toLowerCase() === "demo" && password === "demo123") {
      await new Promise(r => setTimeout(r, 800)); // simulate latency
      setUser(DEMO_USER);
      setLoggedIn(true);
      setLoading(false);
      return { ok: true };
    }

    // Live login
    try {
      const res = await apiLogin(username, password);
      const info = res.userInfo ?? { name: username, regNo: username };
      setUser(info);
      setLoggedIn(true);

      // Try to enrich with full profile (non-blocking)
      getMe().then(r => { if (r?.data) setUser(r.data); }).catch(() => {});

      return { ok: true };
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed — try again";
      setAuthError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (!user?.demo) {
      try { await apiLogout(); } catch { /* ignore — session may already be gone */ }
    }
    setUser(null);
    setLoggedIn(false);
    setAuthError("");
    localStorage.removeItem("knowit_cache");
  }, [user]);

  // ── Clear stale auth errors when user types ────────────────
  const clearError = useCallback(() => setAuthError(""), []);

  return (
    <AuthContext.Provider value={{
      user, loggedIn, authError, loading,
      login, logout, setUser, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
