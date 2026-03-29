"use client";

import { useSearchParams } from "next/navigation";

import { isValidDate } from "@/lib/date";

import { DateWeatherChecker } from "@/components/mountains/date-weather-checker";

type Props = {
  lat: number;
  lon: number;
};

export function DateWeatherQueryBridge({ lat, lon }: Props) {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const initialDate = date && isValidDate(date) ? date : undefined;

  return <DateWeatherChecker lat={lat} lon={lon} initialDate={initialDate} />;
}
