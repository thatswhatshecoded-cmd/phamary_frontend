import { relayAuthenticated } from "@/lib/auth-proxy";

export async function GET() {
  return relayAuthenticated("v1/account/pharmacy");
}

export async function PUT(request: Request) {
  return relayAuthenticated("v1/account/pharmacy", {
    method: "PUT",
    body: await request.text(),
  });
}
