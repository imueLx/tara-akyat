import { NextResponse } from "next/server";

import { getMountains, getRegions } from "@/lib/mountains";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      mountains: getMountains(),
      regions: getRegions(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    },
  );
}
