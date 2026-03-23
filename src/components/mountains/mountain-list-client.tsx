"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { DifficultyPill } from "@/components/mountains/difficulty-pill";
import { difficultyBand, difficultyRangeLabel, type DifficultyBand } from "@/lib/difficulty";
import { getMountainImageObjectPosition } from "@/lib/mountain-image";
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

type FilterOption = {
  value: string;
  label: string;
  eyebrow: string;
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

const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

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

function formatMonthShort(month: string): string {
  return month.slice(0, 3);
}

function formatBestMonthsWindow(months: string[]): string {
  const ordered = [...months].sort(
    (a, b) => monthOrder.indexOf(a as (typeof monthOrder)[number]) - monthOrder.indexOf(b as (typeof monthOrder)[number]),
  );

  if (ordered.length === 0) {
    return "Year-round";
  }

  if (ordered.length === 1) {
    return formatMonthShort(ordered[0]);
  }

  return `${formatMonthShort(ordered[0])} - ${formatMonthShort(ordered[ordered.length - 1])}`;
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 5.5h13" />
      <path d="M6.5 10h7" />
      <path d="M8.5 14.5h3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5.5 10 3 3 6-6" />
    </svg>
  );
}

function finderMenuOptionClassName(isSelected: boolean): string {
  return `flex w-full items-start justify-between rounded-[14px] border px-3 py-2.5 text-left transition ${
    isSelected
      ? "border-stone-200/90 bg-white text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_6px_14px_rgba(15,23,42,0.04)]"
      : "border-transparent text-slate-700 hover:border-stone-200/80 hover:bg-stone-50/80"
  }`;
}

