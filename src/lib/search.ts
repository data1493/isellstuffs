import {
  hubById,
  listings,
  stallById,
  type Listing,
} from "@/lib/commerce";
import { searchPath } from "@/lib/paths";

/** Presentation query helper — not a commerce shape. */
export function normalizeSearchQuery(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/\s+/g, " ");
}

export function searchHref(query?: string): string {
  return searchPath(query);
}

function listingHaystack(listing: Listing): string {
  const stall = stallById(listing.stallId);
  const hub = hubById(listing.hubId);

  return [
    listing.title,
    hub.name,
    hub.id,
    hub.slug,
    stall?.boothName,
    stall?.id,
    stall?.slug,
    listing.type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Query the stand-in catalog by title, hub, stall, or physical/digital.
 * Token AND — every word in the query must hit the haystack.
 */
export function searchListings(query: string): Listing[] {
  const normalized = normalizeSearchQuery(query).toLowerCase();
  if (!normalized) return [];

  const tokens = normalized.split(" ").filter(Boolean);

  return listings.filter((listing) => {
    const text = listingHaystack(listing);
    return tokens.every((token) => text.includes(token));
  });
}
