"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "details" | "plan";
type ApiPayload = {
  success: boolean;
  message: string;
  data?: { next_step?: "dashboard" | "payment" };
  errors?: Record<string, string[]>;
};

function errorFrom(payload: ApiPayload): string {
  return payload.errors ? Object.values(payload.errors).flat()[0] ?? payload.message : payload.message;
}

export function PharmacyOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    pharmacy_name: "",
    pharmacist_name: "",
    mobile_number: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
  });

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveDetails() {
    if (!form.pharmacy_name.trim()) {
      setError("Enter your pharmacy name.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/account/pharmacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, version: 0 }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.success) {
        setError(errorFrom(payload));
        return;
      }
      setStep("plan");
    } catch {
      setError("Unable to save pharmacy details. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function selectPlan(plan: "trial" | "paid") {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/account/pharmacy/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const payload = (await response.json()) as ApiPayload;
      if (!response.ok || !payload.success) {
        setError(errorFrom(payload));
        return;
      }
      router.replace(payload.data?.next_step === "payment" ? "/onboarding/payment" : "/dashboard");
      router.refresh();
    } catch {
      setError("Unable to select the plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0089ff]">Step {step === "details" ? "1" : "2"} of 2</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#062f58]">
        {step === "details" ? "Set up your pharmacy" : "Choose your access plan"}
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {step === "details" ? "Your mobile OTP is your login. Add your pharmacy details first." : "The free trial and paid plan are separate."}
      </p>

      {step === "details" ? <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Pharmacy name *" value={form.pharmacy_name} onChange={(value) => setField("pharmacy_name", value)} />
        <Field label="Pharmacist name" value={form.pharmacist_name} onChange={(value) => setField("pharmacist_name", value)} />
        <Field label="Pharmacy mobile" value={form.mobile_number} inputMode="numeric" onChange={(value) => setField("mobile_number", value.replace(/\D/g, "").slice(0, 10))} />
        <Field label="Email" value={form.email} type="email" onChange={(value) => setField("email", value)} />
        <Field label="City" value={form.city} onChange={(value) => setField("city", value)} />
        <Field label="State" value={form.state} onChange={(value) => setField("state", value)} />
        <Field label="Pincode" value={form.pincode} inputMode="numeric" onChange={(value) => setField("pincode", value.replace(/\D/g, "").slice(0, 6))} />
        <div className="flex items-end"><button className="h-11 w-full rounded-lg bg-[#0758a6] px-5 font-medium text-white disabled:opacity-60" disabled={loading} onClick={() => void saveDetails()}>{loading ? "Saving…" : "Continue to plans"}</button></div>
      </div> : <div className="mt-7 grid gap-5 md:grid-cols-2">
        <button className="rounded-xl border-2 border-sky-200 p-6 text-left transition hover:border-[#0089ff]" disabled={loading} onClick={() => void selectPlan("trial")}><p className="text-sm font-semibold text-[#0758a6]">FREE TRIAL</p><p className="mt-2 text-3xl font-bold text-[#062f58]">₹0</p><p className="mt-1 text-sm text-slate-600">7 days, one time per verified business. Limited to 2 staff members.</p><span className="mt-5 inline-block font-semibold text-[#0758a6]">Start free trial →</span></button>
        <button className="rounded-xl border-2 border-slate-200 p-6 text-left transition hover:border-[#0089ff]" disabled={loading} onClick={() => void selectPlan("paid")}><p className="text-sm font-semibold text-[#0758a6]">APNIPHARMA PRO</p><p className="mt-2 text-3xl font-bold text-[#062f58]">₹999<span className="text-base font-normal">/month</span></p><p className="mt-1 text-sm text-slate-600">No bundled trial. Your access activates after verified payment.</p><span className="mt-5 inline-block font-semibold text-[#0758a6]">Select paid plan →</span></button>
      </div>}
      {error ? <p className="mt-5 text-sm text-red-600" role="alert">{error}</p> : null}
      {step === "plan" ? <button className="mt-5 text-sm font-medium text-[#0758a6] hover:underline" onClick={() => setStep("details")}>← Edit pharmacy details</button> : null}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "numeric" }) {
  return <label className="block text-sm font-medium text-[#062f58]"><span>{label}</span><input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-[#0758a6]" type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
