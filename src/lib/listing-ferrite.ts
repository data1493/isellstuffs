/**
 * I will not ferrite them — the drawer stays untested. Still tote.
 *
 * Coil is the tangle. Pile is the heap. Dongle is no USB-C. Beep
 * is no continuity. Label is HDMI tape. Walkers still want
 * Half-Working to clip ferrites on the mystery cables, or “make
 * them quiet.” I will not ferrite them. Still a pile. Still
 * untested. Still for sale. Not coil. Not pile. Not a shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:ferrite-listing-ids` is the client ferrite set.
 * Cookie `iss-ferrite-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write coil, pile, dongle, beep, label, speaker, flash,
 * driver, wind, wrap, spool, hank, tangle, gift, buy, digital
 * eligibility, or tote keys.
 * Gift listings and digital files are refused — a LUT does not
 * take a ferrite. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FERRITE_STORAGE_KEY = "iss:ferrite-listing-ids";
export const FERRITE_COOKIE_NAME = "iss-ferrite-listing-ids";
export const FERRITE_CHANGED_EVENT = "iss:ferrite-changed";

export const FERRITE_REFUSE_COPY = "That one does not take a ferrite note.";
export const FERRITE_TABLE_LINE = "I will not ferrite them.";
export const FERRITE_PILE_LINE = "Still a pile.";
export const FERRITE_UNTESTED_LINE = "Still untested.";
export const FERRITE_NOTICE_TITLE =
  "I will not ferrite them. Still a pile. Still untested.";
export const FERRITE_WALK_LINE =
  "Walkers still want Half-Working to ferrite the drawer, or make them quiet.";
export const FERRITE_STAYS_LINE =
  "This is the ferrite note. I will not ferrite them. Still a pile. Still untested.";
export const FERRITE_STILL_LINE = "Still tote. Not coil. Not pile. Not a shop.";
export const FERRITE_TOTE_LINE = "Add to tote still works.";
export const FERRITE_EMPTY_LINE = "Nobody taped a ferrite note yet.";
export const FERRITE_LEAVE_LINE = "Leave the noise";

const SERVER_STORE = Symbol.for("iss.ferrite-listing-ids");

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

export function parseFerriteListingIds(
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

export function ferriteCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FERRITE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FERRITE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FERRITE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FERRITE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FERRITE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFerriteListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFerriteListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FERRITE_STORAGE_KEY);
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
          window.localStorage.setItem(FERRITE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFerriteListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = ferriteCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FERRITE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FERRITE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FERRITE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFerriteOverlay(
  listingId: string,
  listingIds: readonly string[] = readFerriteListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeFerrite(listing: Listing | undefined): listing is Listing {
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

export type FerriteWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

function refuseFerrite(
  listing: Listing | undefined,
): FerriteWriteReason | null {
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
export function markListingFerrite(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFerrite(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFerrite(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFerrite(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFerrite(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FERRITE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FERRITE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FERRITE_CHANGED_EVENT, listener);
  };
}
