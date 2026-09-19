/**
 * I will not recast — the lamp stays this clay. Still tote.
 *
 * Walkers still want Tuesday to recast the wobbly lamp, or “throw a
 * new one.” I will not recast. This clay. Still lights.
 * Still for sale. Not a pottery shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cast-listing-ids` is the client cast set.
 * Cookie `iss-cast-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a sample pack does not recast.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const CAST_STORAGE_KEY = "iss:cast-listing-ids";
export const CAST_COOKIE_NAME = "iss-cast-listing-ids";
export const CAST_CHANGED_EVENT = "iss:cast-changed";

export const CAST_REFUSE_COPY = "That one does not recast.";
export const CAST_TABLE_LINE = "I will not recast.";
export const CAST_CLAY_LINE = "This clay.";
export const CAST_LIGHTS_LINE = "Still lights.";
export const CAST_NOTICE_TITLE = "I will not recast. This clay. Still lights.";
export const CAST_WALK_LINE =
  "Walkers still want Tuesday to recast the wobbly lamp.";
export const CAST_STAYS_LINE =
  "This is the cast note. This clay. Still lights.";
export const CAST_STILL_LINE = "Still tote. Not a pottery shop. Still for sale.";
export const CAST_TOTE_LINE = "Add to tote still works.";
export const CAST_EMPTY_LINE = "Nobody taped the cast note yet.";

const SERVER_STORE = Symbol.for("iss.cast-listing-ids");

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

export function parseCastListingIds(raw: string | null | undefined): string[] {
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

export function castCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CAST_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CAST_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CAST_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CAST_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CAST_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCastListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCastListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CAST_STORAGE_KEY);
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
          window.localStorage.setItem(CAST_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCastListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = castCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CAST_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CAST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CAST_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCastOverlay(
  listingId: string,
  listingIds = readCastListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeCast(listing: Listing | undefined): listing is Listing {
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

export type CastWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type CastWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: CastWriteReason; listingIds: string[] };

function refuseCast(
  listing: Listing | undefined,
  listingIds: string[],
): CastWriteResult | null {
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

export function markListingCast(
  listing: Listing | undefined,
  listingIds: string[],
): CastWriteResult {
  const refused = refuseCast(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingCast(
  listing: Listing | undefined,
  listingIds: string[],
): CastWriteResult {
  const refused = refuseCast(listing, listingIds);
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

export function subscribeCast(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CAST_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CAST_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CAST_CHANGED_EVENT, listener);
  };
}
