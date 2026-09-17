import { cookies } from "next/headers";
import { relayAuthenticated } from "@/shared/api/auth-proxy";
import { AUTH_COOKIE } from "@/shared/api/backend";

export async function DELETE(request: Request) {
  const response = await relayAuthenticated("v1/account", {
    method: "DELETE",
    body: await request.text(),
  });

  if (response.ok) (await cookies()).delete(AUTH_COOKIE);
  return response;
}
