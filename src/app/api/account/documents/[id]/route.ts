import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = request.headers.get("content-type")?.includes("multipart/form-data") ? await request.formData() : await request.text();
  return relayAuthenticated(`v1/account/documents/${id}`, { method: "PUT", body });
}
