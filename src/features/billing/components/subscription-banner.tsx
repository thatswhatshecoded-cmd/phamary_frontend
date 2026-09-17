"use client";

import { useEffect, useState } from "react";

type BannerType = "trial_expiring" | "plan_expiring" | "trial_expired" | "plan_expired";

type SubscriptionBannerProps = {
  type: BannerType | null;
  expiresAt: string | null;
  daysRemaining: number;
};

function getDaysRemaining(expiresAt: string | null, fallback: number) {
  if (!expiresAt) return fallback;
  const millisecondsRemaining = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(millisecondsRemaining / 86_400_000));
}

export function SubscriptionBanner({ type, expiresAt, daysRemaining }: SubscriptionBannerProps) {
  const [days, setDays] = useState(() => getDaysRemaining(expiresAt, daysRemaining));

  useEffect(() => {
    const update = () => setDays(getDaysRemaining(expiresAt, daysRemaining));
    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, [expiresAt, daysRemaining]);

  if (!type) return null;

  const expired = type.endsWith("expired") || days === 0;
  const trial = type.startsWith("trial");
  const label = trial ? "free trial" : "plan";
  const message = expired
    ? `Your ${label} has expired. Please renew to continue using all features.`
    : trial
      ? `Your free trial has ${days} ${days === 1 ? "day" : "days"} left.`
      : `Your plan expires in ${days} ${days === 1 ? "day" : "days"}.`;

  return (
    <div
      role="status"
      className={`border-b px-6 py-3 text-center text-sm font-semibold ${
        expired
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      {message}
    </div>
  );
}
