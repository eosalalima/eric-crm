import { getAuthSession } from "@/lib/neon-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  if (!firstName || !lastName) return Response.json({ error: "First and last name are required." }, { status: 400 });
  const organizationId = process.env.CRM_ORGANIZATION_ID;
  if (!organizationId) return Response.json({ error: "CRM organization is not configured." }, { status: 503 });
  const profile = await prisma.userProfile.upsert({
    where: { authUserId: session.user.id },
    create: { authUserId: session.user.id, email: session.user.email.toLowerCase(), firstName, lastName, mobile: body.mobile || null, jobTitle: body.jobTitle || null, organizationId },
    update: {},
  });
  return Response.json({ id: profile.id, status: profile.status });
}
