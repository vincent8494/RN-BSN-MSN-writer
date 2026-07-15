// Brand mark — a stethoscope forming a loop with a heart in the chest piece.
// Uses currentColor so it inherits text color (white on the navy tile, navy on
// light backgrounds). Keep this in sync with public/favicon.svg.
export default function Logo({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* ear tubes (Y shape) */}
      <path d="M17 7 C 14 20, 17 29, 26 33" />
      <path d="M41 7 C 44 20, 41 29, 32 33" />
      {/* earpiece buds */}
      <path d="M15.5 6.5 l3 -1.5" />
      <path d="M42.5 6.5 l-3 -1.5" />
      {/* main tube: junction down into a loop toward the chest piece */}
      <path d="M29 33 C 29 43, 24 49, 17 48 C 11 47, 11 39, 17 39 C 24 39, 28 46, 33 51" />
      {/* chest piece */}
      <circle cx="43" cy="49" r="9.5" />
      {/* heart inside the chest piece */}
      <path
        d="M43 53.2 C 40.6 51 38.8 49.2 38.8 47.4 C 38.8 45.8 40 44.7 41.4 44.7 C 42.1 44.7 42.6 45 43 45.6 C 43.4 45 43.9 44.7 44.6 44.7 C 46 44.7 47.2 45.8 47.2 47.4 C 47.2 49.2 45.4 51 43 53.2 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
