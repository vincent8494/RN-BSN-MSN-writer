import { motion } from "framer-motion";
import CountUp from "./CountUp.jsx";
import { STATS } from "../data.js";

// Animated stats band (dark variant for gradient sections, light for white).
export default function StatsStrip({ dark = false }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.07 }}
          className={`rounded-2xl p-5 text-center border ${
            dark ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <p className={`text-3xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
            <CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix} />
          </p>
          <p className={`text-xs mt-1 font-medium ${dark ? "text-academic-200" : "text-slate-500"}`}>{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
