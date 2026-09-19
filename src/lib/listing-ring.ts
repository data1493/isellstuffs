/**
 * The water ring stays — furniture honesty. Still tote.
 *
 * Heat is the mug. Wrap is newspaper on the booth.
 * This is the furniture ring that stays. The table already has a ring.
 * Not as-is. Not heat.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:ring-listing-ids` is the client water-ring set.
 * Cookie `iss-ring-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write heat, wrap, as-is, pile, grade, stack, match, cases,
 * wash, cord, cells, look, ask, hands, scan, heavy, firm, packed,
 * sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not take a ring.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const RING_STORAGE_KEY = "iss:ring-listing-ids";
export const RING_COOKIE_NAME = "iss-ring-listing-ids";
export const RING_CHANGED_EVENT = "iss:ring-changed";

export const RING_REFUSE_COPY = "That one is not a water ring.";
export const RING_TABLE_LINE = "The water ring stays.";
export const RING_FURNITURE_LINE = "The table already has a ring.";
export const RING_HEAT_LINE = "Heat is the mug. Wrap is newspaper.";
export const RING_STILL_LINE = "Still tote. Not as-is. Not heat.";
export const RING_TOTE_LINE = "Add to tote still works.";
export const RING_EMPTY_LINE = "Nobody taped the water ring yet.";

const SERVER_STORE = Symbol.for("iss.ring-listing-ids");

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

export function parseRingListingIds(raw: string | null | undefined): string[] {
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

export function ringCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RING_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RING_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RING_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RING_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RING_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRingListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRingListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RING_STORAGE_KEY);
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
          window.localStorage.setItem(RING_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRingListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = ringCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RING_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RING_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RING_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRingOverlay(
  listingId: string,
  listingIds = readRingListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeRing(listing: Listing | undefined): listing is Listing {
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

export type RingWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type RingWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RingWriteReason; listingIds: string[] };

function refuseRing(
  listing: Listing | undefined,
  listingIds: string[],
): RingWriteResult | null {
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

export function markListingRing(
  listing: Listing | undefined,
  listingIds: string[],
): RingWriteResult {
  const refused = refuseRing(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingRing(
  listing: Listing | undefined,
  listingIds: string[],
): RingWriteResult {
  const refused = refuseRing(listing, listingIds);
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

export function subscribeRing(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RING_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RING_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RING_CHANGED_EVENT, listener);
  };
}
