import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

// Auto-advancing testimonial carousel (2-up on desktop, swipe/drag enabled).
export default function TestimonialCarousel({ testimonials }) {
  const perSlide = 2;
  const slides = [];
  for (let i = 0; i < testimonials.length; i += perSlide) {
    slides.push(testimonials.slice(i, i + perSlide));
  }
  const [[index, direction], setIndex] = useState([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const go = (dir) => setIndex(([i]) => [(i + dir + slides.length) % slides.length, dir]);

  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, reduced, slides.length]);

  if (!slides.length) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
      role="region"
      aria-label="Client testimonials carousel"
    >
      <div className="overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              else if (info.offset.x > 60) go(-1);
            }}
            className="grid md:grid-cols-2 gap-6 cursor-grab active:cursor-grabbing"
          >
            {slides[index].map((t) => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm select-none">
                <Quote className="w-8 h-8 text-academic-400/40 mb-3" aria-hidden="true" />
                <p className="text-slate-200 leading-relaxed mb-5">{t.feedback}</p>
                <div className="flex items-center gap-3">
                  {t.avatar && (
                    <img
                      src={t.avatar}
                      srcSet={`${t.avatar} 1x, ${t.avatar.replace("w=150&h=150", "w=300&h=300")} 2x`}
                      alt=""
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover pointer-events-none"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-academic-300 text-xs">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, k) => (
                      <Star key={k} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button onClick={() => go(-1)} aria-label="Previous testimonials" className="w-9 h-9 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 flex items-center justify-center transition-colors cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(([cur]) => [i, i > cur ? 1 : -1])}
              aria-label={`Go to testimonials ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all cursor-pointer ${i === index ? "w-6 bg-academic-400" : "w-2 bg-white/25 hover:bg-white/40"}`}
            />
          ))}
        </div>
        <button onClick={() => go(1)} aria-label="Next testimonials" className="w-9 h-9 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 flex items-center justify-center transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
