/**
 * I will not countersink it — the lid stays a lid. Still no pot.
 *
 * Snug is finger-tight-the-knob. Tap is thread-the-lid. Spotface is
 * machine-a-flat. Lap is grind-the-rim. Walkers still want Sink
 * Drawer to countersink it, or “cut a shop cone so the knob sits
 * flush without a shop snug.” I will not countersink it. Still a
 * lid. Still no pot. Still for sale. Not snug. Not tap. Not a shop.
 * Not spotface.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:countersink-listing-ids` is the client set.
 * Cookie `iss-countersink-listing-ids` is the same JSON so PDPs SSR
 * the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write snug, tap, spotface, lap, face, braze, cone, flush,
 * csink, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, recipes, whisk, lamp, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const COUNTERSINK_STORAGE_KEY = "iss:countersink-listing-ids";
export const COUNTERSINK_COOKIE_NAME = "iss-countersink-listing-ids";
export const COUNTERSINK_CHANGED_EVENT = "iss:countersink-changed";

export const COUNTERSINK_HOST_ID = "kdr-lid-no-pot";
export const COUNTERSINK_MUG_ID = "kdr-chipped-mug";
export const COUNTERSINK_WHISK_ID = "kdr-bent-whisk";
export const COUNTERSINK_RECIPES_ID = "dl-drawer-recipes";
export const COUNTERSINK_LAMP_ID = "ysk-wobbly-lamp";
export const COUNTERSINK_CHAIR_ID = "ysk-folding-chair";
export const COUNTERSINK_GIFT_ID = "dl-mall-gift-card";
export const COUNTERSINK_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const COUNTERSINK_OWNED_IDS = [
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
  "mdb-scratched-lp",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(COUNTERSINK_OWNED_IDS);

export const COUNTERSINK_REFUSE_COPY =
  "That one does not take a countersink note.";
export const COUNTERSINK_TABLE_LINE = "I will not countersink it.";
export const COUNTERSINK_LID_LINE = "Still a lid.";
export const COUNTERSINK_POT_LINE = "Still no pot.";
export const COUNTERSINK_NOTICE_TITLE =
  "I will not countersink it. Still a lid. Still no pot.";
export const COUNTERSINK_WALK_LINE =
  "Walkers still want Sink Drawer to countersink it, or cut a shop cone so the knob sits flush without a shop snug.";
export const COUNTERSINK_STAYS_LINE =
  "This is the countersink note. I will not countersink it. Still a lid. Still no pot.";
export const COUNTERSINK_STILL_LINE =
  "Still tote. Not snug. Not tap. Not a shop. Not spotface.";
export const COUNTERSINK_TOTE_LINE = "Add to tote still works.";
export const COUNTERSINK_EMPTY_LINE = "Nobody taped a countersink note yet.";
export const COUNTERSINK_LEAVE_LINE = "Leave the hole";

const SERVER_STORE = Symbol.for("iss.countersink-listing-ids");

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

export function parseCountersinkListingIds(
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

export function countersinkCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const COUNTERSINK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${COUNTERSINK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(COUNTERSINK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(COUNTERSINK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${COUNTERSINK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCountersinkListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCountersinkListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(COUNTERSINK_STORAGE_KEY);
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
          window.localStorage.setItem(
            COUNTERSINK_STORAGE_KEY,
            JSON.stringify(ids),
          );
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

export function writeCountersinkListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = countersinkCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(COUNTERSINK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${COUNTERSINK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(COUNTERSINK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCountersinkOverlay(
  listingId: string,
  listingIds: readonly string[] = readCountersinkListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === COUNTERSINK_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === COUNTERSINK_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === COUNTERSINK_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeCountersink(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== COUNTERSINK_HOST_ID) {
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

export type CountersinkWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

function refuseCountersink(
  listing: Listing | undefined,
): CountersinkWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isOwnedListing(listing) || listing.id !== COUNTERSINK_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCountersink(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCountersink(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCountersink(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCountersink(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCountersink(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === COUNTERSINK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(COUNTERSINK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COUNTERSINK_CHANGED_EVENT, listener);
  };
}
