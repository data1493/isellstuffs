/**
 * I will not rinse it — the unnamed LP still skips. Still unnamed.
 *
 * Wash is laundry on the windbreaker. Dust is the wipe. Skip is the
 * chorus. Puck is weight-on-Side-A. Hone is the nick. Walkers still
 * want Sunday Crate to rinse the LP, or “wash the smear so Side A
 * plays clean.” I will not rinse it. Still a skip. Still unnamed.
 * Still for sale. Not wash. Not dust. Not a shop. Not skip.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:rinse-listing-ids` is the client rinse set.
 * Cookie `iss-rinse-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write wash, dust, skip, hone, puck, brush, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `mdb-scratched-lp` only. Mixtape, jewels, liner, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const RINSE_STORAGE_KEY = "iss:rinse-listing-ids";
export const RINSE_COOKIE_NAME = "iss-rinse-listing-ids";
export const RINSE_CHANGED_EVENT = "iss:rinse-changed";

export const RINSE_HOST_ID = "mdb-scratched-lp";
export const RINSE_MIXTAPE_ID = "mdb-mixtape-93";
export const RINSE_JEWELS_ID = "mdb-jewel-stack";
export const RINSE_LINER_ID = "dl-crate-side-a";
export const RINSE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const RINSE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

export const RINSE_REFUSE_COPY = "That one does not take a rinse note.";
export const RINSE_TABLE_LINE = "I will not rinse it.";
export const RINSE_SKIP_LINE = "Still a skip.";
export const RINSE_UNNAMED_LINE = "Still unnamed.";
export const RINSE_NOTICE_TITLE =
  "I will not rinse it. Still a skip. Still unnamed.";
export const RINSE_WALK_LINE =
  "Walkers still want Sunday Crate to rinse the LP, or wash the smear so Side A plays clean.";
export const RINSE_STAYS_LINE =
  "This is the rinse note. I will not rinse it. Still a skip. Still unnamed.";
export const RINSE_STILL_LINE =
  "Still tote. Not wash. Not dust. Not a shop. Not skip.";
export const RINSE_TOTE_LINE = "Add to tote still works.";
export const RINSE_EMPTY_LINE = "Nobody taped a rinse note yet.";
export const RINSE_LEAVE_LINE = "Leave the smear";

const SERVER_STORE = Symbol.for("iss.rinse-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(RINSE_OWNED_IDS);

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

export function parseRinseListingIds(
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

export function rinseCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const RINSE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${RINSE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(RINSE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(RINSE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${RINSE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseRinseListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readRinseListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(RINSE_STORAGE_KEY);
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
          window.localStorage.setItem(RINSE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeRinseListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = rinseCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(RINSE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${RINSE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(RINSE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingRinseOverlay(
  listingId: string,
  listingIds: readonly string[] = readRinseListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === RINSE_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === RINSE_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === RINSE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeRinse(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== RINSE_HOST_ID) {
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

export type RinseWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refuseRinse(
  listing: Listing | undefined,
): RinseWriteReason | null {
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
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isJewelsListing(listing)) {
    return "jewels";
  }
  if (isOwnedListing(listing) || listing.id !== RINSE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingRinse(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRinse(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingRinse(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseRinse(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeRinse(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === RINSE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(RINSE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(RINSE_CHANGED_EVENT, listener);
  };
}
