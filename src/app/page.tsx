import { OtpLoginForm } from "@/features/auth/components/otp-login-form";
import { BrandLogo } from "@/shared/ui/brand-logo";

function SupportIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 text-[#0092ff]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2Zm16 0a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Z" />
      <path d="M17 17c0 2-1.5 3-4 3" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh border-t-[7px] border-[#34413f] bg-white text-[#004da4]">
      <div className="grid min-h-[calc(100dvh-7px)] lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="relative hidden bg-[#062f58] lg:block">
          <div className="absolute left-[50px] top-[25px]">
            <BrandLogo />
          </div>
        </section>

        <section className="relative bg-white px-8 pb-16 pt-[96px] sm:px-12 lg:px-20">
          <div className="absolute right-8 top-9 flex items-center gap-3 text-[17px] text-black">
            <SupportIcon />
            <span>Customer Support</span>
          </div>

          <div className="mb-10 lg:hidden">
            <BrandLogo dark />
          </div>

          <OtpLoginForm />

          <button
            type="button"
            aria-label="Open help"
            className="absolute bottom-[29px] right-[30px] grid size-[31px] place-items-center rounded-full bg-[#008b9c] text-[15px] font-semibold text-white shadow-md transition-transform hover:scale-105"
          >
            ?
          </button>
        </section>
      </div>
    </main>
  );
}
