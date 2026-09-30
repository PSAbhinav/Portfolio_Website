import type { Metadata } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { defaultContent } from "@/data/portfolio";

export const metadata: Metadata = {
  title: defaultContent.profile.metadataTitle,
  description: defaultContent.profile.metadataDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
