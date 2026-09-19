/**
 * I will not spreadsheet — the junk PDF stays one page. Still tote.
 *
 * Typeset is I will not Canva it. Workbook is no sequel page.
 * Revise is not this year’s numbers. Print is I don’t print the PDF
 * at the table. Cards is recipe OCR. Walkers still want Tuesday to
 * put the junk rule in a spreadsheet, or “make a grid I can sort.”
 * I will not spreadsheet. One page. A rule of thumb.
 * Still for sale. Not revise. Not a sheet desk. Not typeset.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:grid-listing-ids` is the client grid set.
 * Cookie `iss-grid-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write typeset, workbook, revise, print, cards, xlsx, excel,
 * csv, sheet, folder, film, look, ask, hands, van, firm, packed,
 * sold, file-gone, gift, buy, digital eligibility, or tote keys.
 * Physical listings and gift cards are refused — a lamp is not a
 * sheet. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GRID_STORAGE_KEY = "iss:grid-listing-ids";
export const GRID_COOKIE_NAME = "iss-grid-listing-ids";
export const GRID_CHANGED_EVENT = "iss:grid-changed";

export const GRID_REFUSE_COPY = "That one does not take a grid.";
export const GRID_TABLE_LINE = "I will not spreadsheet.";
export const GRID_ONE_LINE = "One page.";
export const GRID_RULE_LINE = "A rule of thumb.";
export const GRID_NOTICE_TITLE =
  "I will not spreadsheet. One page. A rule of thumb.";
export const GRID_WALK_LINE =
  "Walkers still want Tuesday to put the junk rule in a spreadsheet, or make a grid I can sort.";
export const GRID_STILL_LINE =
  "Still tote. Not revise. Not a sheet desk. Not typeset.";
export const GRID_TOTE_LINE = "Add to tote still works.";
export const GRID_EMPTY_LINE = "Nobody taped a grid yet.";

const SERVER_STORE = Symbol.for("iss.grid-listing-ids");

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

export function parseGridListingIds(
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

export function gridCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GRID_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GRID_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GRID_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GRID_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GRID_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGridListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGridListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GRID_STORAGE_KEY);
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
          window.localStorage.setItem(GRID_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGridListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gridCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GRID_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GRID_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GRID_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGridOverlay(
  listingId: string,
  listingIds = readGridListingIds(),
) {
  return listingIds.includes(listingId);
}

/** Digital files only. Physical, gift, sold, and file-gone stay off. */
export function canTapeGrid(listing: Listing | undefined): listing is Listing {
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

export type GridWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone";

export type GridWriteResult =
  | { ok: true; listingIds: string[] }
  | { ok: false; reason: GridWriteReason; listingIds: string[] };

function refuseGrid(
  listing: Listing | undefined,
  listingIds: string[],
): GridWriteResult | null {
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

export function markListingGrid(
  listing: Listing | undefined,
  listingIds: string[],
): GridWriteResult {
  const refused = refuseGrid(listing, listingIds);
  if (refused) {
    return refused;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return { ok: true, listingIds };
  }
  return { ok: true, listingIds: [...listingIds, taped.id] };
}

export function clearListingGrid(
  listing: Listing | undefined,
  listingIds: string[],
): GridWriteResult {
  const refused = refuseGrid(listing, listingIds);
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

export function subscribeGrid(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GRID_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GRID_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GRID_CHANGED_EVENT, listener);
  };
}
