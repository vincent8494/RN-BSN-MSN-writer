// Database layer — libsql client. Local dev uses the SQLite file in server/;
// production uses Turso via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./env.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const url = ENV.TURSO_DATABASE_URL || `file:${path.join(dir, "data.sqlite")}`;

if (ENV.IS_PROD && !ENV.TURSO_DATABASE_URL && ENV.IS_SERVERLESS) {
  throw new Error("TURSO_DATABASE_URL is required in production — a serverless filesystem cannot persist SQLite.");
}

export const client = createClient({
  url,
  authToken: ENV.TURSO_AUTH_TOKEN || undefined,
});

// Thin async helpers (libsql's execute() with better-sqlite3-like results).
export async function all(sql, args = []) {
  return (await client.execute({ sql, args })).rows;
}
export async function get(sql, args = []) {
  return (await client.execute({ sql, args })).rows[0];
}
export async function run(sql, args = []) {
  const r = await client.execute({ sql, args });
  return {
    changes: r.rowsAffected,
    lastInsertRowid: r.lastInsertRowid === undefined ? undefined : Number(r.lastInsertRowid),
  };
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    pass_salt  TEXT NOT NULL,
    pass_hash  TEXT NOT NULL,
    level      TEXT DEFAULT '',
    role       TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id             TEXT PRIMARY KEY,
    user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guest_email    TEXT DEFAULT '',
    title          TEXT NOT NULL,
    description    TEXT DEFAULT '',
    paper_type     TEXT DEFAULT '',
    academic_level TEXT DEFAULT '',
    school         TEXT DEFAULT '',
    subject        TEXT DEFAULT '',
    pages          INTEGER NOT NULL DEFAULT 1,
    sources        INTEGER NOT NULL DEFAULT 0,
    deadline       TEXT NOT NULL,
    coupon         TEXT DEFAULT '',
    total          REAL NOT NULL,
    status         TEXT NOT NULL DEFAULT 'Awaiting Payment',
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name    TEXT NOT NULL,
    email        TEXT NOT NULL,
    phone        TEXT DEFAULT '',
    service_type TEXT DEFAULT '',
    message      TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method      TEXT NOT NULL,
    reference   TEXT DEFAULT '',
    amount      REAL NOT NULL,
    status      TEXT NOT NULL DEFAULT 'submitted',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    verified_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS kv (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key   TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    reset INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`,
];

// Additive migrations (ALTER fails harmlessly when the column already exists).
const MIGRATIONS = [
  "ALTER TABLE orders ADD COLUMN service TEXT DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN slides INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE payments ADD COLUMN gateway_id TEXT DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN access_token TEXT DEFAULT ''",
];

async function init() {
  if (url.startsWith("file:")) {
    try {
      await client.execute("PRAGMA journal_mode = WAL");
      await client.execute("PRAGMA foreign_keys = ON");
    } catch {}
  }
  await client.batch(SCHEMA, "write");
  for (const sql of MIGRATIONS) {
    try {
      await client.execute(sql);
    } catch {}
  }
}

// Resolves once the schema exists — awaited before serving any request.
export const dbReady = init();

// Monotonic order counter — a single atomic upsert so concurrent serverless
// invocations can never hand out the same number.
export async function nextOrderNumber() {
  const row = await get(
    `INSERT INTO kv (key, value) VALUES ('order_counter', '10236')
     ON CONFLICT(key) DO UPDATE SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT)
     RETURNING CAST(value AS INTEGER) - 1 AS n`
  );
  return row.n;
}
