"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RecommendationPill } from "@/components/mountains/recommendation-pill";
import { addDays, differenceInDays, formatISODate, isValidDate } from "@/lib/date";
import { getSelectedReliability } from "@/lib/weather/reliability";
import type { WeatherCheckResult } from "@/types/hiking";

type Props = {
  lat: number;
  lon: number;
  initialDate?: string;
};

type MetricTone = {
  label: string;
  detail: string;
  cardClassName: string;
  pillClassName: string;
  valueClassName: string;
};

type GuidanceTone = {
  containerClassName: string;
  chipClassName: string;
  label: string;
  detail: string;
  valueText: string;
};

function nextDayISO(): string {
  return formatISODate(addDays(new Date(), 1));
}

function resultTone(result: WeatherCheckResult | null): string {
  if (!result?.recommendation) {
    return "border-slate-200 bg-slate-50 text-slate-900";
  }

  if (result.recommendation === "Good") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (result.recommendation === "Caution") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-rose-200 bg-rose-50 text-rose-950";
}

function resultHeading(result: WeatherCheckResult): string {
  if (result.mode === "climate") {
    return "Planning guidance only";
  }

  if (result.recommendation === "Good") {
    return "Good day for hiking";
  }

  if (result.recommendation === "Caution") {
    return "Possible, but use caution";
  }

  return "Not recommended for hiking";
}

function resultMessage(result: WeatherCheckResult): string {
  if (result.mode === "climate") {
    return "This date is beyond day-level forecast range, so this is advance planning guidance only.";
  }

  if (result.recommendation === "Good") {
    return "Forecast conditions look favorable enough for most hikers.";
  }

  if (result.recommendation === "Caution") {
    return "Conditions are mixed. Hiking may still be okay, but plan for extra caution.";
  }

  return "Weather risk is high enough that postponing is usually safer.";
}

