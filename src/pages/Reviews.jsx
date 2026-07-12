import { motion } from "framer-motion";
import { Star, MessageCircle, BadgeCheck } from "lucide-react";
import { REVIEWS, CONTACT } from "../data.js";
import StatsStrip from "../components/StatsStrip.jsx";
import CTABanner from "../components/CTABanner.jsx";

function Stars({ n }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, k) => (
        <Star key={k} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Client Reviews</span>
          <h1 className="section-title text-white text-4xl md:text-5xl mt-2 mb-4">Loved by Nursing Students</h1>
          <p className="text-academic-100 max-w-2xl mb-8">
            Our superior quality and dedication show in our clients' reviews. Read what nursing, healthcare and
            social-work students say about working with us.
          </p>
          <StatsStrip dark />
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {REVIEWS.map((r, i) => (
              <motion.figure
                key={r.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 3) * 0.06 }}
                className="card-academic p-6 mb-6 break-inside-avoid"
              >
                <div className="flex items-center justify-between mb-3">
                  <Stars n={r.rating} />
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified client
                  </span>
                </div>
                <blockquote className="text-sm text-slate-600 leading-relaxed mb-4">“{r.text}”</blockquote>
                <figcaption>
                  <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                  <p className="text-xs text-academic-600 font-medium">{r.school}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp inline-flex">
              <MessageCircle className="w-4 h-4" /> Start Your Own Success Story
            </a>
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
