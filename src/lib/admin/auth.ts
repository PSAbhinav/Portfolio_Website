import "server-only";
import { randomUUID } from "node:crypto";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { databaseConfigured } from "@/lib/db";
import { isOwnerProfile, OWNER_EMAIL } from "./auth-policy";

export type OwnerSession = {
  ownerSid: string;
  ownerSub: string;
  user: { email: string };
};

const SESSION_SECONDS = 4 * 60 * 60;

// Development-only: skips Google sign-in with a synthetic owner so the TOTP
// path can be exercised locally. The three-way guard keeps it out of any
// production build and any Vercel environment, whatever the flag says.
export function devBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    !process.env.VERCEL &&
    process.env.ADMIN_DEV_BYPASS === "true"
  );
}

function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function authConfigured(): boolean {
  const secrets = Boolean(process.env.NEXTAUTH_SECRET && process.env.ADMIN_ENCRYPTION_KEY);
  const signIn = googleConfigured() || devBypassEnabled();
  return secrets && signIn && databaseConfigured();
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: { params: { prompt: "select_account", scope: "openid email profile" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: SESSION_SECONDS },
  pages: { signIn: "/admin", error: "/admin" },
  callbacks: {
    async signIn({ account, profile }) {
      if (!authConfigured()) return false;
      return isOwnerProfile(account?.provider, profile as { email?: unknown; email_verified?: unknown });
    },
    async jwt({ token, account }) {
      // Identity is fixed at sign-in. Client-supplied session updates are never
      // accepted as proof of authorization.
      if (account?.provider === "google") {
        token.ownerSid = randomUUID();
        token.ownerSub = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      session.ownerSid = typeof token.ownerSid === "string" ? token.ownerSid : "";
      session.ownerSub = typeof token.ownerSub === "string" ? token.ownerSub : "";
      return session;
    },
  },
};

export async function googleOwner(): Promise<OwnerSession | null> {
  if (!authConfigured()) return null;
  if (devBypassEnabled()) {
    return { ownerSid: "dev-sid", ownerSub: "dev-owner", user: { email: OWNER_EMAIL } };
  }
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (email !== OWNER_EMAIL || !session?.ownerSid || !session.ownerSub) return null;
  return { ownerSid: session.ownerSid, ownerSub: session.ownerSub, user: { email } };
}
