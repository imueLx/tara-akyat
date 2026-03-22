export type DifficultyBand = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export function difficultyBand(score: number): "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  if (score <= 3) {
    return "Beginner";
  }

  if (score <= 6) {
    return "Intermediate";
  }

  if (score <= 8) {
    return "Advanced";
  }

  return "Expert";
}

export function difficultyRangeLabel(band: DifficultyBand): string {
  if (band === "Beginner") {
    return "1-3";
  }
  if (band === "Intermediate") {
    return "4-6";
  }
  if (band === "Advanced") {
    return "7-8";
  }
  return "9";
}

export function difficultyTone(score: number): string {
  if (score <= 3) {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }

  if (score <= 6) {
    return "bg-lime-100 text-lime-800 border-lime-200";
  }

  if (score <= 8) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }

  return "bg-rose-100 text-rose-800 border-rose-200";
}
