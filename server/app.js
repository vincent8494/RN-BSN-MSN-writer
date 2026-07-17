import express from "express";
import cookieParser from "cookie-parser";
import crypto from "node:crypto";
import { ENV } from "./env.js";
import {
  get, all, run, dbReady, nextOrderNumber,
  getSettings, saveSettings, listContent, getPricing, savePricing,
  listAttachments, getAttachment, addAttachment, removeAttachment, countAttachments,
} from "./db.js";
import { CONTENT_FIELDS, SERVICE_KEYS, SERVICE_LABELS } from "./seed.js";
import { putFile, getFile, deleteFile } from "./storage.js";
import { sendOrderEmail, emailEnabled } from "./email.js";
import {
  hashPassword, verifyPassword, createSession, destroySession, publicUser,
  sessionMiddleware, requireAuth, requireAdmin, rateLimit,
} from "./auth.js";
import {
  gatewaysEnabled, stripeCreateCheckout, stripeGetSession, verifyStripeSignature,
  paypalCreateOrder, paypalCaptureOrder,
} from "./gateways.js";

export const app = express();
app.set("trust proxy", 1);

// Marks a gateway payment as verified once the GATEWAY (not the buyer) has
// authenticated it, and releases the order into production. Amount must match
// to the cent — a mismatch keeps the payment on hold for admin review.
async function finalizeGatewayPayment({ method, gatewayId, paidAmount, reference = "" }) {
  const p = await get("SELECT * FROM payments WHERE method = ? AND gateway_id = ? ORDER BY id DESC LIMIT 1", [method, gatewayId]);
  if (!p || p.status === "verified") return p ? { ok: p.status === "verified", payment: p } : { ok: false };
  const o = await get("SELECT * FROM orders WHERE id = ?", [p.order_id]);
  if (!o) return { ok: false };
  const expected = Math.round(Number(o.total) * 100);
  const received = Math.round(Number(paidAmount) * 100);
  if (received !== expected) {
    console.warn(`[pay] amount mismatch on ${p.order_id}: expected ${expected}c got ${received}c — held for review`);
    return { ok: false, mismatch: true };
  }
  await run("UPDATE payments SET status = 'verified', verified_at = datetime('now'), reference = COALESCE(NULLIF(?, ''), reference) WHERE id = ?", [reference, p.id]);
  await run("UPDATE orders SET status = 'In Progress' WHERE id = ?", [o.id]);
  console.log(`[pay] ${method} payment verified for ${o.id} ($${paidAmount})`);
  return { ok: true };
}

// Stripe webhook — registered BEFORE the JSON parser because signature
// verification needs the exact raw request body.
app.post("/api/webhooks/stripe", express.raw({ type: () => true, limit: "256kb" }), async (req, res) => {
  if (!ENV.STRIPE_WEBHOOK_SECRET) return res.status(501).json({ error: "Stripe webhook not configured." });
  const event = verifyStripeSignature(req.body.toString("utf8"), req.headers["stripe-signature"], ENV.STRIPE_WEBHOOK_SECRET);
  if (!event) return res.status(400).json({ error: "Invalid webhook signature." });
  if (event.type === "checkout.session.completed") {
    const s = event.data?.object || {};
    if (s.payment_status === "paid") {
      await finalizeGatewayPayment({
        method: "stripe",
        gatewayId: s.id,
        paidAmount: (s.amount_total || 0) / 100,
        reference: s.payment_intent || "",
      });
    }
  }
  res.json({ received: true });
});

app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());
app.use(sessionMiddleware);

// Baseline security headers.
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const clean = (v, max = 300) => String(v ?? "").trim().slice(0, max);
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const MAX_PASSWORD_LEN = 128; // scrypt cost guard — reject absurdly long inputs

