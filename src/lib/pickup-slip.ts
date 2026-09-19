import { CHECKOUT_COOKIE, parseCheckoutSession } from "@/lib/checkout";
import {
  isPhysicalListing,
  type PhysicalListing,
  type Stall,
} from "@/lib/commerce";
import { liveListingById, liveStallById } from "@/lib/live-catalog";
import {
  physicalPickupNote,
  type StallPickupNote,
} from "@/lib/pickup-display";

export { CHECKOUT_COOKIE };

export type PickupLine = {
  listing: PhysicalListing;
  stall: Stall;
  pickup: StallPickupNote;
};

export type PickupBooth = {
  stall: Stall;
  pickup: StallPickupNote;
  titles: string[];
  lines: PickupLine[];
};

/** Same cookie read checkout success and the folder use. Optional slip must match. */
export function pickupSlipFromCookie(
  cookieValue: string | undefined,
  slip?: string,
) {
  const stored = parseCheckoutSession(cookieValue);
  if (!stored) {
    return null;
  }
  if (slip && stored.id !== slip) {
    return null;
  }
  return stored;
}

/**
 * Physical lines only. Digital files and gift codes stay in the folder.
 * Hours come from `physicalPickupNote` — no new Stall field.
 */
export function physicalLinesOnSlip(listingIds: string[]): PickupLine[] {
  const lines: PickupLine[] = [];
  const seen = new Set<string>();

  for (const id of listingIds) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);

    const listing = liveListingById(id);
    if (!listing || !isPhysicalListing(listing)) {
      continue;
    }

    const stall = liveStallById(listing.stallId);
    if (!stall) {
      continue;
    }

    const pickup = physicalPickupNote(listing, stall);
    if (!pickup) {
      continue;
    }

    lines.push({ listing, stall, pickup });
  }

  return lines;
}

/** Group walk-up lines by booth: hours, place, note, titles. */
export function pickupBoothsOnSlip(listingIds: string[]): PickupBooth[] {
  const booths = new Map<string, PickupBooth>();

  for (const line of physicalLinesOnSlip(listingIds)) {
    const existing = booths.get(line.stall.id);
    if (existing) {
      existing.lines.push(line);
      existing.titles.push(line.listing.title);
      continue;
    }
    booths.set(line.stall.id, {
      stall: line.stall,
      pickup: line.pickup,
      titles: [line.listing.title],
      lines: [line],
    });
  }

  return [...booths.values()];
}

export function pickupHasPhysicalLines(listingIds: string[]): boolean {
  return physicalLinesOnSlip(listingIds).length > 0;
}
