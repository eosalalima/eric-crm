// lib/auth/server.ts
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
        sessionDataTtl: 300, // Optional: session data cache TTL in seconds (default: 300 = 5 min)
        domain: ".example.com", // Optional: for cross-subdomain cookies
    },
});
