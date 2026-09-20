/**
 * I will not bsln it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Hmtx is drop-the-horizontal-metrics-table. Cvt is
 * drop-the-control-value-table. Gdef is drop-the-glyph-definition-table.
 * Gsub is drop-the-glyph-substitution-table. Gvar is
 * drop-the-glyph-variation-table. Avar is drop-the-axis-variation-map.
 * Opsz is drop-the-optical-size-axis. Raster is outline-to-bitmap.
 * Gasp is set-the-greys. Gridfit is drop-instructions. Walkers still
 * want Beats to bsln it, or “drop a shop baseline table so the
 * directory sits on the line without a shop hmtx.” I will not bsln it.
 * Still two weights. Still almost-bold. Still for sale. Not hmtx.
 * Not cvt. Not a shop. Not raster. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bsln-listing-ids` is the client bsln set.
 * Cookie `iss-bsln-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hmtx, cvt, gdef, gsub, gvar, avar, opsz, raster, gasp,
 * gridfit, bluezone, hint, kern, ligature, subset, loca, maxp, post,
 * hhea, vmtx, vhea, sbix, trak, mort, feat, dsig, prep, os2, vdmx,
 * hdmx, colr, cvar, hvar, glyf, gpos, cmap, fpgm, mark, jstf, stat,
 * fvar, mvar, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Bsln is drop the baseline table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const BSLN_STORAGE_KEY = "iss:bsln-listing-ids";
export const BSLN_COOKIE_NAME = "iss-bsln-listing-ids";
export const BSLN_CHANGED_EVENT = "iss:bsln-changed";

export const BSLN_HOST_ID = "dl-booth-font";
export const BSLN_PACK_ID = "dl-sample-pack";
export const BSLN_PDF_ID = "dl-junk-pricing-pdf";
export const BSLN_LUT_ID = "dl-camera-luts";
export const BSLN_ZINE_ID = "dl-stain-zine";
export const BSLN_LINER_ID = "dl-crate-side-a";
export const BSLN_CHAIR_ID = "ysk-folding-chair";
export const BSLN_GIFT_ID = "dl-mall-gift-card";
export const BSLN_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BSLN_OWNED_IDS = [
  BSLN_PACK_ID,
  BSLN_PDF_ID,
  BSLN_LUT_ID,
  BSLN_ZINE_ID,
  BSLN_LINER_ID,
  "dl-drawer-recipes",
  BSLN_BOY_ID,
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

const ownedSet = new Set<string>(BSLN_OWNED_IDS);

export const BSLN_REFUSE_COPY = "That one does not take a bsln note.";
export const BSLN_TABLE_LINE = "I will not bsln it.";
export const BSLN_WEIGHTS_LINE = "Still two weights.";
export const BSLN_BOLD_LINE = "Still almost-bold.";
export const BSLN_NOTICE_TITLE =
  "I will not bsln it. Still two weights. Still almost-bold.";
export const BSLN_WALK_LINE =
  "Walkers still want Beats to bsln it, or drop a shop baseline table so the directory sits on the line without a shop hmtx.";
export const BSLN_STAYS_LINE =
  "This is the bsln note. I will not bsln it. Still two weights. Still almost-bold.";
export const BSLN_STILL_LINE =
  "Still tote. Not hmtx. Not cvt. Not a shop. Not raster. Not an account.";
export const BSLN_TOTE_LINE = "Add to tote still works.";
export const BSLN_EMPTY_LINE = "Nobody taped a bsln note yet.";
export const BSLN_LEAVE_LINE = "Leave the baseline";

const SERVER_STORE = Symbol.for("iss.bsln-listing-ids");

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

export function parseBslnListingIds(
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

export function bslnCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BSLN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BSLN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BSLN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BSLN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BSLN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBslnListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBslnListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BSLN_STORAGE_KEY);
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
          window.localStorage.setItem(BSLN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBslnListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bslnCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BSLN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BSLN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BSLN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBslnOverlay(
  listingId: string,
  listingIds: readonly string[] = readBslnListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === BSLN_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === BSLN_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === BSLN_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeBsln(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BSLN_HOST_ID) {
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

export type BslnWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseBsln(
  listing: Listing | undefined,
): BslnWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== BSLN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBsln(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBsln(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBsln(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBsln(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBsln(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BSLN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BSLN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BSLN_CHANGED_EVENT, listener);
  };
}
