import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function POST(request: Request) {
  return relayAuthenticated("v1/account/pharmacy/lookup/pan", {
    method: "POST",
    body: await request.text(),
  });
}
