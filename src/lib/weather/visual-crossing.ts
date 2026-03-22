import type { DailyWeatherMetrics } from "@/types/hiking";
import { fetchWeatherJson } from "@/lib/weather/http";

interface VisualCrossingDay {
  datetime: string;
  tempmax: number;
  feelslikemax: number;
  precip: number;
  precipprob: number;
  windspeed: number;
  conditions?: string;
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
    include: "days",
    elements: "datetime,tempmax,feelslikemax,precip,precipprob,windspeed,conditions",
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
