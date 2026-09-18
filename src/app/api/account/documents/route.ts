import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function GET() { return relayAuthenticated("v1/account/documents"); }
