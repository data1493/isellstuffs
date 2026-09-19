/**
 * I will not subset it — still two weights. Still an OTF. Still tote.
 *
 * Foundry is two weights. Slant is italic. Bold is third-weight.
 * Ligature is join-the-fi. Variable is one-file. Hint is hinted-OTF.
 * Specimen is glyph-sheet. Walkers still want Beats to subset the
 * directory font, or “cut a webfont so the food-court loads.” I will
 * not subset it. Still two weights. Still an OTF. Still for sale.
 * Not hint. Not ligature. Not a shop. Not variable.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:subset-listing-ids` is the client subset set.
 * Cookie `iss-subset-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foundry, slant, bold, ligature, variable, hint,
 * specimen, icons, quantize, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-booth-font` only. Pack, LUT, gift, zine, physical,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const SUBSET_STORAGE_KEY = "iss:subset-listing-ids";
export const SUBSET_COOKIE_NAME = "iss-subset-listing-ids";
export const SUBSET_CHANGED_EVENT = "iss:subset-changed";

export const SUBSET_HOST_ID = "dl-booth-font";
export const SUBSET_PACK_ID = "dl-sample-pack";
export const SUBSET_LUT_ID = "dl-camera-luts";
export const SUBSET_ZINE_ID = "dl-stain-zine";
export const SUBSET_GIFT_ID = "dl-mall-gift-card";
export const SUBSET_CDR_ID = "ysk-burned-cdr";
export const SUBSET_CHAIR_ID = "ysk-folding-chair";
export const SUBSET_RECIPES_ID = "dl-drawer-recipes";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SUBSET_OWNED_IDS = [
  SUBSET_PACK_ID,
  SUBSET_LUT_ID,
  SUBSET_ZINE_ID,
  SUBSET_RECIPES_ID,
  "dl-junk-pricing-pdf",
  "dl-crate-side-a",
  "gtk-game-boy",
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  SUBSET_CDR_ID,
  "kdr-chipped-mug",
] as const;

const ownedSet = new Set<string>(SUBSET_OWNED_IDS);

export const SUBSET_REFUSE_COPY = "That one does not take a subset note.";
export const SUBSET_TABLE_LINE = "I will not subset it.";
export const SUBSET_WEIGHTS_LINE = "Still two weights.";
export const SUBSET_OTF_LINE = "Still an OTF.";
export const SUBSET_NOTICE_TITLE =
  "I will not subset it. Still two weights. Still an OTF.";
export const SUBSET_WALK_LINE =
  "Walkers still want Beats to subset the directory font, or cut a webfont so the food-court loads.";
export const SUBSET_STAYS_LINE =
  "This is the subset note. I will not subset it. Still two weights. Still an OTF.";
export const SUBSET_STILL_LINE =
  "Still tote. Not hint. Not ligature. Not a shop. Not variable.";
export const SUBSET_TOTE_LINE = "Add to tote still works.";
export const SUBSET_EMPTY_LINE = "Nobody taped a subset note yet.";
export const SUBSET_LEAVE_LINE = "Leave the two weights";

const SERVER_STORE = Symbol.for("iss.subset-listing-ids");

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

export function parseSubsetListingIds(
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

export function subsetCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SUBSET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SUBSET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SUBSET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SUBSET_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SUBSET_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSubsetListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSubsetListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SUBSET_STORAGE_KEY);
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
          window.localStorage.setItem(SUBSET_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSubsetListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = subsetCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SUBSET_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SUBSET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SUBSET_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSubsetOverlay(
  listingId: string,
  listingIds: readonly string[] = readSubsetListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === SUBSET_PACK_ID;
}

function isLutListing(listing: Listing) {
  return listing.id === SUBSET_LUT_ID;
}

function isZineListing(listing: Listing) {
  return listing.id === SUBSET_ZINE_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host booth font only. Pack, LUT, overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeSubset(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SUBSET_HOST_ID) {
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

export type SubsetWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "lut"
  | "zine"
  | "owned";

function refuseSubset(
  listing: Listing | undefined,
): SubsetWriteReason | null {
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
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isZineListing(listing)) {
    return "zine";
  }
  if (isOwnedListing(listing) || listing.id !== SUBSET_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSubset(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSubset(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSubset(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSubset(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSubset(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SUBSET_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SUBSET_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SUBSET_CHANGED_EVENT, listener);
  };
}
