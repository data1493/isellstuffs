/**
 * I will not paginate it — the junk PDF stays one page. Still tote.
 *
 * Typeset is folding-table type. Revise is this year’s numbers. Grid
 * is no spreadsheet. Walkers still want Tuesday to paginate How to
 * price your junk, or “make it more than one page.” I will not
 * paginate it. Still one page. Still a rule of thumb. Still for sale.
 * Not typeset. Not revise. Not a sheet desk.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:paginate-listing-ids` is the client paginate set.
 * Cookie `iss-paginate-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write typeset, revise, grid, staple, mark, consult, workbook,
 * variable, print, nest, azimuth, sponge, anneal, grommet, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `dl-junk-pricing-pdf` only. Liner PDF, font, lamp, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const PAGINATE_STORAGE_KEY = "iss:paginate-listing-ids";
export const PAGINATE_COOKIE_NAME = "iss-paginate-listing-ids";
export const PAGINATE_CHANGED_EVENT = "iss:paginate-changed";

export const PAGINATE_HOST_ID = "dl-junk-pricing-pdf";
export const PAGINATE_LINER_ID = "dl-crate-side-a";
export const PAGINATE_FONT_ID = "dl-booth-font";
export const PAGINATE_LAMP_ID = "ysk-wobbly-lamp";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PAGINATE_OWNED_IDS = [
  PAGINATE_LINER_ID,
  PAGINATE_FONT_ID,
  PAGINATE_LAMP_ID,
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(PAGINATE_OWNED_IDS);

export const PAGINATE_REFUSE_COPY = "That one does not take a paginate note.";
export const PAGINATE_TABLE_LINE = "I will not paginate it.";
export const PAGINATE_PAGE_LINE = "Still one page.";
export const PAGINATE_RULE_LINE = "Still a rule of thumb.";
export const PAGINATE_NOTICE_TITLE =
  "I will not paginate it. Still one page. Still a rule of thumb.";
export const PAGINATE_WALK_LINE =
  "Walkers still want Tuesday to paginate the junk PDF, or make it more than one page.";
export const PAGINATE_STAYS_LINE =
  "This is the paginate note. I will not paginate it. Still one page. Still a rule of thumb.";
export const PAGINATE_STILL_LINE =
  "Still tote. Not typeset. Not revise. Not a sheet desk.";
export const PAGINATE_TOTE_LINE = "Add to tote still works.";
export const PAGINATE_EMPTY_LINE = "Nobody taped a paginate note yet.";
export const PAGINATE_LEAVE_LINE = "Leave the one page";

const SERVER_STORE = Symbol.for("iss.paginate-listing-ids");

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

export function parsePaginateListingIds(
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
    // Reject write-result literals `{ ok, listingIds }` — they 500 the PDP.
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

export function paginateCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PAGINATE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PAGINATE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PAGINATE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PAGINATE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PAGINATE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePaginateListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPaginateListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PAGINATE_STORAGE_KEY);
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
          window.localStorage.setItem(PAGINATE_STORAGE_KEY, JSON.stringify(ids));
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

export function writePaginateListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = paginateCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PAGINATE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PAGINATE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PAGINATE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPaginateOverlay(
  listingId: string,
  listingIds: readonly string[] = readPaginateListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLinerListing(listing: Listing) {
  return listing.id === PAGINATE_LINER_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === PAGINATE_FONT_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === PAGINATE_LAMP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host junk PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapePaginate(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PAGINATE_HOST_ID) {
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

export type PaginateWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "liner"
  | "font"
  | "lamp"
  | "owned";

function refusePaginate(
  listing: Listing | undefined,
): PaginateWriteReason | null {
  if (!listing) {
    return "missing";
  }
  if (listing.status === "file-gone") {
    return "file-gone";
  }
  if (listing.status === "sold") {
    return "sold";
  }
  if (isGiftListing(listing)) {
    return "gift";
  }
  if (!isDigitalListing(listing)) {
    return isLampListing(listing) ? "lamp" : "physical";
  }
  if (isLinerListing(listing)) {
    return "liner";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== PAGINATE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPaginate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePaginate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPaginate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePaginate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePaginate(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PAGINATE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PAGINATE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PAGINATE_CHANGED_EVENT, listener);
  };
}
