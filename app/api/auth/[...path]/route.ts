import { neonAuthRequest } from "@/lib/neon-auth";

async function proxy(request: Request, context: RouteContext<"/api/auth/[...path]">) {
  const { path } = await context.params;
  const incoming = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.delete("host");
  const response = await neonAuthRequest(`${path.join("/")}${incoming.search}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    redirect: "manual",
  });
  return new Response(response.body, { status: response.status, headers: response.headers });
}

export const GET = proxy;
export const POST = proxy;
