import { useState } from "react";
import { MessageCircle, Mail, Phone, ArrowRight, Clock, Instagram } from "lucide-react";
import { sendMessage } from "../store.jsx";
import { CONTACT } from "../data.js";

export default function Contact() {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", serviceType: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await sendMessage(form);
    setSending(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSent(true);
    setForm({ fullName: "", email: "", phone: "", serviceType: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Get In Touch</span>
          <h1 className="section-title text-white text-4xl md:text-5xl mt-2 mb-4">Contact Us</h1>
          <p className="text-academic-100 max-w-2xl">Have a question or need a quote? Reach out and our support team will get back to you promptly — we're available 24/7.</p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="card-academic p-5 flex items-center gap-4 hover:border-[#25d366] transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#25d366] text-white flex items-center justify-center"><MessageCircle className="w-6 h-6" /></div>
              <div><p className="font-bold text-slate-900">WhatsApp — Fastest Response</p><p className="text-sm text-slate-500">Tap to start a chat instantly</p></div>
            </a>
            <a href={CONTACT.whatsappNumberLink} target="_blank" rel="noreferrer" className="card-academic p-5 flex items-center gap-4 hover:border-academic-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-academic-600 text-white flex items-center justify-center"><Phone className="w-6 h-6" /></div>
              <div><p className="font-bold text-slate-900">Call / Text</p><p className="text-sm text-slate-500">{CONTACT.phoneDisplay}</p></div>
            </a>
            <a href={`mailto:${CONTACT.email}`} className="card-academic p-5 flex items-center gap-4 hover:border-academic-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center"><Mail className="w-6 h-6" /></div>
              <div className="min-w-0"><p className="font-bold text-slate-900">Email</p><p className="text-sm text-slate-500 break-all">{CONTACT.email}</p></div>
            </a>
            <a href={CONTACT.tiktok} target="_blank" rel="noreferrer" className="card-academic p-5 flex items-center gap-4 hover:border-slate-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-xl font-bold">♪</div>
              <div><p className="font-bold text-slate-900">TikTok</p><p className="text-sm text-slate-500">Follow us on TikTok</p></div>
            </a>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="card-academic p-5 flex items-center gap-4 hover:border-slate-400 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 text-white flex items-center justify-center"><Instagram className="w-6 h-6" /></div>
              <div><p className="font-bold text-slate-900">Instagram</p><p className="text-sm text-slate-500">Follow us on Instagram</p></div>
            </a>
            <div className="card-academic p-5 flex items-center gap-4 bg-academic-50/50">
              <div className="w-12 h-12 rounded-xl bg-academic-100 text-academic-700 flex items-center justify-center"><Clock className="w-6 h-6" /></div>
              <div><p className="font-bold text-slate-900">Availability</p><p className="text-sm text-slate-500">{CONTACT.location}</p></div>
            </div>
          </div>

          <form onSubmit={submit} className="card-academic p-6 lg:p-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Send us a message</h2>
            {sent && <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">Thanks for reaching out! Our team will respond shortly.</div>}
            {error && <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ct-name" className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input id="ct-name" autoComplete="name" required value={form.fullName} onChange={(e) => upd("fullName", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="ct-email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <input id="ct-email" type="email" autoComplete="email" required value={form.email} onChange={(e) => upd("email", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="you@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ct-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">Phone / WhatsApp</label>
                <input id="ct-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <label htmlFor="ct-service" className="block text-xs font-semibold text-slate-700 mb-1.5">School / Program</label>
                <input id="ct-service" value={form.serviceType} onChange={(e) => upd("serviceType", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="e.g. Capella MSN" />
              </div>
            </div>
            <div>
              <label htmlFor="ct-message" className="block text-xs font-semibold text-slate-700 mb-1.5">Message</label>
              <textarea id="ct-message" required rows={5} value={form.message} onChange={(e) => upd("message", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 resize-none" placeholder="Describe how we can help you..." />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60">
              {sending ? "Sending..." : <>Send Message <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
