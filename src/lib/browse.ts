import {
  listings,
  mallHubs,
  type HubId,
  type Listing,
} from "@/lib/commerce";

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
  return listings.filter((listing) => {
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
