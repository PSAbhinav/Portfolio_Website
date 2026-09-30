import { clearMfaCookie, privateJson, sameOrigin } from "@/lib/admin/access";
import { googleOwner } from "@/lib/admin/auth";
import { endMfaSessions } from "@/lib/admin/totp";
import { sqlClient } from "@/lib/db";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    const owner = await googleOwner();
    if (owner) await endMfaSessions(await sqlClient(), owner.ownerSid);
  } catch {
    // Signing out must still clear the cookie when the database is unreachable.
  }
  await clearMfaCookie();
  return privateJson({ ok: true });
}
