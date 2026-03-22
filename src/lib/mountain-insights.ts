import type { Mountain } from "@/types/hiking";

export type MountainInsight = {
  bestFor: string[];
  trailVibe: string;
  planningFit: string;
  tagalogLine: string;
};

type MountainInsightSource = Pick<Mountain, "id" | "province" | "summary" | "difficulty_score">;

export type HomeHighlight = {
  title: string;
  body: string;
  tone: string;
};

const scenicKeywords = [
  { needle: "sea of clouds", label: "sea of clouds" },
  { needle: "sunrise", label: "sunrise hikes" },
  { needle: "ridge", label: "ridge walks" },
  { needle: "ridgeline", label: "ridge walks" },
  { needle: "coastal", label: "sea views" },
  { needle: "sea views", label: "sea views" },
  { needle: "lake", label: "lake views" },
  { needle: "river", label: "river side trips" },
  { needle: "forest", label: "forest trails" },
  { needle: "grassland", label: "wide-open grassland" },
  { needle: "historic", label: "history side trips" },
  { needle: "volcanic", label: "volcanic landscapes" },
];

const homeHighlights: HomeHighlight[] = [
  {
    title: "Lakarin ang plano",
    body: "Unahin ang tamang araw bago ang biglang budol booking. Mas panatag ang akyat kapag klaro ang ulan at hangin.",
    tone: "border-sky-200 bg-sky-50 text-sky-950",
  },
  {
    title: "Hindi lahat ng araw, akyat day",
    body: "Kapag sabi ng app na alanganin, ibig sabihin puwede pang magbago ang plano. Bundok pa rin, pero may respeto sa panahon.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  {
    title: "Sulit kapag handa",
    body: "Local trail mood, weather check, at tamang pacing. Ganyan ang tunay na solid na gala, hindi bara-bara.",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
  },
];

function hashString(value: string): number {
  return value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function pickById(id: string, choices: string[]): string {
  return choices[hashString(id) % choices.length];
}

function addIfMissing(items: string[], value: string) {
  if (!items.includes(value)) {
    items.push(value);
  }
}

function deriveBestFor(mountain: MountainInsightSource): string[] {
  const summary = mountain.summary.toLowerCase();
  const bestFor: string[] = [];

  if (mountain.difficulty_score <= 3) {
    addIfMissing(bestFor, "first-time hikers");
    addIfMissing(bestFor, "barkada dayhikes");
  } else if (mountain.difficulty_score <= 5) {
    addIfMissing(bestFor, "weekend training hikes");
  } else {
    addIfMissing(bestFor, "strong, prepared hikers");
  }

  scenicKeywords.forEach((item) => {
    if (summary.includes(item.needle)) {
      addIfMissing(bestFor, item.label);
    }
  });

  if (summary.includes("multi-day") || mountain.difficulty_score >= 8) {
    addIfMissing(bestFor, "major climb prep");
  }

  if (summary.includes("cool") || summary.includes("freezing")) {
    addIfMissing(bestFor, "cool-weather hikes");
  }

  if (summary.includes("near metro manila") || mountain.province === "Rizal") {
    addIfMissing(bestFor, "quick Manila escape");
  }

  return bestFor.slice(0, 3);
}

function deriveTrailVibe(mountain: MountainInsightSource): string {
  const summary = mountain.summary.toLowerCase();

  if (summary.includes("ridge") || summary.includes("ridgeline")) {
    return "Open ridge trail with exposed view sections.";
  }

  if (summary.includes("forest") || summary.includes("rainforest") || summary.includes("mossy")) {
    return "Forest-heavy trail with cooler, shaded sections.";
  }

  if (summary.includes("river")) {
    return "Mixed trail day with river or water-side sections.";
  }

  if (summary.includes("volcanic") || summary.includes("limestone") || summary.includes("rocky")) {
    return "More rugged terrain, so footing matters on this climb.";
  }

  if (mountain.difficulty_score <= 3) {
    return "Friendly trail pace for beginners and casual hiking groups.";
  }

  if (mountain.difficulty_score >= 8) {
    return "Serious mountain day that rewards stamina, pacing, and prep.";
  }

  return "Balanced hike with enough challenge to feel rewarding.";
}

function derivePlanningFit(mountain: MountainInsightSource): string {
  if (mountain.difficulty_score <= 3) {
    return "Best when you want a lighter akyat with a strong view-to-effort payoff.";
  }

  if (mountain.difficulty_score <= 5) {
    return "Best for weekend hikers who want a solid climb without going full expedition mode.";
  }

  if (mountain.difficulty_score <= 8) {
    return "Best for hikers building toward major climbs or looking for a more serious mountain day.";
  }

  return "Best for highly experienced hikers who want a technical and demanding challenge.";
}

function deriveTagalogLine(mountain: MountainInsightSource): string {
  const summary = mountain.summary.toLowerCase();

  if (summary.includes("sea of clouds")) {
    return pickById(mountain.id, [
      "Main character ang dating kapag humabol ang sea of clouds.",
      "Pag ito ang inakyat mo, sulit ang alarm na madaling-araw.",
      "Ito yung tipong view na mapapasabi ka ng 'grabe, sulit ang hingal.'",
    ]);
  }

  if (mountain.difficulty_score <= 3) {
    return pickById(mountain.id, [
      "Kayang-kaya sa ensayo mode, lalo na kung barkada ang kasama.",
      "Hindi kailangan magpaka-bayani para ma-enjoy ang bundok na ito.",
      "Petiks sa level, pero panalo pa rin sa vibe.",
    ]);
  }

  if (mountain.difficulty_score <= 5) {
    return pickById(mountain.id, [
      "May konting hingal, pero hindi ka iiwan ng gantimpalang view.",
      "Ito yung tamang timpla ng pawis at sulit.",
      "Sakto para sa 'gusto ko ng challenge pero ayoko munang masira ang tuhod' mood.",
    ]);
  }

  if (mountain.difficulty_score <= 8) {
    return pickById(mountain.id, [
      "Hindi ito petiks, pero sobrang sulit kapag handa ang katawan at pacing.",
      "Akyat na may respeto sa bundok, hindi bara-bara.",
      "Ito yung bundok na mas masaya kapag maayos ang ensayo at maaga ang tulog.",
    ]);
  }

  return pickById(mountain.id, [
    "Pang malakas ang loob, tuhod, at disiplina.",
    "Hindi ito para sa biglang yaya lang. Dapat handa ka talaga.",
    "Legend-level na akyat ito, kaya dapat legend-level din ang paghahanda.",
  ]);
}

export function getMountainInsight(mountain: MountainInsightSource): MountainInsight {
  return {
    bestFor: deriveBestFor(mountain),
    trailVibe: deriveTrailVibe(mountain),
    planningFit: derivePlanningFit(mountain),
    tagalogLine: deriveTagalogLine(mountain),
  };
}

export function getHomeHighlights(): HomeHighlight[] {
  return homeHighlights;
}
