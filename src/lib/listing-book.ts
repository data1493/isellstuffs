/**
 * The booklet walked — liner notes are not in the jewel. Still tote.
 *
 * Cases is the empty jewel. Scan is paper to a file.
 * This is the booklet that walked. Not cases. Not scan.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:book-listing-ids` is the client booklet set.
 * Cookie `iss-book-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cases, scan, plays, press, skip, ring, strap, match,
 * wrap, heat, look, ask, hands, heavy, firm, packed, sold, file-gone,
 * gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF is not a jewel booklet.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const BOOK_STORAGE_KEY = "iss:book-listing-ids";
export const BOOK_COOKIE_NAME = "iss-book-listing-ids";
export const BOOK_CHANGED_EVENT = "iss:book-changed";

export const BOOK_REFUSE_COPY = "That one does not take a booklet.";
export const BOOK_TABLE_LINE = "The booklet walked.";
export const BOOK_LINER_LINE = "Liner notes are not in the jewel.";
export const BOOK_CASES_LINE = "Cases is the empty jewel. Scan is paper to a file.";
export const BOOK_STILL_LINE = "Still tote. Not cases. Not scan.";
export const BOOK_TOTE_LINE = "Add to tote still works.";
export const BOOK_EMPTY_LINE = "Nobody taped the booklet yet.";

const SERVER_STORE = Symbol.for("iss.book-listing-ids");

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

export function parseBookListingIds(raw: string | null | undefined): string[] {
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

export function bookCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BOOK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BOOK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BOOK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BOOK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BOOK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBookListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBookListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BOOK_STORAGE_KEY);
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
          window.localStorage.setItem(BOOK_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBookListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bookCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BOOK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BOOK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BOOK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBookOverlay(
  listingId: string,
  listingIds = readBookListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeBook(listing: Listing | undefined): listing is Listing {
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

export type BookWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type BookWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: BookWriteReason; listingIds: string[] };

function refuseBook(
  listing: Listing | undefined,
  listingIds: string[],
): BookWriteResult | null {
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

export function markListingBook(
  listing: Listing | undefined,
  listingIds: string[],
): BookWriteResult {
  const refused = refuseBook(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingBook(
  listing: Listing | undefined,
  listingIds: string[],
): BookWriteResult {
  const refused = refuseBook(listing, listingIds);
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

export function subscribeBook(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BOOK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOK_CHANGED_EVENT, listener);
  };
}
