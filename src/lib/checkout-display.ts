import {
  hubById,
  isDigitalListing,
  listingById,
  stallById,
  type Listing,
  type Stall,
} from "@/lib/commerce";

export type DisplayLine = {
  listing: Listing;
  stall: Stall;
};

export type StallGroup = {
  stall: Stall;
  lines: DisplayLine[];
};

export function listingDetail(listing: Listing): string {
  return isDigitalListing(listing) ? listing.fileFormat : listing.condition;
}

export function groupListingsByStall(listingIds: string[]): StallGroup[] {
  const groups = new Map<string, StallGroup>();

  for (const id of listingIds) {
    const listing = listingById(id);
    if (!listing) {
      continue;
    }
    const stall = stallById(listing.stallId);
    if (!stall) {
      continue;
    }
    const existing = groups.get(stall.id);
    if (existing) {
      existing.lines.push({ listing, stall });
    } else {
      groups.set(stall.id, { stall, lines: [{ listing, stall }] });
    }
  }

  return [...groups.values()];
}

export function cartMix(listings: Listing[]): {
  physical: number;
  digital: number;
} {
  return listings.reduce(
    (counts, listing) => {
      if (listing.type === "physical") {
        counts.physical += 1;
      } else {
        counts.digital += 1;
      }
      return counts;
    },
    { physical: 0, digital: 0 },
  );
}

export function hubName(listing: Listing): string {
  return hubById(listing.hubId).name;
}
