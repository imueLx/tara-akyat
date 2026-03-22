import type { RecommendationLevel } from "@/types/hiking";

type Props = {
  value: RecommendationLevel;
};

const styles: Record<RecommendationLevel, string> = {
  Good: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Caution: "bg-amber-100 text-amber-800 border-amber-200",
  "Not Recommended": "bg-rose-100 text-rose-800 border-rose-200",
};

export function RecommendationPill({ value }: Props) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[value]}`}>
      {value}
    </span>
  );
}
