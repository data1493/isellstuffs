import {
  allStalls,
  listingTypes,
  physicalHubs,
  stallBySlug,
  type ListingType,
  type Stall,
} from "@/lib/commerce";

/** Lookbook wing the mall refuses. Not a stall id. */
export const ARTISAN_HOME_SLUG = "artisan-home";

export function sellStartStalls(): Stall[] {
  return allStalls();
}

export function resolveSellStartStall(slug: string): Stall | undefined {
  const trimmed = slug.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallBySlug(trimmed);
}

export function resolveSellStartType(value: string): ListingType | undefined {
  return listingTypes.find((item) => item === value);
}

export function isArtisanHomeSlug(slug: string) {
  return slug.trim().toLowerCase() === ARTISAN_HOME_SLUG;
}

export function sellStartUnknownStallCopy(slug: string) {
  if (isArtisanHomeSlug(slug)) {
    return {
      eyebrow: "Not a booth",
      title: "No artisan-home stall.",
      body: "This mall does not open a lookbook wing. You list on a booth that already has a corner.",
    };
  }

  return {
    eyebrow: "Packed up",
    title: "That stall is not on this floor.",
    body: "Pick a booth the mall already has. You add to a table, not open a new shop.",
  };
}

export function sellStartUnknownTypeCopy() {
  return {
    eyebrow: "Not a kind",
    title: "Pick physical or digital.",
    body: "One stall can list both. The mall already sells one gift card — this walkthrough does not mint a second.",
  };
}

export function sellStartRefuseLines() {
  return physicalHubs().map((hub) => ({
    id: hub.id,
    name: hub.name,
    rule: hub.rule,
  }));
}

export function digitalAisleCopy() {
  return "Files sit in Download Stall. The booth is still the one you picked. Same stall as the junk — not a second shop, and not a second gift card.";
}

export function isGiftFileFormat(value: string) {
  return value.trim().toUpperCase().includes("GIFT");
}
