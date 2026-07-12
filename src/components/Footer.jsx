import { GraduationCap, Mail, MessageCircle, Phone, ArrowUp } from "lucide-react";
import { Link } from "../router.jsx";
import { BRAND, CONTACT, FOOTER_LINKS, UNIVERSITIES } from "../data.js";

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(70,120,173,0.18),transparent_60%)] pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-academic-500 to-academic-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-sm font-bold text-white">{BRAND.short}</span>
                <span className="block text-[10px] text-academic-300 tracking-wider">{BRAND.tagline}</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Expert nursing & healthcare academic help across BSN, MSN, DNP and Social Work. 100% human-written,
              no plagiarism, 100% privacy, 24-hour turnaround.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.map((n) => (
                <li key={n.path}>
                  <Link to={n.path} className="hover:text-academic-300 transition-colors cursor-pointer">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Schools We Cover</h4>
            <ul className="space-y-2 text-sm">
              {UNIVERSITIES.map((u) => (
                <li key={u.id}>
                  <Link to="/services" className="hover:text-academic-300 transition-colors cursor-pointer text-left">
                    {u.short}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={CONTACT.whatsappLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#25d366] transition-colors">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </li>
              <li>
                <a href={CONTACT.whatsappNumberLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-academic-300 transition-colors">
                  <Phone className="w-4 h-4" /> {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-academic-300 transition-colors break-all">
                  <Mail className="w-4 h-4 shrink-0" /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.tiktok} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-academic-300 transition-colors">
                  <span className="w-4 h-4 grid place-items-center text-[13px] font-bold">♪</span> TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-3 text-xs text-slate-500">
          <p className="text-center md:text-left">
            Independent academic tutoring & writing service. Not affiliated with, endorsed by, or sponsored by
            WGU, Capella, Post University, SNHU, GCU, Walden, Purdue, Herzing, South University, Penn Foster or Sophia Learning.
            All university names, course codes and logos are the property of their respective owners and are used for identification only.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-academic-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-academic-400 transition-colors">Terms &amp; Conditions</Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-1 hover:text-academic-400 transition-colors cursor-pointer"
              >
                Back to top <ArrowUp className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
