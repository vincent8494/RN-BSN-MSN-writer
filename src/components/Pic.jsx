// Responsive image: serves pre-generated WebP variants (name-<w>.webp next to
// the original) with the original file as fallback for older browsers.
export default function Pic({ src, alt = "", widths = [480, 960], sizes = "100vw", eager = false, ...imgProps }) {
  const base = src.replace(/\.(jpe?g|png)$/i, "");
  const srcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        {...imgProps}
      />
    </picture>
  );
}
