import { describe, expect, it } from "vitest";

import { getMountainImageLoadingProps, getMountainImageObjectPosition } from "@/lib/mountain-image";

describe("mountain image helpers", () => {
  it("returns the default object position when a slug has no override", () => {
    expect(getMountainImageObjectPosition("mt-ulap")).toBe("50% 50%");
  });

  it("returns eager high-priority props for critical images", () => {
    expect(getMountainImageLoadingProps(true)).toEqual({
      loading: "eager",
      fetchPriority: "high",
    });
  });

  it("returns lazy auto-priority props for non-critical images", () => {
    expect(getMountainImageLoadingProps(false)).toEqual({
      loading: "lazy",
      fetchPriority: "auto",
    });
  });
});
