
"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { RecommendationPill } from "@/components/mountains/recommendation-pill";
import { getMountainVerificationSummary } from "@/lib/content-quality";
import { addDays, differenceInDays, formatISODate, isValidDate } from "@/lib/date";
import { getSelectedReliability } from "@/lib/weather/reliability";
import type { WeatherCheckResult } from "@/types/hiking";

type PlannerMountain = {
  id: string;
  name: string;
  slug: string;
  region: string;
  province: string;
  lat: number;
  lon: number;
  image_url: string;
  image_verified?: boolean;
  difficulty_source_url?: string;
  difficulty_score: number;
  summary: string;
};

type Props = {
  mountains: PlannerMountain[];
  initialDate?: string;
};

type MetricTone = {
  label: string;
  detail: string;
  containerClassName: string;
  pillClassName: string;
  valueClassName: string;
  accentClassName: string;
};

function SectionIcon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm" aria-hidden="true">
      {children}
    </span>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.5 11.3 6l3.2 1.2-3.2 1.2L10 12l-1.3-3.6L5.5 7.2 8.7 6 10 2.5Z" />
      <path d="M15.5 11.5 16.2 13.4l1.8.7-1.8.7-.7 1.9-.7-1.9-1.8-.7 1.8-.7.7-1.9Z" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7" />
      <path d="m8 12 1.6-4.2L14 6l-1.8 4.4L8 12Z" />
    </svg>
  );
}

function CloudSunIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 7.2A3.2 3.2 0 0 1 12 5.4a2.8 2.8 0 0 1 3.3 3.8 2.8 2.8 0 0 1-.8 5.5H6.8a2.8 2.8 0 1 1-.3-5.5" />
      <path d="M6.4 3.3v1.5M3.4 6.3h1.5M4.4 4.2l1 1M8.4 4.2l-1 1" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2.8c1.8 1.2 3.8 1.8 5.8 1.9v4.4c0 3.8-2.4 6.4-5.8 8-3.4-1.6-5.8-4.2-5.8-8V4.7c2-.1 4-.7 5.8-1.9Z" />
      <path d="m7.8 10 1.5 1.5 3-3.2" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 16.5h13" />
      <path d="M6 13V9.5M10 13V6.5M14 13V8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="13" height="11.5" rx="2" />
      <path d="M6.5 2.8v3M13.5 2.8v3M3.5 8h13" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4.2h8.2a2.3 2.3 0 0 1 2.3 2.3v9.3H7.2A2.2 2.2 0 0 0 5 18V4.2Z" />
      <path d="M5 4.2h7.8v11.6H7.2A2.2 2.2 0 0 0 5 18" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.8 12.5a3 3 0 1 1 .3-6 3.6 3.6 0 0 1 6.7 1.3 2.6 2.6 0 1 1 .2 5.1H6.8Z" />
      <path d="m7.2 14.2-.8 1.5M10.2 14.2l-.8 1.5M13.2 14.2l-.8 1.5" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.2s4 4.3 4 7a4 4 0 1 1-8 0c0-2.7 4-7 4-7Z" />
    </svg>
  );
}

function WindIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.2h9.5a2 2 0 1 0-2-2" />
      <path d="M3 11.3h11.5a2 2 0 1 1-2 2" />
      <path d="M3 14.5h6.5" />
    </svg>
  );
}

function ThermometerIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4.2a1.8 1.8 0 0 0-1.8 1.8v5.6a3 3 0 1 0 3.6 0V6A1.8 1.8 0 0 0 10 4.2Z" />
      <path d="M10 8.2v4.2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13 13 3.5 3.5" />
    </svg>
  );
}

