/**
 * I will not cement — peel stays. Still walks. Still tote.
 *
 * Even is I will not even the wear. Toe is the peel stays. Sole is
 * no new sole. Stretch is no last. Glue is Game Boy epoxy, not a
 * cobbler. Walkers still want Closet to cement the left toe, or
 * “make it one piece.” I will not cement. Peel stays. Still walks.
 * Not toe. Not a cobbler. Not glue.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cement-listing-ids` is the client cement set.
 * Cookie `iss-cement-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a junk PDF does not cement.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const CEMENT_STORAGE_KEY = "iss:cement-listing-ids";
export const CEMENT_COOKIE_NAME = "iss-cement-listing-ids";
export const CEMENT_CHANGED_EVENT = "iss:cement-changed";

export const CEMENT_REFUSE_COPY = "That one does not take a cement note.";
export const CEMENT_TABLE_LINE = "I will not cement.";
export const CEMENT_PEEL_LINE = "Peel stays.";
export const CEMENT_WALK_LINE = "Still walks.";
export const CEMENT_NOTICE_TITLE =
  "I will not cement. Peel stays. Still walks.";
export const CEMENT_WALKERS_LINE =
  "Walkers still want Closet to cement the left toe, or make it one piece.";
export const CEMENT_STAYS_LINE =
  "This is the cement note. Peel stays. Still walks.";
export const CEMENT_STILL_LINE =
  "Still tote. Not toe. Not a cobbler. Not glue.";
export const CEMENT_TOTE_LINE = "Add to tote still works.";
export const CEMENT_EMPTY_LINE = "Nobody taped the cement note yet.";

const SERVER_STORE = Symbol.for("iss.cement-listing-ids");

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

export function parseCementListingIds(
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

export function cementCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CEMENT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CEMENT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CEMENT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CEMENT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CEMENT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCementListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCementListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CEMENT_STORAGE_KEY);
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
          window.localStorage.setItem(CEMENT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCementListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = cementCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CEMENT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CEMENT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CEMENT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCementOverlay(
  listingId: string,
  listingIds = readCementListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeCement(
  listing: Listing | undefined,
): listing is Listing {
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

export type CementWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type CementWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: CementWriteReason; listingIds: string[] };

function refuseCement(
  listing: Listing | undefined,
  listingIds: string[],
): CementWriteResult | null {
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

export function markListingCement(
  listing: Listing | undefined,
  listingIds: string[],
): CementWriteResult {
  const refused = refuseCement(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingCement(
  listing: Listing | undefined,
  listingIds: string[],
): CementWriteResult {
  const refused = refuseCement(listing, listingIds);
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

export function subscribeCement(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CEMENT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CEMENT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CEMENT_CHANGED_EVENT, listener);
  };
}
