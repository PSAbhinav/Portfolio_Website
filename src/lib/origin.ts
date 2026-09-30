// Same-origin check shared by every state-changing route. It compares the
// Origin header with the host the request actually arrived on (as forwarded
// by the platform), not with the URL Node reconstructs, which on Vercel can be
// the raw deployment host while the browser's origin is the public alias.
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  const configured = process.env.SITE_URL || process.env.NEXTAUTH_URL;
  if (configured) {
    try {
      if (new URL(configured).host.toLowerCase() === originHost) return true;
    } catch {
      // fall through to the header comparison
    }
  }
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0].trim().toLowerCase();
  const host = request.headers.get("host")?.toLowerCase();
  const requestHost = new URL(request.url).host.toLowerCase();
  return originHost === forwarded || originHost === host || originHost === requestHost;
}
