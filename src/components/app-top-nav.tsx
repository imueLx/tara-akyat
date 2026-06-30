"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import type { HubLink } from "@/lib/hub-links";

const navItems = [
  { href: "/", label: "Check weather" },
  { href: "/mountains", label: "Browse mountains" },
];

type Props = {
  hubQuickLinks?: HubLink[];
};

function navTone(isActive: boolean): string {
  if (isActive) {
    return "bg-primary text-primary-foreground shadow-sm";
  }

  return "text-muted-foreground hover:bg-secondary hover:text-foreground";
}

export function AppTopNav({ hubQuickLinks = [] }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <Link href="/" className="block min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-700">Tara Akyat</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
              Check if the day is good for hiking
            </p>
          </Link>
          {hubQuickLinks.length > 0 ? (
            <nav aria-label="Guide hubs" className="mt-2 hidden flex-wrap gap-x-3 gap-y-1 md:flex">
              {hubQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-medium transition ${
                    pathname === link.href ? "text-sky-700" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          <nav
            aria-label="Primary"
            className="grid min-w-0 flex-1 grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary p-1 md:w-auto md:min-w-[250px] md:flex-none"
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
