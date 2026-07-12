import crypto from "node:crypto";
import { get, run } from "./db.js";
import { ENV } from "./env.js";

const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64, SCRYPT_OPTS).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const candidate = crypto.scryptSync(password, salt, 64, SCRYPT_OPTS);
  const stored = Buffer.from(hash, "hex");
  return stored.length === candidate.length && crypto.timingSafeEqual(candidate, stored);
}

// ---------------------------------------------------------------------------
// Sessions — opaque random tokens in an HttpOnly cookie.
// ---------------------------------------------------------------------------
const COOKIE = "rbw_session";

// No background timers in serverless — purge opportunistically on auth events.
async function purgeExpired() {
  const now = Date.now();
  try {
    await run("DELETE FROM sessions WHERE expires_at < ?", [now]);
    await run("DELETE FROM rate_limits WHERE reset < ?", [now - 3600e3]);
  } catch {}
}

export async function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + ENV.SESSION_DAYS * 86400e3;
  await run("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", [token, userId, expiresAt]);
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.IS_PROD,
    maxAge: ENV.SESSION_DAYS * 86400e3,
    path: "/",
  });
  await purgeExpired();
}

export async function destroySession(req, res) {
  const token = req.cookies?.[COOKIE];
  if (token) await run("DELETE FROM sessions WHERE token = ?", [token]);
  res.clearCookie(COOKIE, { path: "/" });
}

export function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, level: u.level, role: u.role };
}

// Attaches req.user when a valid session cookie is present.
export async function sessionMiddleware(req, _res, next) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    const row = await get(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
      [token, Date.now()]
    );
    if (row) req.user = row;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Please sign in." });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  next();
}

// Fixed-window rate limiter (per IP + bucket), stored in the database so the
// limit holds across serverless instances. The upsert is atomic: concurrent
// requests each get an accurate count.
export function rateLimit(bucket, max, windowMs) {
  return async (req, res, next) => {
    const key = `${bucket}:${req.ip}`;
    const now = Date.now();
    const row = await get(
      `INSERT INTO rate_limits (key, count, reset) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN ? > rate_limits.reset THEN 1 ELSE rate_limits.count + 1 END,
         reset = CASE WHEN ? > rate_limits.reset THEN ? ELSE rate_limits.reset END
       RETURNING count`,
      [key, now + windowMs, now, now, now + windowMs]
    );
    if (row.count > max) {
      return res.status(429).json({ error: "Too many requests. Please try again shortly." });
    }
    next();
  };
}
