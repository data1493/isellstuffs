/**
 * I don't have a saucer — diner mug stays a mug. Still tote.
 *
 * Walkers still want Sink Drawer to throw a diner saucer, or “make
 * it a set.” I don't have a saucer. Mug only. Still a mug. Still
 * for sale. Not a diner shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:saucer-listing-ids` is the client saucer set.
 * Cookie `iss-saucer-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a recipe PDF is not a mug.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SAUCER_STORAGE_KEY = "iss:saucer-listing-ids";
export const SAUCER_COOKIE_NAME = "iss-saucer-listing-ids";
export const SAUCER_CHANGED_EVENT = "iss:saucer-changed";

export const SAUCER_REFUSE_COPY = "That one does not take a saucer note.";
export const SAUCER_TABLE_LINE = "I don't have a saucer.";
export const SAUCER_MUG_LINE = "Mug only.";
export const SAUCER_STILL_LINE = "Still a mug.";
export const SAUCER_NOTICE_TITLE =
  "I don't have a saucer. Mug only. Still a mug.";
export const SAUCER_WALK_LINE =
  "Walkers still want Sink Drawer to throw a diner saucer, or make it a set.";
export const SAUCER_STAYS_LINE =
  "This is the saucer note. Mug only. Still a mug.";
export const SAUCER_FOR_SALE_LINE = "Still tote. Not a diner shop. Still for sale.";
export const SAUCER_TOTE_LINE = "Add to tote still works.";
export const SAUCER_EMPTY_LINE = "Nobody taped a saucer note yet.";

const SERVER_STORE = Symbol.for("iss.saucer-listing-ids");

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

export function parseSaucerListingIds(raw: string | null | undefined): string[] {
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

export function saucerCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SAUCER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SAUCER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SAUCER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SAUCER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SAUCER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSaucerListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSaucerListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SAUCER_STORAGE_KEY);
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
          window.localStorage.setItem(SAUCER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSaucerListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = saucerCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SAUCER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SAUCER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SAUCER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSaucerOverlay(
  listingId: string,
  listingIds = readSaucerListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSaucer(listing: Listing | undefined): listing is Listing {
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

export type SaucerWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SaucerWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SaucerWriteReason; listingIds: string[] };

function refuseSaucer(
  listing: Listing | undefined,
  listingIds: string[],
): SaucerWriteResult | null {
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

export function markListingSaucer(
  listing: Listing | undefined,
  listingIds: string[],
): SaucerWriteResult {
  const refused = refuseSaucer(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingSaucer(
  listing: Listing | undefined,
  listingIds: string[],
): SaucerWriteResult {
  const refused = refuseSaucer(listing, listingIds);
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

export function subscribeSaucer(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SAUCER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SAUCER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SAUCER_CHANGED_EVENT, listener);
  };
}
