/**
 * I will not deox it — the Game Boy slot stays dirty. Still tote.
 *
 * Line is the screen crack. Reflow is the joints. Recap is SRAM.
 * Speaker stays queued. Walkers still want Half-Working to deox the
 * slot, or “clean the contacts so Tetris reads every time.” I will
 * not deox it. Still a line. Still Tetris. Still for sale. Not
 * reflow. Not speaker. Not a shop. Not line.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:deox-listing-ids` is the client deox set.
 * Cookie `iss-deox-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write reflow, line, recap, glow, speaker, dump, cells, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. LUT, pack, gift, zine, drawer, lamp,
 * and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const DEOX_STORAGE_KEY = "iss:deox-listing-ids";
export const DEOX_COOKIE_NAME = "iss-deox-listing-ids";
export const DEOX_CHANGED_EVENT = "iss:deox-changed";

export const DEOX_HOST_ID = "gtk-game-boy";
export const DEOX_LUT_ID = "dl-camera-luts";
export const DEOX_PACK_ID = "dl-sample-pack";
export const DEOX_DRAWER_ID = "gtk-cable-drawer";
export const DEOX_LAMP_ID = "ysk-wobbly-lamp";
export const DEOX_ZINE_ID = "dl-stain-zine";
export const DEOX_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DEOX_OWNED_IDS = [
  DEOX_DRAWER_ID,
  DEOX_LAMP_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "dl-junk-pricing-pdf",
] as const;

export const DEOX_REFUSE_COPY = "That one does not take a deox note.";
export const DEOX_TABLE_LINE = "I will not deox it.";
export const DEOX_LINE_LINE = "Still a line.";
export const DEOX_TETRIS_LINE = "Still Tetris.";
export const DEOX_NOTICE_TITLE =
  "I will not deox it. Still a line. Still Tetris.";
export const DEOX_WALK_LINE =
  "Walkers still want Half-Working to deox the slot, or clean the contacts so Tetris reads every time.";
export const DEOX_STAYS_LINE =
  "This is the deox note. I will not deox it. Still a line. Still Tetris.";
export const DEOX_STILL_LINE =
  "Still tote. Not reflow. Not speaker. Not a shop. Not line.";
export const DEOX_TOTE_LINE = "Add to tote still works.";
export const DEOX_EMPTY_LINE = "Nobody taped a deox note yet.";
export const DEOX_LEAVE_LINE = "Leave the slot";

const SERVER_STORE = Symbol.for("iss.deox-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(DEOX_OWNED_IDS);

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

export function parseDeoxListingIds(
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

export function deoxCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DEOX_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DEOX_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DEOX_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DEOX_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DEOX_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDeoxListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDeoxListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DEOX_STORAGE_KEY);
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
          window.localStorage.setItem(DEOX_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDeoxListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = deoxCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DEOX_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DEOX_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DEOX_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDeoxOverlay(
  listingId: string,
  listingIds: readonly string[] = readDeoxListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLutListing(listing: Listing) {
  return listing.id === DEOX_LUT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === DEOX_PACK_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. LUT, pack, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeDeox(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DEOX_HOST_ID) {
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

export type DeoxWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lut"
  | "pack"
  | "owned";

function refuseDeox(listing: Listing | undefined): DeoxWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== DEOX_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDeox(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDeox(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDeox(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDeox(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDeox(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DEOX_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DEOX_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DEOX_CHANGED_EVENT, listener);
  };
}
