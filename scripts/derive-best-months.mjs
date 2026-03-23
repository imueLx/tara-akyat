import fs from "node:fs/promises";
import path from "node:path";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WET_DAY_WEIGHT = 1;
const RAIN_WEIGHT = 4;

function monthIndexToName(index) {
  return MONTHS[index];
}

function rotateWindow(startIndex, length) {
  return Array.from({ length }, (_, offset) => (startIndex + offset) % MONTHS.length);
}

function scoreMonth(monthMetric) {
  return monthMetric.wetDayChance * WET_DAY_WEIGHT + monthMetric.avgPrecipitation * RAIN_WEIGHT;
}

function pickBestMonths(monthMetrics) {
  const windows = [];

  for (const length of [3, 4]) {
    for (let startIndex = 0; startIndex < MONTHS.length; startIndex += 1) {
      const indexes = rotateWindow(startIndex, length);
      const selected = indexes.map((index) => monthMetrics[index]);
      const totalScore = selected.reduce((sum, metric) => sum + scoreMonth(metric), 0);
      const averageWetDayChance = selected.reduce((sum, metric) => sum + metric.wetDayChance, 0) / selected.length;
      const averagePrecipitation = selected.reduce((sum, metric) => sum + metric.avgPrecipitation, 0) / selected.length;

      windows.push({
        indexes,
        length,
        totalScore,
        averageScore: totalScore / selected.length,
        averageWetDayChance,
        averagePrecipitation,
      });
    }
  }

  windows.sort((a, b) => a.averageScore - b.averageScore || a.length - b.length);
  const best = windows[0];
  const closeLongerWindow = windows.find(
    (window) =>
      window.length === 4 &&
      window.averageScore <= best.averageScore * 1.06 &&
      window.averageWetDayChance <= best.averageWetDayChance + 3 &&
      window.averagePrecipitation <= best.averagePrecipitation + 0.8,
  );

  const picked = closeLongerWindow ?? best;
  return picked.indexes.map(monthIndexToName);
}

async function fetchArchive(lat, lon, startDate, endDate) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "Asia/Manila",
    start_date: startDate,
    end_date: endDate,
    daily: "precipitation_sum",
  });

  const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "hike-this-day-best-months-script/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo archive request failed with ${response.status} for ${lat},${lon}`);
  }

  return response.json();
}

function deriveMonthMetrics(payload) {
  const buckets = MONTHS.map((month) => ({
    month,
    totalPrecipitation: 0,
    days: 0,
    wetDays: 0,
  }));

  for (let index = 0; index < payload.daily.time.length; index += 1) {
    const date = new Date(`${payload.daily.time[index]}T00:00:00`);
    const rain = payload.daily.precipitation_sum[index] ?? 0;
    const monthIndex = date.getMonth();
    const bucket = buckets[monthIndex];

    bucket.totalPrecipitation += rain;
    bucket.days += 1;
    if (rain >= 1) {
      bucket.wetDays += 1;
    }
  }

  return buckets.map((bucket) => ({
    month: bucket.month,
    avgPrecipitation: bucket.days > 0 ? Number((bucket.totalPrecipitation / bucket.days).toFixed(1)) : 0,
    wetDayChance: bucket.days > 0 ? Number(((bucket.wetDays / bucket.days) * 100).toFixed(0)) : 0,
  }));
}

async function main() {
  const filePath = path.join(process.cwd(), "src", "data", "mountains.json");
  const raw = await fs.readFile(filePath, "utf8");
  const mountains = JSON.parse(raw);
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear - 2}-01-01`;
  const endDate = `${currentYear - 1}-12-31`;

  for (const mountain of mountains) {
    const payload = await fetchArchive(mountain.lat, mountain.lon, startDate, endDate);
    const monthMetrics = deriveMonthMetrics(payload);
    mountain.best_months = pickBestMonths(monthMetrics);
  }

  await fs.writeFile(filePath, `${JSON.stringify(mountains, null, 2)}\n`, "utf8");
  console.log(`Updated best_months for ${mountains.length} mountains using ${startDate} to ${endDate} archive data.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
