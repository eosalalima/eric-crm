import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
