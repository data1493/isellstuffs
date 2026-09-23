import {
  isDigitalListing,
  isPhysicalListing,
  listingById,
  type Listing,
} from "@/lib/commerce";

/**
 * Curated weekend table. Stand-in fixture ids from `@/lib/commerce`.
 * Sold and file-gone never make the drop.
 */
export const thisWeekPickIds = [
  "ysk-wobbly-lamp",
  "clo-windbreaker",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

export type ThisWeekPickId = (typeof thisWeekPickIds)[number];

export const thisWeekWindow = "This weekend";

/** Stall-keeper tape, not listing copy. Titles and prices stay on the SKU. */
export const thisWeekNotes: Record<ThisWeekPickId, string> = {
  "ysk-wobbly-lamp":
    "The one people actually stop for. Shade optional. Light required.",
  "clo-windbreaker":
    "Worn twice. Still mint if you squint. Smells like the car it lived in.",
  "dl-junk-pricing-pdf":
    "One page from the same table as the lamp. A rule of thumb, not a course.",
  "dl-sample-pack":
    "Twelve shots and a loop. Four dollars. Plays if you are not picky.",
};

export type WeekPick = {
  listing: Listing;
  note: string;
};

/** Stall-keeper tape for a pick. Fixture notes stay; overlay SKUs get a short line. */
export function weekPickNote(id: string) {
  if (id in thisWeekNotes) {
    return thisWeekNotes[id as ThisWeekPickId];
  }
  return "Taped this weekend. Titles and prices stay on the stall.";
}

export function thisWeekPicks(ids: readonly string[] = thisWeekPickIds): WeekPick[] {
  return ids.flatMap((id) => {
    const listing = listingById(id);
    if (!listing) return [];
    if (listing.status === "sold" || listing.status === "file-gone") {
      return [];
    }
    return [{ listing, note: weekPickNote(id) }];
  });
}

export function thisWeekMix(picks: WeekPick[] = thisWeekPicks()) {
  let physical = 0;
  let digital = 0;
  for (const pick of picks) {
    if (isPhysicalListing(pick.listing)) physical += 1;
    if (isDigitalListing(pick.listing)) digital += 1;
  }
  return { physical, digital };
}

export function thisWeekShareLine(picks: WeekPick[] = thisWeekPicks()) {
  if (picks.length === 0) {
    return "The weekend table is empty. Walk the concourse.";
  }

  const titles = picks.map((pick) => pick.listing.title).join("; ");
  return `A weekend stall, not a blog. ${titles}`;
}
