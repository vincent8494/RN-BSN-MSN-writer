// Self-hosted entry (dev + `npm start`). On Netlify the app is served by
// netlify/functions/api.js instead and static files come from the CDN.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./env.js";
import { app, ready } from "./app.js";

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
if (ENV.NODE_ENV === "production") {
  app.use(express.static(dist, { maxAge: "1y", index: false, setHeaders: (res, p) => {
    if (p.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
  }}));
  // SPA fallback (Express 5: use() instead of get("*"))
  app.use((_req, res) => res.sendFile(path.join(dist, "index.html")));
}

await ready;

app.listen(ENV.PORT, "127.0.0.1", () => {
  console.log(`[server] API on http://127.0.0.1:${ENV.PORT} (${ENV.NODE_ENV})`);
});
