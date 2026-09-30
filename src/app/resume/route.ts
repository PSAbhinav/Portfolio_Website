import { getPublishedContent } from "@/lib/content-store";
import { databaseConfigured, sqlClient } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MEDIA_PATH = /^\/api\/media\/([a-f0-9-]{36})$/;

// A stable address for the résumé, so the link on LinkedIn or in an e-mail
// keeps working after the owner replaces the file in the studio. Uploads are
// streamed with a readable filename; bundled files are redirected to.
export async function GET(request: Request) {
  const { profile } = await getPublishedContent();
  if (!profile.resume) return new Response(null, { status: 404 });
  const filename = `${profile.name.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")}-Resume.pdf`;
  const upload = MEDIA_PATH.exec(profile.resume);
  if (!upload || !databaseConfigured()) return Response.redirect(new URL(profile.resume, request.url), 302);
  try {
    const sql = await sqlClient();
    const rows = await sql<{ content_type: string; data_base64: string }>`SELECT content_type, data_base64 FROM portfolio_media WHERE id = ${upload[1]}`;
    if (!rows.length || rows[0].content_type !== "application/pdf") return new Response(null, { status: 404 });
    return new Response(Buffer.from(rows[0].data_base64, "base64"), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
