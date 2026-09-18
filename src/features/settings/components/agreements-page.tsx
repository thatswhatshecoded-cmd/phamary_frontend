"use client";

import { useState } from "react";

export function AgreementsPage() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <section className="mx-auto min-h-[calc(100dvh-72px)] max-w-[1100px] px-5 py-8 sm:px-9 lg:px-4">
      <h1 className="text-[27px] font-medium text-[#0795ed]">Agreement List</h1>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(150px,1fr)] border-b border-slate-200 pb-2 text-[11px] font-medium text-[#0758a6] sm:text-xs">
        <span>Agreement Name</span>
        <span>Sign Date/Time</span>
      </div>

      <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
        <div aria-hidden="true" className="relative mb-4 h-[92px] w-[135px] text-[#dceaf5]">
          <div className="absolute bottom-1 left-1/2 h-[64px] w-[105px] -translate-x-1/2 rounded-[48%] bg-[#eef5fb]" />
          <div className="absolute bottom-5 left-[53px] h-[43px] w-[29px] rotate-[-7deg] rounded-[45%] bg-[#0758a6]" />
          <div className="absolute bottom-[48px] left-[62px] h-[17px] w-[17px] rounded-full bg-[#f0b7a3]" />
          <div className="absolute bottom-[55px] left-[61px] h-[8px] w-[20px] rounded-full bg-[#243b5a]" />
          <div className="absolute bottom-[25px] left-[47px] h-[5px] w-[43px] rotate-[-23deg] rounded-full bg-[#1b75b9]" />
          <div className="absolute bottom-[16px] left-[69px] h-[8px] w-[20px] rotate-[9deg] rounded-full bg-[#e7a83a]" />
          <div className="absolute bottom-0 left-[59px] h-[23px] w-[34px] rotate-[-13deg] rounded-t-[45%] bg-[#4f9dd0]" />
          <span className="absolute right-2 top-3 h-2 w-2 rounded-full bg-[#6aa9d4]" />
          <span className="absolute right-5 top-9 h-1.5 w-1.5 rounded-full bg-[#6aa9d4]" />
          <span className="absolute left-2 top-7 h-1.5 w-1.5 rounded-full bg-[#6aa9d4]" />
          <span className="absolute bottom-4 right-1 h-1.5 w-1.5 rounded-full bg-[#6aa9d4]" />
        </div>
        <p className="text-xs text-slate-500">No Signed Agreement found.</p>
        <button type="button" onClick={() => setShowNotice(true)} className="mt-4 bg-[#079ff0] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0788cf]">+&nbsp; Sign Pharmacy Agreement</button>
      </div>

      {showNotice && (
        <div role="dialog" aria-modal="true" aria-labelledby="agreement-notice-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 id="agreement-notice-title" className="text-lg font-semibold text-[#0758a6]">Sign Pharmacy Agreement</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">The agreement signing workflow will be connected here. Your signed agreements will appear in this list with their signing date and time.</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setShowNotice(false)} className="bg-[#079ff0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0788cf]">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
