"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Step = "mobile" | "otp";

type ApiPayload = {
  success: boolean;
  message: string;
  data?: {
    mobile_number?: string;
    resend_after?: number;
  };
  errors?: Record<string, string[]>;
};

function payloadError(payload: ApiPayload): string {
  const firstError = payload.errors ? Object.values(payload.errors).flat()[0] : null;
  return firstError ?? payload.message ?? "Something went wrong. Please try again.";
}

export function OtpLoginForm() {
  const router = useRouter();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [step, setStep] = useState<Step>("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [maskedMobile, setMaskedMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  async function requestOtp() {
    if (!/^[6-9][0-9]{9}$/.test(mobileNumber)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile_number: mobileNumber }),
      });
      const payload = (await response.json()) as ApiPayload;

      if (!response.ok || !payload.success) {
        setError(payloadError(payload));
        return;
      }

      setMaskedMobile(payload.data?.mobile_number ?? `******${mobileNumber.slice(-4)}`);
      setSecondsLeft(payload.data?.resend_after ?? 30);
      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
      setNotice("OTP generated successfully.");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          otp: code,
          device_name: "apnipharma-web",
        }),
      });
      const payload = (await response.json()) as ApiPayload;

      if (!response.ok || !payload.success) {
        setError(payloadError(payload));
        return;
      }

      const contextResponse = await fetch("/api/account/context");
      const context = (await contextResponse.json()) as { success?: boolean; data?: { current?: unknown } };
      router.replace(context.success && context.data?.current ? "/dashboard" : "/onboarding");
      router.refresh();
    } catch {
      setError("Unable to verify the OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateOtp(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, key: string) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6).split("");
    if (digits.length === 0) return;

    setOtp(Array.from({ length: 6 }, (_, index) => digits[index] ?? ""));
    otpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
  }

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <h1 className="mb-8 text-[25px] font-normal text-[#004da4]">
        {step === "mobile" ? "Login" : "Verify OTP"}
      </h1>

      {step === "mobile" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void requestOtp();
          }}
        >
          <label htmlFor="mobile-number" className="block text-[14px] text-[#004da4]">
            Mobile Number
          </label>
          <div className="mt-4 flex border-b border-[#d8dde2] pb-2 focus-within:border-[#0758a6]">
            <span className="mr-2 text-[15px] text-slate-500">+91</span>
            <input
              id="mobile-number"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, "").slice(0, 10))}
              className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none"
              aria-describedby={error ? "login-error" : undefined}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-[30px] flex h-[50px] w-full items-center justify-center bg-[#0758a6] text-[18px] text-white shadow-[0_3px_7px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#064a8a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void verifyOtp();
          }}
        >
          <p className="mb-6 text-[14px] leading-6 text-slate-600">
            OTP sent to <strong className="font-semibold text-[#004da4]">{maskedMobile}</strong>
          </p>

          <div className="flex justify-between gap-2" onPaste={(event) => {
            event.preventDefault();
            handleOtpPaste(event.clipboardData.getData("text"));
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  otpRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                value={digit}
                onChange={(event) => updateOtp(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event.key)}
                aria-label={`OTP digit ${index + 1}`}
                className="h-11 min-w-0 flex-1 border-b-2 border-[#cad3dc] bg-transparent text-center text-xl font-semibold text-slate-900 outline-none focus:border-[#0758a6]"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-[30px] flex h-[50px] w-full items-center justify-center bg-[#0758a6] text-[18px] text-white shadow-[0_3px_7px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#064a8a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <div className="mt-5 flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={() => {
                setStep("mobile");
                setError("");
                setNotice("");
              }}
              className="text-[#004da4] hover:underline"
            >
              Change number
            </button>
            <button
              type="button"
              disabled={secondsLeft > 0 || loading}
              onClick={() => void requestOtp()}
              className="text-[#004da4] hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      <div className="min-h-12 pt-3 text-center text-[13px]" aria-live="polite">
        {error ? <p id="login-error" className="text-red-600">{error}</p> : null}
        {!error && notice ? <p className="text-emerald-700">{notice}</p> : null}
      </div>

      <div className="mt-3 bg-[#e4f4fd] px-5 py-[17px] text-center text-[14px] leading-[22px] text-[#004da4]">
        <p>Do you own Pharmacy?</p>
        <button type="button" className="text-[#0089ff] hover:underline">
          Join as Chemist
        </button>
      </div>
    </div>
  );
}
