export function DateWeatherCheckerShell() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-slate-900 via-sky-900 to-teal-800 px-4 py-5 text-white sm:px-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100">Weather Check</p>
        <h2 className="mt-2 text-lg font-semibold">Check your hiking date</h2>
        <p className="mt-1 text-sm text-cyan-50/90">
          Result shows hiking recommendation, forecast trust, and simple risk cards for rain, wind, and feels-like.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Hiking Date</p>
                <p className="mt-1 text-xs text-slate-500">
                  Exact forecast is day-specific up to 15 days. Longer-range dates use planning outlook and recent history.
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                Trust guide
              </span>
            </div>
            <div className="mt-3 h-12 rounded-2xl border border-slate-200 bg-slate-50" />
            <p className="mt-2 text-xs text-slate-600">Best window for go or no-go planning.</p>
            <p className="mt-1 text-xs text-slate-500">
              After 15 days, the app switches from day-level forecast to planning outlook. Beyond 30 days, it leans on the same
              calendar date and month history from the last 2 years.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white">Check hiking day</div>

        <div className="mt-4 space-y-3">
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Primary decision</p>
            <p className="mt-2 text-sm font-medium text-slate-600">Pick a hiking date to load the forecast result.</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Weather result will appear here</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">Rain, wind, temperature, and trust guidance load after the planner hydrates.</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">How reliable</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">Forecast trust</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Confidence guidance will appear with the selected date.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
