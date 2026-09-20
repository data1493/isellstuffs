/**
 * I will not bleed it — the liner PDF stays one page. Still wrong. Still tote.
 *
 * Typeset is Canva. Remember is the liner we already have. Verso is
 * Side B. Errata is a correction desk. Preflight is print-ready.
 * Walkers still want Crate to bleed it, or “add trim so the
 * copy-shop can cut the liner.” I will not bleed it. Still one
 * page. Still wrong. Still for sale. Not typeset. Not errata.
 * Not a shop. Not preflight.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bleed-listing-ids` is the client bleed set.
 * Cookie `iss-bleed-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write typeset, remember, verso, errata, preflight, consult,
 * cite, paginate, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-crate-side-a` only. Junk PDF, font, windbreaker, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const BLEED_STORAGE_KEY = "iss:bleed-listing-ids";
export const BLEED_COOKIE_NAME = "iss-bleed-listing-ids";
export const BLEED_CHANGED_EVENT = "iss:bleed-changed";

export const BLEED_HOST_ID = "dl-crate-side-a";
export const BLEED_PDF_ID = "dl-junk-pricing-pdf";
export const BLEED_FONT_ID = "dl-booth-font";
export const BLEED_JACKET_ID = "clo-windbreaker";
export const BLEED_ZINE_ID = "dl-stain-zine";
export const BLEED_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BLEED_OWNED_IDS = [
  BLEED_PDF_ID,
  BLEED_FONT_ID,
  BLEED_JACKET_ID,
  "dl-sample-pack",
  "dl-camera-luts",
  "dl-drawer-recipes",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(BLEED_OWNED_IDS);

export const BLEED_REFUSE_COPY = "That one does not take a bleed note.";
export const BLEED_TABLE_LINE = "I will not bleed it.";
export const BLEED_PAGE_LINE = "Still one page.";
export const BLEED_WRONG_LINE = "Still wrong.";
export const BLEED_NOTICE_TITLE =
  "I will not bleed it. Still one page. Still wrong.";
export const BLEED_WALK_LINE =
  "Walkers still want Crate to bleed it, or add trim so the copy-shop can cut the liner.";
export const BLEED_STAYS_LINE =
  "This is the bleed note. I will not bleed it. Still one page. Still wrong.";
export const BLEED_STILL_LINE =
  "Still tote. Not typeset. Not errata. Not a shop. Not preflight.";
export const BLEED_TOTE_LINE = "Add to tote still works.";
export const BLEED_EMPTY_LINE = "Nobody taped a bleed note yet.";
export const BLEED_LEAVE_LINE = "Leave the page";

const SERVER_STORE = Symbol.for("iss.bleed-listing-ids");

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

export function parseBleedListingIds(
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

export function bleedCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BLEED_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BLEED_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BLEED_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BLEED_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BLEED_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBleedListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBleedListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BLEED_STORAGE_KEY);
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
          window.localStorage.setItem(BLEED_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBleedListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bleedCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BLEED_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BLEED_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BLEED_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBleedOverlay(
  listingId: string,
  listingIds: readonly string[] = readBleedListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPdfListing(listing: Listing) {
  return listing.id === BLEED_PDF_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === BLEED_FONT_ID;
}

function isJacketListing(listing: Listing) {
  return listing.id === BLEED_JACKET_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === BLEED_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host liner PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeBleed(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BLEED_HOST_ID) {
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

export type BleedWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pdf"
  | "font"
  | "jacket"
  | "chair"
  | "owned";

function refuseBleed(
  listing: Listing | undefined,
): BleedWriteReason | null {
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
    if (isJacketListing(listing)) {
      return "jacket";
    }
    if (isChairListing(listing)) {
      return "chair";
    }
    return "physical";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== BLEED_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBleed(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBleed(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBleed(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBleed(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBleed(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BLEED_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BLEED_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BLEED_CHANGED_EVENT, listener);
  };
}
