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

function sameListingIds(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length && left.every((id, index) => id === right[index])
  );
}

function mergeListingIds(
  ...groups: readonly (readonly string[])[]
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const group of groups) {
    for (const id of group) {
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      merged.push(id);
    }
  }
  return merged.length === 0 ? emptyIds : merged;
}

function decodeCartRaw(raw: string): string {
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    value = raw;
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    try {
      const unquoted = JSON.parse(value);
      if (typeof unquoted === "string") {
        return unquoted;
      }
    } catch {
      // keep the decoded value
    }
  }
  return value;
}

export function parseCartListingIds(raw: string | null | undefined): string[] {
  if (!raw) {
    return emptyIds;
  }

  const candidates = [raw, decodeCartRaw(raw)];
  for (const value of candidates) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        continue;
      }
      const ids = parsed.filter((id): id is string => typeof id === "string");
      if (ids.length > 0) {
        return ids;
      }
    } catch {
      // try the next encoding
    }
  }
  return emptyIds;
}

/** Raw JSON the bag POST and the client cookie share. Next encodes Set-Cookie. */
export function cartCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(listingIds);
}

export const CART_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CART_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CART_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CART_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CART_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

export function readCartListingIds(): string[] {
  if (!canUseStorage()) {
    return emptyIds;
  }
  const fromStorage = parseCartListingIds(
    window.localStorage.getItem(CART_STORAGE_KEY),
  );
  const fromCookie = parseCartListingIds(readCookieRaw());
  const merged = mergeListingIds(fromStorage, fromCookie);
  cachedRaw = cartCookieValue(merged);
  cachedIds = merged;
  return merged;
}

export function writeCartListingIds(listingIds: string[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = cartCookieValue(listingIds);
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

/**
 * Mirror the server bag (cookie parsed by `cookies()`) into the client store.
 * POST /listings/bag writes the cookie; /cart must not stay empty when that
 * cookie already lists the SKU.
 */
export function seedCartListingIds(listingIds: readonly string[] = emptyIds) {
  if (!canUseStorage()) {
    return;
  }
  const current = readCartListingIds();
  const merged = mergeListingIds(current, listingIds);
  const stored = parseCartListingIds(window.localStorage.getItem(CART_STORAGE_KEY));
  const cookied = parseCartListingIds(readCookieRaw());
  if (sameListingIds(merged, stored) && sameListingIds(merged, cookied)) {
    return;
  }
  writeCartListingIds(merged);
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
