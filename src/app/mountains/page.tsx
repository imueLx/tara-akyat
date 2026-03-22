import { MountainListClient } from "@/components/mountains/mountain-list-client";
import { getMountains, getRegions } from "@/lib/mountains";

export default function MountainsBrowsePage() {
  const mountains = getMountains();
  const regions = getRegions();

  return (
    <div className="min-h-screen pb-8">
      <MountainListClient mountains={mountains} regions={regions} />
    </div>
  );
}
