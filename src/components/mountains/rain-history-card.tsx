import type { ReactNode } from "react";

import {
  formatCalendarDayLabel,
  formatReadableDate,
  formatRainAmountDetail,
  formatGaugeRating,
  getTrailRainImpact,
  historySnapshotTone,
  historySummaryFromCrosscheck,
  normalizeHistoryCrosscheck,
} from "@/lib/weather/presentation";
import { RainAmountDisplay } from "@/components/mountains/rain-amount-display";
import type { HistoryCrosscheck } from "@/types/hiking";

type Props = {
  history: HistoryCrosscheck;
  targetDate: string;
  chipLabel?: string;
  chipClassName?: string;
  summaryValue?: string;
  compact?: boolean;
  leadingIcon?: ReactNode;
};

function historyYearRangeLabel(snapshots: HistoryCrosscheck["targetDateSnapshots"] | undefined): string {
  const safeSnapshots = snapshots ?? [];

  if (safeSnapshots.length === 0) {
    return "the last 2 years";
  }

  const years = safeSnapshots.map((snapshot) => snapshot.date.slice(0, 4)).sort((a, b) => b.localeCompare(a));

  if (years.length === 1) {
    return years[0];
  }

  if (years.length === 2) {
    return `${years[1]} and ${years[0]}`;
  }

  return years.slice().reverse().join(", ");
}

export function RainHistoryCard({
  history,
  targetDate,
  chipLabel = "No data",
  chipClassName = "bg-slate-100 text-slate-700",
  summaryValue = "Unavailable",
  compact = false,
  leadingIcon,
}: Props) {
  const normalizedHistory = normalizeHistoryCrosscheck(history);
  const calendarDay = formatCalendarDayLabel(targetDate);
  const snapshots = normalizedHistory.targetDateSnapshots;
  const paddingClass = compact ? "px-3 py-3" : "px-4 py-4";
  const titleClass = compact ? "text-xs font-semibold" : "text-[11px] font-semibold uppercase tracking-[0.16em]";
  const subtitleClass = compact ? "mt-0.5 text-[11px] text-slate-500" : "mt-1 text-sm font-medium text-slate-600";

  return (
    <article
      className={`overflow-hidden rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfb_100%)] shadow-[0_12px_28px_rgba(15,23,42,0.06)] ${paddingClass}`}
    >
      <div className={`mb-3 h-px bg-[linear-gradient(90deg,rgba(245,158,11,0.22),rgba(148,163,184,0))] ${compact ? "" : "mb-4"}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          {leadingIcon ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-white text-amber-700 shadow-[0_6px_18px_rgba(245,158,11,0.10)]">
              {leadingIcon}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className={`${titleClass} text-slate-900`}>Rain history</p>
            <p className={subtitleClass}>
              {calendarDay} in {historyYearRangeLabel(snapshots)}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${chipClassName}`}>{chipLabel}</span>
      </div>

      {snapshots.length > 0 ? (
        <div className={`mt-3 grid grid-cols-1 gap-2 ${snapshots.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {snapshots.map((snapshot) => {
            const tone = historySnapshotTone(snapshot.precipitationSum, snapshot.wasWet);

            return (
              <div
                key={snapshot.date}
                className={`rounded-2xl border px-3 py-3 ${tone.cardClassName}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{snapshot.date.slice(0, 4)}</p>
                    <p className={`mt-1 font-semibold text-slate-950 ${compact ? "text-sm" : "text-base"}`}>
                      {formatReadableDate(snapshot.date)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${tone.pillClassName}`}>
                    {tone.label}
                  </span>
                </div>
                <div className="mt-3">
                  <RainAmountDisplay valueMm={snapshot.precipitationSum} variant="history" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={`mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-slate-600 ${compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
          No archived records yet for {calendarDay} in the last 2 years.
        </p>
      )}

      <div className={`mt-3 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 ${compact ? "" : "backdrop-blur"}`}>
        {(() => {
          const averageImpact = getTrailRainImpact(normalizedHistory.targetDateAvgPrecipitation);

          return (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">2-year average on this date</p>
              <p className={`mt-2 font-semibold text-slate-950 ${compact ? "text-sm" : "text-base"}`}>
                {averageImpact.label} · {formatGaugeRating(averageImpact.gaugeSegments)}
              </p>
              <div className="mt-2 flex gap-1" role="img" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={`history-average-gauge-${index}`}
                    className={`h-2 flex-1 rounded-full ${index < averageImpact.gaugeSegments ? averageImpact.barClassName : "bg-slate-200/80"}`}
                  />
                ))}
              </div>
              <div className={`mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${compact ? "text-xs" : "text-sm"} text-slate-700`}>
                <span>{formatRainAmountDetail(normalizedHistory.targetDateAvgPrecipitation)}</span>
                <span className="text-slate-300" aria-hidden="true">
                  •
                </span>
                <span>{normalizedHistory.targetDateWetDayChance}% wet days</span>
              </div>
            </>
          );
        })()}
      </div>

      <p className={`mt-3 font-semibold text-slate-950 ${compact ? "text-base" : "text-xl"}`}>{summaryValue}</p>
      <p className={`mt-1 break-words text-slate-500 ${compact ? "text-[11px] leading-5" : "text-xs leading-5"}`}>
        {historySummaryFromCrosscheck(normalizedHistory)}
      </p>
    </article>
  );
}
