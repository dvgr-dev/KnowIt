// src/routes/auth.routes.js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me } from "../controllers/auth.controller.js";
import { requireAuth, asyncHandler } from "../middleware/auth.middleware.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, error: "Too many login attempts. Wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login",  loginLimiter, asyncHandler(login));
router.post("/logout", requireAuth,  asyncHandler(logout));
router.get ("/me",     requireAuth,  asyncHandler(me));

export default router;
