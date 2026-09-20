/**
 * I will not ream it — the lamp stays cracked and it still lights.
 * Still tote.
 *
 * Bush is sleeve-the-pipe. Swage is squeeze-the-neck. Twist owns
 * the neck. Chase is queued. Walkers still want Tuesday to ream
 * the neck, or “open the hole so the harp seats.” I will not
 * ream it. Still a crack. Still lights. Still for sale. Not bush.
 * Not swage. Not a shop. Not chase.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:ream-listing-ids` is the client ream set.
 * Cookie `iss-ream-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bush, swage, chase, twist, rivet, grommet, collar,
 * shim, socket, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-wobbly-lamp` only. Chair, junk PDF, burned CD-R,
 * gift, zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const REAM_STORAGE_KEY = "iss:ream-listing-ids";
export const REAM_COOKIE_NAME = "iss-ream-listing-ids";
export const REAM_CHANGED_EVENT = "iss:ream-changed";

export const REAM_HOST_ID = "ysk-wobbly-lamp";
export const REAM_CHAIR_ID = "ysk-folding-chair";
export const REAM_BURNED_ID = "ysk-burned-cdr";
export const REAM_JUNK_ID = "dl-junk-pricing-pdf";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const REAM_OWNED_IDS = [
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
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "dl-crate-side-a",
] as const;

export const REAM_REFUSE_COPY = "That one does not take a ream note.";
export const REAM_TABLE_LINE = "I will not ream it.";
export const REAM_CRACK_LINE = "Still a crack.";
export const REAM_LIGHTS_LINE = "Still lights.";
export const REAM_NOTICE_TITLE =
  "I will not ream it. Still a crack. Still lights.";
export const REAM_WALK_LINE =
  "Walkers still want Tuesday to ream the neck, or open the hole so the harp seats.";
export const REAM_STAYS_LINE =
  "This is the ream note. I will not ream it. Still a crack. Still lights.";
export const REAM_STILL_LINE =
  "Still tote. Not bush. Not swage. Not a shop. Not chase.";
export const REAM_TOTE_LINE = "Add to tote still works.";
export const REAM_EMPTY_LINE = "Nobody taped a ream note yet.";
export const REAM_LEAVE_LINE = "Leave the crack";

const SERVER_STORE = Symbol.for("iss.ream-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(REAM_OWNED_IDS);

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

export function parseReamListingIds(
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

export function reamCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const REAM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${REAM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(REAM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(REAM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${REAM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseReamListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readReamListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(REAM_STORAGE_KEY);
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
          window.localStorage.setItem(REAM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeReamListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = reamCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REAM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${REAM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(REAM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingReamOverlay(
  listingId: string,
  listingIds: readonly string[] = readReamListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isChairListing(listing: Listing) {
  return listing.id === REAM_CHAIR_ID;
}

function isBurnedListing(listing: Listing) {
  return listing.id === REAM_BURNED_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lamp only. Chair, burned CD-R, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeReam(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== REAM_HOST_ID) {
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

export type ReamWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "chair"
  | "burned"
  | "owned";

function refuseReam(
  listing: Listing | undefined,
): ReamWriteReason | null {
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
  if (isBurnedListing(listing)) {
    return "burned";
  }
  if (isOwnedListing(listing) || listing.id !== REAM_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingReam(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseReam(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingReam(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseReam(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeReam(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REAM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REAM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REAM_CHANGED_EVENT, listener);
  };
}
