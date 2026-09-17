import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PharmacyOnboarding } from "@/features/onboarding/components/pharmacy-onboarding";
import { AUTH_COOKIE, backendRequest, type BackendPayload } from "@/shared/api/backend";

export default async function OnboardingPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) redirect("/");
  const response = await backendRequest("v1/account/context", { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
  if (!response?.ok) redirect("/");
  const payload = (await response.json()) as BackendPayload;
  if (payload.data?.current) redirect("/dashboard");

  return <main className="min-h-dvh bg-[#f4f8fb] px-5 py-12 sm:px-8"><PharmacyOnboarding /></main>;
}
