import { NextRequest, NextResponse } from "next/server";

import { getBestDays, parseCoordinates } from "@/lib/weather/service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const coordinates = parseCoordinates(params.get("lat"), params.get("lon"));
  const days = Number(params.get("days") ?? "7");

  if (!coordinates || !Number.isFinite(days)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lon/days query params." },
      { status: 400 },
    );
  }

  try {
    const result = await getBestDays(coordinates.lat, coordinates.lon, days);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch best hiking days.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
