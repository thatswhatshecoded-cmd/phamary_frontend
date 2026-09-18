import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function POST() {
  return relayAuthenticated("v1/account/password/otp", { method: "POST" });
}
