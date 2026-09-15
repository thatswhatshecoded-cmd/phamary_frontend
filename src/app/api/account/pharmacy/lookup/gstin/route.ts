import { relayAuthenticated } from "@/lib/auth-proxy";

export async function POST(request: Request) {
  return relayAuthenticated("v1/account/pharmacy/lookup/gstin", {
    method: "POST",
    body: await request.text(),
  });
}
