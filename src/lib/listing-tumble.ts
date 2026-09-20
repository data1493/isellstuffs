/**
 * I will not tumble them — the jewels stay empty. Still tote.
 *
 * Foam is the rattle-pad. Nest is Civic-seat. Flock is suede-trays.
 * Inlay stays queued. Walkers still want Sunday Crate to tumble the
 * empty cases, or roll the plastics so they look new. I will not
 * tumble them. Still empty. Still cracked. Still for sale. Not foam.
 * Not nest. Not flock. Not inlay.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:tumble-listing-ids` is the client tumble set.
 * Cookie `iss-tumble-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foam, nest, flock, inlay, recase, fettle, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `mdb-jewel-stack` only. LP, mixtape, liner PDF, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TUMBLE_STORAGE_KEY = "iss:tumble-listing-ids";
export const TUMBLE_COOKIE_NAME = "iss-tumble-listing-ids";
export const TUMBLE_CHANGED_EVENT = "iss:tumble-changed";

export const TUMBLE_HOST_ID = "mdb-jewel-stack";
export const TUMBLE_LP_ID = "mdb-scratched-lp";
export const TUMBLE_MIXTAPE_ID = "mdb-mixtape-93";
export const TUMBLE_LINER_ID = "dl-crate-side-a";
export const TUMBLE_CHAIR_ID = "ysk-folding-chair";
export const TUMBLE_GIFT_ID = "dl-mall-gift-card";
export const TUMBLE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TUMBLE_OWNED_IDS = [
  TUMBLE_LP_ID,
  TUMBLE_MIXTAPE_ID,
  "ysk-burned-cdr",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "dl-booth-font",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "dl-junk-pricing-pdf",
] as const;

const ownedSet = new Set<string>(TUMBLE_OWNED_IDS);

export const TUMBLE_REFUSE_COPY = "That one does not take a tumble note.";
export const TUMBLE_TABLE_LINE = "I will not tumble them.";
export const TUMBLE_EMPTY_CASES_LINE = "Still empty.";
export const TUMBLE_CRACK_LINE = "Still cracked.";
export const TUMBLE_NOTICE_TITLE =
  "I will not tumble them. Still empty. Still cracked.";
export const TUMBLE_WALK_LINE =
  "Walkers still want Sunday Crate to tumble the empty cases, or roll the plastics so they look new.";
export const TUMBLE_STAYS_LINE =
  "This is the tumble note. I will not tumble them. Still empty. Still cracked.";
export const TUMBLE_STILL_LINE =
  "Still tote. Not foam. Not nest. Not flock.";
export const TUMBLE_TOTE_LINE = "Add to tote still works.";
export const TUMBLE_EMPTY_LINE = "Nobody taped a tumble note yet.";
export const TUMBLE_LEAVE_LINE = "Leave the pile";

const SERVER_STORE = Symbol.for("iss.tumble-listing-ids");

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

export function parseTumbleListingIds(
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

export function tumbleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TUMBLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TUMBLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TUMBLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TUMBLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TUMBLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTumbleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTumbleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TUMBLE_STORAGE_KEY);
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
          window.localStorage.setItem(TUMBLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTumbleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = tumbleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TUMBLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TUMBLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TUMBLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTumbleOverlay(
  listingId: string,
  listingIds: readonly string[] = readTumbleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === TUMBLE_LP_ID;
}

function isLinerListing(listing: Listing) {
  return listing.id === TUMBLE_LINER_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === TUMBLE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jewel stack only. LP, liner, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTumble(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TUMBLE_HOST_ID) {
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

export type TumbleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "liner"
  | "chair"
  | "owned";

function refuseTumble(listing: Listing | undefined): TumbleWriteReason | null {
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
    return isLinerListing(listing) ? "liner" : "digital";
  }
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isLpListing(listing)) {
    return "lp";
  }
  if (isOwnedListing(listing) || listing.id !== TUMBLE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTumble(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTumble(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTumble(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTumble(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTumble(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TUMBLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TUMBLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TUMBLE_CHANGED_EVENT, listener);
  };
}
