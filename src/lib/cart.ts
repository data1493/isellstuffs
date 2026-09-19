/**
 * Wave 2 cart writer. Listing/stall pages persist listing ids only.
 * Cart and checkout routes own the bag UI — import this file, do not
 * invent a second storage key.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 */
import { isCartEligible, listingById } from "@/lib/commerce";

export const CART_STORAGE_KEY = "iss:cart-listing-ids";

export const CART_CHANGED_EVENT = "iss:cart-changed";

export type CartWriteResult =
  | { ok: true; already: boolean; listingIds: string[] }
  | { ok: false; reason: "missing" | "not-eligible"; listingIds: string[] };

const emptyIds: string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: string[] = emptyIds;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function parseCartListingIds(raw: string | null): string[] {
  if (!raw) {
    return emptyIds;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return emptyIds;
    }
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length === 0 ? emptyIds : ids;
  } catch {
    return emptyIds;
  }
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCartListingIds(raw);
  return cachedIds;
}

export function readCartListingIds(): string[] {
  if (!canUseStorage()) {
    return emptyIds;
  }
  return snapshotFromRaw(window.localStorage.getItem(CART_STORAGE_KEY));
}

export function writeCartListingIds(listingIds: string[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = JSON.stringify(listingIds);
  window.localStorage.setItem(CART_STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedIds = listingIds.length === 0 ? emptyIds : listingIds;
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function isListingInCart(
  listingId: string,
  listingIds = readCartListingIds(),
) {
  return listingIds.includes(listingId);
}

export function addListingToCart(listingId: string): CartWriteResult {
  const listing = listingById(listingId);
  const listingIds = readCartListingIds();

  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }

  if (!isCartEligible(listing)) {
    return { ok: false, reason: "not-eligible", listingIds };
  }

  if (listingIds.includes(listingId)) {
    return { ok: true, already: true, listingIds };
  }

  const next = [...listingIds, listingId];
  writeCartListingIds(next);
  return { ok: true, already: false, listingIds: next };
}

export function subscribeCart(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CART_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CART_CHANGED_EVENT, listener);
  };
}
