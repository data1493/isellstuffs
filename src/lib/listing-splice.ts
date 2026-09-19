/**
 * I will not splice — radio ads stay. Still tote.
 *
 * Bake is I will not bake. Hiss is the hiss. Rip is no WAV.
 * Songs is no titles. Radio / fade / rewind were killed.
 * Walkers still want Sunday Crate to splice SUMMER 93, or
 * “cut the talkover.” I will not splice. Radio ads stay.
 * Still for sale. Not bake. Not a tape shop. Not rip.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:splice-listing-ids` is the client splice set.
 * Cookie `iss-splice-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and digital files are refused — a liner PDF does not splice.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SPLICE_STORAGE_KEY = "iss:splice-listing-ids";
export const SPLICE_COOKIE_NAME = "iss-splice-listing-ids";
export const SPLICE_CHANGED_EVENT = "iss:splice-changed";

export const SPLICE_REFUSE_COPY = "That one does not take a splice note.";
export const SPLICE_TABLE_LINE = "I will not splice.";
export const SPLICE_ADS_LINE = "Radio ads stay.";
export const SPLICE_NOTICE_TITLE = "I will not splice. Radio ads stay.";
export const SPLICE_WALK_LINE =
  "Walkers still want Sunday Crate to splice SUMMER 93, or cut the talkover.";
export const SPLICE_STAYS_LINE = "This is the splice note. Radio ads stay.";
export const SPLICE_STILL_LINE = "Still tote. Not bake. Not a tape shop. Not rip.";
export const SPLICE_TOTE_LINE = "Add to tote still works.";
export const SPLICE_EMPTY_LINE = "Nobody taped the splice note yet.";

const SERVER_STORE = Symbol.for("iss.splice-listing-ids");

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

export function parseSpliceListingIds(raw: string | null | undefined): string[] {
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

export function spliceCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SPLICE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SPLICE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SPLICE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SPLICE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SPLICE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSpliceListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSpliceListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SPLICE_STORAGE_KEY);
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
          window.localStorage.setItem(SPLICE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSpliceListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = spliceCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SPLICE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SPLICE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SPLICE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSpliceOverlay(
  listingId: string,
  listingIds = readSpliceListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSplice(listing: Listing | undefined): listing is Listing {
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

export type SpliceWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SpliceWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SpliceWriteReason; listingIds: string[] };

function refuseSplice(
  listing: Listing | undefined,
  listingIds: string[],
): SpliceWriteResult | null {
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

export function markListingSplice(
  listing: Listing | undefined,
  listingIds: string[],
): SpliceWriteResult {
  const refused = refuseSplice(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingSplice(
  listing: Listing | undefined,
  listingIds: string[],
): SpliceWriteResult {
  const refused = refuseSplice(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return {
    ok: true, listingIds: listingIds.filter((id) => id !== taped.id),
  };
}

export function subscribeSplice(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SPLICE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SPLICE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SPLICE_CHANGED_EVENT, listener);
  };
}
