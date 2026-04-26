// src/controllers/auth.controller.js
import { loginUser, fetchUserInfo } from "../services/academia.service.js";

export async function login(req, res) {
  const { username, password } = req.body ?? {};

  if (!username?.trim() || !password) {
    return res.status(400).json({
      success: false,
      error: "Username and password are required.",
    });
  }

  // Destroy any stale session
  if (req.session.srmCookies) {
    await new Promise((r) => req.session.regenerate(r));
  }

  const { cookies } = await loginUser(username.trim(), password);

  // Store SRM cookies server-side ONLY — never exposed to browser
  req.session.srmCookies = cookies;
  req.session.loginAt    = Date.now();
  req.session.username   = username.trim();

  // Best-effort: fetch profile right after login
  let userInfo = null;
  try {
    userInfo = await fetchUserInfo(cookies);
    req.session.userInfo = userInfo;
  } catch {
    // non-fatal
  }

  return res.json({
    success: true,
    message: "Authenticated successfully",
    userInfo: userInfo ?? { name: username.trim(), regNo: username.trim() },
  });
}

export async function logout(req, res) {
  await new Promise((r) => req.session.destroy(r));
  res.clearCookie("knowit.sid");
  return res.json({ success: true, message: "Logged out" });
}

export async function me(req, res) {
  if (req.session.userInfo) {
    return res.json({ success: true, data: req.session.userInfo });
  }
  try {
    const data = await fetchUserInfo(req.session.srmCookies);
    req.session.userInfo = data;
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
