/**
 * I will not underfill it — the Game Boy stays cracked. Still tote.
 *
 * Pogo is spring-the-pads (on main). Clock is set-the-oscillator
 * (queued). Reball is put-new-spheres (queued / on main). Reflow
 * is heat-the-joints. Walkers still want Half-Working to underfill
 * it, or “flood shop epoxy under the CPU so Tetris stays fused
 * without a shop reball.” I will not underfill it. Still a crack.
 * Still Tetris. Still for sale. Not pogo. Not clock. Not a shop.
 * Not reball. Not reflow. Not flux. Not tin. Not bga. Not epoxy.
 * Not capillary.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:underfill-listing-ids` is the client underfill set.
 * Cookie `iss-underfill-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pogo, clock, reball, reflow, flux, tin, gift, buy,
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

export const UNDERFILL_STORAGE_KEY = "iss:underfill-listing-ids";
export const UNDERFILL_COOKIE_NAME = "iss-underfill-listing-ids";
export const UNDERFILL_CHANGED_EVENT = "iss:underfill-changed";

export const UNDERFILL_HOST_ID = "gtk-game-boy";
export const UNDERFILL_DRAWER_ID = "gtk-cable-drawer";
export const UNDERFILL_LID_ID = "kdr-lid-no-pot";
export const UNDERFILL_LUT_ID = "dl-camera-luts";
export const UNDERFILL_ZINE_ID = "dl-stain-zine";
export const UNDERFILL_CHAIR_ID = "ysk-folding-chair";
export const UNDERFILL_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const UNDERFILL_OWNED_IDS = [
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

export const UNDERFILL_REFUSE_COPY = "That one does not take an underfill note.";
export const UNDERFILL_TABLE_LINE = "I will not underfill it.";
export const UNDERFILL_CRACK_LINE = "Still a crack.";
export const UNDERFILL_TETRIS_LINE = "Still Tetris.";
export const UNDERFILL_NOTICE_TITLE =
  "I will not underfill it. Still a crack. Still Tetris.";
export const UNDERFILL_WALK_LINE =
  "Walkers still want Half-Working to underfill it, or flood shop epoxy under the CPU so Tetris stays fused without a shop reball.";
export const UNDERFILL_STAYS_LINE =
  "This is the underfill note. I will not underfill it. Still a crack. Still Tetris.";
export const UNDERFILL_STILL_LINE =
  "Still tote. Not pogo. Not clock. Not a shop. Not reball.";
export const UNDERFILL_TOTE_LINE = "Add to tote still works.";
export const UNDERFILL_EMPTY_LINE = "Nobody taped an underfill note yet.";
export const UNDERFILL_LEAVE_LINE = "Leave the crack";

const SERVER_STORE = Symbol.for("iss.underfill-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(UNDERFILL_OWNED_IDS);

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

export function parseUnderfillListingIds(
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

export function underfillCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const UNDERFILL_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${UNDERFILL_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(UNDERFILL_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(UNDERFILL_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${UNDERFILL_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseUnderfillListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readUnderfillListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(UNDERFILL_STORAGE_KEY);
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
          window.localStorage.setItem(UNDERFILL_STORAGE_KEY, JSON.stringify(ids));
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

export function writeUnderfillListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = underfillCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(UNDERFILL_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${UNDERFILL_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(UNDERFILL_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingUnderfillOverlay(
  listingId: string,
  listingIds: readonly string[] = readUnderfillListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === UNDERFILL_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === UNDERFILL_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === UNDERFILL_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeUnderfill(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== UNDERFILL_HOST_ID) {
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

export type UnderfillWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseUnderfill(
  listing: Listing | undefined,
): UnderfillWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== UNDERFILL_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingUnderfill(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseUnderfill(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingUnderfill(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseUnderfill(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeUnderfill(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === UNDERFILL_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(UNDERFILL_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(UNDERFILL_CHANGED_EVENT, listener);
  };
}
