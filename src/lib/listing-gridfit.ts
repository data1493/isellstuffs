/**
 * I will not gridfit it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Raster is outline-to-bitmap. Kern is close-the-pairs. Hint is
 * TrueType-instruct. Ligature is join-the-fi. Walkers still want
 * Beats to gridfit it, or “drop instructions so the food-court map
 * snaps shop-sharp without a shop raster.” I will not gridfit it.
 * Still two weights. Still almost-bold. Still for sale. Not raster.
 * Not kern. Not a shop. Not hint. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gridfit-listing-ids` is the client gridfit set.
 * Cookie `iss-gridfit-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write raster, kern, hint, ligature, subset, autohint, delta,
 * instruct, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Gridfit is hint the pixels, not a login. Register stays print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GRIDFIT_STORAGE_KEY = "iss:gridfit-listing-ids";
export const GRIDFIT_COOKIE_NAME = "iss-gridfit-listing-ids";
export const GRIDFIT_CHANGED_EVENT = "iss:gridfit-changed";

export const GRIDFIT_HOST_ID = "dl-booth-font";
export const GRIDFIT_PACK_ID = "dl-sample-pack";
export const GRIDFIT_PDF_ID = "dl-junk-pricing-pdf";
export const GRIDFIT_LUT_ID = "dl-camera-luts";
export const GRIDFIT_ZINE_ID = "dl-stain-zine";
export const GRIDFIT_LINER_ID = "dl-crate-side-a";
export const GRIDFIT_CHAIR_ID = "ysk-folding-chair";
export const GRIDFIT_GIFT_ID = "dl-mall-gift-card";
export const GRIDFIT_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GRIDFIT_OWNED_IDS = [
  GRIDFIT_PACK_ID,
  GRIDFIT_PDF_ID,
  GRIDFIT_LUT_ID,
  GRIDFIT_ZINE_ID,
  GRIDFIT_LINER_ID,
  "dl-drawer-recipes",
  GRIDFIT_BOY_ID,
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

const ownedSet = new Set<string>(GRIDFIT_OWNED_IDS);

export const GRIDFIT_REFUSE_COPY = "That one does not take a gridfit note.";
export const GRIDFIT_TABLE_LINE = "I will not gridfit it.";
export const GRIDFIT_WEIGHTS_LINE = "Still two weights.";
export const GRIDFIT_BOLD_LINE = "Still almost-bold.";
export const GRIDFIT_NOTICE_TITLE =
  "I will not gridfit it. Still two weights. Still almost-bold.";
export const GRIDFIT_WALK_LINE =
  "Walkers still want Beats to gridfit it, or drop instructions so the food-court map snaps shop-sharp without a shop raster.";
export const GRIDFIT_STAYS_LINE =
  "This is the gridfit note. I will not gridfit it. Still two weights. Still almost-bold.";
export const GRIDFIT_STILL_LINE =
  "Still tote. Not raster. Not kern. Not a shop. Not hint.";
export const GRIDFIT_TOTE_LINE = "Add to tote still works.";
export const GRIDFIT_EMPTY_LINE = "Nobody taped a gridfit note yet.";
export const GRIDFIT_LEAVE_LINE = "Leave the map";

const SERVER_STORE = Symbol.for("iss.gridfit-listing-ids");

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

export function parseGridfitListingIds(
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

export function gridfitCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GRIDFIT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GRIDFIT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GRIDFIT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GRIDFIT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GRIDFIT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGridfitListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGridfitListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GRIDFIT_STORAGE_KEY);
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
          window.localStorage.setItem(GRIDFIT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGridfitListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gridfitCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GRIDFIT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GRIDFIT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GRIDFIT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGridfitOverlay(
  listingId: string,
  listingIds: readonly string[] = readGridfitListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === GRIDFIT_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === GRIDFIT_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GRIDFIT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGridfit(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GRIDFIT_HOST_ID) {
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

export type GridfitWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseGridfit(
  listing: Listing | undefined,
): GridfitWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== GRIDFIT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGridfit(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGridfit(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGridfit(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGridfit(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGridfit(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GRIDFIT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GRIDFIT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GRIDFIT_CHANGED_EVENT, listener);
  };
}
