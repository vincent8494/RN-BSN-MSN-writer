import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle, X, KeyRound } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { navigate } from "../router.jsx";
import { useApp } from "../store.jsx";
import { BRAND, CONTACT, waMessage } from "../data.js";

function RecoverModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label="Recover your password"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-academic-50 text-academic-600 flex items-center justify-center"><KeyRound className="w-5 h-5" /></div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <h2 className="font-bold text-slate-900 mb-1">Recover your password</h2>
        {sent ? (
          <>
            <p className="text-sm text-slate-600 mb-5">
              Message our support team on WhatsApp from the button below (or email us) mentioning
              <span className="font-semibold text-slate-900"> {email}</span> and we'll verify you and reset your
              password right away — usually within minutes.
            </p>
            <a
              href={waMessage(`Hi! I need to reset the password for my account (${email}).`)}
              target="_blank" rel="noreferrer" className="btn-whatsapp w-full text-sm"
            >
              <MessageCircle className="w-4 h-4" /> Contact Support on WhatsApp
            </a>
          </>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-600">Enter your account email and we'll get you back in.</p>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com" aria-label="Account email"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Recover</button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recover, setRecover] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (res.error) setError(res.error);
    else navigate(res.user.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)] flex pt-16 lg:pt-20">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-academic-900 via-academic-800 to-academic-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-academic-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Logo className="w-14 h-14 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Welcome back to {BRAND.short}</h2>
            <p className="text-academic-100 leading-relaxed max-w-md">Track your orders, message your writer and download completed work — all in one place. Distinguished grades, delivered on time.</p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h1>
          <p className="text-slate-500 text-sm mb-6">Access your dashboard and order history.</p>

          {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="login-password" type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setRecover(true)} className="text-xs font-medium text-academic-600 hover:text-academic-700 cursor-pointer">Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">or</span><div className="flex-1 h-px bg-slate-200" /></div>

          <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp w-full text-sm"><MessageCircle className="w-4 h-4" /> Continue on WhatsApp</a>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} className="font-semibold text-academic-600 hover:text-academic-700 cursor-pointer">Sign up</button>
          </p>
        </motion.div>
      </div>
      <AnimatePresence>
        {recover && <RecoverModal onClose={() => setRecover(false)} />}
      </AnimatePresence>
    </div>
  );
}
