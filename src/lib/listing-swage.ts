/**
 * I will not swage it — the lamp stays wobbly and it still lights.
 * Still tote.
 *
 * Bush is sleeve-the-pipe. Rivet is pin-the-shade. Grommet is
 * shade-hole. Chase is queued. Walkers still want Tuesday to swage
 * the pipe, or “squeeze the neck so the harp seats.” I will not
 * swage it. Still wobbly. Still lights. Still for sale. Not bush.
 * Not rivet. Not a shop. Not chase.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:swage-listing-ids` is the client swage set.
 * Cookie `iss-swage-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bush, rivet, grommet, chase, collar, twist, shim,
 * socket, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-wobbly-lamp` only. Chair, junk PDF, lid, gift, zine,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SWAGE_STORAGE_KEY = "iss:swage-listing-ids";
export const SWAGE_COOKIE_NAME = "iss-swage-listing-ids";
export const SWAGE_CHANGED_EVENT = "iss:swage-changed";

export const SWAGE_HOST_ID = "ysk-wobbly-lamp";
export const SWAGE_CHAIR_ID = "ysk-folding-chair";
export const SWAGE_LID_ID = "kdr-lid-no-pot";
export const SWAGE_JUNK_ID = "dl-junk-pricing-pdf";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SWAGE_OWNED_IDS = [
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
] as const;

export const SWAGE_REFUSE_COPY = "That one does not take a swage note.";
export const SWAGE_TABLE_LINE = "I will not swage it.";
export const SWAGE_WOBBLE_LINE = "Still wobbly.";
export const SWAGE_LIGHTS_LINE = "Still lights.";
export const SWAGE_NOTICE_TITLE =
  "I will not swage it. Still wobbly. Still lights.";
export const SWAGE_WALK_LINE =
  "Walkers still want Tuesday to swage the pipe, or squeeze the neck so the harp seats.";
export const SWAGE_STAYS_LINE =
  "This is the swage note. I will not swage it. Still wobbly. Still lights.";
export const SWAGE_STILL_LINE =
  "Still tote. Not bush. Not rivet. Not a shop. Not chase.";
export const SWAGE_TOTE_LINE = "Add to tote still works.";
export const SWAGE_EMPTY_LINE = "Nobody taped a swage note yet.";
export const SWAGE_LEAVE_LINE = "Leave the neck";

const SERVER_STORE = Symbol.for("iss.swage-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(SWAGE_OWNED_IDS);

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

export function parseSwageListingIds(
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

export function swageCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SWAGE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SWAGE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SWAGE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SWAGE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SWAGE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSwageListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSwageListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SWAGE_STORAGE_KEY);
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
          window.localStorage.setItem(SWAGE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSwageListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = swageCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SWAGE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SWAGE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SWAGE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSwageOverlay(
  listingId: string,
  listingIds: readonly string[] = readSwageListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isChairListing(listing: Listing) {
  return listing.id === SWAGE_CHAIR_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === SWAGE_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lamp only. Chair, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeSwage(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SWAGE_HOST_ID) {
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

export type SwageWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "chair"
  | "lid"
  | "owned";

function refuseSwage(
  listing: Listing | undefined,
): SwageWriteReason | null {
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
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== SWAGE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSwage(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSwage(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSwage(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSwage(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSwage(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SWAGE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SWAGE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SWAGE_CHANGED_EVENT, listener);
  };
}