// Order access: admins always; owners via their session; guest orders only
// with the order's unguessable access token (IDs are sequential and public).
function canAccessOrder(req, o) {
  if (req.user?.role === "admin") return true;
  if (o.user_id) return req.user?.id === o.user_id;
  const token = String(req.query?.t || req.body?.token || "");
  return Boolean(o.access_token) && token.length > 0 && token === o.access_token;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
app.post("/api/auth/signup", rateLimit("signup", 10, 15 * 60e3), async (req, res) => {
  const name = clean(req.body.name, 100);
  const email = clean(req.body.email, 200).toLowerCase();
  const password = String(req.body.password ?? "");
  const level = clean(req.body.level, 40);
  if (!name || !isEmail(email)) return res.status(400).json({ error: "Please provide a valid name and email." });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
  if (password.length > MAX_PASSWORD_LEN) return res.status(400).json({ error: `Password must be at most ${MAX_PASSWORD_LEN} characters.` });
  if (await get("SELECT id FROM users WHERE email = ?", [email])) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }
  const { salt, hash } = hashPassword(password);
  const info = await run(
    "INSERT INTO users (name, email, pass_salt, pass_hash, level) VALUES (?, ?, ?, ?, ?)",
    [name, email, salt, hash, level]
  );
  const user = await get("SELECT * FROM users WHERE id = ?", [info.lastInsertRowid]);
  await createSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post("/api/auth/login", rateLimit("login", 20, 15 * 60e3), async (req, res) => {
  const email = clean(req.body.email, 200).toLowerCase();
  const password = String(req.body.password ?? "").slice(0, MAX_PASSWORD_LEN);
  const user = await get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user || !verifyPassword(password, user.pass_salt, user.pass_hash)) {
    return res.status(401).json({ error: "Invalid email or password. Please try again." });
  }
  await createSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post("/api/auth/logout", async (req, res) => {
  await destroySession(req, res);
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

// Self-service password change. Hardened:
//  - requires the CURRENT password (a stolen session alone can't take over)
//  - tight rate limit (brute-forcing the current password here is throttled)
//  - revokes EVERY session for the user on success (kills hijacked sessions),
//    then issues a fresh token so the current browser stays signed in
//  - scrypt + timing-safe compare via the existing helpers
app.post("/api/auth/change-password", requireAuth, rateLimit("pwchange", 5, 15 * 60e3), async (req, res) => {
  const current = String(req.body.currentPassword ?? "").slice(0, MAX_PASSWORD_LEN);
  const next = String(req.body.newPassword ?? "");
  if (!verifyPassword(current, req.user.pass_salt, req.user.pass_hash)) {
    return res.status(401).json({ error: "Your current password is incorrect." });
  }
  if (next.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters." });
  if (next.length > MAX_PASSWORD_LEN) return res.status(400).json({ error: `New password must be at most ${MAX_PASSWORD_LEN} characters.` });
  if (next === current) return res.status(400).json({ error: "New password must be different from your current one." });
  if (next.toLowerCase() === String(req.user.email).toLowerCase()) {
    return res.status(400).json({ error: "New password must not be your email address." });
  }
  const { salt, hash } = hashPassword(next);
  await run("UPDATE users SET pass_salt = ?, pass_hash = ? WHERE id = ?", [salt, hash, req.user.id]);
  await run("DELETE FROM sessions WHERE user_id = ?", [req.user.id]);
  await createSession(res, req.user.id);
  // The env-seeded admin now self-manages: stop seedAdmin from reverting the
  // password to ADMIN_PASSWORD on the next cold start.
  if (String(req.user.email).toLowerCase() === ENV.ADMIN_EMAIL) {
    await run("INSERT INTO kv (key, value) VALUES ('admin_pw_selfmanaged', '1') ON CONFLICT(key) DO UPDATE SET value = '1'");
  }
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const DEADLINE_HOURS = { days14: 336, days7: 168, days5: 120, days3: 72, days2: 48, days1: 24, hours8: 8 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ORDER_STATUSES = ["Awaiting Payment", "Payment Under Review", "In Progress", "Completed", "Revisions", "Cancelled", "Technical"];

// ---------------------------------------------------------------------------
// Pricing — the server is the single source of truth. Client-sent totals are
// ignored; the amount is recomputed here so it cannot be tampered with.
// ---------------------------------------------------------------------------
const PAYMENT_METHODS = ["paypal", "card", "whatsapp"];

// The coupon is a first-order code: one use per account / guest email. Its code
// and percentage come from the admin-editable pricing config.
async function couponDiscount(pricing, coupon, userId, guestEmail) {
  const code = pricing.coupon.code.trim().toLowerCase();
  if (!code || String(coupon || "").trim().toLowerCase() !== code) return 0;
  let prior = null;
  if (userId) {
    prior = await get("SELECT 1 FROM orders WHERE user_id = ? AND lower(coupon) = ? AND status != 'Cancelled' LIMIT 1", [userId, code]);
  } else if (guestEmail) {
    prior = await get("SELECT 1 FROM orders WHERE guest_email = ? AND lower(coupon) = ? AND status != 'Cancelled' LIMIT 1", [guestEmail, code]);
  }
  return prior ? 0 : pricing.coupon.percent / 100;
}

// Authoritative total — computed from the live pricing config, never trusting
// the client. `pricing` is loaded once per request and passed in.
async function computeTotal(pricing, { level, deadlineKey, pages, slides, serviceKey, coupon, userId, guestEmail }) {
  const perPage = pricing.perPage[level]?.[deadlineKey] ?? 12;
  const mult = pricing.serviceMultipliers[serviceKey] ?? 1.0;
  const subtotal = perPage * pages * mult + slides * pricing.pricePerSlide;
  const total = subtotal * (1 - (await couponDiscount(pricing, coupon, userId, guestEmail)));
  return Math.round(total * 100) / 100;
}

function deadlineFromKey(key) {
  const hours = DEADLINE_HOURS[key] ?? 168;
  const d = new Date(Date.now() + hours * 3600e3);
  let out = `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
  if (hours < 24) {
    let h = d.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    out += `, ${h}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
  }
  return out;
}

const orderRow = (o) => ({
  id: o.id,
  title: o.title,
  description: o.description,
  paperType: o.paper_type,
  academicLevel: o.academic_level,
  school: o.school,
  service: o.service,
  subject: o.subject,
  pages: o.pages,
  slides: o.slides,
  sources: o.sources,
  deadline: o.deadline,
  coupon: o.coupon,
  total: o.total,
  status: o.status,
  createdAt: o.created_at,
  guestEmail: o.guest_email,
  customerName: o.customer_name || "",
  customerPhone: o.customer_phone || "",
  // Guest orders carry their own email; account orders use the account's
  // (joined as user_email on list queries).
  customerEmail: o.guest_email || o.user_email || "",
  accessToken: o.access_token || "",
  // Present on list queries (subselected); absent on single-order fetches.
  requirementCount: o.req_count != null ? Number(o.req_count) : undefined,
  deliverableCount: o.del_count != null ? Number(o.del_count) : undefined,
});

// Attachment count subselects for the order-list queries so the admin/customer
// tables can show file indicators without a request per order.
const ORDER_FILE_COUNTS = `
  (SELECT COUNT(*) FROM attachments a WHERE a.order_id = orders.id AND a.kind = 'requirement') AS req_count,
  (SELECT COUNT(*) FROM attachments a WHERE a.order_id = orders.id AND a.kind = 'deliverable') AS del_count`;

app.post("/api/orders", rateLimit("orders", 30, 15 * 60e3), async (req, res) => {
  const b = req.body || {};
  const pages = Math.min(200, Math.max(1, parseInt(b.pages, 10) || 1));
  const slides = Math.min(50, Math.max(0, parseInt(b.slides, 10) || 0));
  const sources = Math.min(50, Math.max(0, parseInt(b.sources, 10) || 0));
  const serviceKey = SERVICE_KEYS.includes(b.service) ? b.service : "writing";
  // Contact details — the order is negotiated on WhatsApp, so we need a name
  // and reachable email on every order. Phone is optional (kept if provided).
  const customerName = clean(b.name, 100) || clean(req.user?.name, 100);
  const customerPhone = clean(b.phone, 40).replace(/[^\d+()\-\s]/g, "");
  const email = (req.user?.email || clean(b.email || b.guestEmail, 200)).toLowerCase();
  if (!customerName) return res.status(400).json({ error: "Please enter your name." });
  if (!isEmail(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  const guestEmail = req.user ? "" : email;
  // Authoritative amount — recomputed from the live pricing config; client-sent
  // totals are never trusted.
  const pricing = await getPricing();
  const total = await computeTotal(pricing, {
    level: clean(b.academicLevel, 40),
    deadlineKey: b.deadline,
    pages,
    slides,
    serviceKey,
    coupon: b.coupon,
    userId: req.user?.id ?? null,
    guestEmail,
  });
  const accessToken = crypto.randomBytes(16).toString("hex");
  // The atomic counter guarantees unique numbers; the primary key is the last
  // line of defense. If the counter ever lands on a legacy id (orders placed
  // before the counter was reset to 1000), take the next number instead.
  let id;
  for (let attempt = 0; ; attempt++) {
    id = `RBW-${await nextOrderNumber()}`;
    try {
      await run(
        `INSERT INTO orders (id, user_id, guest_email, access_token, customer_name, customer_phone,
                             title, description, paper_type, academic_level,
                             school, service, subject, pages, slides, sources, deadline, coupon, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          req.user?.id ?? null,
          guestEmail,
          accessToken,
          customerName,
          customerPhone,
          clean(b.title, 300) || clean(b.paperType, 100) || "Order",
          clean(b.description, 5000),
          clean(b.paperType, 100),
          clean(b.academicLevel, 40),
          clean(b.school, 100),
          SERVICE_LABELS[serviceKey],
          clean(b.subject, 300),
          pages,
          slides,
          sources,
          deadlineFromKey(b.deadline),
          clean(b.coupon, 40),
          total,
        ]
      );
      break;
    } catch (e) {
      if (attempt >= 4 || !/unique|constraint|primary/i.test(String(e?.message || e))) throw e;
    }
  }
  res.json({ order: orderRow(await get("SELECT * FROM orders WHERE id = ?", [id])) });
});

app.get("/api/orders", requireAuth, async (req, res) => {
  const rows =
    req.user.role === "admin"
      ? await all(`SELECT orders.*, u.email AS user_email, ${ORDER_FILE_COUNTS} FROM orders LEFT JOIN users u ON u.id = orders.user_id ORDER BY orders.created_at DESC`)
      : await all(`SELECT *, ${ORDER_FILE_COUNTS} FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id]);
  res.json({ orders: rows.map(orderRow) });
});

app.get("/api/orders/:id", async (req, res) => {
  const o = await get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!o) return res.status(404).json({ error: "Order not found." });
  if (!canAccessOrder(req, o)) return res.status(403).json({ error: "You don't have access to this order." });
  res.json({ order: orderRow(o) });
});

// ---------------------------------------------------------------------------
// Payments — buyers submit proof of payment; only an admin can verify it and
// move the order into production. Orders can never self-confirm.
// ---------------------------------------------------------------------------
const paymentRow = (p) => ({
  id: p.id,
  orderId: p.order_id,
  method: p.method,
  reference: p.reference || p.gateway_id || "",
  amount: p.amount,
  status: p.status,
  createdAt: p.created_at,
  verifiedAt: p.verified_at,
});

// Which gateways are live (drives the checkout UI).
app.get("/api/pay/config", (_req, res) => res.json(gatewaysEnabled()));

async function loadPayableOrder(req, res) {
  const o = await get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!o) return res.status(404).json({ error: "Order not found." }), null;
  if (!canAccessOrder(req, o)) return res.status(403).json({ error: "You don't have access to this order." }), null;
  if (o.status !== "Awaiting Payment") {
    return res.status(409).json({ error: `This order is "${o.status}" — payment can only be made while it is awaiting payment.` }), null;
  }
  return o;
}

// Start an automated gateway payment: creates the gateway session and returns
// the redirect URL. Confirmation only ever comes back from the gateway itself.
app.post("/api/orders/:id/pay", rateLimit("gateway", 20, 15 * 60e3), async (req, res) => {
  const o = await loadPayableOrder(req, res);
  if (!o) return;
  const gateway = String(req.body?.gateway || "").toLowerCase();
  const enabled = gatewaysEnabled();
  try {
    let result;
    if (gateway === "stripe" && enabled.stripe) {
      result = await stripeCreateCheckout(o);
    } else if (gateway === "paypal" && enabled.paypal) {
      // The public origin serves /api in every deployment (Vite proxy in dev,
      // Netlify redirect in production), so it is also the API origin.
      result = await paypalCreateOrder(o, ENV.SITE_ORIGIN);
    } else {
      return res.status(400).json({ error: "This payment gateway is not available." });
    }
    await run("INSERT INTO payments (order_id, method, gateway_id, amount, status) VALUES (?, ?, ?, ?, 'pending')", [o.id, gateway, result.gatewayId, o.total]);
    res.json({ url: result.url });
  } catch (e) {
    console.error(`[pay] ${gateway} start failed:`, e.message);
    res.status(502).json({ error: `Could not start the ${gateway} payment. Please try again or use another method.` });
  }
});

// Stripe return-path fallback: when the buyer lands back with a session_id we
// retrieve the session from Stripe's API (server-side, unforgeable) — covers
// deployments where the webhook isn't configured yet.
app.post("/api/pay/stripe/sync", rateLimit("gateway", 30, 15 * 60e3), async (req, res) => {
  if (!gatewaysEnabled().stripe) return res.status(501).json({ error: "Stripe not configured." });
  const sessionId = clean(req.body?.sessionId, 200);
  if (!sessionId) return res.status(400).json({ error: "Missing session id." });
  try {
    const s = await stripeGetSession(sessionId);
    if (s.payment_status === "paid") {
      await finalizeGatewayPayment({ method: "stripe", gatewayId: s.id, paidAmount: (s.amount_total || 0) / 100, reference: s.payment_intent || "" });
    }
    const o = await get("SELECT * FROM orders WHERE id = ?", [s.client_reference_id ?? ""]);
    res.json({ paid: s.payment_status === "paid", order: o ? orderRow(o) : null });
  } catch (e) {
    res.status(502).json({ error: "Could not verify the Stripe session." });
  }
});

// PayPal approval return: capture server-side (the authentication step), then
// send the buyer back to checkout.
app.get("/api/pay/paypal/return", async (req, res) => {
  const orderId = String(req.query.order || "");
  const paypalOrderId = String(req.query.token || "");
  const accessToken = String(req.query.t || "").replace(/[^a-f0-9]/gi, "");
  const back = `${ENV.SITE_ORIGIN}/checkout?order=${encodeURIComponent(orderId)}${accessToken ? `&t=${accessToken}` : ""}`;
  if (!gatewaysEnabled().paypal || !paypalOrderId) return res.redirect(back);
  try {
    const capture = await paypalCaptureOrder(paypalOrderId);
    if (capture.completed) {
      await finalizeGatewayPayment({ method: "paypal", gatewayId: paypalOrderId, paidAmount: capture.amount, reference: capture.captureId });
    }
  } catch (e) {
    console.error("[pay] paypal capture failed:", e.message);
  }
  res.redirect(back);
});

app.post("/api/orders/:id/payment", rateLimit("payments", 20, 15 * 60e3), async (req, res) => {
  const o = await loadPayableOrder(req, res);
  if (!o) return;
  const method = String(req.body?.method || "").toLowerCase();
  if (!PAYMENT_METHODS.includes(method)) return res.status(400).json({ error: "Invalid payment method." });
  const reference = clean(req.body?.reference, 200);
  if (method !== "whatsapp" && reference.length < 4) {
    return res.status(400).json({ error: "Please enter the transaction ID / payment reference so we can verify your payment." });
  }
  await run("INSERT INTO payments (order_id, method, reference, amount) VALUES (?, ?, ?, ?)", [o.id, method, reference, o.total]);
  await run("UPDATE orders SET status = 'Payment Under Review' WHERE id = ?", [o.id]);
  res.json({ order: orderRow(await get("SELECT * FROM orders WHERE id = ?", [o.id])) });
});

app.get("/api/payments", requireAdmin, async (_req, res) => {
  const rows = await all("SELECT p.*, o.title AS order_title FROM payments p LEFT JOIN orders o ON o.id = p.order_id ORDER BY p.created_at DESC");
  res.json({ payments: rows.map((p) => ({ ...paymentRow(p), orderTitle: p.order_title })) });
});

app.post("/api/payments/:id/verify", requireAdmin, async (req, res) => {
  const p = await get("SELECT * FROM payments WHERE id = ?", [req.params.id]);
  if (!p) return res.status(404).json({ error: "Payment not found." });
  if (p.status !== "submitted") return res.status(409).json({ error: `Payment already ${p.status}.` });
  await run("UPDATE payments SET status = 'verified', verified_at = datetime('now') WHERE id = ?", [p.id]);
  await run("UPDATE orders SET status = 'In Progress' WHERE id = ?", [p.order_id]);
  res.json({ ok: true });
});

app.post("/api/payments/:id/reject", requireAdmin, async (req, res) => {
  const p = await get("SELECT * FROM payments WHERE id = ?", [req.params.id]);
  if (!p) return res.status(404).json({ error: "Payment not found." });
  if (p.status !== "submitted") return res.status(409).json({ error: `Payment already ${p.status}.` });
  await run("UPDATE payments SET status = 'rejected' WHERE id = ?", [p.id]);
  await run("UPDATE orders SET status = 'Awaiting Payment' WHERE id = ?", [p.order_id]);
  res.json({ ok: true });
});

app.patch("/api/orders/:id/status", requireAdmin, async (req, res) => {
  const status = clean(req.body.status, 40);
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status." });
  const info = await run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
  if (!info.changes) return res.status(404).json({ error: "Order not found." });
  res.json({ ok: true });
});

app.delete("/api/orders/:id", requireAdmin, async (req, res) => {
  // Remove dependent payments and files first — FK cascade isn't guaranteed on
  // every libsql connection, so delete explicitly to avoid orphaned rows/blobs.
  for (const att of await listAttachments(req.params.id)) await deleteFile(att.id);
  await run("DELETE FROM attachments WHERE order_id = ?", [req.params.id]);
  await run("DELETE FROM payments WHERE order_id = ?", [req.params.id]);
  const info = await run("DELETE FROM orders WHERE id = ?", [req.params.id]);
  if (!info.changes) return res.status(404).json({ error: "Order not found." });
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Order files — requirement files (customer) and deliverables (writer/admin).
// Bytes live in blob storage; metadata in the attachments table. Uploads arrive
// as a raw binary body (octet-stream, so the global 64kb JSON parser skips
// them); downloads go out as base64 JSON so binary works uniformly on
// serverless. Per-file cap stays under the serverless request-body limit.
// ---------------------------------------------------------------------------
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const rawUpload = express.raw({ type: () => true, limit: "9mb" });
const ALLOWED_UPLOAD = /\.(pdf|docx?|txt|rtf|pptx?|xlsx?|csv|zip|png|jpe?g|gif|webp)$/i;

async function loadOrderForFiles(req, res) {
  const o = await get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!o) { res.status(404).json({ error: "Order not found." }); return null; }
  return o;
}

function readUpload(req, res) {
  let filename = req.get("x-filename") || "file";
  try { filename = decodeURIComponent(filename); } catch {}
  filename = clean(filename, 200) || "file";
  const mime = clean(req.get("x-file-mime") || "", 100);
  const buf = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
  if (!buf.length) { res.status(400).json({ error: "Empty file." }); return null; }
  if (buf.length > MAX_UPLOAD_BYTES) { res.status(413).json({ error: `File exceeds ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` }); return null; }
  if (!ALLOWED_UPLOAD.test(filename)) { res.status(415).json({ error: "Unsupported file type." }); return null; }
  return { filename, mime, buf };
}

app.get("/api/orders/:id/files", async (req, res) => {
  const o = await loadOrderForFiles(req, res);
  if (!o) return;
  if (!canAccessOrder(req, o)) return res.status(403).json({ error: "You don't have access to this order." });
  res.json({ files: await listAttachments(o.id) });
});

// Customer (or admin) uploads a requirement / source file.
app.post("/api/orders/:id/files", rateLimit("upload", 80, 15 * 60e3), rawUpload, async (req, res) => {
  const o = await loadOrderForFiles(req, res);
  if (!o) return;
  if (!canAccessOrder(req, o)) return res.status(403).json({ error: "You don't have access to this order." });
  const up = readUpload(req, res);
  if (!up) return;
  const id = `att-${crypto.randomBytes(10).toString("hex")}`;
  await putFile(id, up.buf);
  await addAttachment({ id, orderId: o.id, kind: "requirement", filename: up.filename, mime: up.mime, size: up.buf.length, uploadedBy: req.user?.role === "admin" ? "admin" : "customer" });
  res.json({ file: await getAttachment(id) });
});

// Writer/admin uploads the completed work → order auto-advances to Completed.
app.post("/api/orders/:id/deliverable", requireAdmin, rateLimit("upload", 80, 15 * 60e3), rawUpload, async (req, res) => {
  const o = await loadOrderForFiles(req, res);
  if (!o) return;
  const up = readUpload(req, res);
  if (!up) return;
  const id = `att-${crypto.randomBytes(10).toString("hex")}`;
  await putFile(id, up.buf);
  await addAttachment({ id, orderId: o.id, kind: "deliverable", filename: up.filename, mime: up.mime, size: up.buf.length, uploadedBy: "admin" });
  await run("UPDATE orders SET status = 'Completed' WHERE id = ?", [o.id]);
  res.json({ file: await getAttachment(id), order: orderRow(await get("SELECT * FROM orders WHERE id = ?", [o.id])) });
});

// Download a file — base64 JSON so it works on serverless without binary bodies.
app.get("/api/orders/:id/files/:fileId/download", rateLimit("download", 200, 15 * 60e3), async (req, res) => {
  const o = await loadOrderForFiles(req, res);
  if (!o) return;
  if (!canAccessOrder(req, o)) return res.status(403).json({ error: "You don't have access to this order." });
  const att = await getAttachment(req.params.fileId);
  if (!att || att.orderId !== o.id) return res.status(404).json({ error: "File not found." });
  const buf = await getFile(att.id);
  if (!buf) return res.status(404).json({ error: "File data is missing." });
  res.json({ filename: att.filename, mime: att.mime, dataBase64: buf.toString("base64") });
});

// Notify the admin inbox about a new order — called by the client once file
// uploads finish, so attachments make it into the email. Idempotent (fires at
// most once per order) and access-controlled, so it can't be used to spam.
app.post("/api/orders/:id/notify", rateLimit("notify", 30, 15 * 60e3), async (req, res) => {
  const o = await get("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!o) return res.status(404).json({ error: "Order not found." });
  if (!canAccessOrder(req, o)) return res.status(403).json({ error: "You don't have access to this order." });
  if (o.notified) return res.json({ ok: true, already: true });
  if (!emailEnabled()) return res.json({ ok: false, skipped: true });
  // Claim the flag first so concurrent calls can't double-send.
  const claim = await run("UPDATE orders SET notified = 1 WHERE id = ? AND notified = 0", [o.id]);
  if (!claim.changes) return res.json({ ok: true, already: true });
  const metas = (await listAttachments(o.id)).filter((f) => f.kind === "requirement");
  const files = [];
  for (const m of metas) files.push({ filename: m.filename, bytes: await getFile(m.id) });
  let userEmail = o.guest_email;
  if (o.user_id) {
    const u = await get("SELECT email FROM users WHERE id = ?", [o.user_id]);
    userEmail = u?.email || userEmail;
  }
  const settings = await getSettings();
  const result = await sendOrderEmail({
    to: settings.recipientEmail || "rnbsnmsnwriter@gmail.com",
    order: orderRow({ ...o, user_email: userEmail }),
    files,
  });
  if (!result.ok && !result.skipped) {
    // Sending failed — release the claim so a retry can succeed later.
    await run("UPDATE orders SET notified = 0 WHERE id = ?", [o.id]);
  }
  res.json({ ok: Boolean(result.ok) });
});

// Delete a file — admin removes any; a customer may remove their own
// requirement while the order is still awaiting payment.
app.delete("/api/orders/:id/files/:fileId", async (req, res) => {
  const o = await loadOrderForFiles(req, res);
  if (!o) return;
  const att = await getAttachment(req.params.fileId);
  if (!att || att.orderId !== o.id) return res.status(404).json({ error: "File not found." });
  const isAdmin = req.user?.role === "admin";
  const ownRequirement = att.kind === "requirement" && canAccessOrder(req, o) && o.status === "Awaiting Payment";
  if (!isAdmin && !ownRequirement) return res.status(403).json({ error: "Not allowed." });
  await deleteFile(att.id);
  await removeAttachment(att.id);
  if (att.kind === "deliverable" && o.status === "Completed" && (await countAttachments(o.id, "deliverable")) === 0) {
    await run("UPDATE orders SET status = 'In Progress' WHERE id = ?", [o.id]);
  }
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Users (admin) — list accounts and reset a forgotten password. The customer
// asks for a reset on WhatsApp (login page flow); the admin verifies it's
// really them, resets here, and sends the one-time temporary password back.
// ---------------------------------------------------------------------------
app.get("/api/users", requireAdmin, async (_req, res) => {
  const rows = await all(`
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
    FROM users u ORDER BY u.created_at DESC`);
  res.json({
    users: rows.map((u) => ({
      id: u.id, name: u.name, email: u.email, role: u.role,
      createdAt: u.created_at, orderCount: Number(u.order_count),
    })),
  });
});

// Unambiguous alphabet (no 0/O/1/l/I) so the password survives being read
// aloud or retyped from a WhatsApp message.
const TEMP_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
function tempPassword(len = 12) {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += TEMP_ALPHABET[bytes[i] % TEMP_ALPHABET.length];
  return out;
}

app.post("/api/users/:id/reset-password", requireAdmin, rateLimit("pwreset", 20, 15 * 60e3), async (req, res) => {
  const target = await get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!target) return res.status(404).json({ error: "User not found." });
  if (target.id === req.user.id) {
    return res.status(400).json({ error: "Use the Change Password form for your own account." });
  }
  const temp = tempPassword();
  const { salt, hash } = hashPassword(temp);
  await run("UPDATE users SET pass_salt = ?, pass_hash = ? WHERE id = ?", [salt, hash, target.id]);
  // Kill every session the account holds — whoever had access is out.
  await run("DELETE FROM sessions WHERE user_id = ?", [target.id]);
  // If the env-seeded admin was reset, stop seedAdmin reverting it on cold start.
  if (String(target.email).toLowerCase() === ENV.ADMIN_EMAIL) {
    await run("INSERT INTO kv (key, value) VALUES ('admin_pw_selfmanaged', '1') ON CONFLICT(key) DO UPDATE SET value = '1'");
  }
  console.log(`[auth] admin ${req.user.email} reset password for user ${target.id} (${target.email})`);
  // Returned once, never stored in plaintext.
  res.json({ tempPassword: temp });
});

app.delete("/api/users/:id", requireAdmin, async (req, res) => {
  const target = await get("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!target) return res.status(404).json({ error: "User not found." });
  if (target.id === req.user.id) {
    return res.status(400).json({ error: "You can't delete your own account while signed in with it." });
  }
  // Orders are business records — keep them, just unlink the account (the
  // order's customer_name/phone stay). FK behavior isn't guaranteed on every
  // libsql connection, so do it explicitly, sessions included.
  await run("UPDATE orders SET user_id = NULL WHERE user_id = ?", [target.id]);
  await run("DELETE FROM sessions WHERE user_id = ?", [target.id]);
  await run("DELETE FROM users WHERE id = ?", [target.id]);
  console.log(`[auth] admin ${req.user.email} deleted user ${target.id} (${target.email}, role ${target.role})`);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Contact inbox
// ---------------------------------------------------------------------------
app.post("/api/messages", rateLimit("messages", 10, 15 * 60e3), async (req, res) => {
  const fullName = clean(req.body.fullName, 100);
  const email = clean(req.body.email, 200).toLowerCase();
  const message = clean(req.body.message, 5000);
  if (!fullName || !isEmail(email) || !message) {
    return res.status(400).json({ error: "Name, valid email and message are required." });
  }
  await run(
    "INSERT INTO messages (full_name, email, phone, service_type, message) VALUES (?, ?, ?, ?, ?)",
    [fullName, email, clean(req.body.phone, 40), clean(req.body.serviceType, 100), message]
  );
  res.json({ ok: true });
});

app.get("/api/messages", requireAdmin, async (_req, res) => {
  const rows = await all("SELECT * FROM messages ORDER BY created_at DESC");
  res.json({
    messages: rows.map((m) => ({
      id: m.id,
      fullName: m.full_name,
      email: m.email,
      phone: m.phone,
      serviceType: m.service_type,
      message: m.message,
      createdAt: m.created_at,
    })),
  });
});

app.delete("/api/messages/:id", requireAdmin, async (req, res) => {
  await run("DELETE FROM messages WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Site content — testimonials, FAQ, samples and hero/contact settings. Reads
// are public (they drive the marketing pages); writes are admin-only, so an
// edit in /admin is immediately live for every visitor.
// ---------------------------------------------------------------------------
const CONTENT_KINDS = Object.keys(CONTENT_FIELDS);

// Keep only whitelisted fields, coercing the two numeric ones and capping
// string lengths so a stored item can never bloat or carry stray keys.
function sanitizeContent(kind, body) {
  const out = {};
  for (const field of CONTENT_FIELDS[kind]) {
    const v = body?.[field];
    if (field === "rating") out.rating = Math.min(5, Math.max(1, parseInt(v, 10) || 5));
    else if (field === "pages") out.pages = Math.min(500, Math.max(1, parseInt(v, 10) || 1));
    else if (field === "order") out.order = Math.max(0, parseInt(v, 10) || 0);
    else out[field] = String(v ?? "").slice(0, 4000);
  }
  return out;
}

app.get("/api/content", async (_req, res) => {
  const [settings, pricing, testimonials, faq, samples] = await Promise.all([
    getSettings(),
    getPricing(),
    listContent("testimonials"),
    listContent("faq"),
    listContent("samples"),
  ]);
  res.json({ settings, pricing, testimonials, faq, samples });
});

app.put("/api/pricing", requireAdmin, async (req, res) => {
  // savePricing normalizes and clamps every field, so a malformed body can
  // never produce an unsafe price. Returns the stored (clean) config.
  res.json({ pricing: await savePricing(req.body || {}) });
});

app.put("/api/settings", requireAdmin, async (req, res) => {
  const b = req.body || {};
  const next = {
    heroTagline: clean(b.heroTagline, 300),
    heroTitle1: clean(b.heroTitle1, 200),
    heroTitle2: clean(b.heroTitle2, 200),
    heroDescription: clean(b.heroDescription, 1000),
    contactLocation: clean(b.contactLocation, 200),
    recipientEmail: clean(b.recipientEmail, 200),
  };
  res.json({ settings: await saveSettings(next) });
});

app.post("/api/content/:kind", requireAdmin, async (req, res) => {
  const kind = req.params.kind;
  if (!CONTENT_KINDS.includes(kind)) return res.status(404).json({ error: "Unknown content type." });
  const fields = sanitizeContent(kind, req.body);
  const id = `${kind}-${crypto.randomBytes(6).toString("hex")}`;
  const max = await get("SELECT COALESCE(MAX(sort), 0) AS m FROM content WHERE kind = ?", [kind]);
  const sort = typeof fields.order === "number" ? fields.order : Number(max.m) + 1;
  await run("INSERT INTO content (kind, id, sort, data) VALUES (?, ?, ?, ?)", [kind, id, sort, JSON.stringify(fields)]);
  res.json({ item: { id, ...fields } });
});

app.put("/api/content/:kind/:id", requireAdmin, async (req, res) => {
  const kind = req.params.kind;
  if (!CONTENT_KINDS.includes(kind)) return res.status(404).json({ error: "Unknown content type." });
  const fields = sanitizeContent(kind, req.body);
  const sort = typeof fields.order === "number" ? fields.order : undefined;
  const info =
    sort === undefined
      ? await run("UPDATE content SET data = ? WHERE kind = ? AND id = ?", [JSON.stringify(fields), kind, req.params.id])
      : await run("UPDATE content SET data = ?, sort = ? WHERE kind = ? AND id = ?", [JSON.stringify(fields), sort, kind, req.params.id]);
  if (!info.changes) return res.status(404).json({ error: "Item not found." });
  res.json({ item: { id: req.params.id, ...fields } });
});

app.delete("/api/content/:kind/:id", requireAdmin, async (req, res) => {
  const kind = req.params.kind;
  if (!CONTENT_KINDS.includes(kind)) return res.status(404).json({ error: "Unknown content type." });
  await run("DELETE FROM content WHERE kind = ? AND id = ?", [kind, req.params.id]);
  res.json({ ok: true });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

// JSON error handler — async route failures must never leak an HTML stack.
app.use((err, _req, res, _next) => {
  if (res.headersSent) return;
  // Malformed request bodies are the client's fault, not a server error.
  if (err?.type === "entity.parse.failed" || err?.type === "entity.too.large") {
    return res.status(400).json({ error: "Invalid request body." });
  }
  console.error("[server] unhandled error:", err);
  res.status(500).json({ error: "Server error. Please try again." });
});

// Seed the admin account from env (updates the password if env changed).
// In production a real ADMIN_PASSWORD is mandatory — fail closed otherwise.
async function seedAdmin() {
  if (ENV.ADMIN_PASSWORD === "admin123") {
    if (ENV.IS_PROD) {
      throw new Error("Refusing to serve with the default admin password — set ADMIN_PASSWORD in the environment.");
    }
    console.warn("[server] WARNING: using the default admin password — set ADMIN_PASSWORD in server/.env");
  }
  const existing = await get("SELECT * FROM users WHERE email = ?", [ENV.ADMIN_EMAIL]);
  const { salt, hash } = hashPassword(ENV.ADMIN_PASSWORD);
  if (!existing) {
    await run("INSERT INTO users (name, email, pass_salt, pass_hash, role) VALUES ('Admin', ?, ?, ?, 'admin')", [ENV.ADMIN_EMAIL, salt, hash]);
    return;
  }
  // Once the admin has changed their password in the UI, the env var no longer
  // drives it — otherwise every cold start would silently revert the change.
  const selfManaged = await get("SELECT value FROM kv WHERE key = 'admin_pw_selfmanaged'");
  if (!selfManaged && !verifyPassword(ENV.ADMIN_PASSWORD, existing.pass_salt, existing.pass_hash)) {
    await run("UPDATE users SET pass_salt = ?, pass_hash = ?, role = 'admin' WHERE id = ?", [salt, hash, existing.id]);
  }
}

// Awaited before the first request is served (schema + admin seed).
export const ready = dbReady.then(seedAdmin);
// A misconfiguration rejects `ready` during module load, before any awaiter is
// attached — swallow that here so Node doesn't kill the process; every request
// path still awaits `ready` and reports the failure.
ready.catch(() => {});
