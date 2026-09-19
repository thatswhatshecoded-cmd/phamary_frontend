"use client";

import { useEffect, useState } from "react";

type KycDetails = {
  mobile_number: string;
  email: string;
  business_name: string;
  owner_name: string;
  status: "draft" | "submitted" | "verified" | "rejected";
  submitted_at: string | null;
  verified_at: string | null;
};

type BankAccount = {
  id: string;
  account_holder_name: string;
  bank_name: string;
  account_number_masked: string;
  ifsc_code: string;
  branch_name: string | null;
  account_type: "savings" | "current" | "overdraft";
  status: "pending" | "verified" | "rejected";
  is_primary: boolean;
  verified_at: string | null;
};

type KycData = { kyc: KycDetails; bank_accounts: BankAccount[]; can_manage: boolean };
type ApiPayload = {
  success?: boolean;
  message?: string;
  data?: Partial<KycData> & { bank_account?: BankAccount };
  errors?: Record<string, string[]>;
};
type Notice = { text: string; error: boolean };

const emptyBankForm = {
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  account_number_confirmation: "",
  ifsc_code: "",
  branch_name: "",
  account_type: "current" as BankAccount["account_type"],
  is_primary: false,
};

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

async function fetchKyc(): Promise<KycData> {
  const response = await fetch("/api/account/kyc", { cache: "no-store" });
  const payload = await readPayload(response);
  if (!response.ok || !payload.success || !payload.data?.kyc || !Array.isArray(payload.data.bank_accounts)) {
    throw new Error(payloadError(payload, "KYC details could not be loaded."));
  }
  return {
    kyc: payload.data.kyc,
    bank_accounts: payload.data.bank_accounts,
    can_manage: payload.data.can_manage === true,
  };
}