function formatReadableDate(value: string): string {
  if (!isValidDate(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${value}T00:00:00`));
}

function forecastTrustLabel(result: WeatherCheckResult): string {
  if (result.reliability.estimatedAccuracy >= 85) {
    return "High trust";
  }

  if (result.reliability.estimatedAccuracy >= 65) {
    return "Moderate trust";
  }

  return "Low trust";
}

function forecastTrustTone(result: WeatherCheckResult): string {
  if (result.reliability.estimatedAccuracy >= 85) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (result.reliability.estimatedAccuracy >= 65) {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-rose-100 text-rose-800";
}

function reliabilityPlainLanguage(result: WeatherCheckResult): string {
  if (result.reliability.estimatedAccuracy >= 85) {
    return "This forecast is usually reliable for final go or no-go decisions.";
  }

  if (result.reliability.estimatedAccuracy >= 65) {
    return "This is useful for planning, but still recheck closer to hike day.";
  }

  return "Use this only as advance guidance. Recheck again near your hike date.";
}

function historySummary(result: WeatherCheckResult): string {
  if (result.history.targetMonthWetDayChance >= 55) {
    return "This month has often been wet in the last 2 years, but that does not mean your selected date is likely to rain.";
  }

  if (result.history.targetMonthWetDayChance >= 35) {
    return "This month has shown mixed wet and dry patterns in the last 2 years, so use it as background planning context only.";
  }

  return "This month has generally been less wet in the last 2 years, based on recent history.";
}

function compactReasons(result: WeatherCheckResult): string[] {
  return result.reasons.slice(0, 3);
}

function rainChanceTone(value: number): MetricTone {
  if (value >= 70) {
    return {
      label: "High",
      detail: "Rain is likely",
      cardClassName: "border-sky-200 bg-sky-50",
      pillClassName: "bg-sky-100 text-sky-800",
      valueClassName: "text-sky-900",
    };
  }

  if (value >= 35) {
    return {
      label: "Medium",
      detail: "Showers are possible",
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-900",
    };
  }

  return {
    label: "Low",
    detail: "Lower rain chance",
    cardClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-900",
  };
}

function rainAmountTone(value: number): MetricTone {
  if (value <= 0) {
    return {
      label: "None",
      detail: "No rain expected",
      cardClassName: "border-emerald-200 bg-emerald-50",
      pillClassName: "bg-emerald-100 text-emerald-800",
      valueClassName: "text-emerald-900",
    };
  }

  if (value >= 8) {
    return {
      label: "Heavy",
      detail: "Trails likely wet",
      cardClassName: "border-sky-200 bg-sky-50",
      pillClassName: "bg-sky-100 text-sky-800",
      valueClassName: "text-sky-900",
    };
  }

  if (value >= 2) {
    return {
      label: "Moderate",
      detail: "Some rain expected",
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-900",
    };
  }

  return {
    label: "Light",
    detail: "Light rain possible",
    cardClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-900",
  };
}

function windTone(value: number): MetricTone {
  if (value >= 35) {
    return {
      label: "Strong",
      detail: "Exposed areas riskier",
      cardClassName: "border-rose-200 bg-rose-50",
      pillClassName: "bg-rose-100 text-rose-800",
      valueClassName: "text-rose-900",
    };
  }

  if (value >= 20) {
    return {
      label: "Breezy",
      detail: "Noticeable wind",
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-900",
    };
  }

  return {
    label: "Calm",
    detail: "Comfortable wind",
    cardClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-900",
  };
}

function feelsLikeTone(value: number): MetricTone {
  if (value >= 35) {
    return {
      label: "Hot",
      detail: "Heat can drain energy",
      cardClassName: "border-rose-200 bg-rose-50",
      pillClassName: "bg-rose-100 text-rose-800",
      valueClassName: "text-rose-900",
    };
  }

  if (value >= 30) {
    return {
      label: "Warm",
      detail: "Hydrate more often",
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-900",
    };
  }

  if (value >= 18) {
    return {
      label: "Comfortable",
      detail: "Good hiking feel",
      cardClassName: "border-emerald-200 bg-emerald-50",
      pillClassName: "bg-emerald-100 text-emerald-800",
      valueClassName: "text-emerald-900",
    };
  }

  return {
    label: "Cool",
    detail: "Bring a light layer",
    cardClassName: "border-sky-200 bg-sky-50",
    pillClassName: "bg-sky-100 text-sky-800",
    valueClassName: "text-sky-900",
  };
}

function rainOutlookTone(result: WeatherCheckResult): GuidanceTone {
  const rainChance = result.metrics?.precipitationProbability ?? result.history.targetMonthWetDayChance;
  const rainMm = result.metrics?.precipitationSum;

  if (rainChance >= 70 || (typeof rainMm === "number" && rainMm >= 8)) {
    return {
      containerClassName: "border-sky-200 bg-sky-50",
      chipClassName: "bg-sky-100 text-sky-800",
      label: "Rain likely",
      detail: "This is the selected-date forecast signal. Wet trails are likely.",
      valueText: `${rainChance}% chance${typeof rainMm === "number" ? ` | ${rainMm} mm` : ""}`,
    };
  }

  if (rainChance >= 35 || (typeof rainMm === "number" && rainMm >= 2)) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "bg-amber-100 text-amber-800",
      label: "Possible rain",
      detail: "This is the selected-date forecast signal. Some showers are possible.",
      valueText: `${rainChance}% chance${typeof rainMm === "number" ? ` | ${rainMm} mm` : ""}`,
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "bg-emerald-100 text-emerald-800",
    label: "Low rain risk",
    detail: "This is the selected-date forecast signal. Rain looks unlikely for this date.",
    valueText: `${rainChance}% chance${typeof rainMm === "number" ? ` | ${rainMm} mm` : ""}`,
  };
}

function historyContextTone(wetDayChance: number): GuidanceTone {
  if (wetDayChance >= 55) {
    return {
      containerClassName: "border-sky-200 bg-sky-50",
      chipClassName: "bg-sky-100 text-sky-800",
      label: "Historically wet",
      detail: "Month-level pattern only, not a prediction for your exact selected date.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  if (wetDayChance >= 35) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "bg-amber-100 text-amber-800",
      label: "Mixed month",
      detail: "Month-level pattern only, not a prediction for your exact selected date.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "bg-emerald-100 text-emerald-800",
    label: "Usually drier",
    detail: "Month-level pattern only, not a prediction for your exact selected date.",
    valueText: `${wetDayChance}% wet days`,
  };
}

function LoadingResultsSkeleton() {
  return (
    <div
      className="mt-4 space-y-3"
      role="status"
      aria-live="polite"
      aria-label="Loading weather results"
    >
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="h-3 w-28 rounded-full bg-slate-200" />
        <div className="mt-3 h-6 w-52 rounded-full bg-slate-200" />
        <div className="mt-2 h-4 w-full rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-11/12 rounded-full bg-slate-100" />
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-7 w-32 rounded-full bg-slate-100" />
          <div className="h-7 w-28 rounded-full bg-slate-100" />
          <div className="h-7 w-24 rounded-full bg-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`metric-skeleton-${index}`} className="animate-pulse rounded-2xl border border-slate-200 bg-white px-3 py-3">
            <div className="h-3 w-20 rounded-full bg-slate-200" />
            <div className="mt-3 h-6 w-16 rounded-full bg-slate-200" />
            <div className="mt-2 h-3 w-24 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function resultScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "smooth";
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function DateWeatherChecker({ lat, lon, initialDate }: Props) {
  const startingDate = initialDate && isValidDate(initialDate) ? initialDate : nextDayISO();
  const [date, setDate] = useState(startingDate);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeatherCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announceMessage, setAnnounceMessage] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const appliedInitialDateRef = useRef<string | null>(null);
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);

  const todayIso = formatISODate(new Date());
  const daysAhead = useMemo(
    () => differenceInDays(new Date(`${date}T00:00:00`), new Date(`${todayIso}T00:00:00`)),
    [date, todayIso],
  );
  const selectedReliability = useMemo(() => getSelectedReliability(Math.max(0, daysAhead)), [daysAhead]);

  const planningHint = useMemo(() => {
    if (daysAhead <= 7) {
      return "Best window for go or no-go planning.";
    }
    if (daysAhead <= 15) {
      return "Forecast still available, but confidence is lower than 3 to 7 days.";
    }
    return "Beyond 15 days uses 2-year weather context guidance, not day-level forecast.";
  }, [daysAhead]);

  const metricGuides = useMemo(() => {
    if (!result?.metrics) {
      return null;
    }

    return {
      rainChance: rainChanceTone(result.metrics.precipitationProbability),
      rainAmount: rainAmountTone(result.metrics.precipitationSum),
      wind: windTone(result.metrics.windSpeedMax),
      feelsLike: feelsLikeTone(result.metrics.apparentTemperatureMax),
    };
  }, [result]);

  const rainGuidance = useMemo(() => (result ? rainOutlookTone(result) : null), [result]);
  const historyGuidance = useMemo(
    () => (result ? historyContextTone(result.history.targetMonthWetDayChance) : null),
    [result],
  );

  const onCheck = useCallback(
    async (dateToCheck = date, options?: { scrollToResults?: boolean }) => {
      if (options?.scrollToResults !== false) {
        requestAnimationFrame(() => {
          const anchor = resultsAnchorRef.current;
          if (anchor && typeof anchor.scrollIntoView === "function") {
            anchor.scrollIntoView({ behavior: resultScrollBehavior(), block: "start" });
          }
        });
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/weather/check?lat=${lat}&lon=${lon}&date=${dateToCheck}`);
        const data = (await response.json()) as WeatherCheckResult | { error: string };

        if (!response.ok) {
          const message = "error" in data ? data.error : "Unable to check weather right now.";
          throw new Error(message);
        }

        const parsed = data as WeatherCheckResult;
        setResult(parsed);
        const decisionLabel = parsed.recommendation ?? "Planning guidance";
        setAnnounceMessage(
          `${decisionLabel}. Forecast trust ${parsed.reliability.estimatedAccuracy} percent for ${parsed.date}.`,
        );
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Unable to check weather right now.";
        setError(message);
        setResult(null);
        setAnnounceMessage(message);
      } finally {
        setLoading(false);
      }
    },
    [date, lat, lon],
  );

  useEffect(() => {
    if (initialDate && isValidDate(initialDate) && appliedInitialDateRef.current !== initialDate) {
      appliedInitialDateRef.current = initialDate;
      setDate(initialDate);
      void onCheck(initialDate, { scrollToResults: false });
    }
  }, [initialDate, onCheck]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announceMessage}
      </p>

      <div className="bg-gradient-to-br from-slate-900 via-sky-900 to-teal-800 px-4 py-5 text-white sm:px-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100">Weather Check</p>
        <h2 className="mt-2 text-lg font-semibold">Check if your hiking date looks good</h2>
        <p className="mt-1 text-sm text-cyan-50/90">
          Result shows hiking recommendation, forecast trust, and simple risk cards for rain, wind, and feels-like.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label htmlFor="hike-date" className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Hiking Date
                </label>
                <p className="mt-1 text-xs text-slate-500">Pick one date to check. Forecast is day-specific up to 15 days.</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {selectedReliability.estimatedAccuracy}% trust
              </span>
            </div>
            <input
              id="hike-date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              type="date"
              min={todayIso}
              className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none ring-sky-300 focus:ring focus-visible:ring-2"
            />
            <p className="mt-2 text-xs text-slate-600">{planningHint}</p>
            <p className="mt-1 text-xs text-slate-500">You can still choose farther dates, but those use month history guidance instead of day-level forecast.</p>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => void onCheck()}
            disabled={loading}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
          >
            {loading ? "Checking weather..." : "Check hiking day"}
          </button>
        </div>

        {error ? <p className="mt-3 rounded-2xl bg-rose-50 px-3 py-3 text-sm text-rose-700">{error}</p> : null}
        <div ref={resultsAnchorRef} />

        {loading ? (
          <LoadingResultsSkeleton />
        ) : result ? (
          <div className="mt-4 space-y-3" aria-live="polite" aria-atomic="true">
            <article className={`rounded-3xl border p-4 sm:p-5 ${resultTone(result)}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Primary decision</p>
                  <p className="mt-2 text-sm font-medium text-slate-600">{formatReadableDate(result.date)}</p>
                  <h3 className="mt-2 text-xl font-semibold">{resultHeading(result)}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{resultMessage(result)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {result.recommendation ? (
                    <RecommendationPill value={result.recommendation} />
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Planning guidance
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Why this result</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {compactReasons(result).map((reason) => (
                  <span key={reason} className="rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-700">
                    {reason}
                  </span>
                ))}
              </div>
            </article>

            {result.metrics && metricGuides ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Weather diagnostics</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <article className={`rounded-2xl border px-3 py-3 ${metricGuides.rainChance.cardClassName}`}>
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Rain chance</p>
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${metricGuides.rainChance.pillClassName}`}>
                        {metricGuides.rainChance.label}
                      </span>
                    </div>
                    <p className={`mt-2 text-lg font-semibold ${metricGuides.rainChance.valueClassName}`}>
                      {result.metrics.precipitationProbability}%
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{metricGuides.rainChance.detail}</p>
                  </article>

                  <article className={`rounded-2xl border px-3 py-3 ${metricGuides.rainAmount.cardClassName}`}>
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Rain (mm)</p>
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${metricGuides.rainAmount.pillClassName}`}>
                        {metricGuides.rainAmount.label}
                      </span>
                    </div>
                    <p className={`mt-2 text-lg font-semibold ${metricGuides.rainAmount.valueClassName}`}>
                      {result.metrics.precipitationSum} mm
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{metricGuides.rainAmount.detail}</p>
                  </article>

                  <article className={`rounded-2xl border px-3 py-3 ${metricGuides.wind.cardClassName}`}>
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Wind</p>
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${metricGuides.wind.pillClassName}`}>
                        {metricGuides.wind.label}
                      </span>
                    </div>
                    <p className={`mt-2 text-lg font-semibold ${metricGuides.wind.valueClassName}`}>
                      {result.metrics.windSpeedMax} km/h
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{metricGuides.wind.detail}</p>
                  </article>

                  <article className={`rounded-2xl border px-3 py-3 ${metricGuides.feelsLike.cardClassName}`}>
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Feels like</p>
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-[11px] font-semibold leading-none ${metricGuides.feelsLike.pillClassName}`}>
                        {metricGuides.feelsLike.label}
                      </span>
                    </div>
                    <p className={`mt-2 text-lg font-semibold ${metricGuides.feelsLike.valueClassName}`}>
                      {result.metrics.apparentTemperatureMax} °C
                    </p>
                    <p className="mt-1 text-xs text-slate-600">{metricGuides.feelsLike.detail}</p>
                  </article>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-amber-950">Long-range planning mode</p>
                </div>
                <p className="mt-2 text-sm text-amber-900">
                  Planning guidance only. Recheck closer to the date for a day-level forecast.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/70 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-amber-700">Month wet chance</p>
                    <p className="mt-1 text-base font-semibold text-amber-950">{result.climate?.wetDayChance ?? 0}%</p>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-amber-700">2-year month rain</p>
                    <p className="mt-1 text-base font-semibold text-amber-950">{result.history.targetMonthAvgPrecipitation} mm</p>
                  </div>
                </div>
              </section>
            )}

            <article className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">How reliable</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${forecastTrustTone(result)}`}>
                  {forecastTrustLabel(result)}
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-900">{result.reliability.estimatedAccuracy}% forecast trust</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{reliabilityPlainLanguage(result)}</p>
            </article>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <button
                type="button"
                onClick={() => setShowMoreDetails((current) => !current)}
                aria-expanded={showMoreDetails}
                className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
              >
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">More details</p>
                  <p className="mt-1 text-xs text-slate-600">Selected-date rain view and month history context</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                  {showMoreDetails ? "Hide" : "Show"}
                </span>
              </button>

              {showMoreDetails ? (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <article className={`rounded-2xl border px-3 py-3 ${rainGuidance?.containerClassName ?? "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">Selected-date rain forecast</p>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${rainGuidance?.chipClassName ?? "bg-slate-100 text-slate-700"}`}>
                        {rainGuidance?.label ?? "No data"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{rainGuidance?.valueText ?? "Unavailable"}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-700">{rainGuidance?.detail ?? "Rain guidance is unavailable right now."}</p>
                  </article>

                  <article className={`rounded-2xl border px-3 py-3 ${historyGuidance?.containerClassName ?? "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">2-year month history</p>
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${historyGuidance?.chipClassName ?? "bg-slate-100 text-slate-700"}`}>
                        {historyGuidance?.label ?? "No data"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{historyGuidance?.valueText ?? "Unavailable"}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-700">{historyGuidance?.detail ?? historySummary(result)}</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">{historySummary(result)}</p>
                  </article>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
