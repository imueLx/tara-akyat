import type { DailyWeatherMetrics, RecommendationLevel, ScoredDay } from "@/types/hiking";

const SEVERE_CODES = new Set([65, 67, 82, 86, 95, 96, 99]);

export function scoreDay(date: string, metrics: DailyWeatherMetrics): ScoredDay {
  let risk = 0;
  const reasons: string[] = [];

  if (SEVERE_CODES.has(metrics.weatherCode)) {
    risk += 55;
    reasons.push("Storm or severe weather signal");
  }

  if (metrics.precipitationProbability >= 70) {
    risk += 34;
    reasons.push("High rain chance");
  } else if (metrics.precipitationProbability >= 55) {
    risk += 24;
    reasons.push("Moderate to high rain chance");
  } else if (metrics.precipitationProbability >= 40) {
    risk += 18;
    reasons.push("Possible rain during hike window");
  }

  if (metrics.precipitationSum >= 12) {
    risk += 30;
    reasons.push("Heavy expected rainfall");
  } else if (metrics.precipitationSum >= 3) {
    risk += 18;
    reasons.push("Moderate expected rainfall");
  } else if (metrics.precipitationSum >= 1) {
    risk += 15;
    reasons.push("Light expected rainfall");
  }

  if (metrics.windSpeedMax >= 45) {
    risk += 28;
    reasons.push("Strong wind at exposed sections");
  } else if (metrics.windSpeedMax >= 30) {
    risk += 12;
    reasons.push("Moderate wind at ridges");
  }

  if (metrics.apparentTemperatureMax >= 37 || metrics.temperatureMax >= 37) {
    risk += 22;
    reasons.push("High heat stress risk");
  } else if (metrics.apparentTemperatureMax >= 33 || metrics.temperatureMax >= 33) {
    risk += 10;
    reasons.push("Warm to hot trail conditions");
  }

  let recommendation: RecommendationLevel;
  if (risk >= 60) {
    recommendation = "Not Recommended";
  } else if (risk >= 30) {
    recommendation = "Caution";
  } else {
    recommendation = "Good";
  }

  if (reasons.length === 0) {
    reasons.push("Weather looks stable for hiking");
  }

  return {
    date,
    recommendation,
    score: Math.max(0, 100 - risk),
    reasons,
    metrics,
  };
}

export function confidenceFromDaysAhead(daysAhead: number): "high" | "medium" | "low" {
  if (daysAhead <= 3) {
    return "high";
  }

  if (daysAhead <= 7) {
    return "medium";
  }

  return "low";
}
