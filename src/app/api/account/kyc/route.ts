import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function GET() {
  return relayAuthenticated("v1/account/kyc");
}

export async function PUT(request: Request) {
  return relayAuthenticated("v1/account/kyc", {
    method: "PUT",
    body: await request.text(),
  });
}
