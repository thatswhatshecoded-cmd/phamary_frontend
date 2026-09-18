"use client";

import { useEffect, useState } from "react";

type PasswordStatus = {
  is_set: boolean;
  mobile_number: string | null;
};

type ApiPayload = {
  success?: boolean;
  message?: string;
  data?: {
    password?: PasswordStatus;
    mobile_number?: string;
    resend_after?: number;
  };
  errors?: Record<string, string[]>;
};

type Notice = { text: string; error: boolean };

function payloadError(payload: ApiPayload, fallback: string): string {
  const validationError = payload.errors ? Object.values(payload.errors).flat()[0] : undefined;
  return validationError ?? payload.message ?? fallback;
}

async function readPayload(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return { message: "The server returned an invalid response." };
  }
}

async function fetchPasswordStatus(): Promise<PasswordStatus> {
  const response = await fetch("/api/account/password", { cache: "no-store" });
  const payload = await readPayload(response);
  if (!response.ok || !payload.success || !payload.data?.password) {
    throw new Error(payloadError(payload, "Password settings could not be loaded."));
  }
  return payload.data.password;
}

export function PasswordSettings() {
  const [status, setStatus] = useState<PasswordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let active = true;
    void fetchPasswordStatus()
      .then((loaded) => { if (active) setStatus(loaded); })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : "Password settings could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  async function reload() {
    setLoading(true);
    setLoadError(null);
    try {
      setStatus(await fetchPasswordStatus());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Password settings could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function requestOtp() {
    setRequesting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/password/otp", { method: "POST" });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success) {
        throw new Error(payloadError(payload, "Verification OTP could not be sent."));
      }

      setStatus((current) => current ? { ...current, mobile_number: payload.data?.mobile_number ?? current.mobile_number } : current);
      setOtp("");
      setOtpSent(true);
      setSecondsLeft(payload.data?.resend_after ?? 30);
      setNotice({ text: payload.message ?? "Verification OTP sent successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Verification OTP could not be sent.", error: true });
    } finally {
      setRequesting(false);
    }
  }

  async function updatePassword() {
    if (otp.length !== 6) {
      setNotice({ text: "Enter the complete 6-digit OTP.", error: true });
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setNotice({ text: "Password must be at least 8 characters and include letters and numbers.", error: true });
      return;
    }
    if (password !== confirmation) {
      setNotice({ text: "Password confirmation does not match.", error: true });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, password, password_confirmation: confirmation }),
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success) {
        throw new Error(payloadError(payload, "Password could not be updated."));
      }

      setStatus((current) => current ? { ...current, is_set: true } : current);
      setOtp("");
      setPassword("");
      setConfirmation("");
      setOtpSent(false);
      setSecondsLeft(0);
      setNotice({ text: payload.message ?? "Password updated successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Password could not be updated.", error: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-[900px] px-5 py-8 sm:px-9 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0b8fea]">Account &amp; Settings</p>
      <h1 className="mt-3 text-3xl font-semibold text-[#063665]">Password</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">For your security, password changes require an OTP sent to your registered mobile number.</p>

      {loading && <div className="mt-8 rounded-xl border border-slate-200 bg-white p-7 text-sm text-[#0758a6]">Loading password settings…</div>}
      {!loading && loadError && <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{loadError}</p><button type="button" onClick={() => void reload()} className="mt-4 rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">Retry</button></div>}

      {!loading && !loadError && status && <div className="mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div><p className="text-sm text-slate-500">Password status</p><p className="mt-1 text-lg font-semibold text-[#063665]">{status.is_set ? "Password is set" : "No password set"}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.is_set ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{status.is_set ? "Secured" : "Setup required"}</span>
        </div>

        <div className="mt-5">
          <p className="text-sm text-slate-500">Registered mobile number</p>
          <p className="mt-1 font-semibold text-[#063665]">{status.mobile_number ?? "Not available"}</p>
        </div>

        {!otpSent ? <button type="button" disabled={requesting || !status.mobile_number} onClick={() => void requestOtp()} className="mt-6 h-11 rounded-lg bg-[#0758a6] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#064a8a] disabled:cursor-not-allowed disabled:opacity-60">{requesting ? "Sending OTP…" : status.is_set ? "Send OTP to change password" : "Send OTP to set password"}</button> : <form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); void updatePassword(); }}>
          <label className="block text-sm font-medium text-[#0758a6]">Verification OTP<input type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit OTP" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-[#0799ed] focus:ring-2 focus:ring-sky-100" /></label>
          <label className="block text-sm font-medium text-[#0758a6]">New Password<div className="relative mt-2"><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} maxLength={72} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 px-3 pr-16 text-slate-900 outline-none focus:border-[#0799ed] focus:ring-2 focus:ring-sky-100" /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-3 text-xs font-semibold text-[#0758a6]">{showPassword ? "Hide" : "Show"}</button></div></label>
          <label className="block text-sm font-medium text-[#0758a6]">Confirm Password<input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmation} maxLength={72} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none focus:border-[#0799ed] focus:ring-2 focus:ring-sky-100" /></label>
          <p className="text-xs leading-5 text-slate-500">Use at least 8 characters with both letters and numbers.</p>
          <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={saving} className="h-11 rounded-lg bg-[#0758a6] px-5 text-sm font-semibold text-white hover:bg-[#064a8a] disabled:opacity-60">{saving ? "Updating…" : "Verify OTP & update password"}</button><button type="button" disabled={requesting || secondsLeft > 0} onClick={() => void requestOtp()} className="h-11 px-3 text-sm font-semibold text-[#0758a6] hover:underline disabled:cursor-not-allowed disabled:text-slate-400">{secondsLeft > 0 ? `Resend in ${secondsLeft}s` : requesting ? "Sending…" : "Resend OTP"}</button><button type="button" disabled={saving} onClick={() => { setOtpSent(false); setOtp(""); setPassword(""); setConfirmation(""); setNotice(null); }} className="h-11 px-3 text-sm text-slate-600 hover:underline">Cancel</button></div>
        </form>}

        {notice && <div role={notice.error ? "alert" : "status"} className={`mt-5 rounded-lg border px-4 py-3 text-sm ${notice.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{notice.text}</div>}
      </div>}
    </section>
  );
}
