/**
 * I will not weld them — the jewels stay five empties. Still tote.
 *
 * Foam is jewel-pad. Nest is Civic-seat. Tumble is roll-the-plastics.
 * Inlay stays queued. Walkers still want Sunday Crate to weld them, or
 * “ultrasonic the empties so the five look closed without a shop inlay.”
 * I will not weld them. Still five empties. Still one hinge gone.
 * Still for sale. Not foam. Not nest. Not a shop. Not inlay.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:weld-listing-ids` is the client weld set.
 * Cookie `iss-weld-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write foam, nest, inlay, author, tray, tumble, hinge, vacuum,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `mdb-jewel-stack` only. LP, mixtape, liner PDF, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const WELD_STORAGE_KEY = "iss:weld-listing-ids";
export const WELD_COOKIE_NAME = "iss-weld-listing-ids";
export const WELD_CHANGED_EVENT = "iss:weld-changed";

export const WELD_HOST_ID = "mdb-jewel-stack";
export const WELD_LP_ID = "mdb-scratched-lp";
export const WELD_MIXTAPE_ID = "mdb-mixtape-93";
export const WELD_LINER_ID = "dl-crate-side-a";
export const WELD_CHAIR_ID = "ysk-folding-chair";
export const WELD_GIFT_ID = "dl-mall-gift-card";
export const WELD_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const WELD_OWNED_IDS = [
  WELD_LP_ID,
  WELD_MIXTAPE_ID,
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
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(WELD_OWNED_IDS);

export const WELD_REFUSE_COPY = "That one does not take a weld note.";
export const WELD_TABLE_LINE = "I will not weld them.";
export const WELD_EMPTIES_LINE = "Still five empties.";
export const WELD_HINGE_LINE = "Still one hinge gone.";
export const WELD_NOTICE_TITLE =
  "I will not weld them. Still five empties. Still one hinge gone.";
export const WELD_WALK_LINE =
  "Walkers still want Sunday Crate to weld them, or ultrasonic the empties so the five look closed without a shop inlay.";
export const WELD_STAYS_LINE =
  "This is the weld note. I will not weld them. Still five empties. Still one hinge gone.";
export const WELD_STILL_LINE =
  "Still tote. Not foam. Not nest. Not a shop. Not inlay.";
export const WELD_TOTE_LINE = "Add to tote still works.";
export const WELD_EMPTY_LINE = "Nobody taped a weld note yet.";
export const WELD_LEAVE_LINE = "Leave the empties";

const SERVER_STORE = Symbol.for("iss.weld-listing-ids");

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

export function parseWeldListingIds(
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

export function weldCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WELD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WELD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WELD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WELD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WELD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWeldListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWeldListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WELD_STORAGE_KEY);
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
          window.localStorage.setItem(WELD_STORAGE_KEY, JSON.stringify(ids));
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

export function writeWeldListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = weldCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WELD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WELD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WELD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWeldOverlay(
  listingId: string,
  listingIds: readonly string[] = readWeldListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLpListing(listing: Listing) {
  return listing.id === WELD_LP_ID;
}

function isMixtapeListing(listing: Listing) {
  return listing.id === WELD_MIXTAPE_ID;
}

function isLinerListing(listing: Listing) {
  return listing.id === WELD_LINER_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === WELD_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jewel stack only. LP, mixtape, liner, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeWeld(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== WELD_HOST_ID) {
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

export type WeldWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lp"
  | "mixtape"
  | "liner"
  | "chair"
  | "owned";

function refuseWeld(listing: Listing | undefined): WeldWriteReason | null {
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
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isOwnedListing(listing) || listing.id !== WELD_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingWeld(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseWeld(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingWeld(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseWeld(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeWeld(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WELD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WELD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WELD_CHANGED_EVENT, listener);
  };
}
