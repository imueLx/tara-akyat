import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/components/mountains/date-weather-query-bridge", () => ({
  DateWeatherQueryBridge: () => <div>weather checker bridge mock</div>,
}));

vi.mock("@/components/mountains/difficulty-pill", () => ({
  DifficultyPill: () => <div>difficulty pill mock</div>,
}));

vi.mock("@/components/mountains/mountain-photo-lightbox", () => ({
  MountainPhotoLightbox: () => <div>photo lightbox mock</div>,
}));

vi.mock("@/components/seo/faq-section", () => ({
  FaqSection: () => <div>faq section mock</div>,
}));

vi.mock("@/components/seo/mountain-link-grid", () => ({
  MountainLinkGrid: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("@/lib/mountain-image", () => ({
  getMountainImageObjectPosition: () => "center",
}));

import MountainPage, { generateMetadata } from "@/app/mountains/[slug]/page";

describe("mountain page", () => {
  beforeEach(() => {
    notFoundMock.mockClear();
  });

  it("renders the slimmer planning layout", async () => {
    render(await MountainPage({ params: Promise.resolve({ slug: "mt-ulap" }) }));

    expect(screen.getByRole("heading", { level: 2, name: /When to hike Mt\. Ulap/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /One quick planning note for Mt\. Ulap/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Methodology" })).toHaveAttribute("href", "/methodology");
    expect(screen.getByText(/Other mountains hikers often compare with Mt\. Ulap/i)).toBeInTheDocument();
  });

  it("returns noindex metadata when a date query param is present", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "mt-ulap" }),
      searchParams: Promise.resolve({ date: "2026-04-30" }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe("/mountains/mt-ulap");
  });

  it("returns non-indexable metadata for an unknown mountain slug", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "missing-slug" }) });

    expect(metadata.title).toBe("Mountain Not Found");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("triggers notFound for an unknown mountain slug", async () => {
    await expect(MountainPage({ params: Promise.resolve({ slug: "missing-slug" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});
