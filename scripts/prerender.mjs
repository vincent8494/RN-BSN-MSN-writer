// Build-time prerender (runs after `vite build`).
//
// Vite emits a single dist/index.html for this SPA, so every deep link relies on
// the Netlify SPA fallback and shares the homepage's <head> — which means social
// scrapers and non-JS crawlers see the homepage title/description for EVERY page.
// This script fixes that: for each indexable route it clones dist/index.html and
// rewrites the <!-- SEO:start -->…<!-- SEO:end --> block with that route's meta,
// writing dist/<route>/index.html. Netlify serves the matching static file before
// the SPA fallback, so /pricing gets pricing meta while the React app still boots
// and runs normally. Meta only comes from src/seo.js (shared with the app).

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PRERENDER_PATHS, seoFor } from "../src/seo.js";

const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const START = "<!-- SEO:start -->";
const END = "<!-- SEO:end -->";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function seoBlock(path) {
  const { title, description, url, noindex } = seoFor(path);
  const t = esc(title), d = esc(description), u = esc(url);
  return [
    START,
    `    <title>${t}</title>`,
    `    <meta name="description" content="${d}" />`,
    `    <meta property="og:title" content="${t}" />`,
    `    <meta property="og:description" content="${d}" />`,
    `    <meta property="og:url" content="${u}" />`,
    `    <meta name="twitter:title" content="${t}" />`,
    `    <meta name="twitter:description" content="${d}" />`,
    `    <link rel="canonical" href="${u}" />`,
    `    <meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow"}" />`,
    `    ${END}`,
  ].join("\n");
}

const template = readFileSync(join(DIST, "index.html"), "utf8");
const startIdx = template.indexOf(START);
const endIdx = template.indexOf(END);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  console.error("[prerender] SEO markers not found in dist/index.html — aborting.");
  process.exit(1);
}
const before = template.slice(0, startIdx);
const after = template.slice(endIdx + END.length);

let count = 0;
for (const path of PRERENDER_PATHS) {
  const html = before + seoBlock(path) + after;
  // Flat files (pricing.html, not pricing/index.html) so Netlify serves them at
  // /pricing directly — no trailing-slash 301, and the served URL matches the
  // canonical + sitemap (which have no trailing slash).
  const outFile = path === "/" ? join(DIST, "index.html") : join(DIST, path.replace(/^\//, "") + ".html");
  writeFileSync(outFile, html, "utf8");
  count++;
}
console.log(`[prerender] wrote ${count} route file(s): ${PRERENDER_PATHS.join(", ")}`);
