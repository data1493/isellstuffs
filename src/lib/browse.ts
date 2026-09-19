import {
  allListings,
  mallHubs,
  type HubId,
  type Listing,
} from "@/lib/commerce";

/** Presentation only — not a commerce shape. */
export const hubAtmosphere: Record<
  HubId,
  { wash: string; floor: string; refuse: string }
> = {
  "yard-sale": {
    wash: "bg-[oklch(0.88_0.08_85)]",
    floor: "Driveway table",
    refuse: "No artisan home.",
  },
  "closet-overflow": {
    wash: "bg-[oklch(0.86_0.05_20)]",
    floor: "Hall closet",
    refuse: "No lookbook.",
  },
  "garage-tech": {
    wash: "bg-[oklch(0.84_0.05_145)]",
    floor: "Workbench",
    refuse: "Condition is the copy.",
  },
  "download-stall": {
    wash: "bg-[oklch(0.86_0.045_195)]",
    floor: "Folder on the table",
    refuse: "Not a second site.",
  },
};

export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function isHubId(value: string | undefined): value is HubId {
  return mallHubs.some((hub) => hub.id === value);
}

export function isListingType(
  value: string | undefined,
): value is Listing["type"] {
  return value === "physical" || value === "digital";
}

export function hubBySlug(slug: string) {
  return mallHubs.find((hub) => hub.slug === slug);
}

export function filterListings(filters: {
  hubId?: HubId;
  type?: Listing["type"];
}): Listing[] {
  return allListings().filter((listing) => {
    if (filters.hubId && listing.hubId !== filters.hubId) return false;
    if (filters.type && listing.type !== filters.type) return false;
    return true;
  });
}

export function exploreHref(filters: {
  hubId?: string;
  type?: string;
} = {}): string {
  const params = new URLSearchParams();
  if (filters.hubId) params.set("hub", filters.hubId);
  if (filters.type) params.set("type", filters.type);
  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}
