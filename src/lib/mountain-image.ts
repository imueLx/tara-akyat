type MountainImageLoadingProps = {
  loading: "eager" | "lazy";
  fetchPriority: "high" | "auto";
};

const PEAK_FOCUS_OBJECT_POSITION_BY_SLUG: Record<string, string> = {
  "mt-nagpatong": "50% 62%",
  "mt-timbak": "50% 60%",
  "mt-hapunang-banoi": "50% 58%",
};

export function getMountainImageObjectPosition(slug: string): string {
  return PEAK_FOCUS_OBJECT_POSITION_BY_SLUG[slug] ?? "50% 50%";
}

export function getMountainImageLoadingProps(isCritical = false): MountainImageLoadingProps {
  if (isCritical) {
    return {
      loading: "eager",
      fetchPriority: "high",
    };
  }

  return {
    loading: "lazy",
    fetchPriority: "auto",
  };
}
