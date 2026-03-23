import { unstable_cache } from "next/cache";

import { differenceInDays, formatISODate, isValidDate } from "@/lib/date";
import { fetchBestDaysForecast, fetchClimateGuidance, fetchForecastRange, fetchTwoYearHistoryCrosscheck } from "@/lib/weather/open-meteo";
import { buildReliabilityMessage, getSelectedReliability, RELIABILITY_TIERS } from "@/lib/weather/reliability";
import { confidenceFromDaysAhead, scoreDay } from "@/lib/weather/scoring";
import { fetchVisualCrossingDay, hasVisualCrossingKey } from "@/lib/weather/visual-crossing";
import type { ScoredDay, WeatherCheckDetails, WeatherCheckResult } from "@/types/hiking";

export const MAX_FORECAST_DAYS = 15;
export const PRIMARY_DAYS = 7;
export const SECONDARY_PROVIDER_MAX_DAYS = 7;
export const MAX_PLANNING_DAYS = 30;
const WEATHER_CHECK_REVALIDATE_SECONDS = 3600;
const WEATHER_DETAILS_REVALIDATE_SECONDS = 3600;
const BEST_DAYS_REVALIDATE_SECONDS = 1800;

function normalizeCoordinate(value: number): string {
  return value.toFixed(3);
}

function shouldBypassAppCache(): boolean {
  return process.env.NODE_ENV === "test";
}

export function parseCoordinates(latValue: string | null, lonValue: string | null): { lat: number; lon: number } | null {
  if (!latValue || !lonValue) {
    return null;
  }

  const lat = Number(latValue);
  const lon = Number(lonValue);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  return { lat, lon };
}

