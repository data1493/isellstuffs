/**
 * I will not resole — cobbler refusal. Still tote.
 *
 * Peel is the toe. Laces stayed home.
 * This is the cobbler refusal. Both still walk.
 * Not toe. Not laces.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:sole-listing-ids` is the client sole set.
 * Cookie `iss-sole-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write toe, laces, size, sew, wash, print, dust, convert,
 * film, look, ask, hands, scan, heavy, with, van, firm, packed, sold,
 * file-gone, gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not walk.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SOLE_STORAGE_KEY = "iss:sole-listing-ids";
export const SOLE_COOKIE_NAME = "iss-sole-listing-ids";
export const SOLE_CHANGED_EVENT = "iss:sole-changed";

export const SOLE_REFUSE_COPY = "That one does not take a resole.";
export const SOLE_TABLE_LINE = "I will not resole.";
export const SOLE_TOE_LINE = "Peel is the toe.";
export const SOLE_LACES_LINE = "Laces stayed home.";
export const SOLE_STAYS_LINE = "This is the cobbler refusal.";
export const SOLE_WALK_LINE = "Both still walk.";
export const SOLE_STILL_LINE = "Still tote. Not toe. Not laces.";
export const SOLE_TOTE_LINE = "Add to tote still works.";
export const SOLE_EMPTY_LINE = "Nobody taped a resole refusal yet.";

const SERVER_STORE = Symbol.for("iss.sole-listing-ids");

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

export function parseSoleListingIds(raw: string | null | undefined): string[] {
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

export function soleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SOLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SOLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SOLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SOLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SOLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSoleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSoleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SOLE_STORAGE_KEY);
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
          window.localStorage.setItem(SOLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSoleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = soleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SOLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SOLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SOLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSoleOverlay(
  listingId: string,
  listingIds = readSoleListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSole(listing: Listing | undefined): listing is Listing {
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

export type SoleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SoleWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SoleWriteReason; listingIds: string[] };

function refuseSole(
  listing: Listing | undefined,
  listingIds: string[],
): SoleWriteResult | null {
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

export function markListingSole(
  listing: Listing | undefined,
  listingIds: string[],
): SoleWriteResult {
  const refused = refuseSole(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingSole(
  listing: Listing | undefined,
  listingIds: string[],
): SoleWriteResult {
  const refused = refuseSole(listing, listingIds);
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

export function subscribeSole(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SOLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SOLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SOLE_CHANGED_EVENT, listener);
  };
}
