/**
 * I will not raster it — still two weights. Still almost bold.
 * Still tote.
 *
 * Outline is convert-outlines. Kern is pair-FOOD-COURT. Subset is
 * webfont-cut. Hint is hinted-OTF. Ligature is join-the-fi.
 * Walkers still want Beats to raster it, or “flatten the two
 * weights so the directory prints without a foundry.” I will not
 * raster it. Still two weights. Still almost bold. Still for sale.
 * Not outline. Not kern. Not a shop. Not subset. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:raster-listing-ids` is the client raster set.
 * Cookie `iss-raster-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write outline, kern, subset, hint, ligature, foundry, slant,
 * bold, specimen, icons, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, LUT, gift, zine, liner, junk
 * PDF, physical, and listings already owned by another overlay stay
 * off. Fixture `sold` / `file-gone` rows stay as they are.
 * Raster is print flatten, not a login. No auth.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const RASTER_STORAGE_KEY = "iss:raster-listing-ids";
export const RASTER_COOKIE_NAME = "iss-raster-listing-ids";
export const RASTER_CHANGED_EVENT = "iss:raster-changed";

export const RASTER_HOST_ID = "dl-booth-font";
export const RASTER_PACK_ID = "dl-sample-pack";
export const RASTER_LUT_ID = "dl-camera-luts";
export const RASTER_ZINE_ID = "dl-stain-zine";
export const RASTER_LINER_ID = "dl-crate-side-a";
export const RASTER_PDF_ID = "dl-junk-pricing-pdf";
export const RASTER_CHAIR_ID = "ysk-folding-chair";
export const RASTER_GIFT_ID = "dl-mall-gift-card";
export const RASTER_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RASTER_OWNED_IDS = [
  RASTER_PACK_ID,
  RASTER_LUT_ID,
  RASTER_ZINE_ID,
  RASTER_LINER_ID,
  RASTER_PDF_ID,
  "dl-drawer-recipes",
  RASTER_BOY_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
] as const;

const ownedSet = new Set<string>(RASTER_OWNED_IDS);

export const RASTER_REFUSE_COPY = "That one does not take a raster note.";
export const RASTER_TABLE_LINE = "I will not raster it.";
export const RASTER_WEIGHTS_LINE = "Still two weights.";
export const RASTER_BOLD_LINE = "Still almost bold.";
export const RASTER_NOTICE_TITLE =
  "I will not raster it. Still two weights. Still almost bold.";
export const RASTER_WALK_LINE =
  "Walkers still want Beats to raster it, or flatten the two weights so the directory prints without a foundry.";
export const RASTER_STAYS_LINE =
  "This is the raster note. I will not raster it. Still two weights. Still almost bold.";
export const RASTER_STILL_LINE =
  "Still tote. Not outline. Not kern. Not a shop. Not subset.";
export const RASTER_TOTE_LINE = "Add to tote still works.";
export const RASTER_EMPTY_LINE = "Nobody taped a raster note yet.";
export const RASTER_LEAVE_LINE = "Leave the food-court";

const SERVER_STORE = Symbol.for("iss.raster-listing-ids");

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

export function parseRasterListingIds(
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

export function rasterCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RASTER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RASTER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RASTER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RASTER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RASTER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRasterListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRasterListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RASTER_STORAGE_KEY);
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
          window.localStorage.setItem(RASTER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRasterListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = rasterCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RASTER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RASTER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RASTER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRasterOverlay(
  listingId: string,
  listingIds: readonly string[] = readRasterListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === RASTER_PACK_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === RASTER_LUT_ID;
}

function isZineListing(listing: Listing) {
  return listing.id === RASTER_ZINE_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === RASTER_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, LUT, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeRaster(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RASTER_HOST_ID) {
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

export type RasterWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "lut"
  | "zine"
  | "chair"
  | "owned";

function refuseRaster(
  listing: Listing | undefined,
): RasterWriteReason | null {
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
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isZineListing(listing)) {
    return "zine";
  }
  if (isOwnedListing(listing) || listing.id !== RASTER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRaster(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRaster(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRaster(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRaster(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRaster(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RASTER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RASTER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RASTER_CHANGED_EVENT, listener);
  };
}
