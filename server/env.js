// Minimal .env loader (reads server/.env if present; real environment
// variables always win). On Netlify, env vars come from the site settings.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), ".env");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

// Serverless runtimes (Netlify Functions on AWS Lambda) always sit behind
// HTTPS and don't reliably set NODE_ENV — detect them explicitly.
const IS_SERVERLESS = Boolean(process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const ENV = {
  PORT: parseInt(process.env.PORT || "8787", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production" || IS_SERVERLESS,
  IS_SERVERLESS,
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || "admin@rnbsnwriters.com").toLowerCase(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
  SESSION_DAYS: parseInt(process.env.SESSION_DAYS || "30", 10),

  // Database: local SQLite file by default; a Turso database when
  // TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) is set.
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || "",
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN || "",

  // Public origin the buyer returns to after paying (the site URL).
  SITE_ORIGIN: (process.env.SITE_ORIGIN || process.env.URL || "http://localhost:5173").replace(/\/$/, ""),

  // Payment gateways — each activates automatically when its keys are set.
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || "",
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || "",
  PAYPAL_ENV: process.env.PAYPAL_ENV === "live" ? "live" : "sandbox",
};
