/**
 * I will not galley it — the liner PDF stays one page. Still wrong on
 * purpose. Still tote.
 *
 * Mat is board-the-page. Dedicate is write-the-liner. Impose is
 * lock-the-sheet. Crop is trim-the-scans. Walkers still want Sunday
 * Crate to galley it, or pull a shop galley so Side A proofs without
 * a shop impose. I will not galley it. Still one page. Still wrong
 * on purpose. Still for sale. Not mat. Not dedicate. Not a shop.
 * Not impose. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:galley-listing-ids` is the client galley set.
 * Cookie `iss-galley-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write mat, dedicate, impose, verso, slug, forme, folio, crop,
 * varnish, register, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-crate-side-a` only. Mixtape, junk PDF, Game Boy, font,
 * recipes, gift, zine, physical, and listings already owned by another
 * overlay stay off. Fixture `sold` / `file-gone` rows stay as they are.
 * Galley is print proof, not a login. Register stays print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GALLEY_STORAGE_KEY = "iss:galley-listing-ids";
export const GALLEY_COOKIE_NAME = "iss-galley-listing-ids";
export const GALLEY_CHANGED_EVENT = "iss:galley-changed";

export const GALLEY_HOST_ID = "dl-crate-side-a";
export const GALLEY_MIXTAPE_ID = "mdb-mixtape-93";
export const GALLEY_PDF_ID = "dl-junk-pricing-pdf";
export const GALLEY_BOY_ID = "gtk-game-boy";
export const GALLEY_RECIPES_ID = "dl-drawer-recipes";
export const GALLEY_FONT_ID = "dl-booth-font";
export const GALLEY_GIFT_ID = "dl-mall-gift-card";
export const GALLEY_ZINE_ID = "dl-stain-zine";
export const GALLEY_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GALLEY_OWNED_IDS = [
  GALLEY_MIXTAPE_ID,
  GALLEY_PDF_ID,
  GALLEY_BOY_ID,
  GALLEY_RECIPES_ID,
  GALLEY_FONT_ID,
  "dl-sample-pack",
  "dl-camera-luts",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "kdr-bent-whisk",
] as const;

const ownedSet = new Set<string>(GALLEY_OWNED_IDS);

export const GALLEY_REFUSE_COPY = "That one does not take a galley note.";
export const GALLEY_TABLE_LINE = "I will not galley it.";
export const GALLEY_PAGE_LINE = "Still one page.";
export const GALLEY_WRONG_LINE = "Still wrong on purpose.";
export const GALLEY_NOTICE_TITLE =
  "I will not galley it. Still one page. Still wrong on purpose.";
export const GALLEY_WALK_LINE =
  "Walkers still want Sunday Crate to galley it, or pull a shop galley so Side A proofs without a shop impose.";
export const GALLEY_STAYS_LINE =
  "This is the galley note. I will not galley it. Still one page. Still wrong on purpose.";
export const GALLEY_STILL_LINE =
  "Still tote. Not mat. Not dedicate. Not a shop. Not impose.";
export const GALLEY_TOTE_LINE = "Add to tote still works.";
export const GALLEY_EMPTY_LINE = "Nobody taped a galley note yet.";
export const GALLEY_LEAVE_LINE = "Leave the liner";

const SERVER_STORE = Symbol.for("iss.galley-listing-ids");

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

export function parseGalleyListingIds(
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

export function galleyCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GALLEY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GALLEY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GALLEY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GALLEY_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GALLEY_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGalleyListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGalleyListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GALLEY_STORAGE_KEY);
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
          window.localStorage.setItem(GALLEY_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGalleyListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = galleyCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GALLEY_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GALLEY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GALLEY_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGalleyOverlay(
  listingId: string,
  listingIds: readonly string[] = readGalleyListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === GALLEY_MIXTAPE_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === GALLEY_PDF_ID;
}

function isBoyListing(listing: Listing) {
  return listing.id === GALLEY_BOY_ID;
}

function isRecipesListing(listing: Listing) {
  return listing.id === GALLEY_RECIPES_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === GALLEY_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GALLEY_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host liner PDF only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGalley(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GALLEY_HOST_ID) {
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

export type GalleyWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "pdf"
  | "boy"
  | "recipes"
  | "font"
  | "chair"
  | "owned";

function refuseGalley(
  listing: Listing | undefined,
): GalleyWriteReason | null {
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
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isBoyListing(listing)) {
    return "boy";
  }
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isRecipesListing(listing)) {
    return "recipes";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isOwnedListing(listing) || listing.id !== GALLEY_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGalley(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGalley(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGalley(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGalley(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGalley(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GALLEY_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GALLEY_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GALLEY_CHANGED_EVENT, listener);
  };
}
