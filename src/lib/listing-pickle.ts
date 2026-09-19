/**
 * I will not pickle it — the mug stays chipped. Still a mug. Still tote.
 *
 * Chip is the rim. Glaze is fired-coat. Handle is swap-the-C. Gilt is
 * kintsugi. Soap is acid-clean. Sand is grind. Saucer is diner-plate.
 * Walkers still want Sink Drawer to pickle the mug, or “acid the haze
 * so the diner looks new.” I will not pickle it. Still chipped. Still
 * a mug. Still for sale. Not glaze. Not soap. Not chip.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pickle-listing-ids` is the client pickle set.
 * Cookie `iss-pickle-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write chip, glaze, handle, gilt, soap, sand, saucer, acid,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * LUT, and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PICKLE_STORAGE_KEY = "iss:pickle-listing-ids";
export const PICKLE_COOKIE_NAME = "iss-pickle-listing-ids";
export const PICKLE_CHANGED_EVENT = "iss:pickle-changed";

export const PICKLE_HOST_ID = "kdr-chipped-mug";
export const PICKLE_LID_ID = "kdr-lid-no-pot";
export const PICKLE_WHISK_ID = "kdr-bent-whisk";
export const PICKLE_RECIPES_ID = "dl-drawer-recipes";
export const PICKLE_LUT_ID = "dl-camera-luts";
export const PICKLE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PICKLE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  PICKLE_LUT_ID,
] as const;

export const PICKLE_REFUSE_COPY = "That one does not take a pickle note.";
export const PICKLE_TABLE_LINE = "I will not pickle it.";
export const PICKLE_CHIPPED_LINE = "Still chipped.";
export const PICKLE_MUG_LINE = "Still a mug.";
export const PICKLE_NOTICE_TITLE =
  "I will not pickle it. Still chipped. Still a mug.";
export const PICKLE_WALK_LINE =
  "Walkers still want Sink Drawer to pickle the mug, or acid the haze so the diner looks new.";
export const PICKLE_STAYS_LINE =
  "This is the pickle note. I will not pickle it. Still chipped. Still a mug.";
export const PICKLE_STILL_LINE =
  "Still tote. Not glaze. Not soap. Not a shop. Not chip.";
export const PICKLE_TOTE_LINE = "Add to tote still works.";
export const PICKLE_EMPTY_LINE = "Nobody taped a pickle note yet.";
export const PICKLE_LEAVE_LINE = "Leave the craze";

const SERVER_STORE = Symbol.for("iss.pickle-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(PICKLE_OWNED_IDS);

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

export function parsePickleListingIds(
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

export function pickleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PICKLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PICKLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PICKLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PICKLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PICKLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePickleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPickleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PICKLE_STORAGE_KEY);
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
          window.localStorage.setItem(PICKLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writePickleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pickleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PICKLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PICKLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PICKLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPickleOverlay(
  listingId: string,
  listingIds: readonly string[] = readPickleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === PICKLE_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === PICKLE_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PICKLE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePickle(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PICKLE_HOST_ID) {
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

export type PickleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refusePickle(
  listing: Listing | undefined,
): PickleWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PICKLE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPickle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePickle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPickle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePickle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePickle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PICKLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PICKLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PICKLE_CHANGED_EVENT, listener);
  };
}
