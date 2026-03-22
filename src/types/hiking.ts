export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type TipSourceType = "travel_agency" | "reddit" | "official" | "facebook";

export type RecommendationLevel = "Good" | "Caution" | "Not Recommended";

export interface Mountain {
  id: string;
  name: string;
  slug: string;
  region: string;
  province: string;
  lat: number;
  lon: number;
  image_url: string;
  image_source_url?: string | null;
  image_verified?: boolean;
  image_credit?: string | null;
  image_license?: string | null;
  elevation_m: number;
  difficulty_score: number;
  difficulty_source_url?: string;
  difficulty_source_note?: string;
  difficulty: Difficulty;
  best_months: string[];
  summary: string;
}

export interface TipSource {
  id: string;
  mountain_id: string;
  source_type: TipSourceType;
  title: string;
  url: string;
  note: string;
  safety_tags: string[];
}

export interface DailyWeatherMetrics {
  precipitationProbability: number;
  precipitationSum: number;
  windSpeedMax: number;
  temperatureMax: number;
  apparentTemperatureMax: number;
  weatherCode: number;
}

export interface ScoredDay {
  date: string;
  recommendation: RecommendationLevel;
  score: number;
  reasons: string[];
  metrics: DailyWeatherMetrics;
}

export interface ClimateGuidance {
  month: string;
  avgPrecipitation: number;
  wetDayChance: number;
  advisory: string;
}

export interface HistoryCrosscheck {
  periodStart: string;
  periodEnd: string;
  avgDailyPrecipitation: number;
  wetDayChance: number;
  targetMonthAvgPrecipitation: number;
  targetMonthWetDayChance: number;
  targetDateAvgPrecipitation: number;
  targetDateWetDayChance: number;
  targetDateSamples: number;
  note: string;
}

export interface ProviderConsensus {
  primaryProvider: string;
  secondaryProvider: string;
  secondaryAvailable: boolean;
  secondaryRecommendation: RecommendationLevel | null;
  secondaryMetrics: DailyWeatherMetrics | null;
  agreement: "aligned" | "mixed" | "unavailable";
  note: string;
}

export interface ForecastReliability {
  selectedLabel: string;
  selectedDays: number;
  estimatedAccuracy: number;
  guidance: string;
  tiers: Array<{
    label: string;
    days: number;
    estimatedAccuracy: number;
    notes: string;
    reliesOnHistory: boolean;
  }>;
}

export interface WeatherCheckResult {
  date: string;
  mode: "forecast" | "climate";
  recommendation: RecommendationLevel | null;
  actionable: boolean;
  confidence: "high" | "medium" | "low";
  reasons: string[];
  metrics: DailyWeatherMetrics | null;
  climate: ClimateGuidance | null;
  reliability: ForecastReliability;
}

export interface WeatherCheckDetails {
  date: string;
  mode: "forecast" | "climate";
  history: HistoryCrosscheck;
  consensus: ProviderConsensus;
}
