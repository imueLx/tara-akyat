import { NextRequest, NextResponse } from "next/server";

import { createWeatherResponseHeaders, getWeatherRouteElapsedMs, logWeatherRouteTiming, normalizeWeatherRouteError } from "@/lib/weather/route-utils";
import { parseCoordinates, getCheckResult } from "@/lib/weather/service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const startedAtMs = Date.now();
  const params = request.nextUrl.searchParams;
  const coordinates = parseCoordinates(params.get("lat"), params.get("lon"));
  const date = params.get("date");

  if (!coordinates || !date) {
    const response = NextResponse.json(
      { error: "Missing or invalid lat/lon/date query params." },
      { status: 400 },
    );
    logWeatherRouteTiming("/api/weather/check", 400, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }

  try {
    const result = await getCheckResult(coordinates.lat, coordinates.lon, date);
    const response = NextResponse.json(result, {
      headers: {
        ...createWeatherResponseHeaders(
          "public, s-maxage=900, stale-while-revalidate=300",
          getWeatherRouteElapsedMs(startedAtMs),
        ),
      },
    });
    logWeatherRouteTiming("/api/weather/check", 200, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  } catch (error) {
    const normalized = normalizeWeatherRouteError(error, "Unable to process weather check.");
    const response = NextResponse.json({ error: normalized.message }, { status: normalized.status });
    logWeatherRouteTiming("/api/weather/check", normalized.status, getWeatherRouteElapsedMs(startedAtMs));
    return response;
  }
}
