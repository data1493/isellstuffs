/**
 * I will not collate them — the junk PDF stays one page. Still tote.
 *
 * Typeset is folding-table type. Paginate is page-numbers. Staple
 * is bind. Revise is this year’s numbers. Grid is no spreadsheet.
 * Walkers still want Tuesday to collate How to price your junk, or
 * “gather the pages so the rule of thumb reads in order.” I will
 * not collate them. Still one page. Still a folding table. Still
 * for sale. Not paginate. Not staple. Not a shop. Not typeset.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:collate-listing-ids` is the client collate set.
 * Cookie `iss-collate-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write typeset, paginate, staple, revise, grid, consult, mark,
 * rivet, scale, lathe, ligature, degauss, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `dl-junk-pricing-pdf` only. Font, pack, liner PDF, lamp,
 * gift, zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const COLLATE_STORAGE_KEY = "iss:collate-listing-ids";
export const COLLATE_COOKIE_NAME = "iss-collate-listing-ids";
export const COLLATE_CHANGED_EVENT = "iss:collate-changed";

export const COLLATE_HOST_ID = "dl-junk-pricing-pdf";
export const COLLATE_LINER_ID = "dl-crate-side-a";
export const COLLATE_FONT_ID = "dl-booth-font";
export const COLLATE_PACK_ID = "dl-sample-pack";
export const COLLATE_LAMP_ID = "ysk-wobbly-lamp";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const COLLATE_OWNED_IDS = [
  COLLATE_LINER_ID,
  COLLATE_FONT_ID,
  COLLATE_PACK_ID,
  COLLATE_LAMP_ID,
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(COLLATE_OWNED_IDS);

export const COLLATE_REFUSE_COPY = "That one does not take a collate note.";
export const COLLATE_TABLE_LINE = "I will not collate them.";
export const COLLATE_PAGE_LINE = "Still one page.";
export const COLLATE_FOLD_LINE = "Still a folding table.";
export const COLLATE_NOTICE_TITLE =
  "I will not collate them. Still one page. Still a folding table.";
export const COLLATE_WALK_LINE =
  "Walkers still want Tuesday to collate the one-pager, or gather the pages so the rule of thumb reads in order.";
export const COLLATE_STAYS_LINE =
  "This is the collate note. I will not collate them. Still one page. Still a folding table.";
export const COLLATE_STILL_LINE =
  "Still tote. Not paginate. Not staple. Not a shop. Not typeset.";
export const COLLATE_TOTE_LINE = "Add to tote still works.";
export const COLLATE_EMPTY_LINE = "Nobody taped a collate note yet.";
export const COLLATE_LEAVE_LINE = "Leave the one-pager";

const SERVER_STORE = Symbol.for("iss.collate-listing-ids");

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

export function parseCollateListingIds(
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

export function collateCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const COLLATE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${COLLATE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(COLLATE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(COLLATE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${COLLATE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCollateListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCollateListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(COLLATE_STORAGE_KEY);
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
          window.localStorage.setItem(COLLATE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCollateListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = collateCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(COLLATE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${COLLATE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(COLLATE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCollateOverlay(
  listingId: string,
  listingIds: readonly string[] = readCollateListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLinerListing(listing: Listing) {
  return listing.id === COLLATE_LINER_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === COLLATE_FONT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === COLLATE_PACK_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === COLLATE_LAMP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host junk PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeCollate(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== COLLATE_HOST_ID) {
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

export type CollateWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "liner"
  | "font"
  | "pack"
  | "lamp"
  | "owned";

function refuseCollate(
  listing: Listing | undefined,
): CollateWriteReason | null {
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
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isOwnedListing(listing) || listing.id !== COLLATE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCollate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCollate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCollate(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCollate(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCollate(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === COLLATE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(COLLATE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COLLATE_CHANGED_EVENT, listener);
  };
}
