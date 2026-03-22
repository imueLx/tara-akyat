
"use client";

import Image from "next/image";
import Link from "next/link";
import Select, { type SingleValue } from "react-select";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { RecommendationPill } from "@/components/mountains/recommendation-pill";
import { getMountainVerificationSummary } from "@/lib/content-quality";
import { addDays, differenceInDays, formatISODate, isValidDate } from "@/lib/date";
import { getSelectedReliability } from "@/lib/weather/reliability";
import type { WeatherCheckDetails, WeatherCheckResult } from "@/types/hiking";

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

type GuidanceTone = {
  label: string;
  detail: string;
  valueText: string;
  containerClassName: string;
  chipClassName: string;
};

const SECONDARY_SOURCE_LABEL = "Another forecast source";

type MountainOption = {
  value: string;
  label: string;
  mountain: PlannerMountain;
  searchable: string;
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

function historySummary(details: WeatherCheckDetails): string {
  if (details.history.targetMonthWetDayChance >= 55) {
    return "This month has often been wet lately, but that does not mean your date will rain.";
  }

  if (details.history.targetMonthWetDayChance >= 35) {
    return "This month has had mixed wet and dry patterns lately.";
  }

  return "This month has generally been drier lately.";
}

function historyContextTone(wetDayChance: number): GuidanceTone {
  if (wetDayChance >= 55) {
    return {
      containerClassName: "border-sky-200 bg-sky-50",
      chipClassName: "bg-sky-100 text-sky-800",
      label: "Historically wet",
      detail: "Recent history only. Not a live forecast.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  if (wetDayChance >= 35) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "bg-amber-100 text-amber-800",
      label: "Mixed month",
      detail: "Recent history only. Not a live forecast.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "bg-emerald-100 text-emerald-800",
    label: "Usually drier",
    detail: "Recent history only. Not a live forecast.",
    valueText: `${wetDayChance}% wet days`,
  };
}

function secondaryForecastTone(details: WeatherCheckDetails): GuidanceTone {
  const secondaryMetrics = details.consensus.secondaryMetrics;

  if (!secondaryMetrics) {
    return {
      containerClassName: "border-slate-200 bg-white",
      chipClassName: "bg-slate-100 text-slate-700",
      label: "Unavailable",
      detail: details.consensus.note,
      valueText: details.consensus.secondaryAvailable ? "No secondary weather detail" : "Secondary provider not connected",
    };
  }

  const rainChance = secondaryMetrics.precipitationProbability;
  const rainMm = secondaryMetrics.precipitationSum;

  if (rainChance >= 70 || rainMm >= 8) {
    return {
      containerClassName: "border-sky-200 bg-sky-50",
      chipClassName: "bg-sky-100 text-sky-800",
      label: "Wet signal",
      detail: `${SECONDARY_SOURCE_LABEL} cross-check for the same selected date.`,
      valueText: `${rainChance}% chance, ${rainMm} mm`,
    };
  }

  if (rainChance >= 35 || rainMm >= 2) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "bg-amber-100 text-amber-800",
      label: "Mixed signal",
      detail: `${SECONDARY_SOURCE_LABEL} cross-check for the same selected date.`,
      valueText: `${rainChance}% chance, ${rainMm} mm`,
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "bg-emerald-100 text-emerald-800",
    label: "Dry signal",
    detail: `${SECONDARY_SOURCE_LABEL} cross-check for the same selected date.`,
    valueText: `${rainChance}% chance, ${rainMm} mm`,
  };
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

function LoadingMoreDetails() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" role="status" aria-live="polite" aria-label="Loading more weather details">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`home-detail-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-slate-200 bg-white px-4 py-4">
          <div className="h-3 w-28 rounded-full bg-slate-200" />
          <div className="mt-3 h-5 w-32 rounded-full bg-slate-200" />
          <div className="mt-2 h-4 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-10/12 rounded-full bg-slate-100" />
        </div>
      ))}
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
  const [isMountainPickerFocused, setIsMountainPickerFocused] = useState(false);
  const [date, setDate] = useState(startingDate);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeatherCheckResult | null>(null);
  const [details, setDetails] = useState<WeatherCheckDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announceMessage, setAnnounceMessage] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const primaryDecisionRef = useRef<HTMLElement | null>(null);

  const selectedMountain = useMemo(
    () => mountains.find((mountain) => mountain.id === mountainId) ?? null,
    [mountainId, mountains],
  );
  const verification = selectedMountain ? getMountainVerificationSummary(selectedMountain) : null;
  const mountainOptions = useMemo<MountainOption[]>(
    () =>
      mountains.map((mountain) => ({
        value: mountain.id,
        label: mountain.name,
        mountain,
        searchable: normalizeMountainSearch(`${mountain.name} ${mountain.province} ${mountain.region}`),
      })),
    [mountains],
  );
  const selectedOption = useMemo(
    () => mountainOptions.find((option) => option.value === mountainId) ?? null,
    [mountainId, mountainOptions],
  );
  const selectMenuPortalTarget = typeof document === "undefined" ? undefined : document.body;

  const todayIso = formatISODate(new Date());
  const daysAhead = Math.max(0, differenceInDays(new Date(`${date}T00:00:00`), new Date(`${todayIso}T00:00:00`)));
  const selectedReliability = getSelectedReliability(daysAhead);
  const confidenceHint =
    daysAhead <= 7
      ? "Best range for go or no-go planning."
      : daysAhead <= 15
        ? "Selected date still uses day-level forecast data, but confidence is lower than the next 7 days."
        : daysAhead <= 30
          ? "Days 16 to 30 use month-based planning outlook instead of exact day-level forecast."
          : "Beyond 30 days uses the same calendar date from the last 2 years plus month context for planning.";

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
  const secondaryGuidance = useMemo(() => (details ? secondaryForecastTone(details) : null), [details]);
  const historyGuidance = useMemo(
    () => (details ? historyContextTone(details.history.targetMonthWetDayChance) : null),
    [details],
  );
  const detailsDaysAhead = useMemo(() => {
    if (!details) {
      return null;
    }

    return differenceInDays(new Date(`${details.date}T00:00:00`), new Date(`${todayIso}T00:00:00`));
  }, [details, todayIso]);
  const shouldShowSecondaryForecastCard = detailsDaysAhead !== null && detailsDaysAhead <= 7;

  function onMountainPickerChange(nextOption: SingleValue<MountainOption>) {
    if (!nextOption) {
      return;
    }

    setMountainId(nextOption.value);
    setAnnounceMessage(`${nextOption.label} selected`);
  }

  async function onCheck() {
    if (!selectedMountain) {
      return;
    }

    setLoading(true);
    setError(null);
    setDetails(null);
    setDetailsError(null);
    setShowMoreDetails(false);

    try {
      const response = await fetch(`/api/weather/check?lat=${selectedMountain.lat}&lon=${selectedMountain.lon}&date=${date}`);
      const data = (await response.json()) as WeatherCheckResult | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to check weather right now.");
      }

      const parsed = data as WeatherCheckResult;
      setResult(parsed);
      const verdict = parsed.recommendation ?? "Planning outlook";
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

  async function loadMoreDetails() {
    if (!selectedMountain || !result || detailsLoading || details) {
      return;
    }

    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const response = await fetch(`/api/weather/check/details?lat=${selectedMountain.lat}&lon=${selectedMountain.lon}&date=${result.date}`);
      const data = (await response.json()) as WeatherCheckDetails | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to load more details right now.");
      }

      setDetails(data as WeatherCheckDetails);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load more details right now.";
      setDetailsError(message);
    } finally {
      setDetailsLoading(false);
    }
  }

  function onToggleMoreDetails() {
    const nextOpen = !showMoreDetails;
    setShowMoreDetails(nextOpen);

    if (nextOpen) {
      void loadMoreDetails();
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
                            : "Planning outlook"}
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
                  <div>
                    <div className="flex items-center gap-2">
                      <SectionIcon>
                        <ShieldIcon />
                      </SectionIcon>
                      <p className="text-sm font-semibold text-slate-950">How reliable</p>
                    </div>
                    <p className="ml-10 text-xs text-slate-500">{selectedReliability.label} outlook</p>
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
                  onClick={onToggleMoreDetails}
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
                    <p className="mt-1 text-sm font-semibold text-slate-950">Forecast cross-check and 2-year history</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">The top card cross-checks another provider when available. The history side is background context, not a live forecast.</p>
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

                {showMoreDetails ? detailsLoading ? (
                  <LoadingMoreDetails />
                ) : detailsError ? (
                  <p className="mt-4 rounded-[24px] bg-rose-50 px-4 py-4 text-sm text-rose-700">{detailsError}</p>
                ) : details ? (
                  <div className={`mt-4 grid grid-cols-1 gap-3 ${shouldShowSecondaryForecastCard ? "sm:grid-cols-2" : ""}`}>
                    {shouldShowSecondaryForecastCard ? (
                      <article className={`rounded-[24px] border px-4 py-4 ${secondaryGuidance?.containerClassName ?? "border-sky-200 bg-sky-50"}`}>
                        <div className="flex items-center gap-2">
                          <SectionIcon>
                            <CalendarIcon />
                          </SectionIcon>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Another forecast source</p>
                        </div>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          Secondary check
                          {details.consensus.secondaryRecommendation ? ` says ${details.consensus.secondaryRecommendation}` : ""}
                        </p>
                        <span className={`mt-2 inline-flex rounded-full border border-white/70 px-2.5 py-1 text-[11px] font-semibold ${secondaryGuidance?.chipClassName ?? "bg-white text-sky-800"}`}>
                          {secondaryGuidance?.label ?? "No data"}
                        </span>
                        <p className="mt-2 text-sm font-semibold text-slate-950">{secondaryGuidance?.valueText ?? "Unavailable"}</p>
                        <p className="mt-2 break-words text-sm leading-6 text-slate-600">{secondaryGuidance?.detail ?? "Secondary forecast guidance is unavailable right now."}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Primary forecast above is from the main forecast source. This card checks the same date with another forecast source.
                        </p>
                      </article>
                    ) : null}

                    <article className={`rounded-[24px] border px-4 py-4 ${historyGuidance?.containerClassName ?? "border-amber-200 bg-amber-50"}`}>
                      <div className="flex items-center gap-2">
                        <SectionIcon>
                          <BookIcon />
                        </SectionIcon>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">2-year history</p>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{historyGuidance?.valueText ?? "Unavailable"}</p>
                      <span className="mt-2 inline-flex rounded-full border border-white/70 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {historyGuidance?.label ?? "No data"}
                      </span>
                      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                        {historyGuidance?.detail ?? historySummary(details)}
                      </p>
                      <div className="mt-3 rounded-[20px] border border-white/80 bg-white/70 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Same date lately</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                          {details.history.targetDateWetDayChance}% wet days, around {details.history.targetDateAvgPrecipitation} mm
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          History only, not a live forecast.
                        </p>
                      </div>
                      <p className="mt-2 break-words text-xs leading-5 text-slate-500">{details.history.note}</p>
                    </article>
                  </div>
                ) : null : null}
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
          <div className="space-y-3">
            <section className="relative overflow-hidden rounded-[30px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.35),transparent_36%),linear-gradient(160deg,#ffffff_0%,#f7fbff_52%,#eef9f3_100%)] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-sky-100/70 blur-2xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl" aria-hidden="true" />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-700">Choose mountain</p>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">Search {mountains.length} mountains by name, province, or region.</p>
                  </div>
                  <Link
                    href="/mountains"
                    className="inline-flex shrink-0 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                  >
                    Browse all
                  </Link>
                </div>

                <div className="mt-4 rounded-[26px] border border-white/80 bg-white/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_24px_rgba(148,163,184,0.12)] backdrop-blur">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Mountain finder</p>
                      <p className="mt-1 text-sm font-semibold text-slate-950">{selectedMountain ? selectedMountain.province : "Start with your next hike"}</p>
                    </div>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-800">
                      Ready
                    </span>
                  </div>

                  <div className="mt-3">
                    <Select<MountainOption, false>
                      instanceId="home-mountain-select"
                      inputId="home-mountain-search"
                      aria-label="Search mountains"
                      options={mountainOptions}
                      value={selectedOption}
                      onChange={onMountainPickerChange}
                      onFocus={() => setIsMountainPickerFocused(true)}
                      onBlur={() => setIsMountainPickerFocused(false)}
                      isSearchable
                      openMenuOnFocus
                      openMenuOnClick
                      controlShouldRenderValue={!isMountainPickerFocused}
                      placeholder="Search mountain, province, or region..."
                      noOptionsMessage={() => "No mountain matches that search yet."}
                      menuPortalTarget={selectMenuPortalTarget}
                      menuPosition="fixed"
                      menuPlacement="auto"
                      unstyled
                      filterOption={({ data }, searchText) => {
                        if (!searchText.trim()) {
                          return true;
                        }

                        const normalizedSearch = normalizeMountainSearch(searchText);
                        if (!normalizedSearch) {
                          return true;
                        }

                        return data.searchable.includes(normalizedSearch);
                      }}
                      formatOptionLabel={({ mountain }) => (
                        <div className="py-0.5">
                          <p className="text-sm font-semibold text-slate-900">{mountain.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {mountain.province}, {mountain.region}
                          </p>
                        </div>
                      )}
                      classNames={{
                        control: (state) =>
                          `touch-manipulation min-h-[60px] rounded-[20px] border bg-white px-3 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_22px_rgba(148,163,184,0.16)] transition ${
                            state.isFocused ? "border-sky-300 ring-2 ring-sky-200" : "border-sky-100"
                          }`,
                        valueContainer: () => "gap-2 py-2",
                        singleValue: () => "text-sm font-semibold text-slate-900",
                        placeholder: () => "text-sm text-slate-400",
                        input: () => "text-sm text-slate-900",
                        indicatorsContainer: () => "gap-1",
                        indicatorSeparator: () => "hidden",
                        dropdownIndicator: () => "text-slate-400 hover:text-slate-600",
                        menu: () =>
                          "z-30 mt-2 max-h-72 overflow-hidden rounded-[20px] border border-white/80 bg-white/95 p-2 shadow-[0_16px_30px_rgba(148,163,184,0.2)] backdrop-blur",
                        menuList: () => "max-h-64 space-y-1 overflow-y-auto overscroll-contain",
                        option: (state) =>
                          `cursor-pointer rounded-2xl px-3 py-2.5 transition ${
                            state.isSelected
                              ? "bg-sky-100 text-slate-900"
                              : state.isFocused
                                ? "bg-slate-100 text-slate-900"
                                : "bg-white text-slate-900"
                          }`,
                        noOptionsMessage: () => "px-2 py-3 text-sm text-slate-500",
                      }}
                      styles={{
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 60,
                        }),
                      }}
                    />
                  </div>
                </div>
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
              <p className="mt-1 text-xs leading-5 text-slate-400">After 15 days, the app switches from day-level forecast to planning outlook. Beyond 30 days, it leans on the same calendar date and month history from the last 2 years.</p>
            </section>

            {selectedMountain ? (
              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                <div className="relative h-36 bg-slate-200">
                  <Image
                    src={selectedMountain.image_url}
                    alt={selectedMountain.name}
                    fill
                    priority
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
