import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePlannerClient } from "@/components/mountains/home-planner-client";

const mountains = [
  {
    id: "mt-ulap",
    name: "Mt. Ulap",
    slug: "mt-ulap",
    region: "Luzon",
    province: "Benguet",
    lat: 16.4,
    lon: 120.6,
    image_url: "https://picsum.photos/seed/mt-ulap/960/640",
    image_verified: true,
    difficulty_source_url: "https://example.com/ulap-difficulty",
    difficulty_score: 3,
    summary: "Ridgeline views and pine-tree sections.",
  },
  {
    id: "mt-apo",
    name: "Mt. Apo",
    slug: "mt-apo",
    region: "Mindanao",
    province: "Davao del Sur",
    lat: 6.99,
    lon: 125.27,
    image_url: "https://picsum.photos/seed/mt-apo/960/640",
    image_verified: true,
    difficulty_source_url: "https://example.com/apo-difficulty",
    difficulty_score: 8,
    summary: "Highest mountain in the Philippines with multi-day routes.",
  },
  {
    id: "mt-pulag",
    name: "Mt. Pulag",
    slug: "mt-pulag",
    region: "Luzon",
    province: "Benguet",
    lat: 16.58,
    lon: 120.89,
    image_url: "https://picsum.photos/seed/mt-pulag/960/640",
    image_verified: false,
    difficulty_score: 5,
    summary: "Sea of clouds sunrise and cool summit conditions.",
  },
];

describe("HomePlannerClient", () => {
  it("supports combobox semantics and keyboard selection", async () => {
    render(<HomePlannerClient mountains={mountains} />);

    const combobox = screen.getByRole("combobox", { name: "Search mountains" });
    expect(combobox).toHaveAttribute("aria-haspopup", "listbox");

    fireEvent.focus(combobox);
    fireEvent.change(combobox, { target: { value: "apo" } });

    await waitFor(() => {
      expect(screen.getByRole("listbox", { name: "Mountain options" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Mt\. Apo/i })).toBeInTheDocument();
    });

    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "Enter" });

    await waitFor(() => {
      expect((combobox as HTMLInputElement).value).toBe("");
      expect(screen.getAllByText("Mt. Apo").length).toBeGreaterThan(0);
      expect(combobox).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("normalizes mountain search terms and shows empty states", async () => {
    render(<HomePlannerClient mountains={mountains} />);

    const combobox = screen.getByRole("combobox", { name: "Search mountains" });

    fireEvent.change(combobox, { target: { value: "mt pulag" } });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Mt\. Pulag/i })).toBeInTheDocument();
    });

    fireEvent.change(combobox, { target: { value: "unknown summit" } });
    await waitFor(() => {
      expect(screen.getByText("No mountain matches that search yet.")).toBeInTheDocument();
    });
  });
});
