/**
 * I will not flock them — the jewels stay empty. Still tote.
 *
 * Foam is the rattle-pad. Nest is Civic-seat. Tray is nicer-jewel.
 * Hinge is the snapped one. Fill is put-a-movie-in. Gum is stickers.
 * Walkers still want Sunday Crate to flock the empty cases, or
 * “suede the trays so they look like a shop.” I will not flock
 * them. Still empty. Still one crack. Still for sale. Not foam.
 * Not nest. Not a shop. Not tray.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:flock-listing-ids` is the client flock set.
 * Cookie `iss-flock-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foam, nest, tray, hinge, cases, inside, fill, gum,
 * sort, felt, brush, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-jewel-stack` only. LP, mixtape, CD-R, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FLOCK_STORAGE_KEY = "iss:flock-listing-ids";
export const FLOCK_COOKIE_NAME = "iss-flock-listing-ids";
export const FLOCK_CHANGED_EVENT = "iss:flock-changed";

export const FLOCK_HOST_ID = "mdb-jewel-stack";
export const FLOCK_LP_ID = "mdb-scratched-lp";
export const FLOCK_MIXTAPE_ID = "mdb-mixtape-93";
export const FLOCK_CDR_ID = "ysk-burned-cdr";
export const FLOCK_CHAIR_ID = "ysk-folding-chair";
export const FLOCK_PACK_ID = "dl-sample-pack";
export const FLOCK_GIFT_ID = "dl-mall-gift-card";
export const FLOCK_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const FLOCK_OWNED_IDS = [
  FLOCK_LP_ID,
  FLOCK_MIXTAPE_ID,
  FLOCK_CDR_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "dl-booth-font",
  FLOCK_PACK_ID,
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "dl-junk-pricing-pdf",
] as const;

const ownedSet = new Set<string>(FLOCK_OWNED_IDS);

export const FLOCK_REFUSE_COPY = "That one does not take a flock note.";
export const FLOCK_TABLE_LINE = "I will not flock them.";
export const FLOCK_EMPTY_CASES_LINE = "Still empty.";
export const FLOCK_CRACK_LINE = "Still one crack.";
export const FLOCK_NOTICE_TITLE =
  "I will not flock them. Still empty. Still one crack.";
export const FLOCK_WALK_LINE =
  "Walkers still want Sunday Crate to flock the empty cases, or suede the trays so they look like a shop.";
export const FLOCK_STAYS_LINE =
  "This is the flock note. I will not flock them. Still empty. Still one crack.";
export const FLOCK_STILL_LINE =
  "Still tote. Not foam. Not nest. Not a shop. Not tray.";
export const FLOCK_TOTE_LINE = "Add to tote still works.";
export const FLOCK_EMPTY_LINE = "Nobody taped a flock note yet.";
export const FLOCK_LEAVE_LINE = "Leave the empties";

const SERVER_STORE = Symbol.for("iss.flock-listing-ids");

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

export function parseFlockListingIds(
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

export function flockCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FLOCK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FLOCK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FLOCK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FLOCK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FLOCK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFlockListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFlockListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FLOCK_STORAGE_KEY);
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
          window.localStorage.setItem(FLOCK_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFlockListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = flockCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FLOCK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FLOCK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FLOCK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFlockOverlay(
  listingId: string,
  listingIds: readonly string[] = readFlockListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === FLOCK_LP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jewel stack only. LP, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeFlock(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== FLOCK_HOST_ID) {
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

export type FlockWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "owned";

function refuseFlock(listing: Listing | undefined): FlockWriteReason | null {
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
  if (isLpListing(listing)) {
    return "lp";
  }
  if (isOwnedListing(listing) || listing.id !== FLOCK_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFlock(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFlock(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFlock(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFlock(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFlock(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FLOCK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FLOCK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FLOCK_CHANGED_EVENT, listener);
  };
}
