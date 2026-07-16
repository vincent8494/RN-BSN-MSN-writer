import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Mail, Lock, LogOut, LayoutDashboard, FileText, Star,
  HelpCircle, FileStack, Inbox, Settings as SettingsIcon, Trash2, Pencil,
  Plus, X, CheckCircle2, CreditCard, XCircle, DollarSign, Eye, Download, Upload, Paperclip,
} from "lucide-react";
import { navigate } from "../router.jsx";
import Logo from "../components/Logo.jsx";
import {
  useApp, fetchOrders, setOrderStatus, deleteOrder, fetchMessages, deleteMessage, ORDER_STATUSES,
  fetchPayments, verifyPayment, rejectPayment,
  listOrderFiles, uploadDeliverable, uploadRequirement, downloadOrderFile, removeOrderFile,
} from "../store.jsx";
import { BRAND, ACADEMIC_LEVELS, DEADLINES } from "../data.js";

const STATUS_STYLES = {
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Revisions: "bg-amber-100 text-amber-700",
  "Awaiting Payment": "bg-purple-100 text-purple-700",
  "Payment Under Review": "bg-indigo-100 text-indigo-700",
  Cancelled: "bg-red-100 text-red-700",
  Technical: "bg-rose-100 text-rose-700",
};

const PAYMENT_STYLES = {
  submitted: "bg-indigo-100 text-indigo-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "samples", label: "Samples", icon: FileStack },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl bg-slate-900 text-white text-sm shadow-2xl flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {msg}
    </div>
  );
}

/* ------------------------------------------------------------ Login gate */
function LoginGate() {
  const { login, logout } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login({ email, password });
    if (res.user && res.user.role !== "admin") {
      await logout();
      res.error = "Invalid admin credentials.";
    }
    setLoading(false);
    if (res.error) setError(res.error);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-academic-600" />
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-academic-600 to-academic-800 text-white flex items-center justify-center rounded-xl mb-4"><Shield className="w-7 h-7" /></div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">{BRAND.short}</h2>
          <span className="text-xs font-semibold text-academic-600 tracking-wider mt-1">Admin Workspace</span>
        </div>
        {error && <div role="alert" className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full text-sm pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-academic-500 focus:outline-none" /></div>
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full text-sm pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-academic-500 focus:outline-none" /></div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <button onClick={() => navigate("/")} className="block mx-auto mt-5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">← Back to site</button>
      </motion.div>
    </div>
  );
}

/* --------------------------------------------------------------- Sections */
function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="card-academic p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      <input {...props} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-academic-500" />
    </div>
  );
}
function Area({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea {...props} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-academic-500 resize-none" />
    </div>
  );
}

