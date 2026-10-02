import { currentIdentity } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import type { AccountStatus, UserRole } from "@/generated/prisma/client";
import { wouldRemoveLastActiveAdmin } from "@/lib/access-policy";

const roles = new Set(["ADMIN", "SALES_MANAGER", "SALES_AGENT"]);
const statuses = new Set(["PENDING_APPROVAL", "ACTIVE", "REJECTED", "SUSPENDED"]);

export async function PATCH(request: Request, context: RouteContext<"/api/admin/users/[id]">) {
  const identity = await currentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!identity.session.user.emailVerified || identity.profile.status !== "ACTIVE" || identity.profile.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
  const actor = identity.profile;
  const { id } = await context.params;
  const body = await request.json();
  const role = roles.has(body.role) ? body.role as UserRole : undefined;
  const status = statuses.has(body.status) ? body.status as AccountStatus : undefined;
  const target = await prisma.userProfile.findFirst({ where: { id, organizationId: actor.organizationId } });
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });
  if (target.id === actor.id && (status === "SUSPENDED" || status === "REJECTED" || (role && role !== "ADMIN"))) return Response.json({ error: "You cannot remove your own administrative access." }, { status: 409 });
  if (target.role === "ADMIN" && target.status === "ACTIVE" && ((role && role !== "ADMIN") || (status && status !== "ACTIVE"))) {
    const activeAdmins = await prisma.userProfile.count({ where: { organizationId: actor.organizationId, role: "ADMIN", status: "ACTIVE" } });
    if (wouldRemoveLastActiveAdmin(target, { role, status }, activeAdmins)) return Response.json({ error: "The last active administrator cannot be demoted or suspended." }, { status: 409 });
  }
  const teamId = body.teamId === "" ? null : body.teamId;
  if (teamId) {
    const team = await prisma.team.findFirst({ where: { id: teamId, organizationId: actor.organizationId } });
    if (!team) return Response.json({ error: "Invalid team." }, { status: 400 });
  }
  const finalRole = role ?? target.role;
  const finalStatus = status ?? target.status;
  const finalTeam = teamId === undefined ? target.teamId : teamId;
  if (finalStatus === "ACTIVE" && finalRole !== "ADMIN" && !finalTeam) return Response.json({ error: "A team is required before approving this user." }, { status: 400 });
  const changes = { ...(role ? { role } : {}), ...(status ? { status } : {}), ...(teamId !== undefined ? { teamId } : {}) };
  const updated = await prisma.$transaction(async tx => {
    const user = await tx.userProfile.update({ where: { id: target.id }, data: { ...changes, ...(status === "ACTIVE" && target.status !== "ACTIVE" ? { approvedAt: new Date(), approvedById: actor.id } : {}) }, include: { team: true } });
    await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, targetUserId: target.id, action: status === "ACTIVE" ? "USER_APPROVED_OR_REACTIVATED" : status === "REJECTED" ? "USER_REJECTED" : status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACCESS_UPDATED", changes: { before: { role: target.role, status: target.status, teamId: target.teamId }, after: changes } } });
    return user;
  });
  return Response.json({ user: updated });
}
