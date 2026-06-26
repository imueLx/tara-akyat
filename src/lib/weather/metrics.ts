export function applyHikeWindowRainToMetrics<T extends { precipitationProbability: number; precipitationSum: number }>(
  metrics: T,
  hikeWindowRain: { precipitationProbability: number; precipitationSum: number } | null,
): T {
  if (!hikeWindowRain) {
    return metrics;
  }

  return {
    ...metrics,
    precipitationProbability: hikeWindowRain.precipitationProbability,
    precipitationSum: hikeWindowRain.precipitationSum,
  };
}
