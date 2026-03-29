import type { HikeWindowRainMetrics, WeatherCheckDetails } from "@/types/hiking";

import { isValidDate } from "@/lib/date";

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

export function historySummary(details: WeatherCheckDetails): string {
  if (details.history.targetMonthWetDayChance >= 55) {
    return "Over the last 2 years, this month was often wet.";
  }

  if (details.history.targetMonthWetDayChance >= 35) {
    return "Over the last 2 years, this month had mixed wet and dry days.";
  }

  return "Over the last 2 years, this month was mostly drier.";
}

export function formatWindowRainValue(
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

export function formatRainValueCompact(metrics: HikeWindowRainMetrics | null | undefined): string {
  if (!metrics) {
    return "Unavailable";
  }

  return `${metrics.precipitationProbability}% chance, ${metrics.precipitationSum} mm`;
}

export function rainAmountLabel(value: number): string {
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
