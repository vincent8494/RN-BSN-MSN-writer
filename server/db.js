// Database layer — libsql client. Local dev uses the SQLite file in server/;
// production uses Turso via TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
import { createClient } from "@libsql/client";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./env.js";
import {
  DEFAULT_SETTINGS, CONTENT_SEED,
  DEFAULT_PRICING, PRICE_LEVELS, DEADLINE_KEYS, SERVICE_KEYS,
} from "./seed.js";

// import.meta.url is unavailable when bundled to CJS (Netlify Functions) —
// serverless always uses Turso, so the file path only matters locally.
let dir;
try {
  dir = path.dirname(fileURLToPath(import.meta.url));
} catch {
  dir = path.join(process.cwd(), "server");
}
const url = ENV.TURSO_DATABASE_URL || `file:${path.join(dir, "data.sqlite")}`;

// Lazy — a file: client would try to open the SQLite file immediately, which
// must not happen at module scope on a read-only serverless filesystem; the
// misconfiguration check in init() has to run first.
let clientInstance = null;
function client() {
  if (!clientInstance) {
    clientInstance = createClient({ url, authToken: ENV.TURSO_AUTH_TOKEN || undefined });
  }
  return clientInstance;
}

// Thin async helpers (libsql's execute() with better-sqlite3-like results).
export async function all(sql, args = []) {
  return (await client().execute({ sql, args })).rows;
}
export async function get(sql, args = []) {
  return (await client().execute({ sql, args })).rows[0];
}
export async function run(sql, args = []) {
  const r = await client().execute({ sql, args });
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
  // Admin-managed public content (testimonials / faq / samples). Item fields
  // are stored as JSON in `data`; `sort` drives display order.
  `CREATE TABLE IF NOT EXISTS content (
    kind TEXT NOT NULL,
    id   TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL,
    PRIMARY KEY (kind, id)
  )`,
  // Order files. kind 'requirement' = customer's instructions/source files;
  // 'deliverable' = the completed work uploaded by the writer/admin. Metadata
  // here; the bytes live in attachment_data, keyed by this id.
  `CREATE TABLE IF NOT EXISTS attachments (
    id          TEXT PRIMARY KEY,
    order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    kind        TEXT NOT NULL,
    filename    TEXT NOT NULL,
    mime        TEXT DEFAULT '',
    size        INTEGER NOT NULL DEFAULT 0,
    uploaded_by TEXT DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  // File bytes, kept out of the metadata table so listing stays light.
  `CREATE TABLE IF NOT EXISTS attachment_data (
    id    TEXT PRIMARY KEY,
    bytes BLOB NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)`,
  `CREATE INDEX IF NOT EXISTS idx_content_kind ON content(kind, sort)`,
  `CREATE INDEX IF NOT EXISTS idx_attachments_order ON attachments(order_id)`,
];

// Additive migrations (ALTER fails harmlessly when the column already exists).
const MIGRATIONS = [
  "ALTER TABLE orders ADD COLUMN service TEXT DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN slides INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE payments ADD COLUMN gateway_id TEXT DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN access_token TEXT DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN customer_name TEXT DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN customer_phone TEXT DEFAULT ''",
];

async function init() {
  if (ENV.IS_SERVERLESS && !ENV.TURSO_DATABASE_URL) {
    throw new Error("TURSO_DATABASE_URL is required in production — a serverless filesystem cannot persist SQLite.");
  }
  if (url.startsWith("file:")) {
    try {
      await client().execute("PRAGMA journal_mode = WAL");
      await client().execute("PRAGMA foreign_keys = ON");
    } catch {}
  }
  await client().batch(SCHEMA, "write");
  for (const sql of MIGRATIONS) {
    try {
      await client().execute(sql);
    } catch {}
  }
  await seedContent();
}

// Seed default content once. Each kind seeds independently only when empty, so
// admin edits and deletions are never overwritten on the next boot.
async function seedContent() {
  for (const [kind, items] of Object.entries(CONTENT_SEED)) {
    const existing = await get("SELECT COUNT(*) AS n FROM content WHERE kind = ?", [kind]);
    if (Number(existing.n) > 0) continue;
    let sort = 0;
    for (const item of items) {
      const { id, ...fields } = item;
      await run("INSERT INTO content (kind, id, sort, data) VALUES (?, ?, ?, ?)", [
        kind,
        id,
        typeof fields.order === "number" ? fields.order : ++sort,
        JSON.stringify(fields),
      ]);
    }
  }
  const s = await get("SELECT value FROM kv WHERE key = 'site_settings'");
  if (!s) {
    await run("INSERT INTO kv (key, value) VALUES ('site_settings', ?)", [JSON.stringify(DEFAULT_SETTINGS)]);
  }
  const p = await get("SELECT value FROM kv WHERE key = 'pricing'");
  if (!p) {
    await run("INSERT INTO kv (key, value) VALUES ('pricing', ?)", [JSON.stringify(DEFAULT_PRICING)]);
  }
}

const num = (v, fallback = 0) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : fallback);

// Coerce a pricing object into a complete, safe shape. Every numeric slot is
// guaranteed present and non-negative, so order totals can never NaN or go
// negative regardless of what is stored. Used on both read and write.
export function normalizePricing(input) {
  const src = input && typeof input === "object" ? input : {};
  const perPage = {};
  for (const level of PRICE_LEVELS) {
    const row = src.perPage?.[level] || {};
    const defRow = DEFAULT_PRICING.perPage[level];
    perPage[level] = {};
    for (const key of DEADLINE_KEYS) perPage[level][key] = num(row[key], defRow[key]);
  }
  const serviceMultipliers = {};
  for (const key of SERVICE_KEYS) {
    serviceMultipliers[key] = num(src.serviceMultipliers?.[key], DEFAULT_PRICING.serviceMultipliers[key]);
  }
  const couponPercent = Math.min(100, Math.max(0, num(src.coupon?.percent, DEFAULT_PRICING.coupon.percent)));
  const classRates = Array.isArray(src.classRates)
    ? src.classRates.slice(0, 12).map((c, i) => ({
        id: String(c?.id || `rate-${i}`).slice(0, 60),
        school: String(c?.school ?? "").slice(0, 120),
        program: String(c?.program ?? "").slice(0, 120),
        rate: String(c?.rate ?? "").slice(0, 40),
        unit: String(c?.unit ?? "").slice(0, 40),
        alt: String(c?.alt ?? "").slice(0, 120),
        features: Array.isArray(c?.features) ? c.features.slice(0, 10).map((f) => String(f).slice(0, 120)) : [],
        popular: Boolean(c?.popular),
      }))
    : DEFAULT_PRICING.classRates;
  return {
    perPage,
    serviceMultipliers,
    pricePerSlide: num(src.pricePerSlide, DEFAULT_PRICING.pricePerSlide),
    coupon: {
      code: String(src.coupon?.code ?? DEFAULT_PRICING.coupon.code).trim().slice(0, 40),
      percent: couponPercent,
    },
    classRates,
    classNote: String(src.classNote ?? DEFAULT_PRICING.classNote).slice(0, 600),
  };
}

export async function getPricing() {
  const row = await get("SELECT value FROM kv WHERE key = 'pricing'");
  let stored = {};
  try {
    stored = row ? JSON.parse(row.value) : {};
  } catch {}
  return normalizePricing(stored);
}

export async function savePricing(next) {
  const clean = normalizePricing(next);
  await run(
    "INSERT INTO kv (key, value) VALUES ('pricing', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [JSON.stringify(clean)]
  );
  return clean;
}

// Read the site settings (merged over defaults so new keys always resolve).
export async function getSettings() {
  const row = await get("SELECT value FROM kv WHERE key = 'site_settings'");
  let stored = {};
  try {
    stored = row ? JSON.parse(row.value) : {};
  } catch {}
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(next) {
  const merged = { ...DEFAULT_SETTINGS, ...next };
  await run(
    "INSERT INTO kv (key, value) VALUES ('site_settings', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [JSON.stringify(merged)]
  );
  return merged;
}

// Return all items of a kind as {id, ...fields}, ordered.
export async function listContent(kind) {
  const rows = await all("SELECT id, sort, data FROM content WHERE kind = ? ORDER BY sort, rowid", [kind]);
  return rows.map((r) => ({ id: r.id, ...safeParse(r.data) }));
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Order attachments (requirement / deliverable file metadata)
// ---------------------------------------------------------------------------
const attachmentRow = (a) => ({
  id: a.id,
  orderId: a.order_id,
  kind: a.kind,
  filename: a.filename,
  mime: a.mime,
  size: a.size,
  uploadedBy: a.uploaded_by,
  createdAt: a.created_at,
});

export async function listAttachments(orderId) {
  const rows = await all(
    "SELECT * FROM attachments WHERE order_id = ? ORDER BY created_at, rowid",
    [orderId]
  );
  return rows.map(attachmentRow);
}

export async function getAttachment(id) {
  const a = await get("SELECT * FROM attachments WHERE id = ?", [id]);
  return a ? attachmentRow(a) : null;
}

export async function addAttachment({ id, orderId, kind, filename, mime, size, uploadedBy }) {
  await run(
    "INSERT INTO attachments (id, order_id, kind, filename, mime, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, orderId, kind, filename, mime, size, uploadedBy]
  );
}

export async function removeAttachment(id) {
  await run("DELETE FROM attachments WHERE id = ?", [id]);
}

export async function countAttachments(orderId, kind) {
  const r = await get("SELECT COUNT(*) AS n FROM attachments WHERE order_id = ? AND kind = ?", [orderId, kind]);
  return Number(r.n);
}

// Resolves once the schema exists — awaited before serving any request.
export const dbReady = init();

// Monotonic order counter — a single atomic upsert so concurrent serverless
// invocations can never hand out the same number. Numbering starts at 1000.
export async function nextOrderNumber() {
  const row = await get(
    `INSERT INTO kv (key, value) VALUES ('order_counter', '1001')
     ON CONFLICT(key) DO UPDATE SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT)
     RETURNING CAST(value AS INTEGER) - 1 AS n`
  );
  return row.n;
}
