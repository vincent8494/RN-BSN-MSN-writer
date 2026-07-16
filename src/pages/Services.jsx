import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageCircle, ChevronDown } from "lucide-react";
import { navigate } from "../router.jsx";
import { iconFor } from "../icons.js";
import Pic from "../components/Pic.jsx";
import { UNIVERSITIES, SERVICES_OFFERED, PROGRAMS_SUPPORTED, CONTACT, waMessage } from "../data.js";

function PageHeader() {
  return (
    <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Programs & Courses</span>
        <h1 className="section-title text-white text-4xl md:text-5xl mt-2 mb-4">Nursing, Healthcare & Social-Work Help</h1>
        <p className="text-academic-100 max-w-2xl">
          Complete course-by-course support across the top online programs. Select your school below to see the exact
          courses we cover — from a single assessment to your entire degree.
        </p>
      </div>
    </section>
  );
}

function UniversityCard({ u, i }) {
  const [open, setOpen] = useState(false);
  const Icon = iconFor(u.iconName);
  const isHeading = (c) => !c.includes("—") && c.length < 30;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: i * 0.05 }}
      className="card-academic overflow-hidden"
    >
      <div className="grid md:grid-cols-3">
        <div className="md:col-span-2 p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-academic-50 text-academic-600 flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{u.name}</h2>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {u.programs.map((p) => (
                  <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{p}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{u.description}</p>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-academic-700 bg-academic-50 px-3 py-1.5 rounded-lg mb-5">
            <CheckCircle2 className="w-4 h-4" /> {u.priceNote}
          </p>

          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-academic-700 cursor-pointer">
            {open ? "Hide" : "View"} courses ({u.courses.filter((c) => c.includes("—")).length})
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-1.5">
              {u.courses.map((c, k) =>
                isHeading(c) ? (
                  <li key={k} className="text-xs font-bold uppercase tracking-wider text-academic-600 pt-3 first:pt-0">{c}</li>
                ) : (
                  <li key={k} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-academic-400 mt-0.5 shrink-0" /> {c}
                  </li>
                )
              )}
            </motion.ul>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <a href={waMessage(`Hi! I need help with ${u.name} (${u.programs.join(", ")}).`)} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <MessageCircle className="w-4 h-4" /> Get a Quote
            </a>
            <button onClick={() => navigate("/order-now")} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2">
              Order Online <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="hidden md:block relative bg-slate-50 border-l border-slate-100">
          {/* object-contain: these are text posters — never crop their content */}
          <Pic src={u.flyer} alt={`${u.name} assignment help flyer`} minWidth={768} sizes="33vw" className="absolute inset-0 w-full h-full object-contain p-3" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Services() {
  return (
    <main>
      <PageHeader />
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {UNIVERSITIES.map((u, i) => <UniversityCard key={u.id} u={u} i={i} />)}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="eyebrow">Every Assignment Type</span>
            <h2 className="section-title mb-3 mt-2">What We Deliver</h2>
            <p className="text-slate-600">Across all programs — BSN, MSN, DNP, BHA, MHA, MBA, DBA, PMHNP, FNP and BSW/MSW.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {SERVICES_OFFERED.map((s) => {
              const Icon = iconFor(s.iconName);
              return (
                <div key={s.name} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-academic-50 text-academic-600 flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
                  <span className="text-sm font-medium text-slate-700">{s.name}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {PROGRAMS_SUPPORTED.map((p) => (
              <span key={p} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-academic-50 text-academic-700 border border-academic-100">{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title text-white mb-4">Don't see your school or course?</h2>
          <p className="text-slate-400 mb-7">We cover far more than what's listed. Message us with your school, course code and deadline for an instant quote.</p>
          <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp inline-flex"><MessageCircle className="w-4 h-4" /> Chat on WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
