import { adminOwner, privateJson, unavailable } from "@/lib/admin/access";
import { sqlClient } from "@/lib/db";

const RANGES = [7, 30, 90];

export async function GET(request: Request) {
  try {
    if (!(await adminOwner())) return privateJson({ error: "Owner authentication required." }, 401);
    const days = Number(new URL(request.url).searchParams.get("days") || 30);
    if (!RANGES.includes(days)) return privateJson({ error: "Invalid date range." }, 400);

    const sql = await sqlClient();
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const [summary, daily, locations, devices, sources, sections, clicks, inbox] = await Promise.all([
      sql<{ views: number; sessions: number; clicks: number }>`
        SELECT
          COUNT(*) FILTER (WHERE kind = 'pageview')::int AS views,
          COUNT(DISTINCT session_hash)::int AS sessions,
          COUNT(*) FILTER (WHERE kind = 'outbound')::int AS clicks
        FROM analytics_events WHERE created_at >= ${since}`,
      sql`
        SELECT TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
        FROM analytics_events WHERE kind = 'pageview' AND created_at >= ${since}
        GROUP BY date ORDER BY date`,
      sql`
        SELECT country || ' / ' || city AS label, COUNT(DISTINCT session_hash)::int AS count
        FROM analytics_events WHERE created_at >= ${since}
        GROUP BY country, city ORDER BY count DESC LIMIT 15`,
      sql`
        SELECT device AS label, COUNT(DISTINCT session_hash)::int AS count
        FROM analytics_events WHERE created_at >= ${since}
        GROUP BY device ORDER BY count DESC`,
      sql`
        SELECT referrer AS label, COUNT(*)::int AS count
        FROM analytics_events WHERE kind = 'pageview' AND created_at >= ${since}
        GROUP BY referrer ORDER BY count DESC LIMIT 15`,
      sql`
        SELECT target AS label, COUNT(DISTINCT session_hash)::int AS count
        FROM analytics_events WHERE kind = 'section' AND created_at >= ${since}
        GROUP BY target ORDER BY count DESC`,
      sql`
        SELECT target AS label, COUNT(*)::int AS count
        FROM analytics_events WHERE kind = 'outbound' AND created_at >= ${since}
        GROUP BY target ORDER BY count DESC LIMIT 20`,
      sql<{ count: number }>`SELECT COUNT(*)::int AS count FROM contact_inbox WHERE created_at >= ${since}`,
    ]);

    return privateJson({
      summary: { ...summary[0], messages: inbox[0].count },
      daily,
      locations,
      devices,
      sources,
      sections,
      clicks,
    });
  } catch (error) {
    return unavailable(error, "Statistics are unavailable. Check database setup.");
  }
}
