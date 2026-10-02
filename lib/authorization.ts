import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/neon-auth";
import type { AccountStatus, UserRole } from "@/generated/prisma/client";
export { canAccessRecord } from "@/lib/access-policy";

export async function currentIdentity() {
  const session = await getAuthSession();
  if (!session) return null;
  const profile = await prisma.userProfile.findUnique({ where: { authUserId: session.user.id }, include: { team: true } });
  return profile ? { session, profile } : null;
}

export function accessDestination(verified: boolean, status?: AccountStatus) {
  if (!verified) return "/verify-email";
  if (!status || status === "PENDING_APPROVAL") return "/pending";
  if (status === "REJECTED" || status === "SUSPENDED") return "/access-unavailable";
  return "/";
}

export async function requireActiveUser(roles?: UserRole[]) {
  const identity = await currentIdentity();
  if (!identity) redirect("/login");
  const destination = accessDestination(identity.session.user.emailVerified, identity.profile.status);
  if (destination !== "/") redirect(destination);
  if (roles && !roles.includes(identity.profile.role)) redirect("/unauthorized");
  return identity;
}