function MountainCard({ mountain, eagerLoad = false }: { mountain: Mountain; eagerLoad?: boolean }) {
  const isPlaceholderImage = mountain.image_url === "/mountains/placeholder.svg";
  const shouldEagerLoad = eagerLoad || isPlaceholderImage;
  const bestMonthsWindow = formatBestMonthsWindow(mountain.best_months);
  const band = difficultyBand(mountain.difficulty_score);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_48px_rgba(15,23,42,0.14)]">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-20 rounded-b-[28px] bg-sky-100/40 blur-2xl transition duration-300 group-hover:bg-sky-100/60" />

      <div className="relative h-44 w-full overflow-hidden rounded-[16px] bg-slate-100 sm:h-48">
        <Link href={`/mountains/${mountain.slug}`} aria-label={`Open ${mountain.name}`} className="absolute inset-0 z-10">
          <span className="sr-only">Open {mountain.name}</span>
        </Link>
        <Image
          src={mountain.image_url}
          alt={mountain.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading={shouldEagerLoad ? "eager" : undefined}
          fetchPriority={eagerLoad ? "high" : "auto"}
          quality={70}
          style={{ objectPosition: getMountainImageObjectPosition(mountain.slug) }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.08)_45%,rgba(15,23,42,0.68))]" />
        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          <span className="rounded-[999px] border border-white/35 bg-white/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {mountain.region}
          </span>
          <DifficultyPill score={mountain.difficulty_score} />
        </div>
        <div className="absolute inset-x-3 bottom-3 z-20 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/72">{mountain.province}</p>
            <h3 className="mt-1 line-clamp-2 text-[1.08rem] font-semibold tracking-tight text-white">{mountain.name}</h3>
          </div>
        </div>
      </div>

      <div className="relative mt-3 flex flex-1 flex-col px-1">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-[999px] border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {band}
          </span>
          <span className="rounded-[999px] border border-sky-200/70 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-800">
            Best {bestMonthsWindow}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{mountain.summary}</p>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-[16px] border border-slate-200/80 bg-white px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Elevation</p>
            <p className="mt-1 text-base font-semibold tracking-tight text-slate-950">{mountain.elevation_m.toLocaleString()} m</p>
          </div>
          <div className="rounded-[16px] border border-slate-200/80 bg-white px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Season</p>
            <p className="mt-1 text-base font-semibold tracking-tight text-slate-950">{bestMonthsWindow}</p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Link
            href={`/mountains/${mountain.slug}`}
            aria-label={`View ${mountain.name} guide`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
          >
            <span>View details</span>
            <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600">
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4.5 10h11" />
                <path d="m10.5 4 5.5 6-5.5 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function MountainListClient({ mountains, regions }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [difficulty, setDifficulty] = useState<"All" | DifficultyBand>("All");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);

  const sortButtonRef = useRef<HTMLButtonElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const sortItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingSortFocusIndexRef = useRef<number | null>(null);
  const restoreSortButtonFocusRef = useRef(false);
  const sortMenuId = useId();
  const regionButtonRef = useRef<HTMLButtonElement | null>(null);
  const regionMenuRef = useRef<HTMLDivElement | null>(null);
  const regionItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingRegionFocusIndexRef = useRef<number | null>(null);
  const restoreRegionButtonFocusRef = useRef(false);
  const regionMenuId = useId();
  const difficultyButtonRef = useRef<HTMLButtonElement | null>(null);
  const difficultyMenuRef = useRef<HTMLDivElement | null>(null);
  const difficultyItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingDifficultyFocusIndexRef = useRef<number | null>(null);
  const restoreDifficultyButtonFocusRef = useRef(false);
  const difficultyMenuId = useId();

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

    items.sort((a, b) => a.difficulty_score - b.difficulty_score || a.name.localeCompare(b.name));

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
  const regionOptions: FilterOption[] = useMemo(
    () => [
      { value: "All", label: "All regions", eyebrow: "Region" },
      ...regions.map((item) => ({ value: item, label: item, eyebrow: "Region" })),
    ],
    [regions],
  );
  const difficultyFilterOptions: FilterOption[] = useMemo(
    () =>
      difficultyOptions.map((item) => ({
        value: item,
        label: item === "All" ? "All difficulty groups" : `${item} (${difficultyRangeLabel(item)}/9)`,
        eyebrow: "Difficulty",
      })),
    [],
  );
  const activeRegionIndex = Math.max(
    regionOptions.findIndex((option) => option.value === region),
    0,
  );
  const activeDifficultyIndex = Math.max(
    difficultyFilterOptions.findIndex((option) => option.value === difficulty),
    0,
  );
  const hasActiveFilters = query.trim().length > 0 || region !== "All" || difficulty !== "All";
  function clearFilters() {
    setQuery("");
    setRegion("All");
    setDifficulty("All");
  }

  function openSortMenu(targetIndex = activeSortIndex) {
    setShowRegionMenu(false);
    setShowDifficultyMenu(false);
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

  function openRegionMenu(targetIndex = activeRegionIndex) {
    setShowSortMenu(false);
    setShowDifficultyMenu(false);
    pendingRegionFocusIndexRef.current = targetIndex;
    setShowRegionMenu(true);
  }

  function closeRegionMenu(options?: { restoreFocus?: boolean }) {
    restoreRegionButtonFocusRef.current = options?.restoreFocus ?? false;
    setShowRegionMenu(false);
  }

  function focusRegionItem(index: number) {
    const nextIndex = (index + regionOptions.length) % regionOptions.length;
    regionItemRefs.current[nextIndex]?.focus();
  }

  function selectRegionOption(value: string) {
    setRegion(value);
    closeRegionMenu({ restoreFocus: true });
  }

  function openDifficultyMenu(targetIndex = activeDifficultyIndex) {
    setShowSortMenu(false);
    setShowRegionMenu(false);
    pendingDifficultyFocusIndexRef.current = targetIndex;
    setShowDifficultyMenu(true);
  }

  function closeDifficultyMenu(options?: { restoreFocus?: boolean }) {
    restoreDifficultyButtonFocusRef.current = options?.restoreFocus ?? false;
    setShowDifficultyMenu(false);
  }

  function focusDifficultyItem(index: number) {
    const nextIndex = (index + difficultyFilterOptions.length) % difficultyFilterOptions.length;
    difficultyItemRefs.current[nextIndex]?.focus();
  }

  function selectDifficultyOption(value: "All" | DifficultyBand) {
    setDifficulty(value);
    closeDifficultyMenu({ restoreFocus: true });
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

  function handleFilterTriggerKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    openMenu: (targetIndex?: number) => void,
    lastIndex: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(0);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(lastIndex);
    }
  }

  function handleFilterOptionKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLButtonElement>,
    focusItem: (nextIndex: number) => void,
    closeMenu: (options?: { restoreFocus?: boolean }) => void,
    totalItems: number,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(index + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(index - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusItem(totalItems - 1);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
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
    if (!showRegionMenu || typeof document === "undefined") {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!regionMenuRef.current?.contains(event.target as Node)) {
        closeRegionMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [showRegionMenu]);

  useEffect(() => {
    if (!showDifficultyMenu || typeof document === "undefined") {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!difficultyMenuRef.current?.contains(event.target as Node)) {
        closeDifficultyMenu();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [showDifficultyMenu]);

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

  useEffect(() => {
    if (!showRegionMenu) {
      if (restoreRegionButtonFocusRef.current) {
        restoreRegionButtonFocusRef.current = false;
        regionButtonRef.current?.focus();
      }
      return;
    }

    const focusIndex = pendingRegionFocusIndexRef.current ?? activeRegionIndex;

    requestAnimationFrame(() => {
      regionItemRefs.current[focusIndex]?.focus();
      pendingRegionFocusIndexRef.current = null;
    });
  }, [activeRegionIndex, showRegionMenu]);

  useEffect(() => {
    if (!showDifficultyMenu) {
      if (restoreDifficultyButtonFocusRef.current) {
        restoreDifficultyButtonFocusRef.current = false;
        difficultyButtonRef.current?.focus();
      }
      return;
    }

    const focusIndex = pendingDifficultyFocusIndexRef.current ?? activeDifficultyIndex;

    requestAnimationFrame(() => {
      difficultyItemRefs.current[focusIndex]?.focus();
      pendingDifficultyFocusIndexRef.current = null;
    });
  }, [activeDifficultyIndex, showDifficultyMenu]);

  function renderSortControl() {
    return (
      <div ref={sortMenuRef} className="relative">
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
          className={`inline-flex min-h-[48px] w-full items-center justify-between gap-2.5 rounded-[14px] border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
            showSortMenu
              ? "border-slate-300 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
              : "border-stone-200/80 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:border-stone-300/80 hover:bg-stone-50/60 hover:shadow-[0_8px_16px_rgba(15,23,42,0.05)]"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                showSortMenu ? "border-sky-100 bg-sky-50 text-sky-700" : "border-stone-200 bg-stone-50 text-slate-500"
              }`}
            >
              <SortIcon />
            </span>
            <span className="min-w-0 truncate text-[13px] tracking-tight text-slate-900">
              <span className="font-medium text-slate-400">Sort</span>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="font-semibold">{activeSort.shortLabel}</span>
            </span>
          </span>
          <span className={`shrink-0 text-slate-300 transition ${showSortMenu ? "rotate-180 text-slate-500" : ""}`}>
            <ChevronDownIcon />
          </span>
        </button>

        {showSortMenu ? (
          <div
            id={sortMenuId}
            role="menu"
            aria-label="Sort mountains options"
            aria-orientation="vertical"
            className="absolute right-0 top-[calc(100%+0.45rem)] z-[60] w-52 max-w-[calc(100vw-1.5rem)] rounded-[16px] border border-stone-200/90 bg-white p-1.5 shadow-[0_18px_34px_rgba(15,23,42,0.12)] sm:w-60 sm:max-w-[calc(100vw-2rem)]"
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
                  className={finderMenuOptionClassName(sortBy === option.value)}
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold tracking-tight">{option.label}</span>
                    <span className="mt-0.5 hidden text-[11px] leading-5 text-slate-500 sm:block">
                      {option.description}
                    </span>
                  </span>
                  {sortBy === option.value ? (
                    <span className="ml-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 shadow-sm">
                      <CheckIcon />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderFilterControl(params: {
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    menuRef: React.RefObject<HTMLDivElement | null>;
    menuId: string;
    label: string;
    valueLabel: string;
    isOpen: boolean;
    onToggle: () => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    options: FilterOption[];
    selectedValue: string;
    itemRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>;
    onSelect: (value: string) => void;
    onOptionKeyDown: (index: number, event: React.KeyboardEvent<HTMLButtonElement>) => void;
  }) {
    return (
      <div ref={params.menuRef} className="relative">
        <button
          ref={params.buttonRef}
          type="button"
          aria-label={`Filter by ${params.label.toLowerCase()}`}
          aria-haspopup="menu"
          aria-expanded={params.isOpen}
          aria-controls={params.menuId}
          onClick={params.onToggle}
          onKeyDown={params.onKeyDown}
          className={`inline-flex min-h-[48px] w-full items-center justify-between gap-2.5 rounded-[14px] border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
            params.isOpen
              ? "border-slate-300 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
              : "border-stone-200/80 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.04)] hover:border-stone-300/90 hover:bg-stone-50/60 hover:shadow-[0_8px_16px_rgba(15,23,42,0.05)]"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                params.isOpen ? "border-sky-100 bg-sky-50 text-sky-700" : "border-stone-200 bg-stone-50 text-slate-500"
              }`}
            >
              <FilterIcon />
            </span>
            <span className="min-w-0 truncate text-[13px] tracking-tight text-slate-900">
              <span className="font-medium text-slate-400">{params.label}</span>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="font-semibold">{params.valueLabel}</span>
            </span>
          </span>
          <span className={`shrink-0 text-slate-300 transition ${params.isOpen ? "rotate-180 text-slate-500" : ""}`}>
            <ChevronDownIcon />
          </span>
        </button>

        {params.isOpen ? (
          <div
            id={params.menuId}
            role="menu"
            aria-label={`${params.label} options`}
            aria-orientation="vertical"
            className="absolute left-0 top-[calc(100%+0.45rem)] z-[60] w-full rounded-[16px] border border-stone-200/90 bg-white p-1.5 shadow-[0_18px_34px_rgba(15,23,42,0.12)] md:max-w-[250px]"
          >
            <div className="space-y-1">
              {params.options.map((option, index) => (
                <button
                  key={option.value}
                  ref={(node) => {
                    params.itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-label={option.label}
                  aria-checked={params.selectedValue === option.value}
                  tabIndex={params.selectedValue === option.value ? 0 : -1}
                  onClick={() => params.onSelect(option.value)}
                  onKeyDown={(event) => params.onOptionKeyDown(index, event)}
                  className={finderMenuOptionClassName(params.selectedValue === option.value)}
                >
                  <span className="min-w-0">
                    <span className={`block text-[9px] font-medium uppercase tracking-[0.18em] ${params.selectedValue === option.value ? "text-slate-500" : "text-slate-400"}`}>
                      {option.eyebrow}
                    </span>
                    <span className="mt-0.5 block text-[13px] font-semibold tracking-tight">{option.label}</span>
                  </span>
                  {params.selectedValue === option.value ? (
                    <span className="ml-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 shadow-sm">
                      <CheckIcon />
                    </span>
                  ) : null}
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
      <div className="relative z-30">
        <div className="rounded-[18px] border border-stone-200/80 bg-white p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-3">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Mountain finder</p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{sorted.length} mountains</span>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.65fr)_0.95fr_1fr_0.9fr]">
            <label className="block">
              <span className="sr-only">Search mountains</span>
              <div className="flex min-h-[48px] items-center gap-2.5 rounded-[14px] border border-stone-200/80 bg-white px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-sky-200">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-slate-500">
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
                  placeholder="Search mountain or region"
                  className="min-w-0 flex-1 bg-transparent text-[13px] font-medium tracking-tight text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                />
                {query.trim().length > 0 ? (
                  <button
                    type="button"
                    aria-label="Clear mountain search"
                    onClick={() => setQuery("")}
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-slate-500 transition hover:border-stone-300 hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  >
                    <ClearIcon />
                  </button>
                ) : null}
              </div>
              <div aria-live="polite" className="sr-only">{isSearching && query.trim().length > 0 ? "Searching mountains..." : null}</div>
            </label>

            {renderFilterControl({
              buttonRef: regionButtonRef,
              menuRef: regionMenuRef,
              menuId: regionMenuId,
              label: "Region",
              valueLabel: region === "All" ? "All regions" : region,
              isOpen: showRegionMenu,
              onToggle: () => {
                if (showRegionMenu) {
                  closeRegionMenu();
                  return;
                }
                openRegionMenu();
              },
              onKeyDown: (event) => handleFilterTriggerKeyDown(event, openRegionMenu, regionOptions.length - 1),
              options: regionOptions,
              selectedValue: region,
              itemRefs: regionItemRefs,
              onSelect: selectRegionOption,
              onOptionKeyDown: (index, event) =>
                handleFilterOptionKeyDown(index, event, focusRegionItem, closeRegionMenu, regionOptions.length),
            })}

            {renderFilterControl({
              buttonRef: difficultyButtonRef,
              menuRef: difficultyMenuRef,
              menuId: difficultyMenuId,
              label: "Difficulty",
              valueLabel: difficulty === "All" ? "All difficulty groups" : `${difficulty} (${difficultyRangeLabel(difficulty)}/9)`,
              isOpen: showDifficultyMenu,
              onToggle: () => {
                if (showDifficultyMenu) {
                  closeDifficultyMenu();
                  return;
                }
                openDifficultyMenu();
              },
              onKeyDown: (event) => handleFilterTriggerKeyDown(event, openDifficultyMenu, difficultyFilterOptions.length - 1),
              options: difficultyFilterOptions,
              selectedValue: difficulty,
              itemRefs: difficultyItemRefs,
              onSelect: (value) => selectDifficultyOption(value as "All" | DifficultyBand),
              onOptionKeyDown: (index, event) =>
                handleFilterOptionKeyDown(index, event, focusDifficultyItem, closeDifficultyMenu, difficultyFilterOptions.length),
            })}

            {renderSortControl()}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-5 pb-24">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-slate-950">{getSortHeading(sortBy)}</h2>
          <p className="hidden text-xs font-medium text-slate-500 sm:block">Sorted by {activeSort.label}</p>
        </div>

        {sorted.length === 0 ? (
          <section className="rounded-[30px] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,252,248,0.94),rgba(255,255,255,0.98))] p-6 text-center shadow-[0_16px_30px_rgba(15,23,42,0.05)]">
            <p className="text-base font-semibold text-slate-950">No mountains match those filters yet.</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Try a broader region, remove the difficulty filter, or search with a shorter mountain name.</p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2"
              >
                Reset mountain finder
              </button>
            ) : null}
          </section>
        ) : sortBy === "difficulty" ? (
          groupedOrder
            .filter((band) => (grouped.get(band)?.length ?? 0) > 0)
            .map((band, bandIndex) => {
              const mountainsByBand = grouped.get(band) ?? [];

              return (
                <section key={band} className="scroll-mt-44 md:scroll-mt-32">
                  <div className="mb-3 px-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {band} <span className="font-normal text-slate-500">· {difficultyRangeLabel(band)}/9</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {mountainsByBand.map((mountain, index) => (
                      <MountainCard key={mountain.id} mountain={mountain} eagerLoad={bandIndex === 0 && index === 0} />
                    ))}
                  </div>
                </section>
              );
            })
        ) : (
          <section className="scroll-mt-44 md:scroll-mt-32">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((mountain, index) => (
                <MountainCard key={mountain.id} mountain={mountain} eagerLoad={index === 0} />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
