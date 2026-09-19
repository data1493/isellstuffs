/**
 * Stallholder driveway queue. Physical lines from paid slips.
 * Hours come from `stallPickupNote` via the pickup helper — no new Stall field.
 * Digital and gift lines stay in the folder / gift desk.
 */
import type { PhysicalListing, Stall } from "@/lib/commerce";
import type { OrderSlip } from "@/lib/order-history";
import type { StallPickupNote } from "@/lib/pickup-display";
import { physicalLinesOnSlip } from "@/lib/pickup-slip";

export type QueueSlip = Pick<OrderSlip, "id" | "listingIds"> & {
  buyerName?: string;
};

export type QueueArrival = {
  slipId: string;
  listing: PhysicalListing;
  buyerName?: string;
};

export type QueueBooth = {
  stall: Stall;
  pickup: StallPickupNote;
  titles: string[];
  arrivals: QueueArrival[];
};

/** Paid physicals grouped by booth. Same SKU on two slips is two arrivals. */
export function queueBoothsFromSlips(slips: QueueSlip[]): QueueBooth[] {
  const booths = new Map<string, QueueBooth>();
  const seen = new Set<string>();

  for (const slip of slips) {
    for (const line of physicalLinesOnSlip(slip.listingIds)) {
      const key = `${slip.id}:${line.listing.id}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const arrival: QueueArrival = {
        slipId: slip.id,
        listing: line.listing,
        buyerName: slip.buyerName,
      };

      const existing = booths.get(line.stall.id);
      if (existing) {
        existing.arrivals.push(arrival);
        if (!existing.titles.includes(line.listing.title)) {
          existing.titles.push(line.listing.title);
        }
        continue;
      }

      booths.set(line.stall.id, {
        stall: line.stall,
        pickup: line.pickup,
        titles: [line.listing.title],
        arrivals: [arrival],
      });
    }
  }

  return [...booths.values()];
}

export function queueHasPhysicalLines(slips: QueueSlip[]): boolean {
  return slips.some((slip) => physicalLinesOnSlip(slip.listingIds).length > 0);
}
