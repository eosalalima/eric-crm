import { cookies, headers } from "next/headers";

export type AuthUser = { id: string; email: string; name?: string; emailVerified: boolean };
export type AuthSession = { user: AuthUser; session: { id: string; expiresAt: string } };

function baseUrl() {
  return process.env.NEON_AUTH_BASE_URL?.trim().replace(/\/$/, "") || null;
}

export async function neonAuthRequest(path: string, init: RequestInit = {}) {
  const url = baseUrl();
  if (!url) {
    return Response.json(
      { error: "Authentication service is not configured." },
      { status: 503 },
    );
  }

  return fetch(`${url}/api/auth/${path.replace(/^\//, "")}`, { ...init, cache: "no-store" });
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookie = (await cookies()).toString();
  const response = await neonAuthRequest("get-session", { headers: { cookie, "user-agent": (await headers()).get("user-agent") ?? "ERIC CRM" } });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.user ? data as AuthSession : null;
}
