/**
 * The line stays — Game Boy screen-line honesty. Still tote.
 *
 * Cells are out. Fix is I don't solder.
 * Walkers still want a cleaner Game Boy screen.
 * Not cells. Not fix.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:line-listing-ids` is the client line set.
 * Cookie `iss-line-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cells, fix, manual, remote, needle, hair, oil, clip,
 * sleeve, songs, parts, press, smoke, wash, film, look, ask, hands,
 * scan, with, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not keep a line.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const LINE_STORAGE_KEY = "iss:line-listing-ids";
export const LINE_COOKIE_NAME = "iss-line-listing-ids";
export const LINE_CHANGED_EVENT = "iss:line-changed";

export const LINE_REFUSE_COPY = "That one does not keep a screen line.";
export const LINE_TABLE_LINE = "The line stays.";
export const LINE_CELLS_LINE = "Cells are out. Fix is I don't solder.";
export const LINE_SCREEN_LINE = "Walkers still want a cleaner Game Boy screen.";
export const LINE_PRESS_LINE = "Press start.";
export const LINE_STILL_LINE = "Still tote. Not cells. Not fix.";
export const LINE_TOTE_LINE = "Add to tote still works.";
export const LINE_EMPTY_LINE = "Nobody taped the screen line yet.";

const SERVER_STORE = Symbol.for("iss.line-listing-ids");

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

export function parseLineListingIds(raw: string | null | undefined): string[] {
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

export function lineCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LINE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LINE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LINE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LINE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LINE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLineListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLineListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LINE_STORAGE_KEY);
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
          window.localStorage.setItem(LINE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLineListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = lineCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LINE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LINE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LINE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLineOverlay(
  listingId: string,
  listingIds = readLineListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeLine(listing: Listing | undefined): listing is Listing {
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

export type LineWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type LineWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: LineWriteReason; listingIds: string[] };

function refuseLine(
  listing: Listing | undefined,
  listingIds: string[],
): LineWriteResult | null {
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

export function markListingLine(
  listing: Listing | undefined,
  listingIds: string[],
): LineWriteResult {
  const refused = refuseLine(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingLine(
  listing: Listing | undefined,
  listingIds: string[],
): LineWriteResult {
  const refused = refuseLine(listing, listingIds);
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

export function subscribeLine(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LINE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LINE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LINE_CHANGED_EVENT, listener);
  };
}
