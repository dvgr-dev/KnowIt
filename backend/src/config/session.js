// src/config/session.js
import session from "express-session";

const IS_PROD = process.env.NODE_ENV === "production";

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  name: "knowit.sid",
  cookie: {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? "none" : "lax",
    maxAge: 6 * 60 * 60 * 1000, // 6 hours
  },
});
