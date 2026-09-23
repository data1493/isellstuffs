/**
 * Scoop one stall's still-here SKUs into the existing tote.
 * Reads `listingsByStall`, keeps `isCartEligible`, writes via `@/lib/cart` only.
 * Never writes saved / watched / wanted keys. Never a second cart key.
 */
import { addListingIdToCart } from "@/lib/cart";
import {
  isCartEligible,
  listingsByStall,
  stallById,
  stallBySlug,
  type Stall,
} from "@/lib/commerce";

export type StallBagNotice = "scooped" | "empty";

const emptyIds: string[] = [];

export function resolveBagStall(stallKey: string): Stall | undefined {
  const trimmed = stallKey.trim();
  if (!trimmed) {
    return undefined;
  }
  return stallById(trimmed) ?? stallBySlug(trimmed);
}

export function eligibleStallListingIds(stallId: string): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const listing of listingsByStall(stallId)) {
    if (seen.has(listing.id)) {
      continue;
    }
    seen.add(listing.id);
    if (!isCartEligible(listing)) {
      continue;
    }
    next.push(listing.id);
  }
  return next.length === 0 ? emptyIds : next;
}

export function bagStallListingIds(
  stallId: string,
  cartIds: string[],
): { listingIds: string[]; eligible: string[] } {
  const eligible = eligibleStallListingIds(stallId);
  let listingIds = cartIds;
  for (const id of eligible) {
    const result = addListingIdToCart(id, listingIds);
    if (result.ok) {
      listingIds = result.listingIds;
    }
  }
  return { listingIds, eligible };
}
