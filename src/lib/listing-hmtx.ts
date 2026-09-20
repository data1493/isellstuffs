/**
 * I will not hmtx it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Cvt is drop-the-control-value-table. Gdef is drop-the-glyph-definition-table.
 * Gsub is drop-the-glyph-substitution-table. Gvar is drop-the-glyph-variation-table.
 * Avar is drop-the-axis-variation-map. Opsz is drop-the-optical-size-axis.
 * Raster is outline-to-bitmap. Gasp is set-the-greys. Gridfit is drop-instructions.
 * Walkers still want Beats to hmtx it, or “drop a shop horizontal-metrics table
 * so the directory advances without a shop cvt.” I will not hmtx it. Still two
 * weights. Still almost-bold. Still for sale. Not cvt. Not gdef. Not a shop.
 * Not raster. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hmtx-listing-ids` is the client hmtx set.
 * Cookie `iss-hmtx-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cvt, gdef, gsub, gvar, avar, opsz, raster, gasp, gridfit,
 * bluezone, hint, kern, ligature, subset, loca, maxp, post, hhea, vmtx,
 * vhea, sbix, trak, mort, feat, dsig, prep, os2, vdmx, hdmx, colr, cvar,
 * hvar, glyf, gpos, cmap, fpgm, mark, jstf, stat, fvar, mvar, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Hmtx is drop the horizontal-metrics table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const HMTX_STORAGE_KEY = "iss:hmtx-listing-ids";
export const HMTX_COOKIE_NAME = "iss-hmtx-listing-ids";
export const HMTX_CHANGED_EVENT = "iss:hmtx-changed";

export const HMTX_HOST_ID = "dl-booth-font";
export const HMTX_PACK_ID = "dl-sample-pack";
export const HMTX_PDF_ID = "dl-junk-pricing-pdf";
export const HMTX_LUT_ID = "dl-camera-luts";
export const HMTX_ZINE_ID = "dl-stain-zine";
export const HMTX_LINER_ID = "dl-crate-side-a";
export const HMTX_CHAIR_ID = "ysk-folding-chair";
export const HMTX_GIFT_ID = "dl-mall-gift-card";
export const HMTX_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const HMTX_OWNED_IDS = [
  HMTX_PACK_ID,
  HMTX_PDF_ID,
  HMTX_LUT_ID,
  HMTX_ZINE_ID,
  HMTX_LINER_ID,
  "dl-drawer-recipes",
  HMTX_BOY_ID,
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

const ownedSet = new Set<string>(HMTX_OWNED_IDS);

export const HMTX_REFUSE_COPY = "That one does not take a hmtx note.";
export const HMTX_TABLE_LINE = "I will not hmtx it.";
export const HMTX_WEIGHTS_LINE = "Still two weights.";
export const HMTX_BOLD_LINE = "Still almost-bold.";
export const HMTX_NOTICE_TITLE =
  "I will not hmtx it. Still two weights. Still almost-bold.";
export const HMTX_WALK_LINE =
  "Walkers still want Beats to hmtx it, or drop a shop horizontal-metrics table so the directory advances without a shop cvt.";
export const HMTX_STAYS_LINE =
  "This is the hmtx note. I will not hmtx it. Still two weights. Still almost-bold.";
export const HMTX_STILL_LINE =
  "Still tote. Not cvt. Not gdef. Not a shop. Not raster. Not an account.";
export const HMTX_TOTE_LINE = "Add to tote still works.";
export const HMTX_EMPTY_LINE = "Nobody taped a hmtx note yet.";
export const HMTX_LEAVE_LINE = "Leave the advances";

const SERVER_STORE = Symbol.for("iss.hmtx-listing-ids");

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

export function parseHmtxListingIds(
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

export function hmtxCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HMTX_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HMTX_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HMTX_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HMTX_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HMTX_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHmtxListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHmtxListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HMTX_STORAGE_KEY);
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
          window.localStorage.setItem(HMTX_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHmtxListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = hmtxCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HMTX_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HMTX_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HMTX_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHmtxOverlay(
  listingId: string,
  listingIds: readonly string[] = readHmtxListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === HMTX_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === HMTX_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === HMTX_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeHmtx(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== HMTX_HOST_ID) {
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

export type HmtxWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseHmtx(
  listing: Listing | undefined,
): HmtxWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== HMTX_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingHmtx(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHmtx(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingHmtx(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHmtx(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeHmtx(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HMTX_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HMTX_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HMTX_CHANGED_EVENT, listener);
  };
}
