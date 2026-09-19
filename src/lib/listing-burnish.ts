/**
 * I will not burnish it — the pair stays peeling. Still tote.
 *
 * Welt is cobbler-welt. Stitch is cobbler-seam. Sole is no new sole.
 * Cream is polish. Rand is queued. Walkers still want Closet to
 * burnish the edge, or “slick the peel so it looks like a repair.”
 * I will not burnish it. Still a pair. Still peeling. Still for sale.
 * Not welt. Not stitch. Not a shop. Not polish.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:burnish-listing-ids` is the client burnish set.
 * Cookie `iss-burnish-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write welt, stitch, sole, rand, cream, polish, toe, even,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `clo-split-soles` only. Jacket, lamp, font, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BURNISH_STORAGE_KEY = "iss:burnish-listing-ids";
export const BURNISH_COOKIE_NAME = "iss-burnish-listing-ids";
export const BURNISH_CHANGED_EVENT = "iss:burnish-changed";

export const BURNISH_HOST_ID = "clo-split-soles";
export const BURNISH_JACKET_ID = "clo-windbreaker";
export const BURNISH_LAMP_ID = "ysk-wobbly-lamp";
export const BURNISH_FONT_ID = "dl-booth-font";
export const BURNISH_CHAIR_ID = "ysk-folding-chair";
export const BURNISH_GIFT_ID = "dl-mall-gift-card";
export const BURNISH_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BURNISH_OWNED_IDS = [
  BURNISH_JACKET_ID,
  BURNISH_LAMP_ID,
  BURNISH_FONT_ID,
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "kdr-bent-whisk",
  "dl-sample-pack",
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(BURNISH_OWNED_IDS);

export const BURNISH_REFUSE_COPY = "That one does not take a burnish note.";
export const BURNISH_TABLE_LINE = "I will not burnish it.";
export const BURNISH_PAIR_LINE = "Still a pair.";
export const BURNISH_PEEL_LINE = "Still peeling.";
export const BURNISH_NOTICE_TITLE =
  "I will not burnish it. Still a pair. Still peeling.";
export const BURNISH_WALK_LINE =
  "Walkers still want Closet to burnish the edge, or slick the peel so it looks like a repair.";
export const BURNISH_STAYS_LINE =
  "This is the burnish note. I will not burnish it. Still a pair. Still peeling.";
export const BURNISH_STILL_LINE =
  "Still tote. Not welt. Not stitch. Not a shop. Not polish.";
export const BURNISH_TOTE_LINE = "Add to tote still works.";
export const BURNISH_EMPTY_LINE = "Nobody taped a burnish note yet.";
export const BURNISH_LEAVE_LINE = "Leave the peel";

const SERVER_STORE = Symbol.for("iss.burnish-listing-ids");

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

export function parseBurnishListingIds(
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

export function burnishCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BURNISH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BURNISH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BURNISH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BURNISH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BURNISH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBurnishListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBurnishListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BURNISH_STORAGE_KEY);
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
          window.localStorage.setItem(BURNISH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBurnishListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = burnishCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BURNISH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BURNISH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BURNISH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBurnishOverlay(
  listingId: string,
  listingIds: readonly string[] = readBurnishListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host split-soles only. Overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBurnish(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BURNISH_HOST_ID) {
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

export type BurnishWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "owned";

function refuseBurnish(
  listing: Listing | undefined,
): BurnishWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== BURNISH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBurnish(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBurnish(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBurnish(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBurnish(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBurnish(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BURNISH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BURNISH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BURNISH_CHANGED_EVENT, listener);
  };
}
