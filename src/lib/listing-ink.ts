/**
 * The Sharpie stays — BEATS 07 CD-R handwriting. Still tote.
 *
 * Plays is I already spun it. Songs is I will not title the mixtape.
 * This is the Sharpie on the disc face. Not plays. Not songs.
 * Walkers still ask Beats to wipe BEATS 07 off the jewel CD-R.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:ink-listing-ids` is the client ink set.
 * Cookie `iss-ink-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write plays, songs, press, dust, convert, print, crack, sleeve, skip,
 * hiss, scan, book, cases, grade, foundry, film, look, ask, hands, van,
 * firm, packed, sold, file-gone, gift, buy, digital eligibility, or
 * tote keys.
 * Gift listings and digital files are refused — a PDF does not keep
 * Sharpie. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const INK_STORAGE_KEY = "iss:ink-listing-ids";
export const INK_COOKIE_NAME = "iss-ink-listing-ids";
export const INK_CHANGED_EVENT = "iss:ink-changed";

export const INK_REFUSE_COPY = "That one does not keep the Sharpie.";
export const INK_TABLE_LINE = "The Sharpie stays.";
export const INK_PLAYS_LINE = "Plays is I already spun it.";
export const INK_SONGS_LINE = "Songs is I will not title the mixtape.";
export const INK_HAND_LINE = "This is the BEATS 07 CD-R handwriting.";
export const INK_STILL_LINE = "Still tote. Not plays. Not songs.";
export const INK_TOTE_LINE = "Add to tote still works.";
export const INK_EMPTY_LINE = "Nobody taped the Sharpie yet.";

const SERVER_STORE = Symbol.for("iss.ink-listing-ids");

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

export function parseInkListingIds(raw: string | null | undefined): string[] {
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

export function inkCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const INK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${INK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(INK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(INK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${INK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseInkListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readInkListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(INK_STORAGE_KEY);
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
          window.localStorage.setItem(INK_STORAGE_KEY, JSON.stringify(ids));
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

export function writeInkListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = inkCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(INK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${INK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(INK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingInkOverlay(
  listingId: string,
  listingIds = readInkListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeInk(listing: Listing | undefined): listing is Listing {
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

export type InkWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type InkWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: InkWriteReason; listingIds: string[] };

function refuseInk(
  listing: Listing | undefined,
  listingIds: string[],
): InkWriteResult | null {
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

export function markListingInk(
  listing: Listing | undefined,
  listingIds: string[],
): InkWriteResult {
  const refused = refuseInk(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingInk(
  listing: Listing | undefined,
  listingIds: string[],
): InkWriteResult {
  const refused = refuseInk(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true,
    listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeInk(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === INK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(INK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(INK_CHANGED_EVENT, listener);
  };
}
