import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes trust pages and hub pages while skipping empty month hubs", () => {
    const entries = sitemap().map((entry) => entry.url);

    expect(entries).toContain("https://tara-akyat.vercel.app/about");
    expect(entries).toContain("https://tara-akyat.vercel.app/methodology");
    expect(entries).toContain("https://tara-akyat.vercel.app/sources");
    expect(entries).toContain("https://tara-akyat.vercel.app/regions/luzon");
    expect(entries).toContain("https://tara-akyat.vercel.app/months/march");
    expect(entries).toContain("https://tara-akyat.vercel.app/difficulty/beginner");
    expect(entries).not.toContain("https://tara-akyat.vercel.app/months/june");
  });
});
