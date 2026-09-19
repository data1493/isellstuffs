/**
 * I will not stretch — cobbler-last refusal. Still tote.
 *
 * Sole is no new sole. Toe is the peel. Laces stayed home.
 * Sew is not a tailor. Walkers still want Closet to stretch
 * the split-soles, block them, or “make them a 10.”
 * I will not stretch. Both still walk. Still for sale.
 * Not sole. Not a cobbler last. Not size.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:stretch-listing-ids` is the client stretch set.
 * Cookie `iss-stretch-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write sole, toe, laces, size, sew, pose, wash, film, look,
 * ask, hands, scan, heavy, with, van, firm, packed, sold, file-gone,
 * gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not stretch.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const STRETCH_STORAGE_KEY = "iss:stretch-listing-ids";
export const STRETCH_COOKIE_NAME = "iss-stretch-listing-ids";
export const STRETCH_CHANGED_EVENT = "iss:stretch-changed";

export const STRETCH_REFUSE_COPY = "That one does not take a stretch.";
export const STRETCH_TABLE_LINE = "I will not stretch.";
export const STRETCH_WALK_LINE = "Both still walk.";
export const STRETCH_NOTICE_TITLE = "I will not stretch. Both still walk.";
export const STRETCH_SOLE_LINE = "Sole is no new sole. Toe is the peel.";
export const STRETCH_LACES_LINE = "Laces stayed home. Sew is not a tailor.";
export const STRETCH_STAYS_LINE = "This is the stretch refusal.";
export const STRETCH_STILL_LINE =
  "Still tote. Not sole. Not a cobbler last. Not size.";
export const STRETCH_TOTE_LINE = "Add to tote still works.";
export const STRETCH_EMPTY_LINE = "Nobody taped a stretch refusal yet.";

const SERVER_STORE = Symbol.for("iss.stretch-listing-ids");

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

export function parseStretchListingIds(raw: string | null | undefined): string[] {
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

export function stretchCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const STRETCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${STRETCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(STRETCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(STRETCH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${STRETCH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseStretchListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readStretchListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(STRETCH_STORAGE_KEY);
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
          window.localStorage.setItem(STRETCH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeStretchListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = stretchCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STRETCH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${STRETCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(STRETCH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingStretchOverlay(
  listingId: string,
  listingIds = readStretchListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeStretch(listing: Listing | undefined): listing is Listing {
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

export type StretchWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type StretchWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: StretchWriteReason; listingIds: string[] };

function refuseStretch(
  listing: Listing | undefined,
  listingIds: string[],
): StretchWriteResult | null {
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

export function markListingStretch(
  listing: Listing | undefined,
  listingIds: string[],
): StretchWriteResult {
  const refused = refuseStretch(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingStretch(
  listing: Listing | undefined,
  listingIds: string[],
): StretchWriteResult {
  const refused = refuseStretch(listing, listingIds);
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

export function subscribeStretch(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STRETCH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STRETCH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STRETCH_CHANGED_EVENT, listener);
  };
}
