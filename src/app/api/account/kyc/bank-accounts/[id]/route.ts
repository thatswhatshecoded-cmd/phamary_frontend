import { relayAuthenticated } from "@/shared/api/auth-proxy";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return relayAuthenticated(`v1/account/kyc/bank-accounts/${id}`, { method: "DELETE" });
}
