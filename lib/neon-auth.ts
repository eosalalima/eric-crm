import { cookies, headers } from "next/headers";

export type AuthUser = { id: string; email: string; name?: string; emailVerified: boolean };
export type AuthSession = { user: AuthUser; session: { id: string; expiresAt: string } };

function baseUrl() {
  const value = process.env.NEON_AUTH_BASE_URL;
  if (!value) throw new Error("NEON_AUTH_BASE_URL is required");
  return value.replace(/\/$/, "");
}

export async function neonAuthRequest(path: string, init: RequestInit = {}) {
  return fetch(`${baseUrl()}/api/auth/${path.replace(/^\//, "")}`, { ...init, cache: "no-store" });
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookie = (await cookies()).toString();
  const response = await neonAuthRequest("get-session", { headers: { cookie, "user-agent": (await headers()).get("user-agent") ?? "ERIC CRM" } });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.user ? data as AuthSession : null;
}
