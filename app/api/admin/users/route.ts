import { currentIdentity } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const identity = await currentIdentity();
  if (!identity) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!identity.session.user.emailVerified || identity.profile.status !== "ACTIVE" || identity.profile.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
  const { profile } = identity;
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const take = 10;
  const search = url.searchParams.get("search")?.trim();
  const role = url.searchParams.get("role") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const teamId = url.searchParams.get("team") || undefined;
  const where = { organizationId: profile.organizationId, ...(search ? { OR: [{ firstName: { contains: search, mode: "insensitive" as const } }, { lastName: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] } : {}), ...(role ? { role: role as "ADMIN" | "SALES_MANAGER" | "SALES_AGENT" } : {}), ...(status ? { status: status as "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "SUSPENDED" } : {}), ...(teamId ? { teamId } : {}) };
  const [users, total, teams] = await prisma.$transaction([
    prisma.userProfile.findMany({ where, include: { team: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    prisma.userProfile.count({ where }),
    prisma.team.findMany({ where: { organizationId: profile.organizationId }, orderBy: { name: "asc" } }),
  ]);
  return Response.json({ users, teams, page, pages: Math.max(1, Math.ceil(total / take)), total });
}
