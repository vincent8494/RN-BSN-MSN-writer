import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ArrowRight, ShieldCheck, RefreshCw, Award } from "lucide-react";
import { navigate } from "../router.jsx";
import { iconFor } from "../icons.js";
import { STEPS, CONTACT } from "../data.js";
import CTABanner from "../components/CTABanner.jsx";

const GUARANTEES = [
  { icon: ShieldCheck, title: "No Plagiarism · No AI", description: "Every paper is 100% human-created, written from scratch and Turnitin-ready. We never use AI generators and can provide an originality report on request." },
  { icon: RefreshCw, title: "Unlimited Free Revisions", description: "If the work doesn't meet your expectations, request unlimited free revisions until you're completely satisfied — just send feedback and your writer adjusts." },
  { icon: Award, title: "Distinguished-Grade Guarantee", description: "Our writers know your rubrics. We aim for distinguished, quality grades on every BSN, MSN, DNP and social-work submission." },
];

export default function HowItWorks() {
  return (
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Simple Process</span>
          <h1 className="section-title text-white text-4xl md:text-5xl mt-2 mb-4">How It Works</h1>
          <p className="text-academic-100 max-w-2xl">Getting professional nursing academic help is simple. Follow our four-step process and receive your work on time — most orders start within minutes on WhatsApp.</p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {STEPS.map((s, i) => {
            const Icon = iconFor(s.iconName);
            return (
              <motion.div
                key={s.number} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.05 }}
                className="card-academic p-6 lg:p-8"
              >
                <div className="grid md:grid-cols-3 gap-6 items-start">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold text-academic-100">{s.number}</span>
                    <div className="w-14 h-14 rounded-2xl bg-academic-600 text-white flex items-center justify-center shrink-0"><Icon className="w-7 h-7" /></div>
                  </div>
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">{s.detail}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {s.highlights.map((h) => (
                        <span key={h} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-academic-500 shrink-0" /> {h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {GUARANTEES.map((g) => (
              <div key={g.title} className="card-academic p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-academic-500 to-academic-700 text-white flex items-center justify-center mb-4"><g.icon className="w-6 h-6" /></div>
                <h3 className="font-bold text-slate-900 mb-2">{g.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title text-white mb-4">Ready to start?</h2>
          <p className="text-slate-400 mb-7">Message us your school, course and deadline for an instant quote — or place your order online now.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp"><MessageCircle className="w-4 h-4" /> Chat on WhatsApp</a>
            <button onClick={() => navigate("/order-now")} className="px-6 py-3 rounded-xl border-2 border-academic-400/40 text-academic-100 hover:bg-academic-600/20 font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer">
              Place an Order <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
      <CTABanner />
    </main>
  );
}
