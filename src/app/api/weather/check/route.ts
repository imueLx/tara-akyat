import { NextRequest, NextResponse } from "next/server";

import { parseCoordinates, getCheckResult } from "@/lib/weather/service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const coordinates = parseCoordinates(params.get("lat"), params.get("lon"));
  const date = params.get("date");

  if (!coordinates || !date) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lon/date query params." },
      { status: 400 },
    );
  }

  try {
    const result = await getCheckResult(coordinates.lat, coordinates.lon, date);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process weather check.";
    const status = message.includes("Invalid") || message.includes("Please select") ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
