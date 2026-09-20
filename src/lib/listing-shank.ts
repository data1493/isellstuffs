/**
 * I will not shank them — the pair stays a flex. Still original laces.
 *
 * Edge is paint-the-peel. Skive is thin-the-peel. Welt is cobbler-seam.
 * Last is cobbler-last. Walkers still want Closet to shank them, or
 * set a steel so the split walks without a shop welt. I will not
 * shank them. Still a flex. Still original laces. Still for sale.
 * Not edge. Not skive. Not a shop. Not welt.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:shank-listing-ids` is the client shank set.
 * Cookie `iss-shank-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write edge, skive, welt, stitch, cream, rand, foxing, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `clo-split-soles` only. Jacket, lid, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SHANK_STORAGE_KEY = "iss:shank-listing-ids";
export const SHANK_COOKIE_NAME = "iss-shank-listing-ids";
export const SHANK_CHANGED_EVENT = "iss:shank-changed";

export const SHANK_HOST_ID = "clo-split-soles";
export const SHANK_JACKET_ID = "clo-windbreaker";
export const SHANK_LID_ID = "kdr-lid-no-pot";
export const SHANK_RECIPES_ID = "dl-drawer-recipes";
export const SHANK_CHAIR_ID = "ysk-folding-chair";
export const SHANK_GIFT_ID = "dl-mall-gift-card";
export const SHANK_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SHANK_OWNED_IDS = [
  SHANK_JACKET_ID,
  SHANK_LID_ID,
  SHANK_RECIPES_ID,
  "dl-booth-font",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "dl-sample-pack",
  "dl-junk-pricing-pdf",
  "dl-camera-luts",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(SHANK_OWNED_IDS);

export const SHANK_REFUSE_COPY = "That one does not take a shank note.";
export const SHANK_TABLE_LINE = "I will not shank them.";
export const SHANK_FLEX_LINE = "Still a flex.";
export const SHANK_LACES_LINE = "Still original laces.";
export const SHANK_NOTICE_TITLE =
  "I will not shank them. Still a flex. Still original laces.";
export const SHANK_WALK_LINE =
  "Walkers still want Closet to shank them, or set a steel so the split walks without a shop welt.";
export const SHANK_STAYS_LINE =
  "This is the shank note. I will not shank them. Still a flex. Still original laces.";
export const SHANK_STILL_LINE =
  "Still tote. Not edge. Not skive. Not a shop. Not welt.";
export const SHANK_TOTE_LINE = "Add to tote still works.";
export const SHANK_EMPTY_LINE = "Nobody taped a shank note yet.";
export const SHANK_LEAVE_LINE = "Leave the flex";

const SERVER_STORE = Symbol.for("iss.shank-listing-ids");

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

export function parseShankListingIds(
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

export function shankCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SHANK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SHANK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SHANK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SHANK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SHANK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseShankListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readShankListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SHANK_STORAGE_KEY);
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
          window.localStorage.setItem(SHANK_STORAGE_KEY, JSON.stringify(ids));
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

export function writeShankListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = shankCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SHANK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SHANK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SHANK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingShankOverlay(
  listingId: string,
  listingIds: readonly string[] = readShankListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isJacketListing(listing: Listing) {
  return listing.id === SHANK_JACKET_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === SHANK_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SHANK_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host split-soles only. Overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeShank(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SHANK_HOST_ID) {
    return false;
  }
  if (!isPhysicalListing(listing)) {
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

export type ShankWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "jacket"
  | "lid"
  | "chair"
  | "owned";

function refuseShank(listing: Listing | undefined): ShankWriteReason | null {
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
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isJacketListing(listing)) {
    return "jacket";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== SHANK_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingShank(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseShank(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingShank(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseShank(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeShank(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SHANK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SHANK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SHANK_CHANGED_EVENT, listener);
  };
}
