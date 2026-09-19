/**
 * I will not anneal it — the whisk stays splay and metal. Still tote.
 *
 * Bent is the splay. Tines is no spare wire. Rust is the rust.
 * Oil is the squeak. Walkers still want Sink Drawer to anneal the
 * whisk, or “make the balloon come back.” I will not anneal it.
 * Still splay. Still metal. Still for sale. Not bent. Not tines.
 * Not rust.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:anneal-listing-ids` is the client anneal set.
 * Cookie `iss-anneal-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write bent, tines, rust, oil, soap, heat, dishes, towel,
 * mug-story, lid-pane, recipe-scale, azimuth, nest, grommet, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `kdr-bent-whisk` only. Mug, lid, recipes, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ANNEAL_STORAGE_KEY = "iss:anneal-listing-ids";
export const ANNEAL_COOKIE_NAME = "iss-anneal-listing-ids";
export const ANNEAL_CHANGED_EVENT = "iss:anneal-changed";

export const ANNEAL_HOST_ID = "kdr-bent-whisk";
export const ANNEAL_MUG_ID = "kdr-chipped-mug";
export const ANNEAL_LID_ID = "kdr-lid-no-pot";
export const ANNEAL_RECIPES_ID = "dl-drawer-recipes";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const ANNEAL_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
] as const;

export const ANNEAL_REFUSE_COPY = "That one does not take an anneal note.";
export const ANNEAL_TABLE_LINE = "I will not anneal it.";
export const ANNEAL_SPLAY_LINE = "Still splay.";
export const ANNEAL_METAL_LINE = "Still metal.";
export const ANNEAL_NOTICE_TITLE =
  "I will not anneal it. Still splay. Still metal.";
export const ANNEAL_WALK_LINE =
  "Walkers still want Sink Drawer to anneal the whisk, or make the balloon come back.";
export const ANNEAL_STAYS_LINE =
  "This is the anneal note. I will not anneal it. Still splay. Still metal.";
export const ANNEAL_STILL_LINE = "Still tote. Not bent. Not tines. Not rust.";
export const ANNEAL_TOTE_LINE = "Add to tote still works.";
export const ANNEAL_EMPTY_LINE = "Nobody taped an anneal note yet.";
export const ANNEAL_LEAVE_LINE = "Leave the splay";

const SERVER_STORE = Symbol.for("iss.anneal-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(ANNEAL_OWNED_IDS);

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

export function parseAnnealListingIds(
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

export function annealCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ANNEAL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ANNEAL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ANNEAL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ANNEAL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ANNEAL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseAnnealListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readAnnealListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ANNEAL_STORAGE_KEY);
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
          window.localStorage.setItem(ANNEAL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeAnnealListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = annealCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ANNEAL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ANNEAL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ANNEAL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingAnnealOverlay(
  listingId: string,
  listingIds: readonly string[] = readAnnealListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === ANNEAL_MUG_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === ANNEAL_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host whisk only. Mug, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeAnneal(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== ANNEAL_HOST_ID) {
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

export type AnnealWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "lid"
  | "owned";

function refuseAnneal(
  listing: Listing | undefined,
): AnnealWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== ANNEAL_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingAnneal(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAnneal(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingAnneal(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseAnneal(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeAnneal(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ANNEAL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ANNEAL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ANNEAL_CHANGED_EVENT, listener);
  };
}
