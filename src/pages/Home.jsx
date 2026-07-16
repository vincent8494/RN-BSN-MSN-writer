import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Eye, Star, ShieldCheck, Clock, MessageCircle, CheckCircle2,
  ChevronDown, Mail, Instagram,
} from "lucide-react";
import { navigate } from "../router.jsx";
import { useApp, sendMessage } from "../store.jsx";
import { iconFor } from "../icons.js";
import Pic from "../components/Pic.jsx";
import StatsStrip from "../components/StatsStrip.jsx";
import TestimonialCarousel from "../components/TestimonialCarousel.jsx";
import {
  BRAND, CONTACT, UNIVERSITIES, SCHOOLS, WHY_CHOOSE, SERVICES_OFFERED,
  STEPS, PROGRAMS_SUPPORTED, waMessage, SITE_URL,
} from "../data.js";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

/* --------------------------------------------- Floating hero particles */
const PARTICLES = [
  { size: 10, x: "8%", y: "22%", dur: 9, delay: 0 },
  { size: 6, x: "18%", y: "70%", dur: 11, delay: 1.2 },
  { size: 14, x: "30%", y: "35%", dur: 13, delay: 0.6 },
  { size: 8, x: "46%", y: "80%", dur: 10, delay: 2 },
  { size: 5, x: "58%", y: "18%", dur: 12, delay: 0.3 },
  { size: 12, x: "72%", y: "62%", dur: 14, delay: 1.6 },
  { size: 7, x: "84%", y: "30%", dur: 9.5, delay: 0.9 },
  { size: 9, x: "93%", y: "74%", dur: 12.5, delay: 2.4 },
];

function HeroParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-academic-300/25"
          style={{ width: p.size, height: p.size, left: p.x, top: p.y }}
          animate={{ y: [0, -26, 0], x: [0, i % 2 ? 14 : -14, 0], opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- Hero */
function Hero({ settings }) {
  return (
    <section className="relative overflow-hidden pt-24 lg:pt-28 pb-16 bg-gradient-to-br from-slate-900 via-slate-900 to-academic-900">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-academic-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-academic-400/10 blur-3xl pointer-events-none" />
      <HeroParticles />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-academic-200 text-xs font-semibold tracking-wide mb-5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> {settings.heroTagline}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"
            >
              {settings.heroTitle1}{" "}
              <span className="bg-gradient-to-r from-academic-300 via-academic-200 to-academic-400 bg-clip-text text-transparent">
                {settings.heroTitle2}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-xl"
            >
              {settings.heroDescription}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp w-full sm:w-auto px-8 py-3.5">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
              <button onClick={() => navigate("/order-now")} className="w-full sm:w-auto px-8 py-3.5 border-2 border-academic-400/40 text-academic-100 hover:bg-academic-600/20 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                Place an Order <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-xs text-slate-400"
            >
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-academic-300" /> Distinguished Grades</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-academic-300" /> No Plagiarism · No AI</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-academic-300" /> 24-Hour Turnaround</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-white/5">
              <Pic src="/images/flyer-wgu.jpg" alt="RN-BSN / MSN writing services flyer" width={853} height={1280} eager fetchPriority="high" sizes="(min-width: 1024px) 38rem, 90vw" className="w-full h-auto object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Schools bar */
function SchoolsBar() {
  // Track is duplicated for a seamless infinite marquee loop.
  const track = [...SCHOOLS, ...SCHOOLS];
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-7">
          Trusted by students across leading online nursing & healthcare programs
        </p>
        <div className="marquee overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
          <div className="marquee-track">
            {track.map((s, i) => (
              <div key={`${s.name}-${i}`} className="h-16 w-40 shrink-0 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-center p-3 grayscale hover:grayscale-0 transition-all">
                <Pic src={s.logo} alt={i < SCHOOLS.length ? `${s.name} logo` : ""} widths={[320]} sizes="160px" className="max-h-10 max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Stats */
function Stats() {
  return (
    <section className="bg-slate-50 py-14 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StatsStrip />
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Programs preview */
function ProgramsPreview() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">What We Offer</span>
          <h2 className="section-title mb-4 mt-2">Programs & Schools We Cover</h2>
          <p className="text-slate-600">
            Full-program and single-assignment help across the biggest online nursing, healthcare and social-work degrees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNIVERSITIES.map((u, i) => {
            const Icon = iconFor(u.iconName);
            return (
              <motion.button
                key={u.id}
                {...fadeUp}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate("/services")}
                className="card-academic p-6 text-left hover:-translate-y-1 hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-academic-50 text-academic-600 flex items-center justify-center group-hover:bg-academic-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="h-10 flex items-center">
                    <Pic src={u.logo} alt={`${u.name} logo`} widths={[320]} sizes="120px" className="max-h-10 max-w-[120px] object-contain" />
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{u.short}</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{u.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {u.programs.slice(0, 4).map((p) => (
                    <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{p}</span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-academic-600 group-hover:gap-2 transition-all">
                  View courses <ArrowRight className="w-4 h-4" />
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button onClick={() => navigate("/services")} className="btn-primary">
            Explore All Programs <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Featured banner */
function FeaturedBanner() {
  return (
    <section className="relative">
      <Pic src="/images/banner-rnbsn.jpg" alt="RN to BSN, RN to BSN/MSN — flexible, affordable, attainable" widths={[480, 960]} sizes="100vw" width={922} height={520} className="w-full h-56 md:h-72 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Flexible · Affordable · Attainable</h3>
            <p className="text-slate-200 mb-5">
              From a single discussion post to your entire RN-to-BSN or MSN program — we've got you covered, on time and on rubric.
            </p>
            <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <MessageCircle className="w-4 h-4" /> Get an Instant Quote
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Why choose us */
function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Why Trust Us</span>
          <h2 className="section-title mb-4 mt-2">Why Students Choose Us</h2>
          <p className="text-slate-600">Six promises behind every order — the reasons nursing students come back to us term after term.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE.map((w, i) => {
            const Icon = iconFor(w.iconName);
            return (
              <motion.div key={w.id} {...fadeUp} transition={{ delay: i * 0.05 }} className="card-academic p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-academic-500 to-academic-700 text-white flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{w.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{w.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Services offered */
function ServicesOffered() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow">Every Assignment Type</span>
          <h2 className="section-title mb-4 mt-2">What We Write</h2>
          <p className="text-slate-600">Whatever your course throws at you — a single task or a full class — we handle it.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICES_OFFERED.map((s, i) => {
            const Icon = iconFor(s.iconName);
            return (
              <motion.div key={s.name} {...fadeUp} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-academic-50 text-academic-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-700">{s.name}</span>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {PROGRAMS_SUPPORTED.map((p) => (
            <span key={p} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-academic-50 text-academic-700 border border-academic-100">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- How it works prev */
function HowItWorksPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Simple Process</span>
          <h2 className="section-title mb-4 mt-2">How It Works</h2>
          <p className="text-slate-600">Get expert help in four simple steps — most orders start within minutes on WhatsApp.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => {
            const Icon = iconFor(s.iconName);
            return (
              <motion.div key={s.number} {...fadeUp} transition={{ delay: i * 0.08 }} className="relative">
                <div className="card-academic p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-academic-600 text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-bold text-slate-100">{s.number}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-600">{s.shortDesc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate("/how-it-works")} className="btn-primary">See the Full Process <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Pricing preview */
function PricingPreview() {
  const { pricing } = useApp();
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Affordable Rates</span>
          <h2 className="section-title mb-4 mt-2">Transparent Pricing</h2>
          <p className="text-slate-600">Clear per-class and per-page rates. No hidden fees — ever.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(pricing.classRates || []).map((p, i) => (
            <motion.div
              key={p.id} {...fadeUp} transition={{ delay: i * 0.05 }}
              className={`card-academic p-6 relative ${p.popular ? "ring-2 ring-academic-500 shadow-xl" : ""}`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-academic-600 text-white">
                  Most Popular
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-wider text-academic-600">{p.school}</p>
              <h3 className="font-bold text-slate-900 mb-3">{p.program}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-bold text-slate-900">{p.rate}</span>
                <span className="text-sm text-slate-500 mb-1">{p.unit}</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{p.alt}</p>
              <ul className="space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-academic-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate("/pricing")} className="btn-primary">View Full Pricing <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Samples prev */
function SamplesPreview({ samples }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Our Work</span>
          <h2 className="section-title mb-4 mt-2">Sample Papers</h2>
          <p className="text-slate-600">A glimpse of the quality and course-specific expertise you can expect.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {samples.slice(0, 3).map((s, i) => (
            <motion.div key={s.id} {...fadeUp} transition={{ delay: i * 0.06 }} className="card-academic p-6 flex flex-col">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-academic-50 text-academic-700 self-start mb-3">{s.category}</span>
              <h3 className="font-bold text-slate-900 mb-2 leading-snug">{s.title}</h3>
              <p className="text-sm text-slate-600 mb-4 flex-1">{s.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400 border-t border-slate-100 pt-3">
                <span>{s.school}</span><span>·</span><span>{s.level}</span><span>·</span><span>{s.pages} pages</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate("/samples")} className="btn-primary"><Eye className="w-4 h-4" /> Browse All Samples</button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Testimonials */
function Testimonials({ testimonials }) {
  return (
    <section className="py-20 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(70,120,173,0.18),transparent_65%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-300">Testimonials</span>
          <h2 className="section-title text-white mb-4 mt-2">What Our Clients Say</h2>
          <p className="text-slate-400">Real results from nursing and healthcare students across WGU, Capella, Post & GCU.</p>
        </motion.div>
        <TestimonialCarousel testimonials={testimonials} />
        <div className="text-center mt-8">
          <button onClick={() => navigate("/reviews")} className="inline-flex items-center gap-2 text-sm font-semibold text-academic-300 hover:text-academic-200 transition-colors cursor-pointer">
            Read all client reviews <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- FAQ */
function FAQSection({ faq }) {
  const [open, setOpen] = useState(0);
  const items = [...faq].sort((a, b) => a.order - b.order);
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeUp} className="text-center mb-12">
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title mb-4 mt-2">Frequently Asked Questions</h2>
          <p className="text-slate-600">Everything you need to know before placing your first order.</p>
        </motion.div>
        <div className="space-y-3">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.id} className="card-academic overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${f.id}`}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">{f.question}</span>
                  <ChevronDown className={`w-5 h-5 text-academic-500 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${f.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-5 -mt-1 text-sm text-slate-600 leading-relaxed">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Contact / CTA */
function ContactCTA() {
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
    <section id="contact" className="py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="eyebrow">Get In Touch</span>
            <h2 className="section-title mb-4 mt-2">Ready to Get Started?</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Message us on WhatsApp for the fastest response, or send the form and our team will reply within hours.
              Tell us your school, course code and deadline for an instant quote.
            </p>
            <div className="space-y-3">
              <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#25d366] hover:bg-emerald-50/50 transition-all">
                <div className="w-11 h-11 rounded-xl bg-[#25d366] text-white flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
                <div>
                  <p className="font-semibold text-slate-900">WhatsApp</p>
                  <p className="text-sm text-slate-500">{CONTACT.phoneDisplay} · fastest response</p>
                </div>
              </a>
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-academic-300 hover:bg-academic-50/40 transition-all">
                <div className="w-11 h-11 rounded-xl bg-academic-600 text-white flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <p className="text-sm text-slate-500 break-all">{CONTACT.email}</p>
                </div>
              </a>
              <a href={CONTACT.tiktok} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold">♪</div>
                <div>
                  <p className="font-semibold text-slate-900">TikTok</p>
                  <p className="text-sm text-slate-500">Follow us on TikTok</p>
                </div>
              </a>
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-amber-400 text-white flex items-center justify-center"><Instagram className="w-5 h-5" /></div>
                <div>
                  <p className="font-semibold text-slate-900">Instagram</p>
                  <p className="text-sm text-slate-500">Follow us on Instagram</p>
                </div>
              </a>
            </div>
          </div>

          <form onSubmit={submit} className="card-academic p-6 lg:p-8 space-y-4">
            {sent && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                Thanks for reaching out! Our team will respond to your inquiry shortly.
              </div>
            )}
            {error && <div role="alert" className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cta-name" className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input id="cta-name" autoComplete="name" required value={form.fullName} onChange={(e) => upd("fullName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="cta-email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <input id="cta-email" type="email" autoComplete="email" required value={form.email} onChange={(e) => upd("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="you@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cta-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">Phone / WhatsApp</label>
                <input id="cta-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="+1 (555) 123-4567" />
              </div>
              <div>
                <label htmlFor="cta-service" className="block text-xs font-semibold text-slate-700 mb-1.5">School / Program</label>
                <input id="cta-service" value={form.serviceType} onChange={(e) => upd("serviceType", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20" placeholder="e.g. WGU RN-to-BSN" />
              </div>
            </div>
            <div>
              <label htmlFor="cta-message" className="block text-xs font-semibold text-slate-700 mb-1.5">How can we help you?</label>
              <textarea id="cta-message" required rows={4} value={form.message} onChange={(e) => upd("message", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 resize-none"
                placeholder="Describe your course, assignment and deadline..." />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60">
              {sending ? "Sending..." : <>Send Message <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------- SEO structured data */
// Escapes "<" so admin-edited FAQ text can never break out of the <script> tag.
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");

function StructuredData({ faq }) {
  const business = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: BRAND.name,
    description:
      "Nursing and healthcare academic writing support for RN-to-BSN, BSN-to-MSN, MSN-to-DNP and Social Work programs at WGU, Capella, Post University, SNHU, GCU and more.",
    url: SITE_URL,
    telephone: CONTACT.phoneDisplay,
    email: CONTACT.email,
    priceRange: "$200–$300 per class",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: [CONTACT.tiktok, CONTACT.instagram],
  };
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <>
      <script type="application/ld+json">{jsonLd(business)}</script>
      <script type="application/ld+json">{jsonLd(faqPage)}</script>
    </>
  );
}

/* -------------------------------------------------------------------- Page */
export default function Home() {
  const { settings, testimonials, faq, samplePapers } = useApp();
  return (
    <main>
      <StructuredData faq={faq} />
      <Hero settings={settings} />
      <SchoolsBar />
      <Stats />
      <ProgramsPreview />
      <FeaturedBanner />
      <WhyChooseUs />
      <ServicesOffered />
      <HowItWorksPreview />
      <PricingPreview />
      <SamplesPreview samples={samplePapers} />
      <Testimonials testimonials={testimonials} />
      <FAQSection faq={faq} />
      <ContactCTA />
    </main>
  );
}
