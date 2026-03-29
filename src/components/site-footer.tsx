import Link from "next/link";

const footerSections = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Check hiking weather" },
      { href: "/mountains", label: "Browse all mountains" },
      { href: "/regions/luzon", label: "Luzon guides" },
      { href: "/difficulty/beginner", label: "Beginner hikes" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/about", label: "About Tara Akyat" },
      { href: "/methodology", label: "Methodology" },
      { href: "/sources", label: "Sources and editorial policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-[1.2fr,1fr,1fr] sm:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Tara Akyat</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            Hiking weather planning and mountain guide pages for Philippine day hikes, weekend climbs, and longer summit trips.
          </p>
        </div>
        {footerSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-slate-900">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