function statusStyle(status: string): string {
  if (status === "verified") return "bg-emerald-100 text-emerald-800";
  if (status === "rejected") return "bg-red-100 text-red-800";
  if (status === "submitted" || status === "pending") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function statusLabel(status: string): string {
  return status === "pending" ? "Pending verification" : status.charAt(0).toUpperCase() + status.slice(1);
}

export function KycSettings() {
  const [data, setData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingKyc, setSavingKyc] = useState(false);
  const [showBankManager, setShowBankManager] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [savingBank, setSavingBank] = useState(false);
  const [deletingBank, setDeletingBank] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let active = true;
    void fetchKyc()
      .then((loaded) => { if (active) setData(loaded); })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : "KYC details could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function reload() {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await fetchKyc());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "KYC details could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  function updateKyc(field: keyof Pick<KycDetails, "mobile_number" | "email" | "business_name" | "owner_name">, value: string) {
    setData((current) => current ? { ...current, kyc: { ...current.kyc, [field]: value } } : current);
  }

  async function saveKyc() {
    if (!data) return;
    setSavingKyc(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile_number: data.kyc.mobile_number,
          email: data.kyc.email || null,
          business_name: data.kyc.business_name,
          owner_name: data.kyc.owner_name,
        }),
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success || !payload.data?.kyc) {
        throw new Error(payloadError(payload, "KYC details could not be saved."));
      }
      setData((current) => current ? { ...current, kyc: payload.data!.kyc! } : current);
      setNotice({ text: payload.message ?? "KYC details submitted successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "KYC details could not be saved.", error: true });
    } finally {
      setSavingKyc(false);
    }
  }

  async function addBankAccount() {
    setSavingBank(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/kyc/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm),
      });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success || !payload.data?.bank_account) {
        throw new Error(payloadError(payload, "Bank account could not be added."));
      }
      const added = payload.data.bank_account;
      setData((current) => current ? {
        ...current,
        bank_accounts: [
          ...current.bank_accounts.map((account) => added.is_primary ? { ...account, is_primary: false } : account),
          added,
        ].sort((left, right) => Number(right.is_primary) - Number(left.is_primary)),
      } : current);
      setBankForm(emptyBankForm);
      setShowBankForm(false);
      setShowBankManager(false);
      setNotice({ text: payload.message ?? "Bank account added successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Bank account could not be added.", error: true });
    } finally {
      setSavingBank(false);
    }
  }

  async function removeBankAccount(account: BankAccount) {
    if (!window.confirm(`Remove ${account.bank_name} account ${account.account_number_masked}?`)) return;
    setDeletingBank(account.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/account/kyc/bank-accounts/${account.id}`, { method: "DELETE" });
      const payload = await readPayload(response);
      if (!response.ok || !payload.success) throw new Error(payloadError(payload, "Bank account could not be removed."));
      setData((current) => {
        if (!current) return current;
        const remaining = current.bank_accounts.filter((item) => item.id !== account.id);
        if (account.is_primary && remaining.length > 0) remaining[0] = { ...remaining[0], is_primary: true };
        return { ...current, bank_accounts: remaining };
      });
      setNotice({ text: payload.message ?? "Bank account removed successfully.", error: false });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Bank account could not be removed.", error: true });
    } finally {
      setDeletingBank(null);
    }
  }

  const fieldClass = "mt-2 h-10 w-full border-0 border-b border-slate-300 bg-transparent px-1 text-sm text-slate-900 outline-none focus:border-[#0799ed] disabled:text-slate-500";

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-8 sm:px-9 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#0b8fea]">Account &amp; Settings</p><h1 className="mt-3 text-3xl font-semibold text-[#063665]">KYC Details</h1></div>{data && <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(data.kyc.status)}`}>{statusLabel(data.kyc.status)}</span>}</div>

      {loading && <p className="mt-8 rounded-xl border border-slate-200 bg-white p-7 text-sm text-[#0758a6]">Loading KYC details…</p>}
      {!loading && loadError && <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{loadError}</p><button type="button" onClick={() => void reload()} className="mt-4 rounded bg-red-600 px-4 py-2 font-semibold text-white">Retry</button></div>}

      {!loading && !loadError && data && <>
        {notice && <div role={notice.error ? "alert" : "status"} className={`mt-6 rounded-lg border px-4 py-3 text-sm ${notice.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{notice.text}</div>}

        <form className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void saveKyc(); }}>
          <label className="text-sm font-medium text-[#0758a6]">Mobile No.<input type="tel" inputMode="numeric" value={data.kyc.mobile_number ?? ""} disabled={!data.can_manage} onChange={(event) => updateKyc("mobile_number", event.target.value.replace(/\D/g, "").slice(0, 10))} className={fieldClass} /></label>
          <label className="text-sm font-medium text-[#0758a6]">Email<input type="email" value={data.kyc.email ?? ""} disabled={!data.can_manage} onChange={(event) => updateKyc("email", event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-[#0758a6]">Business Name<input value={data.kyc.business_name ?? ""} maxLength={160} disabled={!data.can_manage} onChange={(event) => updateKyc("business_name", event.target.value)} className={fieldClass} /></label>
          <label className="text-sm font-medium text-[#0758a6]">Owner Name<input value={data.kyc.owner_name ?? ""} maxLength={160} disabled={!data.can_manage} onChange={(event) => updateKyc("owner_name", event.target.value)} className={fieldClass} /></label>
          {data.can_manage && <div className="sm:col-span-2"><button type="submit" disabled={savingKyc} className="mt-1 rounded bg-[#079ff0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0788cf] disabled:opacity-60">{savingKyc ? "Submitting…" : "Submit KYC"}</button></div>}
        </form>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-8"><div><h2 className="text-2xl font-semibold text-[#0795ed]">Bank Details</h2><p className="mt-1 text-sm text-slate-500">Account numbers are encrypted. Verification remains pending until approved by a provider or administrator.</p></div>{data.can_manage && <button type="button" onClick={() => { setShowBankManager(true); setNotice(null); }} className="rounded bg-[#079ff0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0788cf]">+ Add Bank Account</button>}</div>

        {data.bank_accounts.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-200 px-6 py-10"><p className="max-w-xl text-4xl font-semibold leading-tight text-slate-200">You haven&apos;t added a bank account</p></div> : <div className="mt-6 grid gap-4 md:grid-cols-2">{data.bank_accounts.map((account) => <article key={account.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${account.is_primary ? "border-sky-300 ring-2 ring-sky-100" : "border-slate-200"}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#063665]">{account.bank_name}</p><p className="mt-1 text-sm text-slate-600">{account.account_number_masked}</p></div><div className="flex flex-wrap justify-end gap-2">{account.is_primary && <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-800">Primary</span>}<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle(account.status)}`}>{statusLabel(account.status)}</span></div></div>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm"><div><dt className="text-slate-500">Account holder</dt><dd className="mt-1 font-medium text-slate-800">{account.account_holder_name}</dd></div><div><dt className="text-slate-500">IFSC</dt><dd className="mt-1 font-medium text-slate-800">{account.ifsc_code}</dd></div><div><dt className="text-slate-500">Type</dt><dd className="mt-1 capitalize text-slate-800">{account.account_type}</dd></div><div><dt className="text-slate-500">Branch</dt><dd className="mt-1 text-slate-800">{account.branch_name ?? "—"}</dd></div></dl>
          {data.can_manage && <button type="button" disabled={deletingBank === account.id} onClick={() => void removeBankAccount(account)} className="mt-4 text-sm font-semibold text-red-600 hover:underline disabled:opacity-60">{deletingBank === account.id ? "Removing…" : "Remove account"}</button>}
        </article>)}</div>}
        {showBankManager && <div className="documents-modal-backdrop fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowBankManager(false); }}>
          <div className="documents-modal-panel w-full max-w-[720px] overflow-hidden rounded-[3px] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="manage-accounts-title">
            <div className="flex items-center justify-between bg-[#0758a6] px-5 py-3 text-white"><h2 id="manage-accounts-title" className="text-[22px] font-semibold">Manage Accounts</h2><button type="button" aria-label="Close" onClick={() => setShowBankManager(false)} className="text-3xl font-light leading-none hover:text-sky-200">×</button></div>
            <div className="px-5 py-6 sm:px-7">
              {data.bank_accounts.length === 0 ? <div className="flex min-h-[270px] flex-col items-center justify-center text-center"><div className="text-7xl text-sky-100">▱</div><p className="mt-3 text-sm font-semibold text-slate-500">Oops!</p><p className="text-sm text-slate-400">No Bank Accounts found</p></div> : <div className="max-h-[330px] space-y-3 overflow-y-auto">{data.bank_accounts.map((account) => <div key={account.id} className="flex items-center justify-between gap-4 border-b border-slate-100 py-3"><div><p className="font-semibold text-[#0758a6]">{account.bank_name}</p><p className="text-sm text-slate-500">{account.account_number_masked} · {account.ifsc_code}</p></div><div className="flex items-center gap-2 text-xs"><span className={`rounded-full px-2 py-1 font-semibold ${statusStyle(account.status)}`}>{statusLabel(account.status)}</span>{account.is_primary && <span className="rounded-full bg-sky-100 px-2 py-1 font-semibold text-sky-800">Primary</span>}</div></div>)}</div>}
              <p className="mt-7 text-sm text-slate-700">Deactivated Bank Accounts cannot be selected in search results while making payments through cheque for Sales, Purchase, B2B Sales, Manage Expenses &amp; PDC.</p>
              <div className="mt-4 flex items-center justify-between gap-3 bg-[#fff1ce] px-4 py-2.5"><span className="text-base font-medium text-[#0758a6]">Having more accounts?</span><button type="button" onClick={() => { setShowBankManager(false); setShowBankForm(true); setBankForm(emptyBankForm); setNotice(null); }} className="bg-[#0758a6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#06447f]">Add New Account</button></div>
            </div>
          </div>
        </div>}

        {showBankForm && <div className="documents-modal-backdrop fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !savingBank) setShowBankForm(false); }}>
          <div className="documents-modal-panel w-full max-w-[720px] overflow-hidden rounded-[3px] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="add-bank-title">
            <div className="flex items-center justify-between bg-[#0758a6] px-5 py-3 text-white"><h2 id="add-bank-title" className="text-[22px] font-semibold">Add Bank Account</h2><div className="flex items-center gap-5"><button type="submit" form="add-bank-form" disabled={savingBank} className="bg-[#079ff0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0788cf] disabled:opacity-60">{savingBank ? "Saving…" : "Verify &amp; Add"}</button><button type="button" aria-label="Close" disabled={savingBank} onClick={() => { setShowBankForm(false); setBankForm(emptyBankForm); }} className="text-3xl font-light leading-none hover:text-sky-200 disabled:opacity-50">×</button></div></div>
            <form id="add-bank-form" className="grid gap-x-7 gap-y-5 px-5 py-6 sm:grid-cols-2 sm:px-7" onSubmit={(event) => { event.preventDefault(); void addBankAccount(); }}>
              <label className="text-sm font-medium text-[#0758a6] sm:col-span-2">Bank<input placeholder="Find Your Bank *" value={bankForm.bank_name} onChange={(event) => setBankForm((current) => ({ ...current, bank_name: event.target.value }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-[#0758a6]">Account Number<input placeholder="Account Number" inputMode="numeric" autoComplete="off" value={bankForm.account_number} onChange={(event) => setBankForm((current) => ({ ...current, account_number: event.target.value.replace(/\D/g, "").slice(0, 20) }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-[#0758a6]">IFSC Code<input placeholder="Branch Code" value={bankForm.ifsc_code} maxLength={11} onChange={(event) => setBankForm((current) => ({ ...current, ifsc_code: event.target.value.toUpperCase().replace(/\s/g, "") }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-[#0758a6]">Confirm Account Number<input placeholder="Confirm Account Number" inputMode="numeric" autoComplete="off" value={bankForm.account_number_confirmation} onChange={(event) => setBankForm((current) => ({ ...current, account_number_confirmation: event.target.value.replace(/\D/g, "").slice(0, 20) }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-[#0758a6]">Account Holder Name<input placeholder="Account Holder Name" value={bankForm.account_holder_name} onChange={(event) => setBankForm((current) => ({ ...current, account_holder_name: event.target.value }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-[#0758a6]">Branch Name<input placeholder="Branch Name" value={bankForm.branch_name} onChange={(event) => setBankForm((current) => ({ ...current, branch_name: event.target.value }))} className={fieldClass} /></label>
              <label className="text-sm font-medium text-[#0758a6]">Account Type<select value={bankForm.account_type} onChange={(event) => setBankForm((current) => ({ ...current, account_type: event.target.value as BankAccount["account_type"] }))} className={`${fieldClass} bg-white`}><option value="current">Current</option><option value="savings">Savings</option><option value="overdraft">Overdraft</option></select></label>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-[#0758a6]"><input type="checkbox" checked={bankForm.is_primary} onChange={(event) => setBankForm((current) => ({ ...current, is_primary: event.target.checked }))} className="size-4 accent-[#079ff0]" />Primary Account</label>
            </form>
          </div>
        </div>}
      </>}
    </section>
  );
}
