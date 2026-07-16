// Responsive image via Cloudinary (fetch mode) in production: Cloudinary pulls
// the original from this site once, then serves auto-format (WebP/AVIF per
// browser), auto-quality, resized variants from its CDN. No upload step —
// anything in public/images/ is optimized automatically.
//
// Dev builds keep the local pre-generated -<w>.webp variants (Cloudinary can't
// fetch localhost). If Cloudinary ever fails in production, onError falls back
// to the original local file so an image can never render broken.
//
// `minWidth`: when the image is CSS-hidden below a breakpoint, pass that
// breakpoint so small screens get a 35-byte placeholder instead of downloading
// a hidden image (display:none does NOT stop <img> fetches).
import { SITE_URL } from "../data.js";

const CLOUDINARY_CLOUD = "g7xfxc8k";
const TINY_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const USE_CDN = import.meta.env.PROD;

// c_limit never upscales past the original, so large widths are safe to list.
const cdnUrl = (src, w) =>
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/f_auto,q_auto,w_${w},c_limit/${encodeURIComponent(SITE_URL + src)}`;

export default function Pic({ src, alt = "", widths = [480, 960], sizes = "100vw", eager = false, minWidth = 0, ...imgProps }) {
  const base = src.replace(/\.(jpe?g|png)$/i, "");
  const localSrcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  const cdnSrcSet = widths.map((w) => `${cdnUrl(src, w)} ${w}w`).join(", ");

  const onError = (e) => {
    // Cloudinary or a variant failed — strip responsive sources and load the
    // original file straight from this site.
    const img = e.currentTarget;
    const pic = img.parentNode;
    if (pic && pic.tagName === "PICTURE") {
      for (const s of [...pic.querySelectorAll("source")]) s.remove();
    }
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    if (!img.src.endsWith(src)) img.src = src;
  };

  return (
    <picture>
      {minWidth > 0 && <source media={`(max-width: ${minWidth - 1}px)`} srcSet={TINY_GIF} />}
      {!USE_CDN && <source type="image/webp" srcSet={localSrcSet} sizes={sizes} />}
      <img
        src={src}
        srcSet={USE_CDN ? cdnSrcSet : undefined}
        sizes={USE_CDN ? sizes : undefined}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={onError}
        {...imgProps}
      />
    </picture>
  );
}
