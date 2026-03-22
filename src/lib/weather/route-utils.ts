import { isUpstreamWeatherTimeoutError } from "@/lib/weather/http";

type WeatherRouteErrorResult = {
  status: number;
  message: string;
};

export function getWeatherRouteElapsedMs(startedAtMs: number): number {
  return Math.max(0, Date.now() - startedAtMs);
}

export function createWeatherResponseHeaders(cacheControl: string, elapsedMs: number): Record<string, string> {
  return {
    "Cache-Control": cacheControl,
    "Server-Timing": `app;dur=${elapsedMs}`,
  };
}

export function normalizeWeatherRouteError(error: unknown, fallbackMessage: string): WeatherRouteErrorResult {
  if (isUpstreamWeatherTimeoutError(error)) {
    return {
      status: 504,
      message: "Weather provider is taking too long to respond. Please try again shortly.",
    };
  }

  const message = error instanceof Error ? error.message : fallbackMessage;
  const status = message.includes("Invalid") || message.includes("Please select") ? 400 : 502;

  return { status, message };
}

export function logWeatherRouteTiming(route: string, status: number, elapsedMs: number): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  console.info(`[weather-api] route=${route} status=${status} duration_ms=${elapsedMs}`);
}
