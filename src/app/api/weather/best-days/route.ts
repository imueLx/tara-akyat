import { NextRequest, NextResponse } from "next/server";

import { createRateLimitHeaders, checkWeatherRouteRateLimit } from "@/lib/weather/rate-limit";
import { createWeatherResponseHeaders, getWeatherRouteElapsedMs, logWeatherRouteTiming, normalizeWeatherRouteError } from "@/lib/weather/route-utils";
import { getBestDays, parseCoordinates } from "@/lib/weather/service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startedAtMs = Date.now();
  const rateLimit = checkWeatherRouteRateLimit(request, "/api/weather/best-days");

  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      { error: "Too many weather requests. Please wait and try again." },
      {
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimit),
          ...createWeatherResponseHeaders("no-store", getWeatherRouteElapsedMs(startedAtMs)),
        },
      },
    );
    logWeatherRouteTiming("/api/weather/best-days", 429, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }

  const params = request.nextUrl.searchParams;
  const coordinates = parseCoordinates(params.get("lat"), params.get("lon"));
  const days = Number(params.get("days") ?? "7");

  if (!coordinates || !Number.isFinite(days)) {
    const response = NextResponse.json(
      { error: "Missing or invalid lat/lon/days query params." },
      {
        status: 400,
        headers: {
          ...createRateLimitHeaders(rateLimit),
          ...createWeatherResponseHeaders("no-store", getWeatherRouteElapsedMs(startedAtMs)),
        },
      },
    );
    logWeatherRouteTiming("/api/weather/best-days", 400, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }

  try {
    const result = await getBestDays(coordinates.lat, coordinates.lon, days);
    const response = NextResponse.json(result, {
      headers: {
        ...createWeatherResponseHeaders(
          "public, s-maxage=1800, stale-while-revalidate=600",
          getWeatherRouteElapsedMs(startedAtMs),
        ),
        ...createRateLimitHeaders(rateLimit),
      },
    });
    logWeatherRouteTiming("/api/weather/best-days", 200, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  } catch (error) {
    const normalized = normalizeWeatherRouteError(error, "Unable to fetch best hiking days.");
    const response = NextResponse.json(
      { error: normalized.message },
      {
        status: normalized.status,
        headers: {
          ...createRateLimitHeaders(rateLimit),
          ...createWeatherResponseHeaders("no-store", getWeatherRouteElapsedMs(startedAtMs)),
        },
      },
    );
    logWeatherRouteTiming("/api/weather/best-days", normalized.status, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }
}
