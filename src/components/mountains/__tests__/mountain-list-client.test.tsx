import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mountains", () => ({
  getCommunityTipByMountainId: (mountainId: string) => (mountainId === "mt-apo" ? ({ source_type: "reddit" } as const) : undefined),
  getTipsByMountainId: (mountainId: string) => {
    if (mountainId === "mt-apo") {
      return [{ title: "Top climb" }, { title: "Another top climb" }];
    }

    if (mountainId === "mt-ulap") {
      return [{ title: "Popular beginner pick" }];
    }

    return [];
  },
}));

import { MountainListClient } from "@/components/mountains/mountain-list-client";
import type { Mountain } from "@/types/hiking";

const mountains: Mountain[] = [
  {
    id: "mt-batulao",
    name: "Mt. Batulao",
    slug: "mt-batulao",
    region: "Luzon",
    province: "Batangas",
    lat: 14.0,
    lon: 120.9,
    image_url: "https://picsum.photos/seed/mt-batulao/960/640",
    elevation_m: 811,
    difficulty_score: 1,
    difficulty: "Beginner",
    best_months: ["January"],
    summary: "Short beginner-friendly ridge hike.",
  },
  {
    id: "mt-ulap",
    name: "Mt. Ulap",
    slug: "mt-ulap",
    region: "Luzon",
    province: "Benguet",
    lat: 16.4,
    lon: 120.6,
    image_url: "https://picsum.photos/seed/mt-ulap/960/640",
    elevation_m: 1846,
    difficulty_score: 3,
    difficulty: "Beginner",
    best_months: ["December"],
    summary: "Cool beginner ridge.",
  },
  {
    id: "mt-apo",
    name: "Mt. Apo",
    slug: "mt-apo",
    region: "Mindanao",
    province: "Davao del Sur",
    lat: 6.9,
    lon: 125.2,
    image_url: "https://picsum.photos/seed/mt-apo/960/640",
    elevation_m: 2954,
    difficulty_score: 8,
    difficulty: "Advanced",
    best_months: ["January"],
    summary: "Multi-day high summit.",
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MountainListClient", () => {
  it("sorts mountains by popularity by default", () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    expect(screen.getByRole("heading", { level: 2, name: "Most popular first" })).toBeInTheDocument();

    const mountainLinks = screen.getAllByRole("link", { name: /View .* guide/i });
    expect(mountainLinks[0]).toHaveAttribute("href", "/mountains/mt-apo");
    expect(mountainLinks[1]).toHaveAttribute("href", "/mountains/mt-ulap");
    expect(mountainLinks[2]).toHaveAttribute("href", "/mountains/mt-batulao");
  });

  it("sorts mountains by exact difficulty score ascending when selected", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort mountains" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "By difficulty" }));

    expect(screen.getByRole("heading", { level: 2, name: "By difficulty" })).toBeInTheDocument();

    const mountainLinks = screen.getAllByRole("link", { name: /View .* guide/i });
    expect(mountainLinks[0]).toHaveAttribute("href", "/mountains/mt-batulao");
    expect(mountainLinks[1]).toHaveAttribute("href", "/mountains/mt-ulap");
    expect(mountainLinks[2]).toHaveAttribute("href", "/mountains/mt-apo");
  });

  it("filters mountains by search query", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.change(screen.getByLabelText("Search mountains"), {
      target: { value: "Apo" },
    });

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Ulap")).not.toBeInTheDocument();
    });
  });

  it("sorts mountains alphabetically", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort mountains" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Alphabetical" }));

    expect(screen.getByRole("heading", { level: 2, name: "Alphabetical browse" })).toBeInTheDocument();

    const mountainLinks = screen.getAllByRole("link", { name: /View .* guide/i });
    expect(mountainLinks[0]).toHaveAttribute("href", "/mountains/mt-apo");
    expect(mountainLinks[1]).toHaveAttribute("href", "/mountains/mt-batulao");
    expect(mountainLinks[2]).toHaveAttribute("href", "/mountains/mt-ulap");
  });

  it("closes the sort menu on outside click", () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort mountains" }));
    expect(screen.getByRole("menu", { name: "Sort mountains options" })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole("menu", { name: "Sort mountains options" })).not.toBeInTheDocument();
  });

  it("supports keyboard navigation in the sort menu", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    const trigger = screen.getByRole("button", { name: "Sort mountains" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    const firstItem = await screen.findByRole("menuitemradio", { name: "By difficulty" });
    await waitFor(() => {
      expect(firstItem).toHaveFocus();
    });

    fireEvent.keyDown(firstItem, { key: "ArrowDown" });

    await waitFor(() => {
      expect(screen.getByRole("menuitemradio", { name: "Alphabetical" })).toHaveFocus();
    });

    fireEvent.keyDown(screen.getByRole("menuitemradio", { name: "Alphabetical" }), { key: "Escape" });

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });

    expect(screen.queryByRole("menu", { name: "Sort mountains options" })).not.toBeInTheDocument();
  });

  it("filters mountains by custom region menu", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Filter by region" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Mindanao" }));

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Ulap")).not.toBeInTheDocument();
    });
  });

  it("filters mountains by custom difficulty menu", async () => {
    render(<MountainListClient mountains={mountains} regions={["Luzon", "Mindanao"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Filter by difficulty" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Advanced (7-8/9)" }));

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Ulap")).not.toBeInTheDocument();
    });
  });

  it("supports lighter first-load defaults from props", async () => {
    render(
      <MountainListClient
        mountains={mountains}
        regions={["Luzon", "Mindanao"]}
        initialRegion="Luzon"
        initialDifficulty="Beginner"
        initialSortBy="popular"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Mt. Batulao")).toBeInTheDocument();
      expect(screen.getByText("Mt. Ulap")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Apo")).not.toBeInTheDocument();
    });
  });

  it("still lets users change region after the lighter first-load defaults", async () => {
    render(
      <MountainListClient
        mountains={mountains}
        regions={["Luzon", "Mindanao"]}
        initialRegion="Luzon"
        initialDifficulty="Beginner"
        initialSortBy="popular"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Filter by region" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Mindanao" }));

    await waitFor(() => {
      expect(screen.queryByText("Mt. Ulap")).not.toBeInTheDocument();
      expect(screen.queryByText("Mt. Batulao")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Filter by difficulty" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "All difficulty groups" }));

    await waitFor(() => {
      expect(screen.getByText("Mt. Apo")).toBeInTheDocument();
    });
  });

  it("still lets users change sort after the lighter first-load defaults", async () => {
    render(
      <MountainListClient
        mountains={mountains}
        regions={["Luzon", "Mindanao"]}
        initialRegion="Luzon"
        initialDifficulty="Beginner"
        initialSortBy="popular"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort mountains" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Alphabetical" }));

    expect(screen.getByRole("heading", { level: 2, name: "Alphabetical browse" })).toBeInTheDocument();

    const mountainLinks = screen.getAllByRole("link", { name: /View .* guide/i });
    expect(mountainLinks[0]).toHaveAttribute("href", "/mountains/mt-batulao");
    expect(mountainLinks[1]).toHaveAttribute("href", "/mountains/mt-ulap");
  });

  it("still lets search narrow results after the lighter first-load defaults", async () => {
    render(
      <MountainListClient
        mountains={mountains}
        regions={["Luzon", "Mindanao"]}
        initialRegion="Luzon"
        initialDifficulty="Beginner"
        initialSortBy="popular"
      />,
    );

    fireEvent.change(screen.getByLabelText("Search mountains"), {
      target: { value: "Ulap" },
    });

    await waitFor(() => {
      expect(screen.getByText("Mt. Ulap")).toBeInTheDocument();
      expect(screen.queryByText("Mt. Batulao")).not.toBeInTheDocument();
    });
  });
});
