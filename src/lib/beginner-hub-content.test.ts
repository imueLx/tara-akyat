import { describe, expect, it } from "vitest";

import { getBeginnerHubFaqs, getBeginnerHubIntro, getBeginnerHubPicks } from "@/lib/beginner-hub-content";
import { getMountainsForDifficultySlug } from "@/lib/mountain-taxonomy";

describe("beginner hub content", () => {
  const mountains = getMountainsForDifficultySlug("beginner");

  it("targets beginner hiking search intent in intro and faqs", () => {
    expect(getBeginnerHubIntro(mountains.length).join(" ")).toContain("beginner-friendly mountains");
    expect(getBeginnerHubFaqs(mountains.length).map((faq) => faq.question).join(" ")).toContain(
      "hiking for beginners Philippines",
    );
  });

  it("returns starter picks from known beginner mountains", () => {
    const picks = getBeginnerHubPicks(mountains);

    expect(picks.length).toBeGreaterThanOrEqual(3);
    expect(picks.some((pick) => pick.mountain.slug === "mt-ulap")).toBe(true);
  });
});
