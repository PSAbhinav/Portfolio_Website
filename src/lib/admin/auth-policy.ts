export const OWNER_EMAIL = "abhinavpemmaraju@gmail.com";

type GoogleProfile = { email?: unknown; email_verified?: unknown } | undefined;

// Only the owner's Google account, with an e-mail Google has verified, may sign in.
export function isOwnerProfile(provider: unknown, profile: GoogleProfile): boolean {
  if (provider !== "google") return false;
  if (profile?.email_verified !== true) return false;
  if (typeof profile.email !== "string") return false;
  return profile.email.toLowerCase() === OWNER_EMAIL;
}
