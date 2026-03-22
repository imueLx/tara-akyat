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
        <section id="planner" className="scroll-mt-28 sm:scroll-mt-32">
          <HomePlannerClient mountains={mountains} initialDate={initialDate} />
        </section>
      </main>
    </div>
  );
}
