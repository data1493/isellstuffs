/**
 * I will not handle it — the mug stays chipped. Still coffee. Still tote.
 *
 * Chip is the rim. Whose is no grandma. Cap is no travel lid.
 * Heat is don't microwave. Sand is the grit. Walkers still want
 * Sink Drawer to handle the mug, or “make the chip go.” I will
 * not handle it. Still a chip. Still coffee. Still for sale.
 * Not chip. Not whose. Not cap.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:handle-listing-ids` is the client handle set.
 * Cookie `iss-handle-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write chip, whose, cap, saucer, sand, heat, gilt, decal,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Whisk, lid, gift, zine, and
 * listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const HANDLE_STORAGE_KEY = "iss:handle-listing-ids";
export const HANDLE_COOKIE_NAME = "iss-handle-listing-ids";
export const HANDLE_CHANGED_EVENT = "iss:handle-changed";

export const HANDLE_HOST_ID = "kdr-chipped-mug";
export const HANDLE_WHISK_ID = "kdr-bent-whisk";
export const HANDLE_LID_ID = "kdr-lid-no-pot";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const HANDLE_OWNED_IDS = [
  HANDLE_WHISK_ID,
  HANDLE_LID_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(HANDLE_OWNED_IDS);

export const HANDLE_REFUSE_COPY = "That one does not take a handle note.";
export const HANDLE_TABLE_LINE = "I will not handle it.";
export const HANDLE_CHIP_LINE = "Still a chip.";
export const HANDLE_COFFEE_LINE = "Still coffee.";
export const HANDLE_NOTICE_TITLE =
  "I will not handle it. Still a chip. Still coffee.";
export const HANDLE_WALK_LINE =
  "Walkers still want Sink Drawer to handle the mug, or make the chip go.";
export const HANDLE_STAYS_LINE =
  "This is the handle note. I will not handle it. Still a chip. Still coffee.";
export const HANDLE_STILL_LINE = "Still tote. Not chip. Not whose. Not cap.";
export const HANDLE_TOTE_LINE = "Add to tote still works.";
export const HANDLE_EMPTY_LINE = "Nobody taped a handle note yet.";
export const HANDLE_LEAVE_LINE = "Leave the mug";

const SERVER_STORE = Symbol.for("iss.handle-listing-ids");

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

export function parseHandleListingIds(
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

export function handleCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const HANDLE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${HANDLE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(HANDLE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(HANDLE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${HANDLE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseHandleListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readHandleListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(HANDLE_STORAGE_KEY);
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
          window.localStorage.setItem(HANDLE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeHandleListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = handleCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(HANDLE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${HANDLE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(HANDLE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingHandleOverlay(
  listingId: string,
  listingIds: readonly string[] = readHandleListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isWhiskListing(listing: Listing) {
  return listing.id === HANDLE_WHISK_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === HANDLE_LID_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Whisk, lid, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeHandle(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== HANDLE_HOST_ID) {
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

export type HandleWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "whisk"
  | "lid"
  | "owned";

function refuseHandle(listing: Listing | undefined): HandleWriteReason | null {
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
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== HANDLE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingHandle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHandle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingHandle(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseHandle(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeHandle(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === HANDLE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(HANDLE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(HANDLE_CHANGED_EVENT, listener);
  };
}
