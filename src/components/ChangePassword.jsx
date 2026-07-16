import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useApp } from "../store.jsx";

// Self-service password change. The server re-verifies the current password,
// enforces strength, and signs out every other session on success.
export default function ChangePassword({ compact = false }) {
  const { changePassword } = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("New passwords don't match.");
    setBusy(true);
    const res = await changePassword(current, next);
    setBusy(false);
    if (res.error) return setError(res.error);
    setDone(true);
    setCurrent(""); setNext(""); setConfirm("");
  };

  const field = "w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-academic-500";
  const label = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={submit} className={compact ? "space-y-3" : "card-academic p-6 space-y-4 max-w-2xl"}>
      {!compact && (
        <h2 className="font-bold text-slate-900 flex items-center gap-2"><Lock className="w-4 h-4 text-academic-600" /> Change Password</h2>
      )}
      <div className={compact ? "space-y-3" : "grid sm:grid-cols-3 gap-4"}>
        <div>
          <label htmlFor="cp-current" className={label}>Current password</label>
          <input id="cp-current" type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required className={field} />
        </div>
        <div>
          <label htmlFor="cp-new" className={label}>New password</label>
          <input id="cp-new" type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required className={field} />
        </div>
        <div>
          <label htmlFor="cp-confirm" className={label}>Confirm new password</label>
          <input id="cp-confirm" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} required className={field} />
        </div>
      </div>
      <button type="button" onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {show ? "Hide" : "Show"} passwords
      </button>
      {error && <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</p>}
      {done && (
        <p className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Password changed. Every other signed-in device has been logged out.
        </p>
      )}
      <div>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ? "Updating..." : "Update Password"}</button>
      </div>
      <p className="text-[11px] text-slate-400">At least 8 characters. Use a unique password you don't use anywhere else.</p>
    </form>
  );
}
