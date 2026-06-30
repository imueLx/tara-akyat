import { formatGaugeRating, formatRainAmountDetail, getTrailRainImpact } from "@/lib/weather/presentation";

type Props = {
  valueMm: number;
  variant?: "metric" | "compact" | "history";
  className?: string;
};

function RainGauge({
  segments,
  barClassName,
  label,
}: {
  segments: number;
  barClassName: string;
  label: string;
}) {
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tabular-nums text-slate-500">{formatGaugeRating(segments)}</p>
      </div>
      <div className="flex gap-1" role="img" aria-label={label}>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={`rain-gauge-segment-${index}`}
            className={`h-2 flex-1 rounded-full ${index < segments ? barClassName : "bg-slate-200/80"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function RainAmountDisplay({ valueMm, variant = "metric", className = "" }: Props) {
  const impact = getTrailRainImpact(valueMm);
  const gaugeLabel = `${impact.label}. ${formatGaugeRating(impact.gaugeSegments)} trail rain.`;
  const labelClass =
    variant === "compact" ? "text-sm font-semibold text-slate-950" : "text-base font-semibold leading-tight sm:text-lg";

  return (
    <div className={className}>
      <p className={`${labelClass} ${impact.valueClassName}`}>{impact.label}</p>
      <RainGauge segments={impact.gaugeSegments} barClassName={impact.barClassName} label={gaugeLabel} />
      <p className={`text-slate-500 ${variant === "compact" ? "mt-1.5 text-[11px]" : "mt-1 text-[11px]"}`}>
        {formatRainAmountDetail(valueMm)}
      </p>
    </div>
  );
}
