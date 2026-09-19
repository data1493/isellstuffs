/**
 * I will not date it — the Side A liner PDF stays summer-ish. Still tote.
 *
 * Walkers still want Sunday Crate to date the liner, or “tell me
 * which year.” I will not date it. Summer-ish. Still a page.
 * Still for sale. Not a Discogs desk.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:year-listing-ids` is the client year set.
 * Cookie `iss-year-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Gift listings and physical rows are refused — an LP is not a
 * liner year. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const YEAR_STORAGE_KEY = "iss:year-listing-ids";
export const YEAR_COOKIE_NAME = "iss-year-listing-ids";
export const YEAR_CHANGED_EVENT = "iss:year-changed";

export const YEAR_REFUSE_COPY = "That one does not take a year note.";
export const YEAR_TABLE_LINE = "I will not date it.";
export const YEAR_SUMMER_LINE = "Summer-ish.";
export const YEAR_PAGE_LINE = "Still a page.";
export const YEAR_NOTICE_TITLE = "I will not date it. Summer-ish. Still a page.";
export const YEAR_WALK_LINE =
  "Walkers still want Sunday Crate to date the liner, or tell them which year.";
export const YEAR_STILL_LINE = "Still tote. Summer-ish. Still a page.";
export const YEAR_TOTE_LINE = "Add to tote still works.";
export const YEAR_EMPTY_LINE = "Nobody taped the year note yet.";

const SERVER_STORE = Symbol.for("iss.year-listing-ids");

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

export function parseYearListingIds(raw: string | null | undefined): string[] {
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

export function yearCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const YEAR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${YEAR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(YEAR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(YEAR_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${YEAR_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseYearListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readYearListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(YEAR_STORAGE_KEY);
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
          window.localStorage.setItem(YEAR_STORAGE_KEY, JSON.stringify(ids));
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

export function writeYearListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = yearCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(YEAR_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${YEAR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(YEAR_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingYearOverlay(
  listingId: string,
  listingIds = readYearListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeYear(listing: Listing | undefined): listing is Listing {
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

export type YearWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type YearWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: YearWriteReason; listingIds: string[] };

function refuseYear(
  listing: Listing | undefined,
  listingIds: string[],
): YearWriteResult | null {
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

export function markListingYear(
  listing: Listing | undefined,
  listingIds: string[],
): YearWriteResult {
  const refused = refuseYear(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingYear(
  listing: Listing | undefined,
  listingIds: string[],
): YearWriteResult {
  const refused = refuseYear(listing, listingIds);
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

export function subscribeYear(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === YEAR_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(YEAR_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(YEAR_CHANGED_EVENT, listener);
  };
}
