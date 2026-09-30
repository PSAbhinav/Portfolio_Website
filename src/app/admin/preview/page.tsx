import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Portfolio from "@/components/Portfolio";
import { PortfolioProvider } from "@/components/PortfolioContext";
import { adminOwner } from "@/lib/admin/access";
import { getDraft } from "@/lib/content-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Draft preview | Private studio",
  robots: { index: false, follow: false },
};

// Owner-only. Anyone else, including a signed-in owner without a live MFA
// session, gets a plain 404 so the route's existence is not confirmed.
export default async function DraftPreview() {
  const owner = await adminOwner().catch(() => null);
  if (!owner) notFound();
  const { content: draft } = await getDraft();

  return (
    <PortfolioProvider content={draft}>
      <div className="studio-draft-banner" role="note">
        <span className="eyebrow">Private draft</span>
        <span>Not published. Only you can see this preview.</span>
        <a href="/admin">Back to the studio</a>
      </div>
      <Portfolio />
    </PortfolioProvider>
  );
}
