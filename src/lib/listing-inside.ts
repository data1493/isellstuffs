/**
 * I will not say what was inside — empty jewels stay untitled. Still tote.
 *
 * Walkers still want Sunday Crate to say what movie was in the jewels,
 * or “fill in the titles.” I will not say what was inside. Empty.
 * That is how they arrived. Still for sale. Not a memory desk.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:inside-listing-ids` is the client inside set.
 * Cookie `iss-inside-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a liner PDF does not
 * take an inside note. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const INSIDE_STORAGE_KEY = "iss:inside-listing-ids";
export const INSIDE_COOKIE_NAME = "iss-inside-listing-ids";
export const INSIDE_CHANGED_EVENT = "iss:inside-changed";

export const INSIDE_REFUSE_COPY = "That one does not take an inside note.";
export const INSIDE_TABLE_LINE = "I will not say what was inside.";
export const INSIDE_ARRIVED_LINE = "Empty. That is how they arrived.";
export const INSIDE_NOTICE_TITLE =
  "I will not say what was inside. Empty. That is how they arrived.";
export const INSIDE_WALK_LINE = "Walkers still want the missing movies named.";
export const INSIDE_STAYS_LINE = "This is the inside note. Empty jewels stay untitled.";
export const INSIDE_STILL_LINE = "Still tote. Not a memory desk. Still for sale.";
export const INSIDE_TOTE_LINE = "Add to tote still works.";
export const INSIDE_EMPTY_LINE = "Nobody taped the inside note yet.";

const SERVER_STORE = Symbol.for("iss.inside-listing-ids");

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

export function parseInsideListingIds(raw: string | null | undefined): string[] {
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

export function insideCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const INSIDE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${INSIDE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(INSIDE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(INSIDE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${INSIDE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseInsideListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readInsideListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(INSIDE_STORAGE_KEY);
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
          window.localStorage.setItem(INSIDE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeInsideListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = insideCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(INSIDE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${INSIDE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(INSIDE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingInsideOverlay(
  listingId: string,
  listingIds = readInsideListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeInside(listing: Listing | undefined): listing is Listing {
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

export type InsideWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type InsideWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: InsideWriteReason; listingIds: string[] };

function refuseInside(
  listing: Listing | undefined,
  listingIds: string[],
): InsideWriteResult | null {
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

export function markListingInside(
  listing: Listing | undefined,
  listingIds: string[],
): InsideWriteResult {
  const refused = refuseInside(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingInside(
  listing: Listing | undefined,
  listingIds: string[],
): InsideWriteResult {
  const refused = refuseInside(listing, listingIds);
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

export function subscribeInside(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === INSIDE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(INSIDE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(INSIDE_CHANGED_EVENT, listener);
  };
}
