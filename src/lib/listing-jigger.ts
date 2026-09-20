/**
 * I will not jigger it — the diner mug stays a diner rim. Still holds coffee.
 *
 * Sprig is press-the-relief. Salt is soda-the-chip. Pickle is acid-the-haze.
 * Glaze is fired-coat. Bisque is first-fire. Walkers still want Sink Drawer
 * to jigger it, or throw it on a shop wheel so the diner rim reads
 * factory-round without a shop sprig. I will not jigger it. Still a diner
 * rim. Still holds coffee. Still for sale. Not sprig. Not salt. Not a shop.
 * Not pickle.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:jigger-listing-ids` is the client jigger set.
 * Cookie `iss-jigger-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write sprig, salt, pickle, glaze, bisque, chip, handle, gilt,
 * wheel, throw, chuck, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const JIGGER_STORAGE_KEY = "iss:jigger-listing-ids";
export const JIGGER_COOKIE_NAME = "iss-jigger-listing-ids";
export const JIGGER_CHANGED_EVENT = "iss:jigger-changed";

export const JIGGER_HOST_ID = "kdr-chipped-mug";
export const JIGGER_LID_ID = "kdr-lid-no-pot";
export const JIGGER_WHISK_ID = "kdr-bent-whisk";
export const JIGGER_RECIPES_ID = "dl-drawer-recipes";
export const JIGGER_CHAIR_ID = "ysk-folding-chair";
export const JIGGER_GIFT_ID = "dl-mall-gift-card";
export const JIGGER_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const JIGGER_OWNED_IDS = [
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

export const JIGGER_REFUSE_COPY = "That one does not take a jigger note.";
export const JIGGER_TABLE_LINE = "I will not jigger it.";
export const JIGGER_RIM_LINE = "Still a diner rim.";
export const JIGGER_COFFEE_LINE = "Still holds coffee.";
export const JIGGER_NOTICE_TITLE =
  "I will not jigger it. Still a diner rim. Still holds coffee.";
export const JIGGER_WALK_LINE =
  "Walkers still want Sink Drawer to jigger it, or throw it on a shop wheel so the diner rim reads factory-round without a shop sprig.";
export const JIGGER_STAYS_LINE =
  "This is the jigger note. I will not jigger it. Still a diner rim. Still holds coffee.";
export const JIGGER_STILL_LINE =
  "Still tote. Not sprig. Not salt. Not a shop. Not pickle.";
export const JIGGER_TOTE_LINE = "Add to tote still works.";
export const JIGGER_EMPTY_LINE = "Nobody taped a jigger note yet.";
export const JIGGER_LEAVE_LINE = "Leave the rim";

const SERVER_STORE = Symbol.for("iss.jigger-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(JIGGER_OWNED_IDS);

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

export function parseJiggerListingIds(
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

export function jiggerCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const JIGGER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${JIGGER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(JIGGER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(JIGGER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${JIGGER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseJiggerListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readJiggerListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(JIGGER_STORAGE_KEY);
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
          window.localStorage.setItem(JIGGER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeJiggerListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = jiggerCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(JIGGER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${JIGGER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(JIGGER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingJiggerOverlay(
  listingId: string,
  listingIds: readonly string[] = readJiggerListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === JIGGER_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === JIGGER_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === JIGGER_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeJigger(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== JIGGER_HOST_ID) {
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

export type JiggerWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refuseJigger(listing: Listing | undefined): JiggerWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== JIGGER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingJigger(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseJigger(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingJigger(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseJigger(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeJigger(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === JIGGER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(JIGGER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(JIGGER_CHANGED_EVENT, listener);
  };
}
