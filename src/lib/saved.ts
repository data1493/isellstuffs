/**
 * Later pile — parked listing ids, not the tote.
 * Never write `iss:cart-listing-ids` or `iss-cart-listing-ids`.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:saved-listing-ids` is the client pile.
 * Cookie `iss-saved-listing-ids` is the same JSON for no-JS save.
 */
import { isCartEligible, listingById } from "@/lib/commerce";

export const SAVED_STORAGE_KEY = "iss:saved-listing-ids";
export const SAVED_COOKIE_NAME = "iss-saved-listing-ids";

export const SAVED_CHANGED_EVENT = "iss:saved-changed";

export type SavedWriteResult =
  | { ok: true; already: boolean; listingIds: string[] }
  | { ok: false; reason: "missing" | "not-eligible"; listingIds: string[] };

const emptyIds: string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: string[] = emptyIds;

function canUseStorage() {
  return typeof window !== "undefined";
}

export function parseSavedListingIds(raw: string | null | undefined): string[] {
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
  const prefix = `${SAVED_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSavedListingIds(raw);
  return cachedIds;
}

export function readSavedListingIds(): string[] {
  if (!canUseStorage()) {
    return emptyIds;
  }
  const fromStorage = window.localStorage.getItem(SAVED_STORAGE_KEY);
  if (fromStorage) {
    const stored = snapshotFromRaw(fromStorage);
    if (stored.length > 0) {
      return stored;
    }
  }
  const fromCookie = readCookieRaw();
  if (fromCookie) {
    const ids = snapshotFromRaw(fromCookie);
    if (ids.length > 0) {
      try {
        window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(ids));
      } catch {
        // blocked storage
      }
      return ids;
    }
  }
  return snapshotFromRaw(fromStorage ?? null);
}

export function writeSavedListingIds(listingIds: string[]) {
  if (!canUseStorage()) {
    return;
  }
  const raw = JSON.stringify(listingIds);
  try {
    window.localStorage.setItem(SAVED_STORAGE_KEY, raw);
  } catch {
    // blocked storage
  }
  try {
    document.cookie = `${SAVED_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
  } catch {
    // blocked cookies
  }
  cachedRaw = raw;
  cachedIds = listingIds.length === 0 ? emptyIds : listingIds;
  window.dispatchEvent(new Event(SAVED_CHANGED_EVENT));
}

export function isListingSaved(
  listingId: string,
  listingIds = readSavedListingIds(),
) {
  return listingIds.includes(listingId);
}

export function addListingIdToSaved(
  listingId: string,
  listingIds: string[],
): SavedWriteResult {
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

export function removeListingIdFromSaved(
  listingId: string,
  listingIds: string[],
) {
  if (!listingIds.includes(listingId)) {
    return { ok: true as const, listingIds };
  }

  return {
    ok: true as const,
    listingIds: listingIds.filter((id) => id !== listingId),
  };
}

export function addListingToSaved(listingId: string): SavedWriteResult {
  const result = addListingIdToSaved(listingId, readSavedListingIds());
  if (result.ok && !result.already) {
    writeSavedListingIds(result.listingIds);
  }
  return result;
}

export function dropListingFromSaved(listingId: string) {
  const result = removeListingIdFromSaved(listingId, readSavedListingIds());
  writeSavedListingIds(result.listingIds);
  return result;
}

export function subscribeSaved(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SAVED_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SAVED_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SAVED_CHANGED_EVENT, listener);
  };
}
