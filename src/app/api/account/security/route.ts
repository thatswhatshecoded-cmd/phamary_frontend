import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function GET() { return relayAuthenticated("v1/account/security"); }
export async function PUT(request: Request) { return relayAuthenticated("v1/account/security", { method: "PUT", body: await request.text() }); }
