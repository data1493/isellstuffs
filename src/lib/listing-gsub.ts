/**
 * I will not gsub it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Gvar is drop-the-glyph-variation-table. Avar is drop-the-axis-variation-map.
 * Opsz is drop-the-optical-size-axis. Raster is outline-to-bitmap. Gasp is
 * set-the-greys. Gridfit is drop-instructions. Walkers still want Beats to
 * gsub it, or “drop a shop glyph-substitution table so the directory
 * ligates without a shop gvar.” I will not gsub it. Still two weights.
 * Still almost-bold. Still for sale. Not gvar. Not avar. Not a shop.
 * Not raster. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gsub-listing-ids` is the client gsub set.
 * Cookie `iss-gsub-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write gvar, avar, opsz, raster, gasp, gridfit, bluezone, hint,
 * kern, ligature, subset, cvar, hvar, glyf, gpos, cmap, fpgm, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Gsub is drop the glyph-substitution table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GSUB_STORAGE_KEY = "iss:gsub-listing-ids";
export const GSUB_COOKIE_NAME = "iss-gsub-listing-ids";
export const GSUB_CHANGED_EVENT = "iss:gsub-changed";

export const GSUB_HOST_ID = "dl-booth-font";
export const GSUB_PACK_ID = "dl-sample-pack";
export const GSUB_PDF_ID = "dl-junk-pricing-pdf";
export const GSUB_LUT_ID = "dl-camera-luts";
export const GSUB_ZINE_ID = "dl-stain-zine";
export const GSUB_LINER_ID = "dl-crate-side-a";
export const GSUB_CHAIR_ID = "ysk-folding-chair";
export const GSUB_GIFT_ID = "dl-mall-gift-card";
export const GSUB_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GSUB_OWNED_IDS = [
  GSUB_PACK_ID,
  GSUB_PDF_ID,
  GSUB_LUT_ID,
  GSUB_ZINE_ID,
  GSUB_LINER_ID,
  "dl-drawer-recipes",
  GSUB_BOY_ID,
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

const ownedSet = new Set<string>(GSUB_OWNED_IDS);

export const GSUB_REFUSE_COPY = "That one does not take a gsub note.";
export const GSUB_TABLE_LINE = "I will not gsub it.";
export const GSUB_WEIGHTS_LINE = "Still two weights.";
export const GSUB_BOLD_LINE = "Still almost-bold.";
export const GSUB_NOTICE_TITLE =
  "I will not gsub it. Still two weights. Still almost-bold.";
export const GSUB_WALK_LINE =
  "Walkers still want Beats to gsub it, or drop a shop glyph-substitution table so the directory ligates without a shop gvar.";
export const GSUB_STAYS_LINE =
  "This is the gsub note. I will not gsub it. Still two weights. Still almost-bold.";
export const GSUB_STILL_LINE =
  "Still tote. Not gvar. Not avar. Not a shop. Not raster. Not an account.";
export const GSUB_TOTE_LINE = "Add to tote still works.";
export const GSUB_EMPTY_LINE = "Nobody taped a gsub note yet.";
export const GSUB_LEAVE_LINE = "Leave the otf";

const SERVER_STORE = Symbol.for("iss.gsub-listing-ids");

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

export function parseGsubListingIds(
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

export function gsubCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GSUB_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GSUB_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GSUB_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GSUB_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GSUB_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGsubListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGsubListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GSUB_STORAGE_KEY);
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
          window.localStorage.setItem(GSUB_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGsubListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gsubCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GSUB_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GSUB_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GSUB_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGsubOverlay(
  listingId: string,
  listingIds: readonly string[] = readGsubListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === GSUB_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === GSUB_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GSUB_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGsub(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GSUB_HOST_ID) {
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

export type GsubWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseGsub(
  listing: Listing | undefined,
): GsubWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== GSUB_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGsub(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGsub(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGsub(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGsub(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGsub(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GSUB_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GSUB_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GSUB_CHANGED_EVENT, listener);
  };
}
