import { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  BRAND,
  CONTACT,
  TESTIMONIALS,
  FAQ,
  SAMPLES,
  DEFAULT_PRICING,
} from "./data.js";

export const ORDER_STATUSES = [
  "Awaiting Payment",
  "Payment Under Review",
  "In Progress",
  "Completed",
  "Revisions",
  "Cancelled",
  "Technical",
];

// ---------------------------------------------------------------------------
// API client — auth, orders and the contact inbox live on the backend
// (server/, same origin via the Vite proxy in dev).
// ---------------------------------------------------------------------------
async function api(path, { method = "GET", body } = {}) {
  try {
    const res = await fetch(`/api${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || `Request failed (${res.status}).` };
    return data;
  } catch {
    return { error: "Cannot reach the server. Please try again in a moment." };
  }
}

// Orders — `token` is the per-order access token guests need (owners use their session).
export const createOrder = (order) => api("/orders", { method: "POST", body: order });
export const fetchOrders = () => api("/orders");
export const fetchOrder = (id, token) =>
  api(`/orders/${encodeURIComponent(id)}${token ? `?t=${encodeURIComponent(token)}` : ""}`);
export const setOrderStatus = (id, status) =>
  api(`/orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } });
export const deleteOrder = (id) => api(`/orders/${encodeURIComponent(id)}`, { method: "DELETE" });

// Payments — automated gateways confirm themselves; manual proof is the fallback.
export const fetchPayConfig = () => api("/pay/config");
export const startGatewayPayment = (orderId, gateway, token) =>
  api(`/orders/${encodeURIComponent(orderId)}/pay`, { method: "POST", body: { gateway, token } });
export const syncStripePayment = (sessionId) =>
  api("/pay/stripe/sync", { method: "POST", body: { sessionId } });
export const submitPayment = (orderId, { method, reference, token }) =>
  api(`/orders/${encodeURIComponent(orderId)}/payment`, { method: "POST", body: { method, reference, token } });
export const fetchPayments = () => api("/payments");
export const verifyPayment = (id) => api(`/payments/${id}/verify`, { method: "POST" });
export const rejectPayment = (id) => api(`/payments/${id}/reject`, { method: "POST" });

// Contact inbox
export const sendMessage = (form) => api("/messages", { method: "POST", body: form });
export const fetchMessages = () => api("/messages");
export const deleteMessage = (id) => api(`/messages/${id}`, { method: "DELETE" });

// ---------------------------------------------------------------------------
// Site content — testimonials, FAQ, samples and hero/contact settings now live
// on the server, so an edit in /admin is instantly live for every visitor.
// ---------------------------------------------------------------------------
export const fetchContent = () => api("/content");
export const saveSiteSettings = (settings) => api("/settings", { method: "PUT", body: settings });
export const savePricingConfig = (pricing) => api("/pricing", { method: "PUT", body: pricing });
const createContent = (kind, item) => api(`/content/${kind}`, { method: "POST", body: item });
const updateContentItem = (kind, id, item) =>
  api(`/content/${kind}/${encodeURIComponent(id)}`, { method: "PUT", body: item });
