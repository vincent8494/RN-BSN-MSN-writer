import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, MessageCircle, ArrowRight, Search } from "lucide-react";
import { navigate } from "../router.jsx";
import { useApp } from "../store.jsx";
import { CONTACT, waMessage } from "../data.js";
import CTABanner from "../components/CTABanner.jsx";

export default function Samples() {
  const { samplePapers } = useApp();
  const categories = ["All", ...Array.from(new Set(samplePapers.map((s) => s.category)))];
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = samplePapers.filter((s) => {
    if (active !== "All" && s.category !== active) return false;
    if (!q) return true;
    return `${s.title} ${s.description} ${s.school} ${s.category} ${s.level}`.toLowerCase().includes(q);
  });

  return (
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Our Work</span>
          <h1 className="section-title text-white text-4xl md:text-5xl mt-2 mb-4">Sample Papers</h1>
          <p className="text-academic-100 max-w-2xl">Browse a selection of our work to see the quality, course-specific expertise and professionalism you can expect from our nursing and healthcare writers.</p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search samples — course code, topic, school..."
              aria-label="Search samples"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((c) => (
              <button
                key={c} onClick={() => setActive(c)} aria-pressed={active === c}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  active === c ? "bg-academic-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-academic-50 hover:text-academic-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {list.length === 0 && (
            <p className="text-center text-slate-500 py-10">No samples match your search — try a different keyword or category.</p>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((s, i) => (
              <motion.div
                key={s.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.05 }}
                className="card-academic p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-academic-50 text-academic-700">{s.category}</span>
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 leading-snug">{s.title}</h3>
                <p className="text-sm text-slate-600 mb-4 flex-1">{s.description}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 border-t border-slate-100 pt-3 mb-4">
                  <span>{s.school}</span><span>·</span><span>{s.subject}</span><span>·</span><span>{s.level}</span><span>·</span><span>{s.pages} pages</span>
                </div>
                <a href={waMessage(`Hi! I'd like a paper similar to: ${s.title}`)} target="_blank" rel="noreferrer" className="btn-whatsapp text-sm w-full">
                  <MessageCircle className="w-4 h-4" /> Request Similar
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title mb-4">Want a custom paper like these?</h2>
          <p className="text-slate-600 mb-7">Every order is written from scratch to your exact rubric. Get a custom, original, plagiarism-free paper for your course.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp"><MessageCircle className="w-4 h-4" /> Chat on WhatsApp</a>
            <button onClick={() => navigate("/order-now")} className="btn-primary">Place an Order <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>
      <CTABanner />
    </main>
  );
}
