import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppHeader } from "@/shared/layout/app-header";
import { SubscriptionBanner } from "@/features/billing/components/subscription-banner";
import {
  AUTH_COOKIE,
  type BackendPayload,
  backendRequest,
} from "@/shared/api/backend";

type UserData = {
  id: number;
  name: string | null;
  mobile_number: string;
  email: string | null;
};

type SubscriptionData = {
  notification_type: "trial_expiring" | "plan_expiring" | "trial_expired" | "plan_expired" | null;
  expires_at: string | null;
  days_remaining: number;
};

export default async function DashboardPage() {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  if (!token) redirect("/");

  const response = await backendRequest("v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);

  if (!response?.ok) redirect("/");

  const payload = (await response.json()) as BackendPayload;
  const user = payload.data?.user as UserData | undefined;

  if (!user) redirect("/");

  const contextResponse = await backendRequest("v1/account/context", {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (!contextResponse?.ok) redirect("/");
  const context = (await contextResponse.json()) as BackendPayload;
  if (!context.data?.current) redirect("/onboarding");
  const current = context.data.current as { subscription?: SubscriptionData | null };
  const subscription = current.subscription ?? null;

  return (
    <main className="min-h-dvh bg-[#f4f8fb]">
      <AppHeader />
      <SubscriptionBanner
        type={subscription?.notification_type ?? null}
        expiresAt={subscription?.expires_at ?? null}
        daysRemaining={subscription?.days_remaining ?? 0}
      />
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0089ff]">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#062f58]">Welcome to ApniPharma</h1>
        <div className="mt-8 max-w-lg rounded-lg bg-white p-7 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Logged in mobile number</p>
          <p className="mt-2 text-xl font-semibold text-[#062f58]">+91 {user.mobile_number}</p>
          <p className="mt-5 text-sm text-emerald-700">Your OTP login was successful.</p>
          <p className="mt-2 text-sm text-slate-600">Your pharmacy and plan access are managed securely by the backend.</p>
        </div>
      </section>
    </main>
  );
}
