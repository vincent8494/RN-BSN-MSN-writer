import { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import {
  BRAND,
  CONTACT,
  TESTIMONIALS,
  TEAM,
  FAQ,
  SAMPLES,
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
// Presentation content (testimonials, team, FAQ, samples, hero settings) is
// still local: it's public site copy the admin can tweak per deployment.
// ---------------------------------------------------------------------------
const K_SETTINGS = "rnbsn_settings";
const K_TESTIMONIALS = "rnbsn_testimonials";
const K_TEAM = "rnbsn_team";
const K_FAQ = "rnbsn_faq";
const K_SAMPLES = "rnbsn_samples";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

let uidCounter = 0;
function uid(prefix) {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

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

function usePersistent(key, initial) {
  const [state, setState] = useState(() => readJSON(key, initial));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    writeJSON(key, state);
  }, [key, state]);
  return [state, setState];
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readJSON(K_SETTINGS, {}) }));
  const [testimonials, setTestimonials] = usePersistent(K_TESTIMONIALS, TESTIMONIALS);
  const [team, setTeam] = usePersistent(K_TEAM, TEAM);
  const [faq, setFaq] = usePersistent(K_FAQ, FAQ);
  const [samplePapers, setSamplePapers] = usePersistent(K_SAMPLES, SAMPLES);

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
      updateSettings: (s) => {
        setSettings(s);
        writeJSON(K_SETTINGS, s);
      },
      testimonials,
      addTestimonial: (t) => setTestimonials((p) => [...p, { id: uid("t"), ...t }]),
      updateTestimonial: (t) => setTestimonials((p) => p.map((x) => (x.id === t.id ? t : x))),
      deleteTestimonial: (id) => setTestimonials((p) => p.filter((x) => x.id !== id)),

      team,
      addTeamMember: (t) => setTeam((p) => [...p, { id: uid("team"), ...t }]),
      updateTeamMember: (t) => setTeam((p) => p.map((x) => (x.id === t.id ? t : x))),
      deleteTeamMember: (id) => setTeam((p) => p.filter((x) => x.id !== id)),

      faq,
      addFAQ: (f) => setFaq((p) => [...p, { id: uid("faq"), ...f }]),
      updateFAQ: (f) => setFaq((p) => p.map((x) => (x.id === f.id ? f : x))),
      deleteFAQ: (id) => setFaq((p) => p.filter((x) => x.id !== id)),

      samplePapers,
      addSamplePaper: (s) => setSamplePapers((p) => [...p, { id: uid("sample"), ...s }]),
      updateSamplePaper: (s) => setSamplePapers((p) => p.map((x) => (x.id === s.id ? s : x))),
      deleteSamplePaper: (id) => setSamplePapers((p) => p.filter((x) => x.id !== id)),
    }),
    [user, authChecked, settings, testimonials, team, faq, samplePapers]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
