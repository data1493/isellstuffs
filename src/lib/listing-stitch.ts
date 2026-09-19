/**
 * I will not stitch them — the pair stays peeling. Still tote.
 *
 * Toe is the peel stays. Sole is no new sole. Cement is no cobbler
 * glue. Pad is no insole. Sew is Closet booth thread, not these
 * sneakers. Walkers still want Closet to stitch the left toe, or
 * “make them one pair.” I will not stitch them. Still a pair. Still
 * peeling. Still for sale. Not sew. Not toe. Not cement.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:stitch-listing-ids` is the client stitch set.
 * Cookie `iss-stitch-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write sew, toe, sole, cement, pad, even, stretch, laces,
 * glue, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a LUT does not
 * take a stitch. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const STITCH_STORAGE_KEY = "iss:stitch-listing-ids";
export const STITCH_COOKIE_NAME = "iss-stitch-listing-ids";
export const STITCH_CHANGED_EVENT = "iss:stitch-changed";

export const STITCH_REFUSE_COPY = "That one does not take a stitch note.";
export const STITCH_TABLE_LINE = "I will not stitch them.";
export const STITCH_PAIR_LINE = "Still a pair.";
export const STITCH_PEEL_LINE = "Still peeling.";
export const STITCH_NOTICE_TITLE =
  "I will not stitch them. Still a pair. Still peeling.";
export const STITCH_WALK_LINE =
  "Walkers still want Closet to stitch the left toe, or make them one pair.";
export const STITCH_STAYS_LINE =
  "This is the stitch note. I will not stitch them. Still a pair. Still peeling.";
export const STITCH_STILL_LINE = "Still tote. Not sew. Not toe. Not cement.";
export const STITCH_TOTE_LINE = "Add to tote still works.";
export const STITCH_EMPTY_LINE = "Nobody taped a stitch note yet.";
export const STITCH_LEAVE_LINE = "Leave the split";

const SERVER_STORE = Symbol.for("iss.stitch-listing-ids");

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

export function parseStitchListingIds(
  raw: string | null | undefined,
): string[] {
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
    // Reject write-result literals `{ ok, listingIds }` — they 500 the PDP.
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

export function stitchCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const STITCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${STITCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(STITCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(STITCH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${STITCH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseStitchListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readStitchListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(STITCH_STORAGE_KEY);
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
          window.localStorage.setItem(STITCH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeStitchListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = stitchCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STITCH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${STITCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(STITCH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingStitchOverlay(
  listingId: string,
  listingIds: readonly string[] = readStitchListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeStitch(listing: Listing | undefined): listing is Listing {
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

export type StitchWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseStitch(
  listing: Listing | undefined,
): StitchWriteReason | null {
  if (!listing) {
    return "missing";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingStitch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStitch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingStitch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStitch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeStitch(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STITCH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STITCH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STITCH_CHANGED_EVENT, listener);
  };
}
