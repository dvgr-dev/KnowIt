import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Glowing 404 */}
      <div className="font-display font-extrabold text-[96px] leading-none tracking-tighter
                      text-bd-str select-none mb-4"
        style={{ textShadow: "0 0 60px rgba(56,189,248,0.08)" }}>
        404
      </div>

      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-sky/10 border border-sky/20
                      flex items-center justify-center mb-5 mx-auto">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="#38bdf8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8"  x2="11" y2="12"/>
          <line x1="11" y1="16" x2="11.01" y2="16"/>
        </svg>
      </div>

      <h2 className="font-display font-bold text-lg text-tx-1 mb-2">
        Page not found
      </h2>
      <p className="text-sm text-tx-2 max-w-xs mb-7">
        The page you're looking for doesn't exist or was moved.
      </p>

      <div className="flex gap-3">
        <button
          className="bg-sky text-black font-semibold text-sm px-5 py-2.5 rounded-xl
                     shadow-[0_0_20px_rgba(56,189,248,0.25)]
                     hover:opacity-90 hover:-translate-y-px transition-all duration-150"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </button>
        <button
          className="border border-bd-def text-tx-2 text-sm px-5 py-2.5 rounded-xl
                     hover:bg-raised hover:text-tx-1 transition-all duration-150"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </div>
    </div>
  );
}
