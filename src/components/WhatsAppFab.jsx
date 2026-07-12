import { MessageCircle } from "lucide-react";
import { CONTACT } from "../data.js";

export default function WhatsAppFab() {
  return (
    <a
      href={CONTACT.whatsappLink}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-[#25d366] text-white font-semibold shadow-xl shadow-[#25d366]/30 hover:bg-[#1eb954] hover:scale-105 transition-all"
    >
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 animate-ping motion-reduce:hidden" aria-hidden="true" />
        <MessageCircle className="w-5 h-5 relative" />
      </span>
      <span className="hidden sm:inline text-sm">Chat with us</span>
    </a>
  );
}
