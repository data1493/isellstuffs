/**
 * I will not fettle it — the mug stays chipped. Still a mug. Still tote.
 *
 * Chip is the rim. Glaze is fired-coat. Pickle is acid-the-haze.
 * Handle is swap-the-C. Sand is grind. Walkers still want Sink
 * Drawer to fettle the mug, or “dress the rim so the chip sits
 * flush.” I will not fettle it. Still a chip. Still a mug. Still
 * for sale. Not glaze. Not pickle. Not chip. Not sand.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:fettle-listing-ids` is the client fettle set.
 * Cookie `iss-fettle-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write glaze, pickle, chip, sand, handle, gilt, saucer, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const FETTLE_STORAGE_KEY = "iss:fettle-listing-ids";
export const FETTLE_COOKIE_NAME = "iss-fettle-listing-ids";
export const FETTLE_CHANGED_EVENT = "iss:fettle-changed";

export const FETTLE_HOST_ID = "kdr-chipped-mug";
export const FETTLE_LID_ID = "kdr-lid-no-pot";
export const FETTLE_WHISK_ID = "kdr-bent-whisk";
export const FETTLE_RECIPES_ID = "dl-drawer-recipes";
export const FETTLE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const FETTLE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
] as const;

export const FETTLE_REFUSE_COPY = "That one does not take a fettle note.";
export const FETTLE_TABLE_LINE = "I will not fettle it.";
export const FETTLE_CHIP_LINE = "Still a chip.";
export const FETTLE_MUG_LINE = "Still a mug.";
export const FETTLE_NOTICE_TITLE =
  "I will not fettle it. Still a chip. Still a mug.";
export const FETTLE_WALK_LINE =
  "Walkers still want Sink Drawer to fettle the mug, or dress the rim so the chip sits flush.";
export const FETTLE_STAYS_LINE =
  "This is the fettle note. I will not fettle it. Still a chip. Still a mug.";
export const FETTLE_STILL_LINE =
  "Still tote. Not glaze. Not pickle. Not a shop. Not chip.";
export const FETTLE_TOTE_LINE = "Add to tote still works.";
export const FETTLE_EMPTY_LINE = "Nobody taped a fettle note yet.";
export const FETTLE_LEAVE_LINE = "Leave the rim";

const SERVER_STORE = Symbol.for("iss.fettle-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(FETTLE_OWNED_IDS);

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

export function parseFettleListingIds(
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

export function fettleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const FETTLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${FETTLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(FETTLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(FETTLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${FETTLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseFettleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readFettleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(FETTLE_STORAGE_KEY);
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
          window.localStorage.setItem(FETTLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeFettleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = fettleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(FETTLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${FETTLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(FETTLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingFettleOverlay(
  listingId: string,
  listingIds: readonly string[] = readFettleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === FETTLE_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === FETTLE_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === FETTLE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeFettle(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== FETTLE_HOST_ID) {
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

export type FettleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refuseFettle(
  listing: Listing | undefined,
): FettleWriteReason | null {
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
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isOwnedListing(listing) || listing.id !== FETTLE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingFettle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFettle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingFettle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseFettle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeFettle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === FETTLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FETTLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FETTLE_CHANGED_EVENT, listener);
  };
}
