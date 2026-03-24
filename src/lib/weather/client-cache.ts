"use client";

const WEATHER_CLIENT_CACHE_TTL_MS = 60 * 60 * 1000;
const WEATHER_CLIENT_CACHE_PREFIX = "weather-cache:v2:";

type WeatherClientCacheEntry<T> = {
  expiresAt: number;
  value: T;
};

function getStorageKey(scope: string, parts: Array<string | number>): string {
  return `${WEATHER_CLIENT_CACHE_PREFIX}${scope}:${parts.join(":")}`;
}

function canUseStorage(): boolean {
  return process.env.NODE_ENV !== "test" && typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getWeatherClientCache<T>(scope: string, parts: Array<string | number>): T | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(getStorageKey(scope, parts));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as WeatherClientCacheEntry<T>;
    if (!parsed || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(getStorageKey(scope, parts));
      return null;
    }

    return parsed.value;
  } catch {
    window.localStorage.removeItem(getStorageKey(scope, parts));
    return null;
  }
}

export function setWeatherClientCache<T>(scope: string, parts: Array<string | number>, value: T): void {
  if (!canUseStorage()) {
    return;
  }

  const payload: WeatherClientCacheEntry<T> = {
    expiresAt: Date.now() + WEATHER_CLIENT_CACHE_TTL_MS,
    value,
  };

  window.localStorage.setItem(getStorageKey(scope, parts), JSON.stringify(payload));
}
