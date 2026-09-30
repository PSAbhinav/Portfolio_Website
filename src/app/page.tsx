import type { Metadata } from "next";
import { cache } from "react";
import Portfolio from "@/components/Portfolio";
import { PortfolioProvider } from "@/components/PortfolioContext";
import Analytics from "@/components/Analytics";
import { getPublishedContent as loadPublishedContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";

// One database read per request, shared by the metadata and the page.
const getPublishedContent = cache(loadPublishedContent);

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPublishedContent();
  return {
    title: profile.metadataTitle,
    description: profile.metadataDescription,
    openGraph: {
      title: profile.metadataTitle,
      description: profile.metadataDescription,
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${profile.name} — portfolio` }],
    },
    twitter: { card: "summary_large_image", title: profile.metadataTitle, description: profile.metadataDescription, images: ["/og.png"] },
  };
}

export default async function Home() {
  const content = await getPublishedContent();
  return (
    <PortfolioProvider content={content}>
      <Portfolio />
      <Analytics />
    </PortfolioProvider>
  );
}
