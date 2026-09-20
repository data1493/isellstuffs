/**
 * I will not pogo it — the Game Boy cart stays fused. Still tote.
 *
 * Clock is set-the-crystal (queued). Shield is can-the-board.
 * Recap is save-battery. Mask is solder-mask. Walkers still
 * want Half-Working to pogo it, or “spring the fused cart so
 * Tetris seats without a shop recase.” I will not pogo it.
 * Still a cart. Still Tetris. Still for sale. Not clock. Not
 * shield. Not a shop. Not recap. Not mask. Not line.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pogo-listing-ids` is the client pogo set.
 * Cookie `iss-pogo-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write clock, shield, recap, mask, line, speaker, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. Drawer, disc, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const POGO_STORAGE_KEY = "iss:pogo-listing-ids";
export const POGO_COOKIE_NAME = "iss-pogo-listing-ids";
export const POGO_CHANGED_EVENT = "iss:pogo-changed";

export const POGO_HOST_ID = "gtk-game-boy";
export const POGO_DRAWER_ID = "gtk-cable-drawer";
export const POGO_DISC_ID = "ysk-burned-cdr";
export const POGO_LUT_ID = "dl-camera-luts";
export const POGO_ZINE_ID = "dl-stain-zine";
export const POGO_CHAIR_ID = "ysk-folding-chair";
export const POGO_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const POGO_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
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
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

export const POGO_REFUSE_COPY = "That one does not take a pogo note.";
export const POGO_TABLE_LINE = "I will not pogo it.";
export const POGO_CART_LINE = "Still a cart.";
export const POGO_TETRIS_LINE = "Still Tetris.";
export const POGO_NOTICE_TITLE =
  "I will not pogo it. Still a cart. Still Tetris.";
export const POGO_WALK_LINE =
  "Walkers still want Half-Working to pogo it, or spring the fused cart so Tetris seats without a shop recase.";
export const POGO_STAYS_LINE =
  "This is the pogo note. I will not pogo it. Still a cart. Still Tetris.";
export const POGO_STILL_LINE =
  "Still tote. Not clock. Not shield. Not a shop. Not recap.";
export const POGO_TOTE_LINE = "Add to tote still works.";
export const POGO_EMPTY_LINE = "Nobody taped a pogo note yet.";
export const POGO_LEAVE_LINE = "Leave the cart";

const SERVER_STORE = Symbol.for("iss.pogo-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(POGO_OWNED_IDS);

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

export function parsePogoListingIds(
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

export function pogoCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const POGO_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${POGO_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(POGO_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(POGO_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${POGO_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePogoListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPogoListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(POGO_STORAGE_KEY);
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
          window.localStorage.setItem(POGO_STORAGE_KEY, JSON.stringify(ids));
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

export function writePogoListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pogoCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(POGO_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${POGO_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(POGO_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPogoOverlay(
  listingId: string,
  listingIds: readonly string[] = readPogoListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === POGO_DRAWER_ID;
}

function isDiscListing(listing: Listing) {
  return listing.id === POGO_DISC_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === POGO_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, disc, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePogo(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== POGO_HOST_ID) {
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

export type PogoWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "disc"
  | "chair"
  | "owned";

function refusePogo(
  listing: Listing | undefined,
): PogoWriteReason | null {
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
  if (isDrawerListing(listing)) {
    return "drawer";
  }
  if (isDiscListing(listing)) {
    return "disc";
  }
  if (isOwnedListing(listing) || listing.id !== POGO_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPogo(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePogo(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPogo(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePogo(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePogo(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === POGO_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(POGO_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(POGO_CHANGED_EVENT, listener);
  };
}
