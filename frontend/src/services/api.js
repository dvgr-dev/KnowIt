// src/services/api.js
// In dev  → Vite proxy rewrites  /api  →  http://localhost:4000
// In prod → VITE_API_URL points to the deployed backend
const BASE =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api";

export class ApiError extends Error {
  constructor(message, status = 500, code = "") {
    super(message);
    this.name   = "ApiError";
    this.status = status;
    this.code   = code;
  }
}

async function request(path, opts = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...opts.headers },
      ...opts,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the backend server. Is it running on port 4000?",
      0,
      "NETWORK_ERROR"
    );
  }

  let body;
  try   { body = await res.json(); }
  catch { body = { error: `HTTP ${res.status}` }; }

  if (!res.ok) {
    throw new ApiError(
      body?.error ?? `Request failed (${res.status})`,
      res.status,
      body?.code ?? ""
    );
  }
  return body;
}

// ── Auth ──────────────────────────────────────────────────────
export const login  = (username, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });

export const logout = () =>
  request("/auth/logout", { method: "POST" });

export const getMe  = () => request("/auth/me");

// ── Data ──────────────────────────────────────────────────────
export const getAttendance = () => request("/attendance");
export const getMarks      = () => request("/marks");
export const getTimetable  = () => request("/timetable");
export const syncAll       = () => request("/sync");
export const healthCheck   = () => request("/health");
