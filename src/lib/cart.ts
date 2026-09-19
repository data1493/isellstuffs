/**
 * Wave 2 cart writer. Listing/stall pages persist listing ids only.
 * Cart and checkout routes own the bag UI — import this file, do not
 * invent a second storage key.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cart-listing-ids` stays the client bag.
 * Cookie `iss-cart-listing-ids` is the same JSON for no-JS add-to-cart.
 */
import { isCartEligible, listingById } from "@/lib/commerce";

export const CART_STORAGE_KEY = "iss:cart-listing-ids";
export const CART_COOKIE_NAME = "iss-cart-listing-ids";

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

export function parseCartListingIds(raw: string | null | undefined): string[] {
  if (!raw) {
    return emptyIds;
  }

  try {
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return emptyIds;
    }
    const ids = parsed.filter((id): id is string => typeof id === "string");
    return ids.length === 0 ? emptyIds : ids;
  } catch {
    return emptyIds;
  }
}

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CART_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
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
  const fromStorage = window.localStorage.getItem(CART_STORAGE_KEY);
  if (fromStorage) {
    return snapshotFromRaw(fromStorage);
  }
  const fromCookie = readCookieRaw();
  if (fromCookie) {
    const ids = snapshotFromRaw(fromCookie);
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // blocked storage
    }
    return ids;
  }
  return snapshotFromRaw(null);
}

export function writeCartListingIds(listingIds: string[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = JSON.stringify(listingIds);
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${CART_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
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

export function addListingIdToCart(
  listingId: string,
  listingIds: string[],
): CartWriteResult {
  const listing = listingById(listingId);
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }

  if (!isCartEligible(listing)) {
    return { ok: false, reason: "not-eligible", listingIds };
  }

  if (listingIds.includes(listingId)) {
    return { ok: true, already: true, listingIds };
  }

  return {
    ok: true,
    already: false,
    listingIds: [...listingIds, listingId],
  };
}

export function addListingToCart(listingId: string): CartWriteResult {
  const result = addListingIdToCart(listingId, readCartListingIds());
  if (result.ok && !result.already) {
    writeCartListingIds(result.listingIds);
  }
  return result;
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
