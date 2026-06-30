
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { MountainFinder, type MountainFinderOption } from "@/components/mountains/mountain-finder";
import { WeatherDetailsSkeleton, WeatherResultSkeleton } from "@/components/mountains/weather-result-skeleton";
import { RecommendationPill } from "@/components/mountains/recommendation-pill";
import { RainAmountDisplay } from "@/components/mountains/rain-amount-display";
import { RainHistoryCard } from "@/components/mountains/rain-history-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { differenceInDays, formatISODate, isValidDate } from "@/lib/date";
import { getMountainImageLoadingProps, getMountainImageObjectPosition } from "@/lib/mountain-image";
import { getMountainImageAlt } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getWeatherClientCache, setWeatherClientCache } from "@/lib/weather/client-cache";
import { formatMainForecastCompare, formatReadableDate, formatWindowRainValue, getRainChanceGuidance, getTrailRainImpact, hasSecondaryForecastData, rainAmountLabel, secondaryOpinionHeadline, secondOpinionSubtitle, shouldExplainSecondaryUnavailable } from "@/lib/weather/presentation";
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
  elevation_m?: number;
  best_months?: string[];
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

const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;
const QUICK_PICK_SLUGS = ["mt-pulag", "mt-ulap", "mt-apo", "mt-daraitan"] as const;

type MissingPlannerRequirement = "mountain" | "date";

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

function normalizeMountainSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bmount\b/g, "mt")
    .replace(/\bmt\.?\b/g, "mt")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMonthShort(month: string): string {
  return month.slice(0, 3);
}

function formatBestMonthsWindow(months?: string[]): string | null {
  if (!months || months.length === 0) {
    return null;
  }

  const ordered = [...months].sort(
    (a, b) => monthOrder.indexOf(a as (typeof monthOrder)[number]) - monthOrder.indexOf(b as (typeof monthOrder)[number]),
  );

  if (ordered.length === 1) {
    return formatMonthShort(ordered[0]);
  }

  return `${formatMonthShort(ordered[0])} - ${formatMonthShort(ordered[ordered.length - 1])}`;
}

function resultSummary(result: WeatherCheckResult): string {
  if (result.mode === "climate") {
    return "Planning guide only. Recheck near hike day.";
  }

  if (result.recommendation === "Good") {
    return "Conditions look good for most hikers.";
  }

  if (result.recommendation === "Caution") {
    return "Conditions are mixed. Plan extra caution.";
  }

  return "Risk looks high. Moving the hike is safer.";
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
  const guidance = getRainChanceGuidance(value);

  if (value >= 70) {
    return {
      label: guidance.label,
      detail: guidance.detail,
      containerClassName: "border-sky-200 bg-sky-50",
      pillClassName: "bg-sky-100 text-sky-800",
      valueClassName: "text-sky-950",
      accentClassName: "bg-sky-500",
    };
  }

  if (value >= 35) {
    return {
      label: guidance.label,
      detail: guidance.detail,
      containerClassName: "border-amber-200 bg-amber-50",
      pillClassName: "bg-amber-100 text-amber-800",
      valueClassName: "text-amber-950",
      accentClassName: "bg-amber-500",
    };
  }

  return {
    label: guidance.label,
    detail: guidance.detail,
    containerClassName: "border-emerald-200 bg-emerald-50",
    pillClassName: "bg-emerald-100 text-emerald-800",
    valueClassName: "text-emerald-950",
    accentClassName: "bg-emerald-500",
  };
}