const deleteContentItem = (kind, id) =>
  api(`/content/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });

// One-time cleanup: earlier builds cached this content per browser. It is
// server-backed now, so drop the stale localStorage copies.
try {
  for (const k of ["rnbsn_team", "rnbsn_settings", "rnbsn_testimonials", "rnbsn_faq", "rnbsn_samples"]) {
    localStorage.removeItem(k);
  }
} catch {}

const DEFAULT_SETTINGS = {
  heroTagline: `${BRAND.name} — ${BRAND.tagline}`,
  heroTitle1: "Nursing & Healthcare",
  heroTitle2: "Assignment Help That Delivers Distinguished Grades",
  heroDescription:
    "Expert RN-to-BSN, BSN-to-MSN, MSN-to-DNP and Social Work help for WGU, Capella, Post University, SNHU, GCU & more. 100% human-written, no plagiarism, 100% privacy, 24-hour turnaround.",
  contactLocation: CONTACT.location,
  recipientEmail: CONTACT.email,
};

const AppCtx = createContext(undefined);

export function AppProvider({ children }) {
  // Start from the bundled defaults so the first paint has content, then the
  // server's live content replaces them once /api/content resolves.
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);
  const [faq, setFaq] = useState(FAQ);
  const [samplePapers, setSamplePapers] = useState(SAMPLES);

  // Session user, restored from the HttpOnly cookie via /api/auth/me.
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    api("/auth/me").then((res) => {
      if (!alive) return;
      setUser(res.user || null);
      setAuthChecked(true);
    });
    // Live site content from the server (falls back to the bundled defaults on
    // error, so the marketing pages always render something).
    fetchContent().then((res) => {
      if (!alive || res.error) return;
      if (res.settings) setSettings((prev) => ({ ...prev, ...res.settings }));
      if (res.pricing) setPricing(res.pricing);
      if (Array.isArray(res.testimonials)) setTestimonials(res.testimonials);
      if (Array.isArray(res.faq)) setFaq(res.faq);
      if (Array.isArray(res.samples)) setSamplePapers(res.samples);
    });
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      authChecked,
      login: async (creds) => {
        const res = await api("/auth/login", { method: "POST", body: creds });
        if (res.user) setUser(res.user);
        return res;
      },
      signup: async (fields) => {
        const res = await api("/auth/signup", { method: "POST", body: fields });
        if (res.user) setUser(res.user);
        return res;
      },
      logout: async () => {
        await api("/auth/logout", { method: "POST" });
        setUser(null);
      },

      settings,
      updateSettings: async (s) => {
        const res = await saveSiteSettings(s);
        if (res.settings) setSettings(res.settings);
        return res;
      },

      pricing,
      updatePricing: async (p) => {
        const res = await savePricingConfig(p);
        if (res.pricing) setPricing(res.pricing);
        return res;
      },

      testimonials,
      addTestimonial: async (t) => {
        const res = await createContent("testimonials", t);
        if (res.item) setTestimonials((p) => [...p, res.item]);
        return res;
      },
      updateTestimonial: async (t) => {
        const res = await updateContentItem("testimonials", t.id, t);
        if (res.item) setTestimonials((p) => p.map((x) => (x.id === t.id ? res.item : x)));
        return res;
      },
      deleteTestimonial: async (id) => {
        const res = await deleteContentItem("testimonials", id);
        if (!res.error) setTestimonials((p) => p.filter((x) => x.id !== id));
        return res;
      },

      faq,
      addFAQ: async (f) => {
        const res = await createContent("faq", f);
        if (res.item) setFaq((p) => [...p, res.item]);
        return res;
      },
      updateFAQ: async (f) => {
        const res = await updateContentItem("faq", f.id, f);
        if (res.item) setFaq((p) => p.map((x) => (x.id === f.id ? res.item : x)));
        return res;
      },
      deleteFAQ: async (id) => {
        const res = await deleteContentItem("faq", id);
        if (!res.error) setFaq((p) => p.filter((x) => x.id !== id));
        return res;
      },

      samplePapers,
      addSamplePaper: async (s) => {
        const res = await createContent("samples", s);
        if (res.item) setSamplePapers((p) => [...p, res.item]);
        return res;
      },
      updateSamplePaper: async (s) => {
        const res = await updateContentItem("samples", s.id, s);
        if (res.item) setSamplePapers((p) => p.map((x) => (x.id === s.id ? res.item : x)));
        return res;
      },
      deleteSamplePaper: async (id) => {
        const res = await deleteContentItem("samples", id);
        if (!res.error) setSamplePapers((p) => p.filter((x) => x.id !== id));
        return res;
      },
    }),
    [user, authChecked, settings, pricing, testimonials, faq, samplePapers]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
