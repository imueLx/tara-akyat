import Link from "next/link";

import type { Mountain } from "@/types/hiking";

type Props = {
  title: string;
  description: string;
  mountains: Mountain[];
};

export function MountainLinkGrid({ title, description, mountains }: Props) {
  return (
    <section className="mt-5 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Mountain Links</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-slate-950 sm:text-lg">{title}</h2>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {mountains.map((mountain) => (
          <Link
            key={mountain.id}
            href={`/mountains/${mountain.slug}`}
            className="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-4 py-4 transition hover:border-slate-300 hover:bg-white"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              {mountain.province}, {mountain.region}
            </p>
            <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-950">{mountain.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{mountain.summary}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
