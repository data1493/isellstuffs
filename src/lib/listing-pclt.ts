/**
 * I will not pclt it — still two weights. Still almost-bold.
 * Still tote.
 *
 * Ltsh is drop-the-linear-threshold-table. Opbd is
 * drop-the-optical-bounds-table. Bsln is drop-the-baseline-table.
 * Hmtx is drop-the-horizontal-metrics-table. Cvt is
 * drop-the-control-value-table. Gdef is
 * drop-the-glyph-definition-table. Gsub is
 * drop-the-glyph-substitution-table. Gvar is
 * drop-the-glyph-variation-table. Avar is drop-the-axis-variation-map.
 * Opsz is drop-the-optical-size-axis. Raster is outline-to-bitmap.
 * Gasp is set-the-greys. Gridfit is drop-instructions. Bluezone is
 * drop-the-alignment-zones. Walkers still want Beats to pclt it, or
 * “drop a shop PCL 5 table so the directory sits on a printer without
 * a shop ltsh.” I will not pclt it. Still two weights. Still
 * almost-bold. Still for sale. Not ltsh. Not opbd. Not a shop. Not
 * raster. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pclt-listing-ids` is the client pclt set.
 * Cookie `iss-pclt-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write ltsh, opbd, bsln, hmtx, cvt, gdef, gsub, gvar, avar, opsz,
 * raster, gasp, gridfit, bluezone, hint, kern, ligature, subset, loca,
 * maxp, post, hhea, vmtx, vhea, sbix, trak, mort, feat, dsig, prep,
 * os2, vdmx, hdmx, colr, cvar, hvar, glyf, gpos, cmap, fpgm, mark,
 * jstf, stat, fvar, mvar, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, junk PDF, LUT, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Pclt is drop the PCL 5 table, not a login. Register stays
 * print bars.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const PCLT_STORAGE_KEY = "iss:pclt-listing-ids";
export const PCLT_COOKIE_NAME = "iss-pclt-listing-ids";
export const PCLT_CHANGED_EVENT = "iss:pclt-changed";

export const PCLT_HOST_ID = "dl-booth-font";
export const PCLT_PACK_ID = "dl-sample-pack";
export const PCLT_PDF_ID = "dl-junk-pricing-pdf";
export const PCLT_LUT_ID = "dl-camera-luts";
export const PCLT_ZINE_ID = "dl-stain-zine";
export const PCLT_LINER_ID = "dl-crate-side-a";
export const PCLT_CHAIR_ID = "ysk-folding-chair";
export const PCLT_GIFT_ID = "dl-mall-gift-card";
export const PCLT_BOY_ID = "gtk-game-boy";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PCLT_OWNED_IDS = [
  PCLT_PACK_ID,
  PCLT_PDF_ID,
  PCLT_LUT_ID,
  PCLT_ZINE_ID,
  PCLT_LINER_ID,
  "dl-drawer-recipes",
  PCLT_BOY_ID,
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

const ownedSet = new Set<string>(PCLT_OWNED_IDS);

export const PCLT_REFUSE_COPY = "That one does not take a pclt note.";
export const PCLT_TABLE_LINE = "I will not pclt it.";
export const PCLT_WEIGHTS_LINE = "Still two weights.";
export const PCLT_BOLD_LINE = "Still almost-bold.";
export const PCLT_NOTICE_TITLE =
  "I will not pclt it. Still two weights. Still almost-bold.";
export const PCLT_WALK_LINE =
  "Walkers still want Beats to pclt it, or drop a shop PCL 5 table so the directory sits on a printer without a shop ltsh.";
export const PCLT_STAYS_LINE =
  "This is the pclt note. I will not pclt it. Still two weights. Still almost-bold.";
export const PCLT_STILL_LINE =
  "Still tote. Not ltsh. Not opbd. Not a shop. Not raster. Not an account.";
export const PCLT_TOTE_LINE = "Add to tote still works.";
export const PCLT_EMPTY_LINE = "Nobody taped a pclt note yet.";
export const PCLT_LEAVE_LINE = "Leave the pcl";

const SERVER_STORE = Symbol.for("iss.pclt-listing-ids");

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

export function parsePcltListingIds(
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

export function pcltCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PCLT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PCLT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PCLT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PCLT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PCLT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePcltListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPcltListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PCLT_STORAGE_KEY);
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
          window.localStorage.setItem(PCLT_STORAGE_KEY, JSON.stringify(ids));
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

export function writePcltListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pcltCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PCLT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PCLT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PCLT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPcltOverlay(
  listingId: string,
  listingIds: readonly string[] = readPcltListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === PCLT_PACK_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === PCLT_PDF_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PCLT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, junk PDF, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapePclt(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PCLT_HOST_ID) {
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

export type PcltWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "pdf"
  | "chair"
  | "owned";

function refusePclt(
  listing: Listing | undefined,
): PcltWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PCLT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPclt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePclt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPclt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePclt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePclt(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PCLT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PCLT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PCLT_CHANGED_EVENT, listener);
  };
}
