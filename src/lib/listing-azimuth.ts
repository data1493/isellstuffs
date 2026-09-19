/**
 * I will not azimuth it — SUMMER 93 stays hiss and 93. Still tote.
 *
 * Hiss is the tape. Splice is radio ads. Bake is no oven. Dub is
 * no clean copy. Wind is cue. Radio is the radio edit. Walkers
 * still want Crate to azimuth the cassette, or “make SUMMER 93
 * sit true.” I will not azimuth it. Still hiss. Still 93. Still
 * for sale. Not hiss. Not splice. Not a deck.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:azimuth-listing-ids` is the client azimuth set.
 * Cookie `iss-azimuth-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, splice, bake, dub, wind, radio, leader, wax,
 * dedicate, cinch, finalize, sponge, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `mdb-mixtape-93` only. LP, liner PDF, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const AZIMUTH_STORAGE_KEY = "iss:azimuth-listing-ids";
export const AZIMUTH_COOKIE_NAME = "iss-azimuth-listing-ids";
export const AZIMUTH_CHANGED_EVENT = "iss:azimuth-changed";

export const AZIMUTH_HOST_ID = "mdb-mixtape-93";
export const AZIMUTH_LP_ID = "mdb-scratched-lp";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const AZIMUTH_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "dl-booth-font",
] as const;

export const AZIMUTH_REFUSE_COPY = "That one does not take an azimuth note.";
export const AZIMUTH_TABLE_LINE = "I will not azimuth it.";
export const AZIMUTH_HISS_LINE = "Still hiss.";
export const AZIMUTH_NINETY_LINE = "Still 93.";
export const AZIMUTH_NOTICE_TITLE =
  "I will not azimuth it. Still hiss. Still 93.";
export const AZIMUTH_WALK_LINE =
  "Walkers still want Crate to azimuth the cassette, or make SUMMER 93 sit true.";
export const AZIMUTH_STAYS_LINE =
  "This is the azimuth note. I will not azimuth it. Still hiss. Still 93.";
export const AZIMUTH_STILL_LINE = "Still tote. Not hiss. Not splice. Not a deck.";
export const AZIMUTH_TOTE_LINE = "Add to tote still works.";
export const AZIMUTH_EMPTY_LINE = "Nobody taped an azimuth note yet.";
export const AZIMUTH_LEAVE_LINE = "Leave the heading";

const SERVER_STORE = Symbol.for("iss.azimuth-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(AZIMUTH_OWNED_IDS);

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

export function parseAzimuthListingIds(
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

export function azimuthCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const AZIMUTH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${AZIMUTH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(AZIMUTH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(AZIMUTH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${AZIMUTH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseAzimuthListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readAzimuthListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(AZIMUTH_STORAGE_KEY);
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
          window.localStorage.setItem(AZIMUTH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeAzimuthListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = azimuthCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(AZIMUTH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${AZIMUTH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(AZIMUTH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingAzimuthOverlay(
  listingId: string,
  listingIds: readonly string[] = readAzimuthListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === AZIMUTH_LP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mixtape only. LP, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeAzimuth(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== AZIMUTH_HOST_ID) {
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

export type AzimuthWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "owned";

function refuseAzimuth(
  listing: Listing | undefined,
): AzimuthWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== AZIMUTH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingAzimuth(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAzimuth(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingAzimuth(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAzimuth(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeAzimuth(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === AZIMUTH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(AZIMUTH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(AZIMUTH_CHANGED_EVENT, listener);
  };
}
