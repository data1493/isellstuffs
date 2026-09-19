/**
 * Needs two people — weight paper. Still for sale.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:heavy-listing-ids` is the client heavy set.
 * Cookie `iss-heavy-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write here, hands, pickup, ask, stay, scan, look, firm, with,
 * van, packed, sold, file-gone, gift, shipping, names, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a lift.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const HEAVY_STORAGE_KEY = "iss:heavy-listing-ids";
export const HEAVY_COOKIE_NAME = "iss-heavy-listing-ids";
export const HEAVY_CHANGED_EVENT = "iss:heavy-changed";

export const HEAVY_REFUSE_COPY = "That one is not a two-person lift.";
export const HEAVY_TABLE_LINE = "Needs two people.";
export const HEAVY_STILL_LINE = "Still for sale. Weight paper. Not a hold.";
export const HEAVY_TOTE_LINE = "Add to tote still works.";
export const HEAVY_LIFT_LINE = "The lamp needs a friend.";
export const HEAVY_EMPTY_LINE = "Nobody taped a lift yet.";
export const HEAVY_PICKUP_LINE = "Pickup is hours. This is lifting.";

const SERVER_STORE = Symbol.for("iss.heavy-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

let cachedRaw: string | null | undefined;
let cachedIds: string[] = emptyIds;

function canUseStorage() {
  return typeof window !== "undefined";
}

function uniqueListingIds(ids: readonly string[]): string[] {
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

export function parseHeavyListingIds(raw: string | null | undefined): string[] {
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
    return uniqueListingIds(
      parsed.filter((id): id is string => typeof id === "string"),
    );
  } catch {
    return emptyIds;
  }
}

export function heavyCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HEAVY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HEAVY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HEAVY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HEAVY_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HEAVY_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHeavyListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHeavyListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HEAVY_STORAGE_KEY);
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
          window.localStorage.setItem(HEAVY_STORAGE_KEY, JSON.stringify(ids));
        } catch {
          // blocked storage
        }
        return ids;
      }
    }
    return snapshotFromRaw(fromStorage ?? null);
  }

  return serverStore();
}

export function writeHeavyListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = heavyCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HEAVY_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HEAVY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HEAVY_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHeavyOverlay(
  listingId: string,
  listingIds = readHeavyListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeHeavy(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isPhysicalListing(listing)) {
    return false;
  }
  if (isGiftListing(listing)) {
    return false;
  }
  if (listing.status === "sold" || listing.status === "file-gone") {
    return false;
  }
  return true;
}

export type HeavyWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type HeavyWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: HeavyWriteReason; listingIds: string[] };

function refuseHeavy(
  listing: Listing | undefined,
  listingIds: string[],
): HeavyWriteResult | null {
  if (!listing) {
    return { ok: false, reason: "missing", listingIds };
  }
  if (listing.status === "file-gone") {
    return { ok: false, reason: "file-gone", listingIds };
  }
  if (listing.status === "sold") {
    return { ok: false, reason: "sold", listingIds };
  }
  if (isGiftListing(listing)) {
    return { ok: false, reason: "gift", listingIds };
  }
  if (!isPhysicalListing(listing)) {
    return { ok: false, reason: "digital", listingIds };
  }
  return null;
}

export function markListingHeavy(
  listing: Listing | undefined,
  listingIds: string[],
): HeavyWriteResult {
  const refused = refuseHeavy(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingHeavy(
  listing: Listing | undefined,
  listingIds: string[],
): HeavyWriteResult {
  const refused = refuseHeavy(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (!listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== listing!.id),
  };
}

export function subscribeHeavy(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HEAVY_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HEAVY_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HEAVY_CHANGED_EVENT, listener);
  };
}
