"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountSections } from "@/lib/pharmacy";

function AccountIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21c.4-5 3-7.5 8-7.5S19.6 16 20 21H4Z" />
    </svg>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account settings" className="mt-3 space-y-1">
      {accountSections.map((section) => {
        const href = `/account-settings/${section.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={section.slug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative block rounded-r-md py-2 pl-10 pr-4 text-[15px] transition ${
              active
                ? "bg-[#eaf6fe] font-semibold text-[#078bed] before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-[#08a1f5]"
                : "text-slate-700 hover:bg-slate-100 hover:text-[#0758a6]"
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AccountSettingsNavigation() {
  return (
    <>
      <aside className="hidden min-h-[calc(100dvh-72px)] w-[260px] shrink-0 border-r border-slate-200 bg-[#f7f8fa] px-5 py-8 md:block">
        <div className="flex items-center gap-3 px-2 font-semibold text-[#078bed]">
          <AccountIcon />
          <span>Account</span>
        </div>
        <NavLinks />
      </aside>
      <details className="group border-b border-slate-200 bg-[#f7f8fa] px-4 py-3 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-2 font-semibold text-[#0758a6]">
          <span className="flex items-center gap-3"><AccountIcon /> Account</span>
          <span className="transition group-open:rotate-180">⌄</span>
        </summary>
        <div className="pb-2"><NavLinks /></div>
      </details>
    </>
  );
}
