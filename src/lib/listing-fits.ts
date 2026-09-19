/**
 * Fits a 3-quart — lid honesty. Still tote.
 *
 * With needs two titles. This is one pot that fits a 3-quart.
 * The pot walked. The lid is still on the table.
 * Not a with pair.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:fits-listing-ids` is the client 3-quart set.
 * Cookie `iss-fits-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write with, scan, press, van, size, poly, wrap, smoke, cells,
 * pockets, parts, look, ask, hands, heavy, firm, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not fit a pot.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const FITS_STORAGE_KEY = "iss:fits-listing-ids";
export const FITS_COOKIE_NAME = "iss-fits-listing-ids";
export const FITS_CHANGED_EVENT = "iss:fits-changed";

export const FITS_REFUSE_COPY = "That one is not a 3-quart fit.";
export const FITS_TABLE_LINE = "Fits a 3-quart.";
export const FITS_WALKED_LINE = "The pot walked. The lid is still on the table.";
export const FITS_WITH_LINE =
  "With needs two titles. This is one pot that fits a 3-quart.";
export const FITS_STILL_LINE = "Still tote. Not a with pair.";
export const FITS_TOTE_LINE = "Add to tote still works.";
export const FITS_EMPTY_LINE = "Nobody taped the 3-quart yet.";

const SERVER_STORE = Symbol.for("iss.fits-listing-ids");

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

export function parseFitsListingIds(raw: string | null | undefined): string[] {
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

export function fitsCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FITS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FITS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FITS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FITS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FITS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFitsListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFitsListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FITS_STORAGE_KEY);
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
          window.localStorage.setItem(FITS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFitsListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = fitsCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FITS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FITS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FITS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFitsOverlay(
  listingId: string,
  listingIds = readFitsListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeFits(listing: Listing | undefined): listing is Listing {
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

export type FitsWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type FitsWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: FitsWriteReason; listingIds: string[] };

function refuseFits(
  listing: Listing | undefined,
  listingIds: string[],
): FitsWriteResult | null {
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

export function markListingFits(
  listing: Listing | undefined,
  listingIds: string[],
): FitsWriteResult {
  const refused = refuseFits(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingFits(
  listing: Listing | undefined,
  listingIds: string[],
): FitsWriteResult {
  const refused = refuseFits(listing, listingIds);
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

export function subscribeFits(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FITS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FITS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FITS_CHANGED_EVENT, listener);
  };
}
