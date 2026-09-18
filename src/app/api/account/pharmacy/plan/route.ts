import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function GET() {
  return relayAuthenticated("v1/account/pharmacy/plan");
}

export async function POST(request: Request) {
  return relayAuthenticated("v1/account/pharmacy/plan", {
    method: "POST",
    body: await request.text(),
  });
}
