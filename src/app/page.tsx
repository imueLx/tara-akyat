import { HomePlannerClient } from "@/components/mountains/home-planner-client";
import { getMountains } from "@/lib/mountains";

type Props = {
  searchParams?: Promise<{ date?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialDate = resolvedSearchParams?.date;
  const mountains = getMountains().map((mountain) => ({
    id: mountain.id,
    name: mountain.name,
    slug: mountain.slug,
    region: mountain.region,
    province: mountain.province,
    lat: mountain.lat,
    lon: mountain.lon,
    image_url: mountain.image_url,
    image_verified: mountain.image_verified,
    difficulty_source_url: mountain.difficulty_source_url,
    difficulty_score: mountain.difficulty_score,
    summary: mountain.summary,
  }));

  return (
    <div className="min-h-screen pb-10">
      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-5 sm:pt-5 md:px-6 md:pt-6">
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f5fbff_52%,#eefaf2_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-sky-700">Tara Akyat</p>
                <h1 className="mt-3 max-w-xl text-[2rem] font-semibold leading-tight text-slate-950 sm:text-4xl">
                  Check if the day is good for hiking.
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
                  A weather-first hiking checker for Philippine mountains, built to feel clear and quick on your phone.
                </p>
              </div>

              <div className="flex w-full sm:w-auto">
                <a
                  href="#planner"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
                >
                  Start planning
                </a>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Mountain spots</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{mountains.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Best forecast use</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">3 to 7 days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Long-range mode</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">2-year history guide</p>
              </div>
            </div>
          </div>
        </section>

        <section id="planner" className="scroll-mt-28 pt-4 sm:scroll-mt-32 sm:pt-6">
          <HomePlannerClient mountains={mountains} initialDate={initialDate} />
        </section>
      </main>
    </div>
  );
}
