import type { HistoryCrosscheck, HikeWindowRainMetrics, WeatherCheckDetails } from "@/types/hiking";

import { isValidDate } from "@/lib/date";
import { SECONDARY_PROVIDER_MAX_DAYS } from "@/lib/weather/service";

export function hasSecondaryForecastData(details: WeatherCheckDetails, daysAhead: number): boolean {
  return daysAhead <= SECONDARY_PROVIDER_MAX_DAYS && details.consensus.secondaryMetrics !== null;
}

export function shouldExplainSecondaryUnavailable(details: WeatherCheckDetails, daysAhead: number): boolean {
  return daysAhead <= SECONDARY_PROVIDER_MAX_DAYS && !hasSecondaryForecastData(details, daysAhead);
}

export function secondOpinionSubtitle(daysAhead: number, details: WeatherCheckDetails | null): string {
  if (details && hasSecondaryForecastData(details, daysAhead)) {
    return `${details.consensus.secondaryProvider} check plus rain history for this date.`;
  }

  if (details && daysAhead <= SECONDARY_PROVIDER_MAX_DAYS) {
    if (!details.consensus.secondaryAvailable) {
      return "Rain history for this date. Extra forecast check is not configured.";
    }

    if (!details.consensus.secondaryMetrics) {
      return "Rain history for this date. Extra forecast check is temporarily unavailable.";
    }
  }

  if (daysAhead <= SECONDARY_PROVIDER_MAX_DAYS) {
    return "Past rainfall on this date, plus an extra forecast check when available.";
  }

  return "Past rainfall on this calendar date over the last 2 years.";
}

