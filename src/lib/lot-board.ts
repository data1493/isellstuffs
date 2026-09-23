/**
 * Published lot map. Who set up this weekend.
 *
 * Reads `allStalls()` plus packed stall ids. Does not write the pack-up
 * flag, the tote, sold, file-gone, or a new Stall field.
 * Booths are the unit — not SKUs.
 */
import {
  allStalls,
  hubById,
  isPhysicalListing,
  listingsByStall,
  type Stall,
} from "@/lib/commerce";
import { parsePackedStallIds } from "@/lib/packed-stall";

export const LOT_PACKED_COPY =
  "The table went in the car. Files in the folder still exist.";

export type LotPresence = "on" | "off";

export type LotBooth = {
  stall: Stall;
  packed: boolean;
  presence: LotPresence;
  stillHerePhysical: number;
  aisle: string | null;
  giftDesk: boolean;
};

/** Missing or unreadable pack-up helper → nobody packed. Every booth is out. */
export function parseLotPackedIds(raw?: string | null): string[] {
  try {
    return parsePackedStallIds(raw);
  } catch {
    return [];
  }
}

export function stillHerePhysicalCount(stallId: string): number {
  return listingsByStall(stallId).filter(
    (listing) =>
      isPhysicalListing(listing) &&
      listing.status === "available" &&
      listing.cartEligible,
  ).length;
}

export function stallAisleName(stallId: string): string | null {
  const rows = listingsByStall(stallId);
  const listing = rows.find(isPhysicalListing) ?? rows[0];
  if (!listing) {
    return null;
  }
  return hubById(listing.hubId).name;
}

export function lotBoard(packedRaw?: string | null): LotBooth[] {
  const packedIds = new Set(parseLotPackedIds(packedRaw));
  return allStalls().map((stall) => {
    const packed = packedIds.has(stall.id);
    return {
      stall,
      packed,
      presence: packed ? "off" : "on",
      stillHerePhysical: packed ? 0 : stillHerePhysicalCount(stall.id),
      aisle: stallAisleName(stall.id),
      giftDesk: stall.id === "gift-desk",
    };
  });
}

export function lotOn(rows: readonly LotBooth[]): LotBooth[] {
  return rows.filter((row) => row.presence === "on");
}

export function lotOff(rows: readonly LotBooth[]): LotBooth[] {
  return rows.filter((row) => row.presence === "off");
}
