"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/shared/ui/brand-logo";

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20c.7-4.1 3.2-6.2 7.5-6.2s6.8 2.1 7.5 6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M12 8.25A3.75 3.75 0 1 0 12 15.75 3.75 3.75 0 0 0 12 8.25Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m19.1 13.9 1.05 1.7-2.55 2.55-1.7-1.05a7.6 7.6 0 0 1-1.9.8l-.45 1.95H9.95L9.5 17.9a7.6 7.6 0 0 1-1.9-.8l-1.7 1.05-2.55-2.55 1.05-1.7a7.6 7.6 0 0 1-.8-1.9l-1.95-.45v-3.6L3.6 7.5a7.6 7.6 0 0 1 .8-1.9L3.35 3.9 5.9 1.35 7.6 2.4a7.6 7.6 0 0 1 1.9-.8L9.95-.35h3.6L14 1.6a7.6 7.6 0 0 1 1.9.8l1.7-1.05 2.55 2.55-1.05 1.7c.35.6.62 1.24.8 1.9l1.95.45v3.6L19.9 12c-.18.66-.45 1.3-.8 1.9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" transform="translate(0 1) scale(.93)" />
    </svg>
  );
}

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header className="relative z-40 flex h-[72px] items-center justify-between border-b border-white/10 bg-[#0758a6] px-4 shadow-sm sm:px-8">
      <Link href="/dashboard" aria-label="Go to dashboard" className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <BrandLogo />
      </Link>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex h-[52px] items-center gap-2 rounded-md border border-white/35 bg-[#084b8a] px-3 text-white transition hover:bg-[#063f75] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="grid size-9 place-items-center rounded-full border border-white/50 bg-white/10"><UserIcon /></span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className={`size-4 transition ${open ? "rotate-180" : ""}`} fill="currentColor">
            <path d="m5.3 7.5 4.7 4.7 4.7-4.7 1.1 1.1-5.8 5.8-5.8-5.8 1.1-1.1Z" />
          </svg>
        </button>
        {open && (
          <div role="menu" className="absolute right-0 top-[62px] w-[310px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_18px_45px_rgba(5,46,87,.22)]">
            <Link
              role="menuitem"
              href="/account-settings/about-pharmacy"
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-6 py-5 text-[16px] font-medium text-slate-800 transition hover:bg-[#f2f8fd] focus:bg-[#f2f8fd] focus:outline-none"
            >
              <span className="text-[#0758a6]"><GearIcon /></span>
              Account &amp; Settings
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
