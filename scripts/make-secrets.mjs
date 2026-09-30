// Prints fresh studio secrets as .env lines, ready to paste into .env.local
// or the Vercel environment variables screen.
//
//   node scripts/make-secrets.mjs "your passphrase"
//
// Without an argument only the two random secrets are printed. The hash format
// must match src/lib/admin/passphrase.ts. Its `$` separators are printed as
// `\$` because Next.js expands `$NAME` in .env files; the verifier accepts
// either form, so the same line also works when pasted into Vercel.
import { randomBytes, scryptSync } from "node:crypto";

console.log(`ADMIN_SESSION_SECRET=${randomBytes(32).toString("base64")}`);
console.log(`ADMIN_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}`);

const passphrase = process.argv[2];
if (passphrase) {
  const salt = randomBytes(16);
  const hash = scryptSync(passphrase.normalize("NFKC"), salt, 32, { N: 16384, r: 8, p: 1 });
  const escaped = ["scrypt", salt.toString("base64"), hash.toString("base64")].join("\\$");
  console.log(`ADMIN_PASSPHRASE_HASH=${escaped}`);
}
