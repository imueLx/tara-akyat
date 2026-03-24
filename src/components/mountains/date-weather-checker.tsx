"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RecommendationPill } from "@/components/mountains/recommendation-pill";
import { addDays, differenceInDays, formatISODate, isValidDate } from "@/lib/date";
import { getWeatherClientCache, setWeatherClientCache } from "@/lib/weather/client-cache";
import { getSelectedReliability } from "@/lib/weather/reliability";
import type { HikeWindowRainMetrics, WeatherCheckDetails, WeatherCheckResult } from "@/types/hiking";

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
    return "Planning outlook";
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
    return "Outside forecast range. Use this as planning guidance.";
  }

  if (result.recommendation === "Good") {
    return "Conditions look good for most hikers.";
  }

  if (result.recommendation === "Caution") {
    return "Conditions are mixed. Plan extra caution.";
  }

  return "Risk looks high. Postponing is safer.";
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

function historySummary(details: WeatherCheckDetails): string {
  if (details.history.targetMonthWetDayChance >= 55) {
    return "Over the last 2 years, this month was often wet.";
  }

  if (details.history.targetMonthWetDayChance >= 35) {
    return "Over the last 2 years, this month had mixed wet and dry days.";
  }

  return "Over the last 2 years, this month was mostly drier.";
}

function formatWindowRainValue(
  metrics: HikeWindowRainMetrics | null | undefined,
  fallback?: { precipitationProbability: number; precipitationSum: number } | null,
): string {
  if (!metrics) {
    if (fallback) {
      return `${fallback.precipitationProbability}% chance, ${fallback.precipitationSum} mm`;
    }

    return "Window rain unavailable";
  }

  return `${metrics.label}: ${metrics.precipitationProbability}% chance, ${metrics.precipitationSum} mm`;
}

function formatRainValueCompact(metrics: HikeWindowRainMetrics | null | undefined): string {
  if (!metrics) {
    return "Unavailable";
  }

  return `${metrics.precipitationProbability}% chance, ${metrics.precipitationSum} mm`;
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
      detail: "Less rain likely",
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
      detail: "Rain possible",
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-900",
    };
  }

  return {
    label: "Light",
    detail: "Light rain",
    cardClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-900",
  };
}

