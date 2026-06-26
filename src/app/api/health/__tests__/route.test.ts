import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/health", () => {
  it("reports ok when data parses and Open-Meteo responds", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("{}", { status: 200 }));

    const response = await GET();
    const body = (await response.json()) as {
      status: string;
      checks: { data: boolean; openMeteo: boolean };
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.data).toBe(true);
    expect(body.checks.openMeteo).toBe(true);
  });

  it("reports degraded when Open-Meteo is unreachable", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network down"));

    const response = await GET();
    const body = (await response.json()) as {
      status: string;
      checks: { data: boolean; openMeteo: boolean };
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("degraded");
    expect(body.checks.data).toBe(true);
    expect(body.checks.openMeteo).toBe(false);
  });
});
