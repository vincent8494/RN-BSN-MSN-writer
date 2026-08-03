// ---------------------------------------------------------------------------
// Cloudflare Turnstile — server-side verification.
//
// The secret lives ONLY in the TURNSTILE_SECRET environment variable (set in
// the Netlify site settings); it is never hard-coded here. When the secret is
// not configured (e.g. local dev, or before it's set in production) the guard
// is a no-op so the site keeps working — exactly like emailEnabled(). Once the
// secret IS set, every guarded endpoint fails CLOSED: any network error,
// non-2xx response, non-JSON body, or `success !== true` is treated as a
// failed human check.
//
// The browser NEVER calls siteverify directly (the secret must stay server
// side): the widget hands a single-use token to our API in the JSON body, and
// only this module exchanges that token + secret with Cloudflare.
// ---------------------------------------------------------------------------

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET);
}

// Verifies a widget token with Cloudflare. Returns true when the token is valid
// — or when Turnstile is not configured at all (rollout escape hatch). Returns
// false (fail closed) on a missing token or any failure once a secret is set.
export async function verifyTurnstile(token, remoteip) {
  if (!turnstileEnabled()) return true; // not configured → allow through
  if (!token || typeof token !== "string") return false;

  // siteverify expects application/x-www-form-urlencoded.
  const body = new URLSearchParams();
  body.set("secret", process.env.TURNSTILE_SECRET);
  body.set("response", token);
  if (remoteip) body.set("remoteip", remoteip);

  try {
    const resp = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!resp.ok) return false; // non-2xx → fail closed
    const data = await resp.json().catch(() => null);
    if (!data || typeof data !== "object") return false; // non-JSON → fail closed
    return data.success === true;
  } catch {
    return false; // network / DNS / abort → fail closed
  }
}

// Express middleware. Reads the single-use token from the JSON body
// (cf-turnstile-response, the name the widget uses), verifies it, and 403s on
// failure. Client IP prefers Netlify's real-client header, then trust-proxy ip.
export function turnstileGuard(req, res, next) {
  const token =
    req.body?.["cf-turnstile-response"] || req.body?.turnstileToken || "";
  const ip = req.headers["x-nf-client-connection-ip"] || req.ip;
  verifyTurnstile(token, ip)
    .then((ok) => {
      if (ok) return next();
      res
        .status(403)
        .json({ error: "Human verification failed. Please complete the challenge and try again." });
    })
    .catch(() =>
      res.status(403).json({ error: "Human verification failed. Please try again." })
    );
}
