"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { DifficultyPill } from "@/components/mountains/difficulty-pill";
import { difficultyBand, difficultyRangeLabel, type DifficultyBand } from "@/lib/difficulty";
import { getCommunityTipByMountainId, getTipsByMountainId } from "@/lib/mountains";
import type { Mountain } from "@/types/hiking";

type Props = {
  mountains: Mountain[];
  regions: string[];
};

type SortOption = "difficulty" | "alphabetical" | "elevation" | "popular";

type SortConfig = {
  value: SortOption;
  label: string;
  shortLabel: string;
  description: string;
};

const difficultyOptions: Array<"All" | DifficultyBand> = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];
const groupedOrder: DifficultyBand[] = ["Beginner", "Intermediate", "Advanced", "Expert"];
const sortOptions: SortConfig[] = [
  {
    value: "difficulty",
    label: "By difficulty",
    shortLabel: "Difficulty",
    description: "Beginner to expert.",
  },
  {
    value: "alphabetical",
    label: "Alphabetical",
    shortLabel: "A-Z",
    description: "Sort mountains from A to Z.",
  },
  {
    value: "elevation",
    label: "Highest elevation",
    shortLabel: "Highest",
    description: "Show the tallest mountains first.",
  },
  {
    value: "popular",
    label: "Most popular",
    shortLabel: "Popular",
    description: "Use your app's current references as a popularity signal.",
  },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="9" r="4.5" />
      <path d="m12.5 12.5 4 4" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l8 8" />
      <path d="M14 6l-8 8" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5h12" />
      <path d="M6.5 10h7" />
      <path d="M9 14.5h2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}

function normalizeMountainSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bmount\b/g, "mt")
    .replace(/\bmt\.?\b/g, "mt")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSortConfig(sortBy: SortOption): SortConfig {
  return sortOptions.find((option) => option.value === sortBy) ?? sortOptions[0];
}

function getSortHeading(sortBy: SortOption): string {
  if (sortBy === "alphabetical") {
    return "Alphabetical browse";
  }

  if (sortBy === "elevation") {
    return "Highest elevation first";
  }

  if (sortBy === "popular") {
    return "Most popular first";
  }

  return "By difficulty";
}

