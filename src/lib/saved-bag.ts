/**
 * Scoop the later pile into the existing tote.
 * Reads saved ids, keeps `isCartEligible`, writes via `@/lib/cart` only.
 * Never writes the saved cookie. Never a second cart key.
 */
import { addListingIdToCart } from "@/lib/cart";
import { isCartEligible, listingById } from "@/lib/commerce";

export type SavedBagNotice = "scooped" | "empty";

const emptyIds: string[] = [];

export function eligibleSavedListingIds(
  savedIds: readonly string[],
): string[] {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const id of savedIds) {
    if (typeof id !== "string" || id.length === 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    const listing = listingById(id);
    if (!listing || !isCartEligible(listing)) {
      continue;
    }
    next.push(id);
  }
  return next.length === 0 ? emptyIds : next;
}

export function bagSavedListingIds(
  savedIds: readonly string[],
  cartIds: string[],
): { listingIds: string[]; eligible: string[] } {
  const eligible = eligibleSavedListingIds(savedIds);
  let listingIds = cartIds;
  for (const id of eligible) {
    const result = addListingIdToCart(id, listingIds);
    if (result.ok) {
      listingIds = result.listingIds;
    }
  }
  return { listingIds, eligible };
}
