/**
 * I will not coggle it — the diner mug stays a diner rim. Still holds coffee.
 *
 * Sprig is press-the-relief (on main). Stilt is kiln-the-rim (queued /
 * on main, unowned). Jigger is throw-the-wheel (queued / on main,
 * unowned). Salt is soda-the-chip (queued). Pickle is acid-the-haze.
 * Glaze is fired-coat. Walkers still want Sink Drawer to coggle it,
 * or “roll a shop cog so the diner rim reads factory-fluted without
 * a shop sprig.” I will not coggle it. Still a diner rim. Still holds
 * coffee. Still for sale. Not sprig. Not stilt. Not a shop. Not jigger.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:coggle-listing-ids` is the client coggle set.
 * Cookie `iss-coggle-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write sprig, stilt, jigger, salt, pickle, glaze, roulette,
 * cog, fluting, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const COGGLE_STORAGE_KEY = "iss:coggle-listing-ids";
export const COGGLE_COOKIE_NAME = "iss-coggle-listing-ids";
export const COGGLE_CHANGED_EVENT = "iss:coggle-changed";

export const COGGLE_HOST_ID = "kdr-chipped-mug";
export const COGGLE_LID_ID = "kdr-lid-no-pot";
export const COGGLE_WHISK_ID = "kdr-bent-whisk";
export const COGGLE_RECIPES_ID = "dl-drawer-recipes";
export const COGGLE_CHAIR_ID = "ysk-folding-chair";
export const COGGLE_GIFT_ID = "dl-mall-gift-card";
export const COGGLE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const COGGLE_OWNED_IDS = [
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

export const COGGLE_REFUSE_COPY = "That one does not take a coggle note.";
export const COGGLE_TABLE_LINE = "I will not coggle it.";
export const COGGLE_RIM_LINE = "Still a diner rim.";
export const COGGLE_COFFEE_LINE = "Still holds coffee.";
export const COGGLE_NOTICE_TITLE =
  "I will not coggle it. Still a diner rim. Still holds coffee.";
export const COGGLE_WALK_LINE =
  "Walkers still want Sink Drawer to coggle it, or roll a shop cog so the diner rim reads factory-fluted without a shop sprig.";
export const COGGLE_STAYS_LINE =
  "This is the coggle note. I will not coggle it. Still a diner rim. Still holds coffee.";
export const COGGLE_STILL_LINE =
  "Still tote. Not sprig. Not stilt. Not a shop. Not jigger.";
export const COGGLE_TOTE_LINE = "Add to tote still works.";
export const COGGLE_EMPTY_LINE = "Nobody taped a coggle note yet.";
export const COGGLE_LEAVE_LINE = "Leave the rim";

const SERVER_STORE = Symbol.for("iss.coggle-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(COGGLE_OWNED_IDS);

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

export function parseCoggleListingIds(
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

export function coggleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const COGGLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${COGGLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(COGGLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(COGGLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${COGGLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseCoggleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readCoggleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(COGGLE_STORAGE_KEY);
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
          window.localStorage.setItem(COGGLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeCoggleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = coggleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(COGGLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${COGGLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(COGGLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingCoggleOverlay(
  listingId: string,
  listingIds: readonly string[] = readCoggleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === COGGLE_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === COGGLE_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === COGGLE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeCoggle(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== COGGLE_HOST_ID) {
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

export type CoggleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refuseCoggle(listing: Listing | undefined): CoggleWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== COGGLE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingCoggle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCoggle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingCoggle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseCoggle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeCoggle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === COGGLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(COGGLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(COGGLE_CHANGED_EVENT, listener);
  };
}
