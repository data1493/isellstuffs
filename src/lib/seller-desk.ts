/**
 * Stallholder desk for `/sell/desk`.
 * One booth: Folding Table Tuesday. Fixture rows plus seller overlay.
 */
import {
  listings,
  listingsByStall,
  stallById,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import { readSellerListings } from "@/lib/seller-overlay";

export const DESK_STALL_ID = "folding-table-tuesday";

export function deskStall(): Stall | undefined {
  return stallById(DESK_STALL_ID);
}

export function deskListings(): Listing[] {
  return listingsByStall(DESK_STALL_ID);
}

export function isOverlayListing(listing: Listing) {
  return !listings.some((row) => row.id === listing.id);
}

/** Server fixtures/file overlay plus any browser-only `iss:seller-listings` rows. */
export function mergeDeskListings(
  serverRows: Listing[],
  overlayRows: Listing[] = readSellerListings(),
): Listing[] {
  const seen = new Set(serverRows.map((listing) => listing.id));
  const extra = overlayRows.filter(
    (listing) => listing.stallId === DESK_STALL_ID && !seen.has(listing.id),
  );
  return extra.length === 0 ? serverRows : [...extra, ...serverRows];
}