/* ------------------------------------------------------------------ Admin */
export default function Admin() {
  const app = useApp();
  const { user, authChecked, logout } = app;
  const isAdmin = !!user && user.role === "admin";
  const [tab, setTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState("");
  const [edit, setEdit] = useState(null); // { type, data }
  const [detailOrder, setDetailOrder] = useState(null); // order shown in the workspace modal

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders().then((res) => setOrders(res.orders || []));
    fetchPayments().then((res) => setPayments(res.payments || []));
    fetchMessages().then((res) => setMessages(res.messages || []));
  }, [isAdmin]);

  const notify = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  if (!authChecked) return null;
  if (!isAdmin) return <LoginGate />;

  const doLogout = async () => { await logout(); navigate("/"); };
  const refreshOrdersAndPayments = async () => {
    const [o, p] = await Promise.all([fetchOrders(), fetchPayments()]);
    setOrders(o.orders || []);
    setPayments(p.payments || []);
  };
  const changeStatus = async (id, status) => {
    const res = await setOrderStatus(id, status);
    if (res.error) return notify(res.error);
    await refreshOrdersAndPayments();
    notify(`Order ${id} → "${status}"`);
  };
  const decidePayment = async (id, action) => {
    const res = await (action === "verify" ? verifyPayment(id) : rejectPayment(id));
    if (res.error) return notify(res.error);
    await refreshOrdersAndPayments();
    notify(action === "verify" ? "Payment verified — order is now In Progress." : "Payment rejected — order returned to Awaiting Payment.");
  };
  const removeMessage = async (id) => {
    const res = await deleteMessage(id);
    if (res.error) return notify(res.error);
    setMessages((p) => p.filter((m) => m.id !== id));
    notify("Message deleted.");
  };
  const removeOrder = async (id) => {
    if (!window.confirm(`Permanently delete order ${id}? This also removes its payment records and cannot be undone.`)) return;
    const res = await deleteOrder(id);
    if (res.error) return notify(res.error);
    await refreshOrdersAndPayments();
    notify(`Order ${id} deleted.`);
  };

  // Revenue counts only admin-verified payments — not unpaid orders.
  const revenue = payments.filter((p) => p.status === "verified").reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const pendingPayments = payments.filter((p) => p.status === "submitted").length;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* sidebar */}
      <aside className="w-16 lg:w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
          <Logo className="w-9 h-9 shrink-0" />
          <div className="hidden lg:block"><p className="text-white font-bold text-sm leading-tight">{BRAND.short}</p><p className="text-[10px] text-academic-300">Admin</p></div>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${tab === t.id ? "bg-academic-600 text-white" : "hover:bg-slate-800"}`}>
              <t.icon className="w-4 h-4 shrink-0" /> <span className="hidden lg:inline">{t.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={doLogout} className="m-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-800 cursor-pointer"><LogOut className="w-4 h-4 shrink-0" /> <span className="hidden lg:inline">Logout</span></button>
      </aside>

      {/* main */}
      <main className="flex-1 min-w-0 p-6 lg:p-8">
        {tab === "dashboard" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Stat icon={FileText} label="Total Orders" value={orders.length} color="bg-academic-50 text-academic-600" />
              <Stat icon={CreditCard} label="Payments to Verify" value={pendingPayments} color="bg-indigo-50 text-indigo-600" />
              <Stat icon={Inbox} label="Messages" value={messages.length} color="bg-amber-50 text-amber-600" />
              <Stat icon={Star} label="Verified Revenue" value={`$${revenue.toFixed(0)}`} color="bg-purple-50 text-purple-600" />
            </div>
            <div className="card-academic p-6">
              <h2 className="font-bold text-slate-900 mb-4">Recent Orders</h2>
              {orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : (
                <div className="space-y-2">
                  {orders.slice(0, 6).map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 text-sm">
                      <span className="font-semibold text-slate-900">{o.id}</span>
                      <span className="text-slate-600 flex-1 truncate">{o.title}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status] || "bg-slate-100 text-slate-600"}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "orders" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Orders</h1>
            <div className="card-academic overflow-x-auto">
              {orders.length === 0 ? <p className="p-8 text-sm text-slate-500 text-center">No orders yet.</p> : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr><th className="px-4 py-3 text-left">Order</th><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">Deadline</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{o.id}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                          {o.title}
                          {o.requirementCount > 0 && (
                            <span title={`${o.requirementCount} customer file(s)`} className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-semibold text-academic-600 align-middle"><Paperclip className="w-3 h-3" />{o.requirementCount}</span>
                          )}
                          {o.deliverableCount > 0 && (
                            <span title={`${o.deliverableCount} delivered file(s)`} className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 align-middle"><CheckCircle2 className="w-3 h-3" />done</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-900">${Number(o.total).toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.deadline}</td>
                        <td className="px-4 py-3">
                          <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_STYLES[o.status] || "bg-slate-100 text-slate-600"}`}>
                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button onClick={() => setDetailOrder(o)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-academic-600 hover:text-academic-700 mr-3 cursor-pointer"><Eye className="w-4 h-4" /> View</button>
                          <button onClick={() => removeOrder(o.id)} aria-label={`Delete order ${o.id}`} className="text-slate-400 hover:text-red-500 cursor-pointer align-middle"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === "payments" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Payments</h1>
            <div className="card-academic overflow-x-auto">
              {payments.length === 0 ? <p className="p-8 text-sm text-slate-500 text-center">No payments submitted yet.</p> : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Order</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Method</th>
                      <th className="px-4 py-3 text-left">Reference</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{p.orderId}</span>
                          {p.orderTitle && <span className="block text-xs text-slate-400 max-w-[160px] truncate">{p.orderTitle}</span>}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">${Number(p.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-600 capitalize">{p.method}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{p.reference || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PAYMENT_STYLES[p.status] || "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {p.status === "submitted" ? (
                            <div className="inline-flex gap-2">
                              <button onClick={() => decidePayment(p.id, "verify")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                              </button>
                              <button onClick={() => decidePayment(p.id, "reject")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer">
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">{p.verifiedAt ? `verified ${p.verifiedAt}` : "—"}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {tab === "testimonials" && (
          <CrudSection
            title="Testimonials" items={app.testimonials}
            onAdd={() => setEdit({ type: "testimonials", data: { name: "", role: "", feedback: "", rating: 5, avatar: "" } })}
            onEdit={(d) => setEdit({ type: "testimonials", data: d })}
            onDelete={async (id) => { const r = await app.deleteTestimonial(id); notify(r?.error || "Testimonial deleted."); }}
            render={(t) => (<><p className="font-semibold text-slate-900">{t.name}</p><p className="text-xs text-academic-600">{t.role}</p><p className="text-sm text-slate-600 mt-1 line-clamp-2">{t.feedback}</p></>)}
          />
        )}
        {tab === "faq" && (
          <CrudSection
            title="FAQ" items={[...app.faq].sort((a, b) => a.order - b.order)}
            onAdd={() => setEdit({ type: "faq", data: { question: "", answer: "", order: app.faq.length + 1 } })}
            onEdit={(d) => setEdit({ type: "faq", data: d })}
            onDelete={async (id) => { const r = await app.deleteFAQ(id); notify(r?.error || "FAQ deleted."); }}
            render={(f) => (<><p className="font-semibold text-slate-900">{f.question}</p><p className="text-sm text-slate-600 mt-1 line-clamp-2">{f.answer}</p></>)}
          />
        )}
        {tab === "samples" && (
          <CrudSection
            title="Samples" items={app.samplePapers}
            onAdd={() => setEdit({ type: "samples", data: { title: "", category: "", description: "", school: "", subject: "Nursing", level: "BSN", pages: 8 } })}
            onEdit={(d) => setEdit({ type: "samples", data: d })}
            onDelete={async (id) => { const r = await app.deleteSamplePaper(id); notify(r?.error || "Sample deleted."); }}
            render={(s) => (<><p className="font-semibold text-slate-900">{s.title}</p><p className="text-xs text-academic-600">{s.category} · {s.school}</p><p className="text-sm text-slate-600 mt-1 line-clamp-2">{s.description}</p></>)}
          />
        )}

        {tab === "messages" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>
            {messages.length === 0 ? <div className="card-academic p-8 text-center text-sm text-slate-500">No messages yet.</div> : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="card-academic p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{m.fullName} <span className="text-xs font-normal text-slate-400">· {m.email}</span></p>
                        {m.serviceType && <p className="text-xs text-academic-600">{m.serviceType}{m.phone ? ` · ${m.phone}` : ""}</p>}
                        <p className="text-sm text-slate-600 mt-2">{m.message}</p>
                      </div>
                      <button onClick={() => removeMessage(m.id)} aria-label="Delete message" className="text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "pricing" && <PricingPanel app={app} notify={notify} />}
        {tab === "settings" && <SettingsPanel app={app} notify={notify} />}
      </main>

      {edit && <EditModal edit={edit} app={app} onClose={() => setEdit(null)} notify={notify} />}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          notify={notify}
          onOrderChange={async (updated) => {
            await refreshOrdersAndPayments();
            setDetailOrder((cur) => (cur && updated && cur.id === updated.id ? { ...cur, ...updated } : cur));
          }}
        />
      )}
      <Toast msg={toast} />
    </div>
  );
}

function CrudSection({ title, items, onAdd, onEdit, onDelete, render }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <button onClick={onAdd} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="card-academic p-5 flex items-start justify-between gap-3">
            <div className="min-w-0">{render(item)}</div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => onEdit(item)} aria-label="Edit" className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-academic-600 cursor-pointer"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => onDelete(item.id)} aria-label="Delete" className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500 col-span-2">Nothing here yet — click "Add" to create one.</p>}
      </div>
    </>
  );
}

