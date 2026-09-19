/**
 * Smells like smoke — garment honesty. Still tote.
 *
 * Pockets are empty is the jacket check. This is the smoke smell.
 * Not as-is. Not look.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:smoke-listing-ids` is the client smoke set.
 * Cookie `iss-smoke-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pockets, parts, press, as-is, look, film, cells, kids,
 * ask, hands, scan, heavy, with, van, firm, packed, sold, file-gone,
 * gift, buy, digital eligibility, or tote keys.
 * Gift listings and digital files are refused — a PDF does not smoke.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "./commerce/types";

export const SMOKE_STORAGE_KEY = "iss:smoke-listing-ids";
export const SMOKE_COOKIE_NAME = "iss-smoke-listing-ids";
export const SMOKE_CHANGED_EVENT = "iss:smoke-changed";

export const SMOKE_REFUSE_COPY = "That one is not a smoke smell.";
export const SMOKE_TABLE_LINE = "Smells like smoke.";
export const SMOKE_STILL_LINE = "Still tote. Not as-is. Not look.";
export const SMOKE_TOTE_LINE = "Add to tote still works.";
export const SMOKE_POCKETS_LINE = "Pockets are empty is the jacket check.";
export const SMOKE_SMELL_LINE = "This is the smoke smell.";
export const SMOKE_EMPTY_LINE = "Nobody taped the smoke smell yet.";

const SERVER_STORE = Symbol.for("iss.smoke-listing-ids");

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

export function parseSmokeListingIds(raw: string | null | undefined): string[] {
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

export function smokeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SMOKE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SMOKE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SMOKE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SMOKE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SMOKE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSmokeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSmokeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SMOKE_STORAGE_KEY);
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
          window.localStorage.setItem(SMOKE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSmokeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = smokeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SMOKE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SMOKE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SMOKE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSmokeOverlay(
  listingId: string,
  listingIds = readSmokeListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Physical unique goods only. Digital, gift, sold, and file-gone stay off. */
export function canTapeSmoke(listing: Listing | undefined): listing is Listing {
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

export type SmokeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone";

export type SmokeWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: SmokeWriteReason; listingIds: string[] };

function refuseSmoke(
  listing: Listing | undefined,
  listingIds: string[],
): SmokeWriteResult | null {
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

export function markListingSmoke(
  listing: Listing | undefined,
  listingIds: string[],
): SmokeWriteResult {
  const refused = refuseSmoke(listing, listingIds);
  if (refused) {
    return refused;
  }
  if (listingIds.includes(listing!.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, listing!.id] };
}

export function clearListingSmoke(
  listing: Listing | undefined,
  listingIds: string[],
): SmokeWriteResult {
  const refused = refuseSmoke(listing, listingIds);
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

export function subscribeSmoke(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SMOKE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SMOKE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SMOKE_CHANGED_EVENT, listener);
  };
}
