"use client";

import { useEffect, useState } from "react";

function ActionIcon({ kind }: { kind: "lock" | "phone" | "transfer" | "delete" }) {
  const paths = { lock: "M7 10V7a5 5 0 0 1 10 0v3h2v10H5V10h2Zm2 0h6V7a3 3 0 0 0-6 0v3Z", phone: "M7 2h10v20H7V2Zm2 3v14h6V5H9Z", transfer: "M4 7h13l-3-3 1.4-1.4L21.8 9l-6.4 6.4L14 14l3-3H4V7Zm16 10H7l3 3-1.4 1.4L2.2 15l6.4-6.4L10 10l-3 3h13v4Z", delete: "M6 7h12l-1 14H7L6 7Zm3-4h6l1 2H8l1-2Zm-5 2h16v2H4V5Z" };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d={paths[kind]} /></svg>;
}

export function SecuritySettings() {
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("Email");
  const [message, setMessage] = useState("");
  useEffect(() => {
    void fetch("/api/account/security", { cache: "no-store" }).then((response) => response.json()).then((payload) => {
      const security = payload.data?.security;
      if (security) { setEmail(security.recovery_email ?? ""); setMethod(security.otp_method === "sms" ? "SMS" : "Email"); }
    });
  }, []);
  async function saveSecurity() {
    await fetch("/api/account/security", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recovery_email: email || null, otp_method: method.toLowerCase() }) });
    setMessage("Security settings saved successfully.");
  }
  return (
    <section className="mx-auto max-w-[1100px] px-5 py-8 sm:px-9 lg:px-12">
      <div className="flex items-center gap-2"><h1 className="text-[27px] font-medium text-[#0795ed]">Security</h1><span aria-hidden="true" className="text-xl">💡</span></div>
      <p className="mt-3 text-[14px] font-semibold text-[#0758a6]">Separate Verification Code will be sent each time to do things like,</p>
      <div className="mt-6 grid max-w-[760px] grid-cols-2 gap-x-20 gap-y-5 text-[13px] text-[#1e2d3d] max-[700px]:grid-cols-1">
        {[['lock', 'Change any Password'], ['phone', 'Change any Recovery Email or Mobile No.'], ['transfer', 'Transfer Stock from one to another location'], ['delete', 'Delete Stock']].map(([kind, label]) => <div key={label} className="flex items-center gap-3"><span className="text-[#0758a6]"><ActionIcon kind={kind as "lock"} /></span><span>{label}</span></div>)}
      </div>
      <div className="mt-7 max-w-[395px] text-[13px] text-[#0758a6]">
        <div className="border-b border-slate-200 pb-2"><div>Mobile Number</div><div className="mt-1 flex items-center justify-between"><span className="text-slate-900">7000795310</span><span className="rounded-full bg-[#28ae68] px-2 py-0.5 text-[11px] text-white">Verified</span><button type="button" onClick={() => setMessage("Mobile number change request started.")} className="bg-slate-200 px-4 py-1 text-xs text-[#0758a6]">Change</button></div></div>
        <div className="mt-4 flex items-end gap-3 border-b border-slate-200 pb-2"><label className="min-w-0 flex-1">Recovery Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-7 w-full border-0 border-b border-slate-300 px-0 text-slate-900 outline-none focus:border-[#0799ed]" /></label><button type="button" onClick={() => setMessage(email ? "Verification code sent." : "Enter a recovery email first.")} className="bg-[#079ff0] px-4 py-2 text-xs font-semibold text-white">Verify</button></div>
        <div className="mt-4 flex items-end justify-between border-b border-slate-200 pb-2"><label>OTP Method<select value={method} onChange={(event) => setMethod(event.target.value)} className="mt-1 block h-8 w-[130px] border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none"><option>Email</option><option>SMS</option></select></label><button type="button" onClick={() => void saveSecurity()} className="bg-[#079ff0] px-4 py-2 text-xs font-semibold text-white">Update</button></div>
        <p className="mt-4 text-[12px] text-red-600">This Recovery Email should be Personal &amp; Private. Make sure only you have access to that account.</p>
        {message && <p role="status" className="mt-4 text-xs text-emerald-700">{message}</p>}
      </div>
    </section>
  );
}
