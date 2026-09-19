/**
 * I will not preflight it — the junk PDF stays one page. Still tote.
 *
 * Collate is gather-the-pages. Paginate is page-numbers. Typeset is
 * folding-table type. Impose is 2-up. Consult is appraise. Walkers
 * still want Tuesday to preflight How to price your junk, or “check
 * the one-pager so the copy-shop does not crash.” I will not
 * preflight it. Still one page. Still a PDF. Still for sale. Not
 * collate. Not impose. Not a shop. Not typeset.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:preflight-listing-ids` is the client preflight set.
 * Cookie `iss-preflight-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write collate, paginate, impose, typeset, consult, staple,
 * revise, grid, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-junk-pricing-pdf` only. Font, LUT, pack, liner PDF,
 * lamp, gift, zine, and listings already owned by another overlay
 * stay off. Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const PREFLIGHT_STORAGE_KEY = "iss:preflight-listing-ids";
export const PREFLIGHT_COOKIE_NAME = "iss-preflight-listing-ids";
export const PREFLIGHT_CHANGED_EVENT = "iss:preflight-changed";

export const PREFLIGHT_HOST_ID = "dl-junk-pricing-pdf";
export const PREFLIGHT_LINER_ID = "dl-crate-side-a";
export const PREFLIGHT_FONT_ID = "dl-booth-font";
export const PREFLIGHT_PACK_ID = "dl-sample-pack";
export const PREFLIGHT_LUT_ID = "dl-camera-luts";
export const PREFLIGHT_LAMP_ID = "ysk-wobbly-lamp";
export const PREFLIGHT_ZINE_ID = "dl-stain-zine";
export const PREFLIGHT_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PREFLIGHT_OWNED_IDS = [
  PREFLIGHT_LINER_ID,
  PREFLIGHT_FONT_ID,
  PREFLIGHT_PACK_ID,
  PREFLIGHT_LUT_ID,
  PREFLIGHT_LAMP_ID,
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(PREFLIGHT_OWNED_IDS);

export const PREFLIGHT_REFUSE_COPY = "That one does not take a preflight note.";
export const PREFLIGHT_TABLE_LINE = "I will not preflight it.";
export const PREFLIGHT_PAGE_LINE = "Still one page.";
export const PREFLIGHT_PDF_LINE = "Still a PDF.";
export const PREFLIGHT_NOTICE_TITLE =
  "I will not preflight it. Still one page. Still a PDF.";
export const PREFLIGHT_WALK_LINE =
  "Walkers still want Tuesday to preflight it, or check the one-pager so the copy-shop does not crash.";
export const PREFLIGHT_STAYS_LINE =
  "This is the preflight note. I will not preflight it. Still one page. Still a PDF.";
export const PREFLIGHT_STILL_LINE =
  "Still tote. Not collate. Not impose. Not a shop. Not typeset.";
export const PREFLIGHT_TOTE_LINE = "Add to tote still works.";
export const PREFLIGHT_EMPTY_LINE = "Nobody taped a preflight note yet.";
export const PREFLIGHT_LEAVE_LINE = "Leave the page";

const SERVER_STORE = Symbol.for("iss.preflight-listing-ids");

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

export function parsePreflightListingIds(
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

export function preflightCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PREFLIGHT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PREFLIGHT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PREFLIGHT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PREFLIGHT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PREFLIGHT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePreflightListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPreflightListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PREFLIGHT_STORAGE_KEY);
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
          window.localStorage.setItem(PREFLIGHT_STORAGE_KEY, JSON.stringify(ids));
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

export function writePreflightListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = preflightCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PREFLIGHT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PREFLIGHT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PREFLIGHT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPreflightOverlay(
  listingId: string,
  listingIds: readonly string[] = readPreflightListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLinerListing(listing: Listing) {
  return listing.id === PREFLIGHT_LINER_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === PREFLIGHT_FONT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === PREFLIGHT_PACK_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === PREFLIGHT_LUT_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === PREFLIGHT_LAMP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host junk PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapePreflight(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PREFLIGHT_HOST_ID) {
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

export type PreflightWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "liner"
  | "font"
  | "pack"
  | "lut"
  | "lamp"
  | "owned";

function refusePreflight(
  listing: Listing | undefined,
): PreflightWriteReason | null {
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
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isOwnedListing(listing) || listing.id !== PREFLIGHT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPreflight(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePreflight(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPreflight(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePreflight(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePreflight(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFLIGHT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PREFLIGHT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PREFLIGHT_CHANGED_EVENT, listener);
  };
}
