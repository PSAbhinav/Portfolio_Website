import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { adminOwner, privateJson, sameOrigin, unavailable } from "@/lib/admin/access";
import { sqlClient } from "@/lib/db";

export const runtime = "nodejs";

// Vercel functions accept request bodies up to 4.5 MB, so the ceiling is a
// little under that once the multipart framing is counted.
const MAX_BYTES = 4_000_000;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Re-encoding strips metadata and neutralises anything that is not a plain raster.
async function toWebp(file: File): Promise<Buffer> {
  return sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();
}

// A PDF is stored as sent, so it must at least start like one.
async function pdfBytes(file: File): Promise<Buffer | null> {
  const bytes = Buffer.from(await file.arrayBuffer());
  return bytes.subarray(0, 5).toString("latin1") === "%PDF-" ? bytes : null;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 4_500_000) return privateJson({ error: "Choose a file under 4 MB." }, 413);

    const form = await request.formData();
    const image = form.get("image");
    const document = form.get("file");
    let stored: { type: string; data: Buffer } | null = null;
    if (image instanceof File && image.size <= MAX_BYTES && IMAGE_TYPES.includes(image.type)) {
      stored = { type: "image/webp", data: await toWebp(image) };
    } else if (document instanceof File && document.size <= MAX_BYTES && document.type === "application/pdf") {
      const bytes = await pdfBytes(document);
      if (bytes) stored = { type: "application/pdf", data: bytes };
    }
    if (!stored) return privateJson({ error: "Use a JPG, PNG or WebP image, or a PDF, under 4 MB." }, 400);

    const sql = await sqlClient();
    const id = randomUUID();
    await sql`
      INSERT INTO portfolio_media(id, content_type, data_base64)
      VALUES(${id}, ${stored.type}, ${stored.data.toString("base64")})`;
    return privateJson({ url: `/api/media/${id}` });
  } catch (error) {
    return unavailable(error, "The file could not be uploaded.");
  }
}
