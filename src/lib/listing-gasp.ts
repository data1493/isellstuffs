/**
 * I will not gasp it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Raster is outline-to-bitmap. Kern is close-the-pairs. Gridfit
 * is drop-instructions. Hint is TrueType-instruct. Ligature is
 * join-the-fi. Walkers still want Beats to gasp it, or “set GASP
 * so the food-court map greys at shop sizes without a shop
 * raster.” I will not gasp it. Still two weights. Still
 * almost-bold. Still for sale. Not raster. Not kern. Not a shop.
 * Not gridfit. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gasp-listing-ids` is the client gasp set.
 * Cookie `iss-gasp-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write raster, kern, gridfit, hint, ligature, greyscale,
 * ppem, smoothing, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Gasp is the TrueType table, not a login. Register stays print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GASP_STORAGE_KEY = "iss:gasp-listing-ids";
export const GASP_COOKIE_NAME = "iss-gasp-listing-ids";
export const GASP_CHANGED_EVENT = "iss:gasp-changed";

export const GASP_HOST_ID = "dl-booth-font";
export const GASP_PACK_ID = "dl-sample-pack";
export const GASP_PDF_ID = "dl-junk-pricing-pdf";
export const GASP_LUT_ID = "dl-camera-luts";
export const GASP_ZINE_ID = "dl-stain-zine";
export const GASP_LINER_ID = "dl-crate-side-a";
export const GASP_CHAIR_ID = "ysk-folding-chair";
export const GASP_GIFT_ID = "dl-mall-gift-card";
export const GASP_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GASP_OWNED_IDS = [
  GASP_PACK_ID,
  GASP_PDF_ID,
  GASP_LUT_ID,
  GASP_ZINE_ID,
  GASP_LINER_ID,
  "dl-drawer-recipes",
  GASP_BOY_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(GASP_OWNED_IDS);

export const GASP_REFUSE_COPY = "That one does not take a gasp note.";
export const GASP_TABLE_LINE = "I will not gasp it.";
export const GASP_WEIGHTS_LINE = "Still two weights.";
export const GASP_BOLD_LINE = "Still almost-bold.";
export const GASP_NOTICE_TITLE =
  "I will not gasp it. Still two weights. Still almost-bold.";
export const GASP_WALK_LINE =
  "Walkers still want Beats to gasp it, or set GASP so the food-court map greys at shop sizes without a shop raster.";
export const GASP_STAYS_LINE =
  "This is the gasp note. I will not gasp it. Still two weights. Still almost-bold.";
export const GASP_STILL_LINE =
  "Still tote. Not raster. Not kern. Not a shop. Not gridfit. Not an account.";
export const GASP_TOTE_LINE = "Add to tote still works.";
export const GASP_EMPTY_LINE = "Nobody taped a gasp note yet.";
export const GASP_LEAVE_LINE = "Leave the map";

const SERVER_STORE = Symbol.for("iss.gasp-listing-ids");

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

export function parseGaspListingIds(
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

export function gaspCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GASP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GASP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GASP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GASP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GASP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGaspListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGaspListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GASP_STORAGE_KEY);
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
          window.localStorage.setItem(GASP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGaspListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gaspCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GASP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GASP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GASP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGaspOverlay(
  listingId: string,
  listingIds: readonly string[] = readGaspListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === GASP_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === GASP_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GASP_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGasp(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GASP_HOST_ID) {
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

export type GaspWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseGasp(
  listing: Listing | undefined,
): GaspWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isOwnedListing(listing) || listing.id !== GASP_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGasp(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGasp(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGasp(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGasp(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGasp(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GASP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GASP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GASP_CHANGED_EVENT, listener);
  };
}
