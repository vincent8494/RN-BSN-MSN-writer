// Order notification emails via Resend's HTTP API (no SDK needed).
// Gracefully does nothing when RESEND_API_KEY isn't configured, so the site
// works with or without email set up.
//
// Note: until a custom domain is verified in Resend, the free account can only
// deliver to the email address the Resend account was created with — sign up
// with the same inbox you want order alerts in.
import { ENV } from "./env.js";

const FROM = process.env.RESEND_FROM || "Nursing FlexPath Writers <onboarding@resend.dev>";
// Keep total attachment payload well under Resend's cap (and Lambda limits).
const MAX_ATTACH_TOTAL = 15 * 1024 * 1024;

export const emailEnabled = () => Boolean(process.env.RESEND_API_KEY);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function sendOrderEmail({ to, order, files }) {
  if (!emailEnabled()) return { ok: false, skipped: true };

  const rows = [
    ["Order", order.id],
    ["Name", order.customerName],
    ["Email", order.customerEmail || order.guestEmail],
    order.customerPhone ? ["Phone", order.customerPhone] : null,
    ["Service", order.service],
    ["Assignment", order.paperType],
    ["School/Program", order.school],
    ["Level", order.academicLevel],
    order.subject ? ["Topic/Course", order.subject] : null,
    ["Pages", String(order.pages)],
    order.slides > 0 ? ["Slides", String(order.slides)] : null,
    ["Sources", String(order.sources)],
    ["Deadline", order.deadline],
    ["Estimated total", `$${Number(order.total).toFixed(2)}`],
  ].filter(Boolean);

  const tableHtml = rows
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#64748b;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;font-weight:600;color:#0f172a">${esc(v)}</td></tr>`)
    .join("");

  const filesNote = files.length
    ? `<p style="margin:18px 0 4px;color:#0f172a"><b>Customer files (${files.length}):</b> ${files.map((f) => esc(f.filename)).join(", ")}</p>`
    : `<p style="margin:18px 0 4px;color:#64748b">No files attached to the order.</p>`;

  const instructions = order.description
    ? `<p style="margin:16px 0 4px;color:#0f172a"><b>Instructions</b></p><p style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;color:#334155">${esc(order.description)}</p>`
    : "";

  const html = `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto">
    <h2 style="color:#1e3453">🆕 New order ${esc(order.id)}</h2>
    <table style="border-collapse:collapse;font-size:14px">${tableHtml}</table>
    ${instructions}
    ${filesNote}
    <p style="margin-top:22px"><a href="${esc(ENV.SITE_ORIGIN)}/admin?order=${encodeURIComponent(order.id)}" style="background:#345e94;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open in admin dashboard</a></p>
  </div>`;

  // Attach the customer's files (skip past the size cap; they remain
  // downloadable from the admin dashboard regardless).
  const attachments = [];
  let total = 0;
  let omitted = 0;
  for (const f of files) {
    if (!f.bytes) continue;
    if (total + f.bytes.length > MAX_ATTACH_TOTAL) { omitted++; continue; }
    total += f.bytes.length;
    attachments.push({ filename: f.filename, content: f.bytes.toString("base64") });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: `🆕 Order ${order.id} — ${order.customerName} — $${Number(order.total).toFixed(2)}${omitted ? " (some files too large to attach)" : ""}`,
      html,
      attachments,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[email] resend failed:", res.status, data?.message || data);
    return { ok: false };
  }
  return { ok: true, id: data.id };
}
