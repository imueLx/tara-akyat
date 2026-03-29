import Link from "next/link";

type Props = {
  mountainCount: number;
};

export function HomePlannerShell({ mountainCount }: Props) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1.2fr),360px]">
        <div className="order-2 bg-[linear-gradient(180deg,#fdfdfd_0%,#f8fafc_100%)] p-4 sm:p-5 xl:order-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Live result</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">Weather result for your selected hike</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">Date not set</span>
              </div>
            </div>
            <Link
              href="/mountains"
              className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
            >
              Full details
            </Link>
          </div>

          <div className="flex min-h-[420px] items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-8 text-center shadow-sm">
            <div className="max-w-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Ready to check</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Your weather result will appear here.</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Pick a mountain and date on the right, then check if the day looks good for hiking.
              </p>
            </div>
          </div>
        </div>

        <aside className="order-1 border-b border-slate-200/80 bg-[linear-gradient(180deg,#fbfdff_0%,#f6f8fb_100%)] p-4 sm:p-5 xl:order-2 xl:border-b-0 xl:border-l">
          <div className="space-y-3">
            <section className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-[linear-gradient(160deg,#ffffff_0%,#f7fafc_100%)] p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-700">Choose mountain</p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">Search {mountainCount} mountains by name, province, or region.</p>
                  </div>
                  <Link
                    href="/mountains"
                    className="inline-flex shrink-0 rounded-[14px] border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Browse all
                  </Link>
                </div>

                <div className="mt-4 rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Mountain finder</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">Start with your next hike</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">Set up</span>
                  </div>
                  <div className="mt-3 h-[54px] rounded-[16px] border border-slate-200 bg-slate-50" />
                </div>
              </div>
            </section>

            <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Pick date</p>
              <div className="mt-3 h-12 rounded-[16px] border border-slate-200 bg-slate-50" />
              <div className="mt-3 flex items-start justify-between gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Forecast trust</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">Choose date</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">Required</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Choose a hike date to load trust guidance and the matching forecast range.</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                After 15 days, the app switches from day-level forecast to planning outlook. Beyond 30 days, it leans on the same calendar
                date and month history from the last 2 years.
              </p>
            </section>

            <div className="rounded-[18px] border border-slate-200 bg-white/95 p-2 shadow-[0_12px_28px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="w-full rounded-[16px] bg-slate-950 px-4 py-3.5 text-center text-sm font-semibold text-white">Check hiking weather</div>
              <p className="mt-2 text-center text-[11px] text-slate-500">Choose a mountain and date, then check the forecast.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
