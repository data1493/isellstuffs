/**
 * I will not puck it — the unnamed LP stays a skip. Still a grocery bag.
 *
 * Skip is the chorus. Center is the hole. Warp is flatten. Dust is
 * the wipe. VG is no Goldmine. Walkers still want Sunday Crate to
 * puck the LP, or “drop a weight so Side A doesn’t skip.” I will
 * not puck it. Still a skip. Still a grocery bag. Still for sale.
 * Not skip. Not center. Not warp.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:puck-listing-ids` is the client puck set.
 * Cookie `iss-puck-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write skip, center, warp, dust, vg, jacket, wax, gift, buy,
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

export const PUCK_STORAGE_KEY = "iss:puck-listing-ids";
export const PUCK_COOKIE_NAME = "iss-puck-listing-ids";
export const PUCK_CHANGED_EVENT = "iss:puck-changed";

export const PUCK_HOST_ID = "mdb-scratched-lp";
export const PUCK_MIXTAPE_ID = "mdb-mixtape-93";
export const PUCK_JEWELS_ID = "mdb-jewel-stack";
export const PUCK_LINER_ID = "dl-crate-side-a";
export const PUCK_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PUCK_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "kdr-chipped-mug",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

export const PUCK_REFUSE_COPY = "That one does not take a puck note.";
export const PUCK_TABLE_LINE = "I will not puck it.";
export const PUCK_SKIP_LINE = "Still a skip.";
export const PUCK_BAG_LINE = "Still a grocery bag.";
export const PUCK_NOTICE_TITLE =
  "I will not puck it. Still a skip. Still a grocery bag.";
export const PUCK_WALK_LINE =
  "Walkers still want Sunday Crate to puck the LP, or drop a weight so Side A doesn’t skip.";
export const PUCK_STAYS_LINE =
  "This is the puck note. I will not puck it. Still a skip. Still a grocery bag.";
export const PUCK_STILL_LINE =
  "Still tote. Not skip. Not center. Not a shop. Not warp.";
export const PUCK_TOTE_LINE = "Add to tote still works.";
export const PUCK_EMPTY_LINE = "Nobody taped a puck note yet.";
export const PUCK_LEAVE_LINE = "Leave the skip";

const SERVER_STORE = Symbol.for("iss.puck-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(PUCK_OWNED_IDS);

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

export function parsePuckListingIds(
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

export function puckCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PUCK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PUCK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PUCK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PUCK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PUCK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePuckListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPuckListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PUCK_STORAGE_KEY);
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
          window.localStorage.setItem(PUCK_STORAGE_KEY, JSON.stringify(ids));
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

export function writePuckListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = puckCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PUCK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PUCK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PUCK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPuckOverlay(
  listingId: string,
  listingIds: readonly string[] = readPuckListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMixtapeListing(listing: Listing) {
  return listing.id === PUCK_MIXTAPE_ID;
}

function isJewelsListing(listing: Listing) {
  return listing.id === PUCK_JEWELS_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PUCK_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LP only. Mixtape, jewels, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePuck(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PUCK_HOST_ID) {
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

export type PuckWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mixtape"
  | "jewels"
  | "chair"
  | "owned";

function refusePuck(
  listing: Listing | undefined,
): PuckWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PUCK_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPuck(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePuck(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPuck(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePuck(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePuck(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PUCK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PUCK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PUCK_CHANGED_EVENT, listener);
  };
}
