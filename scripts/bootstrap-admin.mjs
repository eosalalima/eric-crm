import "dotenv/config";
import pg from "pg";

const identifier = process.argv[2]?.trim().toLowerCase();
if (!identifier) throw new Error("Usage: npm run bootstrap:admin -- <verified-user-email-or-auth-id>");
if (!process.env.DATABASE_URL_UNPOOLED) throw new Error("DATABASE_URL_UNPOOLED is required");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
await client.connect();
try {
  await client.query("BEGIN");
  const result = await client.query('SELECT id, email, status, role FROM "UserProfile" WHERE lower(email) = $1 OR "authUserId" = $1 FOR UPDATE', [identifier]);
  if (result.rowCount !== 1) throw new Error("Profile not found. The user must register and verify their email first.");
  const user = result.rows[0];
  await client.query('UPDATE "UserProfile" SET role = \'ADMIN\', status = \'ACTIVE\', "approvedAt" = now(), "approvedById" = id, "updatedAt" = now() WHERE id = $1', [user.id]);
  await client.query('INSERT INTO "AuditLog" (id, "organizationId", "actorId", "targetUserId", action, changes) SELECT encode(gen_random_bytes(12), \'hex\'), "organizationId", id, id, \'INITIAL_ADMIN_BOOTSTRAPPED\', $2::jsonb FROM "UserProfile" WHERE id = $1', [user.id, JSON.stringify({ before: { role: user.role, status: user.status }, after: { role: "ADMIN", status: "ACTIVE" } })]);
  await client.query("COMMIT");
  console.log(`Administrator access granted to ${user.email}.`);
} catch (error) { await client.query("ROLLBACK"); throw error; } finally { await client.end(); }
