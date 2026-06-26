import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "src", "data");

const MONTHS = new Set([
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]);

const DIFFICULTIES = new Set(["Beginner", "Intermediate", "Advanced", "Expert"]);
const TIP_SOURCE_TYPES = new Set(["travel_agency", "reddit", "official", "facebook"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function readJson(file) {
  const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
  return JSON.parse(raw);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateMountains(mountains, errors) {
  if (!Array.isArray(mountains)) {
    errors.push("mountains.json must be an array");
    return { ids: new Set(), slugs: new Set() };
  }

  const ids = new Set();
  const slugs = new Set();

  mountains.forEach((mountain, index) => {
    const where = `mountains[${index}] (${mountain?.id ?? "?"})`;

    if (!isNonEmptyString(mountain.id)) errors.push(`${where}: missing id`);
    else if (ids.has(mountain.id)) errors.push(`${where}: duplicate id "${mountain.id}"`);
    else ids.add(mountain.id);

    if (!isNonEmptyString(mountain.slug) || !SLUG_PATTERN.test(mountain.slug)) {
      errors.push(`${where}: invalid slug "${mountain.slug}"`);
    } else if (slugs.has(mountain.slug)) {
      errors.push(`${where}: duplicate slug "${mountain.slug}"`);
    } else {
      slugs.add(mountain.slug);
    }

    if (!isNonEmptyString(mountain.name)) errors.push(`${where}: missing name`);
    if (!isNonEmptyString(mountain.region)) errors.push(`${where}: missing region`);
    if (!isNonEmptyString(mountain.province)) errors.push(`${where}: missing province`);
    if (!isNonEmptyString(mountain.image_url)) errors.push(`${where}: missing image_url`);
    if (!isNonEmptyString(mountain.summary)) errors.push(`${where}: missing summary`);

    if (typeof mountain.lat !== "number" || mountain.lat < -90 || mountain.lat > 90) {
      errors.push(`${where}: lat out of range (${mountain.lat})`);
    }
    if (typeof mountain.lon !== "number" || mountain.lon < -180 || mountain.lon > 180) {
      errors.push(`${where}: lon out of range (${mountain.lon})`);
    }
    if (typeof mountain.elevation_m !== "number" || mountain.elevation_m < 0) {
      errors.push(`${where}: invalid elevation_m (${mountain.elevation_m})`);
    }
    if (
      !Number.isInteger(mountain.difficulty_score) ||
      mountain.difficulty_score < 1 ||
      mountain.difficulty_score > 9
    ) {
      errors.push(`${where}: difficulty_score must be an integer 1-9 (${mountain.difficulty_score})`);
    }
    if (!DIFFICULTIES.has(mountain.difficulty)) {
      errors.push(`${where}: invalid difficulty "${mountain.difficulty}"`);
    }

    if (!Array.isArray(mountain.best_months)) {
      errors.push(`${where}: best_months must be an array`);
    } else {
      for (const month of mountain.best_months) {
        if (!MONTHS.has(month)) errors.push(`${where}: invalid best_months value "${month}"`);
      }
    }
  });

  return { ids, slugs };
}

function validateTips(tips, mountainIds, errors) {
  if (!Array.isArray(tips)) {
    errors.push("tips.json must be an array");
    return;
  }

  const ids = new Set();

  tips.forEach((tip, index) => {
    const where = `tips[${index}] (${tip?.id ?? "?"})`;

    if (!isNonEmptyString(tip.id)) errors.push(`${where}: missing id`);
    else if (ids.has(tip.id)) errors.push(`${where}: duplicate id "${tip.id}"`);
    else ids.add(tip.id);

    if (!isNonEmptyString(tip.mountain_id)) {
      errors.push(`${where}: missing mountain_id`);
    } else if (!mountainIds.has(tip.mountain_id)) {
      errors.push(`${where}: mountain_id "${tip.mountain_id}" has no matching mountain`);
    }

    if (!TIP_SOURCE_TYPES.has(tip.source_type)) {
      errors.push(`${where}: invalid source_type "${tip.source_type}"`);
    }
    if (!isNonEmptyString(tip.title)) errors.push(`${where}: missing title`);
    if (!isHttpUrl(tip.url)) errors.push(`${where}: invalid url "${tip.url}"`);
    if (typeof tip.note !== "string") errors.push(`${where}: note must be a string`);
    if (!Array.isArray(tip.safety_tags)) errors.push(`${where}: safety_tags must be an array`);
  });
}

async function main() {
  const errors = [];

  const [mountains, tips] = await Promise.all([
    readJson("mountains.json"),
    readJson("tips.json"),
  ]);

  const { ids: mountainIds } = validateMountains(mountains, errors);
  validateTips(tips, mountainIds, errors);

  if (errors.length > 0) {
    console.error(`Data validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log(
    `Data validation passed: ${mountains.length} mountains, ${tips.length} tips.`,
  );
}

main().catch((error) => {
  console.error("Data validation crashed:", error);
  process.exit(1);
});
