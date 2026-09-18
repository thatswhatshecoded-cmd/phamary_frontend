"use client";

import { useCallback, useEffect, useState } from "react";

type PlanFeature = {
  key: string;
  name: string;
  enabled: boolean;
  limit: number | null;
};

type PlanVersion = {
  id: string;
  plan: { id: string; code: string; name: string };
  version: number;
  amount_minor: number;
  currency: string;
  billing_interval: string;
  billing_interval_count: number;
  trial_days: number;
  tax_inclusive: boolean;
  features: PlanFeature[];
  is_current: boolean;
};

type Subscription = {
  id: string;
  status: "pending" | "trialing" | "active" | "past_due" | "grace" | "restricted" | "cancelled" | "expired";
  plan: {
    code: string;
    name: string;
    amount_minor: number;
    currency: string;
    billing_interval: string;
  };
  trial_ends_at: string | null;
  current_period_end: string | null;
  expires_at: string | null;
  days_remaining: number;
  cancel_at_period_end: boolean;
};

type PlansData = {
  plans: PlanVersion[];
  subscription: Subscription | null;
  can_select_plan: boolean;
};

type ApiPayload = {
  success?: boolean;
  message?: string;
  data?: Partial<PlansData>;
};

function messageFrom(payload: ApiPayload, fallback: string): string {
  return payload.message ?? fallback;
}

async function fetchPlans(): Promise<PlansData> {
  const response = await fetch("/api/account/pharmacy/plan", { cache: "no-store" });
  const payload = await response.json() as ApiPayload;
  if (!response.ok || !payload.success || !Array.isArray(payload.data?.plans)) {
    throw new Error(messageFrom(payload, "Plans could not be loaded."));
  }

  return {
    plans: payload.data.plans,
    subscription: payload.data.subscription ?? null,
    can_select_plan: payload.data.can_select_plan === true,
  };
}

function price(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
    }).format(amountMinor / 100);
  } catch {
    return `${currency} ${(amountMinor / 100).toFixed(2)}`;
  }
}

function date(value: string | null): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function statusDetails(status: Subscription["status"]): { label: string; classes: string } {
  const details: Record<Subscription["status"], { label: string; classes: string }> = {
    pending: { label: "Payment pending", classes: "bg-amber-100 text-amber-800" },
    trialing: { label: "Trial active", classes: "bg-sky-100 text-sky-800" },
    active: { label: "Active plan", classes: "bg-emerald-100 text-emerald-800" },
    past_due: { label: "Payment overdue", classes: "bg-orange-100 text-orange-800" },
    grace: { label: "Grace period", classes: "bg-amber-100 text-amber-800" },
    restricted: { label: "Restricted", classes: "bg-red-100 text-red-800" },
    cancelled: { label: "Cancelled", classes: "bg-slate-200 text-slate-700" },
    expired: { label: "Expired", classes: "bg-red-100 text-red-800" },
  };
  return details[status];
}

function intervalLabel(plan: PlanVersion): string {
  if (plan.billing_interval === "trial") return plan.trial_days > 0 ? `${plan.trial_days} days` : "Trial";
  const interval = plan.billing_interval.replace(/ly$/, "");
  return plan.billing_interval_count > 1 ? `every ${plan.billing_interval_count} ${interval}s` : `per ${interval}`;
}

export function PlanSettings() {
  const [data, setData] = useState<PlansData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPlans());
    } catch (loadError) {
      setData(null);
      setError(loadError instanceof Error ? loadError.message : "Plans could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchPlans()
      .then((plans) => { if (active) setData(plans); })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Plans could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const subscription = data?.subscription ?? null;
  const status = subscription ? statusDetails(subscription.status) : null;

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-8 sm:px-9 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0b8fea]">Account &amp; Settings</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#063665]">Plan</h1>

      {loading && <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-sm text-[#0758a6]">Loading plans…</div>}
      {!loading && error && <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => void reload()} className="mt-4 rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">Retry</button></div>}

      {!loading && !error && data && <>
        <div className="mt-8 rounded-2xl border border-[#b9dff5] bg-gradient-to-br from-[#eff9ff] to-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#0788cf]">Current subscription</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#063665]">{subscription?.plan.name ?? "No plan assigned"}</h2>
              {subscription ? <p className="mt-2 text-sm text-slate-600">{price(subscription.plan.amount_minor, subscription.plan.currency)} · {subscription.plan.billing_interval}</p> : <p className="mt-2 text-sm text-slate-600">No subscription is currently attached to this pharmacy.</p>}
            </div>
            {status && <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.classes}`}>{status.label}</span>}
          </div>

          {subscription && <div className="mt-6 grid gap-4 border-t border-sky-100 pt-5 text-sm sm:grid-cols-3">
            <div><p className="text-slate-500">Valid until</p><p className="mt-1 font-semibold text-[#063665]">{date(subscription.expires_at)}</p></div>
            <div><p className="text-slate-500">Days remaining</p><p className="mt-1 font-semibold text-[#063665]">{subscription.expires_at ? subscription.days_remaining : "—"}</p></div>
            <div><p className="text-slate-500">Renewal</p><p className="mt-1 font-semibold text-[#063665]">{subscription.cancel_at_period_end ? "Cancels at period end" : "Managed by ApniPharma"}</p></div>
          </div>}
        </div>

        <div className="mt-9 flex items-end justify-between gap-4">
          <div><h2 className="text-xl font-semibold text-[#063665]">Available plans</h2><p className="mt-1 text-sm text-slate-500">Plans and pricing are loaded from the backend catalog.</p></div>
        </div>

        {data.plans.length === 0 ? <p className="mt-5 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No published plans are currently available.</p> : <div className="mt-5 grid gap-5 md:grid-cols-2">
          {data.plans.map((plan) => <article key={plan.id} className={`relative rounded-2xl border bg-white p-6 shadow-sm ${plan.is_current ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"}`}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#0788cf]">{plan.billing_interval === "trial" ? "Free trial" : "Subscription"}</p><h3 className="mt-2 text-xl font-semibold text-[#063665]">{plan.plan.name}</h3></div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${plan.is_current ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{plan.is_current ? status?.label ?? "Current plan" : "Available"}</span>
            </div>
            <p className="mt-5 text-3xl font-bold text-[#062f58]">{plan.amount_minor === 0 ? "Free" : price(plan.amount_minor, plan.currency)} <span className="text-sm font-normal text-slate-500">{intervalLabel(plan)}</span></p>
            {plan.tax_inclusive && <p className="mt-1 text-xs text-slate-500">Taxes included</p>}
            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-700">
              {plan.features.filter((feature) => feature.enabled).map((feature) => <li key={feature.key} className="flex gap-2"><span aria-hidden="true" className="font-bold text-emerald-600">✓</span><span>{feature.name}{feature.limit !== null ? ` — up to ${feature.limit}` : ""}</span></li>)}
            </ul>
          </article>)}
        </div>}

        {data.can_select_plan && <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">No plan is selected yet. Complete plan selection from the pharmacy onboarding flow.</p>}
      </>}
    </section>
  );
}
