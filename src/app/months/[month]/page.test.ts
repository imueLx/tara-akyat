import { describe, expect, it } from "vitest";

import { generateMetadata } from "@/app/months/[month]/page";

describe("month hub metadata", () => {
  it("keeps active month hubs indexable", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ month: "march" }) });

    expect(metadata.alternates?.canonical).toBe("/months/march");
    expect(metadata.robots).toBeUndefined();
  });

  it("marks empty month hubs as noindex", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ month: "june" }) });

    expect(metadata.alternates?.canonical).toBe("/months/june");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
