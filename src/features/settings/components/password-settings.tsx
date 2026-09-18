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

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.8 10.8 0 0112 4c5.2 0 9 5 9 5a16 16 0 01-3 3.4M6.6 6.6C4.5 8 3 10 3 10s3.8 5 9 5c.8 0 1.6-.1 2.3-.3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12s3.8-5 9-5 9 5 9 5-3.8 5-9 5-9-5-9-5z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function PasswordSettings() {
  const [status, setStatus] = useState<PasswordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let active = true;

    void fetchPasswordStatus()
      .then((loaded) => {
        if (active) setStatus(loaded);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Password settings could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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

      setStatus((current) => current ? {
        ...current,
        mobile_number: payload.data?.mobile_number ?? current.mobile_number,
      } : current);
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
    if (!status) return;

    if (status.is_set && !currentPassword) {
      setNotice({ text: "Enter your current password.", error: true });
      return;
    }

    if (!status.is_set && otp.length !== 6) {
      setNotice({ text: "Enter the complete 6-digit OTP.", error: true });
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setNotice({ text: "Password must be at least 8 characters and include letters and numbers.", error: true });
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status.is_set
          ? { current_password: currentPassword, password }
          : { otp, password }),
      });
      const payload = await readPayload(response);

      if (!response.ok || !payload.success) {
        throw new Error(payloadError(payload, "Password could not be updated."));
      }

      setStatus((current) => current ? { ...current, is_set: true } : current);
      setCurrentPassword("");
      setPassword("");
      setOtp("");
      setOtpSent(false);
      setSecondsLeft(0);
      setNotice({ text: payload.message ?? "Password updated successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Password could not be updated.", error: true });
    } finally {
      setSaving(false);
    }
  }

  const inputClassName = "h-10 w-full border-0 border-b border-slate-400 bg-transparent px-0 pr-9 text-sm text-slate-900 outline-none transition focus:border-[#0799ed] focus:ring-0";

  return (
    <section className="px-5 py-8 sm:px-9 lg:px-12">
      {loading && <p className="text-sm text-[#0758a6]">Loading password settings…</p>}

      {!loading && loadError && (
        <div role="alert" className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{loadError}</p>
          <button type="button" onClick={() => void reload()} className="mt-3 rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">Retry</button>
        </div>
      )}

      {!loading && !loadError && status && (
        <div className="max-w-[420px]">
          <h1 className="flex items-center gap-2 text-xl font-medium text-[#0799ed]">
            {status.is_set ? "Update Password" : "Set Password"}
            <span aria-hidden="true" className="text-base">💡</span>
          </h1>

          {status.is_set ? (
            <form className="mt-6 space-y-2" onSubmit={(event) => { event.preventDefault(); void updatePassword(); }}>
              <label className="block text-xs font-medium text-[#0758a6]">
                Current Password
                <span className="relative mt-1 block">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={currentPassword}
                    maxLength={72}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className={inputClassName}
                  />
                  <button type="button" aria-label={showCurrentPassword ? "Hide current password" : "Show current password"} onClick={() => setShowCurrentPassword((current) => !current)} className="absolute inset-y-0 right-0 flex items-center text-slate-900">
                    <EyeIcon hidden={!showCurrentPassword} />
                  </button>
                </span>
              </label>

              <label className="block pt-1 text-xs font-medium text-[#0758a6]">
                New Password
                <span className="relative mt-1 block">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    maxLength={72}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                  />
                  <button type="button" aria-label={showPassword ? "Hide new password" : "Show new password"} onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 flex items-center text-slate-900">
                    <EyeIcon hidden={!showPassword} />
                  </button>
                </span>
              </label>

              <button type="submit" disabled={saving} className="mt-2 min-w-24 rounded bg-[#0799ed] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#0788d4] disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Updating…" : "Update"}
              </button>
            </form>
          ) : (
            <div className="mt-6">
              <p className="text-sm text-slate-600">Verify your registered mobile number {status.mobile_number ? `(${status.mobile_number})` : ""} to set a password.</p>

              {!otpSent ? (
                <button type="button" disabled={requesting || !status.mobile_number} onClick={() => void requestOtp()} className="mt-5 rounded bg-[#0799ed] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#0788d4] disabled:cursor-not-allowed disabled:opacity-60">
                  {requesting ? "Sending OTP…" : "Send OTP"}
                </button>
              ) : (
                <form className="mt-5 space-y-3" onSubmit={(event) => { event.preventDefault(); void updatePassword(); }}>
                  <label className="block text-xs font-medium text-[#0758a6]">
                    Verification OTP
                    <input type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} className={inputClassName} />
                  </label>
                  <label className="block pt-1 text-xs font-medium text-[#0758a6]">
                    New Password
                    <span className="relative mt-1 block">
                      <input type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} maxLength={72} onChange={(event) => setPassword(event.target.value)} className={inputClassName} />
                      <button type="button" aria-label={showPassword ? "Hide new password" : "Show new password"} onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 flex items-center text-slate-900">
                        <EyeIcon hidden={!showPassword} />
                      </button>
                    </span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button type="submit" disabled={saving} className="rounded bg-[#0799ed] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#0788d4] disabled:opacity-60">{saving ? "Saving…" : "Set Password"}</button>
                    <button type="button" disabled={requesting || secondsLeft > 0} onClick={() => void requestOtp()} className="px-2 py-2 text-sm font-medium text-[#0758a6] disabled:text-slate-400">{secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend OTP"}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {notice && (
            <div role={notice.error ? "alert" : "status"} className={`mt-5 rounded border px-4 py-3 text-sm ${notice.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              {notice.text}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
