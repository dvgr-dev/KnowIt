import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";


export default function Login() {
  const { login, loading, authError, clearError } = useAuth();
  const navigate = useNavigate();

  const [mode,     setMode]    = useState("demo"); // "live" | "demo"
  const [username, setUsername]= useState("");
  const [password, setPassword]= useState("");
  const [localErr, setLocalErr]= useState("");

  const errorMsg = localErr || authError;

  const handleModeSwitch = (m) => {
    setMode(m);
    setLocalErr("");
    clearError();
  };

  const submit = async (e) => {
    e.preventDefault();
    setLocalErr("");
    clearError();

    if (mode === "demo") {
      const { ok } = await login("demo", "demo123");
      if (ok) navigate("/dashboard", { replace: true });
      return;
    }

    if (!username.trim()) { setLocalErr("Please enter your registration number"); return; }
    if (!password)        { setLocalErr("Please enter your password"); return; }

    const { ok } = await login(username.trim(), password);
    if (ok) navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center
                    relative overflow-hidden px-5">
      {/* Grid BG */}
      <div className="noise-grid fixed inset-0 opacity-[0.22] pointer-events-none" />

      {/* Radial glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px]
                      pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-[360px] animate-fade-up">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img
              src="/logo.png"
              alt="KnowIt Logo"
              className="w-14 h-14 rounded-2xl object-cover mx-auto
                         shadow-[0_0_28px_rgba(56,189,248,0.25)]"
            />
          </div>
          <h1 className="font-display font-extrabold text-[26px] tracking-tight leading-tight">
            KnowIt
          </h1>
          <p className="text-tx-2 text-[13px] mt-1">SRM Academia · Intelligence Layer</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-bd-def rounded-2xl p-7
                        shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_120px_rgba(56,189,248,0.03)]">

          {/* Mode toggle */}
          <div className="flex p-1 mb-6 bg-raised border border-bd-sub rounded-xl">
            {[
              { id: "demo", label: "🧪  Demo Mode"  },
              { id: "live", label: "🔐  Live Login"  },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleModeSwitch(id)}
                className={`flex-1 py-2 text-[12.5px] font-semibold rounded-lg
                            transition-all duration-150
                            ${mode === id
                              ? "bg-sky text-black shadow-sky-glow"
                              : "text-tx-3 hover:text-tx-2"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} noValidate className="space-y-4">

            {mode === "live" ? (
              <>
                <div>
                  <label className="label">Registration Number</label>
                  <input
                    className="input"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setLocalErr(""); }}
                    placeholder="RA2311003010001"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    className="input"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLocalErr(""); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </>
            ) : (
              <div className="bg-sky/5 border border-sky/15 rounded-xl px-4 py-4 text-center">
                <p className="text-sm text-tx-1 font-semibold mb-1">No account needed</p>
                <p className="text-[12.5px] text-tx-2">
                  Explore KnowIt with realistic sample data.
                  <br />Switch to Live Login to use your SRM credentials.
                </p>
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="bg-red-900/20 border border-red-700/30 rounded-xl
                              px-4 py-3 text-[12.5px] text-red-400 leading-relaxed">
                {errorMsg}
              </div>
            )}

            {/* Security note for live mode */}
            {mode === "live" && !errorMsg && (
              <p className="text-[11.5px] text-tx-3 leading-relaxed">
                🔒 Your credentials are never stored. Only a temporary server-side session
                token is kept — your password never reaches the database.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full mt-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2
                                  border-black/20 border-t-black animate-spin" />
                  {mode === "live" ? "Authenticating with SRM…" : "Loading demo…"}
                </>
              ) : mode === "live" ? (
                "Sign in to KnowIt"
              ) : (
                "Enter Demo Dashboard"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-tx-4 text-[11px] mt-5 leading-relaxed">
          Unofficial · Not affiliated with SRM University
          <br />Credentials are never stored or logged
        </p>
      </div>
    </div>
  );
}
