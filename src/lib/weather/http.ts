const DEFAULT_WEATHER_FETCH_TIMEOUT_MS = 8000;
const MIN_WEATHER_FETCH_TIMEOUT_MS = 2000;
const MAX_WEATHER_FETCH_TIMEOUT_MS = 30000;

function resolveWeatherFetchTimeoutMs(): number {
  const parsed = Number(process.env.WEATHER_FETCH_TIMEOUT_MS ?? DEFAULT_WEATHER_FETCH_TIMEOUT_MS);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_WEATHER_FETCH_TIMEOUT_MS;
  }

  return Math.min(MAX_WEATHER_FETCH_TIMEOUT_MS, Math.max(MIN_WEATHER_FETCH_TIMEOUT_MS, Math.round(parsed)));
}

export class UpstreamWeatherTimeoutError extends Error {
  provider: string;

  timeoutMs: number;

  constructor(provider: string, timeoutMs: number) {
    super(`${provider} weather request timed out after ${timeoutMs}ms.`);
    this.name = "UpstreamWeatherTimeoutError";
    this.provider = provider;
    this.timeoutMs = timeoutMs;
  }
}

export class UpstreamWeatherHttpError extends Error {
  provider: string;

  status: number;

  constructor(provider: string, status: number) {
    super(`${provider} request failed (${status}).`);
    this.name = "UpstreamWeatherHttpError";
    this.provider = provider;
    this.status = status;
  }
}

export function isUpstreamWeatherTimeoutError(error: unknown): error is UpstreamWeatherTimeoutError {
  return error instanceof UpstreamWeatherTimeoutError;
}

export function isUpstreamWeatherHttpError(error: unknown): error is UpstreamWeatherHttpError {
  return error instanceof UpstreamWeatherHttpError;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function fetchWeatherJson<T>(
  url: string,
  provider: string,
  revalidateSeconds: number,
): Promise<T> {
  const timeoutMs = resolveWeatherFetchTimeoutMs();
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new UpstreamWeatherHttpError(provider, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (isAbortError(error)) {
      throw new UpstreamWeatherTimeoutError(provider, timeoutMs);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
