/**
 * I will not gvar it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Avar is drop-the-axis-variation-map. Opsz is drop-the-optical-size-axis.
 * Raster is outline-to-bitmap. Gasp is set-the-greys. Gridfit is
 * drop-instructions. Walkers still want Beats to gvar it, or “drop a
 * shop glyph-variation table so the directory grades without a shop
 * avar.” I will not gvar it. Still two weights. Still almost-bold.
 * Still for sale. Not avar. Not opsz. Not a shop. Not raster. Not
 * an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:gvar-listing-ids` is the client gvar set.
 * Cookie `iss-gvar-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write avar, opsz, raster, gasp, gridfit, bluezone, hint, kern,
 * ligature, subset, cvar, hvar, glyf, gift, buy, digital eligibility,
 * or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Gvar is drop the glyph-variation table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const GVAR_STORAGE_KEY = "iss:gvar-listing-ids";
export const GVAR_COOKIE_NAME = "iss-gvar-listing-ids";
export const GVAR_CHANGED_EVENT = "iss:gvar-changed";

export const GVAR_HOST_ID = "dl-booth-font";
export const GVAR_PACK_ID = "dl-sample-pack";
export const GVAR_PDF_ID = "dl-junk-pricing-pdf";
export const GVAR_LUT_ID = "dl-camera-luts";
export const GVAR_ZINE_ID = "dl-stain-zine";
export const GVAR_LINER_ID = "dl-crate-side-a";
export const GVAR_CHAIR_ID = "ysk-folding-chair";
export const GVAR_GIFT_ID = "dl-mall-gift-card";
export const GVAR_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GVAR_OWNED_IDS = [
  GVAR_PACK_ID,
  GVAR_PDF_ID,
  GVAR_LUT_ID,
  GVAR_ZINE_ID,
  GVAR_LINER_ID,
  "dl-drawer-recipes",
  GVAR_BOY_ID,
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

const ownedSet = new Set<string>(GVAR_OWNED_IDS);

export const GVAR_REFUSE_COPY = "That one does not take a gvar note.";
export const GVAR_TABLE_LINE = "I will not gvar it.";
export const GVAR_WEIGHTS_LINE = "Still two weights.";
export const GVAR_BOLD_LINE = "Still almost-bold.";
export const GVAR_NOTICE_TITLE =
  "I will not gvar it. Still two weights. Still almost-bold.";
export const GVAR_WALK_LINE =
  "Walkers still want Beats to gvar it, or drop a shop glyph-variation table so the directory grades without a shop avar.";
export const GVAR_STAYS_LINE =
  "This is the gvar note. I will not gvar it. Still two weights. Still almost-bold.";
export const GVAR_STILL_LINE =
  "Still tote. Not avar. Not opsz. Not a shop. Not raster. Not an account.";
export const GVAR_TOTE_LINE = "Add to tote still works.";
export const GVAR_EMPTY_LINE = "Nobody taped a gvar note yet.";
export const GVAR_LEAVE_LINE = "Leave the glyphs";

const SERVER_STORE = Symbol.for("iss.gvar-listing-ids");

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

export function parseGvarListingIds(
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

export function gvarCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GVAR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GVAR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GVAR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GVAR_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GVAR_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGvarListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGvarListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GVAR_STORAGE_KEY);
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
          window.localStorage.setItem(GVAR_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGvarListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = gvarCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GVAR_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GVAR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GVAR_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGvarOverlay(
  listingId: string,
  listingIds: readonly string[] = readGvarListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === GVAR_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === GVAR_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GVAR_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeGvar(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GVAR_HOST_ID) {
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

export type GvarWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseGvar(
  listing: Listing | undefined,
): GvarWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== GVAR_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGvar(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGvar(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGvar(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGvar(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGvar(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GVAR_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GVAR_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GVAR_CHANGED_EVENT, listener);
  };
}
