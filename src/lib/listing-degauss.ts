/**
 * I will not degauss it — SUMMER 93 stays hiss and fading ink. Still tote.
 *
 * Hiss is the tape. Bake is no oven. Splice is radio ads. Azimuth is
 * the heading. Walkers still want Crate to degauss the cassette, or
 * “wipe SUMMER 93 clean.” I will not degauss it. Still hiss. Still
 * fading ink. Still for sale. Not hiss. Not bake. Not splice.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:degauss-listing-ids` is the client degauss set.
 * Cookie `iss-degauss-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, bake, splice, azimuth, dub, wind, radio, leader,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-mixtape-93` only. LP, liner PDF, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DEGAUSS_STORAGE_KEY = "iss:degauss-listing-ids";
export const DEGAUSS_COOKIE_NAME = "iss-degauss-listing-ids";
export const DEGAUSS_CHANGED_EVENT = "iss:degauss-changed";

export const DEGAUSS_HOST_ID = "mdb-mixtape-93";
export const DEGAUSS_LP_ID = "mdb-scratched-lp";
export const DEGAUSS_LINER_ID = "dl-crate-side-a";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DEGAUSS_OWNED_IDS = [
  DEGAUSS_LP_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "mdb-jewel-stack",
  "dl-booth-font",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

const ownedSet = new Set<string>(DEGAUSS_OWNED_IDS);

export const DEGAUSS_REFUSE_COPY = "That one does not take a degauss note.";
export const DEGAUSS_TABLE_LINE = "I will not degauss it.";
export const DEGAUSS_HISS_LINE = "Still hiss.";
export const DEGAUSS_INK_LINE = "Still fading ink.";
export const DEGAUSS_NOTICE_TITLE =
  "I will not degauss it. Still hiss. Still fading ink.";
export const DEGAUSS_WALK_LINE =
  "Walkers still want Crate to degauss the cassette, or wipe SUMMER 93 clean.";
export const DEGAUSS_STAYS_LINE =
  "This is the degauss note. I will not degauss it. Still hiss. Still fading ink.";
export const DEGAUSS_STILL_LINE = "Still tote. Not hiss. Not bake. Not splice.";
export const DEGAUSS_TOTE_LINE = "Add to tote still works.";
export const DEGAUSS_EMPTY_LINE = "Nobody taped a degauss note yet.";
export const DEGAUSS_LEAVE_LINE = "Leave the tape";

const SERVER_STORE = Symbol.for("iss.degauss-listing-ids");

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

export function parseDegaussListingIds(
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

export function degaussCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DEGAUSS_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DEGAUSS_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DEGAUSS_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DEGAUSS_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DEGAUSS_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDegaussListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDegaussListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DEGAUSS_STORAGE_KEY);
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
          window.localStorage.setItem(DEGAUSS_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDegaussListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = degaussCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DEGAUSS_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DEGAUSS_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DEGAUSS_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDegaussOverlay(
  listingId: string,
  listingIds: readonly string[] = readDegaussListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === DEGAUSS_LP_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mixtape only. LP, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeDegauss(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DEGAUSS_HOST_ID) {
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

export type DegaussWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "owned";

function refuseDegauss(
  listing: Listing | undefined,
): DegaussWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== DEGAUSS_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDegauss(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDegauss(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDegauss(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDegauss(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDegauss(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DEGAUSS_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DEGAUSS_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DEGAUSS_CHANGED_EVENT, listener);
  };
}
