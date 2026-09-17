import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE, backendRequest, backendUnavailable, relayJson } from "@/shared/api/backend";

export async function relayAuthenticated(path: string, init: RequestInit = {}): Promise<Response> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return Response.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  try { return relayJson(await backendRequest(path, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } })); } catch { return backendUnavailable(); }
}
