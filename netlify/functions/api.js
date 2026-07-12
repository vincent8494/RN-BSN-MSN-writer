// Netlify Function wrapping the Express API. Requests reach it through the
// /api/* redirect in netlify.toml.
import serverless from "serverless-http";
import { app, ready } from "../../server/app.js";

const wrapped = serverless(app, {
  request(req) {
    // Normalize direct function invocations (/.netlify/functions/api/...) to
    // the /api/* paths the Express routes are mounted on. Redirected requests
    // already arrive as /api/*.
    req.url = req.url.replace(/^\/\.netlify\/functions\/api/, "/api") || "/api";
  },
});

export const handler = async (event, context) => {
  try {
    await ready; // schema + admin seed complete before serving
  } catch (e) {
    // Fail closed with clean JSON (e.g. Turso or ADMIN_PASSWORD not set yet).
    console.error("[api] startup failed:", e.message);
    return {
      statusCode: 503,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Service is not fully configured yet. Please try again later." }),
    };
  }
  return wrapped(event, context);
};
