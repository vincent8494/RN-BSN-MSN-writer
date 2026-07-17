import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, CalendarDays, X, ArrowRight } from "lucide-react";
import { BLOG_POSTS, BLOG_CATEGORIES } from "../content/blog.js";
import { BRAND, SITE_URL } from "../data.js";
import CTABanner from "../components/CTABanner.jsx";

// SEO: tell search engines this is a blog and what each post covers.
const blogJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: `${BRAND.name} — Nursing Study Blog`,
  url: `${SITE_URL}/blog`,
  publisher: { "@type": "Organization", name: BRAND.name, url: SITE_URL },
  blogPost: BLOG_POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    datePublished: p.date,
    articleSection: p.category,
    description: p.excerpt,
    url: `${SITE_URL}/blog`,
    author: { "@type": "Organization", name: BRAND.name },
  })),
}).replace(/</g, "\\u003c");

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ArticleModal({ post, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.article
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={post.title}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-academic-50 text-academic-700">{post.category}</span>
            <h2 className="font-bold text-slate-900 mt-2 leading-snug">{post.title}</h2>
            <p className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
              <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {formatDate(post.date)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readMins} min read</span>
            </p>
          </div>
          <button onClick={onClose} aria-label="Close article" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 shrink-0 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {post.body.map((para, i) => (
            <p key={i} className="text-sm text-slate-600 leading-relaxed">{para}</p>
          ))}
        </div>
      </motion.article>
    </motion.div>
  );
}

export default function Blog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openPost, setOpenPost] = useState(null);

  const q = query.trim().toLowerCase();
  const list = BLOG_POSTS.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (!q) return true;
    return `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q);
  });

  return (
    <>
    <script type="application/ld+json">{blogJsonLd}</script>
    <main>
      <section className="bg-gradient-to-br from-academic-600 via-academic-700 to-academic-900 text-white pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold tracking-widest uppercase text-academic-200">Resources</span>
          <h1 className="section-title text-white text-4xl md:text-5xl mt-2 mb-4">Nursing Study Blog</h1>
          <p className="text-academic-100 max-w-2xl">
            Study guides, NCLEX & entrance-exam prep, APA writing tips and course-specific strategies — free
            resources to help you ace nursing school.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-10">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search articles"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    category === c ? "bg-academic-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-academic-50 hover:text-academic-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <p className="text-center text-slate-500 py-16">No articles match your search — try a different keyword.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((p, i) => (
                <motion.article
                  key={p.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: (i % 3) * 0.06 }}
                  className="card-academic p-6 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-academic-50 text-academic-700">{p.category}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3.5 h-3.5" aria-hidden="true" /> {p.readMins} min</span>
                  </div>
                  <h2 className="font-bold text-slate-900 mb-2 leading-snug">{p.title}</h2>
                  <p className="text-sm text-slate-600 mb-4 flex-1">{p.excerpt}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" aria-hidden="true" /> {formatDate(p.date)}</span>
                    <button onClick={() => setOpenPost(p)} className="inline-flex items-center gap-1 text-sm font-semibold text-academic-600 hover:gap-2 transition-all cursor-pointer">
                      Read More <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTABanner />

      <AnimatePresence>
        {openPost && <ArticleModal post={openPost} onClose={() => setOpenPost(null)} />}
      </AnimatePresence>
    </main>
    </>
  );
}
