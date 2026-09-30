import { databaseConfigured, sqlClient } from "@/lib/db";

const MEDIA_ID = /^[a-f0-9-]{36}$/;
// Only the types the upload route writes; anything else in the table is not served.
const SERVED_TYPES = new Set(["image/webp", "application/pdf"]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!MEDIA_ID.test(id) || !databaseConfigured()) return new Response(null, { status: 404 });
  try {
    const sql = await sqlClient();
    const rows = await sql<{ content_type: string; data_base64: string }>`SELECT content_type, data_base64 FROM portfolio_media WHERE id = ${id}`;
    if (!rows.length || !SERVED_TYPES.has(rows[0].content_type)) return new Response(null, { status: 404 });
    return new Response(Buffer.from(rows[0].data_base64, "base64"), {
      headers: {
        "Content-Type": rows[0].content_type,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
