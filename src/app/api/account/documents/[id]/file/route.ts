import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return relayAuthenticated(`v1/account/documents/${id}`, { method: "POST", body: await request.formData() });
}
