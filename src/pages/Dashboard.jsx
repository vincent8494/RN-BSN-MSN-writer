import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LogOut, Plus, FileText, Clock, CheckCircle2, RefreshCw,
  MessageCircle, Wallet, LayoutDashboard, ArrowRight, Download,
} from "lucide-react";
import { navigate } from "../router.jsx";
import Logo from "../components/Logo.jsx";
import { useApp, fetchOrders, listOrderFiles, downloadOrderFile } from "../store.jsx";
import { BRAND, CONTACT, waMessage } from "../data.js";

const STATUS_STYLES = {
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Revisions: "bg-amber-100 text-amber-700",
  "Awaiting Payment": "bg-purple-100 text-purple-700",
  "Payment Under Review": "bg-indigo-100 text-indigo-700",
  Cancelled: "bg-red-100 text-red-700",
  Technical: "bg-rose-100 text-rose-700",
};

export default function Dashboard() {
  const { user, authChecked, logout } = useApp();
  const [orders, setOrders] = useState([]);

  const [downloading, setDownloading] = useState("");
  const loadOrders = () => fetchOrders().then((res) => setOrders(res.orders || []));

  // Fetch the order's deliverable(s) and download them.
  const downloadWork = async (orderId) => {
    setDownloading(orderId);
    const res = await listOrderFiles(orderId);
    const deliverables = (res.files || []).filter((f) => f.kind === "deliverable");
    if (!deliverables.length) {
      setDownloading("");
      alert("Your completed work isn't available to download yet. Please check back shortly.");
      return;
    }
    for (const f of deliverables) await downloadOrderFile(orderId, f.id);
    setDownloading("");
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role === "admin") {
      navigate("/admin");
      return;
    }
    loadOrders();
  }, [authChecked, user]);

  if (!authChecked || !user || user.role === "admin") return null;

  const doLogout = async () => {
    await logout();
    navigate("/");
  };

  const spent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const stats = [
    { label: "Total Orders", value: orders.length, icon: FileText, color: "bg-academic-50 text-academic-600" },
    { label: "In Progress", value: orders.filter((o) => o.status === "In Progress").length, icon: Clock, color: "bg-blue-50 text-blue-600" },
    { label: "Completed", value: orders.filter((o) => o.status === "Completed").length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total Spent", value: `$${spent.toFixed(0)}`, icon: Wallet, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-academic-500 to-academic-700 flex items-center justify-center"><Logo className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-slate-900 text-sm hidden sm:block">{BRAND.short}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">Hi, <span className="font-semibold text-slate-900">{user.name}</span></span>
            <button onClick={doLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"><LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-academic-600" /> My Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back — here's an overview of your orders.</p>
          </div>
          <button onClick={() => navigate("/order-now")} className="btn-primary"><Plus className="w-4 h-4" /> New Order</button>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-academic p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* completion notice */}
        {orders.some((o) => o.status === "Completed") && (
          <div className="mb-6 card-academic p-4 bg-emerald-50 border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-800">
              <b>{orders.filter((o) => o.status === "Completed").length}</b> of your orders {orders.filter((o) => o.status === "Completed").length === 1 ? "is" : "are"} complete — use the <b>Download Work</b> button to get your files.
            </p>
          </div>
        )}

        {/* orders */}
        <div className="card-academic overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">My Orders</h2>
            <button onClick={loadOrders} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-academic-600 cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-1">No orders yet</h3>
              <p className="text-slate-500 text-sm mb-5">Place your first order and it'll show up here.</p>
              <button onClick={() => navigate("/order-now")} className="btn-primary mx-auto">Place an Order <ArrowRight className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">Order</th>
                    <th className="px-5 py-3 text-left font-semibold">Title</th>
                    <th className="px-5 py-3 text-left font-semibold">Deadline</th>
                    <th className="px-5 py-3 text-left font-semibold">Total</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900 whitespace-nowrap">{o.id}</td>
                      <td className="px-5 py-4 text-slate-600 max-w-[220px] truncate">{o.title}</td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{o.deadline}</td>
                      <td className="px-5 py-4 font-medium text-slate-900">${Number(o.total).toFixed(2)}</td>
                      <td className="px-5 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[o.status] || "bg-slate-100 text-slate-600"}`}>{o.status}</span></td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {o.status === "Awaiting Payment" && (
                          <button onClick={() => navigate(`/checkout?order=${encodeURIComponent(o.id)}`)} className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-academic-600 hover:bg-academic-700 px-3 py-1.5 rounded-lg mr-3 cursor-pointer">Pay Now</button>
                        )}
                        {o.status === "Completed" && (
                          <button onClick={() => downloadWork(o.id)} disabled={downloading === o.id} className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg mr-3 cursor-pointer disabled:opacity-60">
                            <Download className="w-3.5 h-3.5" /> {downloading === o.id ? "Preparing…" : "Download Work"}
                          </button>
                        )}
                        <a href={waMessage(`Hi! About my order ${o.id} (${o.title}) —`)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#25d366] hover:underline"><MessageCircle className="w-3.5 h-3.5" /> Message</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 card-academic p-6 bg-gradient-to-br from-academic-50 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900">Need help fast?</h3>
            <p className="text-sm text-slate-600">Message us on WhatsApp for instant support on any order.</p>
          </div>
          <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp shrink-0"><MessageCircle className="w-4 h-4" /> Chat with us</a>
        </div>
      </main>
    </div>
  );
}
