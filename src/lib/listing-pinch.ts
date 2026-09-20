/**
 * I will not pinch it — still a hiss. Still a radio edit. Still tote.
 *
 * Pancake is pack-the-hubs. Dolby is NR. Recase is new-shell. Wind
 * is cue. Bake is sticky-shed. Hiss is the tape. Walkers still want
 * Sunday Crate to pinch it, or “set the roller so SUMMER 93 stops
 * eating tape.” I will not pinch it. Still a hiss. Still a radio
 * edit. Still for sale. Not pancake. Not Dolby. Not a shop. Not wind.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pinch-listing-ids` is the client pinch set.
 * Cookie `iss-pinch-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pancake, dolby, recase, wind, bake, hiss, gift, buy,
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

export const PINCH_STORAGE_KEY = "iss:pinch-listing-ids";
export const PINCH_COOKIE_NAME = "iss-pinch-listing-ids";
export const PINCH_CHANGED_EVENT = "iss:pinch-changed";

export const PINCH_HOST_ID = "mdb-mixtape-93";
export const PINCH_LP_ID = "mdb-scratched-lp";
export const PINCH_JEWELS_ID = "mdb-jewel-stack";
export const PINCH_LINER_ID = "dl-crate-side-a";
export const PINCH_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PINCH_OWNED_IDS = [
  PINCH_LP_ID,
  PINCH_JEWELS_ID,
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

const ownedSet = new Set<string>(PINCH_OWNED_IDS);

export const PINCH_REFUSE_COPY = "That one does not take a pinch note.";
export const PINCH_TABLE_LINE = "I will not pinch it.";
export const PINCH_HISS_LINE = "Still a hiss.";
export const PINCH_RADIO_LINE = "Still a radio edit.";
export const PINCH_NOTICE_TITLE =
  "I will not pinch it. Still a hiss. Still a radio edit.";
export const PINCH_WALK_LINE =
  "Walkers still want Sunday Crate to pinch it, or set the roller so SUMMER 93 stops eating tape.";
export const PINCH_STAYS_LINE =
  "This is the pinch note. I will not pinch it. Still a hiss. Still a radio edit.";
export const PINCH_STILL_LINE =
  "Still tote. Not pancake. Not Dolby. Not a shop. Not wind.";
export const PINCH_TOTE_LINE = "Add to tote still works.";
export const PINCH_EMPTY_LINE = "Nobody taped a pinch note yet.";
export const PINCH_LEAVE_LINE = "Leave the hiss";

const SERVER_STORE = Symbol.for("iss.pinch-listing-ids");

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

export function parsePinchListingIds(
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

export function pinchCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PINCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PINCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PINCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PINCH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PINCH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePinchListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPinchListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PINCH_STORAGE_KEY);
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
          window.localStorage.setItem(PINCH_STORAGE_KEY, JSON.stringify(ids));
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

export function writePinchListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pinchCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PINCH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PINCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PINCH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPinchOverlay(
  listingId: string,
  listingIds: readonly string[] = readPinchListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === PINCH_LP_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === PINCH_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PINCH_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mixtape only. LP, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePinch(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PINCH_HOST_ID) {
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

export type PinchWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "jewels"
  | "chair"
  | "owned";

function refusePinch(
  listing: Listing | undefined,
): PinchWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PINCH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPinch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePinch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPinch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePinch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePinch(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PINCH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PINCH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PINCH_CHANGED_EVENT, listener);
  };
}
