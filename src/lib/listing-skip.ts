/**
 * The skip stays — Side A still skips. Still tote.
 *
 * Press is which pressing. Plays is I spun the Sharpie disc.
 * Walkers still want a clean Side A on the scratched LP.
 * That's the record. Still for sale. Not a press. Not a play count.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:skip-listing-ids` is the client skip set.
 * Cookie `iss-skip-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write press, plays, scan, as-is, remote, wash, cases, cord,
 * bent, heat, laces, size, smoke, cells, pockets, parts, film, look,
 * ask, hands, heavy, with, van, firm, packed, sold, file-gone, gift,
 * buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not skip.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const SKIP_STORAGE_KEY = "iss:skip-listing-ids";
export const SKIP_COOKIE_NAME = "iss-skip-listing-ids";
export const SKIP_CHANGED_EVENT = "iss:skip-changed";

export const SKIP_REFUSE_COPY = "That one is not a skip.";
export const SKIP_TABLE_LINE = "The skip stays. That's the record.";
export const SKIP_PRESS_LINE = "Press is which pressing.";
export const SKIP_PLAYS_LINE = "Plays is I spun the Sharpie disc.";
export const SKIP_SIDE_LINE = "Walkers still want a clean Side A.";
export const SKIP_STILL_LINE = "Still tote. Not a press. Not a play count.";
export const SKIP_TOTE_LINE = "Add to tote still works.";
export const SKIP_EMPTY_LINE = "Nobody taped the skip yet.";

const SERVER_STORE = Symbol.for("iss.skip-listing-ids");

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

export function parseSkipListingIds(raw: string | null | undefined): string[] {
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

export function skipCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SKIP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SKIP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SKIP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SKIP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SKIP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSkipListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSkipListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SKIP_STORAGE_KEY);
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
          window.localStorage.setItem(SKIP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSkipListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = skipCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SKIP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SKIP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SKIP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSkipOverlay(
  listingId: string,
  listingIds = readSkipListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSkip(listing: Listing | undefined): listing is Listing {
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

export type SkipWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SkipWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SkipWriteReason; listingIds: string[] };

function refuseSkip(
  listing: Listing | undefined,
  listingIds: string[],
): SkipWriteResult | null {
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

export function markListingSkip(
  listing: Listing | undefined,
  listingIds: string[],
): SkipWriteResult {
  const refused = refuseSkip(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingSkip(
  listing: Listing | undefined,
  listingIds: string[],
): SkipWriteResult {
  const refused = refuseSkip(listing, listingIds);
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

export function subscribeSkip(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SKIP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SKIP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SKIP_CHANGED_EVENT, listener);
  };
}
