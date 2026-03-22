"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { RecommendationPill } from "@/components/mountains/recommendation-pill";
import type { RecommendationLevel } from "@/types/hiking";

type Props = {
  lat: number;
  lon: number;
};

type BadgeState = {
  label: string;
  recommendation: RecommendationLevel | null;
};

type ResponseShape = {
  recommended: Array<{ date: string; recommendation: RecommendationLevel }>;
};

const badgeCache = new Map<string, BadgeState>();
const inFlight = new Map<string, Promise<BadgeState>>();

function keyFromCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

async function fetchBadgeState(lat: number, lon: number): Promise<BadgeState> {
  try {
    const res = await fetch(`/api/weather/best-days?lat=${lat}&lon=${lon}&days=7`);
    if (!res.ok) {
      throw new Error("Unable to load best days");
    }

    const data = (await res.json()) as ResponseShape;
    const best = data.recommended[0];

    if (best) {
      return {
        label: `Best: ${best.date}`,
        recommendation: best.recommendation,
      };
    }

    return {
      label: "No clear green day this week",
      recommendation: null,
    };
  } catch {
    return {
      label: "Weather badge unavailable",
      recommendation: null,
    };
  }
}

export function BestDayBadge({ lat, lon }: Props) {
  const key = useMemo(() => keyFromCoordinates(lat, lon), [lat, lon]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const cachedInitial = badgeCache.get(key) ?? null;

  const [shouldLoad, setShouldLoad] = useState(() => Boolean(cachedInitial));
  const [loadedState, setLoadedState] = useState<BadgeState | null>(cachedInitial);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => {
        setShouldLoad(true);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || loadedState) {
      return;
    }

    const cached = badgeCache.get(key);
    if (cached) {
      queueMicrotask(() => {
        setLoadedState(cached);
      });
      return;
    }

    let active = true;

    async function load() {
      let request = inFlight.get(key);
      if (!request) {
        request = fetchBadgeState(lat, lon).finally(() => {
          inFlight.delete(key);
        });
        inFlight.set(key, request);
      }

      const next = await request;
      badgeCache.set(key, next);

      if (active) {
        setLoadedState(next);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [key, lat, lon, loadedState, shouldLoad]);

  const state: BadgeState = loadedState
    ? loadedState
    : shouldLoad
      ? { label: "Checking...", recommendation: null }
      : { label: "Loads when card is visible", recommendation: null };

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-2 text-xs">
      {state.recommendation ? <RecommendationPill value={state.recommendation} /> : null}
      <span className="text-slate-600">{state.label}</span>
    </div>
  );
}
