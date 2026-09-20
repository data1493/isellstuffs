/**
 * I will not bluezone it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Raster is outline-to-bitmap. Gasp is set-the-greys. Gridfit is
 * drop-instructions. Hint is TrueType-instruct. Kern is
 * close-the-pairs. Walkers still want Beats to bluezone it, or
 * “snap the food-court map to shop zones without a shop gasp.”
 * I will not bluezone it. Still two weights. Still almost-bold.
 * Still for sale. Not raster. Not gasp. Not a shop. Not gridfit.
 * Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bluezone-listing-ids` is the client bluezone set.
 * Cookie `iss-bluezone-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write raster, gasp, gridfit, hint, kern, ligature, subset,
 * alignment, overshoot, snap, gift, buy, digital eligibility, or
 * tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Bluezone is snap the zones, not a login. Register stays print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const BLUEZONE_STORAGE_KEY = "iss:bluezone-listing-ids";
export const BLUEZONE_COOKIE_NAME = "iss-bluezone-listing-ids";
export const BLUEZONE_CHANGED_EVENT = "iss:bluezone-changed";

export const BLUEZONE_HOST_ID = "dl-booth-font";
export const BLUEZONE_PACK_ID = "dl-sample-pack";
export const BLUEZONE_PDF_ID = "dl-junk-pricing-pdf";
export const BLUEZONE_LUT_ID = "dl-camera-luts";
export const BLUEZONE_ZINE_ID = "dl-stain-zine";
export const BLUEZONE_LINER_ID = "dl-crate-side-a";
export const BLUEZONE_CHAIR_ID = "ysk-folding-chair";
export const BLUEZONE_GIFT_ID = "dl-mall-gift-card";
export const BLUEZONE_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BLUEZONE_OWNED_IDS = [
  BLUEZONE_PACK_ID,
  BLUEZONE_PDF_ID,
  BLUEZONE_LUT_ID,
  BLUEZONE_ZINE_ID,
  BLUEZONE_LINER_ID,
  "dl-drawer-recipes",
  BLUEZONE_BOY_ID,
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

const ownedSet = new Set<string>(BLUEZONE_OWNED_IDS);

export const BLUEZONE_REFUSE_COPY = "That one does not take a bluezone note.";
export const BLUEZONE_TABLE_LINE = "I will not bluezone it.";
export const BLUEZONE_WEIGHTS_LINE = "Still two weights.";
export const BLUEZONE_BOLD_LINE = "Still almost-bold.";
export const BLUEZONE_NOTICE_TITLE =
  "I will not bluezone it. Still two weights. Still almost-bold.";
export const BLUEZONE_WALK_LINE =
  "Walkers still want Beats to bluezone it, or snap the food-court map to shop zones without a shop gasp.";
export const BLUEZONE_STAYS_LINE =
  "This is the bluezone note. I will not bluezone it. Still two weights. Still almost-bold.";
export const BLUEZONE_STILL_LINE =
  "Still tote. Not raster. Not gasp. Not a shop. Not gridfit. Not an account.";
export const BLUEZONE_TOTE_LINE = "Add to tote still works.";
export const BLUEZONE_EMPTY_LINE = "Nobody taped a bluezone note yet.";
export const BLUEZONE_LEAVE_LINE = "Leave the map";

const SERVER_STORE = Symbol.for("iss.bluezone-listing-ids");

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

export function parseBluezoneListingIds(
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

export function bluezoneCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BLUEZONE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BLUEZONE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BLUEZONE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BLUEZONE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BLUEZONE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBluezoneListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBluezoneListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BLUEZONE_STORAGE_KEY);
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
          window.localStorage.setItem(BLUEZONE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBluezoneListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bluezoneCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BLUEZONE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BLUEZONE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BLUEZONE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBluezoneOverlay(
  listingId: string,
  listingIds: readonly string[] = readBluezoneListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === BLUEZONE_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === BLUEZONE_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === BLUEZONE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeBluezone(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BLUEZONE_HOST_ID) {
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

export type BluezoneWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseBluezone(
  listing: Listing | undefined,
): BluezoneWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== BLUEZONE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBluezone(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBluezone(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBluezone(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBluezone(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBluezone(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BLUEZONE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BLUEZONE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BLUEZONE_CHANGED_EVENT, listener);
  };
}
