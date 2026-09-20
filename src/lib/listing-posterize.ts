/**
 * I will not posterize them — the LUT pack stays three looks, still a parking lot.
 * Still tote.
 *
 * Gamma is curve-the-look. Cube is fourth-.cube. Shaper is 1D-LUT.
 * Grain is 16mm. Convert is Rec.709. Cream stays queued. Scope stays
 * queued. Raster stays the font. Walkers still want Half-Working to
 * posterize them, or “flatten the parking-lot looks to four stops so
 * they print without a shop gamma.” I will not posterize them. Still
 * three looks. Still a parking lot. Still for sale. Not gamma. Not
 * cube. Not a shop. Not shaper. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:posterize-listing-ids` is the client posterize set.
 * Cookie `iss-posterize-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cube, shaper, grain, convert, gamma, cream, scope,
 * raster, varnish, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-camera-luts` only. Pack, font, Game Boy, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Posterize is flatten the looks, not a login. No auth.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const POSTERIZE_STORAGE_KEY = "iss:posterize-listing-ids";
export const POSTERIZE_COOKIE_NAME = "iss-posterize-listing-ids";
export const POSTERIZE_CHANGED_EVENT = "iss:posterize-changed";

export const POSTERIZE_HOST_ID = "dl-camera-luts";
export const POSTERIZE_PACK_ID = "dl-sample-pack";
export const POSTERIZE_FONT_ID = "dl-booth-font";
export const POSTERIZE_BOY_ID = "gtk-game-boy";
export const POSTERIZE_PDF_ID = "dl-junk-pricing-pdf";
export const POSTERIZE_GIFT_ID = "dl-mall-gift-card";
export const POSTERIZE_ZINE_ID = "dl-stain-zine";
export const POSTERIZE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const POSTERIZE_OWNED_IDS = [
  POSTERIZE_PACK_ID,
  POSTERIZE_FONT_ID,
  POSTERIZE_BOY_ID,
  POSTERIZE_PDF_ID,
  "dl-drawer-recipes",
  "dl-crate-side-a",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(POSTERIZE_OWNED_IDS);

export const POSTERIZE_REFUSE_COPY = "That one does not take a posterize note.";
export const POSTERIZE_TABLE_LINE = "I will not posterize them.";
export const POSTERIZE_LOOKS_LINE = "Still three looks.";
export const POSTERIZE_LOT_LINE = "Still a parking lot.";
export const POSTERIZE_NOTICE_TITLE =
  "I will not posterize them. Still three looks. Still a parking lot.";
export const POSTERIZE_WALK_LINE =
  "Walkers still want Half-Working to posterize them, or flatten the parking-lot looks to four stops so they print without a shop gamma.";
export const POSTERIZE_STAYS_LINE =
  "This is the posterize note. I will not posterize them. Still three looks. Still a parking lot.";
export const POSTERIZE_STILL_LINE =
  "Still tote. Not gamma. Not cube. Not a shop. Not shaper. Not an account.";
export const POSTERIZE_TOTE_LINE = "Add to tote still works.";
export const POSTERIZE_EMPTY_LINE = "Nobody taped a posterize note yet.";
export const POSTERIZE_LEAVE_LINE = "Leave the looks";

const SERVER_STORE = Symbol.for("iss.posterize-listing-ids");

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

export function parsePosterizeListingIds(
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

export function posterizeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const POSTERIZE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${POSTERIZE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(POSTERIZE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(POSTERIZE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${POSTERIZE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePosterizeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPosterizeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(POSTERIZE_STORAGE_KEY);
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
          window.localStorage.setItem(POSTERIZE_STORAGE_KEY, JSON.stringify(ids));
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

export function writePosterizeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = posterizeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(POSTERIZE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${POSTERIZE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(POSTERIZE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPosterizeOverlay(
  listingId: string,
  listingIds: readonly string[] = readPosterizeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === POSTERIZE_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === POSTERIZE_FONT_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === POSTERIZE_PDF_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LUT pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapePosterize(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== POSTERIZE_HOST_ID) {
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

export type PosterizeWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "pdf"
  | "owned";

function refusePosterize(
  listing: Listing | undefined,
): PosterizeWriteReason | null {
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
    return "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isOwnedListing(listing) || listing.id !== POSTERIZE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPosterize(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePosterize(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPosterize(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePosterize(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePosterize(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === POSTERIZE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(POSTERIZE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(POSTERIZE_CHANGED_EVENT, listener);
  };
}
