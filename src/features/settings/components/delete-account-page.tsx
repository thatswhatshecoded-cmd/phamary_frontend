"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeletePayload = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const reasons = [
  "I have created this account for testing purpose.",
  "I wish to associate with other Pharmacy.",
  "I have concerns about Data Security.",
];

function getErrorMessage(payload: DeletePayload) {
  return payload.errors ? Object.values(payload.errors).flat()[0] : payload.message ?? "The account could not be deleted. Please try again.";
}

export function DeleteAccountPage() {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [response, setResponse] = useState<{ text: string; error: boolean } | null>(null);

  function openConfirmation() {
    if (!reason) {
      setResponse({ text: "Please select a reason before continuing.", error: true });
      return;
    }
    setResponse(null);
    setConfirmation("");
    setModalOpen(true);
  }

  async function deleteAccount() {
    if (confirmation.trim().toUpperCase() !== "DELETE") {
      setResponse({ text: "Please type DELETE to confirm account deletion.", error: true });
      return;
    }

    setDeleting(true);
    setResponse(null);
    try {
      const apiResponse = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE", reason, feedback: feedback.trim() || null }),
      });
      const payload = (await apiResponse.json()) as DeletePayload;
      if (!apiResponse.ok || !payload.success) throw new Error(getErrorMessage(payload));
      setResponse({ text: payload.message ?? "Account deleted successfully.", error: false });
      window.setTimeout(() => router.replace("/"), 1200);
    } catch (error) {
      setResponse({ text: error instanceof Error ? error.message : "The account could not be deleted. Please try again.", error: true });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="mx-auto max-w-[900px] px-5 py-8 sm:px-9 lg:px-12">
      <h1 className="text-[27px] font-medium text-[#0795ed]">Delete Account</h1>
      <h2 className="mt-8 text-[18px] font-semibold text-[#ef4f58]">We are sorry to see you leaving :(</h2>

      <div className="mt-7 max-w-[480px]">
        <p className="text-[15px] font-semibold text-[#0758a6]">Why are you deleting your account?</p>
        <fieldset className="mt-3 space-y-3">
          <legend className="sr-only">Account deletion reason</legend>
          {reasons.map((item) => (
            <label key={item} className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
              <input type="radio" name="delete-reason" value={item} checked={reason === item} onChange={() => setReason(item)} className="mt-0.5 size-4 accent-[#079ff0]" />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>

        <label className="mt-9 block text-[15px] font-semibold text-[#0758a6]" htmlFor="delete-feedback">How can we improve the product?</label>
        <textarea id="delete-feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Let us know if you have any feedback..." rows={2} maxLength={1000} className="mt-3 w-full resize-y border-0 border-b border-slate-300 px-0 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:border-[#079ff0] focus:ring-0" />

        <p className="mt-7 text-sm leading-6 text-[#ef4f58]">Deleting an account will delete all of your account information. There will be no way to restore your account.</p>
        {response && !modalOpen && <p role={response.error ? "alert" : "status"} className={`mt-4 text-sm ${response.error ? "text-red-600" : "text-emerald-600"}`}>{response.text}</p>}
        <button type="button" onClick={openConfirmation} className="mt-4 rounded bg-[#e94f5b] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#d93f4b]">Verify &amp; Delete</button>
      </div>

      {modalOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="delete-account-title" className="text-xl font-semibold text-slate-900">Confirm account deletion</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">This permanently deletes your login, pharmacy data, and documents. This action cannot be undone.</p>
              </div>
              <button type="button" aria-label="Close confirmation" onClick={() => { setModalOpen(false); setResponse(null); }} className="text-2xl leading-none text-slate-500 hover:text-slate-900">×</button>
            </div>

            <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="delete-confirmation">Type DELETE to confirm</label>
            <input id="delete-confirmation" autoFocus value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") void deleteAccount(); }} className="mt-2 h-11 w-full rounded border border-slate-300 px-3 uppercase text-slate-900 outline-none focus:border-[#e94f5b] focus:ring-1 focus:ring-[#e94f5b]" />

            {response && <div role={response.error ? "alert" : "status"} className={`mt-4 rounded-md border px-3 py-2.5 text-sm ${response.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{response.text}</div>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => { setModalOpen(false); setResponse(null); }} className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting || confirmation.trim().toUpperCase() !== "DELETE"} onClick={() => void deleteAccount()} className="rounded bg-[#e94f5b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d93f4b] disabled:cursor-not-allowed disabled:opacity-50">{deleting ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
