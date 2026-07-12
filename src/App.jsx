import { lazy, Suspense, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { usePath, Link } from "./router.jsx";
import { AppProvider } from "./store.jsx";
import { BRAND, SITE_URL } from "./data.js";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppFab from "./components/WhatsAppFab.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import Home from "./pages/Home.jsx";

// Secondary pages are code-split so the landing page ships a smaller bundle.
const Services = lazy(() => import("./pages/Services.jsx"));
const Pricing = lazy(() => import("./pages/Pricing.jsx"));
const HowItWorks = lazy(() => import("./pages/HowItWorks.jsx"));
const Samples = lazy(() => import("./pages/Samples.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const OrderNow = lazy(() => import("./pages/OrderNow.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const Reviews = lazy(() => import("./pages/Reviews.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));

const DEFAULT_TITLE = `${BRAND.name} | WGU · Capella · Post University Nursing Help`;
const DEFAULT_DESCRIPTION =
  "Expert RN-to-BSN, BSN-to-MSN, MSN-to-DNP and Social Work assignment help for WGU, Capella, Post University, SNHU, GCU, Walden, Sophia & more. Distinguished grades, no plagiarism, 100% privacy, 24-hour turnaround.";

const ROUTES = {
  "/": { Page: Home, shell: true },
  "/services": {
    Page: Services, shell: true, title: "Programs & Courses",
    description: "Course-by-course nursing, healthcare and social-work help for WGU, Capella, Post University, SNHU, GCU and Sophia — from single assessments to full RN-to-BSN, MSN and DNP programs.",
  },
  "/pricing": {
    Page: Pricing, shell: true, title: "Pricing",
    description: "Transparent per-class and per-page rates for nursing assignment help: Post University from $250/class, Capella BSN/MSN $300/class, DNP $15/page, Sophia $200/class. No hidden fees.",
  },
  "/how-it-works": {
    Page: HowItWorks, shell: true, title: "How It Works",
    description: "Get nursing assignment help in four simple steps: message us on WhatsApp, get a quote, we complete your work human-written and rubric-aligned, then review with unlimited free revisions.",
  },
  "/samples": {
    Page: Samples, shell: true, title: "Sample Papers",
    description: "Browse sample nursing papers — evidence-based practice, leadership, capstone, informatics and social-work projects for WGU, Capella, Post University and GCU programs.",
  },
  "/contact": {
    Page: Contact, shell: true, title: "Contact Us",
    description: "Contact RN-BSN & MSN Writers 24/7 on WhatsApp at +1 (309) 286-4134 or by email for an instant, no-obligation quote on your nursing course or assignment.",
  },
  "/order-now": {
    Page: OrderNow, shell: true, title: "Place Your Order",
    description: "Place your nursing assignment order online — choose your school, level, pages and deadline for an instant price estimate. 100% confidential, no plagiarism, no AI.",
  },
  "/reviews": {
    Page: Reviews, shell: true, title: "Client Reviews",
    description: "Read verified client reviews from WGU, Capella, Post University, SNHU and GCU students who got distinguished grades with our nursing assignment help.",
  },
  "/blog": {
    Page: Blog, shell: true, title: "Nursing Study Blog",
    description: "Free nursing study resources: NCLEX, TEAS and HESI prep guides, APA 7 writing tips, care-plan templates and course-specific strategies for WGU and Capella students.",
  },
  "/privacy": {
    Page: Privacy, shell: true, title: "Privacy Policy",
    description: "How RN-BSN & MSN Writers collects, uses and protects your data. 100% confidentiality — your identity and orders are never shared.",
  },
  "/terms": {
    Page: Terms, shell: true, title: "Terms & Conditions",
    description: "Terms of service for RN-BSN & MSN Writers: orders, quotes, revisions, refunds, originality and confidentiality.",
  },
  "/checkout": { Page: Checkout, title: "Checkout", noindex: true },
  "/login": { Page: Login, shell: true, fab: false, title: "Sign In", noindex: true },
  "/signup": { Page: Signup, shell: true, fab: false, title: "Create Account", noindex: true },
  "/dashboard": { Page: Dashboard, title: "My Dashboard", noindex: true },
  "/admin": { Page: Admin, title: "Admin", noindex: true },
};

// Keeps head tags in sync with the active route (SPA equivalent of per-page meta).
function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function applyRouteMeta(path, route) {
  const title = route.title ? `${route.title} · ${BRAND.name}` : DEFAULT_TITLE;
  const description = route.description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  upsertMeta("name", "robots", route.noindex ? "noindex, nofollow" : "index, follow");

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);
}

function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 pt-24 pb-16">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-academic-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="btn-primary inline-flex">Back to Home</Link>
      </div>
    </main>
  );
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading page">
      <div className="w-9 h-9 rounded-full border-[3px] border-academic-200 border-t-academic-600 animate-spin" />
    </div>
  );
}

function Shell({ children, fab = true }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      {fab && <WhatsAppFab />}
    </>
  );
}

export default function App() {
  const path = usePath();
  const route = ROUTES[path] ?? { Page: NotFound, shell: true, title: "Page Not Found", noindex: true };

  useEffect(() => {
    applyRouteMeta(path, route);
  }, [path, route]);

  const { Page, shell, fab } = route;
  const page = (
    <Suspense fallback={<PageLoader />}>
      <Page />
    </Suspense>
  );

  return (
    <AppProvider>
      <MotionConfig reducedMotion="user">
        <div className="relative min-h-screen bg-slate-50 selection:bg-academic-500/20 overflow-x-hidden antialiased">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-academic-600 focus:text-white focus:text-sm focus:font-semibold"
          >
            Skip to content
          </a>
          <div id="main-content">
            {shell ? <Shell fab={fab}>{page}</Shell> : page}
          </div>
          <CookieConsent />
        </div>
      </MotionConfig>
    </AppProvider>
  );
}
