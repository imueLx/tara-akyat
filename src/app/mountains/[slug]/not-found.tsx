import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Mountain not found</h1>
        <p className="mt-2 text-sm text-slate-600">The requested hiking spot is not in the current v1 list.</p>
        <Link href="/" className="mt-4 inline-flex rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white">
          Back to list
        </Link>
      </div>
    </main>
  );
}
