import { z } from "zod";

import type { Mountain, TipSource } from "@/types/hiking";

export const MONTHS = [
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
] as const;

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

export const TIP_SOURCE_TYPES = ["travel_agency", "reddit", "official", "facebook"] as const;

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase words separated by hyphens");

export const MountainSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug,
  region: z.string().min(1),
  province: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  image_url: z.string().min(1),
  image_source_url: z.string().url().nullish(),
  image_verified: z.boolean().optional(),
  image_credit: z.string().nullish(),
  image_license: z.string().nullish(),
  elevation_m: z.number().nonnegative(),
  difficulty_score: z.number().int().min(1).max(9),
  difficulty_source_url: z.string().url().optional(),
  difficulty_source_note: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES),
  best_months: z.array(z.enum(MONTHS)),
  summary: z.string().min(1),
});

export const TipSourceSchema = z.object({
  id: z.string().min(1),
  mountain_id: z.string().min(1),
  source_type: z.enum(TIP_SOURCE_TYPES),
  title: z.string().min(1),
  url: z.string().url(),
  note: z.string(),
  safety_tags: z.array(z.string()),
});

export const MountainsSchema = z.array(MountainSchema);
export const TipSourcesSchema = z.array(TipSourceSchema);

function formatIssues(label: string, error: z.ZodError): string {
  const lines = error.issues
    .slice(0, 20)
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  return `Invalid ${label} data:\n${lines.join("\n")}`;
}

export function parseMountains(data: unknown): Mountain[] {
  const result = MountainsSchema.safeParse(data);
  if (!result.success) {
    throw new Error(formatIssues("mountains.json", result.error));
  }

  return result.data as Mountain[];
}

export function parseTips(data: unknown): TipSource[] {
  const result = TipSourcesSchema.safeParse(data);
  if (!result.success) {
    throw new Error(formatIssues("tips.json", result.error));
  }

  return result.data as TipSource[];
}
