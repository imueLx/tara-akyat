import { NextRequest, NextResponse } from "next/server";

import { BestDaysQuerySchema, parseQuery } from "@/lib/api/schemas";
import { createRateLimitHeaders, checkWeatherRouteRateLimit } from "@/lib/weather/rate-limit";
import { createWeatherResponseHeaders, getWeatherRouteElapsedMs, logWeatherRouteTiming, normalizeWeatherRouteError } from "@/lib/weather/route-utils";
import { getBestDays } from "@/lib/weather/service";

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

  const query = parseQuery(BestDaysQuerySchema, request.nextUrl.searchParams);

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
    logWeatherRouteTiming("/api/weather/best-days", 400, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }

  try {
    const result = await getBestDays(query.data.lat, query.data.lon, query.data.days);
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