function rainAmountLabel(value: number): string {
  if (value <= 0) {
    return "None";
  }

  if (value >= 8) {
    return "Heavy";
  }

  if (value >= 2) {
    return "Moderate";
  }

  return "Light";
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
      detail: "Light wind",
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
      detail: "Comfortable",
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

function historyContextTone(wetDayChance: number): GuidanceTone {
  if (wetDayChance >= 55) {
    return {
      containerClassName: "border-sky-200 bg-sky-50",
      chipClassName: "border border-sky-100 bg-sky-50 text-sky-700",
      label: "Wet",
      detail: "Past 2 years.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  if (wetDayChance >= 35) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "border border-amber-100 bg-amber-50 text-amber-700",
      label: "Mixed",
      detail: "Past 2 years.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "border border-emerald-100 bg-emerald-50 text-emerald-700",
    label: "Drier",
    detail: "Past 2 years.",
    valueText: `${wetDayChance}% wet days`,
  };
}

function secondaryForecastTone(details: WeatherCheckDetails): GuidanceTone {
  const secondaryWindow = details.consensus.secondaryHikeWindowRain;
  const secondaryMetrics = secondaryWindow ?? details.consensus.secondaryMetrics;

  if (!secondaryMetrics) {
    return {
      containerClassName: "border-slate-200 bg-white",
      chipClassName: "bg-slate-100 text-slate-700",
      label: "Unavailable",
      detail: details.consensus.note,
      valueText: details.consensus.secondaryAvailable ? "No secondary weather detail" : "Secondary provider not connected",
    };
  }

  const rainChance = secondaryMetrics.precipitationProbability;
  const rainMm = secondaryMetrics.precipitationSum;

  if (rainChance >= 70 || rainMm >= 8) {
    return {
      containerClassName: "border-sky-200 bg-sky-50",
      chipClassName: "border border-sky-100 bg-sky-50 text-sky-700",
      label: "Wet",
      detail: secondaryWindow ? "Second provider, hiking hours." : "Second provider.",
      valueText: formatWindowRainValue(secondaryWindow, details.consensus.secondaryMetrics),
    };
  }

  if (rainChance >= 35 || rainMm >= 2) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "border border-amber-100 bg-amber-50 text-amber-700",
      label: "Mixed",
      detail: secondaryWindow ? "Second provider, hiking hours." : "Second provider.",
      valueText: formatWindowRainValue(secondaryWindow, details.consensus.secondaryMetrics),
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "border border-emerald-100 bg-emerald-50 text-emerald-700",
    label: "Dry",
    detail: secondaryWindow ? "Second provider, hiking hours." : "Second provider.",
    valueText: formatWindowRainValue(secondaryWindow, details.consensus.secondaryMetrics),
  };
}

function DetailsSkeleton() {
  return (
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2" role="status" aria-live="polite" aria-label="Loading more weather details">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`detail-skeleton-${index}`} className="animate-pulse rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <div className="h-3 w-28 rounded-full bg-slate-200" />
          <div className="mt-3 h-5 w-32 rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-10/12 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
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
  const [details, setDetails] = useState<WeatherCheckDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
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
    if (daysAhead <= 30) {
      return "Days 16 to 30 use month-based planning outlook, not exact day-level forecast.";
    }
    return "Beyond 30 days uses the same calendar date from the last 2 years plus month context for planning.";
  }, [daysAhead]);

  const metricGuides = useMemo(() => {
    if (!result?.metrics) {
      return null;
    }

    const rainChanceValue = result.hikeWindowRain?.precipitationProbability ?? result.metrics.precipitationProbability;
    const rainAmountValue = result.hikeWindowRain?.precipitationSum ?? result.metrics.precipitationSum;

    return {
      rainChance: rainChanceTone(rainChanceValue),
      rainAmount: rainAmountTone(rainAmountValue),
      wind: windTone(result.metrics.windSpeedMax),
      feelsLike: feelsLikeTone(result.metrics.apparentTemperatureMax),
    };
  }, [result]);

  const secondaryGuidance = useMemo(() => (details ? secondaryForecastTone(details) : null), [details]);
  const historyGuidance = useMemo(
    () => (details ? historyContextTone(details.history.targetMonthWetDayChance) : null),
    [details],
  );
  const detailsDaysAhead = useMemo(() => {
    if (!details) {
      return null;
    }

    return differenceInDays(new Date(`${details.date}T00:00:00`), new Date(`${todayIso}T00:00:00`));
  }, [details, todayIso]);
  const shouldShowSecondaryForecastCard = detailsDaysAhead !== null && detailsDaysAhead <= 7;

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
      setDetails(null);
      setDetailsError(null);
      setShowMoreDetails(false);

      try {
        const cacheParts = [lat, lon, dateToCheck];
        const cachedResult = getWeatherClientCache<WeatherCheckResult>("check", cacheParts);

        if (cachedResult) {
          setResult(cachedResult);
          const decisionLabel = cachedResult.recommendation ?? "Planning outlook";
          setAnnounceMessage(
            `${decisionLabel}. Forecast trust ${cachedResult.reliability.estimatedAccuracy} percent for ${cachedResult.date}.`,
          );
          return;
        }

        const response = await fetch(`/api/weather/check?lat=${lat}&lon=${lon}&date=${dateToCheck}`);
        const data = (await response.json()) as WeatherCheckResult | { error: string };

        if (!response.ok) {
          const message = "error" in data ? data.error : "Unable to check weather right now.";
          throw new Error(message);
        }

        const parsed = data as WeatherCheckResult;
        setWeatherClientCache("check", cacheParts, parsed);
        setResult(parsed);
        const decisionLabel = parsed.recommendation ?? "Planning outlook";
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

  const loadMoreDetails = useCallback(async () => {
    if (!result || detailsLoading || details) {
      return;
    }

    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const cacheParts = [lat, lon, result.date];
      const cachedDetails = getWeatherClientCache<WeatherCheckDetails>("details", cacheParts);

      if (cachedDetails) {
        setDetails(cachedDetails);
        return;
      }

      const response = await fetch(`/api/weather/check/details?lat=${lat}&lon=${lon}&date=${result.date}`);
      const data = (await response.json()) as WeatherCheckDetails | { error: string };

      if (!response.ok) {
        const message = "error" in data ? data.error : "Unable to load more details right now.";
        throw new Error(message);
      }

      const parsed = data as WeatherCheckDetails;
      setWeatherClientCache("details", cacheParts, parsed);
      setDetails(parsed);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load more details right now.";
      setDetailsError(message);
    } finally {
      setDetailsLoading(false);
    }
  }, [details, detailsLoading, lat, lon, result]);

  const onToggleMoreDetails = useCallback(() => {
    const nextOpen = !showMoreDetails;
    setShowMoreDetails(nextOpen);

    if (nextOpen) {
      void loadMoreDetails();
    }
  }, [loadMoreDetails, showMoreDetails]);

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
                <label htmlFor="hike-date" className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  Hiking Date
                </label>
                <p className="mt-1 text-xs text-slate-500">Exact forecast is day-specific up to 15 days. Longer-range dates use planning outlook and recent history.</p>
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
            <p className="mt-1 text-xs text-slate-500">After 15 days, the app switches from day-level forecast to planning outlook. Beyond 30 days, it leans on the same calendar date and month history from the last 2 years.</p>
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
                      Planning outlook
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
                      {result.hikeWindowRain?.precipitationProbability ?? result.metrics.precipitationProbability}%
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
                      {result.hikeWindowRain?.precipitationSum ?? result.metrics.precipitationSum} mm
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
                  <p className="text-sm font-semibold text-amber-950">Planning outlook mode</p>
                </div>
                <p className="mt-2 text-sm text-amber-900">
                  Planning outlook only. Recheck closer to the date for a day-level forecast.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/70 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-amber-700">Month wet pattern</p>
                    <p className="mt-1 text-base font-semibold text-amber-950">{result.climate?.wetDayChance ?? 0}%</p>
                    <p className="mt-1 text-[11px] leading-5 text-amber-800">How often days in this month were wet in the last 2 years.</p>
                  </div>
                  <div className="rounded-xl bg-white/70 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-amber-700">Typical daily rain</p>
                    <p className="mt-1 text-base font-semibold text-amber-950">
                      {result.climate?.avgPrecipitation ?? 0} mm • {rainAmountLabel(result.climate?.avgPrecipitation ?? 0)}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-amber-800">Month-based planning outlook. Open Cross-checks for the recent-history breakdown.</p>
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

            <section className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <button
                type="button"
                onClick={onToggleMoreDetails}
                aria-expanded={showMoreDetails}
                className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3.5 16.5h13" />
                        <path d="M6 13V9.5M10 13V6.5M14 13V8" />
                      </svg>
                    </span>
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Cross-checks</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-950">Forecast cross-checks</p>
                  <p className="mt-1 text-xs text-slate-600">Second forecast and 2-year rain history.</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                  {showMoreDetails ? "Hide" : "Show"}
                </span>
              </button>

              {showMoreDetails ? detailsLoading ? (
                <DetailsSkeleton />
              ) : detailsError ? (
                <p className="mt-3 rounded-2xl bg-rose-50 px-3 py-3 text-sm text-rose-700">{detailsError}</p>
              ) : details ? (
                <div className={`mt-3 grid grid-cols-1 gap-2 ${shouldShowSecondaryForecastCard ? "sm:grid-cols-2" : ""}`}>
                  {shouldShowSecondaryForecastCard ? (
                    <article className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                      <div className="mb-3 h-px bg-[linear-gradient(90deg,rgba(14,165,233,0.18),rgba(148,163,184,0))]" />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900">Forecast cross-check</p>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${secondaryGuidance?.chipClassName ?? "bg-slate-100 text-slate-700"}`}>
                          {secondaryGuidance?.label ?? "No data"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {details.consensus.secondaryRecommendation
                          ? `${details.consensus.secondaryRecommendation} from the second forecast`
                          : "Second forecast details"}
                      </p>
                      <p className="mt-1 break-words text-xs leading-5 text-slate-700">
                        {details.consensus.secondaryHikeWindowRain
                          ? `Rain summary for the ${details.consensus.secondaryHikeWindowRain.label} hiking window.`
                          : "Rain summary from the second provider for this date."}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-white/90 bg-white/80 px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Rain chance</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {details.consensus.secondaryHikeWindowRain?.precipitationProbability ?? details.consensus.secondaryMetrics?.precipitationProbability ?? "--"}%
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/90 bg-white/80 px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Rain amount</p>
                          <div className="mt-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {details.consensus.secondaryHikeWindowRain?.precipitationSum ?? details.consensus.secondaryMetrics?.precipitationSum ?? "--"}
                              {typeof (details.consensus.secondaryHikeWindowRain?.precipitationSum ?? details.consensus.secondaryMetrics?.precipitationSum) === "number" ? " mm" : ""}
                            </p>
                            {typeof (details.consensus.secondaryHikeWindowRain?.precipitationSum ?? details.consensus.secondaryMetrics?.precipitationSum) === "number" ? (
                              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                                {rainAmountLabel(details.consensus.secondaryHikeWindowRain?.precipitationSum ?? details.consensus.secondaryMetrics?.precipitationSum ?? 0)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {details.consensus.primaryHikeWindowRain
                          ? `Main forecast: ${formatRainValueCompact(details.consensus.primaryHikeWindowRain)}`
                          : secondaryGuidance?.valueText ?? "Unavailable"}
                      </p>
                    </article>
                  ) : null}

                  <article className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fcfcfb_100%)] px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                    <div className="mb-3 h-px bg-[linear-gradient(90deg,rgba(245,158,11,0.22),rgba(148,163,184,0))]" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">2-year history</p>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {historyGuidance?.label ?? "No data"}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-700">
                        Based on rainfall from the past 2 years.
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/90 bg-white/80 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Same date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{details.history.targetDateWetDayChance}% wet days</p>
                      </div>
                      <div className="rounded-xl border border-white/90 bg-white/80 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Avg rain</p>
                        <div className="mt-1">
                          <p className="text-sm font-semibold text-slate-900">{details.history.targetDateAvgPrecipitation} mm</p>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                            {rainAmountLabel(details.history.targetDateAvgPrecipitation)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-base font-semibold text-slate-900">{historyGuidance?.valueText ?? "Unavailable"}</p>
                    <p className="mt-1 break-words text-[11px] leading-5 text-slate-500">{historySummary(details)}</p>
                  </article>
                </div>
              ) : null : null}
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}
