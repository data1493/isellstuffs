/**
 * I will not ebdt it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Pclt is drop-the-PCL-5-table. Ltsh is
 * drop-the-linear-threshold-table. Opbd is
 * drop-the-optical-bounds-table. Bsln is drop-the-baseline-table.
 * Hmtx is drop-the-horizontal-metrics-table. Cvt is
 * drop-the-control-value-table. Gdef is
 * drop-the-glyph-definition-table. Gsub is
 * drop-the-glyph-substitution-table. Gvar is
 * drop-the-glyph-variation-table. Avar is drop-the-axis-variation-map.
 * Opsz is drop-the-optical-size-axis. Raster is outline-to-bitmap.
 * Gasp is set-the-greys. Gridfit is drop-instructions. Bluezone is
 * drop-the-alignment-zones. Walkers still want Beats to ebdt it, or
 * “drop shop embedded bitmaps so the directory sits on a printer
 * without a shop pclt.” I will not ebdt it. Still two weights. Still
 * almost-bold. Still for sale. Not pclt. Not ltsh. Not a shop. Not
 * raster. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:ebdt-listing-ids` is the client ebdt set.
 * Cookie `iss-ebdt-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pclt, ltsh, opbd, bsln, hmtx, cvt, gdef, gsub, gvar, avar,
 * opsz, raster, gasp, gridfit, bluezone, hint, kern, ligature, subset,
 * loca, maxp, post, hhea, vmtx, vhea, sbix, trak, mort, feat, dsig, prep,
 * os2, vdmx, hdmx, colr, cvar, hvar, glyf, gpos, cmap, fpgm, mark,
 * jstf, stat, fvar, mvar, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Ebdt is drop the embedded bitmap table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const EBDT_STORAGE_KEY = "iss:ebdt-listing-ids";
export const EBDT_COOKIE_NAME = "iss-ebdt-listing-ids";
export const EBDT_CHANGED_EVENT = "iss:ebdt-changed";

export const EBDT_HOST_ID = "dl-booth-font";
export const EBDT_PACK_ID = "dl-sample-pack";
export const EBDT_PDF_ID = "dl-junk-pricing-pdf";
export const EBDT_LUT_ID = "dl-camera-luts";
export const EBDT_ZINE_ID = "dl-stain-zine";
export const EBDT_LINER_ID = "dl-crate-side-a";
export const EBDT_CHAIR_ID = "ysk-folding-chair";
export const EBDT_GIFT_ID = "dl-mall-gift-card";
export const EBDT_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const EBDT_OWNED_IDS = [
  EBDT_PACK_ID,
  EBDT_PDF_ID,
  EBDT_LUT_ID,
  EBDT_ZINE_ID,
  EBDT_LINER_ID,
  "dl-drawer-recipes",
  EBDT_BOY_ID,
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

const ownedSet = new Set<string>(EBDT_OWNED_IDS);

export const EBDT_REFUSE_COPY = "That one does not take an ebdt note.";
export const EBDT_TABLE_LINE = "I will not ebdt it.";
export const EBDT_WEIGHTS_LINE = "Still two weights.";
export const EBDT_BOLD_LINE = "Still almost-bold.";
export const EBDT_NOTICE_TITLE =
  "I will not ebdt it. Still two weights. Still almost-bold.";
export const EBDT_WALK_LINE =
  "Walkers still want Beats to ebdt it, or drop shop embedded bitmaps so the directory sits on a printer without a shop pclt.";
export const EBDT_STAYS_LINE =
  "This is the ebdt note. I will not ebdt it. Still two weights. Still almost-bold.";
export const EBDT_STILL_LINE =
  "Still tote. Not pclt. Not ltsh. Not a shop. Not raster. Not an account.";
export const EBDT_TOTE_LINE = "Add to tote still works.";
export const EBDT_EMPTY_LINE = "Nobody taped an ebdt note yet.";
export const EBDT_LEAVE_LINE = "Leave the ebd";

const SERVER_STORE = Symbol.for("iss.ebdt-listing-ids");

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

export function parseEbdtListingIds(
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

export function ebdtCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const EBDT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${EBDT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(EBDT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(EBDT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${EBDT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseEbdtListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readEbdtListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(EBDT_STORAGE_KEY);
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
          window.localStorage.setItem(EBDT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeEbdtListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = ebdtCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(EBDT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${EBDT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(EBDT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingEbdtOverlay(
  listingId: string,
  listingIds: readonly string[] = readEbdtListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === EBDT_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === EBDT_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === EBDT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeEbdt(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== EBDT_HOST_ID) {
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

export type EbdtWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseEbdt(
  listing: Listing | undefined,
): EbdtWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== EBDT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingEbdt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseEbdt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingEbdt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseEbdt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeEbdt(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === EBDT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(EBDT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EBDT_CHANGED_EVENT, listener);
  };
}
