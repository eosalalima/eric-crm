import { currentIdentity } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const identity = await currentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  if (!firstName || !lastName) return Response.json({ error: "First and last name are required." }, { status: 400 });
  const profile = await prisma.userProfile.update({ where: { id: identity.profile.id }, data: { firstName, lastName, mobile: String(body.mobile ?? "").trim() || null, jobTitle: String(body.jobTitle ?? "").trim() || null } });
  return Response.json({ profile });
}