async function getCheckResultUncached(lat: number, lon: number, date: string): Promise<WeatherCheckResult> {
  if (!isValidDate(date)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  const today = new Date(`${formatISODate(new Date())}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  const daysAhead = differenceInDays(target, today);

  if (daysAhead < 0) {
    throw new Error("Please select today or a future date.");
  }

  if (daysAhead > MAX_FORECAST_DAYS) {
    const climate = await fetchClimateGuidance(lat, lon, date);
    const selected = getSelectedReliability(daysAhead);

    return {
      date,
      mode: "climate",
      recommendation: null,
      actionable: false,
      confidence: "low",
      reasons: [
        "Date is outside reliable daily forecast range.",
        daysAhead <= MAX_PLANNING_DAYS
          ? "Use this as planning outlook only and recheck within 7 days."
          : "Use same-date history and month context for long-range planning, then recheck closer to hike day.",
      ],
      metrics: null,
      climate,
      reliability: {
        selectedLabel: selected.label,
        selectedDays: selected.days,
        estimatedAccuracy: selected.estimatedAccuracy,
        guidance: buildReliabilityMessage(daysAhead),
        tiers: RELIABILITY_TIERS,
      },
    };
  }

  const range = await fetchForecastRange(lat, lon, date, date);
  const dayMetrics = range.get(date);

  if (!dayMetrics) {
    throw new Error("Forecast data unavailable for this date.");
  }

  const scored = scoreDay(date, dayMetrics);
  const confidence = confidenceFromDaysAhead(daysAhead);
  const reasons = [...scored.reasons];

  if (daysAhead > PRIMARY_DAYS) {
    reasons.push("Forecast confidence is lower beyond the next 7 days.");
  }
  const selected = getSelectedReliability(daysAhead);

  return {
    date,
    mode: "forecast",
    recommendation: scored.recommendation,
    actionable: true,
    confidence,
    reasons,
    metrics: scored.metrics,
    climate: null,
    reliability: {
      selectedLabel: selected.label,
      selectedDays: selected.days,
      estimatedAccuracy: selected.estimatedAccuracy,
      guidance: buildReliabilityMessage(daysAhead),
      tiers: RELIABILITY_TIERS,
    },
  };
}

export async function getCheckResult(lat: number, lon: number, date: string): Promise<WeatherCheckResult> {
  if (shouldBypassAppCache()) {
    return getCheckResultUncached(lat, lon, date);
  }

  const latKey = normalizeCoordinate(lat);
  const lonKey = normalizeCoordinate(lon);

  return unstable_cache(
    async () => getCheckResultUncached(lat, lon, date),
    ["weather-check", latKey, lonKey, date],
    { revalidate: WEATHER_CHECK_REVALIDATE_SECONDS },
  )();
}

async function getCheckDetailsUncached(lat: number, lon: number, date: string): Promise<WeatherCheckDetails> {
  if (!isValidDate(date)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  const today = new Date(`${formatISODate(new Date())}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  const daysAhead = differenceInDays(target, today);

  if (daysAhead < 0) {
    throw new Error("Please select today or a future date.");
  }

  const history = await fetchTwoYearHistoryCrosscheck(lat, lon, date);
  const hasSecondaryProvider = hasVisualCrossingKey();

  let consensus: WeatherCheckDetails["consensus"] = {
    primaryProvider: "Open-Meteo",
    secondaryProvider: "Visual Crossing",
    secondaryAvailable: hasSecondaryProvider,
    secondaryRecommendation: null,
    secondaryMetrics: null,
    agreement: "unavailable",
    note: hasSecondaryProvider
      ? daysAhead <= SECONDARY_PROVIDER_MAX_DAYS
        ? "Secondary provider check is temporarily unavailable."
        : "Secondary provider check is skipped beyond 7 days to conserve free-tier quota."
      : "Set VISUAL_CROSSING_API_KEY to enable secondary forecast consensus.",
  };

  if (daysAhead <= SECONDARY_PROVIDER_MAX_DAYS) {
    const secondaryMetrics = hasSecondaryProvider
      ? await fetchVisualCrossingDay(lat, lon, date).catch(() => null)
      : null;

    if (secondaryMetrics) {
      const [primaryRange] = await Promise.all([
        fetchForecastRange(lat, lon, date, date),
      ]);
      const primaryMetrics = primaryRange.get(date);

      if (!primaryMetrics) {
        throw new Error("Forecast data unavailable for this date.");
      }

      const primaryScored = scoreDay(date, primaryMetrics);
      const secondaryScored = scoreDay(date, secondaryMetrics);
      const aligned = secondaryScored.recommendation === primaryScored.recommendation;

      consensus = {
        primaryProvider: "Open-Meteo",
        secondaryProvider: "Visual Crossing",
        secondaryAvailable: true,
        secondaryRecommendation: secondaryScored.recommendation,
        secondaryMetrics,
        agreement: aligned ? "aligned" : "mixed",
        note: aligned
          ? "Another forecast source points to the same hiking result."
          : "Another forecast source points to a different result. Recheck closer to hike day.",
      };
    }
  }

  return {
    date,
    mode: daysAhead > MAX_FORECAST_DAYS ? "climate" : "forecast",
    history,
    consensus,
  };
}

export async function getCheckDetails(lat: number, lon: number, date: string): Promise<WeatherCheckDetails> {
  if (shouldBypassAppCache()) {
    return getCheckDetailsUncached(lat, lon, date);
  }

  const latKey = normalizeCoordinate(lat);
  const lonKey = normalizeCoordinate(lon);

  return unstable_cache(
    async () => getCheckDetailsUncached(lat, lon, date),
    ["weather-check-details", latKey, lonKey, date],
    { revalidate: WEATHER_DETAILS_REVALIDATE_SECONDS },
  )();
}

async function getBestDaysUncached(lat: number, lon: number, days = PRIMARY_DAYS): Promise<{
  windowDays: number;
  days: ScoredDay[];
  recommended: ScoredDay[];
}> {
  const safeDays = Math.min(Math.max(1, days), PRIMARY_DAYS);
  const forecast = await fetchBestDaysForecast(lat, lon, safeDays);

  const scored = Array.from(forecast.entries())
    .map(([date, metrics]) => scoreDay(date, metrics))
    .sort((a, b) => b.score - a.score);

  const recommended = scored.filter((day) => day.recommendation === "Good").slice(0, 2);

  return {
    windowDays: safeDays,
    days: scored,
    recommended,
  };
}

export async function getBestDays(lat: number, lon: number, days = PRIMARY_DAYS): Promise<{
  windowDays: number;
  days: ScoredDay[];
  recommended: ScoredDay[];
}> {
  if (shouldBypassAppCache()) {
    return getBestDaysUncached(lat, lon, days);
  }

  const latKey = normalizeCoordinate(lat);
  const lonKey = normalizeCoordinate(lon);
  const safeDays = Math.min(Math.max(1, days), PRIMARY_DAYS);

  return unstable_cache(
    async () => getBestDaysUncached(lat, lon, safeDays),
    ["weather-best-days", latKey, lonKey, String(safeDays)],
    { revalidate: BEST_DAYS_REVALIDATE_SECONDS },
  )();
}
