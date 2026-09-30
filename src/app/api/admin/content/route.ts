import { adminOwner, privateJson, readJson, sameOrigin, unavailable } from "@/lib/admin/access";
import { publishDraft, saveDraft, validRevision } from "@/lib/admin/content";
import { getDraftWith } from "@/lib/content-store";
import { sqlClient } from "@/lib/db";

const MAX_BODY = 300_000;

export async function GET() {
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const sql = await sqlClient();
    return privateJson(await getDraftWith(sql));
  } catch (error) {
    return unavailable(error, "Content storage is unavailable.");
  }
}

function sendResult(result: { revision: number } | { error: string; status: number }): Response {
  if ("error" in result) return privateJson({ error: result.error }, result.status);
  return privateJson({ revision: result.revision });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "Invalid origin." }, 403);
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return privateJson({ error: "Content is too large." }, 413);
    const data = await readJson(request, MAX_BODY);
    if (!data) return privateJson({ error: "Invalid request." }, 400);
    if (!validRevision(data.revision)) return privateJson({ error: "Invalid content revision." }, 400);

    const sql = await sqlClient();
    if (data.action === "save") return sendResult(await saveDraft(sql, data.content, data.revision));
    if (data.action === "publish") return sendResult(await publishDraft(sql, data.revision));
    return privateJson({ error: "Unknown action." }, 400);
  } catch (error) {
    return unavailable(error, "The change could not be saved. Your draft is still in the editor.");
  }
}
