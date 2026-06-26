import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mountain not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Mountain not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested hiking spot is not in the current list.
        </p>
        <Button asChild className="mt-4">
          <Link href="/mountains">Browse mountains</Link>
        </Button>
      </div>
    </main>
  );
}
