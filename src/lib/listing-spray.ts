/**
 * I will not spray it — the windbreaker stays a jacket. Still tote.
 *
 * Walkers still want Closet to Scotchgard the windbreaker, or “make it
 * rain-proof.” I will not spray it. Worn twice. Still a jacket.
 * Still for sale. Not a cleaners.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:spray-listing-ids` is the client spray set.
 * Cookie `iss-spray-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a stain zine is not a jacket.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SPRAY_STORAGE_KEY = "iss:spray-listing-ids";
export const SPRAY_COOKIE_NAME = "iss-spray-listing-ids";
export const SPRAY_CHANGED_EVENT = "iss:spray-changed";

export const SPRAY_REFUSE_COPY = "That one does not take a spray note.";
export const SPRAY_TABLE_LINE = "I will not spray it.";
export const SPRAY_WORN_LINE = "Worn twice.";
export const SPRAY_JACKET_LINE = "Still a jacket.";
export const SPRAY_NOTICE_TITLE =
  "I will not spray it. Worn twice. Still a jacket.";
export const SPRAY_WALK_LINE =
  "Walkers still want Closet to Scotchgard the windbreaker.";
export const SPRAY_STAYS_LINE =
  "This is the spray note. Worn twice. Still a jacket.";
export const SPRAY_STILL_LINE = "Still tote. Not a cleaners. Still for sale.";
export const SPRAY_TOTE_LINE = "Add to tote still works.";
export const SPRAY_EMPTY_LINE = "Nobody taped a spray note yet.";

const SERVER_STORE = Symbol.for("iss.spray-listing-ids");

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

export function parseSprayListingIds(raw: string | null | undefined): string[] {
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

export function sprayCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SPRAY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SPRAY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SPRAY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SPRAY_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SPRAY_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSprayListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSprayListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SPRAY_STORAGE_KEY);
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
          window.localStorage.setItem(SPRAY_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSprayListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = sprayCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SPRAY_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SPRAY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SPRAY_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSprayOverlay(
  listingId: string,
  listingIds = readSprayListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSpray(listing: Listing | undefined): listing is Listing {
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

export type SprayWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SprayWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SprayWriteReason; listingIds: string[] };

function refuseSpray(
  listing: Listing | undefined,
  listingIds: string[],
): SprayWriteResult | null {
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

export function markListingSpray(
  listing: Listing | undefined,
  listingIds: string[],
): SprayWriteResult {
  const refused = refuseSpray(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingSpray(
  listing: Listing | undefined,
  listingIds: string[],
): SprayWriteResult {
  const refused = refuseSpray(listing, listingIds);
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

export function subscribeSpray(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SPRAY_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SPRAY_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SPRAY_CHANGED_EVENT, listener);
  };
}
