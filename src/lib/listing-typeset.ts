/**
 * I will not typeset — the junk PDF stays a folding-table page. Still tote.
 *
 * Workbook is no sequel page. Foundry is two weights, not a seat.
 * Cards is I will not OCR the grease scans. Consult / `/rule` was killed.
 * Walkers still want Tuesday to typeset How to price your junk
 * into a real ebook. I will not typeset. Written on a folding table.
 * Still for sale. Not workbook. Not a Canva desk. Not cards.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:typeset-listing-ids` is the client typeset set.
 * Cookie `iss-typeset-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write workbook, foundry, cards, wrong, print, folder, type,
 * ugly, draft, thumb, rule, page, canva, ebook, film, look, ask,
 * hands, van, firm, packed, sold, file-gone, gift, buy, digital
 * eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp is not a
 * page. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const TYPESET_STORAGE_KEY = "iss:typeset-listing-ids";
export const TYPESET_COOKIE_NAME = "iss-typeset-listing-ids";
export const TYPESET_CHANGED_EVENT = "iss:typeset-changed";

export const TYPESET_REFUSE_COPY = "That one does not take a typeset.";
export const TYPESET_TABLE_LINE = "I will not typeset.";
export const TYPESET_PAGE_LINE = "Written on a folding table.";
export const TYPESET_NOTICE_TITLE =
  "I will not typeset. Written on a folding table.";
export const TYPESET_WORKBOOK_LINE =
  "Workbook is no sequel page. Foundry is two weights, not a seat.";
export const TYPESET_STILL_LINE =
  "Still tote. Not workbook. Not a Canva desk. Not cards.";
export const TYPESET_TOTE_LINE = "Add to tote still works.";
export const TYPESET_EMPTY_LINE = "Nobody taped the typeset yet.";

const SERVER_STORE = Symbol.for("iss.typeset-listing-ids");

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

export function parseTypesetListingIds(
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

export function typesetCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TYPESET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TYPESET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TYPESET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TYPESET_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TYPESET_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTypesetListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTypesetListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TYPESET_STORAGE_KEY);
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
          window.localStorage.setItem(TYPESET_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTypesetListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = typesetCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TYPESET_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TYPESET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TYPESET_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTypesetOverlay(
  listingId: string,
  listingIds = readTypesetListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeTypeset(listing: Listing | undefined): listing is Listing {
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

export type TypesetWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type TypesetWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: TypesetWriteReason; listingIds: string[] };

function refuseTypeset(
  listing: Listing | undefined,
  listingIds: string[],
): TypesetWriteResult | null {
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

export function markListingTypeset(
  listing: Listing | undefined,
  listingIds: string[],
): TypesetWriteResult {
  const refused = refuseTypeset(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingTypeset(
  listing: Listing | undefined,
  listingIds: string[],
): TypesetWriteResult {
  const refused = refuseTypeset(listing, listingIds);
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

export function subscribeTypeset(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TYPESET_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TYPESET_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TYPESET_CHANGED_EVENT, listener);
  };
}
