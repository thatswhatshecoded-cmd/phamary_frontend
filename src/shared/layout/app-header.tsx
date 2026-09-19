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

function HomeIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="currentColor"><path d="m3 10.7 9-7.2 9 7.2v9.8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.5v-9.8Zm5.5 9.8h7v-5.8h-7v5.8Z" /></svg>;
}

function PlusIcon() {
  return <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-[#18bcae] text-[22px] font-light leading-none text-white">+</span>;
}

function BoxIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="currentColor"><path d="m12 2.5 9 4.8v9.4l-9 4.8-9-4.8V7.3l9-4.8Zm0 2.3L6.2 8l5.8 3 5.8-3L12 4.8Zm-7 4.8v5.7l5.8 3.1v-5.8L5 9.6Zm8.2 8.8 5.8-3.1V9.6l-5.8 3v5.8Z" /></svg>;
}

function BookIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4.5c2.8-.5 5.5.2 8 2.1v13c-2.5-1.9-5.2-2.6-8-2.1v-13ZM20 4.5c-2.8-.5-5.5.2-8 2.1v13c2.5-1.9 5.2-2.6 8-2.1v-13Z" /></svg>;
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
    <header className="relative z-40 flex min-h-[80px] items-center justify-between gap-4 border-b border-white/10 bg-[#00362B] px-4 text-white shadow-[0_2px_8px_rgba(0,0,0,.12)] sm:px-8 lg:px-10">
      <Link href="/dashboard" aria-label="Go to dashboard" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        <BrandLogo showName={false} />
      </Link>

      <nav aria-label="Primary navigation" className="hidden flex-1 items-center justify-center gap-7 xl:flex">
        <Link href="/dashboard" className="flex items-center gap-2 text-[22px] font-medium tracking-[-.3px] transition-colors hover:text-[#5ce4d7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><HomeIcon /> Home</Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-[22px] font-medium tracking-[-.3px] transition-colors hover:text-[#5ce4d7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><PlusIcon /> Sales</Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-[22px] font-medium tracking-[-.3px] transition-colors hover:text-[#5ce4d7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><PlusIcon /> Purchase</Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-[22px] font-medium tracking-[-.3px] transition-colors hover:text-[#5ce4d7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><BoxIcon /> Inventory</Link>
        <Link href="/dashboard" className="flex items-center gap-2 text-[22px] font-medium tracking-[-.3px] transition-colors hover:text-[#5ce4d7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><BookIcon /> Medbook</Link>
        <button type="button" className="flex items-center gap-2 text-[22px] font-medium tracking-[-.3px] transition-colors hover:text-[#5ce4d7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">More <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 7 6 6 6-6" /></svg></button>
      </nav>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex h-[52px] items-center gap-2 rounded-md border border-white/55 bg-white/10 px-3 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
              className="flex items-center gap-4 px-6 py-5 text-[16px] font-medium text-slate-800 transition hover:bg-[#eefaf8] focus:bg-[#eefaf8] focus:outline-none"
            >
              <span className="text-[#007b70]"><GearIcon /></span>
              Account &amp; Settings
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
