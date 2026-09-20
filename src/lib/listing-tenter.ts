/**
 * I will not tenter it — still mint-green. Still smells like a car.
 * Still tote.
 *
 * Singe is burn-the-pills. Nap is raise-the-pile. Calender is
 * hot-roll-the-nylon. Notch is cut-the-pit. Walkers still want
 * Closet to tenter it, or “pin the mint-green on a shop frame so
 * it hangs square without a shop singe.” I will not tenter it.
 * Still mint-green. Still smells like a car. Still for sale.
 * Not singe. Not nap. Not a shop. Not calender.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:tenter-listing-ids` is the client tenter set.
 * Cookie `iss-tenter-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write singe, nap, calender, notch, darn, cream, stenter,
 * rail, overfeed, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, lid, chair, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TENTER_STORAGE_KEY = "iss:tenter-listing-ids";
export const TENTER_COOKIE_NAME = "iss-tenter-listing-ids";
export const TENTER_CHANGED_EVENT = "iss:tenter-changed";

export const TENTER_HOST_ID = "clo-windbreaker";
export const TENTER_SOLES_ID = "clo-split-soles";
export const TENTER_LID_ID = "kdr-lid-no-pot";
export const TENTER_CHAIR_ID = "ysk-folding-chair";
export const TENTER_GIFT_ID = "dl-mall-gift-card";
export const TENTER_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TENTER_OWNED_IDS = [
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "dl-camera-luts",
  "mdb-scratched-lp",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(TENTER_OWNED_IDS);

export const TENTER_REFUSE_COPY = "That one does not take a tenter note.";
export const TENTER_TABLE_LINE = "I will not tenter it.";
export const TENTER_GREEN_LINE = "Still mint-green.";
export const TENTER_SMELL_LINE = "Still smells like a car.";
export const TENTER_NOTICE_TITLE =
  "I will not tenter it. Still mint-green. Still smells like a car.";
export const TENTER_WALK_LINE =
  "Walkers still want Closet to tenter it, or pin the mint-green on a shop frame so it hangs square without a shop singe.";
export const TENTER_STAYS_LINE =
  "This is the tenter note. I will not tenter it. Still mint-green. Still smells like a car.";
export const TENTER_STILL_LINE =
  "Still tote. Not singe. Not nap. Not a shop. Not calender.";
export const TENTER_TOTE_LINE = "Add to tote still works.";
export const TENTER_EMPTY_LINE = "Nobody taped a tenter note yet.";
export const TENTER_LEAVE_LINE = "Leave the nylon";

const SERVER_STORE = Symbol.for("iss.tenter-listing-ids");

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

export function parseTenterListingIds(
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

export function tenterCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TENTER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TENTER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TENTER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TENTER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TENTER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTenterListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTenterListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TENTER_STORAGE_KEY);
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
          window.localStorage.setItem(TENTER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTenterListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = tenterCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TENTER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TENTER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TENTER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTenterOverlay(
  listingId: string,
  listingIds: readonly string[] = readTenterListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSolesListing(listing: Listing) {
  return listing.id === TENTER_SOLES_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === TENTER_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === TENTER_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Soles, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTenter(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TENTER_HOST_ID) {
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

export type TenterWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "soles"
  | "lid"
  | "chair"
  | "owned";

function refuseTenter(
  listing: Listing | undefined,
): TenterWriteReason | null {
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
  if (isSolesListing(listing)) {
    return "soles";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== TENTER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTenter(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTenter(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTenter(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTenter(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTenter(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TENTER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TENTER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TENTER_CHANGED_EVENT, listener);
  };
}
