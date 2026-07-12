import { useState, useEffect } from "react";
import {
  CheckCircle2, ArrowLeft, ShieldCheck, MessageCircle, CreditCard, FileWarning,
  Hourglass, Copy, Check,
} from "lucide-react";
import { navigate, useQuery } from "../router.jsx";
import { fetchOrder, submitPayment, fetchPayConfig, startGatewayPayment, syncStripePayment } from "../store.jsx";
import { BRAND, CONTACT, waMessage } from "../data.js";

// Gateway methods redirect to the processor; manual ones collect a reference
// that our team verifies. The list adapts to which gateways are configured.
function buildMethods(cfg) {
  const m = [];
  if (cfg.stripe) m.push({ id: "stripe", label: "Card", gateway: true });
  if (cfg.paypal) m.push({ id: "paypal_auto", label: "PayPal", gateway: true });
  if (!cfg.paypal) m.push({ id: "paypal", label: cfg.stripe ? "PayPal (manual)" : "PayPal" });
  if (!cfg.stripe) m.push({ id: "card", label: "Card" });
  m.push({ id: "whatsapp", label: "WhatsApp" });
  return m;
}

function CopyValue({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 font-semibold text-academic-700 hover:text-academic-800 cursor-pointer break-all text-left">
      {value}
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}

function CenteredCard({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card-academic p-10 text-center max-w-md">{children}</div>
    </div>
  );
}

export default function Checkout() {
  const orderId = useQuery("order");
  const sessionId = useQuery("session_id");
  const accessToken = useQuery("t");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState({ stripe: false, paypal: false });
  const [method, setMethod] = useState(null);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayConfig().then((c) => {
      if (!c.error) {
        setCfg(c);
        setMethod((m) => m || buildMethods(c)[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      // Returning from Stripe: authenticate the session server-side first so
      // the confirmed state shows immediately even before the webhook lands.
      if (sessionId) await syncStripePayment(sessionId);
      const res = await fetchOrder(orderId, accessToken);
      setOrder(res.order || null);
      setLoading(false);
    })();
  }, [orderId, sessionId, accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" role="status" aria-label="Loading order">
        <div className="w-9 h-9 rounded-full border-[3px] border-academic-200 border-t-academic-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <CenteredCard>
        <FileWarning className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">This order could not be found. Please place your order again.</p>
        <button onClick={() => navigate("/order-now")} className="btn-primary mx-auto">Place New Order</button>
      </CenteredCard>
    );
  }

  const amount = `$${Number(order.total).toFixed(2)}`;

  // Payment already submitted — waiting for the team to verify it.
  if (order.status === "Payment Under Review") {
    return (
      <CenteredCard>
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Hourglass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Under Review</h2>
        <p className="text-slate-500 mb-1">
          We've received your payment confirmation for order <span className="font-semibold text-slate-900">{order.id}</span> ({amount}).
        </p>
        <p className="text-slate-500 mb-6 text-sm">
          Our team is verifying it now — work begins the moment it's confirmed, usually within minutes. You can track
          the status from your dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <a href={waMessage(`Hi! I submitted payment for order ${order.id} (${amount}). Just checking in on the confirmation.`)} target="_blank" rel="noreferrer" className="btn-whatsapp">
            <MessageCircle className="w-4 h-4" /> Chat with the Team
          </a>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Go to Dashboard</button>
        </div>
      </CenteredCard>
    );
  }

  // Payment verified (or beyond) — confirmed state.
  if (order.status !== "Awaiting Payment") {
    return (
      <CenteredCard>
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Confirmed!</h2>
        <p className="text-slate-500 mb-1">
          Order <span className="font-semibold text-slate-900">{order.id}</span> is now <span className="font-semibold text-slate-900">{order.status}</span>.
        </p>
        <p className="text-slate-500 mb-6 text-sm">Message us on WhatsApp anytime to share extra materials or check progress.</p>
        <div className="flex flex-col gap-3">
          <a href={waMessage(`Hi! About my order ${order.id} (${order.title}) —`)} target="_blank" rel="noreferrer" className="btn-whatsapp">
            <MessageCircle className="w-4 h-4" /> Message the Team
          </a>
          <button onClick={() => navigate("/dashboard")} className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Go to Dashboard</button>
        </div>
      </CenteredCard>
    );
  }

  const methods = buildMethods(cfg);
  const active = methods.find((m) => m.id === method) || methods[0];
  const isGateway = !!active?.gateway;

  const payViaGateway = async () => {
    setRedirecting(true);
    setError("");
    const gateway = active.id === "paypal_auto" ? "paypal" : active.id;
    const res = await startGatewayPayment(order.id, gateway, accessToken);
    if (res.error) {
      setRedirecting(false);
      setError(res.error);
      return;
    }
    window.location.assign(res.url);
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    const res = await submitPayment(order.id, { method: active.id, reference, token: accessToken });
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setOrder(res.order);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button onClick={() => navigate("/order-now")} className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-4 cursor-pointer"><ArrowLeft className="w-4 h-4" /> Back to Order</button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-academic-200 text-sm mt-1">Complete your payment to confirm order {order.id}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 pb-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-academic p-6 lg:p-8">
            <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2"><CreditCard className="w-5 h-5 text-academic-600" /> Payment Method</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {methods.map((m) => (
                <button key={m.id} onClick={() => { setMethod(m.id); setError(""); }} aria-pressed={active?.id === m.id} className={`px-4 py-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${active?.id === m.id ? "bg-academic-600 text-white border-academic-600" : "bg-white text-slate-600 border-slate-200 hover:border-academic-300"}`}>
                  {m.label}
                  {m.gateway && <span className={`block text-[10px] font-medium mt-0.5 ${active?.id === m.id ? "text-academic-100" : "text-emerald-600"}`}>instant confirmation</span>}
                </button>
              ))}
            </div>

            {isGateway && (
              <div className="p-4 rounded-xl bg-academic-50/60 border border-academic-100 text-sm text-slate-700 space-y-3">
                <p className="font-semibold text-slate-900">Pay {amount} securely {active.id === "stripe" ? "by card" : "with PayPal"}</p>
                <p>
                  You'll be redirected to complete payment{active.id === "stripe" ? " on Stripe's secure checkout" : active.id === "paypal_auto" ? " on PayPal" : ""}.
                  Your order is confirmed <strong>automatically</strong> the moment the payment clears — no waiting for manual review.
                </p>
                <button onClick={payViaGateway} disabled={redirecting} className="btn-primary text-sm disabled:opacity-60">
                  {redirecting ? "Redirecting..." : `Pay ${amount} Now`}
                </button>
              </div>
            )}

            {active?.id === "paypal" && (
              <div className="p-4 rounded-xl bg-academic-50/60 border border-academic-100 text-sm text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">Pay {amount} via PayPal</p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Send <strong>{amount}</strong> to <CopyValue value={CONTACT.email} /></li>
                  <li>Put your order ID <CopyValue value={order.id} /> in the payment note.</li>
                  <li>Paste the PayPal <strong>Transaction ID</strong> below and submit.</li>
                </ol>
              </div>
            )}
            {active?.id === "card" && (
              <div className="p-4 rounded-xl bg-academic-50/60 border border-academic-100 text-sm text-slate-700 space-y-3">
                <p className="font-semibold text-slate-900">Pay {amount} by card — via secure payment link</p>
                <p>Card payments are completed through a secure payment link our team sends you (we never collect card details on this site).</p>
                <a href={waMessage(`Hi! Please send me a secure card payment link for order ${order.id} (${amount}).`)} target="_blank" rel="noreferrer" className="btn-whatsapp text-sm inline-flex">
                  <MessageCircle className="w-4 h-4" /> Request Payment Link
                </a>
                <p>After paying, paste the <strong>confirmation reference</strong> from the payment receipt below.</p>
              </div>
            )}
            {active?.id === "whatsapp" && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 space-y-3">
                <p className="font-semibold">Arrange payment of {amount} on WhatsApp</p>
                <p>Message us with your order ID and we'll agree the most convenient option (PayPal, card link, Zelle, CashApp and more).</p>
                <a href={waMessage(`Hi! I'd like to pay for order ${order.id} (${amount}).`)} target="_blank" rel="noreferrer" className="btn-whatsapp text-sm inline-flex">
                  <MessageCircle className="w-4 h-4" /> Pay via WhatsApp
                </a>
              </div>
            )}

            {!isGateway && (
              <div className="mt-6">
                <label htmlFor="pay-ref" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  {active?.id === "whatsapp" ? "Payment reference (optional)" : "Transaction ID / payment reference"}
                </label>
                <input
                  id="pay-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={active?.id === "paypal" ? "e.g. 7XJ12345AB678901C" : "Paste your payment reference..."}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Your order moves to production as soon as our team verifies the payment — usually within minutes, 24/7.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 px-1">
            By submitting payment you agree to our Terms &amp; Conditions and Privacy Policy. Payments are verified by
            the {BRAND.name} team before work begins; you'll never be charged without an agreed quote.
          </p>
        </div>

        <div className="lg:col-span-1">
          <div className="card-academic p-6 lg:sticky lg:top-24">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Order</dt><dd className="font-semibold text-slate-900">{order.id}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Title</dt><dd className="font-medium text-slate-900 text-right">{order.title}</dd></div>
              {order.service && <div className="flex justify-between"><dt className="text-slate-500">Service</dt><dd className="font-medium text-slate-900 text-right">{order.service}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Level</dt><dd className="font-medium text-slate-900">{order.academicLevel}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Pages</dt><dd className="font-medium text-slate-900">{order.pages}</dd></div>
              {order.slides > 0 && <div className="flex justify-between"><dt className="text-slate-500">Slides</dt><dd className="font-medium text-slate-900">{order.slides}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Deadline</dt><dd className="font-medium text-slate-900">{order.deadline}</dd></div>
            </dl>
            <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-end">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-academic-700">{amount}</span>
            </div>
            {error && <p role="alert" className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</p>}
            {isGateway ? (
              <button onClick={payViaGateway} disabled={redirecting} className="btn-primary w-full mt-5 disabled:opacity-60">
                {redirecting ? "Redirecting..." : `Pay ${amount} Now`}
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} className="btn-primary w-full mt-5 disabled:opacity-60">
                {submitting ? "Submitting..." : "I've Sent the Payment"}
              </button>
            )}
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-4">
              <ShieldCheck className="w-3.5 h-3.5" /> {isGateway ? "Gateway-verified · instant confirmation" : "Verified by our team · 100% confidential"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
