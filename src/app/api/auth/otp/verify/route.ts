import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  type BackendPayload,
  backendRequest,
  backendUnavailable,
} from "@/shared/api/backend";

export async function POST(request: Request) {
  try {
    const response = await backendRequest("v1/auth/otp/verify", {
      method: "POST",
      body: await request.text(),
    });
    const payload = (await response.json()) as BackendPayload;
    const token = payload.data?.token;

    if (response.ok && typeof token === "string") {
      const maxAge = typeof payload.data?.expires_in === "number"
        ? payload.data.expires_in
        : 60 * 60 * 24 * 30;

      (await cookies()).set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });

      payload.data = { ...payload.data };
      delete payload.data.token;
    }

    return Response.json(payload, { status: response.status });
  } catch {
    return backendUnavailable();
  }
}
