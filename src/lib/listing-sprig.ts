/**
 * I will not sprig it — the mug stays chipped. Still a mug. Still tote.
 *
 * Salt is soda-the-chip. Pickle is acid-the-haze. Glaze is fired-coat.
 * Bisque is first-fire. Fettle is dress-the-rim. Chip is the rim.
 * Walkers still want Sink Drawer to sprig it, or press a shop relief
 * so the diner chip reads as decoration without a shop glaze. I will
 * not sprig it. Still a chip. Still a mug. Still for sale. Not salt.
 * Not pickle. Not a shop. Not glaze.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:sprig-listing-ids` is the client sprig set.
 * Cookie `iss-sprig-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write salt, pickle, glaze, bisque, fettle, chip, handle, gilt,
 * applique, relief, luster, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const SPRIG_STORAGE_KEY = "iss:sprig-listing-ids";
export const SPRIG_COOKIE_NAME = "iss-sprig-listing-ids";
export const SPRIG_CHANGED_EVENT = "iss:sprig-changed";

export const SPRIG_HOST_ID = "kdr-chipped-mug";
export const SPRIG_LID_ID = "kdr-lid-no-pot";
export const SPRIG_WHISK_ID = "kdr-bent-whisk";
export const SPRIG_RECIPES_ID = "dl-drawer-recipes";
export const SPRIG_CHAIR_ID = "ysk-folding-chair";
export const SPRIG_GIFT_ID = "dl-mall-gift-card";
export const SPRIG_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SPRIG_OWNED_IDS = [
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
  "dl-camera-luts",
] as const;

export const SPRIG_REFUSE_COPY = "That one does not take a sprig note.";
export const SPRIG_TABLE_LINE = "I will not sprig it.";
export const SPRIG_CHIP_LINE = "Still a chip.";
export const SPRIG_MUG_LINE = "Still a mug.";
export const SPRIG_NOTICE_TITLE =
  "I will not sprig it. Still a chip. Still a mug.";
export const SPRIG_WALK_LINE =
  "Walkers still want Sink Drawer to sprig it, or press a shop relief so the diner chip reads as decoration without a shop glaze.";
export const SPRIG_STAYS_LINE =
  "This is the sprig note. I will not sprig it. Still a chip. Still a mug.";
export const SPRIG_STILL_LINE =
  "Still tote. Not salt. Not pickle. Not a shop. Not glaze.";
export const SPRIG_TOTE_LINE = "Add to tote still works.";
export const SPRIG_EMPTY_LINE = "Nobody taped a sprig note yet.";
export const SPRIG_LEAVE_LINE = "Leave the chip";

const SERVER_STORE = Symbol.for("iss.sprig-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(SPRIG_OWNED_IDS);

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

export function parseSprigListingIds(
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

export function sprigCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SPRIG_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SPRIG_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SPRIG_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SPRIG_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SPRIG_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseSprigListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readSprigListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SPRIG_STORAGE_KEY);
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
          window.localStorage.setItem(SPRIG_STORAGE_KEY, JSON.stringify(ids));
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

export function writeSprigListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = sprigCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SPRIG_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SPRIG_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SPRIG_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingSprigOverlay(
  listingId: string,
  listingIds: readonly string[] = readSprigListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === SPRIG_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === SPRIG_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === SPRIG_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeSprig(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SPRIG_HOST_ID) {
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

export type SprigWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refuseSprig(listing: Listing | undefined): SprigWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== SPRIG_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingSprig(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSprig(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingSprig(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseSprig(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeSprig(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SPRIG_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SPRIG_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SPRIG_CHANGED_EVENT, listener);
  };
}
