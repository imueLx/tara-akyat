import Link from "next/link";

import {
  formatMountainMonthWindow,
  getMountainBeginnerSuitability,
  getMountainSeasonFeel,
  getMountainWeatherPlanningCopy,
  getMountainWhenToGoCopy,
  sortMountainBestMonths,
} from "@/lib/mountain-page-content";
import type { Mountain } from "@/types/hiking";

type Props = {
  mountain: Mountain;
};

export function MountainPlanningOutlook({ mountain }: Props) {
  const orderedBestMonths = sortMountainBestMonths(mountain.best_months);
  const bestWindow = formatMountainMonthWindow(orderedBestMonths);
  const seasonFeel = getMountainSeasonFeel(orderedBestMonths);
  const beginnerNote = getMountainBeginnerSuitability(mountain);

  return (
    <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Planning outlook</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">
            When to hike {mountain.name}
          </h2>
        </div>
        <Link
          href="/difficulty/beginner"
          className="text-sm font-semibold text-sky-700 transition hover:text-sky-800"
        >
          Browse beginner hikes
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Best hiking window</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{bestWindow}</p>
          {orderedBestMonths.length > 1 ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{orderedBestMonths.join(", ")}</p>
          ) : null}
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{seasonFeel.eyebrow}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{seasonFeel.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{seasonFeel.body}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-700">{getMountainWhenToGoCopy(mountain)}</p>
      {beginnerNote ? <p className="mt-3 text-sm leading-7 text-slate-700">{beginnerNote}</p> : null}
      <p className="mt-3 text-sm leading-7 text-slate-600">{getMountainWeatherPlanningCopy(mountain.name)}</p>
    </section>
  );
}
