import NextAuth from "next-auth";
import { authConfigured, authOptions } from "@/lib/admin/auth";

const handler = NextAuth(authOptions);

type RouteContext = { params: Promise<{ nextauth: string[] }> };

async function configuredHandler(request: Request, context: RouteContext) {
  if (!authConfigured()) {
    return Response.json(
      { error: "Owner sign-in is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } },
    );
  }
  return handler(request, context);
}

export { configuredHandler as GET, configuredHandler as POST };