const fmtSize = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function FileRow({ f, orderId, onDownload, onDelete }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-white">
      <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-800 truncate">{f.filename}</p>
        <p className="text-[11px] text-slate-400">{fmtSize(f.size)} · {f.uploadedBy === "admin" ? "you" : "customer"}</p>
      </div>
      <button onClick={() => onDownload(f)} aria-label={`Download ${f.filename}`} className="p-1.5 rounded-lg text-academic-600 hover:bg-academic-50 cursor-pointer"><Download className="w-4 h-4" /></button>
      {onDelete && <button onClick={() => onDelete(f)} aria-label={`Delete ${f.filename}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>}
    </div>
  );
}

// The writer workspace: full order requirements, customer files to download,
// deliverable upload (auto-completes the order), and manual status control.
function OrderDetailModal({ order, onClose, notify, onOrderChange }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(order.status);

  const load = async () => {
    setLoading(true);
    const res = await listOrderFiles(order.id);
    setFiles(res.files || []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [order.id]);

  const requirements = files.filter((f) => f.kind === "requirement");
  const deliverables = files.filter((f) => f.kind === "deliverable");

  const download = async (f) => {
    const r = await downloadOrderFile(order.id, f.id);
    if (r.error) notify(r.error);
  };
  const del = async (f) => {
    if (!window.confirm(`Delete "${f.filename}"?`)) return;
    const r = await removeOrderFile(order.id, f.id);
    if (r.error) return notify(r.error);
    await load();
    notify("File deleted.");
    onOrderChange?.({ id: order.id });
  };
  const onDeliverable = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const r = await uploadDeliverable(order.id, file);
    setBusy(false);
    if (r.error) return notify(r.error);
    await load();
    if (r.order) { setStatus(r.order.status); onOrderChange?.(r.order); }
    notify("Work uploaded — order marked Completed. The customer can now download it.");
  };
  const onAddRequirement = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    const r = await uploadRequirement(order.id, file);
    setBusy(false);
    if (r.error) return notify(r.error);
    await load();
    notify("File added.");
  };
  const changeStatus = async (next) => {
    setStatus(next);
    const r = await setOrderStatus(order.id, next);
    if (r.error) return notify(r.error);
    onOrderChange?.({ id: order.id, status: next });
    notify(`Status → "${next}"`);
  };

  const rows = [
    ["Academic level", order.academicLevel], ["School / Program", order.school],
    ["Service", order.service], ["Paper type", order.paperType],
    ["Topic / Subject", order.subject], ["Pages", order.pages],
    ["Slides", order.slides], ["Sources", order.sources],
    ["Deadline", order.deadline],
    ["Total", `$${Number(order.total).toFixed(2)}`],
    ["Customer", order.customerName || "—"],
    ["Phone", order.customerPhone || "—"],
    ["Email", order.guestEmail || "Registered account"],
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-slate-900">{order.id}</h3>
            <p className="text-sm text-slate-500 truncate max-w-[420px]">{order.title}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</span>
            <select value={status} onChange={(e) => changeStatus(e.target.value)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"}`}>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Requirements / details */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Order requirements</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-slate-50 py-1">
                  <dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-900 text-right">{v}</dd>
                </div>
              ))}
            </dl>
            {order.description && (
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Instructions</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{order.description}</p>
              </div>
            )}
          </div>

          {/* Customer files */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900">Customer files ({requirements.length})</h4>
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-academic-600 hover:text-academic-700 cursor-pointer">
                <Plus className="w-4 h-4" /> Add file
                <input type="file" className="hidden" onChange={onAddRequirement} disabled={busy} />
              </label>
            </div>
            {loading ? <p className="text-sm text-slate-400">Loading…</p> : requirements.length === 0 ? (
              <p className="text-sm text-slate-400">No files from the customer.</p>
            ) : (
              <div className="space-y-2">{requirements.map((f) => <FileRow key={f.id} f={f} orderId={order.id} onDownload={download} onDelete={del} />)}</div>
            )}
          </div>

          {/* Deliverables */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Completed work</h4>
            <p className="text-xs text-slate-500 mb-3">Upload the finished file — the order is marked <b>Completed</b> and the customer can download it.</p>
            {deliverables.length > 0 && (
              <div className="space-y-2 mb-3">{deliverables.map((f) => <FileRow key={f.id} f={f} orderId={order.id} onDownload={download} onDelete={del} />)}</div>
            )}
            <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${busy ? "border-slate-200 text-slate-400" : "border-academic-300 text-academic-700 hover:bg-academic-50"}`}>
              <Upload className="w-4 h-4" /> {busy ? "Uploading…" : "Upload completed work"}
              <input type="file" className="hidden" onChange={onDeliverable} disabled={busy} />
            </label>
            <p className="text-[11px] text-slate-400 mt-2">Max 4 MB per file. Accepted: pdf, doc(x), txt, rtf, ppt(x), xls(x), csv, zip, images.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ edit, app, onClose, notify }) {
  const [data, setData] = useState(edit.data);
  const isNew = !edit.data.id;
  const upd = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const { type } = edit;
    setSaving(true);
    let res;
    if (type === "testimonials") res = isNew ? await app.addTestimonial(data) : await app.updateTestimonial(data);
    else if (type === "faq") res = isNew ? await app.addFAQ({ ...data, order: parseInt(data.order) || 1 }) : await app.updateFAQ({ ...data, order: parseInt(data.order) || 1 });
    else if (type === "samples") res = isNew ? await app.addSamplePaper({ ...data, pages: parseInt(data.pages) || 1 }) : await app.updateSamplePaper({ ...data, pages: parseInt(data.pages) || 1 });
    setSaving(false);
    if (res?.error) { notify(res.error); return; }
    notify(isNew ? "Added!" : "Updated!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 capitalize">{isNew ? "Add" : "Edit"} {edit.type}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={save} className="p-5 space-y-4">
          {edit.type === "testimonials" && (<>
            <Field label="Name" value={data.name} onChange={(e) => upd("name", e.target.value)} required />
            <Field label="Role" value={data.role} onChange={(e) => upd("role", e.target.value)} />
            <Field label="Avatar URL" value={data.avatar} onChange={(e) => upd("avatar", e.target.value)} />
            <Area label="Feedback" rows={4} value={data.feedback} onChange={(e) => upd("feedback", e.target.value)} required />
            <Field label="Rating (1-5)" type="number" min={1} max={5} value={data.rating} onChange={(e) => upd("rating", parseInt(e.target.value) || 5)} />
          </>)}
          {edit.type === "faq" && (<>
            <Field label="Question" value={data.question} onChange={(e) => upd("question", e.target.value)} required />
            <Area label="Answer" rows={4} value={data.answer} onChange={(e) => upd("answer", e.target.value)} required />
            <Field label="Order" type="number" value={data.order} onChange={(e) => upd("order", e.target.value)} />
          </>)}
          {edit.type === "samples" && (<>
            <Field label="Title" value={data.title} onChange={(e) => upd("title", e.target.value)} required />
            <Field label="Category" value={data.category} onChange={(e) => upd("category", e.target.value)} />
            <Field label="School" value={data.school} onChange={(e) => upd("school", e.target.value)} />
            <Area label="Description" rows={3} value={data.description} onChange={(e) => upd("description", e.target.value)} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Subject" value={data.subject} onChange={(e) => upd("subject", e.target.value)} />
              <Field label="Level" value={data.level} onChange={(e) => upd("level", e.target.value)} />
              <Field label="Pages" type="number" value={data.pages} onChange={(e) => upd("pages", e.target.value)} />
            </div>
          </>)}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Compact numeric cell for the price grid.
function NumCell({ value, onChange, prefix }) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">{prefix}</span>}
      <input
        type="number" min="0" step="0.01" value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${prefix ? "pl-5" : "pl-2"} pr-1 py-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:border-academic-500`}
      />
    </div>
  );
}

