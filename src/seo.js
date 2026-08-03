// Single source of truth for per-route SEO metadata.
//
// Consumed by BOTH:
//   • src/App.jsx  — updates <title>/description/OG/canonical live on client-side
//     navigation (so JS-rendering crawlers like Googlebot see the right meta), and
//   • scripts/prerender.mjs — bakes the same meta into a static HTML file per route
//     at build time, so non-JS consumers (WhatsApp/Facebook/Twitter link-preview
//     scrapers, Bing, etc.) also get the correct title/description/canonical.
//
// This module must stay import-free (no Vite `import.meta.env`, no JSX) so the
// Node prerender script can import it directly.

export const BRAND_NAME = "Nursing FlexPath Writers";
export const SITE = "https://nursingflexpathwriters.com";
export const OG_IMAGE = `${SITE}/images/banner-rnbsn.jpg`;

export const DEFAULT_TITLE = `${BRAND_NAME} | BSN, MSN & FNP Homework Help — WGU, Capella & More`;
export const DEFAULT_DESCRIPTION =
  "BSN, MSN, FNP & DNP homework help from expert nursing writers. Capella FlexPath assessments, WGU D-courses, Post University, SNHU, GCU & Sophia. Human-written, plagiarism-free, 24-hour turnaround, 100% private.";

// Page-specific title/description; `noindex` marks app/auth pages. The homepage
// ("/") intentionally has no overrides — it uses the defaults above.
export const ROUTE_SEO = {
  "/": {},
  "/services": {
    title: "Programs & Courses",
    description:
      "Course-by-course nursing, healthcare and social-work help for WGU, Capella, Post University, SNHU, GCU and Sophia — from single assessments to full RN-to-BSN, MSN and DNP programs.",
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Transparent per-class and per-page rates for nursing assignment help: Post University from $250/class, Capella BSN/MSN $300/class, DNP $15/page, Sophia $200/class. No hidden fees.",
  },
  "/how-it-works": {
    title: "How It Works",
    description:
      "Get nursing assignment help in four simple steps: message us on WhatsApp, get a quote, we complete your work human-written and rubric-aligned, then review with unlimited free revisions.",
  },
  "/samples": {
    title: "Sample Papers",
    description:
      "Browse sample nursing papers — evidence-based practice, leadership, capstone, informatics and social-work projects for WGU, Capella, Post University and GCU programs.",
  },
  "/contact": {
    title: "Contact Us",
    description:
      "Contact Nursing FlexPath Writers 24/7 on WhatsApp at +1 (309) 286-4134 or by email for an instant, no-obligation quote on your nursing course or assignment.",
  },
  "/order-now": {
    title: "Place Your Order",
    description:
      "Place your nursing assignment order online — choose your school, level, pages and deadline for an instant price estimate. 100% confidential, no plagiarism, no AI.",
  },
  "/reviews": {
    title: "Client Reviews",
    description:
      "Read verified client reviews from WGU, Capella, Post University, SNHU and GCU students who got distinguished grades with our nursing assignment help.",
  },
  "/blog": {
    title: "Nursing Study Blog",
    description:
      "Free nursing study resources: NCLEX, TEAS and HESI prep guides, APA 7 writing tips, care-plan templates and course-specific strategies for WGU and Capella students.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "How Nursing FlexPath Writers collects, uses and protects your data. 100% confidentiality — your identity and orders are never shared.",
  },
  "/terms": {
    title: "Terms & Conditions",
    description:
      "Terms of service for Nursing FlexPath Writers: orders, quotes, revisions, refunds, originality and confidentiality.",
  },
  "/checkout": { title: "Checkout", noindex: true },
  "/login": { title: "Sign In", noindex: true },
  "/signup": { title: "Create Account", noindex: true },
  "/dashboard": { title: "My Dashboard", noindex: true },
  "/admin": { title: "Admin", noindex: true },
};

// Only the indexable marketing routes get a prerendered static HTML file; app /
// auth routes stay on the SPA fallback and are blocked in robots.txt.
export const PRERENDER_PATHS = Object.keys(ROUTE_SEO).filter((p) => !ROUTE_SEO[p].noindex);

// Resolves the final meta for a path (used by both consumers).
export function seoFor(path) {
  const r = ROUTE_SEO[path] || { title: "Page Not Found", noindex: true };
  return {
    title: r.title ? `${r.title} · ${BRAND_NAME}` : DEFAULT_TITLE,
    description: r.description || DEFAULT_DESCRIPTION,
    url: `${SITE}${path === "/" ? "/" : path}`,
    noindex: Boolean(r.noindex),
  };
}
