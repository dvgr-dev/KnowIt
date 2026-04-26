// src/controllers/data.controller.js
import {
  fetchAttendance,
  fetchMarks,
  fetchTimetable,
} from "../services/academia.service.js";

const ts = () => new Date().toISOString();

export async function attendance(req, res) {
  const data = await fetchAttendance(req.session.srmCookies);
  return res.json({ success: true, data, fetchedAt: ts() });
}

export async function marks(req, res) {
  const data = await fetchMarks(req.session.srmCookies);
  return res.json({ success: true, data, fetchedAt: ts() });
}

export async function timetable(req, res) {
  const data = await fetchTimetable(req.session.srmCookies);
  return res.json({ success: true, data, fetchedAt: ts() });
}

// Parallel sync — all three in one request
export async function syncAll(req, res) {
  const cookies = req.session.srmCookies;

  const [attResult, marksResult, ttResult] = await Promise.allSettled([
    fetchAttendance(cookies),
    fetchMarks(cookies),
    fetchTimetable(cookies),
  ]);

  const wrap = (r) =>
    r.status === "fulfilled"
      ? { success: true,  data: r.value }
      : { success: false, error: r.reason?.message ?? "Fetch failed" };

  return res.json({
    success:    true,
    fetchedAt:  ts(),
    attendance: wrap(attResult),
    marks:      wrap(marksResult),
    timetable:  wrap(ttResult),
  });
}
