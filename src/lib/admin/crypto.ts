import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key(): Buffer {
  const value = Buffer.from(process.env.ADMIN_ENCRYPTION_KEY || "", "base64");
  if (value.length !== 32) throw new Error("ADMIN_ENCRYPTION_KEY must contain a 32-byte base64 key");
  return value;
}

// AES-256-GCM. Stored as "iv.tag.ciphertext", each part base64url.
export function encryptSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(value: string): string {
  const parts = value.split(".").map((part) => Buffer.from(part, "base64url"));
  if (parts.length !== 3) throw new Error("Invalid encrypted secret");
  const [iv, tag, data] = parts;
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
