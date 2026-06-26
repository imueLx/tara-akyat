import { z } from "zod";

import { isValidDate } from "@/lib/date";

const Latitude = z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90");
const Longitude = z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180");
const IsoDate = z.string().refine(isValidDate, "Use a valid YYYY-MM-DD date");

export const WeatherCheckQuerySchema = z.object({
  lat: Latitude,
  lon: Longitude,
  date: IsoDate,
});

export type WeatherCheckQuery = z.infer<typeof WeatherCheckQuerySchema>;

export const BestDaysQuerySchema = z.object({
  lat: Latitude,
  lon: Longitude,
  days: z.coerce.number().int().min(1).max(7).default(7),
});

export type BestDaysQuery = z.infer<typeof BestDaysQuerySchema>;

export type ParsedQuery<T> = { ok: true; data: T } | { ok: false; message: string };

export function parseQuery<S extends z.ZodType>(
  schema: S,
  params: URLSearchParams,
): ParsedQuery<z.infer<S>> {
  const result = schema.safeParse(Object.fromEntries(params.entries()));

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const issue = result.error.issues[0];
  const field = issue?.path.join(".") || "query";
  return { ok: false, message: `Invalid ${field}: ${issue?.message ?? "bad request"}.` };
}
