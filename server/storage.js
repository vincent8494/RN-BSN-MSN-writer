// File storage abstraction. Production (Netlify Functions) uses Netlify Blobs;
// local dev writes to server/uploads/. Metadata lives in the DB; this only
// holds the bytes, keyed by attachment id.
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ENV } from "./env.js";

const STORE_NAME = "order-files";

let localDir;
try {
  localDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "uploads");
} catch {
  localDir = path.join(process.cwd(), "server", "uploads");
}

const useBlobs = () => ENV.IS_SERVERLESS;
const localPath = (key) => path.join(localDir, key.replace(/[^a-zA-Z0-9_-]/g, "_"));

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export async function putFile(key, buffer) {
  if (useBlobs()) {
    await (await blobStore()).set(key, buffer);
  } else {
    await fs.mkdir(localDir, { recursive: true });
    await fs.writeFile(localPath(key), buffer);
  }
}

export async function getFile(key) {
  if (useBlobs()) {
    const ab = await (await blobStore()).get(key, { type: "arrayBuffer" });
    return ab ? Buffer.from(ab) : null;
  }
  try {
    return await fs.readFile(localPath(key));
  } catch {
    return null;
  }
}

export async function deleteFile(key) {
  if (useBlobs()) {
    try { await (await blobStore()).delete(key); } catch {}
  } else {
    try { await fs.unlink(localPath(key)); } catch {}
  }
}
