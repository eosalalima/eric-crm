import { neonAuthRequest } from "@/lib/neon-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const input = await request.json();
  const firstName = String(input.firstName ?? "").trim();
  const lastName = String(input.lastName ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const password = String(input.password ?? "");
  if (!firstName || !lastName || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return Response.json({ error: "Please complete all required fields." }, { status: 400 });
  const organizationId = process.env.CRM_ORGANIZATION_ID;
  if (!organizationId) return Response.json({ error: "CRM organization is not configured." }, { status: 503 });
  const authResponse = await neonAuthRequest("sign-up/email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, name: `${firstName} ${lastName}`, callbackURL: `${new URL(request.url).origin}/verify-email` }) });
  const authData = await authResponse.json().catch(() => ({}));
  if (!authResponse.ok || !authData.user?.id) return Response.json({ error: authData.message || "Unable to create this account." }, { status: authResponse.status });
  await prisma.userProfile.upsert({ where: { authUserId: authData.user.id }, create: { authUserId: authData.user.id, email, firstName, lastName, mobile: String(input.mobile ?? "").trim() || null, jobTitle: String(input.jobTitle ?? "").trim() || null, organizationId }, update: {} });
  const response = Response.json({ created: true });
  const setCookie = authResponse.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
