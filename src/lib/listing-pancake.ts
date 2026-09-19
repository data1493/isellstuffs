/**
 * I will not pancake it — SUMMER 93 stays flopped. Still tote.
 *
 * Hiss is the tape. Dolby is NR. Bake is sticky-shed. Wind is cue.
 * Leader is white-tape. Walkers still want Sunday Crate to pancake
 * the mixtape, or “pack the hubs so SUMMER 93 doesn’t flop.” I will
 * not pancake it. Still hiss. Still SUMMER 93. Still for sale. Not
 * wind. Not Dolby. Not bake.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pancake-listing-ids` is the client pancake set.
 * Cookie `iss-pancake-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write hiss, dolby, bake, azimuth, degauss, leader, wind, dub,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-mixtape-93` only. LP, jewels, liner PDF, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PANCAKE_STORAGE_KEY = "iss:pancake-listing-ids";
export const PANCAKE_COOKIE_NAME = "iss-pancake-listing-ids";
export const PANCAKE_CHANGED_EVENT = "iss:pancake-changed";

export const PANCAKE_HOST_ID = "mdb-mixtape-93";
export const PANCAKE_LP_ID = "mdb-scratched-lp";
export const PANCAKE_JEWELS_ID = "mdb-jewel-stack";
export const PANCAKE_LINER_ID = "dl-crate-side-a";
export const PANCAKE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PANCAKE_OWNED_IDS = [
  PANCAKE_LP_ID,
  PANCAKE_JEWELS_ID,
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
  "dl-booth-font",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "dl-drawer-recipes",
] as const;

const ownedSet = new Set<string>(PANCAKE_OWNED_IDS);

export const PANCAKE_REFUSE_COPY = "That one does not take a pancake note.";
export const PANCAKE_TABLE_LINE = "I will not pancake it.";
export const PANCAKE_HISS_LINE = "Still hiss.";
export const PANCAKE_SUMMER_LINE = "Still SUMMER 93.";
export const PANCAKE_NOTICE_TITLE =
  "I will not pancake it. Still hiss. Still SUMMER 93.";
export const PANCAKE_WALK_LINE =
  "Walkers still want Sunday Crate to pancake it, or pack the hubs so SUMMER 93 doesn’t flop.";
export const PANCAKE_STAYS_LINE =
  "This is the pancake note. I will not pancake it. Still hiss. Still SUMMER 93.";
export const PANCAKE_STILL_LINE =
  "Still tote. Not wind. Not Dolby. Not a shop. Not bake.";
export const PANCAKE_TOTE_LINE = "Add to tote still works.";
export const PANCAKE_EMPTY_LINE = "Nobody taped a pancake note yet.";
export const PANCAKE_LEAVE_LINE = "Leave the flop";

const SERVER_STORE = Symbol.for("iss.pancake-listing-ids");

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

export function parsePancakeListingIds(
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

export function pancakeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PANCAKE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PANCAKE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PANCAKE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PANCAKE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PANCAKE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePancakeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPancakeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PANCAKE_STORAGE_KEY);
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
          window.localStorage.setItem(PANCAKE_STORAGE_KEY, JSON.stringify(ids));
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

export function writePancakeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pancakeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PANCAKE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PANCAKE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PANCAKE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPancakeOverlay(
  listingId: string,
  listingIds: readonly string[] = readPancakeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === PANCAKE_LP_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === PANCAKE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PANCAKE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mixtape only. LP, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePancake(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PANCAKE_HOST_ID) {
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

export type PancakeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

function refusePancake(
  listing: Listing | undefined,
): PancakeWriteReason | null {
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
  if (isLpListing(listing)) {
    return "lp";
  }
  if (isJewelsListing(listing)) {
    return "jewels";
  }
  if (isOwnedListing(listing) || listing.id !== PANCAKE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPancake(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePancake(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPancake(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePancake(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePancake(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PANCAKE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PANCAKE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PANCAKE_CHANGED_EVENT, listener);
  };
}
