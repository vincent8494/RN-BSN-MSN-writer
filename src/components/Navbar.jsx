import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "./Logo.jsx";
import { Link, usePath } from "../router.jsx";
import { useApp } from "../store.jsx";
import { NAV_ITEMS, BRAND, CONTACT } from "../data.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePath();
  const { user } = useApp();
  const accountTo = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login";
  const accountLabel = user ? (user.role === "admin" ? "Admin" : "Dashboard") : "Login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change and on Escape.
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // On the home page, "Contact" scrolls to the inline contact section.
  const onNavClick = (item) => (e) => {
    setOpen(false);
    if (item.path === "/contact" && path === "/") {
      const el = document.getElementById("contact");
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navLinkClass = (active) =>
    `relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
      active ? "text-academic-700 bg-academic-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-slate-200/60"
          : "bg-white/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer" aria-label={`${BRAND.short} — home`}>
            <Logo className="w-10 h-10 group-hover:scale-105 transition-transform duration-300" />
            <div className="hidden sm:block text-left">
              <span className="block text-sm font-bold text-slate-900 leading-tight group-hover:text-academic-700 transition-colors">
                {BRAND.short}
              </span>
              <span className="block text-[10px] font-medium text-academic-600 tracking-wider leading-tight">
                BSN-MSN-FNP HOMEWORK HELP
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const active = item.path === "/" ? path === "/" : path.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} onClick={onNavClick(item)} aria-current={active ? "page" : undefined} className={navLinkClass(active)}>
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-academic-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to={accountTo}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-academic-700 transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {accountLabel}
            </Link>
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#25d366] hover:bg-[#1eb954] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              WhatsApp
            </a>
            <Link
              to="/order-now"
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-academic-600 to-academic-500 hover:from-academic-700 hover:to-academic-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              Order Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl"
          >
            <nav className="px-4 py-6 space-y-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => {
                const active = item.path === "/" ? path === "/" : path.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavClick(item)}
                    aria-current={active ? "page" : undefined}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      active ? "text-academic-700 bg-academic-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-4 pb-6 space-y-3 border-t border-slate-100 pt-4">
              <Link
                to={accountTo}
                onClick={() => setOpen(false)}
                className="block text-center w-full py-3 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {accountLabel}
              </Link>
              <a
                href={CONTACT.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="block text-center w-full py-3 text-sm font-semibold text-white bg-[#25d366] rounded-lg transition-colors cursor-pointer"
              >
                Chat on WhatsApp
              </a>
              <Link
                to="/order-now"
                onClick={() => setOpen(false)}
                className="block text-center w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-academic-600 to-academic-500 rounded-lg shadow-md transition-all cursor-pointer"
              >
                Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
