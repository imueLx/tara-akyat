import type { NextRequest } from "next/server";

type RateLimitState = {
  count: number;
  resetAtMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
  retryAfterSeconds: number;
};

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS = 60;
const MIN_WINDOW_SECONDS = 10;
const MAX_WINDOW_SECONDS = 600;
const MIN_MAX_REQUESTS = 5;
const MAX_MAX_REQUESTS = 500;

function parseBoundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function getRateLimitWindowSeconds(): number {
  return parseBoundedInt(
    process.env.WEATHER_ROUTE_RATE_LIMIT_WINDOW_SECONDS,
    DEFAULT_WINDOW_SECONDS,
    MIN_WINDOW_SECONDS,
    MAX_WINDOW_SECONDS,
  );
}

function getRateLimitMaxRequests(): number {
  return parseBoundedInt(
    process.env.WEATHER_ROUTE_RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_MAX_REQUESTS,
    MIN_MAX_REQUESTS,
    MAX_MAX_REQUESTS,
  );
}

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const clientIp = forwardedFor.split(",")[0]?.trim();
    if (clientIp) {
      return clientIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown-client";
}

function getStore(): Map<string, RateLimitState> {
  const globalForRateLimit = globalThis as typeof globalThis & {
    __weatherRateLimitStore?: Map<string, RateLimitState>;
  };

  if (!globalForRateLimit.__weatherRateLimitStore) {
    globalForRateLimit.__weatherRateLimitStore = new Map<string, RateLimitState>();
  }

  return globalForRateLimit.__weatherRateLimitStore;
}

export function resetWeatherRouteRateLimitStoreForTests(): void {
  if (process.env.NODE_ENV !== "test") {
    return;
  }

  getStore().clear();
}

export function checkWeatherRouteRateLimit(request: NextRequest, routeKey: string): RateLimitResult {
  if (process.env.NODE_ENV === "test") {
    return {
      allowed: true,
      limit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAtMs: Date.now() + 60_000,
      retryAfterSeconds: 0,
    };
  }

  const windowSeconds = getRateLimitWindowSeconds();
  const maxRequests = getRateLimitMaxRequests();
  const windowMs = windowSeconds * 1000;
  const nowMs = Date.now();
  const key = `${routeKey}:${getClientIdentifier(request)}`;
  const store = getStore();
  const existing = store.get(key);

  if (!existing || existing.resetAtMs <= nowMs) {
    const nextState: RateLimitState = {
      count: 1,
      resetAtMs: nowMs + windowMs,
    };
    store.set(key, nextState);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - nextState.count),
      resetAtMs: nextState.resetAtMs,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, maxRequests - existing.count);
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAtMs - nowMs) / 1000));

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAtMs: existing.resetAtMs,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetAtMs: existing.resetAtMs,
    retryAfterSeconds: 0,
  };
}

export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAtMs / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(result.retryAfterSeconds) }),
  };
}
