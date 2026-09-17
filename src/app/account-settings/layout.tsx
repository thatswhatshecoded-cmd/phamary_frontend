import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountSettingsNavigation } from "@/features/settings/components/account-settings-nav";
import { AUTH_COOKIE, backendRequest } from "@/shared/api/backend";
import { AppHeader } from "@/shared/layout/app-header";

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
