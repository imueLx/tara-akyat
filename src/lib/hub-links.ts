import { getActiveMonthHubs, getDifficultyHubs, getRegionHubs } from "@/lib/mountain-taxonomy";

export type HubLink = {
  href: string;
  label: string;
};

export function getRegionHubLinks(): HubLink[] {
  return getRegionHubs().map((hub) => ({
    href: hub.href,
    label: `${hub.name} guides`,
  }));
}

export function getActiveMonthHubLinks(limit = 3): HubLink[] {
  return getActiveMonthHubs(limit).map((hub) => ({
    href: hub.href,
    label: `${hub.name} hikes`,
  }));
}

export function getDifficultyHubLinks(): HubLink[] {
  return getDifficultyHubs().map((hub) => ({
    href: hub.href,
    label: `${hub.name} hikes`,
  }));
}

export function getFooterExploreLinks(): HubLink[] {
  return [
    { href: "/", label: "Check hiking weather" },
    { href: "/mountains", label: "Browse all mountains" },
    ...getRegionHubLinks(),
    ...getActiveMonthHubLinks(),
    ...getDifficultyHubLinks(),
  ];
}

export function getNavHubQuickLinks(): HubLink[] {
  return [
    ...getRegionHubs().map((hub) => ({ href: hub.href, label: hub.name })),
    ...getActiveMonthHubs(2).map((hub) => ({ href: hub.href, label: hub.name })),
    ...getDifficultyHubs().map((hub) => ({ href: hub.href, label: hub.name })),
  ];
}
