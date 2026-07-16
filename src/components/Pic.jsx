// Responsive image: serves pre-generated WebP variants (name-<w>.webp next to
// the original) with the original file as fallback for older browsers.
//
// - `minWidth`: when the image is CSS-hidden below a breakpoint, pass that
//   breakpoint so small screens get a 35-byte placeholder instead of
//   downloading a hidden image (display:none does NOT stop <img> fetches).
// - If a variant file is missing on the server, onError drops the <source>
//   and reloads the original, so a broken variant can never blank the image.
const TINY_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function Pic({ src, alt = "", widths = [480, 960], sizes = "100vw", eager = false, minWidth = 0, ...imgProps }) {
  const base = src.replace(/\.(jpe?g|png)$/i, "");
  const srcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");

  const onError = (e) => {
    const img = e.currentTarget;
    const pic = img.parentNode;
    if (pic && pic.tagName === "PICTURE") {
      for (const s of [...pic.querySelectorAll("source")]) s.remove();
    }
    if (!img.src.endsWith(src)) img.src = src;
  };

  return (
    <picture>
      {minWidth > 0 && <source media={`(max-width: ${minWidth - 1}px)`} srcSet={TINY_GIF} />}
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={onError}
        {...imgProps}
      />
    </picture>
  );
}
