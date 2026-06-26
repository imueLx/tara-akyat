import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-8">
      <main className={cn("mx-auto max-w-6xl px-3 pt-3 sm:px-6 sm:pt-5", className)}>
        {children}
      </main>
    </div>
  );
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("mb-3 text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={item.label}>
              <li
                aria-current={isLast ? "page" : undefined}
                className={isLast ? "text-foreground" : undefined}
              >
                {item.href && !isLast ? (
                  <Link href={item.href} className="transition hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
              {isLast ? null : (
                <li aria-hidden="true" className="text-muted-foreground">
                  /
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function PageHero({
  eyebrow,
  title,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card px-4 py-4 sm:px-5",
        className,
      )}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h1>
      {children}
    </section>
  );
}

export function SectionCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-border bg-card px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
