import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Error 404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        We could not find that page
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        The page you are looking for may have moved or never existed. Head back to plan your next hike.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Back to planner</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/mountains">Browse mountains</Link>
        </Button>
      </div>
    </main>
  );
}
