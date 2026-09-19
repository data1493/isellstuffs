/**
 * Rewired — lamp cord is not factory. Still tote.
 *
 * The wobbly lamp already has a new cord.
 * Shell is the Game Boy blister. This is the lamp.
 * Not the factory cord. Still lights.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cord-listing-ids` is the client rewire set.
 * Cookie `iss-cord-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write heat, cases, bent, shell, parts, cells, tested, heavy,
 * wrap, poly, fits, plays, laces, size, smoke, pockets, film, look,
 * ask, hands, scan, with, van, firm, packed, sold, file-gone, gift,
 * buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not have a cord.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const CORD_STORAGE_KEY = "iss:cord-listing-ids";
export const CORD_COOKIE_NAME = "iss-cord-listing-ids";
export const CORD_CHANGED_EVENT = "iss:cord-changed";

export const CORD_REFUSE_COPY = "That one is not a rewired cord.";
export const CORD_TABLE_LINE = "Rewired. Not the factory cord. Still lights.";
export const CORD_LAMP_LINE = "The wobbly lamp already has a new cord.";
export const CORD_FACTORY_LINE = "Not the factory cord.";
export const CORD_SHELL_LINE = "Shell is the Game Boy blister. This is the lamp.";
export const CORD_STILL_LINE = "Still tote. Still lights.";
export const CORD_TOTE_LINE = "Add to tote still works.";
export const CORD_EMPTY_LINE = "Nobody taped the rewire yet.";

const SERVER_STORE = Symbol.for("iss.cord-listing-ids");

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

export function parseCordListingIds(raw: string | null | undefined): string[] {
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

export function cordCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CORD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CORD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CORD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CORD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CORD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCordListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCordListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CORD_STORAGE_KEY);
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
          window.localStorage.setItem(CORD_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCordListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = cordCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CORD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CORD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CORD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCordOverlay(
  listingId: string,
  listingIds = readCordListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeCord(listing: Listing | undefined): listing is Listing {
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

export type CordWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type CordWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: CordWriteReason; listingIds: string[] };

function refuseCord(
  listing: Listing | undefined,
  listingIds: string[],
): CordWriteResult | null {
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

export function markListingCord(
  listing: Listing | undefined,
  listingIds: string[],
): CordWriteResult {
  const refused = refuseCord(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingCord(
  listing: Listing | undefined,
  listingIds: string[],
): CordWriteResult {
  const refused = refuseCord(listing, listingIds);
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

export function subscribeCord(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CORD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CORD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CORD_CHANGED_EVENT, listener);
  };
}