function MountainCard({ mountain }: { mountain: Mountain }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_34px_rgba(15,23,42,0.10)]">
      <div className="relative h-40 w-full overflow-hidden rounded-[22px] bg-slate-100 sm:h-44">
        <Image
          src={mountain.image_url}
          alt={mountain.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/35 via-slate-900/10 to-transparent" />
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.02rem] font-semibold tracking-tight text-slate-950">{mountain.name}</h3>
          <p className="mt-0.5 text-xs text-slate-600">
            {mountain.province}
          </p>
        </div>
        <DifficultyPill score={mountain.difficulty_score} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700">{mountain.summary}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
          {mountain.elevation_m.toLocaleString()} m
        </span>
      </div>

      <div className="mt-auto pt-4">
        <Link
          href={`/mountains/${mountain.slug}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
        >
          View mountain
        </Link>
      </div>
    </article>
  );
}

export function MountainListClient({ mountains, regions }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [difficulty, setDifficulty] = useState<"All" | DifficultyBand>("All");
  const [sortBy, setSortBy] = useState<SortOption>("difficulty");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortButtonRef = useRef<HTMLButtonElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const sortItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingSortFocusIndexRef = useRef<number | null>(null);
  const restoreSortButtonFocusRef = useRef(false);
  const sortMenuId = useId();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, query.trim().length === 0 ? 0 : 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const tipMeta = useMemo(() => {
    const communityTipByMountainId = new Map<string, ReturnType<typeof getCommunityTipByMountainId>>();
    const tipCountByMountainId = new Map<string, number>();

    mountains.forEach((mountain) => {
      communityTipByMountainId.set(mountain.id, getCommunityTipByMountainId(mountain.id));
      tipCountByMountainId.set(mountain.id, getTipsByMountainId(mountain.id).length);
    });

    return { communityTipByMountainId, tipCountByMountainId };
  }, [mountains]);

  const liveNormalizedQuery = normalizeMountainSearch(query);
  const normalizedQuery = normalizeMountainSearch(debouncedQuery);
  const isSearching = liveNormalizedQuery !== normalizedQuery;

  const filtered = useMemo(() => {
    return mountains.filter((mountain) => {
      const searchable = normalizeMountainSearch(`${mountain.name} ${mountain.province} ${mountain.region}`);
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      const matchesRegion = region === "All" || mountain.region === region;
      const matchesDifficulty = difficulty === "All" || difficultyBand(mountain.difficulty_score) === difficulty;

      return matchesQuery && matchesRegion && matchesDifficulty;
    });
  }, [difficulty, mountains, normalizedQuery, region]);

  const sorted = useMemo(() => {
    const items = [...filtered];

    if (sortBy === "alphabetical") {
      items.sort((a, b) => a.name.localeCompare(b.name));
      return items;
    }

    if (sortBy === "elevation") {
      items.sort((a, b) => b.elevation_m - a.elevation_m || a.name.localeCompare(b.name));
      return items;
    }

    if (sortBy === "popular") {
      items.sort((a, b) => {
        const popularityA =
          (tipMeta.tipCountByMountainId.get(a.id) ?? 0) * 10 +
          (a.image_verified ? 2 : 0) +
          (a.difficulty_source_url ? 1 : 0) +
          (tipMeta.communityTipByMountainId.get(a.id) ? 2 : 0);
        const popularityB =
          (tipMeta.tipCountByMountainId.get(b.id) ?? 0) * 10 +
          (b.image_verified ? 2 : 0) +
          (b.difficulty_source_url ? 1 : 0) +
          (tipMeta.communityTipByMountainId.get(b.id) ? 2 : 0);

        return popularityB - popularityA || a.name.localeCompare(b.name);
      });
      return items;
    }

    items.sort((a, b) => {
      const bandDiff = groupedOrder.indexOf(difficultyBand(a.difficulty_score)) - groupedOrder.indexOf(difficultyBand(b.difficulty_score));
      if (bandDiff !== 0) {
        return bandDiff;
      }

      return a.name.localeCompare(b.name);
    });

    return items;
  }, [filtered, sortBy, tipMeta]);

  const grouped = useMemo(() => {
    const map = new Map<DifficultyBand, Mountain[]>();
    groupedOrder.forEach((band) => map.set(band, []));
    sorted.forEach((mountain) => {
      const band = difficultyBand(mountain.difficulty_score);
      map.get(band)?.push(mountain);
    });
    return map;
  }, [sorted]);

  const activeSort = getSortConfig(sortBy);
  const activeSortIndex = Math.max(
    sortOptions.findIndex((option) => option.value === sortBy),
    0,
  );
  const hasActiveFilters = query.trim().length > 0 || region !== "All" || difficulty !== "All";

  function clearFilters() {
    setQuery("");
    setRegion("All");
    setDifficulty("All");
  }

  function openSortMenu(targetIndex = activeSortIndex) {
    pendingSortFocusIndexRef.current = targetIndex;
    setShowSortMenu(true);
  }

  function closeSortMenu(options?: { restoreFocus?: boolean }) {
    restoreSortButtonFocusRef.current = options?.restoreFocus ?? false;
    setShowSortMenu(false);
  }

  function focusSortItem(index: number) {
    const nextIndex = (index + sortOptions.length) % sortOptions.length;
    sortItemRefs.current[nextIndex]?.focus();
  }

  function selectSortOption(value: SortOption) {
    setSortBy(value);
    closeSortMenu({ restoreFocus: true });
  }

  function handleSortTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openSortMenu(0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openSortMenu(sortOptions.length - 1);
    }
  }

  function handleSortOptionKeyDown(index: number, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusSortItem(index + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusSortItem(index - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusSortItem(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusSortItem(sortOptions.length - 1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeSortMenu({ restoreFocus: true });
      return;
    }

    if (event.key === "Tab") {
      closeSortMenu();
    }
  }

  useEffect(() => {
    if (!showSortMenu || typeof document === "undefined") {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        closeSortMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [showSortMenu]);

  useEffect(() => {
    if (!showSortMenu) {
      if (restoreSortButtonFocusRef.current) {
        restoreSortButtonFocusRef.current = false;
        sortButtonRef.current?.focus();
      }
      return;
    }

    const focusIndex = pendingSortFocusIndexRef.current ?? activeSortIndex;

    requestAnimationFrame(() => {
      sortItemRefs.current[focusIndex]?.focus();
      pendingSortFocusIndexRef.current = null;
    });
  }, [activeSortIndex, showSortMenu]);

  function renderSortControl() {
    return (
      <div ref={sortMenuRef} className="relative shrink-0">
        <button
          ref={sortButtonRef}
          type="button"
          aria-label="Sort mountains"
          aria-haspopup="menu"
          aria-expanded={showSortMenu}
          aria-controls={sortMenuId}
          onClick={() => {
            if (showSortMenu) {
              closeSortMenu();
              return;
            }

            openSortMenu();
          }}
          onKeyDown={handleSortTriggerKeyDown}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1.5 text-left shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 sm:gap-2 sm:rounded-2xl sm:px-3 sm:py-2"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white sm:h-8 sm:w-8">
            <SortIcon />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block text-[11px] uppercase tracking-[0.12em] text-slate-500">Sort</span>
            <span className="block text-sm font-semibold text-slate-950">{activeSort.shortLabel}</span>
          </span>
          <span className="sm:hidden text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-950">{activeSort.shortLabel}</span>
          <span className="text-slate-400">
            <ChevronDownIcon />
          </span>
        </button>

        {showSortMenu ? (
          <div
            id={sortMenuId}
            role="menu"
            aria-label="Sort mountains options"
            aria-orientation="vertical"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-52 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_36px_rgba(15,23,42,0.16)] sm:w-60 sm:max-w-[calc(100vw-2rem)]"
          >
            <div className="space-y-1">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  ref={(node) => {
                    sortItemRefs.current[sortOptions.findIndex((item) => item.value === option.value)] = node;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-label={option.label}
                  aria-checked={sortBy === option.value}
                  tabIndex={sortBy === option.value ? 0 : -1}
                  onClick={() => selectSortOption(option.value)}
                  onKeyDown={(event) => handleSortOptionKeyDown(sortOptions.findIndex((item) => item.value === option.value), event)}
                  className={`flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition sm:py-2.5 ${
                    sortBy === option.value ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className={`mt-0.5 hidden text-xs leading-5 sm:block ${sortBy === option.value ? "text-slate-300" : "text-slate-500"}`}>
                      {option.description}
                    </span>
                  </span>
                  {sortBy === option.value ? <span className="ml-3 text-[11px] font-semibold uppercase tracking-[0.08em]">On</span> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-20 pt-4 sm:px-6 sm:pt-5">
      <div>
        <div className="rounded-[26px] border border-slate-200/80 bg-white/88 p-3 shadow-[0_18px_36px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[minmax(0,1.5fr)_0.95fr_1fr]">
            <label className="block">
              <span className="sr-only">Search mountains</span>
              <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-sky-200/80">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  aria-label="Search mountains"
                  type="text"
                  inputMode="search"
                  autoComplete="off"
                  spellCheck={false}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Mt. Pulag or Benguet"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
                {query.trim().length > 0 ? (
                  <button
                    type="button"
                    aria-label="Clear mountain search"
                    onClick={() => setQuery("")}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    <ClearIcon />
                  </button>
                ) : null}
              </div>
              <div aria-live="polite" className="min-h-[1rem] px-1 pt-1.5 text-[11px] font-medium text-slate-500">
                {isSearching && query.trim().length > 0 ? "Searching mountains..." : null}
              </div>
            </label>

            <select
              aria-label="Filter by region"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none ring-sky-300 transition focus:ring focus-visible:ring-2"
            >
              <option value="All">All regions</option>
              {regions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as "All" | DifficultyBand)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none ring-sky-300 transition focus:ring focus-visible:ring-2"
            >
              {difficultyOptions.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All difficulty groups" : `${item} (${difficultyRangeLabel(item)}/9)`}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters ? (
            <div className="mt-3 flex items-center justify-end gap-3 border-t border-slate-200/70 pt-3">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-5 pb-24">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-950">{getSortHeading(sortBy)}</h2>
          <div className="sticky top-24 z-20 md:top-[66px]">
            <div className="rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-[0_14px_30px_rgba(15,23,42,0.10)] backdrop-blur">
              {renderSortControl()}
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <section className="rounded-[28px] border border-slate-200 bg-white/95 p-5 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-950">No mountains match those filters yet.</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Try a broader region, remove the difficulty filter, or search with a shorter mountain name.</p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Reset mountain finder
              </button>
            ) : null}
          </section>
        ) : sortBy === "difficulty" ? (
          groupedOrder
            .filter((band) => (grouped.get(band)?.length ?? 0) > 0)
            .map((band) => {
              const mountainsByBand = grouped.get(band) ?? [];

              return (
                <section key={band} className="scroll-mt-44 md:scroll-mt-32">
                  <div className="mb-3 px-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {band} <span className="font-normal text-slate-500">· {difficultyRangeLabel(band)}/9</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {mountainsByBand.map((mountain) => (
                      <MountainCard key={mountain.id} mountain={mountain} />
                    ))}
                  </div>
                </section>
              );
            })
        ) : (
          <section className="scroll-mt-44 md:scroll-mt-32">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((mountain) => (
                <MountainCard key={mountain.id} mountain={mountain} />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
