import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { adminOwner, privateJson, sameOrigin, unavailable } from "@/lib/admin/access";
import { sqlClient } from "@/lib/db";

export const runtime = "nodejs";

const MAX_BYTES = 4_000_000;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Re-encoding strips metadata and neutralises anything that is not a plain raster.
async function toWebp(file: File): Promise<Buffer> {
  return sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 4_500_000) return privateJson({ error: "Choose an image under 4 MB." }, 413);

    const form = await request.formData();
    const file = form.get("image");
    const acceptable = file instanceof File && file.size <= MAX_BYTES && ACCEPTED_TYPES.includes(file.type);
    if (!acceptable) return privateJson({ error: "Use a JPG, PNG, or WebP image under 4 MB." }, 400);

    const raster = await toWebp(file);
    const sql = await sqlClient();
    const id = randomUUID();
    await sql`
      INSERT INTO portfolio_media(id, content_type, data_base64)
      VALUES(${id}, 'image/webp', ${raster.toString("base64")})`;
    return privateJson({ url: `/api/media/${id}` });
  } catch (error) {
    return unavailable(error, "The image could not be uploaded.");
  }
}
