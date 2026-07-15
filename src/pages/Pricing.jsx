import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ArrowRight } from "lucide-react";
import { navigate } from "../router.jsx";
import Pic from "../components/Pic.jsx";
import CTABanner from "../components/CTABanner.jsx";
import { ACADEMIC_LEVELS, DEADLINES, UNIVERSITIES, CONTACT, waMessage } from "../data.js";
import { useApp } from "../store.jsx";

export default function Pricing() {
  // Live, admin-editable pricing (same config the order form and server use).
  const { pricing } = useApp();
  const classRates = pricing.classRates || [];
  return (
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Transparent Pricing</span>
          <h1 className="section-title text-white text-4xl md:text-5xl mt-2 mb-4">Affordable Rates for Every Program</h1>
          <p className="text-academic-100 max-w-2xl">Clear per-class and per-page pricing. No hidden fees, bulk discounts available, and pay-after-completion on eligible orders.</p>
        </div>
      </section>

      {/* Flat-rate cards */}
      <section className="py-16 bg-slate-50 -mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classRates.map((p, i) => (
              <motion.div
                key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`card-academic p-6 relative ${p.popular ? "ring-2 ring-academic-500 shadow-xl" : ""}`}
              >
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-academic-600 text-white">Most Popular</span>}
                <p className="text-xs font-semibold uppercase tracking-wider text-academic-600">{p.school}</p>
                <h3 className="font-bold text-slate-900 mb-3">{p.program}</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold text-slate-900">{p.rate}</span>
                  <span className="text-sm text-slate-500 mb-1.5">{p.unit}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{p.alt}</p>
                <ul className="space-y-2 mb-5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-academic-500 mt-0.5 shrink-0" /> {f}</li>
                  ))}
                </ul>
                <a href={waMessage(`Hi! I'd like a quote for ${p.school} ${p.program}.`)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full text-sm">
                  <MessageCircle className="w-4 h-4" /> Get This
                </a>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 max-w-3xl mx-auto mt-8">{pricing.classNote}</p>
        </div>
      </section>

      {/* Per-page matrix (order-form estimate engine) */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">Per-Page Estimate</span>
            <h2 className="section-title mb-3 mt-2">Per-Page Pricing by Level & Deadline</h2>
            <p className="text-slate-600">Prefer to pay per page? Here's our starting per-page rate (USD). Use the order form for an exact quote.</p>
          </div>
          <div className="card-academic overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-academic-600 to-academic-700 text-white">
                  <th className="px-4 py-4 text-left font-bold uppercase tracking-wider text-xs">Academic Level</th>
                  {DEADLINES.map((d) => (
                    <th key={d.key} className={`px-3 py-4 text-center font-bold uppercase tracking-wider text-xs ${d.key === "days3" ? "bg-academic-400/30" : ""}`}>{d.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACADEMIC_LEVELS.map((lvl) => (
                  <tr key={lvl} className={`border-t border-slate-100 hover:bg-academic-50/50 transition-colors ${lvl === "BSN" ? "bg-academic-50/30" : ""}`}>
                    <td className={`px-4 py-4 font-bold ${lvl === "BSN" ? "text-academic-700" : "text-slate-900"}`}>{lvl}</td>
                    {DEADLINES.map((d) => (
                      <td key={d.key} className={`px-3 py-4 text-center font-semibold ${d.key === "days3" ? "bg-academic-50/50 text-academic-700" : "text-slate-700"}`}>${pricing.perPage[lvl]?.[d.key] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">* Prices shown are per page (USD). Minimum order 1 page. Discounts on bulk & full-class orders.</p>
          <div className="text-center mt-8">
            <button onClick={() => navigate("/order-now")} className="btn-primary">Get an Exact Quote <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      {/* Per-school note */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center font-bold text-slate-900 mb-6">Per-School Rates at a Glance</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UNIVERSITIES.map((u) => (
              <div key={u.id} className="card-academic p-5 flex items-center gap-3">
                <Pic src={u.logo} alt={`${u.name} logo`} widths={[320]} sizes="90px" className="h-8 max-w-[90px] object-contain" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{u.short}</p>
                  <p className="text-xs text-slate-500">{u.priceNote}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp inline-flex"><MessageCircle className="w-4 h-4" /> Ask About Your School</a>
          </div>
        </div>
      </section>
      <CTABanner />
    </main>
  );
}
