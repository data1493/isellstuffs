/**
 * I will not mat it — the liner PDF stays one page. Still wrong on
 * purpose. Still tote.
 *
 * Bleed is trim. Typeset is Canva. Preflight is print-ready. Trap
 * is knockout / choke. Walkers still want Crate to mat it, or
 * “mount the liner so the copy-shop can frame the page.” I will
 * not mat it. Still one page. Still wrong on purpose. Still for
 * sale. Not bleed. Not typeset. Not a shop. Not preflight. Not
 * trap. Print mount, not a login.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:mat-listing-ids` is the client mat set.
 * Cookie `iss-mat-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bleed, typeset, remember, verso, errata, preflight,
 * trap, consult, cite, paginate, gift, buy, digital eligibility,
 * or tote keys.
 * Host is `dl-crate-side-a` only. Junk PDF, font, windbreaker, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const MAT_STORAGE_KEY = "iss:mat-listing-ids";
export const MAT_COOKIE_NAME = "iss-mat-listing-ids";
export const MAT_CHANGED_EVENT = "iss:mat-changed";

export const MAT_HOST_ID = "dl-crate-side-a";
export const MAT_PDF_ID = "dl-junk-pricing-pdf";
export const MAT_FONT_ID = "dl-booth-font";
export const MAT_JACKET_ID = "clo-windbreaker";
export const MAT_ZINE_ID = "dl-stain-zine";
export const MAT_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const MAT_OWNED_IDS = [
  MAT_PDF_ID,
  MAT_FONT_ID,
  MAT_JACKET_ID,
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

const ownedSet = new Set<string>(MAT_OWNED_IDS);

export const MAT_REFUSE_COPY = "That one does not take a mat note.";
export const MAT_TABLE_LINE = "I will not mat it.";
export const MAT_PAGE_LINE = "Still one page.";
export const MAT_WRONG_LINE = "Still wrong on purpose.";
export const MAT_NOTICE_TITLE =
  "I will not mat it. Still one page. Still wrong on purpose.";
export const MAT_WALK_LINE =
  "Walkers still want Crate to mat it, or mount the liner so the copy-shop can frame the page.";
export const MAT_STAYS_LINE =
  "This is the mat note. I will not mat it. Still one page. Still wrong on purpose.";
export const MAT_STILL_LINE =
  "Still tote. Not bleed. Not typeset. Not a shop. Not preflight.";
export const MAT_TOTE_LINE = "Add to tote still works.";
export const MAT_EMPTY_LINE = "Nobody taped a mat note yet.";
export const MAT_LEAVE_LINE = "Leave the mount";

const SERVER_STORE = Symbol.for("iss.mat-listing-ids");

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

export function parseMatListingIds(
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

export function matCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const MAT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${MAT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(MAT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(MAT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${MAT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseMatListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readMatListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(MAT_STORAGE_KEY);
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
          window.localStorage.setItem(MAT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeMatListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = matCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(MAT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${MAT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(MAT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingMatOverlay(
  listingId: string,
  listingIds: readonly string[] = readMatListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPdfListing(listing: Listing) {
  return listing.id === MAT_PDF_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === MAT_FONT_ID;
}

function isJacketListing(listing: Listing) {
  return listing.id === MAT_JACKET_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === MAT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host liner PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeMat(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== MAT_HOST_ID) {
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

export type MatWriteReason =
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

function refuseMat(
  listing: Listing | undefined,
): MatWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== MAT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingMat(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseMat(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingMat(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseMat(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeMat(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === MAT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(MAT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MAT_CHANGED_EVENT, listener);
  };
}
