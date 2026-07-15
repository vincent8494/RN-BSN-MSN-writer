import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { navigate } from "../router.jsx";
import { useApp } from "../store.jsx";
import { BRAND, ACADEMIC_LEVELS } from "../data.js";

export default function Signup() {
  const { signup } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [level, setLevel] = useState("");
  const [agree, setAgree] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) return setError("Please fill in all required fields.");
    if (!level) return setError("Please select your academic level.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (!agree) return setError("Please agree to the Terms & Conditions.");
    setLoading(true);
    const res = await signup({ name, email, password, level });
    setLoading(false);
    if (res.error) setError(res.error);
    else navigate("/dashboard");
  };

  const inputBase = "w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20";

  return (
    <div className="min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)] flex pt-16 lg:pt-20">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-academic-900 via-academic-800 to-academic-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-24 right-16 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-16 left-16 w-96 h-96 bg-academic-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Logo className="w-14 h-14 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Join {BRAND.short}</h2>
            <p className="text-academic-100 leading-relaxed max-w-md mb-8">Create an account to place orders, track progress and download your completed work — with distinguished grades guaranteed.</p>
            <ul className="space-y-3">
              {["100% human-written · no AI", "Unlimited free revisions", "24-hour turnaround", "100% privacy guaranteed"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-academic-100 text-sm"><CheckCircle2 className="w-4 h-4 text-academic-300" /> {t}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h1>
          <p className="text-slate-500 text-sm mb-6">Join our community of nursing scholars.</p>

          {error && <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="su-name" className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="su-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={inputBase} /></div>
            </div>
            <div>
              <label htmlFor="su-email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="su-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputBase} /></div>
            </div>
            <div>
              <label htmlFor="su-level" className="block text-xs font-semibold text-slate-700 mb-1.5">Academic Level</label>
              <select id="su-level" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20">
                <option value="">Select your level...</option>
                {ACADEMIC_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="su-password" className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="su-password" type={show ? "text" : "password"} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" className={inputBase} /><button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
              </div>
              <div>
                <label htmlFor="su-confirm" className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm</label>
                <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input id="su-confirm" type={show ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" className={inputBase} /></div>
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-academic-600" />
              <span>I agree to the Terms &amp; Conditions and Privacy Policy.</span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Creating account..." : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="font-semibold text-academic-600 hover:text-academic-700 cursor-pointer">Sign in</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