export function formatReadableDate(value: string): string {
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

export function normalizeHistoryCrosscheck(history: HistoryCrosscheck): HistoryCrosscheck {
  return {
    ...history,
    targetDateSnapshots: history.targetDateSnapshots ?? [],
  };
}

export function formatCalendarDayLabel(value: string): string {
  if (!isValidDate(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${value}T00:00:00`));
}

export function historySnapshotTone(precipitationSum: number, wasWet: boolean): {
  cardClassName: string;
  pillClassName: string;
  valueClassName: string;
  label: string;
} {
  if (wasWet || precipitationSum >= 1) {
    if (precipitationSum >= 8) {
      return {
        cardClassName: "border-sky-200 bg-sky-50",
        pillClassName: "bg-sky-100 text-sky-800",
        valueClassName: "text-sky-950",
        label: "Wet",
      };
    }

    return {
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      label: "Wet",
    };
  }

  return {
    cardClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-950",
    label: "Dry",
  };
}

export function historySummaryFromCrosscheck(history: HistoryCrosscheck): string {
  if (history.targetMonthWetDayChance >= 55) {
    return "Over the last 2 years, this month was often wet.";
  }

  if (history.targetMonthWetDayChance >= 35) {
    return "Over the last 2 years, this month had mixed wet and dry days.";
  }

  return "Over the last 2 years, this month was mostly drier.";
}

export function historySummary(details: WeatherCheckDetails): string {
  return historySummaryFromCrosscheck(details.history);
}

export function getRainChanceGuidance(value: number): { label: string; detail: string } {
  if (value >= 90) {
    return { label: "Very high", detail: "Rain expected" };
  }

  if (value >= 70) {
    return { label: "High", detail: "Rain likely" };
  }

  if (value >= 35) {
    return { label: "Medium", detail: "Showers possible" };
  }

  return { label: "Low", detail: "Rain unlikely" };
}

export function formatGaugeRating(segments: number): string {
  return `${segments}/5`;
}

export function secondaryOpinionHeadline(consensus: WeatherCheckDetails["consensus"]): string | null {
  const { secondaryRecommendation, agreement } = consensus;

  if (!secondaryRecommendation) {
    return null;
  }

  if (agreement === "aligned") {
    return `${secondaryRecommendation} — matches main forecast`;
  }

  if (agreement === "mixed") {
    return `${secondaryRecommendation} — differs from main forecast`;
  }

  return secondaryRecommendation;
}

export function formatMainForecastCompare(metrics: HikeWindowRainMetrics | null | undefined): string {
  if (!metrics) {
    return "Main forecast unavailable";
  }

  const impact = getTrailRainImpact(metrics.precipitationSum);

  return `Main forecast: ${impact.label} · ${metrics.precipitationProbability}% chance · ${formatRainAmountDetail(metrics.precipitationSum)}`;
}

export function formatWindowRainValue(
  metrics: HikeWindowRainMetrics | null | undefined,
  fallback?: { precipitationProbability: number; precipitationSum: number } | null,
): string {
  if (!metrics) {
    if (fallback) {
      const impact = getTrailRainImpact(fallback.precipitationSum);
      return `${impact.label} · ${fallback.precipitationProbability}% chance · ${formatRainAmountDetail(fallback.precipitationSum)}`;
    }

    return "Window rain unavailable";
  }

  const impact = getTrailRainImpact(metrics.precipitationSum);

  return `${metrics.label}: ${impact.label} · ${metrics.precipitationProbability}% chance · ${formatRainAmountDetail(metrics.precipitationSum)}`;
}

export function formatRainValueCompact(metrics: HikeWindowRainMetrics | null | undefined): string {
  if (!metrics) {
    return "Unavailable";
  }

  const impact = getTrailRainImpact(metrics.precipitationSum);

  return `${impact.label} · ${metrics.precipitationProbability}% chance · ${formatRainAmountDetail(metrics.precipitationSum)}`;
}

export function rainAmountLabel(value: number): string {
  return getTrailRainImpact(value).shortLabel;
}

export type TrailRainImpact = {
  label: string;
  shortLabel: string;
  detail: string;
  gaugeSegments: number;
  cardClassName: string;
  pillClassName: string;
  valueClassName: string;
  barClassName: string;
};

export function getTrailRainImpact(valueMm: number): TrailRainImpact {
  if (valueMm <= 0) {
    return {
      label: "Dry",
      shortLabel: "None",
      detail: "",
      gaugeSegments: 0,
      cardClassName: "border-emerald-200 bg-emerald-50",
      pillClassName: "bg-emerald-100 text-emerald-800",
      valueClassName: "text-emerald-950",
      barClassName: "bg-emerald-500",
    };
  }

  if (valueMm < 1) {
    return {
      label: "Damp",
      shortLabel: "Light",
      detail: "",
      gaugeSegments: 1,
      cardClassName: "border-emerald-200 bg-emerald-50",
      pillClassName: "bg-emerald-100 text-emerald-800",
      valueClassName: "text-emerald-950",
      barClassName: "bg-emerald-500",
    };
  }

  if (valueMm < 3) {
    return {
      label: "Wet",
      shortLabel: "Moderate",
      detail: "",
      gaugeSegments: 2,
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      barClassName: "bg-amber-500",
    };
  }

  if (valueMm < 8) {
    return {
      label: "Muddy",
      shortLabel: "Moderate",
      detail: "",
      gaugeSegments: 3,
      cardClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      barClassName: "bg-amber-500",
    };
  }

  if (valueMm < 12) {
    return {
      label: "Heavy",
      shortLabel: "Heavy",
      detail: "",
      gaugeSegments: 4,
      cardClassName: "border-sky-200 bg-sky-50",
      pillClassName: "bg-sky-100 text-sky-800",
      valueClassName: "text-sky-950",
      barClassName: "bg-sky-600",
    };
  }

  return {
    label: "Washout",
    shortLabel: "Heavy",
    detail: "",
    gaugeSegments: 5,
    cardClassName: "border-sky-200 bg-sky-50",
    pillClassName: "bg-sky-100 text-sky-800",
    valueClassName: "text-sky-950",
    barClassName: "bg-sky-600",
  };
}

export function formatRainAmountDetail(valueMm: number): string {
  if (valueMm <= 0) {
    return "0 mm";
  }

  return `${valueMm} mm`;
}
