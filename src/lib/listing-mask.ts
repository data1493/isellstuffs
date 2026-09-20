/**
 * I will not mask it — the Game Boy solder mask stays off. Still tote.
 *
 * Deox is the slot. Reflow is the joints. Shield is the can.
 * Speaker stays queued. Walkers still want Half-Working to mask
 * the board, or “solder-mask the board so Tetris stays fused.”
 * I will not mask it. Still a board. Still fused. Still for sale.
 * Not deox. Not reflow. Not a shop. Not shield. Not speaker.
 * Not line. Not glow.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:mask-listing-ids` is the client mask set.
 * Cookie `iss-mask-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write deox, reflow, shield, speaker, line, glow, tin,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. LUT, pack, gift, zine, drawer, disc,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const MASK_STORAGE_KEY = "iss:mask-listing-ids";
export const MASK_COOKIE_NAME = "iss-mask-listing-ids";
export const MASK_CHANGED_EVENT = "iss:mask-changed";

export const MASK_HOST_ID = "gtk-game-boy";
export const MASK_LUT_ID = "dl-camera-luts";
export const MASK_PACK_ID = "dl-sample-pack";
export const MASK_DRAWER_ID = "gtk-cable-drawer";
export const MASK_DISC_ID = "ysk-burned-cdr";
export const MASK_LAMP_ID = "ysk-wobbly-lamp";
export const MASK_ZINE_ID = "dl-stain-zine";
export const MASK_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const MASK_OWNED_IDS = [
  MASK_DRAWER_ID,
  MASK_DISC_ID,
  MASK_LAMP_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "dl-junk-pricing-pdf",
] as const;

export const MASK_REFUSE_COPY = "That one does not take a mask note.";
export const MASK_TABLE_LINE = "I will not mask it.";
export const MASK_BOARD_LINE = "Still a board.";
export const MASK_FUSED_LINE = "Still fused.";
export const MASK_NOTICE_TITLE =
  "I will not mask it. Still a board. Still fused.";
export const MASK_WALK_LINE =
  "Walkers still want Half-Working to mask it, or solder-mask the board so Tetris stays fused.";
export const MASK_STAYS_LINE =
  "This is the mask note. I will not mask it. Still a board. Still fused.";
export const MASK_STILL_LINE =
  "Still tote. Not deox. Not reflow. Not a shop. Not shield.";
export const MASK_TOTE_LINE = "Add to tote still works.";
export const MASK_EMPTY_LINE = "Nobody taped a mask note yet.";
export const MASK_LEAVE_LINE = "Leave the board";

const SERVER_STORE = Symbol.for("iss.mask-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(MASK_OWNED_IDS);

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

export function parseMaskListingIds(
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

export function maskCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const MASK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${MASK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(MASK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(MASK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${MASK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseMaskListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readMaskListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(MASK_STORAGE_KEY);
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
          window.localStorage.setItem(MASK_STORAGE_KEY, JSON.stringify(ids));
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

export function writeMaskListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = maskCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(MASK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${MASK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(MASK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingMaskOverlay(
  listingId: string,
  listingIds: readonly string[] = readMaskListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLutListing(listing: Listing) {
  return listing.id === MASK_LUT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === MASK_PACK_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. LUT, pack, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeMask(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== MASK_HOST_ID) {
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

export type MaskWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lut"
  | "pack"
  | "owned";

function refuseMask(
  listing: Listing | undefined,
): MaskWriteReason | null {
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
  if (isLutListing(listing)) {
    return "lut";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (!isPhysicalListing(listing)) {
    return "digital";
  }
  if (isOwnedListing(listing) || listing.id !== MASK_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingMask(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseMask(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingMask(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseMask(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeMask(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === MASK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(MASK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(MASK_CHANGED_EVENT, listener);
  };
}
