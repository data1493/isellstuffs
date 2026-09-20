/**
 * I will not shield it — the Game Boy can stays off. Still tote.
 *
 * Line is the screen crack. Reflow is the joints. Contrast is the
 * wheel. Deox is the slot. Speaker stays queued. Walkers still want
 * Half-Working to shield the board, or “put the can back so Tetris
 * stays quiet.” I will not shield it. Still a line. Still Tetris.
 * Still for sale. Not reflow. Not contrast. Not deox. Not speaker.
 * Not line.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:shield-listing-ids` is the client shield set.
 * Cookie `iss-shield-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write reflow, contrast, deox, speaker, line, recap, glow,
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

export const SHIELD_STORAGE_KEY = "iss:shield-listing-ids";
export const SHIELD_COOKIE_NAME = "iss-shield-listing-ids";
export const SHIELD_CHANGED_EVENT = "iss:shield-changed";

export const SHIELD_HOST_ID = "gtk-game-boy";
export const SHIELD_LUT_ID = "dl-camera-luts";
export const SHIELD_PACK_ID = "dl-sample-pack";
export const SHIELD_DRAWER_ID = "gtk-cable-drawer";
export const SHIELD_DISC_ID = "ysk-burned-cdr";
export const SHIELD_LAMP_ID = "ysk-wobbly-lamp";
export const SHIELD_ZINE_ID = "dl-stain-zine";
export const SHIELD_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SHIELD_OWNED_IDS = [
  SHIELD_DRAWER_ID,
  SHIELD_DISC_ID,
  SHIELD_LAMP_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "dl-junk-pricing-pdf",
] as const;

export const SHIELD_REFUSE_COPY = "That one does not take a shield note.";
export const SHIELD_TABLE_LINE = "I will not shield it.";
export const SHIELD_LINE_LINE = "Still a line.";
export const SHIELD_TETRIS_LINE = "Still Tetris.";
export const SHIELD_NOTICE_TITLE =
  "I will not shield it. Still a line. Still Tetris.";
export const SHIELD_WALK_LINE =
  "Walkers still want Half-Working to shield the board, or put the can back so Tetris stays quiet.";
export const SHIELD_STAYS_LINE =
  "This is the shield note. I will not shield it. Still a line. Still Tetris.";
export const SHIELD_STILL_LINE =
  "Still tote. Not reflow. Not contrast. Not deox. Not speaker. Not line.";
export const SHIELD_TOTE_LINE = "Add to tote still works.";
export const SHIELD_EMPTY_LINE = "Nobody taped a shield note yet.";
export const SHIELD_LEAVE_LINE = "Leave the can";

const SERVER_STORE = Symbol.for("iss.shield-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(SHIELD_OWNED_IDS);

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

export function parseShieldListingIds(
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

export function shieldCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SHIELD_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SHIELD_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SHIELD_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SHIELD_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SHIELD_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseShieldListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readShieldListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SHIELD_STORAGE_KEY);
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
          window.localStorage.setItem(
            SHIELD_STORAGE_KEY,
            JSON.stringify(ids),
          );
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

export function writeShieldListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = shieldCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SHIELD_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SHIELD_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SHIELD_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingShieldOverlay(
  listingId: string,
  listingIds: readonly string[] = readShieldListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLutListing(listing: Listing) {
  return listing.id === SHIELD_LUT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === SHIELD_PACK_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. LUT, pack, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeShield(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SHIELD_HOST_ID) {
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

export type ShieldWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lut"
  | "pack"
  | "owned";

function refuseShield(
  listing: Listing | undefined,
): ShieldWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== SHIELD_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingShield(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseShield(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingShield(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseShield(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeShield(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SHIELD_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SHIELD_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SHIELD_CHANGED_EVENT, listener);
  };
}
