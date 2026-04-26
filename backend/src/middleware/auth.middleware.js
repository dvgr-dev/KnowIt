// src/middleware/auth.middleware.js
export function requireAuth(req, res, next) {
  if (!req.session?.srmCookies) {
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
      code: "SESSION_EXPIRED",
    });
  }
  next();
}

export function asyncHandler(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
}
