import { NextRequest, NextResponse } from "next/server";

import { parseQuery, WeatherCheckQuerySchema } from "@/lib/api/schemas";
import { createRateLimitHeaders, checkWeatherRouteRateLimit } from "@/lib/weather/rate-limit";
import { createWeatherResponseHeaders, getWeatherRouteElapsedMs, logWeatherRouteTiming, normalizeWeatherRouteError } from "@/lib/weather/route-utils";
import { getCheckDetails } from "@/lib/weather/service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startedAtMs = Date.now();
  const rateLimit = checkWeatherRouteRateLimit(request, "/api/weather/check/details");

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
    logWeatherRouteTiming("/api/weather/check/details", 429, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }

  const query = parseQuery(WeatherCheckQuerySchema, request.nextUrl.searchParams);

  if (!query.ok) {
    const response = NextResponse.json(
      { error: query.message },
      {
        status: 400,
        headers: {
          ...createRateLimitHeaders(rateLimit),
          ...createWeatherResponseHeaders("no-store", getWeatherRouteElapsedMs(startedAtMs)),
        },
      },
    );
    logWeatherRouteTiming("/api/weather/check/details", 400, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }

  try {
    const result = await getCheckDetails(query.data.lat, query.data.lon, query.data.date);
    const response = NextResponse.json(result, {
      headers: {
        ...createWeatherResponseHeaders(
          "public, s-maxage=3600, stale-while-revalidate=900",
          getWeatherRouteElapsedMs(startedAtMs),
        ),
        ...createRateLimitHeaders(rateLimit),
      },
    });
    logWeatherRouteTiming("/api/weather/check/details", 200, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  } catch (error) {
    const normalized = normalizeWeatherRouteError(error, "Unable to load weather details.");
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
    logWeatherRouteTiming("/api/weather/check/details", normalized.status, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }
}
