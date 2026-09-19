/**
 * I will not grommet it — the lamp stays a tired box and a wobbly neck.
 * Still tote.
 *
 * Twist is the neck switch. LED is no cool bulb. Box is the shade
 * in the carton. Cord is the rewire. Walkers still want Tuesday
 * to grommet the shade, or “make the neck sit true.” I will not
 * grommet it. Still a tired box. Still a wobbly neck. Still
 * for sale. Not twist. Not LED. Not the box.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:grommet-listing-ids` is the client grommet set.
 * Cookie `iss-grommet-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write twist, led, box, cord, crack, shim, socket, harp,
 * nest, anneal, azimuth, sponge, finalize, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `ysk-wobbly-lamp` only. Chair, junk PDF, Game Boy, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const GROMMET_STORAGE_KEY = "iss:grommet-listing-ids";
export const GROMMET_COOKIE_NAME = "iss-grommet-listing-ids";
export const GROMMET_CHANGED_EVENT = "iss:grommet-changed";

export const GROMMET_HOST_ID = "ysk-wobbly-lamp";
export const GROMMET_CHAIR_ID = "ysk-folding-chair";
export const GROMMET_BOY_ID = "gtk-game-boy";
export const GROMMET_JUNK_ID = "dl-junk-pricing-pdf";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GROMMET_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "gtk-game-boy",
] as const;

export const GROMMET_REFUSE_COPY = "That one does not take a grommet note.";
export const GROMMET_TABLE_LINE = "I will not grommet it.";
export const GROMMET_BOX_LINE = "Still a tired box.";
export const GROMMET_NECK_LINE = "Still a wobbly neck.";
export const GROMMET_NOTICE_TITLE =
  "I will not grommet it. Still a tired box. Still a wobbly neck.";
export const GROMMET_WALK_LINE =
  "Walkers still want Tuesday to grommet the shade, or make the neck sit true.";
export const GROMMET_STAYS_LINE =
  "This is the grommet note. I will not grommet it. Still a tired box. Still a wobbly neck.";
export const GROMMET_STILL_LINE = "Still tote. Not twist. Not LED. Not the box.";
export const GROMMET_TOTE_LINE = "Add to tote still works.";
export const GROMMET_EMPTY_LINE = "Nobody taped a grommet note yet.";
export const GROMMET_LEAVE_LINE = "Leave the shade";

const SERVER_STORE = Symbol.for("iss.grommet-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(GROMMET_OWNED_IDS);

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

export function parseGrommetListingIds(
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

export function grommetCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GROMMET_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GROMMET_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GROMMET_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GROMMET_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GROMMET_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGrommetListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGrommetListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GROMMET_STORAGE_KEY);
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
          window.localStorage.setItem(GROMMET_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGrommetListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = grommetCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GROMMET_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GROMMET_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GROMMET_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGrommetOverlay(
  listingId: string,
  listingIds: readonly string[] = readGrommetListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isChairListing(listing: Listing) {
  return listing.id === GROMMET_CHAIR_ID;
}

function isBoyListing(listing: Listing) {
  return listing.id === GROMMET_BOY_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lamp only. Chair, Game Boy, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeGrommet(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GROMMET_HOST_ID) {
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

export type GrommetWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "chair"
  | "boy"
  | "owned";

function refuseGrommet(
  listing: Listing | undefined,
): GrommetWriteReason | null {
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
  if (isBoyListing(listing)) {
    return "boy";
  }
  if (isOwnedListing(listing) || listing.id !== GROMMET_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGrommet(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGrommet(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGrommet(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGrommet(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGrommet(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GROMMET_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GROMMET_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GROMMET_CHANGED_EVENT, listener);
  };
}
