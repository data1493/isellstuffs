/**
 * I will not cvt it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Gdef is drop-the-glyph-definition-table. Gsub is drop-the-glyph-substitution-table.
 * Gvar is drop-the-glyph-variation-table. Avar is drop-the-axis-variation-map.
 * Opsz is drop-the-optical-size-axis. Raster is outline-to-bitmap. Gasp is
 * set-the-greys. Gridfit is drop-instructions. Walkers still want Beats to
 * cvt it, or “drop a shop control-value table so the directory hints without
 * a shop gdef.” I will not cvt it. Still two weights. Still almost-bold.
 * Still for sale. Not gdef. Not gsub. Not a shop. Not raster. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:cvt-listing-ids` is the client cvt set.
 * Cookie `iss-cvt-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write gdef, gsub, gvar, avar, opsz, raster, gasp, gridfit, bluezone,
 * hint, kern, ligature, subset, prep, os2, vdmx, hdmx, colr, cvar, hvar,
 * glyf, gpos, cmap, fpgm, mark, jstf, stat, fvar, mvar, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Cvt is drop the control-value table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const CVT_STORAGE_KEY = "iss:cvt-listing-ids";
export const CVT_COOKIE_NAME = "iss-cvt-listing-ids";
export const CVT_CHANGED_EVENT = "iss:cvt-changed";

export const CVT_HOST_ID = "dl-booth-font";
export const CVT_PACK_ID = "dl-sample-pack";
export const CVT_PDF_ID = "dl-junk-pricing-pdf";
export const CVT_LUT_ID = "dl-camera-luts";
export const CVT_ZINE_ID = "dl-stain-zine";
export const CVT_LINER_ID = "dl-crate-side-a";
export const CVT_CHAIR_ID = "ysk-folding-chair";
export const CVT_GIFT_ID = "dl-mall-gift-card";
export const CVT_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const CVT_OWNED_IDS = [
  CVT_PACK_ID,
  CVT_PDF_ID,
  CVT_LUT_ID,
  CVT_ZINE_ID,
  CVT_LINER_ID,
  "dl-drawer-recipes",
  CVT_BOY_ID,
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

const ownedSet = new Set<string>(CVT_OWNED_IDS);

export const CVT_REFUSE_COPY = "That one does not take a cvt note.";
export const CVT_TABLE_LINE = "I will not cvt it.";
export const CVT_WEIGHTS_LINE = "Still two weights.";
export const CVT_BOLD_LINE = "Still almost-bold.";
export const CVT_NOTICE_TITLE =
  "I will not cvt it. Still two weights. Still almost-bold.";
export const CVT_WALK_LINE =
  "Walkers still want Beats to cvt it, or drop a shop control-value table so the directory hints without a shop gdef.";
export const CVT_STAYS_LINE =
  "This is the cvt note. I will not cvt it. Still two weights. Still almost-bold.";
export const CVT_STILL_LINE =
  "Still tote. Not gdef. Not gsub. Not a shop. Not raster. Not an account.";
export const CVT_TOTE_LINE = "Add to tote still works.";
export const CVT_EMPTY_LINE = "Nobody taped a cvt note yet.";
export const CVT_LEAVE_LINE = "Leave the values";

const SERVER_STORE = Symbol.for("iss.cvt-listing-ids");

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

export function parseCvtListingIds(
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

export function cvtCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CVT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CVT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CVT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CVT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CVT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCvtListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCvtListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CVT_STORAGE_KEY);
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
          window.localStorage.setItem(CVT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCvtListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = cvtCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CVT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CVT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CVT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCvtOverlay(
  listingId: string,
  listingIds: readonly string[] = readCvtListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === CVT_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === CVT_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === CVT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeCvt(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== CVT_HOST_ID) {
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

export type CvtWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseCvt(
  listing: Listing | undefined,
): CvtWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== CVT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCvt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCvt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCvt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCvt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCvt(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CVT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CVT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CVT_CHANGED_EVENT, listener);
  };
}
