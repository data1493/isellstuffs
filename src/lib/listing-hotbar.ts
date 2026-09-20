/**
 * I will not hotbar it — the Game Boy stays cracked. Still tote.
 *
 * Pogo is spring-the-pads (on main). Underfill is flood-the-epoxy
 * (queued). Reball is put-new-spheres (on main). Fillet is
 * wet-the-toe (queued). Clock is set-the-oscillator (queued).
 * Walkers still want Half-Working to hotbar it, or “pulse-bond
 * the flex so Tetris reads shop-welded without a shop pogo.”
 * I will not hotbar it. Still a crack. Still Tetris. Still for
 * sale. Not pogo. Not underfill. Not a shop. Not reball. Not
 * fillet. Not clock. Not reflow. Not pulse. Not anvil. Not tcp.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:hotbar-listing-ids` is the client hotbar set.
 * Cookie `iss-hotbar-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pogo, underfill, reball, fillet, clock, reflow, flux,
 * tin, knockout, caliper, pulse, anvil, tcp, gift, buy, digital
 * eligibility, or tote keys.
 * Host is `gtk-game-boy` only. Drawer, lid, LUT, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const HOTBAR_STORAGE_KEY = "iss:hotbar-listing-ids";
export const HOTBAR_COOKIE_NAME = "iss-hotbar-listing-ids";
export const HOTBAR_CHANGED_EVENT = "iss:hotbar-changed";

export const HOTBAR_HOST_ID = "gtk-game-boy";
export const HOTBAR_DRAWER_ID = "gtk-cable-drawer";
export const HOTBAR_LID_ID = "kdr-lid-no-pot";
export const HOTBAR_LUT_ID = "dl-camera-luts";
export const HOTBAR_ZINE_ID = "dl-stain-zine";
export const HOTBAR_CHAIR_ID = "ysk-folding-chair";
export const HOTBAR_GIFT_ID = "dl-mall-gift-card";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const HOTBAR_OWNED_IDS = [
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

export const HOTBAR_REFUSE_COPY = "That one does not take a hotbar note.";
export const HOTBAR_TABLE_LINE = "I will not hotbar it.";
export const HOTBAR_CRACK_LINE = "Still a crack.";
export const HOTBAR_TETRIS_LINE = "Still Tetris.";
export const HOTBAR_NOTICE_TITLE =
  "I will not hotbar it. Still a crack. Still Tetris.";
export const HOTBAR_WALK_LINE =
  "Walkers still want Half-Working to hotbar it, or pulse-bond the flex so Tetris reads shop-welded without a shop pogo.";
export const HOTBAR_STAYS_LINE =
  "This is the hotbar note. I will not hotbar it. Still a crack. Still Tetris.";
export const HOTBAR_STILL_LINE =
  "Still tote. Not pogo. Not underfill. Not a shop. Not reball.";
export const HOTBAR_TOTE_LINE = "Add to tote still works.";
export const HOTBAR_EMPTY_LINE = "Nobody taped a hotbar note yet.";
export const HOTBAR_LEAVE_LINE = "Leave the flex";

const SERVER_STORE = Symbol.for("iss.hotbar-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(HOTBAR_OWNED_IDS);

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

export function parseHotbarListingIds(
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

export function hotbarCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HOTBAR_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HOTBAR_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HOTBAR_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HOTBAR_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HOTBAR_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHotbarListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHotbarListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HOTBAR_STORAGE_KEY);
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
          window.localStorage.setItem(HOTBAR_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHotbarListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = hotbarCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HOTBAR_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HOTBAR_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HOTBAR_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHotbarOverlay(
  listingId: string,
  listingIds: readonly string[] = readHotbarListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isDrawerListing(listing: Listing) {
  return listing.id === HOTBAR_DRAWER_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === HOTBAR_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === HOTBAR_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. Drawer, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeHotbar(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== HOTBAR_HOST_ID) {
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

export type HotbarWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "drawer"
  | "lid"
  | "chair"
  | "owned";

function refuseHotbar(
  listing: Listing | undefined,
): HotbarWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== HOTBAR_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingHotbar(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHotbar(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingHotbar(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHotbar(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeHotbar(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HOTBAR_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HOTBAR_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HOTBAR_CHANGED_EVENT, listener);
  };
}
