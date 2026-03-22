import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/weather/best-days/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/weather/best-days", () => {
  it("returns 400 for invalid params", async () => {
    const request = new NextRequest("http://localhost/api/weather/best-days?lat=a&lon=1");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("returns 504 when upstream provider times out", async () => {
    const timeoutError = new Error("The operation was aborted.");
    timeoutError.name = "AbortError";
    vi.spyOn(global, "fetch").mockRejectedValue(timeoutError);

    const request = new NextRequest("http://localhost/api/weather/best-days?lat=16.6&lon=120.9&days=7");
    const response = await GET(request);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(504);
    expect(body.error).toContain("taking too long");
  });
});
