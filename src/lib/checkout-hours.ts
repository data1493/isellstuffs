/**
 * Hours on the mock-pay aside. Physical booths on a slip get
 * `stallPickupNote` (fixture or taped weekend overlay). Digital-only
 * and gift-only get nothing. Read hours — do not write them.
 * Do not restyle the pay form.
 */
import {
  isPhysicalListing,
  listingById,
  stallById,
  type Stall,
} from "@/lib/commerce";
import { stallPickupNote, type StallPickupNote } from "@/lib/pickup-display";

export const CHECKOUT_HOURS_COPY = "Pay, then walk up. We do not ship.";

export type CheckoutBoothHours = {
  stall: Stall;
  pickup: StallPickupNote;
};

/** Physical booths only. A PDF or gift line does not mint driveway hours. */
export function checkoutHoursOnSlip(
  listingIds: readonly string[],
): CheckoutBoothHours[] {
  const booths = new Map<string, CheckoutBoothHours>();

  for (const id of listingIds) {
    const listing = listingById(id);
    if (!listing || !isPhysicalListing(listing)) {
      continue;
    }

    const stall = stallById(listing.stallId);
    if (!stall || booths.has(stall.id)) {
      continue;
    }

    booths.set(stall.id, {
      stall,
      pickup: stallPickupNote(stall),
    });
  }

  return [...booths.values()];
}

export function checkoutHoursForStall(
  listingIds: readonly string[],
  stallId: string,
): StallPickupNote | null {
  const booth = checkoutHoursOnSlip(listingIds).find(
    (row) => row.stall.id === stallId,
  );
  return booth?.pickup ?? null;
}
