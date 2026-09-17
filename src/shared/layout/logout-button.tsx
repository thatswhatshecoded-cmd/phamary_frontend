"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() { setLoading(true); try { await fetch("/api/auth/logout", { method: "POST" }); } finally { router.replace("/"); router.refresh(); } }
  return <button type="button" onClick={() => void logout()} disabled={loading} className="rounded border border-white/30 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10 disabled:opacity-60">{loading ? "Signing out..." : "Logout"}</button>;
}
