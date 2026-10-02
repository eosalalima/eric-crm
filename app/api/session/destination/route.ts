import { accessDestination, currentIdentity } from "@/lib/authorization";
import { getAuthSession } from "@/lib/neon-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAuthSession();
  if (!session) return Response.json({ destination: "/login" });
  let identity = await currentIdentity();
  // Repairs a profile if Auth succeeded but registration was interrupted before CRM provisioning.
  if (!identity && process.env.CRM_ORGANIZATION_ID) {
    const names = (session.user.name || "User").trim().split(/\s+/);
    await prisma.userProfile.upsert({ where: { authUserId: session.user.id }, create: { authUserId: session.user.id, email: session.user.email.toLowerCase(), firstName: names[0], lastName: names.slice(1).join(" ") || "Member", organizationId: process.env.CRM_ORGANIZATION_ID }, update: {} });
    identity = await currentIdentity();
  }
  return Response.json({ destination: accessDestination(session.user.emailVerified, identity?.profile.status) });
}
