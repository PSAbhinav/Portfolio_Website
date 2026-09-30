import type { Metadata } from "next";
import AdminPanel from "@/components/admin/AdminPanel";
import ThemeBoot from "@/components/ThemeBoot";
import { defaultContent } from "@/data/portfolio";
import { authConfigured, devBypassEnabled } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private studio | Abhinav",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <>
      <ThemeBoot content={defaultContent} />
      <AdminPanel configured={authConfigured()} devBypass={devBypassEnabled()} />
    </>
  );
}
