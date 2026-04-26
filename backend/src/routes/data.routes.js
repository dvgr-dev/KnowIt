// src/routes/data.routes.js
import { Router } from "express";
import { requireAuth, asyncHandler } from "../middleware/auth.middleware.js";
import {
  attendance,
  marks,
  timetable,
  syncAll,
} from "../controllers/data.controller.js";

const router = Router();

// All data routes require auth
router.use(requireAuth);

router.get("/attendance", asyncHandler(attendance));
router.get("/marks",      asyncHandler(marks));
router.get("/timetable",  asyncHandler(timetable));
router.get("/sync",       asyncHandler(syncAll));

export default router;
