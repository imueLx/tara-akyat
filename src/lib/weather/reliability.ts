import type { HistoryCrosscheck } from "@/types/hiking";

export type ReliabilityTier = {
  label: string;
  days: number;
  estimatedAccuracy: number;
  notes: string;
  reliesOnHistory: boolean;
};

export const RELIABILITY_TIERS: ReliabilityTier[] = [
  {
    label: "3-day",
    days: 3,
    estimatedAccuracy: 90,
    notes: "Best for go or no-go decisions.",
    reliesOnHistory: false,
  },
  {
    label: "7-day",
    days: 7,
    estimatedAccuracy: 78,
    notes: "Good for short-term planning.",
    reliesOnHistory: false,
  },
  {
    label: "15-day",
    days: 15,
    estimatedAccuracy: 55,
    notes: "Useful for tentative scheduling only.",
    reliesOnHistory: true,
  },
  {
    label: "30-day",
    days: 30,
    estimatedAccuracy: 30,
    notes: "Use climate/history guidance, not day-level trust.",
    reliesOnHistory: true,
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function interpolateAccuracy(daysAhead: number): number {
  if (daysAhead <= 30) {
    const ratio = (daysAhead - 15) / (30 - 15);
    return Math.round(55 + ratio * (30 - 55));
  }

  if (daysAhead <= 90) {
    const ratio = (daysAhead - 30) / (90 - 30);
    return Math.round(30 + ratio * (15 - 30));
  }

  if (daysAhead <= 180) {
    const ratio = (daysAhead - 90) / (180 - 90);
    return Math.round(15 + ratio * (10 - 15));
  }

  if (daysAhead <= 365) {
    const ratio = (daysAhead - 180) / (365 - 180);
    return Math.round(10 + ratio * (6 - 10));
  }

  return 5;
}

export function getSelectedReliability(daysAhead: number): ReliabilityTier {
  if (daysAhead <= 3) {
    return RELIABILITY_TIERS[0];
  }
  if (daysAhead <= 7) {
    return RELIABILITY_TIERS[1];
  }
  if (daysAhead <= 15) {
    return RELIABILITY_TIERS[2];
  }

  const estimatedAccuracy = clamp(interpolateAccuracy(daysAhead), 5, 55);

  return {
    label: `${daysAhead}-day`,
    days: daysAhead,
    estimatedAccuracy,
    notes:
      daysAhead <= 30
        ? "Useful for tentative planning only. Check again close to hike day."
        : "Use climate/history guidance only. Do not rely on this for final go or no-go decisions.",
    reliesOnHistory: true,
  };
}

export function buildReliabilityMessage(daysAhead: number, history: HistoryCrosscheck): string {
  const selected = getSelectedReliability(daysAhead);

  if (!selected.reliesOnHistory) {
    return `${selected.label} forecast confidence is about ${selected.estimatedAccuracy}%. ${selected.notes}`;
  }

  return `${selected.label} forecast confidence is about ${selected.estimatedAccuracy}%. ${selected.notes} Last 2-year target-month wet chance is ${history.targetMonthWetDayChance}%.`;
}
