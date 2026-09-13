import "server-only";

export const AUTH_COOKIE = "apnipharma_session";

const BACKEND_API_URL = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

export type BackendPayload = {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: Record<string, string[]>;
};

export function backendRequest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${BACKEND_API_URL}/${path.replace(/^\//, "")}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(10_000),
  });
}

export async function relayJson(response: Response): Promise<Response> {
  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

export function backendUnavailable(): Response {
  return Response.json(
    {
      success: false,
      message: "The authentication service is unavailable.",
    },
    { status: 503 },
  );
}
