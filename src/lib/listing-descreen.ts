/**
 * I will not descreen them — the recipe scans stay three cards. Still
 * grease. Still tote.
 *
 * Gang is step-the-cards. Crop is trim-the-scans. Emboss is
 * raise-the-cover. Varnish is coat-the-junk. Walkers still want Sink
 * Drawer to descreen them, or pull the print dots so the grease
 * reads shop-clean without a shop gang. I will not descreen them.
 * Still three cards. Still grease. Still for sale. Not gang. Not
 * crop. Not a shop. Not emboss. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:descreen-listing-ids` is the client descreen set.
 * Cookie `iss-descreen-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write gang, crop, emboss, varnish, mat, galley, unsharp,
 * deskew, halftone, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-drawer-recipes` only. Liner, junk PDF, whisk, font,
 * gift, zine, physical, and listings already owned by another
 * overlay stay off. Fixture `sold` / `file-gone` rows stay as they are.
 * Descreen is pull the print dots, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const DESCREEN_STORAGE_KEY = "iss:descreen-listing-ids";
export const DESCREEN_COOKIE_NAME = "iss-descreen-listing-ids";
export const DESCREEN_CHANGED_EVENT = "iss:descreen-changed";

export const DESCREEN_HOST_ID = "dl-drawer-recipes";
export const DESCREEN_LINER_ID = "dl-crate-side-a";
export const DESCREEN_PDF_ID = "dl-junk-pricing-pdf";
export const DESCREEN_WHISK_ID = "kdr-bent-whisk";
export const DESCREEN_FONT_ID = "dl-booth-font";
export const DESCREEN_GIFT_ID = "dl-mall-gift-card";
export const DESCREEN_ZINE_ID = "dl-stain-zine";
export const DESCREEN_CHAIR_ID = "ysk-folding-chair";
export const DESCREEN_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DESCREEN_OWNED_IDS = [
  DESCREEN_LINER_ID,
  DESCREEN_PDF_ID,
  DESCREEN_WHISK_ID,
  DESCREEN_FONT_ID,
  DESCREEN_BOY_ID,
  "dl-sample-pack",
  "dl-camera-luts",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(DESCREEN_OWNED_IDS);

export const DESCREEN_REFUSE_COPY = "That one does not take a descreen note.";
export const DESCREEN_TABLE_LINE = "I will not descreen them.";
export const DESCREEN_CARDS_LINE = "Still three cards.";
export const DESCREEN_GREASE_LINE = "Still grease.";
export const DESCREEN_NOTICE_TITLE =
  "I will not descreen them. Still three cards. Still grease.";
export const DESCREEN_WALK_LINE =
  "Walkers still want Sink Drawer to descreen them, or pull the print dots so the grease reads shop-clean without a shop gang.";
export const DESCREEN_STAYS_LINE =
  "This is the descreen note. I will not descreen them. Still three cards. Still grease.";
export const DESCREEN_STILL_LINE =
  "Still tote. Not gang. Not crop. Not a shop. Not emboss. Not an account.";
export const DESCREEN_TOTE_LINE = "Add to tote still works.";
export const DESCREEN_EMPTY_LINE = "Nobody taped a descreen note yet.";
export const DESCREEN_LEAVE_LINE = "Leave the cards";

const SERVER_STORE = Symbol.for("iss.descreen-listing-ids");

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

export function parseDescreenListingIds(
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

export function descreenCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DESCREEN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DESCREEN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DESCREEN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DESCREEN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DESCREEN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDescreenListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDescreenListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DESCREEN_STORAGE_KEY);
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
          window.localStorage.setItem(DESCREEN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDescreenListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = descreenCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DESCREEN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DESCREEN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DESCREEN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDescreenOverlay(
  listingId: string,
  listingIds: readonly string[] = readDescreenListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLinerListing(listing: Listing) {
  return listing.id === DESCREEN_LINER_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === DESCREEN_PDF_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === DESCREEN_WHISK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === DESCREEN_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === DESCREEN_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host recipe scans only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeDescreen(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DESCREEN_HOST_ID) {
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

export type DescreenWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "liner"
  | "pdf"
  | "whisk"
  | "font"
  | "chair"
  | "owned";

function refuseDescreen(
  listing: Listing | undefined,
): DescreenWriteReason | null {
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
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isLinerListing(listing)) {
    return "liner";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== DESCREEN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDescreen(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDescreen(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDescreen(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDescreen(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDescreen(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DESCREEN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DESCREEN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DESCREEN_CHANGED_EVENT, listener);
  };
}
