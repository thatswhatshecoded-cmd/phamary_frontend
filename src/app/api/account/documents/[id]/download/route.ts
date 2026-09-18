import { cookies } from "next/headers";
import { AUTH_COOKIE, backendRequest } from "@/shared/api/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return Response.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  try {
    const response = await backendRequest(`v1/account/documents/${id}/download`, { headers: { Authorization: `Bearer ${token}` } });
    return new Response(await response.arrayBuffer(), { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream", "Content-Disposition": response.headers.get("Content-Disposition") ?? "attachment" } });
  } catch {
    return Response.json({ success: false, message: "The document service is unavailable." }, { status: 503 });
  }
}
