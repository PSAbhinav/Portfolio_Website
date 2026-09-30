import { databaseConfigured, sqlClient } from "@/lib/db";

const MEDIA_ID = /^[a-f0-9-]{36}$/;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!MEDIA_ID.test(id) || !databaseConfigured()) return new Response(null, { status: 404 });
  try {
    const sql = await sqlClient();
    const rows = await sql<{ data_base64: string }>`SELECT data_base64 FROM portfolio_media WHERE id = ${id}`;
    if (!rows.length) return new Response(null, { status: 404 });
    return new Response(Buffer.from(rows[0].data_base64, "base64"), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
