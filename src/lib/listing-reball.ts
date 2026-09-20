/**
 * I will not reball it — the Game Boy stays cracked. Still tote.
 *
 * Pogo is spring-the-pads (on main). Clock is set-the-oscillator
 * (queued). Reflow is heat-the-joints. Flux is wet-the-copper.
 * Walkers still want Half-Working to reball it, or “put new
 * spheres on the CPU so Tetris reads shop-solid without a shop
 * pogo.” I will not reball it. Still a crack. Still Tetris.
 * Still for sale. Not pogo. Not clock. Not a shop. Not reflow.
 * Not flux. Not tin. Not bga. Not stencil. Not crystal.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:reball-listing-ids` is the client reball set.
 * Cookie `iss-reball-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pogo, clock, reflow, flux, tin, shield, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const REBALL_STORAGE_KEY = "iss:reball-listing-ids";
export const REBALL_COOKIE_NAME = "iss-reball-listing-ids";
export const REBALL_CHANGED_EVENT = "iss:reball-changed";

export const REBALL_HOST_ID = "gtk-game-boy";
export const REBALL_DRAWER_ID = "gtk-cable-drawer";
export const REBALL_LID_ID = "kdr-lid-no-pot";
export const REBALL_LUT_ID = "dl-camera-luts";
export const REBALL_ZINE_ID = "dl-stain-zine";
export const REBALL_CHAIR_ID = "ysk-folding-chair";
export const REBALL_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const REBALL_OWNED_IDS = [
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
  "dl-crate-side-a",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
] as const;

export const REBALL_REFUSE_COPY = "That one does not take a reball note.";
export const REBALL_TABLE_LINE = "I will not reball it.";
export const REBALL_CRACK_LINE = "Still a crack.";
export const REBALL_TETRIS_LINE = "Still Tetris.";
export const REBALL_NOTICE_TITLE =
  "I will not reball it. Still a crack. Still Tetris.";
export const REBALL_WALK_LINE =
  "Walkers still want Half-Working to reball it, or put new spheres on the CPU so Tetris reads shop-solid without a shop pogo.";
export const REBALL_STAYS_LINE =
  "This is the reball note. I will not reball it. Still a crack. Still Tetris.";
export const REBALL_STILL_LINE =
  "Still tote. Not pogo. Not clock. Not a shop. Not reflow.";
export const REBALL_TOTE_LINE = "Add to tote still works.";
export const REBALL_EMPTY_LINE = "Nobody taped a reball note yet.";
export const REBALL_LEAVE_LINE = "Leave the spheres";

const SERVER_STORE = Symbol.for("iss.reball-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(REBALL_OWNED_IDS);

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

export function parseReballListingIds(
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

export function reballCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const REBALL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${REBALL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(REBALL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(REBALL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${REBALL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseReballListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readReballListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(REBALL_STORAGE_KEY);
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
          window.localStorage.setItem(REBALL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeReballListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = reballCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(REBALL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${REBALL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(REBALL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingReballOverlay(
  listingId: string,
  listingIds: readonly string[] = readReballListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === REBALL_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === REBALL_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === REBALL_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeReball(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== REBALL_HOST_ID) {
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

export type ReballWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseReball(
  listing: Listing | undefined,
): ReballWriteReason | null {
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
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== REBALL_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingReball(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseReball(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingReball(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseReball(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeReball(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === REBALL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(REBALL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(REBALL_CHANGED_EVENT, listener);
  };
}
