import { NextResponse } from "next/server";

import { getMountains } from "@/lib/mountains";
import { hasVisualCrossingKey } from "@/lib/weather/visual-crossing";

export const dynamic = "force-dynamic";

const OPEN_METEO_PING_TIMEOUT_MS = 3000;
const OPEN_METEO_PING_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=14.6&longitude=121&daily=precipitation_sum&forecast_days=1";

async function pingOpenMeteo(): Promise<boolean> {
  try {
    const response = await fetch(OPEN_METEO_PING_URL, {
      signal: AbortSignal.timeout(OPEN_METEO_PING_TIMEOUT_MS),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function GET(): Promise<NextResponse> {
  let dataOk = false;
  try {
    dataOk = getMountains().length > 0;
  } catch {
    dataOk = false;
  }

  const openMeteoOk = await pingOpenMeteo();
  const status = dataOk ? (openMeteoOk ? "ok" : "degraded") : "error";

  return NextResponse.json(
    {
      status,
      checks: {
        data: dataOk,
        openMeteo: openMeteoOk,
        visualCrossingConfigured: hasVisualCrossingKey(),
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: dataOk ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
