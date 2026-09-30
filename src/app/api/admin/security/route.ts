import QRCode from "qrcode";
import { adminOwner, privateJson, readJson, sameOrigin, setMfaCookie, unavailable } from "@/lib/admin/access";
import { owner as passphraseOwner, type OwnerSession } from "@/lib/admin/auth";
import { beginEnrollment, createMfaSession, enrollmentStatus, totpFor, verifyCode } from "@/lib/admin/totp";
import { sqlClient } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const owner = await passphraseOwner();
    if (!owner) return privateJson({ error: "Sign in with the owner passphrase." }, 401);
    const sql = await sqlClient();
    const { enrolled } = await enrollmentStatus(sql, owner.ownerSub);
    return privateJson({ enrolled, verified: Boolean(await adminOwner()) });
  } catch (error) {
    return unavailable(error, "Admin storage is unavailable. Check the database setup.");
  }
}

async function enroll(owner: OwnerSession): Promise<Response> {
  const sql = await sqlClient();
  const enrollment = await beginEnrollment(sql, owner.ownerSub);
  if (!enrollment) {
    return privateJson({ error: "Authenticator is already registered. Enter your current code." }, 409);
  }
  const uri = totpFor(enrollment.secret).toString();
  const qr = await QRCode.toDataURL(uri, { width: 240, margin: 2 });
  return privateJson({ qr, secret: enrollment.secret });
}

async function verify(owner: OwnerSession, code: unknown): Promise<Response> {
  const sql = await sqlClient();
  const result = await verifyCode(sql, owner.ownerSub, typeof code === "string" ? code : "");
  if (!result.ok) return privateJson({ error: result.error }, result.status);
  const token = await createMfaSession(sql, owner.ownerSub, owner.ownerSid);
  await setMfaCookie(token);
  return privateJson({ verified: true, recoveryCodes: result.recoveryCodes });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    const owner = await passphraseOwner();
    if (!owner) return privateJson({ error: "Sign in with the owner passphrase." }, 401);
    const data = await readJson(request, 1000);
    if (!data) return privateJson({ error: "Invalid request." }, 400);
    if (data.action === "enroll") return await enroll(owner);
    if (data.action === "verify") return await verify(owner, data.code);
    return privateJson({ error: "Enter a six-digit code or a recovery code." }, 400);
  } catch (error) {
    return unavailable(error, "Security setup could not be completed. Check the server configuration.");
  }
}
