/**
 * Stallholder desk for `/sell/desk` and `/sell/desk/[stall]`.
 * Tuesday is the default door. Other catalog booths get their own desk.
 */
import {
  listings,
  listingsByStall,
  stallById,
  stallBySlug,
  type Listing,
  type Stall,
} from "@/lib/commerce";
import { readSellerListings } from "@/lib/seller-overlay";

export const DESK_STALL_ID = "folding-table-tuesday";

/** POST `/sell/desk/sold`, `/sell/desk/gone`, `/sell/desk/pack`, `/sell/desk/queue`, `/sell/desk/tested`, and `/sell/desk/weekend` live here — not booth slugs. */
export const RESERVED_DESK_SLUGS = new Set([
  "sold",
  "gone",
  "pack",
  "queue",
  "tested",
  "weekend",
]);

export function isReservedDeskSlug(slug: string) {
  return RESERVED_DESK_SLUGS.has(slug.trim().toLowerCase());
}

export function deskStall(): Stall | undefined {
  return stallById(DESK_STALL_ID);
}

export function deskStallBySlug(slug: string): Stall | undefined {
  const trimmed = slug.trim();
  if (!trimmed || isReservedDeskSlug(trimmed)) {
    return undefined;
  }
  return stallBySlug(trimmed);
}

export function deskListings(): Listing[] {
  return listingsByStall(DESK_STALL_ID);
}

export function deskListingsForStall(stallId: string): Listing[] {
  return listingsByStall(stallId);
}

export function isOverlayListing(listing: Listing) {
  return !listings.some((row) => row.id === listing.id);
}

export function mergeDeskListingsForStall(
  stallId: string,
  serverRows: Listing[],
  overlayRows: Listing[] = readSellerListings(),
): Listing[] {
  const seen = new Set(serverRows.map((listing) => listing.id));
  const extra = overlayRows.filter(
    (listing) => listing.stallId === stallId && !seen.has(listing.id),
  );
  return extra.length === 0 ? serverRows : [...extra, ...serverRows];
}

/** Server fixtures/file overlay plus any browser-only `iss:seller-listings` rows. */
export function mergeDeskListings(
  serverRows: Listing[],
  overlayRows: Listing[] = readSellerListings(),
): Listing[] {
  return mergeDeskListingsForStall(DESK_STALL_ID, serverRows, overlayRows);
}

/** Overlay booths besides the one this desk already shows. */
export function overlayDeskStalls(
  overlayRows: Listing[] = readSellerListings(),
  excludeStallId: string = DESK_STALL_ID,
): Stall[] {
  const seen = new Set<string>();
  const booths: Stall[] = [];

  for (const listing of overlayRows) {
    if (listing.stallId === excludeStallId || seen.has(listing.stallId)) {
      continue;
    }
    const stall = stallById(listing.stallId);
    if (!stall) {
      continue;
    }
    seen.add(stall.id);
    booths.push(stall);
  }

  return booths;
}
