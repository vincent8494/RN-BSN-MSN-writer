import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Link } from "../router.jsx";

const KEY = "rnbsn_cookie_ok";

export default function CookieConsent() {
  const [accepted, setAccepted] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return true;
    }
  });

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setAccepted(true);
  };

  return (
    <AnimatePresence>
      {!accepted && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-label="Cookie notice"
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-[90] card-academic p-4 sm:p-5 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0" aria-hidden="true">
              <Cookie className="w-5 h-5" />
            </span>
            <div className="text-sm text-slate-600">
              We use essential cookies to keep you signed in and remember your preferences.{" "}
              <Link to="/privacy" className="font-semibold text-academic-600 hover:text-academic-700">Learn more</Link>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={accept} className="px-5 py-2 rounded-lg bg-academic-600 hover:bg-academic-700 text-white text-sm font-semibold transition-colors cursor-pointer">
              I agree
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
