// Payment gateway integrations (REST over fetch — no SDK dependencies).
// The gateway, not the buyer, is the source of truth for "paid":
//  - Stripe: signed webhook events + server-side session retrieval.
//  - PayPal: server-side capture of approved orders.
import crypto from "node:crypto";
import { ENV } from "./env.js";

export const gatewaysEnabled = () => ({
  stripe: Boolean(ENV.STRIPE_SECRET_KEY),
  paypal: Boolean(ENV.PAYPAL_CLIENT_ID && ENV.PAYPAL_CLIENT_SECRET),
});

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------
const STRIPE_API = "https://api.stripe.com";

async function stripeRequest(path, params) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${ENV.STRIPE_SECRET_KEY}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Stripe request failed (${res.status})`);
  return data;
}

export async function stripeCreateCheckout(order) {
  const cents = Math.round(Number(order.total) * 100);
  const back = `order=${encodeURIComponent(order.id)}${order.access_token ? `&t=${order.access_token}` : ""}`;
  const session = await stripeRequest("/v1/checkout/sessions", {
    mode: "payment",
    client_reference_id: order.id,
    "metadata[order_id]": order.id,
    success_url: `${ENV.SITE_ORIGIN}/checkout?${back}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ENV.SITE_ORIGIN}/checkout?${back}`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(cents),
    "line_items[0][price_data][product_data][name]": `Order ${order.id} — ${order.title}`.slice(0, 120),
  });
  return { gatewayId: session.id, url: session.url };
}

export const stripeGetSession = (sessionId) =>
  stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);

// Verifies a Stripe webhook signature (HMAC-SHA256 over "t.payload") and
// returns the parsed event, or null if authentication fails.
export function verifyStripeSignature(rawBody, sigHeader, secret, toleranceSec = 300) {
  if (!sigHeader || !secret) return null;
  const parts = {};
  for (const kv of String(sigHeader).split(",")) {
    const [k, v] = kv.split("=");
    if (k === "v1" && parts.v1) continue; // keep first v1
    parts[k?.trim()] = v?.trim();
  }
  const t = parseInt(parts.t, 10);
  if (!t || !parts.v1) return null;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) return null;
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// PayPal (Orders API v2)
// ---------------------------------------------------------------------------
const PAYPAL_API = ENV.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function paypalToken() {
  const basic = Buffer.from(`${ENV.PAYPAL_CLIENT_ID}:${ENV.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "PayPal auth failed");
  return data.access_token;
}

export async function paypalCreateOrder(order, apiOrigin) {
  const token = await paypalToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.id,
          custom_id: order.id,
          description: `Order ${order.id}`.slice(0, 120),
          amount: { currency_code: "USD", value: Number(order.total).toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "Nursing FlexPath Writers",
        user_action: "PAY_NOW",
        return_url: `${apiOrigin}/api/pay/paypal/return?order=${encodeURIComponent(order.id)}${order.access_token ? `&t=${order.access_token}` : ""}`,
        cancel_url: `${ENV.SITE_ORIGIN}/checkout?order=${encodeURIComponent(order.id)}${order.access_token ? `&t=${order.access_token}` : ""}`,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "PayPal order creation failed");
  const approve = (data.links || []).find((l) => l.rel === "approve");
  if (!approve) throw new Error("PayPal did not return an approval link");
  return { gatewayId: data.id, url: approve.href };
}

// Captures an approved PayPal order server-side and returns the verified
// amount — this call is the payment authentication step.
export async function paypalCaptureOrder(paypalOrderId) {
  const token = await paypalToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "PayPal capture failed");
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    completed: data.status === "COMPLETED" && capture?.status === "COMPLETED",
    amount: capture ? Number(capture.amount?.value) : null,
    captureId: capture?.id || "",
  };
}
