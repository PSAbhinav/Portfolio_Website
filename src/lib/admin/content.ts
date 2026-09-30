import { defaultContent } from "../../data/portfolio";
import { editedPaths } from "../content-merge";
import { contentSchema } from "../content-schema";
import type { Sql } from "../sql-types";
import { setOwnerEdits } from "./edits-store";

export type SaveResult = { revision: number } | { error: string; status: 400 | 409 };
export type PublishResult = { revision: number } | { error: string; status: 409 };

export function validRevision(revision: unknown): revision is number {
  return Number.isInteger(revision) && (revision as number) >= 0;
}

function describeIssues(issues: { path: (string | number)[]; message: string }[]): string {
  return issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

// Optimistic concurrency: the write only lands when the caller saw the
// latest revision, so a second open tab cannot silently overwrite the first.
export async function saveDraft(sql: Sql, content: unknown, revision: number): Promise<SaveResult> {
  if (!validRevision(revision)) return { error: "Invalid content revision.", status: 400 };
  const parsed = contentSchema.safeParse(content);
  if (!parsed.success) return { error: describeIssues(parsed.error.issues), status: 400 };

  const rows = await sql<{ revision: number | string }>`
    UPDATE portfolio_content
    SET draft = ${JSON.stringify(parsed.data)}::jsonb, revision = revision + 1
    WHERE id = 1 AND revision = ${revision}
    RETURNING revision`;
  if (!rows.length) return { error: "Another tab changed the draft. Reload before saving.", status: 409 };
  // What differs from the bundled defaults is what the owner meant to change;
  // everything else keeps following future releases (see content-merge.ts).
  await setOwnerEdits(sql, editedPaths(defaultContent, parsed.data));
  return { revision: Number(rows[0].revision) };
}

export async function publishDraft(sql: Sql, revision: number): Promise<PublishResult> {
  const stale: PublishResult = {
    error: "Save the draft first, or reload because another tab changed it.",
    status: 409,
  };
  if (!validRevision(revision)) return stale;

  // One statement so the publish and its history entry succeed or fail together.
  const rows = await sql<{ revision: number | string }>`
    WITH updated AS (
      UPDATE portfolio_content
      SET published = draft, published_at = NOW(), revision = revision + 1
      WHERE id = 1 AND revision = ${revision} AND draft IS NOT NULL
      RETURNING published, revision
    ), saved AS (
      INSERT INTO content_history(content, revision)
      SELECT published, revision FROM updated
    )
    SELECT revision FROM updated`;
  if (!rows.length) return stale;
  return { revision: Number(rows[0].revision) };
}
