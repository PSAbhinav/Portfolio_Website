import type { NextConfig } from "next";
import path from "node:path";

// The studio and its APIs must never render inside another site's frame.
const PRIVATE_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve("."),
  // PGlite ships WebAssembly and sharp ships native binaries; neither should be bundled.
  serverExternalPackages: ["@electric-sql/pglite", "sharp"],
  images: { qualities: [75, 90] },
  async headers() {
    return [
      { source: "/admin", headers: PRIVATE_HEADERS },
      { source: "/admin/:path*", headers: PRIVATE_HEADERS },
      { source: "/api/admin/:path*", headers: PRIVATE_HEADERS },
      { source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] },
    ];
  },
};

export default nextConfig;
