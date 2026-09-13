import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LogoutButton } from "@/components/logout-button";
import {
  AUTH_COOKIE,
  type BackendPayload,
  backendRequest,
} from "@/lib/backend";

type UserData = {
  id: number;
  name: string | null;
  mobile_number: string;
  email: string | null;
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

  return (
    <main className="min-h-dvh bg-[#f4f8fb]">
      <header className="flex items-center justify-between bg-[#062f58] px-6 py-5 sm:px-10">
        <BrandLogo />
        <LogoutButton />
      </header>
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0089ff]">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#062f58]">Welcome to ApniPharma</h1>
        <div className="mt-8 max-w-lg rounded-lg bg-white p-7 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Logged in mobile number</p>
          <p className="mt-2 text-xl font-semibold text-[#062f58]">+91 {user.mobile_number}</p>
          <p className="mt-5 text-sm text-emerald-700">Your OTP login was successful.</p>
        </div>
      </section>
    </main>
  );
}
