const setupItems = [
  "TypeScript configured",
  "App Router enabled",
  "Tailwind CSS enabled",
  "Laravel API helper added",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_52%)]" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-600/20">
            +
          </span>
          <span className="text-xl font-bold tracking-tight">ApniPharma</span>
        </div>
        <span className="rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 backdrop-blur">
          Frontend ready
        </span>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:pt-28">
        <div>
          <p className="mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            Laravel API + Next.js App Router
          </p>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
            Your digital pharmacy, built on a modern foundation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            The ApniPharma frontend is configured and ready for products,
            prescriptions, orders, and your Laravel-powered API.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <span className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              Next.js 16
            </span>
            <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              React 19
            </span>
            <span className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Tailwind CSS 4
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white bg-white/80 p-4 shadow-2xl shadow-emerald-950/10 backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-950 p-7 text-white">
            <p className="text-sm font-medium text-emerald-300">Setup status</p>
            <h2 className="mt-2 text-2xl font-semibold">Ready to build</h2>
            <div className="mt-7 space-y-3">
              {setupItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/6 px-4 py-3 text-sm text-slate-200"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
