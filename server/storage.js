// File storage — bytes live in the database (attachment_data), keyed by the
// attachment id. Keeping files in Turso means one storage backend, automatic
// cascade with the order, and no separate blob-service credentials to manage.
// Per-file size is capped upstream to stay within the serverless request limit.
import { get, run } from "./db.js";

export async function putFile(key, buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  await run(
    "INSERT INTO attachment_data (id, bytes) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET bytes = excluded.bytes",
    [key, bytes]
  );
}

export async function getFile(key) {
  const row = await get("SELECT bytes FROM attachment_data WHERE id = ?", [key]);
  if (!row || row.bytes == null) return null;
  return Buffer.isBuffer(row.bytes) ? row.bytes : Buffer.from(row.bytes);
}

export async function deleteFile(key) {
  await run("DELETE FROM attachment_data WHERE id = ?", [key]);
}
