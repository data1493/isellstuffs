/**
 * Shake sold / packed / ghost ids out of a fat tote.
 * Reads `@/lib/commerce` live rows. Writes the existing cart cookie only.
 * Never a second bag key. Never rewrites bag-this-table or pay.
 */
import {
  isCartEligible,
  isPhysicalListing,
  listingById,
  stallById,
  type Listing,
} from "@/lib/commerce";
import { isStallPacked } from "@/lib/packed-stall";

export type ShakeGhostReason =
  | "sold"
  | "packed"
  | "file-gone"
  | "missing"
  | "not-eligible";

export type ShakeNotice = "dropped" | "clean" | "empty";

export type ShakeRow = {
  id: string;
  keep: boolean;
  reason?: ShakeGhostReason;
  listing?: Listing;
};

const emptyIds: string[] = [];
const emptyRows: ShakeRow[] = [];

export function uniqueShakeIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string" || id.length === 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    next.push(id);
  }
  return next.length === 0 ? emptyIds : next;
}

export function shakeGhostCopy(reason: ShakeGhostReason) {
  switch (reason) {
    case "sold":
      return "Sold off the table";
    case "packed":
      return "Booth packed up";
    case "file-gone":
      return "File gone";
    case "missing":
      return "Not on the floor";
    case "not-eligible":
      return "Not for the tote";
  }
}

export function classifyShakeId(id: string): ShakeRow {
  const listing = listingById(id);
  if (!listing) {
    return { id, keep: false, reason: "missing" };
  }
  if (isCartEligible(listing)) {
    return { id, keep: true, listing };
  }
  if (listing.status === "sold") {
    return { id, keep: false, reason: "sold", listing };
  }
  if (listing.status === "file-gone") {
    return { id, keep: false, reason: "file-gone", listing };
  }
  if (isPhysicalListing(listing) && isStallPacked(listing.stallId)) {
    return { id, keep: false, reason: "packed", listing };
  }
  return { id, keep: false, reason: "not-eligible", listing };
}

export function shakeCartListingIds(cartIds: readonly string[]): {
  listingIds: string[];
  kept: ShakeRow[];
  dropped: ShakeRow[];
  rows: ShakeRow[];
  notice: ShakeNotice;
} {
  const rows = uniqueShakeIds(cartIds).map(classifyShakeId);
  const kept = rows.filter((row) => row.keep);
  const dropped = rows.filter((row) => !row.keep);
  const listingIds =
    kept.length === 0 ? emptyIds : kept.map((row) => row.id);
  const notice: ShakeNotice =
    rows.length === 0 ? "empty" : dropped.length > 0 ? "dropped" : "clean";

  return {
    listingIds,
    kept: kept.length === 0 ? emptyRows : kept,
    dropped: dropped.length === 0 ? emptyRows : dropped,
    rows: rows.length === 0 ? emptyRows : rows,
    notice,
  };
}

export function shakeLineTitle(row: ShakeRow) {
  return row.listing?.title ?? row.id;
}

export function shakeLineBooth(row: ShakeRow) {
  if (!row.listing) {
    return "Unknown stall";
  }
  return stallById(row.listing.stallId)?.boothName ?? "Unknown stall";
}
