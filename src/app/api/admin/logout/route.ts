import { clearMfaCookie, privateJson, sameOrigin } from "@/lib/admin/access";
import { clearOwnerCookie, owner } from "@/lib/admin/auth";
import { endMfaSessions } from "@/lib/admin/totp";
import { sqlClient } from "@/lib/db";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    const session = await owner();
    if (session) await endMfaSessions(await sqlClient(), session.ownerSid);
  } catch {
    // Signing out must still clear the cookies when the database is unreachable.
  }
  await clearMfaCookie();
  await clearOwnerCookie();
  return privateJson({ ok: true });
}
