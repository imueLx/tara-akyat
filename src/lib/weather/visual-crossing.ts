import type { DailyWeatherMetrics, HikeWindowRainMetrics } from "@/types/hiking";
import { fetchWeatherJson } from "@/lib/weather/http";

const HIKE_WINDOW_START_HOUR = 4;
const HIKE_WINDOW_END_HOUR = 14;
const HIKE_WINDOW_LABEL = "4am-2pm";

interface VisualCrossingHour {
  datetime: string;
  precip?: number;
  precipprob?: number;
}

interface VisualCrossingDay {
  datetime: string;
  tempmax: number;
  feelslikemax: number;
  precip: number;
  precipprob: number;
  windspeed: number;
  conditions?: string;
  hours?: VisualCrossingHour[];
}

interface VisualCrossingTimelineResponse {
  days: VisualCrossingDay[];
}

function conditionToCode(conditions?: string): number {
  const normalized = conditions?.toLowerCase() ?? "";

  if (normalized.includes("thunder")) {
    return 95;
  }
  if (normalized.includes("rain") || normalized.includes("storm") || normalized.includes("shower")) {
    return 63;
  }
  if (normalized.includes("cloud")) {
    return 3;
  }

  return 1;
}

export function hasVisualCrossingKey(): boolean {
  return Boolean(process.env.VISUAL_CROSSING_API_KEY);
}

export async function fetchVisualCrossingDay(
  lat: number,
  lon: number,
  date: string,
): Promise<DailyWeatherMetrics | null> {
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;
  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    unitGroup: "metric",
    key: apiKey,
    include: "days,hours",
    elements: "datetime,tempmax,feelslikemax,precip,precipprob,windspeed,conditions,hours.datetime,hours.precip,hours.precipprob",
    timezone: "Asia/Manila",
  });

  const url =
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
    `${lat},${lon}/${date}/${date}?${params.toString()}`;
  const payload = await fetchWeatherJson<VisualCrossingTimelineResponse>(url, "Visual Crossing forecast", 1800);
  const day = payload.days[0];

  if (!day) {
    return null;
  }

  return {
    precipitationProbability: day.precipprob ?? 0,
    precipitationSum: day.precip ?? 0,
    windSpeedMax: day.windspeed ?? 0,
    temperatureMax: day.tempmax ?? 0,
    apparentTemperatureMax: day.feelslikemax ?? day.tempmax ?? 0,
    weatherCode: conditionToCode(day.conditions),
  };
}

export async function fetchVisualCrossingHikeWindowRain(
  lat: number,
  lon: number,
  date: string,
): Promise<HikeWindowRainMetrics | null> {
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;
  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    unitGroup: "metric",
    key: apiKey,
    include: "days,hours",
    elements: "datetime,hours.datetime,hours.precip,hours.precipprob",
    timezone: "Asia/Manila",
  });

  const url =
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/` +
    `${lat},${lon}/${date}/${date}?${params.toString()}`;
  const payload = await fetchWeatherJson<VisualCrossingTimelineResponse>(url, "Visual Crossing hourly forecast", 1800);
  const day = payload.days[0];

  if (!day?.hours?.length) {
    return null;
  }

  let precipitationSum = 0;
  let precipitationProbabilityMax = 0;
  let sampleHours = 0;

  for (const hour of day.hours) {
    const hourValue = Number.parseInt(hour.datetime.slice(0, 2), 10);

    if (!Number.isFinite(hourValue) || hourValue < HIKE_WINDOW_START_HOUR || hourValue > HIKE_WINDOW_END_HOUR) {
      continue;
    }

    sampleHours += 1;
    precipitationSum += hour.precip ?? 0;
    precipitationProbabilityMax = Math.max(precipitationProbabilityMax, hour.precipprob ?? 0);
  }

  if (sampleHours === 0) {
    return null;
  }

  return {
    label: HIKE_WINDOW_LABEL,
    startHour: HIKE_WINDOW_START_HOUR,
    endHour: HIKE_WINDOW_END_HOUR,
    sampleHours,
    precipitationProbability: Number(precipitationProbabilityMax.toFixed(0)),
    precipitationSum: Number(precipitationSum.toFixed(1)),
  };
}
