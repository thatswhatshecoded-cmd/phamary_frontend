import "server-only";

export const AUTH_COOKIE = "apnipharma_session";
const BACKEND_API_URL = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV === "production" ? "https://kirayacare.com/api" : "http://localhost:8000/api")).replace(/\/$/, "");
export type BackendPayload = { success: boolean; message: string; data?: Record<string, unknown>; errors?: Record<string, string[]>; };
export function backendRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  return fetch(`${BACKEND_API_URL}/${path.replace(/^\//, "")}`, { ...init, cache: "no-store", headers, signal: AbortSignal.timeout(10_000) });
}
export async function relayJson(response: Response): Promise<Response> { return new Response(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } }); }
export function backendUnavailable(): Response { return Response.json({ success: false, message: "The authentication service is unavailable." }, { status: 503 }); }
