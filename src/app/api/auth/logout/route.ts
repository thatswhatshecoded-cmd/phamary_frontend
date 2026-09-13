import { cookies } from "next/headers";
import { AUTH_COOKIE, backendRequest } from "@/lib/backend";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (token) {
    try {
      await backendRequest("v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // The local session is still cleared if the backend is unavailable.
    }
  }

  cookieStore.delete(AUTH_COOKIE);

  return Response.json({ success: true, message: "Logout successful." });
}
