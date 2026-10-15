/**
 * Extract the user-facing message returned by Better Auth-compatible APIs.
 * Providers use both top-level and nested error shapes across versions.
 *
 * @param {unknown} payload
 * @param {string} fallback
 */
export function authErrorMessage(payload, fallback) {
  if (!payload || typeof payload !== "object") return fallback;

  const body = /** @type {{ message?: unknown, error?: unknown, error_description?: unknown, errorDescription?: unknown }} */ (payload);
  const nestedError = body.error && typeof body.error === "object"
    ? /** @type {{ message?: unknown }} */ (body.error).message
    : undefined;
  const candidates = [body.message, nestedError, body.error_description, body.errorDescription, body.error];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  return fallback;
}
