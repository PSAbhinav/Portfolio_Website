import { defaultContent } from "../data/portfolio";
import { contentSchema, type PortfolioContent } from "./content-schema";
import { mergeWithDefaults } from "./content-merge";
import { getOwnerEdits } from "./admin/edits-store";
import type { Sql } from "./sql-types";

let warned = false;
function fallback(reason: string): PortfolioContent {
  if (!warned) {
    warned = true;
    console.warn(`Published content could not be used (${reason}). Showing the bundled portfolio.`);
  }
  return defaultContent;
}

// Pure version used by tests and by the server wrappers below. A null client
// means "no database configured".
export async function getPublishedContentWith(sql: Sql | null): Promise<PortfolioContent> {
  if (!sql) return defaultContent;
  try {
    const rows = await sql<{ published: unknown }>`SELECT published FROM portfolio_content WHERE id = 1`;
    if (!rows[0]?.published) return defaultContent;
    const parsed = contentSchema.safeParse(mergeWithDefaults(defaultContent, rows[0].published, await getOwnerEdits(sql)));
    return parsed.success ? parsed.data : fallback("schema mismatch");
  } catch {
    return fallback("database unavailable");
  }
}

export async function getDraftWith(sql: Sql): Promise<{ content: PortfolioContent; revision: number }> {
  const rows = await sql<{ draft: unknown; revision: number | string }>`SELECT draft, revision FROM portfolio_content WHERE id = 1`;
  const parsed = rows[0]?.draft ? contentSchema.safeParse(mergeWithDefaults(defaultContent, rows[0].draft, await getOwnerEdits(sql))) : null;
  return {
    content: parsed?.success ? parsed.data : defaultContent,
    revision: Number(rows[0]?.revision ?? 0),
  };
}

async function client(): Promise<Sql | null> {
  const { databaseConfigured, sqlClient } = await import("./db");
  if (!databaseConfigured()) return null;
  try {
    return await sqlClient();
  } catch {
    return null;
  }
}

export async function getPublishedContent(): Promise<PortfolioContent> {
  return getPublishedContentWith(await client());
}

export async function getDraft(): Promise<{ content: PortfolioContent; revision: number }> {
  const sql = await client();
  if (!sql) throw new Error("Database is not configured");
  return getDraftWith(sql);
}