function formatReadableDate(value: string): string {
  if (!isValidDate(value)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${value}T00:00:00`));
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

function mountainSearchTokens(value: string): string[] {
  return normalizeMountainSearch(value).split(" ").filter(Boolean);
}

function mountainSearchScore(mountain: PlannerMountain, query: string): number {
  if (!query) {
    return 0;
  }

  const name = normalizeMountainSearch(mountain.name);
  const province = normalizeMountainSearch(mountain.province);
  const region = normalizeMountainSearch(mountain.region);
  const haystack = `${name} ${province} ${region}`;
  const tokens = mountainSearchTokens(query);

  let score = 0;

  if (name === query) {
    score += 150;
  }

  if (haystack === query) {
    score += 120;
  }

  if (name.startsWith(query)) {
    score += 90;
  }

  if (province.startsWith(query)) {
    score += 70;
  }

  if (region.startsWith(query)) {
    score += 60;
  }

  if (haystack.includes(query)) {
    score += 40;
  }

  for (const token of tokens) {
    if (name.startsWith(token)) {
      score += 18;
    } else if (name.includes(token)) {
      score += 12;
    }

    if (province.startsWith(token)) {
      score += 10;
    } else if (province.includes(token)) {
      score += 6;
    }

    if (region.startsWith(token)) {
      score += 10;
    } else if (region.includes(token)) {
      score += 6;
    }
  }

  return score;
}

function quickPickScore(mountain: PlannerMountain, selectedMountain: PlannerMountain | null): number {
  if (!selectedMountain) {
    return 0;
  }

  let score = 0;

  if (mountain.province === selectedMountain.province) {
    score += 4;
  }

  if (mountain.region === selectedMountain.region) {
    score += 2;
  }

  score -= Math.abs(mountain.difficulty_score - selectedMountain.difficulty_score) / 100;

  return score;
}

function mountainRelationshipLabel(mountain: PlannerMountain, selectedMountain: PlannerMountain | null): string | null {
  if (!selectedMountain) {
    return null;
  }

  if (mountain.province === selectedMountain.province) {
    return "Same province";
  }

  if (mountain.region === selectedMountain.region) {
    return "Same region";
  }

  return null;
}

function tomorrowIso(): string {
  return formatISODate(addDays(new Date(), 1));
}

function resultSummary(result: WeatherCheckResult): string {
  if (result.mode === "climate") {
    return "Advance planning guidance only. Recheck near hike day for a day-level forecast.";
  }

  if (result.recommendation === "Good") {
    return "Forecast conditions look favorable enough for most hikers.";
  }

  if (result.recommendation === "Caution") {
    return "Conditions are mixed. Hiking may still be okay, but plan for extra caution.";
  }

  return "Weather risk is high enough that moving the hike is usually safer.";
}

function reliabilityTone(accuracy: number): string {
  if (accuracy >= 85) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (accuracy >= 65) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

function reliabilityMeaning(accuracy: number): string {
  if (accuracy >= 85) {
    return "Reliable enough for final go or no-go decisions.";
  }

  if (accuracy >= 65) {
    return "Useful for planning, but still worth rechecking closer to the date.";
  }

  return "Use this only as advance guidance, not a final hike decision.";
}

function cardTone(result: WeatherCheckResult): string {
  if (result.mode === "climate") {
    return "border-amber-200 bg-[linear-gradient(180deg,#fffdf5_0%,#fff7ed_100%)]";
  }

  if (result.recommendation === "Good") {
    return "border-emerald-200 bg-[linear-gradient(180deg,#f8fffb_0%,#ecfdf5_100%)]";
  }

  if (result.recommendation === "Caution") {
    return "border-amber-200 bg-[linear-gradient(180deg,#fffdf8_0%,#fffbeb_100%)]";
  }

  return "border-rose-200 bg-[linear-gradient(180deg,#fff9f9_0%,#fff1f2_100%)]";
}

function rainChanceTone(value: number): MetricTone {
  if (value >= 70) {
    return {
      label: "High",
      detail: "Rain likely",
      containerClassName: "border-sky-200 bg-sky-50",
      pillClassName: "bg-sky-100 text-sky-800",
      valueClassName: "text-sky-950",
      accentClassName: "bg-sky-500",
    };
  }

  if (value >= 35) {
    return {
      label: "Medium",
      detail: "Showers possible",
      containerClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      accentClassName: "bg-amber-500",
    };
  }

  return {
    label: "Low",
    detail: "Lower rain chance",
    containerClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-950",
    accentClassName: "bg-emerald-500",
  };
}

function rainAmountTone(value: number): MetricTone {
  if (value <= 0) {
    return {
      label: "None",
      detail: "No rain expected",
      containerClassName: "border-emerald-200 bg-emerald-50",
      pillClassName: "bg-emerald-100 text-emerald-800",
      valueClassName: "text-emerald-950",
      accentClassName: "bg-emerald-500",
    };
  }

  if (value >= 8) {
    return {
      label: "Heavy",
      detail: "Trails likely wet",
      containerClassName: "border-sky-200 bg-sky-50",
      pillClassName: "bg-sky-100 text-sky-800",
      valueClassName: "text-sky-950",
      accentClassName: "bg-sky-500",
    };
  }

  if (value >= 2) {
    return {
      label: "Moderate",
      detail: "Some rain expected",
      containerClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      accentClassName: "bg-amber-500",
    };
  }

  return {
    label: "Light",
    detail: "Light rain possible",
    containerClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-950",
    accentClassName: "bg-emerald-500",
  };
}

function windTone(value: number): MetricTone {
  if (value >= 35) {
    return {
      label: "Strong",
      detail: "Exposed areas riskier",
      containerClassName: "border-rose-200 bg-rose-50",
      pillClassName: "bg-rose-100 text-rose-800",
      valueClassName: "text-rose-950",
      accentClassName: "bg-rose-500",
    };
  }

  if (value >= 20) {
    return {
      label: "Breezy",
      detail: "Noticeable wind",
      containerClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      accentClassName: "bg-amber-500",
    };
  }

  return {
    label: "Calm",
    detail: "Comfortable wind",
    containerClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-950",
    accentClassName: "bg-emerald-500",
  };
}

function feelsLikeTone(value: number): MetricTone {
  if (value >= 35) {
    return {
      label: "Hot",
      detail: "Heat can drain energy",
      containerClassName: "border-rose-200 bg-rose-50",
      pillClassName: "bg-rose-100 text-rose-800",
      valueClassName: "text-rose-950",
      accentClassName: "bg-rose-500",
    };
  }

  if (value >= 30) {
    return {
      label: "Warm",
      detail: "Hydrate more often",
      containerClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      accentClassName: "bg-amber-500",
    };
  }

  if (value >= 18) {
    return {
      label: "Comfortable",
      detail: "Good hiking feel",
      containerClassName: "border-emerald-200 bg-emerald-50",
      pillClassName: "bg-emerald-100 text-emerald-800",
      valueClassName: "text-emerald-950",
      accentClassName: "bg-emerald-500",
    };
  }

  return {
    label: "Cool",
    detail: "Bring a light layer",
    containerClassName: "border-sky-200 bg-sky-50",
    pillClassName: "bg-sky-100 text-sky-800",
    valueClassName: "text-sky-950",
    accentClassName: "bg-sky-500",
  };
}

function rainAmountMeaning(value: number): string {
  if (value <= 0) {
    return "No rain expected";
  }

  if (value < 2) {
    return "Light rain amount";
  }

  if (value < 8) {
    return "Moderate rain amount";
  }

  return "Heavy rain amount";
}

function wetMonthMeaning(wetDayChance: number): string {
  if (wetDayChance >= 55) {
    return "Historically wet month";
  }

  if (wetDayChance >= 35) {
    return "Mixed rain month";
  }

  return "Usually drier month";
}

function compactReasons(result: WeatherCheckResult): string[] {
  return result.reasons.slice(0, 2);
}

function LoadingHomeResult() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="mt-3 h-8 w-52 rounded-full bg-slate-200" />
        <div className="mt-2 h-4 w-10/12 rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-9/12 rounded-full bg-slate-100" />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div className="h-3 w-16 rounded-full bg-slate-200" />
              <div className="mt-3 h-6 w-20 rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-24 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  unit,
  tone,
  icon,
}: {
  title: string;
  value: string;
  unit?: string;
  tone: MetricTone;
  icon: ReactNode;
}) {
  return (
    <article className={`relative overflow-hidden rounded-[24px] border px-4 py-4 ${tone.containerClassName}`}>
      <span className={`absolute inset-x-0 top-0 h-1.5 ${tone.accentClassName}`} aria-hidden="true" />
      <div className="flex min-h-[168px] flex-col">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-2">
            <span className="mt-0.5 text-base leading-none text-slate-700" aria-hidden="true">
              {icon}
            </span>
            <p className="max-w-[6rem] text-[11px] uppercase leading-5 tracking-[0.14em] text-slate-500">{title}</p>
          </div>
          <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${tone.pillClassName}`}>
            {tone.label}
          </span>
        </div>
        <div className="mt-5 flex items-baseline gap-1.5">
          <p className={`text-[2.25rem] font-semibold leading-none tracking-tight ${tone.valueClassName}`}>{value}</p>
          {unit ? <p className="text-sm font-semibold leading-none text-slate-600">{unit}</p> : null}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{tone.detail}</p>
      </div>
    </article>
  );
}

function smoothScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "smooth";
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function scheduleResultScroll(target: HTMLElement | null) {
  if (!target || typeof window === "undefined") {
    return;
  }

  const behavior = smoothScrollBehavior();
  const header = document.querySelector("header");
  const headerHeight = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
  const isSmallScreen = window.innerWidth < 640;
  const topOffset = headerHeight + (isSmallScreen ? 160 : 76);
  const targetTop = window.scrollY + target.getBoundingClientRect().top - topOffset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior,
  });
}

export function HomePlannerClient({ mountains, initialDate }: Props) {
  const startingDate = initialDate && isValidDate(initialDate) ? initialDate : tomorrowIso();
  const [mountainId, setMountainId] = useState(mountains[0]?.id ?? "");
  const [mountainQuery, setMountainQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);
  const [date, setDate] = useState(startingDate);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeatherCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announceMessage, setAnnounceMessage] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const comboboxWrapRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const primaryDecisionRef = useRef<HTMLElement | null>(null);
  const listboxId = useId();
  const deferredMountainQuery = useDeferredValue(mountainQuery);

  const selectedMountain = useMemo(
    () => mountains.find((mountain) => mountain.id === mountainId) ?? null,
    [mountainId, mountains],
  );
  const verification = selectedMountain ? getMountainVerificationSummary(selectedMountain) : null;

  const quickMountainPicks = useMemo(
    () =>
      mountains
        .filter((mountain) => mountain.id !== mountainId)
        .sort((a, b) => {
          const scoreDifference = quickPickScore(b, selectedMountain) - quickPickScore(a, selectedMountain);
          return scoreDifference || a.name.localeCompare(b.name);
        })
        .slice(0, 8),
    [mountainId, mountains, selectedMountain],
  );

  const pickerOptions = useMemo(() => {
    const query = normalizeMountainSearch(deferredMountainQuery);

    if (!query) {
      return quickMountainPicks;
    }

    return mountains
      .filter((mountain) => mountain.id !== mountainId)
      .map((mountain) => ({ mountain, score: mountainSearchScore(mountain, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.mountain.name.localeCompare(b.mountain.name))
      .slice(0, 10)
      .map(({ mountain }) => mountain);
  }, [deferredMountainQuery, mountainId, mountains, quickMountainPicks]);

  const normalizedImmediateQuery = normalizeMountainSearch(mountainQuery);
  const normalizedDeferredQuery = normalizeMountainSearch(deferredMountainQuery);
  const isFiltering = normalizedImmediateQuery !== normalizedDeferredQuery;
  const hasMountainQuery = mountainQuery.trim().length > 0;
  const shouldShowOptions = isPickerOpen || mountainQuery.trim().length > 0 || isFiltering;
  const activeMountain = pickerOptions[activeOptionIndex] ?? null;
  const activeOptionId = !isFiltering && activeMountain ? `${listboxId}-${activeMountain.id}` : undefined;
  const pickerSummary =
    isFiltering
      ? "Filtering mountains..."
      : hasMountainQuery
        ? `${pickerOptions.length} search result${pickerOptions.length === 1 ? "" : "s"}`
        : `${pickerOptions.length} quick pick${pickerOptions.length === 1 ? "" : "s"}`;
  const pickerSupportCopy =
    hasMountainQuery
      ? "Match by mountain name, province, or region."
      : selectedMountain
        ? `Quick picks prioritize ${selectedMountain.province} and nearby alternatives.`
        : `${mountains.length} mountains ready to search.`;
  const searchPromptChips = useMemo(() => {
    const suggestions = [
      selectedMountain?.province,
      selectedMountain?.region,
      quickMountainPicks[0]?.name,
      quickMountainPicks[0]?.province,
      quickMountainPicks[1]?.region,
    ].filter((value): value is string => Boolean(value));

    return Array.from(new Set(suggestions)).slice(0, 4);
  }, [quickMountainPicks, selectedMountain]);

  const todayIso = formatISODate(new Date());
  const daysAhead = Math.max(0, differenceInDays(new Date(`${date}T00:00:00`), new Date(`${todayIso}T00:00:00`)));
  const selectedReliability = getSelectedReliability(daysAhead);
  const confidenceHint =
    daysAhead <= 15
      ? "Selected date still uses day-level forecast data."
      : "Selected date uses lower-confidence month history guidance.";

  const metricGuides = useMemo(() => {
    if (!result?.metrics) {
      return null;
    }

    return {
      rainChance: rainChanceTone(result.metrics.precipitationProbability),
      rainAmount: rainAmountTone(result.metrics.precipitationSum),
      wind: windTone(result.metrics.windSpeedMax),
      feelsLike: feelsLikeTone(result.metrics.apparentTemperatureMax),
    };
  }, [result]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!comboboxWrapRef.current?.contains(event.target as Node)) {
        setIsPickerOpen(false);
        setActiveOptionIndex(0);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    if (activeOptionIndex > pickerOptions.length - 1) {
      setActiveOptionIndex(0);
    }
  }, [activeOptionIndex, pickerOptions.length]);

  function onMountainSearch(query: string) {
    setMountainQuery(query);
    setIsPickerOpen(true);
    setActiveOptionIndex(0);
  }

  function selectMountain(mountain: PlannerMountain) {
    setMountainId(mountain.id);
    setMountainQuery("");
    setIsPickerOpen(false);
    setActiveOptionIndex(0);
    setAnnounceMessage(`${mountain.name} selected`);
  }

  function onMountainSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (isFiltering) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsPickerOpen(false);
        setActiveOptionIndex(0);
      }
      return;
    }

    if (!shouldShowOptions && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      setIsPickerOpen(true);
      setActiveOptionIndex(0);
      return;
    }

    if (!pickerOptions.length) {
      if (event.key === "Escape") {
        setIsPickerOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveOptionIndex((current) => (current + 1) % pickerOptions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveOptionIndex((current) => (current - 1 + pickerOptions.length) % pickerOptions.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const picked = pickerOptions[activeOptionIndex] ?? pickerOptions[0];
      if (picked) {
        selectMountain(picked);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsPickerOpen(false);
      setActiveOptionIndex(0);
    }
  }

  async function onCheck() {
    if (!selectedMountain) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather/check?lat=${selectedMountain.lat}&lon=${selectedMountain.lon}&date=${date}`);
      const data = (await response.json()) as WeatherCheckResult | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to check weather right now.");
      }

      const parsed = data as WeatherCheckResult;
      setResult(parsed);
      setShowMoreDetails(parsed.mode === "climate");
      const verdict = parsed.recommendation ?? "Planning guidance";
      setAnnounceMessage(`${verdict}. Forecast confidence ${parsed.reliability.estimatedAccuracy} percent.`);
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          scheduleResultScroll(primaryDecisionRef.current ?? resultsRef.current);
        }, 120);
      });
    } catch (caughtError) {
      setResult(null);
      const message = caughtError instanceof Error ? caughtError.message : "Unable to check weather right now.";
      setError(message);
      setAnnounceMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announceMessage}
      </p>

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1.2fr),360px]">
        <div className="order-2 bg-[linear-gradient(180deg,#fcfcfd_0%,#f8fafc_100%)] p-4 sm:p-5 xl:order-1">
          <div ref={resultsRef} className="scroll-mt-24 sm:scroll-mt-28" />
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Live result</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">Weather result for your selected hike</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedMountain ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {selectedMountain.name} • {selectedMountain.province}
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {formatReadableDate(date)}
                </span>
              </div>
            </div>
            <Link
              href={selectedMountain ? `/mountains/${selectedMountain.slug}?date=${date}` : "/mountains"}
              className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
            >
              Full details
            </Link>
          </div>

          {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-3 py-3 text-sm text-rose-700">{error}</p> : null}

          {loading ? (
            <LoadingHomeResult />
          ) : result ? (
            <div className="space-y-4" aria-live="polite" aria-atomic="true">
              <article ref={primaryDecisionRef} className={`overflow-hidden rounded-[30px] border p-5 shadow-sm ${cardTone(result)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <SectionIcon>
                        <SparklesIcon />
                      </SectionIcon>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Primary decision</p>
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-600">{formatReadableDate(result.date)}</p>
                    <h4 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      {result.recommendation === "Good"
                        ? "Good day for hiking"
                        : result.recommendation === "Caution"
                          ? "Possible, but use caution"
                          : result.recommendation === "Not Recommended"
                            ? "Not recommended for hiking"
                            : "Planning guidance only"}
                    </h4>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">{resultSummary(result)}</p>
                  </div>
                  <div className="self-start">
                    {result.recommendation ? <RecommendationPill value={result.recommendation} /> : null}
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-white/70 bg-white/65 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <SectionIcon>
                      <CompassIcon />
                    </SectionIcon>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Why this result</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {compactReasons(result).map((reason) => (
                      <span key={reason} className="rounded-full border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-700 shadow-sm">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </article>

              {metricGuides && result.metrics ? (
                <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <SectionIcon>
                      <CloudSunIcon />
                    </SectionIcon>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Weather diagnostics</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MetricCard
                      title="Rain chance"
                      value={String(result.metrics.precipitationProbability)}
                      unit="%"
                      tone={metricGuides.rainChance}
                      icon={<RainIcon />}
                    />
                    <MetricCard
                      title="Rain (mm)"
                      value={String(result.metrics.precipitationSum)}
                      unit="mm"
                      tone={metricGuides.rainAmount}
                      icon={<DropletIcon />}
                    />
                    <MetricCard
                      title="Wind"
                      value={String(result.metrics.windSpeedMax)}
                      unit="km/h"
                      tone={metricGuides.wind}
                      icon={<WindIcon />}
                    />
                    <MetricCard
                      title="Feels like"
                      value={String(result.metrics.apparentTemperatureMax)}
                      unit="°C"
                      tone={metricGuides.feelsLike}
                      icon={<ThermometerIcon />}
                    />
                  </div>
                </section>
              ) : null}

              <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                      T
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <SectionIcon>
                          <ShieldIcon />
                        </SectionIcon>
                        <p className="text-sm font-semibold text-slate-950">How reliable</p>
                      </div>
                      <p className="ml-10 text-xs text-slate-500">{selectedReliability.label} outlook</p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${reliabilityTone(result.reliability.estimatedAccuracy)}`}>
                    {result.reliability.estimatedAccuracy >= 85 ? "High trust" : result.reliability.estimatedAccuracy >= 65 ? "Moderate trust" : "Low trust"}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{result.reliability.estimatedAccuracy}% forecast trust</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{reliabilityMeaning(result.reliability.estimatedAccuracy)}</p>
              </article>

              <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((current) => !current)}
                  aria-expanded={showMoreDetails}
                  className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <SectionIcon>
                        <ChartIcon />
                      </SectionIcon>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">More details</p>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-950">Selected-date rain and 2-year month history</p>
                    {result.mode === "climate" ? (
                      <p className="mt-2 text-xs leading-5 text-amber-700">
                        Recommended for this result. This date is outside day-level forecast range.
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      result.mode === "climate"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {showMoreDetails ? "Hide" : "Show"}
                  </span>
                </button>

                {showMoreDetails ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <article className="rounded-[24px] border border-sky-200 bg-sky-50 px-4 py-4">
                      <div className="flex items-center gap-2">
                        <SectionIcon>
                          <CalendarIcon />
                        </SectionIcon>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Selected date</p>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{formatReadableDate(result.date)}</p>
                      {result.metrics ? (
                        <span className="mt-2 inline-flex rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-800">
                          {rainAmountMeaning(result.metrics.precipitationSum)}
                        </span>
                      ) : null}
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {result.metrics
                          ? `${result.metrics.precipitationProbability}% rain chance with ${result.metrics.precipitationSum} mm forecast rain.`
                          : "Day-level rain forecast is unavailable for this date range."}
                      </p>
                    </article>

                    <article className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4">
                      <div className="flex items-center gap-2">
                        <SectionIcon>
                          <BookIcon />
                        </SectionIcon>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">2-year month history</p>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{result.history.targetMonthWetDayChance}% wet days</p>
                      <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                        {wetMonthMeaning(result.history.targetMonthWetDayChance)}
                      </span>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Around {result.history.targetMonthAvgPrecipitation} mm average rain for this target month in the last 2 years.
                      </p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{result.history.note}</p>
                    </article>
                  </div>
                ) : null}
              </section>

              {result.mode === "climate" && !showMoreDetails ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 shadow-sm">
                  More details is the most useful part for this long-range result because it shows the recent month history behind the guidance.
                </div>
              ) : null}

              <div className="sm:hidden">
                <Link
                  href={selectedMountain ? `/mountains/${selectedMountain.slug}?date=${date}` : "/mountains"}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  Open full mountain details
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-8 text-center shadow-sm">
              <div className="max-w-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Ready to check</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Your weather result will appear here.</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Pick a mountain and date on the right, then check if the day looks good for hiking.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="order-1 border-b border-slate-200/80 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f8f5_100%)] p-4 sm:p-5 xl:order-2 xl:border-b-0 xl:border-l">
          <div className="rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-sky-700">Weather check</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">Choose a mountain and see if the day looks hike-friendly.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Minimal, fast, and made for quick hiking decisions on your phone.</p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Best use</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">3 to 7 days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Long range</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">History guided</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <section className="rounded-[28px] border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Choose mountain</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Search {mountains.length} mountains by name, province, or region.</p>
                </div>
                <Link
                  href="/mountains"
                  className="inline-flex shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Browse all
                </Link>
              </div>

              {selectedMountain ? (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#f8fffb_0%,#effcf5_100%)] px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700">Current pick</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-950">{selectedMountain.name}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {selectedMountain.province}, {selectedMountain.region}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Ready
                    </span>
                  </div>
                </div>
              ) : null}

              <div ref={comboboxWrapRef} className="mt-3">
                <div className="rounded-[24px] border border-sky-200/80 bg-[linear-gradient(180deg,#f8fcff_0%,#eef7ff_100%)] p-3 shadow-[0_14px_28px_rgba(14,165,233,0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-sky-700">Mountain search</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">Find a mountain fast</p>
                    </div>
                    <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-800">
                      {hasMountainQuery ? "Searching" : "Quick search"}
                    </span>
                  </div>

                  <div className="relative mt-3">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm"
                      aria-hidden="true"
                    >
                      <SearchIcon />
                    </span>
                    <input
                      id="home-mountain-search"
                      type="search"
                      role="combobox"
                      aria-label="Search mountains"
                      aria-autocomplete="list"
                      aria-haspopup="listbox"
                      aria-expanded={shouldShowOptions}
                      aria-controls={listboxId}
                      aria-activedescendant={activeOptionId}
                      aria-describedby="mountain-picker-hint"
                      value={mountainQuery}
                      onChange={(event) => onMountainSearch(event.target.value)}
                      onFocus={() => setIsPickerOpen(true)}
                      onKeyDown={onMountainSearchKeyDown}
                      placeholder="Search mountain, province, or region"
                      autoComplete="off"
                      className="w-full rounded-2xl border border-sky-200 bg-white py-3.5 pl-14 pr-16 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_20px_rgba(148,163,184,0.12)] outline-none ring-sky-300 transition placeholder:text-slate-400 focus:border-sky-300 focus:ring focus-visible:ring-2"
                    />
                    {mountainQuery ? (
                      <button
                        type="button"
                        onClick={() => onMountainSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border border-sky-200 bg-white px-2.5 py-1 text-xs font-medium text-sky-700 shadow-sm transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  {searchPromptChips.length > 0 ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">Try</span>
                      {searchPromptChips.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => onMountainSearch(term)}
                          className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-sky-800 transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div id="mountain-picker-hint" className="mt-2 flex items-start justify-between gap-3 px-1 text-[11px] text-slate-500">
                  <div>
                    <p className="font-medium text-slate-600">{hasMountainQuery ? "Search results" : "Quick picks"}</p>
                    <p className="mt-0.5">{isFiltering ? "Updating mountain results..." : `${pickerSummary} • ${pickerSupportCopy}`}</p>
                  </div>
                  <span className="shrink-0 text-right">Use arrows + Enter or tap</span>
                </div>

                {shouldShowOptions ? (
                  <ul
                    id={listboxId}
                    role="listbox"
                    aria-label="Mountain options"
                    aria-busy={isFiltering}
                    className="mt-2 max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2"
                  >
                    {isFiltering ? (
                      <li className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                        Updating mountain results...
                      </li>
                    ) : pickerOptions.length > 0 ? (
                      pickerOptions.map((mountain, index) => {
                        const isActive = index === activeOptionIndex;
                        const optionId = `${listboxId}-${mountain.id}`;
                        const relationshipLabel = mountainRelationshipLabel(mountain, selectedMountain);

                        return (
                          <li
                            key={mountain.id}
                            id={optionId}
                            role="option"
                            aria-selected={isActive}
                            onMouseDown={(event) => {
                              event.preventDefault();
                            }}
                            onClick={() => selectMountain(mountain)}
                            className={`cursor-pointer rounded-2xl border px-3 py-3 text-left transition ${
                              isActive
                                ? "border-sky-300 bg-sky-50 shadow-sm ring-1 ring-sky-200"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-slate-900">{mountain.name}</p>
                                  {relationshipLabel ? (
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                                      {relationshipLabel}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  {mountain.province}, {mountain.region}
                                </p>
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{mountain.summary}</p>
                              </div>
                              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isActive ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"}`}>
                                {isActive ? "Enter" : "Choose"}
                              </span>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                        <p className="font-medium text-slate-700">No mountain matches that search yet.</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Try a different mountain name, province, or region keyword.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onMountainSearch("")}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                          >
                            Show quick picks
                          </button>
                          <Link
                            href="/mountains"
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Browse mountain list
                          </Link>
                        </div>
                      </li>
                    )}
                  </ul>
                ) : null}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Pick date</p>
              <input
                type="date"
                min={todayIso}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none ring-sky-300 focus:bg-white focus:ring focus-visible:ring-2"
              />
              <div className="mt-3 flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Forecast trust</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{selectedReliability.estimatedAccuracy}%</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${reliabilityTone(selectedReliability.estimatedAccuracy)}`}>
                  {selectedReliability.label}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{confidenceHint}</p>
            </section>

            {selectedMountain ? (
              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                <div className="relative h-36 bg-slate-200">
                  <Image
                    src={selectedMountain.image_url}
                    alt={selectedMountain.name}
                    fill
                    sizes="(max-width: 1280px) 100vw, 380px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-base font-semibold text-slate-950">{selectedMountain.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedMountain.province}, {selectedMountain.region}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{selectedMountain.summary}</p>
                  {verification ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${verification.photoTone}`}>
                        {verification.photoLabel}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${verification.difficultyTone}`}>
                        {verification.difficultyLabel}
                      </span>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur xl:static xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none">
              <button
                type="button"
                onClick={onCheck}
                disabled={loading || !selectedMountain}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                  ) : (
                    <span className="text-base leading-none" aria-hidden="true">↑</span>
                  )}
                  <span>{loading ? "Checking hiking weather..." : "Check hiking weather"}</span>
                </span>
              </button>
                {!loading && selectedMountain ? (
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    Checks {selectedMountain.name} for {formatReadableDate(date)}
                  </p>
                ) : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