function rainAmountTone(value: number): MetricTone {
  const impact = getTrailRainImpact(value);

  return {
    label: impact.shortLabel,
    detail: impact.detail,
    containerClassName: impact.cardClassName,
    pillClassName: impact.pillClassName,
    valueClassName: impact.valueClassName,
    accentClassName: impact.barClassName,
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
      detail: "Light wind",
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
      detail: "Comfortable",
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

function historyContextTone(wetDayChance: number): GuidanceTone {
  if (wetDayChance >= 55) {
    return {
      containerClassName: "border-sky-200 bg-sky-50",
      chipClassName: "border border-sky-100 bg-sky-50 text-sky-700",
      label: "Wet",
      detail: "Past 2 years.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  if (wetDayChance >= 35) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "border border-amber-100 bg-amber-50 text-amber-700",
      label: "Mixed",
      detail: "Past 2 years.",
      valueText: `${wetDayChance}% wet days`,
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "border border-emerald-100 bg-emerald-50 text-emerald-700",
    label: "Drier",
    detail: "Past 2 years.",
    valueText: `${wetDayChance}% wet days`,
  };
}

function secondaryForecastTone(details: WeatherCheckDetails): GuidanceTone {
  const secondaryWindow = details.consensus.secondaryHikeWindowRain;
  const secondaryMetrics = secondaryWindow ?? details.consensus.secondaryMetrics;

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
      chipClassName: "border border-sky-100 bg-sky-50 text-sky-700",
      label: "Wet",
      detail: secondaryWindow ? "Second provider, hiking hours." : "Second provider.",
      valueText: formatWindowRainValue(secondaryWindow, details.consensus.secondaryMetrics),
    };
  }

  if (rainChance >= 35 || rainMm >= 2) {
    return {
      containerClassName: "border-amber-200 bg-amber-50",
      chipClassName: "border border-amber-100 bg-amber-50 text-amber-700",
      label: "Mixed",
      detail: secondaryWindow ? "Second provider, hiking hours." : "Second provider.",
      valueText: formatWindowRainValue(secondaryWindow, details.consensus.secondaryMetrics),
    };
  }

  return {
    containerClassName: "border-emerald-200 bg-emerald-50",
    chipClassName: "border border-emerald-100 bg-emerald-50 text-emerald-700",
    label: "Dry",
    detail: secondaryWindow ? "Second provider, hiking hours." : "Second provider.",
    valueText: formatWindowRainValue(secondaryWindow, details.consensus.secondaryMetrics),
  };
}

function compactReasons(result: WeatherCheckResult): string[] {
  return result.reasons.slice(0, 2);
}

function RainMetricCard({
  valueMm,
  tone,
  icon,
}: {
  valueMm: number;
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
            <p className="max-w-[6rem] text-[11px] uppercase leading-5 tracking-[0.14em] text-slate-500">Trail rain</p>
          </div>
          <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${tone.pillClassName}`}>
            {tone.label}
          </span>
        </div>
        <div className="mt-5">
          <RainAmountDisplay valueMm={valueMm} variant="metric" />
        </div>
      </div>
    </article>
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
  const startingDate = initialDate && isValidDate(initialDate) ? initialDate : "";
  const [mountainId, setMountainId] = useState("");
  const [date, setDate] = useState(startingDate);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeatherCheckResult | null>(null);
  const [details, setDetails] = useState<WeatherCheckDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announceMessage, setAnnounceMessage] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [missingRequirements, setMissingRequirements] = useState<MissingPlannerRequirement[]>([]);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const primaryDecisionRef = useRef<HTMLElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const selectedMountain = useMemo(
    () => mountains.find((mountain) => mountain.id === mountainId) ?? null,
    [mountainId, mountains],
  );
  const selectedMountainBestMonthsWindow = useMemo(
    () => formatBestMonthsWindow(selectedMountain?.best_months),
    [selectedMountain],
  );
  const mountainOptions = useMemo<MountainFinderOption[]>(
    () =>
      mountains.map((mountain) => ({
        value: mountain.id,
        label: mountain.name,
        province: mountain.province,
        region: mountain.region,
        searchable: normalizeMountainSearch(`${mountain.name} ${mountain.province} ${mountain.region}`),
      })),
    [mountains],
  );
  const quickPickMountains = useMemo(
    () =>
      QUICK_PICK_SLUGS.flatMap((slug) => {
        const mountain = mountains.find((entry) => entry.slug === slug);
        return mountain ? [mountain] : [];
      }),
    [mountains],
  );

  const todayIso = formatISODate(new Date());
  const hasSelectedDate = isValidDate(date);
  const daysAhead = hasSelectedDate ? Math.max(0, differenceInDays(new Date(`${date}T00:00:00`), new Date(`${todayIso}T00:00:00`))) : null;
  const selectedReliability = daysAhead === null ? null : getSelectedReliability(daysAhead);
  const hasCompleteSelection = Boolean(selectedMountain) && hasSelectedDate;
  const hasMountainOnly = Boolean(selectedMountain) && !hasSelectedDate;
  const confidenceHint =
    daysAhead === null
      ? "Pick a date to see forecast trust and planning range."
      : daysAhead <= 7
      ? "Best range for go or no-go planning."
      : daysAhead <= 15
        ? "Selected date still uses day-level forecast data, but confidence is lower than the next 7 days."
        : daysAhead <= 30
          ? "Days 16 to 30 use month-based planning outlook instead of exact day-level forecast."
          : "Beyond 30 days uses the same calendar date from the last 2 years plus month context for planning.";
  const selectedMountainHref = selectedMountain
    ? hasSelectedDate
      ? `/mountains/${selectedMountain.slug}?date=${date}`
      : `/mountains/${selectedMountain.slug}`
    : "/mountains";
  const primaryMissingRequirement = missingRequirements[0] ?? null;

  useEffect(() => {
    if (missingRequirements.length === 0) {
      return;
    }

    const nextMissing = missingRequirements.filter((requirement) =>
      requirement === "mountain" ? !selectedMountain : !hasSelectedDate,
    );

    if (nextMissing.length === 0) {
      setMissingRequirements([]);
      return;
    }

    if (nextMissing.length !== missingRequirements.length) {
      setMissingRequirements(nextMissing);
    }
  }, [hasSelectedDate, missingRequirements, selectedMountain]);

  const metricGuides = useMemo(() => {
    if (!result?.metrics) {
      return null;
    }

    const rainChanceValue = result.hikeWindowRain?.precipitationProbability ?? result.metrics.precipitationProbability;
    const rainAmountValue = result.hikeWindowRain?.precipitationSum ?? result.metrics.precipitationSum;

    return {
      rainChance: rainChanceTone(rainChanceValue),
      rainAmount: rainAmountTone(rainAmountValue),
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
  const shouldShowSecondaryForecastCard =
    details !== null && detailsDaysAhead !== null && hasSecondaryForecastData(details, detailsDaysAhead);
  const secondOpinionHint = secondOpinionSubtitle(daysAhead ?? 0, details);

  function onMountainPickerChange(nextValue: string, nextLabel: string) {
    setMountainId(nextValue);
    setAnnounceMessage(`${nextLabel} selected`);
  }

  function closeMissingRequirementsPrompt() {
    setMissingRequirements([]);
  }

  function focusPlannerField(requirement: MissingPlannerRequirement) {
    closeMissingRequirementsPrompt();

    requestAnimationFrame(() => {
      if (requirement === "mountain") {
        document.getElementById("home-mountain-search")?.focus();
        return;
      }

      dateInputRef.current?.focus();
    });
  }

  async function onCheck() {
    const nextMissingRequirements: MissingPlannerRequirement[] = [];
    if (!selectedMountain) {
      nextMissingRequirements.push("mountain");
    }
    if (!hasSelectedDate) {
      nextMissingRequirements.push("date");
    }

    if (nextMissingRequirements.length > 0) {
      setMissingRequirements(nextMissingRequirements);
      setError(null);
      setAnnounceMessage(
        nextMissingRequirements.length === 2
          ? "Choose a mountain and date first."
          : nextMissingRequirements[0] === "mountain"
            ? "Choose a mountain first."
            : "Choose a date first.",
      );
      return;
    }

    const mountain = selectedMountain;
    if (!mountain) {
      return;
    }
    setLoading(true);
    setError(null);
    setDetails(null);
    setDetailsError(null);
    setShowMoreDetails(false);

    try {
      const cacheParts = [mountain.lat, mountain.lon, date];
      const cachedResult = getWeatherClientCache<WeatherCheckResult>("check", cacheParts);

      if (cachedResult) {
        setResult(cachedResult);
        const verdict = cachedResult.recommendation ?? "Planning outlook";
        setAnnounceMessage(`${verdict}. Forecast confidence ${cachedResult.reliability.estimatedAccuracy} percent.`);
        requestAnimationFrame(() => {
          window.setTimeout(() => {
            scheduleResultScroll(primaryDecisionRef.current ?? resultsRef.current);
          }, 120);
        });
        return;
      }

      const response = await fetch(`/api/weather/check?lat=${mountain.lat}&lon=${mountain.lon}&date=${date}`);
      const data = (await response.json()) as WeatherCheckResult | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to check weather right now.");
      }

      const parsed = data as WeatherCheckResult;
      setWeatherClientCache("check", cacheParts, parsed);
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
      toast.error(message, {
        action: {
          label: "Retry",
          onClick: () => {
            void onCheck();
          },
        },
      });
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
      const cacheParts = [selectedMountain.lat, selectedMountain.lon, result.date];
      const cachedDetails = getWeatherClientCache<WeatherCheckDetails>("details", cacheParts);

      if (cachedDetails) {
        setDetails(cachedDetails);
        return;
      }

      const response = await fetch(`/api/weather/check/details?lat=${selectedMountain.lat}&lon=${selectedMountain.lon}&date=${result.date}`);
      const data = (await response.json()) as WeatherCheckDetails | { error: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Unable to load more details right now.");
      }

      const parsed = data as WeatherCheckDetails;
      setWeatherClientCache("details", cacheParts, parsed);
      setDetails(parsed);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to load more details right now.";
      setDetailsError(message);
      toast.error(message, {
        action: {
          label: "Retry",
          onClick: () => {
            void loadMoreDetails();
          },
        },
      });
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
    <section id="planner" className="scroll-mt-24 sm:scroll-mt-28">
      <Dialog
        open={missingRequirements.length > 0}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeMissingRequirementsPrompt();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-700 shadow-sm">
                <SparklesIcon />
              </span>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Before you check</p>
            </div>
            <DialogTitle className="mt-4 text-xl">
              {missingRequirements.length === 2
                ? "Choose a mountain and date first"
                : missingRequirements[0] === "mountain"
                  ? "Choose a mountain first"
                  : "Pick your hike date first"}
            </DialogTitle>
            <DialogDescription className="leading-6">
              {missingRequirements.length === 2
                ? "Set up your hike first, then we’ll run the forecast and trust check."
                : missingRequirements[0] === "mountain"
                  ? "Select the mountain you want to check before we run the forecast."
                  : "Pick the date you plan to hike so we can calculate the right forecast range."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-2">
            {missingRequirements.map((requirement) => (
              <div
                key={requirement}
                className="rounded-[18px] border border-border bg-secondary px-4 py-3"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Required</p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                  {requirement === "mountain" ? "Mountain selection" : "Hike date"}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button type="button" onClick={() => focusPlannerField(primaryMissingRequirement ?? "mountain")}>
              {primaryMissingRequirement === "date" ? "Go to date picker" : "Go to mountain picker"}
            </Button>
            {missingRequirements.length === 2 ? (
              <Button type="button" variant="outline" onClick={() => focusPlannerField("date")}>
                Jump to date picker
              </Button>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announceMessage}
      </p>

      <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-border bg-[linear-gradient(180deg,rgba(224,242,254,0.35)_0%,var(--card)_55%)] px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Hike planner</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Check hiking weather
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Search {mountains.length} Philippine mountains, pick your date, and get a trail-specific forecast read.
                </p>
              </div>
              <Link
                href="/mountains"
                className="inline-flex shrink-0 items-center rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-secondary"
              >
                Browse all
              </Link>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="home-mountain-search" className="mb-2 block text-sm font-semibold text-foreground">
                  1. Choose a mountain
                </label>
                <MountainFinder
                  inputId="home-mountain-search"
                  options={mountainOptions}
                  value={mountainId}
                  onChange={onMountainPickerChange}
                  placeholder="Try Mt. Pulag, Benguet, or Luzon..."
                />

                <div className="mt-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Popular picks</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickPickMountains.map((mountain) => (
                      <button
                        key={mountain.id}
                        type="button"
                        onClick={() => onMountainPickerChange(mountain.id, mountain.name)}
                        className={cn(
                          "rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          mountainId === mountain.id
                            ? "border-sky-300 bg-sky-100 text-sky-950"
                            : "border-border bg-card text-foreground hover:border-sky-200 hover:bg-sky-50/70",
                        )}
                      >
                        {mountain.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="home-date" className="text-sm font-semibold text-foreground">
                    2. Pick your hike date
                  </label>
                  {selectedReliability ? (
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${reliabilityTone(selectedReliability.estimatedAccuracy)}`}>
                      {selectedReliability.label} · {selectedReliability.estimatedAccuracy}%
                    </span>
                  ) : (
                    <span className="rounded-full border border-dashed border-border bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      Choose date
                    </span>
                  )}
                </div>
                <input
                  ref={dateInputRef}
                  id="home-date"
                  type="date"
                  min={todayIso}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none ring-sky-300 focus:ring focus-visible:ring-2"
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{confidenceHint}</p>
              </div>

              {selectedMountain ? (
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/30 p-3 sm:p-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-20 sm:w-20">
                    <Image
                      src={selectedMountain.image_url}
                      alt={getMountainImageAlt(selectedMountain)}
                      fill
                      sizes="80px"
                      quality={60}
                      className="object-cover"
                      {...getMountainImageLoadingProps(true)}
                      style={{ objectPosition: getMountainImageObjectPosition(selectedMountain.slug) }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {selectedMountain.province} · {selectedMountain.region}
                    </p>
                    <p className="mt-1 truncate text-lg font-semibold text-foreground">{selectedMountain.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {typeof selectedMountain.elevation_m === "number"
                        ? `${selectedMountain.elevation_m.toLocaleString()} m`
                        : "Elevation in guide"}
                      {selectedMountainBestMonthsWindow ? ` · Best: ${selectedMountainBestMonthsWindow}` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-secondary/20 px-4 py-4 text-center">
                  <p className="text-sm font-semibold text-foreground">Start with your next hike</p>
                  <p className="mt-1 text-sm text-muted-foreground">Choose a mountain above to preview it here.</p>
                </div>
              )}

              <div className="sticky bottom-3 z-20 sm:static">
                <div
                  className={cn(
                    "rounded-2xl border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_16px_36px_rgba(15,23,42,0.1)] sm:p-4",
                    hasCompleteSelection
                      ? "border-slate-200 bg-white"
                      : hasMountainOnly
                        ? "border-sky-200 bg-sky-50"
                        : "border-border bg-white",
                  )}
                >
                  {selectedMountain ? (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-sky-900">
                        {selectedMountain.name}
                      </span>
                      {hasSelectedDate ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {formatReadableDate(date)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-dashed border-sky-300 bg-white/80 px-3 py-1 text-xs font-semibold text-sky-700">
                          Date needed
                        </span>
                      )}
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    onClick={onCheck}
                    disabled={loading}
                    size="lg"
                    variant="ghost"
                    className={cn(
                      "h-12 w-full rounded-2xl text-base font-semibold sm:h-14",
                      hasCompleteSelection
                        ? "bg-slate-950 text-white shadow-md hover:bg-slate-800"
                        : hasMountainOnly
                          ? "bg-sky-600 text-white shadow-md hover:bg-sky-700"
                          : "border-2 border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50",
                    )}
                  >
                    {loading ? (
                      <>
                        <span
                          className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                          aria-hidden="true"
                        />
                        <span>Checking hiking weather...</span>
                      </>
                    ) : (
                      <span>Check hiking weather</span>
                    )}
                  </Button>

                  {!loading ? (
                    <p className="mt-2.5 text-center text-xs leading-5 text-muted-foreground">
                      {hasCompleteSelection && selectedMountain
                        ? `Ready to check ${selectedMountain.name} on ${formatReadableDate(date)}.`
                        : hasMountainOnly
                          ? `Mountain set. Pick a date above, then check the forecast.`
                          : !hasSelectedDate
                            ? "Choose a mountain and date, then check the forecast."
                            : "Choose a mountain to continue."}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#fdfdfd_0%,#f8fafc_100%)] p-4 sm:p-8">
          <div ref={resultsRef} className="scroll-mt-24 sm:scroll-mt-28" />
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Live result</p>
              <h3 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">Weather result for your selected hike</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedMountain ? (
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                    {selectedMountain.name} • {selectedMountain.province}
                  </span>
                ) : null}
                {hasSelectedDate ? (
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                    {formatReadableDate(date)}
                  </span>
                ) : (
                  <span className="rounded-full border border-dashed border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                    Date not set
                  </span>
                )}
              </div>
            </div>
            <Link
              href={selectedMountainHref}
              className="hidden rounded-2xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary sm:inline-flex"
            >
              Full details
            </Link>
          </div>

          {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-3 py-3 text-sm text-rose-700">{error}</p> : null}

          {loading ? (
            <WeatherResultSkeleton className="space-y-3" label="Checking hiking weather" />
          ) : result ? (
            <div className="space-y-4" aria-live="polite" aria-atomic="true">
              <article ref={primaryDecisionRef} className={`overflow-hidden rounded-[22px] border p-5 shadow-sm ${cardTone(result)}`}>
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

                <div className="mt-6 rounded-[18px] border border-white/90 bg-white/80 p-4 sm:p-5">
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
                <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <SectionIcon>
                      <CloudSunIcon />
                    </SectionIcon>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Weather diagnostics</p>
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Main forecast · Open-Meteo</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MetricCard
                      title="Rain chance"
                      value={String(result.hikeWindowRain?.precipitationProbability ?? result.metrics.precipitationProbability)}
                      unit="%"
                      tone={metricGuides.rainChance}
                      icon={<RainIcon />}
                    />
                    <RainMetricCard
                      valueMm={result.hikeWindowRain?.precipitationSum ?? result.metrics.precipitationSum}
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

              <article className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <SectionIcon>
                        <ShieldIcon />
                      </SectionIcon>
                      <p className="text-sm font-semibold text-slate-950">How reliable</p>
                    </div>
                    <p className="ml-10 text-xs text-slate-500">{result.reliability.selectedLabel} outlook</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${reliabilityTone(result.reliability.estimatedAccuracy)}`}>
                    {result.reliability.estimatedAccuracy >= 85 ? "High trust" : result.reliability.estimatedAccuracy >= 65 ? "Moderate trust" : "Low trust"}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{result.reliability.estimatedAccuracy}% forecast trust</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{reliabilityMeaning(result.reliability.estimatedAccuracy)}</p>
              </article>

              <section className="rounded-[22px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
                <button
                  type="button"
                  onClick={onToggleMoreDetails}
                  aria-expanded={showMoreDetails}
                  className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
                        <ChartIcon />
                      </span>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Second opinion</p>
                    </div>
                    <p className="mt-2 text-base font-semibold tracking-tight text-slate-950">Another forecast & rain history</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{secondOpinionHint}</p>
                    {result.mode === "climate" ? (
                      <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                        Recommended for this result. This date is outside day-level forecast range.
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm transition ${
                      result.mode === "climate"
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {showMoreDetails ? "Hide" : "Show"}
                  </span>
                </button>

                {showMoreDetails ? detailsLoading ? (
                  <WeatherDetailsSkeleton className="mt-4 grid grid-cols-1 gap-3" />
                ) : detailsError ? (
                  <p className="mt-4 rounded-[24px] bg-rose-50 px-4 py-4 text-sm text-rose-700">{detailsError}</p>
                ) : details ? (
                  <>
                    {detailsDaysAhead !== null && shouldExplainSecondaryUnavailable(details, detailsDaysAhead) ? (
                      <p className="mt-4 text-sm leading-6 text-slate-600">{details.consensus.note}</p>
                    ) : null}
                    <div className={`mt-4 grid grid-cols-1 gap-3 ${shouldShowSecondaryForecastCard ? "sm:grid-cols-2" : ""}`}>
                    {shouldShowSecondaryForecastCard ? (
                      <article className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                        <div className="mb-4 h-px bg-[linear-gradient(90deg,rgba(14,165,233,0.18),rgba(148,163,184,0))]" />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white text-sky-700 shadow-[0_6px_18px_rgba(14,165,233,0.10)]">
                              <CalendarIcon />
                            </span>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{details.consensus.secondaryProvider}</p>
                              <p className="mt-1 text-sm font-medium text-slate-600">Extra check · same mountain & date</p>
                            </div>
                          </div>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${secondaryGuidance?.chipClassName ?? "bg-slate-100 text-slate-700"}`}>
                            {secondaryGuidance?.label ?? "No data"}
                          </span>
                        </div>
                        {secondaryOpinionHeadline(details.consensus) ? (
                          <p className="mt-3 text-lg font-semibold text-slate-950">{secondaryOpinionHeadline(details.consensus)}</p>
                        ) : (
                          <p className="mt-3 text-lg font-semibold text-slate-950">{details.consensus.note}</p>
                        )}
                        {secondaryOpinionHeadline(details.consensus) &&
                        (details.consensus.agreement === "aligned" || details.consensus.agreement === "mixed") ? (
                          <p className="mt-1 break-words text-sm leading-6 text-slate-600">{details.consensus.note}</p>
                        ) : null}
                        <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                          {details.consensus.secondaryHikeWindowRain
                            ? `${details.consensus.secondaryProvider} view for the ${details.consensus.secondaryHikeWindowRain.label} hike window.`
                            : `${details.consensus.secondaryProvider} view for this date.`}
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-[16px] border border-white/90 bg-white/80 px-3 py-3 backdrop-blur">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Rain chance</p>
                            <p className="mt-1 text-base font-semibold text-slate-950">
                              {details.consensus.secondaryHikeWindowRain?.precipitationProbability ?? details.consensus.secondaryMetrics?.precipitationProbability ?? "--"}%
                            </p>
                          </div>
                          <div className="rounded-[16px] border border-white/90 bg-white/80 px-3 py-3 backdrop-blur">
                            {typeof (details.consensus.secondaryHikeWindowRain?.precipitationSum ?? details.consensus.secondaryMetrics?.precipitationSum) === "number" ? (
                              <RainAmountDisplay
                                valueMm={details.consensus.secondaryHikeWindowRain?.precipitationSum ?? details.consensus.secondaryMetrics?.precipitationSum ?? 0}
                                variant="compact"
                              />
                            ) : (
                              <>
                                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Trail rain</p>
                                <p className="mt-1 text-base font-semibold text-slate-950">--</p>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-600">
                          {details.consensus.primaryHikeWindowRain
                            ? formatMainForecastCompare(details.consensus.primaryHikeWindowRain)
                            : secondaryGuidance?.valueText ?? "Unavailable"}
                        </p>
                      </article>
                    ) : null}

                    <RainHistoryCard
                      history={details.history}
                      targetDate={details.date}
                      chipLabel={historyGuidance?.label ?? "No data"}
                      chipClassName={historyGuidance?.chipClassName ?? "bg-slate-100 text-slate-700"}
                      summaryValue={historyGuidance?.valueText ?? "Unavailable"}
                      leadingIcon={<BookIcon />}
                    />
                  </div>
                  </>
                ) : null : null}
              </section>

              {result.mode === "climate" && !showMoreDetails ? (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900 shadow-sm">
                  Expand Second opinion to see rainfall history behind this planning result.
                </div>
              ) : null}

              <div className="sm:hidden">
                <Link
                  href={selectedMountainHref}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
                >
                  Open full mountain details
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center rounded-[20px] border border-dashed border-border bg-card px-6 py-8 text-center shadow-sm sm:min-h-[380px]">
              <div className="max-w-md">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ready to check</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Your weather result will appear here.</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Search for a mountain above, pick your hike date, then tap check hiking weather.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