// Admin pricing editor — the per-page grid, service multipliers, slide price,
// coupon and flat-rate cards. Saving pushes the whole config to the server,
// which becomes the authoritative source for order totals and every price
// shown on the site.
function PricingPanel({ app, notify }) {
  const [p, setP] = useState(() => JSON.parse(JSON.stringify(app.pricing)));
  const [saving, setSaving] = useState(false);
  const levels = ACADEMIC_LEVELS;

  const setPerPage = (lvl, key, v) =>
    setP((prev) => ({ ...prev, perPage: { ...prev.perPage, [lvl]: { ...prev.perPage[lvl], [key]: v } } }));
  const setMult = (key, v) =>
    setP((prev) => ({ ...prev, serviceMultipliers: { ...prev.serviceMultipliers, [key]: v } }));
  const setTop = (key, v) => setP((prev) => ({ ...prev, [key]: v }));
  const setCard = (i, key, v) =>
    setP((prev) => ({ ...prev, classRates: prev.classRates.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)) }));
  const addCard = () =>
    setP((prev) => ({ ...prev, classRates: [...prev.classRates, { id: `rate-${Date.now()}`, school: "", program: "", rate: "$", unit: "per class", alt: "", features: [], popular: false }] }));
  const removeCard = (i) => setP((prev) => ({ ...prev, classRates: prev.classRates.filter((_, idx) => idx !== i) }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await app.updatePricing(p);
    setSaving(false);
    if (res?.error) { notify(res.error); return; }
    if (res?.pricing) setP(JSON.parse(JSON.stringify(res.pricing)));
    notify("Pricing updated — live on the site.");
  };

  const cell = "px-2 py-2 text-center";
  return (
    <form onSubmit={save} className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900">Pricing</h1>
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? "Saving..." : "Save Pricing"}</button>
      </div>
      <p className="text-sm text-slate-500 -mt-4">Changes go live immediately for every visitor and become the amount the server charges on new orders.</p>

      {/* Per-page rate grid */}
      <section className="card-academic p-5">
        <h2 className="font-bold text-slate-900 mb-1">Per-Page Rates (USD)</h2>
        <p className="text-xs text-slate-500 mb-4">Base price per page by academic level and deadline. Drives the order calculator and the charged total.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Level</th>
                {DEADLINES.map((d) => <th key={d.key} className={`${cell} text-xs font-bold text-slate-600`}>{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {levels.map((lvl) => (
                <tr key={lvl} className="border-t border-slate-100">
                  <td className="px-2 py-2 font-semibold text-slate-800 whitespace-nowrap">{lvl}</td>
                  {DEADLINES.map((d) => (
                    <td key={d.key} className="px-1 py-1 min-w-[64px]">
                      <NumCell prefix="$" value={p.perPage[lvl]?.[d.key] ?? ""} onChange={(v) => setPerPage(lvl, d.key, v)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Multipliers, slide price, coupon */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="card-academic p-5">
          <h2 className="font-bold text-slate-900 mb-1">Service Multipliers</h2>
          <p className="text-xs text-slate-500 mb-4">Per-page rate is multiplied by this for each service type.</p>
          <div className="space-y-3">
            {[["writing", "Writing from scratch"], ["editing", "Editing & rewriting"], ["proofreading", "Proofreading"]].map(([key, lbl]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">{lbl}</span>
                <div className="w-24"><NumCell prefix="×" value={p.serviceMultipliers[key] ?? ""} onChange={(v) => setMult(key, v)} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="card-academic p-5">
          <h2 className="font-bold text-slate-900 mb-1">Add-ons</h2>
          <p className="text-xs text-slate-500 mb-4">Extra charges applied on top of the per-page rate.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Price per slide</span>
              <div className="w-24"><NumCell prefix="$" value={p.pricePerSlide ?? ""} onChange={(v) => setTop("pricePerSlide", v)} /></div>
            </div>
          </div>
        </section>
      </div>

      {/* Flat-rate cards */}
      <section className="card-academic p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-slate-900">Flat-Rate Cards</h2>
          <button type="button" onClick={addCard} className="inline-flex items-center gap-1.5 text-sm font-semibold text-academic-600 hover:text-academic-700 cursor-pointer"><Plus className="w-4 h-4" /> Add card</button>
        </div>
        <p className="text-xs text-slate-500 mb-4">The per-class price cards on the Pricing page and home page.</p>
        <div className="space-y-4">
          {p.classRates.map((c, i) => (
            <div key={c.id || i} className="rounded-xl border border-slate-200 p-4 relative">
              <button type="button" onClick={() => removeCard(i)} aria-label="Remove card" className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <Field label="School" value={c.school} onChange={(e) => setCard(i, "school", e.target.value)} />
                <Field label="Program" value={c.program} onChange={(e) => setCard(i, "program", e.target.value)} />
                <Field label="Rate" value={c.rate} onChange={(e) => setCard(i, "rate", e.target.value)} />
                <Field label="Unit" value={c.unit} onChange={(e) => setCard(i, "unit", e.target.value)} />
                <Field label="Sub-note" value={c.alt} onChange={(e) => setCard(i, "alt", e.target.value)} />
                <label className="flex items-end gap-2 pb-2.5 text-sm text-slate-700">
                  <input type="checkbox" checked={!!c.popular} onChange={(e) => setCard(i, "popular", e.target.checked)} className="w-4 h-4" /> Most popular
                </label>
              </div>
              <Area label="Features (one per line)" rows={4} value={(c.features || []).join("\n")} onChange={(e) => setCard(i, "features", e.target.value.split("\n").map((f) => f.trim()).filter(Boolean))} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Area label="Note under the cards" rows={2} value={p.classNote ?? ""} onChange={(e) => setTop("classNote", e.target.value)} />
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? "Saving..." : "Save Pricing"}</button>
      </div>
    </form>
  );
}

function SettingsPanel({ app, notify }) {
  const [s, setS] = useState(app.settings);
  const upd = (k, v) => setS((x) => ({ ...x, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    const res = await app.updateSettings(s);
    notify(res?.error || "Settings saved!");
  };
  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Site Settings</h1>
      <form onSubmit={save} className="card-academic p-6 space-y-4 max-w-2xl">
        <Field label="Hero Tagline" value={s.heroTagline} onChange={(e) => upd("heroTagline", e.target.value)} />
        <Field label="Hero Title (line 1)" value={s.heroTitle1} onChange={(e) => upd("heroTitle1", e.target.value)} />
        <Field label="Hero Title (line 2 — accented)" value={s.heroTitle2} onChange={(e) => upd("heroTitle2", e.target.value)} />
        <Area label="Hero Description" rows={3} value={s.heroDescription} onChange={(e) => upd("heroDescription", e.target.value)} />
        <Field label="Contact Location" value={s.contactLocation} onChange={(e) => upd("contactLocation", e.target.value)} />
        <Field label="Recipient Email" value={s.recipientEmail} onChange={(e) => upd("recipientEmail", e.target.value)} />
        <button type="submit" className="btn-primary">Save Settings</button>
      </form>
    </>
  );
}
