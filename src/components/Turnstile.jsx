import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

// The site key is PUBLIC — embedding it in client code is exactly its purpose.
// (The secret is server-only, referenced as process.env.TURNSTILE_SECRET.)
const SITE_KEY = "0x4AAAAAAEE7k55MkPQS60WP";
const ACTION = "turnstile-spin-v2"; // analytics attribution marker
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Load the Turnstile script exactly once, shared by every widget on the site.
let scriptPromise = null;
function loadTurnstile() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null; // allow a later retry if the network hiccups
      reject(new Error("Failed to load Turnstile."));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// A single Turnstile widget. Fires onToken(token) when solved and onToken("")
// when the token expires or errors. Parent holds a ref and calls reset() to
// clear a spent token before a retry — Turnstile tokens are single-use.
const Turnstile = forwardRef(function Turnstile({ onToken, className = "" }, ref) {
  const holder = useRef(null);
  const widgetId = useRef(null);
  // Keep the latest onToken without re-running the render effect.
  const cb = useRef(onToken);
  cb.current = onToken;

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        if (widgetId.current !== null && window.turnstile) {
          try {
            window.turnstile.reset(widgetId.current);
          } catch {}
        }
      },
    }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        // Guard against StrictMode's double-invoke and post-unmount resolves.
        if (cancelled || !holder.current || !window.turnstile) return;
        if (widgetId.current !== null) return;
        widgetId.current = window.turnstile.render(holder.current, {
          sitekey: SITE_KEY,
          action: ACTION,
          callback: (token) => cb.current && cb.current(token),
          "expired-callback": () => cb.current && cb.current(""),
          "error-callback": () => cb.current && cb.current(""),
        });
      })
      .catch(() => {
        // Script blocked/offline: leave the token empty. The server decides
        // (it fails closed when Turnstile is configured).
      });
    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {}
      }
      widgetId.current = null;
    };
  }, []);

  // data-action is mirrored on the div so analytics can attribute the widget.
  return <div ref={holder} className={`cf-turnstile ${className}`} data-action={ACTION} />;
});

export default Turnstile;
