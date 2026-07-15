// Brand logo — the medical stethoscope + writing pen/quill mark on a rounded
// badge. The badge keeps the mark legible on any background (light navbar, dark
// footer/auth) and its surface adapts to the light/dark color theme (see
// `.brand-logo` in index.css). Size comes from the className.
export default function Logo({ className = "w-10 h-10" }) {
  return (
    <span className={`brand-logo inline-flex items-center justify-center rounded-xl overflow-hidden ${className}`}>
      <img
        src="/logo-mark.png"
        alt="RN-BSN & MSN Writers"
        className="w-[82%] h-[82%] object-contain"
        decoding="async"
      />
    </span>
  );
}
