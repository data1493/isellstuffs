/**
 * I will not stilt it — the diner mug stays a diner rim. Still holds coffee.
 *
 * Sprig is press-the-relief. Salt is soda-the-chip. Jigger is throw-the-wheel.
 * Pickle is acid-the-haze. Glaze is fired-coat. Bisque is first-fire.
 * Walkers still want Sink Drawer to stilt it, or set kiln stilts so the
 * diner rim fires off the shelf without a shop sprig. I will not stilt
 * it. Still a diner rim. Still holds coffee. Still for sale. Not sprig.
 * Not salt. Not a shop. Not jigger.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:stilt-listing-ids` is the client stilt set.
 * Cookie `iss-stilt-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write sprig, salt, jigger, pickle, glaze, bisque, prop, setter,
 * spur, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const STILT_STORAGE_KEY = "iss:stilt-listing-ids";
export const STILT_COOKIE_NAME = "iss-stilt-listing-ids";
export const STILT_CHANGED_EVENT = "iss:stilt-changed";

export const STILT_HOST_ID = "kdr-chipped-mug";
export const STILT_LID_ID = "kdr-lid-no-pot";
export const STILT_WHISK_ID = "kdr-bent-whisk";
export const STILT_RECIPES_ID = "dl-drawer-recipes";
export const STILT_CHAIR_ID = "ysk-folding-chair";
export const STILT_GIFT_ID = "dl-mall-gift-card";
export const STILT_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const STILT_OWNED_IDS = [
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

export const STILT_REFUSE_COPY = "That one does not take a stilt note.";
export const STILT_TABLE_LINE = "I will not stilt it.";
export const STILT_RIM_LINE = "Still a diner rim.";
export const STILT_COFFEE_LINE = "Still holds coffee.";
export const STILT_NOTICE_TITLE =
  "I will not stilt it. Still a diner rim. Still holds coffee.";
export const STILT_WALK_LINE =
  "Walkers still want Sink Drawer to stilt it, or set kiln stilts so the diner rim fires off the shelf without a shop sprig.";
export const STILT_STAYS_LINE =
  "This is the stilt note. I will not stilt it. Still a diner rim. Still holds coffee.";
export const STILT_STILL_LINE =
  "Still tote. Not sprig. Not salt. Not a shop. Not jigger.";
export const STILT_TOTE_LINE = "Add to tote still works.";
export const STILT_EMPTY_LINE = "Nobody taped a stilt note yet.";
export const STILT_LEAVE_LINE = "Leave the rim";

const SERVER_STORE = Symbol.for("iss.stilt-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(STILT_OWNED_IDS);

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

export function parseStiltListingIds(
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

export function stiltCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const STILT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${STILT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(STILT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(STILT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${STILT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseStiltListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readStiltListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(STILT_STORAGE_KEY);
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
          window.localStorage.setItem(STILT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeStiltListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = stiltCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STILT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${STILT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(STILT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingStiltOverlay(
  listingId: string,
  listingIds: readonly string[] = readStiltListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === STILT_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === STILT_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === STILT_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeStilt(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== STILT_HOST_ID) {
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

export type StiltWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refuseStilt(listing: Listing | undefined): StiltWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== STILT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingStilt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStilt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingStilt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseStilt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeStilt(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STILT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(STILT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(STILT_CHANGED_EVENT, listener);
  };
}
