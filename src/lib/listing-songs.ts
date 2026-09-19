/**
 * I will not title the songs — mixtape honesty. Still tote. No tracklist.
 *
 * Hiss is the tape hiss. Scan is paper to a file.
 * This is the mixtape with no titles. Not hiss. Not scan.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:songs-listing-ids` is the client songs set.
 * Cookie `iss-songs-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, scan, clip, sleeve, line, wrong, plays, skip, book,
 * press, remote, parts, cells, ring, strap, van, lost, pile, grade,
 * wash, stick, cord, bent, shell, heat, cases, fits, film, look, ask,
 * hands, heavy, with, firm, packed, sold, file-gone, gift, buy,
 * digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF already has a title.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SONGS_STORAGE_KEY = "iss:songs-listing-ids";
export const SONGS_COOKIE_NAME = "iss-songs-listing-ids";
export const SONGS_CHANGED_EVENT = "iss:songs-changed";

export const SONGS_REFUSE_COPY = "Those songs already have titles.";
export const SONGS_TABLE_LINE = "I will not title the songs.";
export const SONGS_HISS_LINE = "Hiss is the tape hiss.";
export const SONGS_SCAN_LINE = "Scan is paper to a file.";
export const SONGS_TAPE_LINE = "This is the mixtape with no titles.";
export const SONGS_STILL_LINE = "Still tote. Not hiss. Not scan.";
export const SONGS_TOTE_LINE = "Add to tote still works.";
export const SONGS_EMPTY_LINE = "Nobody taped the untitled songs yet.";

const SERVER_STORE = Symbol.for("iss.songs-listing-ids");

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

export function parseSongsListingIds(raw: string | null | undefined): string[] {
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

export function songsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SONGS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SONGS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SONGS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SONGS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SONGS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSongsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSongsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SONGS_STORAGE_KEY);
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
          window.localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSongsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = songsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SONGS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SONGS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SONGS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSongsOverlay(
  listingId: string,
  listingIds = readSongsListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSongs(listing: Listing | undefined): listing is Listing {
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

export type SongsWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SongsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SongsWriteReason; listingIds: string[] };

function refuseSongs(
  listing: Listing | undefined,
  listingIds: string[],
): SongsWriteResult | null {
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

export function markListingSongs(
  listing: Listing | undefined,
  listingIds: string[],
): SongsWriteResult {
  const refused = refuseSongs(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingSongs(
  listing: Listing | undefined,
  listingIds: string[],
): SongsWriteResult {
  const refused = refuseSongs(listing, listingIds);
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

export function subscribeSongs(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SONGS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SONGS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SONGS_CHANGED_EVENT, listener);
  };
}
