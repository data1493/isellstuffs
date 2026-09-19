/**
 * I will not nest them — the jewels stay a pile. Still tote.
 *
 * Cases is empty jewels. Hinge is the snapped one. Inside is no
 * titles. Fill is put-a-movie-in. Sort is alpha-stack. Gum is
 * shop-sticker. Walkers still want Sunday Crate to nest the stack,
 * or “seat them so they ride in the Civic.” I will not nest them.
 * Still a pile. Still empty. Still for sale. Not sort. Not fill.
 * Not a shop. Not cases.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:nest-listing-ids` is the client nest set.
 * Cookie `iss-nest-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cases, hinge, inside, fill, sort, gum, tray, azimuth,
 * sponge, anneal, gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-jewel-stack` only. LP, mixtape, CD-R, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const NEST_STORAGE_KEY = "iss:nest-listing-ids";
export const NEST_COOKIE_NAME = "iss-nest-listing-ids";
export const NEST_CHANGED_EVENT = "iss:nest-changed";

export const NEST_HOST_ID = "mdb-jewel-stack";
export const NEST_LP_ID = "mdb-scratched-lp";
export const NEST_MIXTAPE_ID = "mdb-mixtape-93";
export const NEST_CDR_ID = "ysk-burned-cdr";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const NEST_OWNED_IDS = [
  NEST_LP_ID,
  NEST_MIXTAPE_ID,
  NEST_CDR_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "dl-booth-font",
] as const;

const ownedSet = new Set<string>(NEST_OWNED_IDS);

export const NEST_REFUSE_COPY = "That one does not take a nest note.";
export const NEST_TABLE_LINE = "I will not nest them.";
export const NEST_PILE_LINE = "Still a pile.";
export const NEST_EMPTY_CASES_LINE = "Still empty.";
export const NEST_NOTICE_TITLE =
  "I will not nest them. Still a pile. Still empty.";
export const NEST_WALK_LINE =
  "Walkers still want Sunday Crate to nest the stack, or seat them so they ride in the Civic.";
export const NEST_STAYS_LINE =
  "This is the nest note. I will not nest them. Still a pile. Still empty.";
export const NEST_STILL_LINE =
  "Still tote. Not sort. Not fill. Not a shop. Not cases.";
export const NEST_TOTE_LINE = "Add to tote still works.";
export const NEST_EMPTY_LINE = "Nobody taped a nest note yet.";
export const NEST_LEAVE_LINE = "Leave the pile";

const SERVER_STORE = Symbol.for("iss.nest-listing-ids");

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

export function parseNestListingIds(
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

export function nestCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const NEST_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${NEST_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(NEST_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(NEST_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${NEST_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseNestListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readNestListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(NEST_STORAGE_KEY);
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
          window.localStorage.setItem(NEST_STORAGE_KEY, JSON.stringify(ids));
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

export function writeNestListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = nestCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(NEST_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${NEST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(NEST_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingNestOverlay(
  listingId: string,
  listingIds: readonly string[] = readNestListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === NEST_LP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jewel stack only. LP, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeNest(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== NEST_HOST_ID) {
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

export type NestWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "owned";

function refuseNest(listing: Listing | undefined): NestWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== NEST_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingNest(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseNest(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingNest(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseNest(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeNest(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === NEST_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(NEST_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(NEST_CHANGED_EVENT, listener);
  };
}
