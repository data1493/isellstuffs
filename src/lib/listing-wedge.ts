/**
 * I will not wedge it — the lid stays a lid. Still no pot.
 *
 * Sine is set-the-plate. Wring is wring-the-blocks.
 * Blanchard is rotary-grind-the-lid. Dress is dress-the-stone.
 * Flycut is skim-the-glass. Snug is finger-tight-the-knob.
 * Countersink is cut-the-cone. Spotface is machine-a-flat.
 * Walkers still want Sink Drawer to wedge it, or “set a shop
 * angle wedge so the lid proves a rise without a shop sine.”
 * I will not wedge it. Still a lid. Still no pot. Still for
 * sale. Not sine. Not wring. Not a shop. Not countersink.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:wedge-listing-ids` is the client set.
 * Cookie `iss-wedge-listing-ids` is the same JSON so PDPs SSR
 * the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write sine, wring, blanchard, dress, flycut, snug,
 * countersink, spotface, trepan, lap, tap, clinometer, parallel,
 * compound, incline, rotary, cupwheel, surfacegrind, granite,
 * joblock, interferometer, sinebar, angleblock, jo, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const WEDGE_STORAGE_KEY = "iss:wedge-listing-ids";
export const WEDGE_COOKIE_NAME = "iss-wedge-listing-ids";
export const WEDGE_CHANGED_EVENT = "iss:wedge-changed";

export const WEDGE_HOST_ID = "kdr-lid-no-pot";
export const WEDGE_MUG_ID = "kdr-chipped-mug";
export const WEDGE_WHISK_ID = "kdr-bent-whisk";
export const WEDGE_RECIPES_ID = "dl-drawer-recipes";
export const WEDGE_CHAIR_ID = "ysk-folding-chair";
export const WEDGE_GIFT_ID = "dl-mall-gift-card";
export const WEDGE_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const WEDGE_OWNED_IDS = [
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
  "dl-drawer-recipes",
] as const;

const ownedSet = new Set<string>(WEDGE_OWNED_IDS);

export const WEDGE_REFUSE_COPY = "That one does not take a wedge note.";
export const WEDGE_TABLE_LINE = "I will not wedge it.";
export const WEDGE_LID_LINE = "Still a lid.";
export const WEDGE_POT_LINE = "Still no pot.";
export const WEDGE_NOTICE_TITLE =
  "I will not wedge it. Still a lid. Still no pot.";
export const WEDGE_WALK_LINE =
  "Walkers still want Sink Drawer to wedge it, or set a shop angle wedge so the lid proves a rise without a shop sine.";
export const WEDGE_STAYS_LINE =
  "This is the wedge note. I will not wedge it. Still a lid. Still no pot.";
export const WEDGE_STILL_LINE =
  "Still tote. Not sine. Not wring. Not a shop. Not countersink.";
export const WEDGE_TOTE_LINE = "Add to tote still works.";
export const WEDGE_EMPTY_LINE = "Nobody taped a wedge note yet.";
export const WEDGE_LEAVE_LINE = "Leave the rise";

const SERVER_STORE = Symbol.for("iss.wedge-listing-ids");

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

export function parseWedgeListingIds(
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

export function wedgeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WEDGE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WEDGE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WEDGE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WEDGE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WEDGE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWedgeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWedgeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WEDGE_STORAGE_KEY);
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
          window.localStorage.setItem(WEDGE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeWedgeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = wedgeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WEDGE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WEDGE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WEDGE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWedgeOverlay(
  listingId: string,
  listingIds: readonly string[] = readWedgeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === WEDGE_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === WEDGE_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === WEDGE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeWedge(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== WEDGE_HOST_ID) {
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

export type WedgeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

function refuseWedge(
  listing: Listing | undefined,
): WedgeWriteReason | null {
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
  if (isChairListing(listing)) {
    return "chair";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isOwnedListing(listing) || listing.id !== WEDGE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingWedge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseWedge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingWedge(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseWedge(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeWedge(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WEDGE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WEDGE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WEDGE_CHANGED_EVENT, listener);
  };
}
