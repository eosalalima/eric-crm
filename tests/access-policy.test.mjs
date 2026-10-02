import assert from "node:assert/strict";
import test from "node:test";
import { canAccessRecord, wouldRemoveLastActiveAdmin } from "../lib/access-policy.js";

test("administrators can access every record", () => assert.equal(canAccessRecord({ id: "a", role: "ADMIN", teamId: null }, { teamId: "other" }), true));
test("managers are restricted to their assigned team", () => {
  const manager = { id: "m", role: "SALES_MANAGER", teamId: "north" };
  assert.equal(canAccessRecord(manager, { teamId: "north" }), true);
  assert.equal(canAccessRecord(manager, { teamId: "south" }), false);
});
test("agents are restricted to assigned records", () => {
  const agent = { id: "agent", role: "SALES_AGENT", teamId: "north" };
  assert.equal(canAccessRecord(agent, { assigneeId: "agent" }), true);
  assert.equal(canAccessRecord(agent, { assigneeId: "someone-else", teamId: "north" }), false);
});
test("last active administrator cannot be suspended or demoted", () => {
  const admin = { role: "ADMIN", status: "ACTIVE" };
  assert.equal(wouldRemoveLastActiveAdmin(admin, { status: "SUSPENDED" }, 1), true);
  assert.equal(wouldRemoveLastActiveAdmin(admin, { role: "SALES_MANAGER" }, 1), true);
  assert.equal(wouldRemoveLastActiveAdmin(admin, { status: "SUSPENDED" }, 2), false);
});
