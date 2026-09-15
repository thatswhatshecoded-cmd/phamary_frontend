import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettingsNavigation } from "@/components/account-settings-nav";
import { AppHeader } from "@/components/app-header";
import { AUTH_COOKIE, backendRequest } from "@/lib/backend";

export default async function AccountSettingsLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) redirect("/");

  const authentication = await backendRequest("v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (!authentication?.ok) redirect("/");

  return (
    <div className="min-h-dvh bg-white">
      <AppHeader />
      <div className="md:flex">
        <AccountSettingsNavigation />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
