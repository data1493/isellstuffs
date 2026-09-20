/**
 * I will not recase it — SUMMER 93 stays fading. Still tote.
 *
 * Pancake is pack-the-hubs. Dolby is NR. Hiss is the tape. Sleeve
 * is the paper. Wind is cue. Walkers still want Sunday Crate to
 * recase the mixtape, or “put SUMMER 93 in a new shell so the ink
 * holds.” I will not recase it. Still fading. Still hiss. Still
 * for sale. Not pancake. Not Dolby. Not a shop. Not sleeve.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:recase-listing-ids` is the client recase set.
 * Cookie `iss-recase-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pancake, dolby, hiss, wind, sleeve, bake, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `mdb-mixtape-93` only. LP, jewels, liner PDF, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RECASE_STORAGE_KEY = "iss:recase-listing-ids";
export const RECASE_COOKIE_NAME = "iss-recase-listing-ids";
export const RECASE_CHANGED_EVENT = "iss:recase-changed";

export const RECASE_HOST_ID = "mdb-mixtape-93";
export const RECASE_LP_ID = "mdb-scratched-lp";
export const RECASE_JEWELS_ID = "mdb-jewel-stack";
export const RECASE_LINER_ID = "dl-crate-side-a";
export const RECASE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RECASE_OWNED_IDS = [
  RECASE_LP_ID,
  RECASE_JEWELS_ID,
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

const ownedSet = new Set<string>(RECASE_OWNED_IDS);

export const RECASE_REFUSE_COPY = "That one does not take a recase note.";
export const RECASE_TABLE_LINE = "I will not recase it.";
export const RECASE_FADING_LINE = "Still fading.";
export const RECASE_HISS_LINE = "Still hiss.";
export const RECASE_NOTICE_TITLE =
  "I will not recase it. Still fading. Still hiss.";
export const RECASE_WALK_LINE =
  "Walkers still want Sunday Crate to recase it, or put SUMMER 93 in a new shell so the ink holds.";
export const RECASE_STAYS_LINE =
  "This is the recase note. I will not recase it. Still fading. Still hiss.";
export const RECASE_STILL_LINE =
  "Still tote. Not pancake. Not Dolby. Not a shop. Not sleeve.";
export const RECASE_TOTE_LINE = "Add to tote still works.";
export const RECASE_EMPTY_LINE = "Nobody taped a recase note yet.";
export const RECASE_LEAVE_LINE = "Leave the shell";

const SERVER_STORE = Symbol.for("iss.recase-listing-ids");

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

export function parseRecaseListingIds(
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

export function recaseCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RECASE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RECASE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RECASE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RECASE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RECASE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRecaseListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRecaseListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RECASE_STORAGE_KEY);
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
          window.localStorage.setItem(RECASE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRecaseListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = recaseCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RECASE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RECASE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RECASE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRecaseOverlay(
  listingId: string,
  listingIds: readonly string[] = readRecaseListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === RECASE_LP_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === RECASE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === RECASE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mixtape only. LP, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeRecase(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RECASE_HOST_ID) {
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

export type RecaseWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

function refuseRecase(
  listing: Listing | undefined,
): RecaseWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== RECASE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRecase(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRecase(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRecase(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRecase(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRecase(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RECASE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RECASE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RECASE_CHANGED_EVENT, listener);
  };
}
