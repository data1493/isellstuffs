/**
 * I will not opbd it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Bsln is drop-the-baseline-table. Hmtx is
 * drop-the-horizontal-metrics-table. Cvt is
 * drop-the-control-value-table. Gdef is drop-the-glyph-definition-table.
 * Gsub is drop-the-glyph-substitution-table. Gvar is
 * drop-the-glyph-variation-table. Avar is drop-the-axis-variation-map.
 * Opsz is drop-the-optical-size-axis. Raster is outline-to-bitmap.
 * Gasp is set-the-greys. Gridfit is drop-instructions. Walkers still
 * want Beats to opbd it, or “drop a shop optical-bounds table so the
 * directory sits without a shop bsln.” I will not opbd it.
 * Still two weights. Still almost-bold. Still for sale. Not bsln.
 * Not hmtx. Not a shop. Not raster. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:opbd-listing-ids` is the client opbd set.
 * Cookie `iss-opbd-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bsln, hmtx, cvt, gdef, gsub, gvar, avar, opsz, raster,
 * gasp, gridfit, bluezone, hint, kern, ligature, subset, loca, maxp,
 * post, hhea, vmtx, vhea, sbix, trak, mort, feat, dsig, prep, os2,
 * vdmx, hdmx, colr, cvar, hvar, glyf, gpos, cmap, fpgm, mark, jstf,
 * stat, fvar, mvar, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Opbd is drop the optical-bounds table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const OPBD_STORAGE_KEY = "iss:opbd-listing-ids";
export const OPBD_COOKIE_NAME = "iss-opbd-listing-ids";
export const OPBD_CHANGED_EVENT = "iss:opbd-changed";

export const OPBD_HOST_ID = "dl-booth-font";
export const OPBD_PACK_ID = "dl-sample-pack";
export const OPBD_PDF_ID = "dl-junk-pricing-pdf";
export const OPBD_LUT_ID = "dl-camera-luts";
export const OPBD_ZINE_ID = "dl-stain-zine";
export const OPBD_LINER_ID = "dl-crate-side-a";
export const OPBD_CHAIR_ID = "ysk-folding-chair";
export const OPBD_GIFT_ID = "dl-mall-gift-card";
export const OPBD_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const OPBD_OWNED_IDS = [
  OPBD_PACK_ID,
  OPBD_PDF_ID,
  OPBD_LUT_ID,
  OPBD_ZINE_ID,
  OPBD_LINER_ID,
  "dl-drawer-recipes",
  OPBD_BOY_ID,
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

const ownedSet = new Set<string>(OPBD_OWNED_IDS);

export const OPBD_REFUSE_COPY = "That one does not take an opbd note.";
export const OPBD_TABLE_LINE = "I will not opbd it.";
export const OPBD_WEIGHTS_LINE = "Still two weights.";
export const OPBD_BOLD_LINE = "Still almost-bold.";
export const OPBD_NOTICE_TITLE =
  "I will not opbd it. Still two weights. Still almost-bold.";
export const OPBD_WALK_LINE =
  "Walkers still want Beats to opbd it, or drop a shop optical-bounds table so the directory sits without a shop bsln.";
export const OPBD_STAYS_LINE =
  "This is the opbd note. I will not opbd it. Still two weights. Still almost-bold.";
export const OPBD_STILL_LINE =
  "Still tote. Not bsln. Not hmtx. Not a shop. Not raster. Not an account.";
export const OPBD_TOTE_LINE = "Add to tote still works.";
export const OPBD_EMPTY_LINE = "Nobody taped an opbd note yet.";
export const OPBD_LEAVE_LINE = "Leave the bounds";

const SERVER_STORE = Symbol.for("iss.opbd-listing-ids");

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

export function parseOpbdListingIds(
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

export function opbdCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const OPBD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${OPBD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(OPBD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(OPBD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${OPBD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseOpbdListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readOpbdListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(OPBD_STORAGE_KEY);
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
          window.localStorage.setItem(OPBD_STORAGE_KEY, JSON.stringify(ids));
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

export function writeOpbdListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = opbdCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(OPBD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${OPBD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(OPBD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingOpbdOverlay(
  listingId: string,
  listingIds: readonly string[] = readOpbdListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === OPBD_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === OPBD_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === OPBD_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeOpbd(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== OPBD_HOST_ID) {
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

export type OpbdWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refuseOpbd(
  listing: Listing | undefined,
): OpbdWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== OPBD_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingOpbd(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOpbd(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingOpbd(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseOpbd(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeOpbd(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === OPBD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(OPBD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(OPBD_CHANGED_EVENT, listener);
  };
}
