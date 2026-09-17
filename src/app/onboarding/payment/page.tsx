import { AppHeader } from "@/shared/layout/app-header";

export default function PaymentPendingPage() {
  return <main className="min-h-dvh bg-[#f4f8fb]"><AppHeader /><section className="mx-auto max-w-2xl px-6 py-16 sm:px-10"><div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0089ff]">Payment pending</p><h1 className="mt-3 text-3xl font-semibold text-[#062f58]">₹999 paid plan selected</h1><p className="mt-4 leading-7 text-slate-600">Your pharmacy is created. Access will activate after a verified payment is recorded. Until payment gateway setup is completed, contact the ApniPharma team or Super Admin with your pharmacy details.</p></div></section></main>;
}
