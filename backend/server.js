// server.js — KnowIt Backend Entry Point
import "dotenv/config";
import express  from "express";
import cors     from "cors";
import helmet   from "helmet";
import morgan   from "morgan";

import { sessionMiddleware } from "./src/config/session.js";
import authRoutes            from "./src/routes/auth.routes.js";
import dataRoutes            from "./src/routes/data.routes.js";

const app  = express();
const PORT = process.env.PORT ?? 4000;
const IS_PROD = process.env.NODE_ENV === "production";

// ── Security ──────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  credentials: true,
}));

// ── Middleware ────────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));
app.use(morgan(IS_PROD ? "combined" : "dev"));
app.use(sessionMiddleware);

// ── Routes ────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);
app.use("/api/auth", authRoutes);
app.use("/api",      dataRoutes);

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[KnowIt]", err.message);

  const status =
    /invalid credentials|not found|password|username/i.test(err.message) ? 401 :
    /required/i.test(err.message)                                         ? 400 : 500;

  res.status(status).json({
    success: false,
    error:   err.message ?? "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`\n  ✦ KnowIt API   →  http://localhost:${PORT}`);
  console.log(`  ✦ Environment  →  ${process.env.NODE_ENV ?? "development"}`);
  console.log(`  ✦ Client       →  ${process.env.CLIENT_ORIGIN ?? "http://localhost:5173"}\n`);
});
