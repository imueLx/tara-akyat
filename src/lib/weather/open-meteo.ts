import { addDays, formatISODate, monthBounds } from "@/lib/date";
import type { ClimateGuidance, DailyWeatherMetrics, HistoryCrosscheck } from "@/types/hiking";

interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    weather_code: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    temperature_2m_max: number[];
    apparent_temperature_max: number[];
  };
}

interface OpenMeteoArchiveResponse {
  daily: {
    time: string[];
    precipitation_sum: number[];
  };
}

function createForecastUrl(lat: number, lon: number, startDate: string, endDate: string): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "Asia/Manila",
    start_date: startDate,
    end_date: endDate,
    daily:
      "weather_code,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,temperature_2m_max,apparent_temperature_max",
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export async function fetchForecastRange(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<Map<string, DailyWeatherMetrics>> {
  const url = createForecastUrl(lat, lon, startDate, endDate);
  const response = await fetch(url, { next: { revalidate: 1800 } });

  if (!response.ok) {
    throw new Error(`Open-Meteo forecast failed (${response.status})`);
  }

  const payload = (await response.json()) as OpenMeteoDailyResponse;
  const map = new Map<string, DailyWeatherMetrics>();

  for (let i = 0; i < payload.daily.time.length; i += 1) {
    map.set(payload.daily.time[i], {
      weatherCode: payload.daily.weather_code[i] ?? 0,
      precipitationSum: payload.daily.precipitation_sum[i] ?? 0,
      precipitationProbability: payload.daily.precipitation_probability_max[i] ?? 0,
      windSpeedMax: payload.daily.wind_speed_10m_max[i] ?? 0,
      temperatureMax: payload.daily.temperature_2m_max[i] ?? 0,
      apparentTemperatureMax: payload.daily.apparent_temperature_max[i] ?? 0,
    });
  }

  return map;
}

export async function fetchBestDaysForecast(
  lat: number,
  lon: number,
  days: number,
): Promise<Map<string, DailyWeatherMetrics>> {
  const today = new Date();
  const startDate = formatISODate(today);
  const endDate = formatISODate(addDays(today, days - 1));

  return fetchForecastRange(lat, lon, startDate, endDate);
}

export async function fetchClimateGuidance(lat: number, lon: number, targetDate: string): Promise<ClimateGuidance> {
  const parsedTarget = new Date(`${targetDate}T00:00:00`);
  const monthIndex = parsedTarget.getMonth();
  const monthLabel = parsedTarget.toLocaleString("en-US", { month: "long" });
  const thisYear = new Date().getFullYear();
  const startYear = thisYear - 2;
  const endYear = thisYear - 1;

  const firstMonth = monthBounds(startYear, monthIndex).start;
  const lastMonth = monthBounds(endYear, monthIndex).end;

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "Asia/Manila",
    start_date: firstMonth,
    end_date: lastMonth,
    daily: "precipitation_sum",
  });

  const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });

  if (!response.ok) {
    throw new Error(`Open-Meteo archive failed (${response.status})`);
  }

  const payload = (await response.json()) as OpenMeteoArchiveResponse;

  let monthTotal = 0;
  let monthDays = 0;
  let wetDays = 0;

  for (let i = 0; i < payload.daily.time.length; i += 1) {
    const date = new Date(`${payload.daily.time[i]}T00:00:00`);
    if (date.getMonth() !== monthIndex) {
      continue;
    }

    const rain = payload.daily.precipitation_sum[i] ?? 0;
    monthTotal += rain;
    monthDays += 1;
    if (rain >= 1) {
      wetDays += 1;
    }
  }

  const avgPrecipitation = monthDays > 0 ? Number((monthTotal / monthDays).toFixed(1)) : 0;
  const wetDayChance = monthDays > 0 ? Number(((wetDays / monthDays) * 100).toFixed(0)) : 0;

  let advisory = "Historically favorable month for hiking, but check again within 7 days.";
  if (wetDayChance >= 55 || avgPrecipitation >= 8) {
    advisory = "Historically wet month. Prepare for rain and recheck within 7 days before finalizing.";
  } else if (wetDayChance >= 35 || avgPrecipitation >= 4) {
    advisory = "Mixed month historically. Keep a backup date and monitor closer to your trip.";
  }

  return {
    month: monthLabel,
    avgPrecipitation,
    wetDayChance,
    advisory,
  };
}

export async function fetchTwoYearHistoryCrosscheck(
  lat: number,
  lon: number,
  targetDate: string,
): Promise<HistoryCrosscheck> {
  const now = new Date();
  const endDate = addDays(now, -1);
  const startDate = addDays(endDate, -(365 * 2 - 1));
  const targetMonth = new Date(`${targetDate}T00:00:00`).getMonth();
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "Asia/Manila",
    start_date: formatISODate(startDate),
    end_date: formatISODate(endDate),
    daily: "precipitation_sum",
  });
  const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });

  if (!response.ok) {
    throw new Error(`Open-Meteo archive failed (${response.status})`);
  }

  const payload = (await response.json()) as OpenMeteoArchiveResponse;

  let totalPrecipitation = 0;
  let totalDays = 0;
  let totalWetDays = 0;
  let monthPrecipitation = 0;
  let monthDays = 0;
  let monthWetDays = 0;

  for (let i = 0; i < payload.daily.time.length; i += 1) {
    const date = new Date(`${payload.daily.time[i]}T00:00:00`);
    const rain = payload.daily.precipitation_sum[i] ?? 0;

    totalPrecipitation += rain;
    totalDays += 1;
    if (rain >= 1) {
      totalWetDays += 1;
    }

    if (date.getMonth() === targetMonth) {
      monthPrecipitation += rain;
      monthDays += 1;
      if (rain >= 1) {
        monthWetDays += 1;
      }
    }
  }

  const avgDailyPrecipitation = totalDays > 0 ? Number((totalPrecipitation / totalDays).toFixed(1)) : 0;
  const wetDayChance = totalDays > 0 ? Number(((totalWetDays / totalDays) * 100).toFixed(0)) : 0;
  const targetMonthAvgPrecipitation = monthDays > 0 ? Number((monthPrecipitation / monthDays).toFixed(1)) : 0;
  const targetMonthWetDayChance = monthDays > 0 ? Number(((monthWetDays / monthDays) * 100).toFixed(0)) : 0;

  let note = "Last 2 years suggest generally manageable rainfall patterns.";
  if (targetMonthWetDayChance >= 55 || targetMonthAvgPrecipitation >= 8) {
    note = "Last 2 years show this month is often wet. Prepare rain gear and keep a backup date.";
  } else if (targetMonthWetDayChance >= 35 || targetMonthAvgPrecipitation >= 4) {
    note = "Last 2 years show mixed conditions for this month. Recheck weather near hike day.";
  }

  return {
    periodStart: formatISODate(startDate),
    periodEnd: formatISODate(endDate),
    avgDailyPrecipitation,
    wetDayChance,
    targetMonthAvgPrecipitation,
    targetMonthWetDayChance,
    note,
  };
}
