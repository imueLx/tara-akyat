import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TipsList } from "@/components/mountains/tips-list";

const tips = [
  {
    id: "t1",
    mountain_id: "mt-ulap",
    source_type: "reddit" as const,
    title: "Trail prep",
    url: "https://www.reddit.com/r/phtravel/",
    note: "Read recent trail updates.",
    safety_tags: ["trail-condition"],
  },
];

describe("TipsList", () => {
  it("renders external links safely", () => {
    render(<TipsList tips={tips} />);

    const link = screen.getByRole("link", { name: "Open source" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });
});
