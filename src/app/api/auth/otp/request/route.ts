import { backendRequest, backendUnavailable, relayJson } from "@/lib/backend";

export async function POST(request: Request) {
  try {
    const response = await backendRequest("v1/auth/otp/request", {
      method: "POST",
      body: await request.text(),
    });

    return relayJson(response);
  } catch {
    return backendUnavailable();
  }
}
