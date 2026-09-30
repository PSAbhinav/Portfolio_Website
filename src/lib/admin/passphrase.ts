import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Stored as "scrypt$<salt base64>$<hash base64>". Parameters are fixed so a
// hash made by scripts/make-secrets.mjs always verifies here.
const KEY_LENGTH = 32;
const PARAMS = { N: 16384, r: 8, p: 1 };

function derive(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase.normalize("NFKC"), salt, KEY_LENGTH, PARAMS);
}

export function hashPassphrase(passphrase: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${derive(passphrase, salt).toString("base64")}`;
}

// Next.js expands `$NAME` inside .env files, so a hash pasted there must be
// written as scrypt\$salt\$hash. The escaped form is accepted verbatim too,
// so the same line works in .env.local and in the Vercel dashboard.
export function verifyPassphrase(passphrase: string, stored: string): boolean {
  const parts = stored.replaceAll("\\$", "$").split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "base64");
  const expected = Buffer.from(parts[2], "base64");
  if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
  return timingSafeEqual(derive(passphrase, salt), expected);
}
