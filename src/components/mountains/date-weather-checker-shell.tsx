import { Skeleton } from "@/components/ui/skeleton";
import { WeatherDetailsSkeleton, WeatherResultSkeleton } from "@/components/mountains/weather-result-skeleton";

export function DateWeatherCheckerShell() {
  return (
    <section
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
      aria-busy="true"
      aria-label="Loading weather checker"
    >
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
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Hiking Date</p>
                <Skeleton className="mt-3 h-12 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-4 w-full max-w-md rounded-full" />
            <Skeleton className="mt-2 h-4 w-5/6 max-w-sm rounded-full" />
          </div>
        </div>

        <Skeleton className="mt-4 h-12 w-full rounded-2xl" />

        <WeatherResultSkeleton className="mt-4 space-y-3" label="Loading weather checker" />

        <div className="mt-4">
          <WeatherDetailsSkeleton className="grid grid-cols-1 gap-2" label="Loading weather checker details" />
        </div>
      </div>
    </section>
  );
}
