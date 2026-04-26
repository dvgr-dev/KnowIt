/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["DM Sans",   "system-ui",  "sans-serif"],
        display: ["Syne",      "sans-serif"],
        mono:    ["DM Mono",   "Consolas",   "monospace"],
      },
      colors: {
        // Surface scale — matte black
        base:   "#050508",
        surf:   "#09090e",
        card:   "#0e0e15",
        raised: "#13131c",
        hover:  "#191922",
        // Borders
        "bd-sub":  "#181825",
        "bd-def":  "#22222f",
        "bd-str":  "#2e2e3f",
        "bd-act":  "#3c3c50",
        // Accent — sky blue
        sky: {
          DEFAULT: "#38bdf8",
          dim:     "rgba(56,189,248,0.12)",
          glow:    "rgba(56,189,248,0.22)",
          deep:    "#0ea5e9",
          pale:    "#7dd3fc",
        },
        // Text
        "tx-1": "#efeff5",
        "tx-2": "#85859a",
        "tx-3": "#44445a",
        "tx-4": "#26263a",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
        shimmer: {
          from: { backgroundPosition: "-400px 0" },
          to:   { backgroundPosition:  "400px 0" },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)"     },
        },
        pulse: {
          "0%, 100%": { opacity: "1"  },
          "50%":      { opacity: ".4" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up":  "fadeUp 0.22s ease forwards",
        shimmer:    "shimmer 1.5s ease-in-out infinite",
        "slide-in": "slideIn 0.2s ease",
        pulse:      "pulse 2s ease-in-out infinite",
        spin:       "spin 0.7s linear infinite",
      },
      boxShadow: {
        "sky-glow": "0 0 20px rgba(56,189,248,0.25)",
        "sky-lg":   "0 0 40px rgba(56,189,248,0.35)",
        card:       "0 4px 24px rgba(0,0,0,0.5)",
        "card-lg":  "0 12px 40px rgba(0,0,0,0.7)",
      },
    },
  },
  plugins: [],
};
