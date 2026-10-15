import assert from "node:assert/strict";
import test from "node:test";
import { authErrorMessage } from "../lib/auth-error.js";

const fallback = "Unable to create this account.";

test("returns top-level provider messages", () => {
  assert.equal(authErrorMessage({ message: "Origin is not allowed" }, fallback), "Origin is not allowed");
});

test("returns nested provider error messages", () => {
  assert.equal(authErrorMessage({ error: { message: "Password is too short" } }, fallback), "Password is too short");
});

test("supports string and OAuth-style provider errors", () => {
  assert.equal(authErrorMessage({ error: "Registration is disabled" }, fallback), "Registration is disabled");
  assert.equal(authErrorMessage({ error_description: "Invalid callback URL" }, fallback), "Invalid callback URL");
});

test("falls back when the provider does not include a message", () => {
  assert.equal(authErrorMessage({ error: { code: "UNKNOWN" } }, fallback), fallback);
  assert.equal(authErrorMessage(null, fallback), fallback);
});
