/**
 * I will not hickey it — the lamp stays a wiggle. Still shade optional.
 *
 * Fuse is swap-the-glass. Chase is recut-the-threads. Broach is
 * size-the-hole. Harp is the stall finial. Socket is the receptacle.
 * Walkers still want Tuesday to hickey it, or drop a shop hickey so
 * the harp seats without a chase. I will not hickey it. Still a
 * wiggle. Still shade optional. Still for sale. Not fuse. Not chase.
 * Not a shop. Not harp.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hickey-listing-ids` is the client hickey set.
 * Cookie `iss-hickey-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write fuse, chase, broach, harp, socket, finial, nipple,
 * locknut, yoke, shank, strain, weld, detune, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `ysk-wobbly-lamp` only. Chair, mug, junk PDF, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const HICKEY_STORAGE_KEY = "iss:hickey-listing-ids";
export const HICKEY_COOKIE_NAME = "iss-hickey-listing-ids";
export const HICKEY_CHANGED_EVENT = "iss:hickey-changed";

export const HICKEY_HOST_ID = "ysk-wobbly-lamp";
export const HICKEY_CHAIR_ID = "ysk-folding-chair";
export const HICKEY_MUG_ID = "kdr-chipped-mug";
export const HICKEY_JUNK_ID = "dl-junk-pricing-pdf";
export const HICKEY_GIFT_ID = "dl-mall-gift-card";
export const HICKEY_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const HICKEY_OWNED_IDS = [
  HICKEY_MUG_ID,
  HICKEY_JUNK_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-sample-pack",
  "dl-crate-side-a",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(HICKEY_OWNED_IDS);

export const HICKEY_REFUSE_COPY = "That one does not take a hickey note.";
export const HICKEY_TABLE_LINE = "I will not hickey it.";
export const HICKEY_WIGGLE_LINE = "Still a wiggle.";
export const HICKEY_SHADE_LINE = "Still shade optional.";
export const HICKEY_NOTICE_TITLE =
  "I will not hickey it. Still a wiggle. Still shade optional.";
export const HICKEY_WALK_LINE =
  "Walkers still want Tuesday to hickey it, or drop a shop hickey so the harp seats without a chase.";
export const HICKEY_STAYS_LINE =
  "This is the hickey note. I will not hickey it. Still a wiggle. Still shade optional.";
export const HICKEY_STILL_LINE =
  "Still tote. Not fuse. Not chase. Not a shop. Not harp.";
export const HICKEY_TOTE_LINE = "Add to tote still works.";
export const HICKEY_EMPTY_LINE = "Nobody taped a hickey note yet.";
export const HICKEY_LEAVE_LINE = "Leave the pipe";

const SERVER_STORE = Symbol.for("iss.hickey-listing-ids");

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

export function parseHickeyListingIds(
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

export function hickeyCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HICKEY_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HICKEY_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HICKEY_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HICKEY_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HICKEY_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHickeyListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHickeyListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HICKEY_STORAGE_KEY);
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
          window.localStorage.setItem(HICKEY_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHickeyListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = hickeyCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HICKEY_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HICKEY_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HICKEY_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHickeyOverlay(
  listingId: string,
  listingIds: readonly string[] = readHickeyListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isChairListing(listing: Listing) {
  return listing.id === HICKEY_CHAIR_ID;
}

function isMugListing(listing: Listing) {
  return listing.id === HICKEY_MUG_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lamp only. Overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeHickey(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== HICKEY_HOST_ID) {
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

export type HickeyWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "chair"
  | "mug"
  | "owned";

function refuseHickey(listing: Listing | undefined): HickeyWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isOwnedListing(listing) || listing.id !== HICKEY_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingHickey(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHickey(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingHickey(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHickey(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeHickey(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HICKEY_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HICKEY_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HICKEY_CHANGED_EVENT, listener);
  };
}
