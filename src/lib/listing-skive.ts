/**
 * I will not skive it — the pair stays peeling. Still tote.
 *
 * Welt is cobbler-welt. Stitch is cobbler-seam. Burnish is edge-slick.
 * Rand stays queued. Toe is the peel stays. Walkers still want Closet
 * to skive the peel, or thin the edge so a welt would take. I will
 * not skive it. Still peeling. Still a pair. Still for sale. Not welt.
 * Not stitch. Not burnish. Not rand.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:skive-listing-ids` is the client skive set.
 * Cookie `iss-skive-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write welt, stitch, burnish, rand, toe, tumble, ricer, ream,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `clo-split-soles` only. Jacket, font, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SKIVE_STORAGE_KEY = "iss:skive-listing-ids";
export const SKIVE_COOKIE_NAME = "iss-skive-listing-ids";
export const SKIVE_CHANGED_EVENT = "iss:skive-changed";

export const SKIVE_HOST_ID = "clo-split-soles";
export const SKIVE_JACKET_ID = "clo-windbreaker";
export const SKIVE_FONT_ID = "dl-booth-font";
export const SKIVE_CHAIR_ID = "ysk-folding-chair";
export const SKIVE_GIFT_ID = "dl-mall-gift-card";
export const SKIVE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SKIVE_OWNED_IDS = [
  SKIVE_JACKET_ID,
  SKIVE_FONT_ID,
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "kdr-bent-whisk",
  "dl-sample-pack",
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(SKIVE_OWNED_IDS);

export const SKIVE_REFUSE_COPY = "That one does not take a skive note.";
export const SKIVE_TABLE_LINE = "I will not skive it.";
export const SKIVE_PEEL_LINE = "Still peeling.";
export const SKIVE_PAIR_LINE = "Still a pair.";
export const SKIVE_NOTICE_TITLE =
  "I will not skive it. Still peeling. Still a pair.";
export const SKIVE_WALK_LINE =
  "Walkers still want Closet to skive the peel, or thin the edge so a welt would take.";
export const SKIVE_STAYS_LINE =
  "This is the skive note. I will not skive it. Still peeling. Still a pair.";
export const SKIVE_STILL_LINE =
  "Still tote. Not welt. Not stitch. Not burnish.";
export const SKIVE_TOTE_LINE = "Add to tote still works.";
export const SKIVE_EMPTY_LINE = "Nobody taped a skive note yet.";
export const SKIVE_LEAVE_LINE = "Leave the split";

const SERVER_STORE = Symbol.for("iss.skive-listing-ids");

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

export function parseSkiveListingIds(
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

export function skiveCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SKIVE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SKIVE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SKIVE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SKIVE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SKIVE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSkiveListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSkiveListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SKIVE_STORAGE_KEY);
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
          window.localStorage.setItem(SKIVE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSkiveListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = skiveCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SKIVE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SKIVE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SKIVE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSkiveOverlay(
  listingId: string,
  listingIds: readonly string[] = readSkiveListingIds(),
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
export function canTapeSkive(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SKIVE_HOST_ID) {
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

export type SkiveWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "owned";

function refuseSkive(listing: Listing | undefined): SkiveWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== SKIVE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSkive(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSkive(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSkive(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSkive(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSkive(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SKIVE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SKIVE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SKIVE_CHANGED_EVENT, listener);
  };
}
