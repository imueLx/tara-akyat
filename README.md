# Hike This Day PH

Mobile-first hiking weather checker for mountain spots in the Philippines.

## Features

- Browse 30 seeded PH mountain spots.
- Search and filter by region and difficulty.
- Date checker with mobile-friendly quick picks and planner hints.
- Forecast-based hiking recommendation (`Good`, `Caution`, `Not Recommended`).
- `Open-Meteo` as primary forecast provider.
- Optional `Visual Crossing` secondary provider consensus.
- Secondary provider calls are limited to the next 7 days to preserve free-tier quotas.
- Historical rainfall crosscheck limited to the last 2 years.

## API Endpoints

- `GET /api/weather/check?lat={n}&lon={n}&date=YYYY-MM-DD`
- `GET /api/weather/best-days?lat={n}&lon={n}&days=7`
- `GET /api/mountains`

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Optional second weather API

Add your free Visual Crossing key to `.env.local`:

```bash
VISUAL_CROSSING_API_KEY=your_key_here
```

Without this key, the app still works and uses Open-Meteo only.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```
