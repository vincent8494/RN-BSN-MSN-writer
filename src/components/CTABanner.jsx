import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "../router.jsx";

// Pre-footer conversion banner used across secondary pages.
export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-academic-700 via-academic-600 to-academic-500">
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-28 -left-10 w-80 h-80 rounded-full bg-academic-900/30 blur-2xl pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col lg:flex-row items-center justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="text-center lg:text-left"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            You're one step closer to a distinguished grade
          </h2>
          <p className="text-academic-100 flex items-center justify-center lg:justify-start gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            100% human-written, plagiarism-free work with unlimited free revisions.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 shrink-0"
        >
          <Link to="/order-now" className="px-7 py-3.5 rounded-xl bg-white text-academic-700 font-bold text-sm hover:bg-academic-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
            Start Now <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/signup" className="px-7 py-3.5 rounded-xl border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center">
            Sign Up Free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
