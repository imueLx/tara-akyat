import { getTipHostLabel, isBroadSourceLink, sortTipsForReading } from "@/lib/content-quality";
import type { TipSource } from "@/types/hiking";

type Props = {
  tips: TipSource[];
};

const sourceLabel: Record<TipSource["source_type"], string> = {
  travel_agency: "Travel Guide",
  reddit: "Reddit",
  official: "Official",
  facebook: "Facebook",
};

const sourceStyle: Record<TipSource["source_type"], string> = {
  travel_agency: "bg-sky-100 text-sky-800",
  reddit: "bg-orange-100 text-orange-800",
  official: "bg-indigo-100 text-indigo-800",
  facebook: "bg-blue-100 text-blue-800",
};

export function TipsList({ tips }: Props) {
  if (tips.length === 0) {
    return <p className="text-sm text-slate-600">No curated tips yet for this mountain.</p>;
  }

  const sortedTips = sortTipsForReading(tips);

  return (
    <ul className="space-y-3">
      {sortedTips.map((tip) => (
        <li key={tip.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">{tip.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${sourceStyle[tip.source_type]}`}>
              {sourceLabel[tip.source_type]}
            </span>
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-400">{getTipHostLabel(tip.url)}</p>
          <p className="mt-2 text-sm text-slate-700">{tip.note}</p>
          {isBroadSourceLink(tip.url) ? (
            <p className="mt-2 rounded-xl bg-amber-50 px-2.5 py-2 text-xs text-amber-800">
              This opens a general source page, so use the title keywords when searching inside the site.
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tip.safety_tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          <a
            href={tip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-sky-700 hover:text-sky-800"
          >
            Open source
          </a>
        </li>
      ))}
    </ul>
  );
}
