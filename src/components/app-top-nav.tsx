"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Check weather" },
  { href: "/mountains", label: "Browse mountains" },
];

function navTone(isActive: boolean): string {
  if (isActive) {
    return "bg-slate-950 text-white shadow-sm";
  }

  return "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
}

export function AppTopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-700">Tara Akyat</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            Check if the day is good for hiking
          </p>
        </Link>

        <nav
          aria-label="Primary"
          className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 md:w-auto md:min-w-[250px]"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2.5 text-center text-xs font-semibold transition sm:text-sm ${navTone(isActive)}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
