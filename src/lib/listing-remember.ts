/**
 * I will not remember better — the Side A liner PDF stays the page. Still tote.
 *
 * Wrong is the liner stays wrong. Songs is no cassette titles.
 * Name is the crate will not name LPs. Walkers still want Sunday
 * Crate to Discogs the Side A liner PDF, or “remember it better.”
 * I will not remember better. What we remember is the page.
 * Still for sale. Not wrong. Not a liner shop. Not name.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:remember-listing-ids` is the client remember set.
 * Cookie `iss-remember-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write wrong, songs, rip, name, press, folder, memory, discogs,
 * recall, scan, look, ask, hands, van, firm, packed, sold, file-gone,
 * gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — an LP is not a
 * memory page. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const REMEMBER_STORAGE_KEY = "iss:remember-listing-ids";
export const REMEMBER_COOKIE_NAME = "iss-remember-listing-ids";
export const REMEMBER_CHANGED_EVENT = "iss:remember-changed";

export const REMEMBER_REFUSE_COPY = "That one does not take a remember.";
export const REMEMBER_TABLE_LINE = "I will not remember better.";
export const REMEMBER_PAGE_LINE = "What we remember is the page.";
export const REMEMBER_NOTICE_TITLE =
  "I will not remember better. What we remember is the page.";
export const REMEMBER_WRONG_LINE =
  "Wrong is the liner stays wrong. Songs is no cassette titles.";
export const REMEMBER_STILL_LINE =
  "Still tote. Not wrong. Not a liner shop. Not name.";
export const REMEMBER_TOTE_LINE = "Add to tote still works.";
export const REMEMBER_EMPTY_LINE = "Nobody taped the remember yet.";

const SERVER_STORE = Symbol.for("iss.remember-listing-ids");

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

export function parseRememberListingIds(
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

export function rememberCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const REMEMBER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${REMEMBER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(REMEMBER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(REMEMBER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${REMEMBER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRememberListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRememberListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(REMEMBER_STORAGE_KEY);
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
          window.localStorage.setItem(REMEMBER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRememberListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = rememberCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REMEMBER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${REMEMBER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(REMEMBER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRememberOverlay(
  listingId: string,
  listingIds = readRememberListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeRemember(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (!isDigitalListing(listing)) {
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

export type RememberWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type RememberWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: RememberWriteReason; listingIds: string[] };

function refuseRemember(
  listing: Listing | undefined,
  listingIds: string[],
): RememberWriteResult | null {
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
  if (!isDigitalListing(listing)) {
    return { ok: false, reason: "physical", listingIds };
  }
  return null;
}

export function markListingRemember(
  listing: Listing | undefined,
  listingIds: string[],
): RememberWriteResult {
  const refused = refuseRemember(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingRemember(
  listing: Listing | undefined,
  listingIds: string[],
): RememberWriteResult {
  const refused = refuseRemember(listing, listingIds);
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

export function subscribeRemember(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REMEMBER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REMEMBER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REMEMBER_CHANGED_EVENT, listener);
  };
}
