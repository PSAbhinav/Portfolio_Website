import { adminOwner, privateJson, readJson, sameOrigin, unavailable } from "@/lib/admin/access";
import { passphraseHash } from "@/lib/admin/auth";
import { hashPassphrase, verifyPassphrase } from "@/lib/admin/passphrase";
import { acceptablePassphrase, effectiveHash, getStoredPassphraseHash, setStoredPassphraseHash } from "@/lib/admin/passphrase-store";
import { sqlClient } from "@/lib/db";

export const runtime = "nodejs";

// Change the owner passphrase. Requires the full session (passphrase and
// authenticator) plus the current passphrase, so a hijacked tab alone cannot
// lock the owner out.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const data = await readJson(request, 2048);
    if (!data || typeof data.current !== "string" || !acceptablePassphrase(data.next)) {
      return privateJson({ error: "Enter your current passphrase and a new one of at least 12 characters." }, 400);
    }
    const sql = await sqlClient();
    const stored = effectiveHash(await getStoredPassphraseHash(sql), passphraseHash());
    if (!stored || !verifyPassphrase(data.current, stored)) return privateJson({ error: "The current passphrase is incorrect." }, 401);
    if (verifyPassphrase(data.next, stored)) return privateJson({ error: "Choose a passphrase you have not used before." }, 400);
    await setStoredPassphraseHash(sql, hashPassphrase(data.next.normalize("NFKC").trim()));
    return privateJson({ ok: true });
  } catch (error) {
    return unavailable(error, "The passphrase could not be changed.");
  }
}
