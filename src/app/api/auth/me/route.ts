import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  backendRequest,
  backendUnavailable,
  relayJson,
} from "@/lib/backend";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (!token) {
    return Response.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const response = await backendRequest("v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return relayJson(response);
  } catch {
    return backendUnavailable();
  }
}
