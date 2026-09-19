/**
 * I will not contrast it — the Game Boy stays a line and dim. Still tote.
 *
 * Line is the screen crack. Cells are the AAs. Recap is the save
 * battery. Walkers still want Half-Working to contrast the screen,
 * or “make the line go.” I will not contrast it. Still a line.
 * Still dim. Still for sale. Not line. Not cells. Not recap.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:contrast-listing-ids` is the client contrast set.
 * Cookie `iss-contrast-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write line, cells, recap, glow, speaker, dump, lens, gift,
 * buy, digital eligibility, or tote keys.
 * Host is `gtk-game-boy` only. LUT, pack, gift, zine, and listings
 * already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const CONTRAST_STORAGE_KEY = "iss:contrast-listing-ids";
export const CONTRAST_COOKIE_NAME = "iss-contrast-listing-ids";
export const CONTRAST_CHANGED_EVENT = "iss:contrast-changed";

export const CONTRAST_HOST_ID = "gtk-game-boy";
export const CONTRAST_LUT_ID = "dl-camera-luts";
export const CONTRAST_PACK_ID = "dl-sample-pack";
export const CONTRAST_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const CONTRAST_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "ysk-wobbly-lamp",
  "dl-junk-pricing-pdf",
] as const;

export const CONTRAST_REFUSE_COPY = "That one does not take a contrast note.";
export const CONTRAST_TABLE_LINE = "I will not contrast it.";
export const CONTRAST_LINE_LINE = "Still a line.";
export const CONTRAST_DIM_LINE = "Still dim.";
export const CONTRAST_NOTICE_TITLE =
  "I will not contrast it. Still a line. Still dim.";
export const CONTRAST_WALK_LINE =
  "Walkers still want Half-Working to contrast the screen, or make the line go.";
export const CONTRAST_STAYS_LINE =
  "This is the contrast note. I will not contrast it. Still a line. Still dim.";
export const CONTRAST_STILL_LINE =
  "Still tote. Not line. Not cells. Not recap.";
export const CONTRAST_TOTE_LINE = "Add to tote still works.";
export const CONTRAST_EMPTY_LINE = "Nobody taped a contrast note yet.";
export const CONTRAST_LEAVE_LINE = "Leave the dim";

const SERVER_STORE = Symbol.for("iss.contrast-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(CONTRAST_OWNED_IDS);

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

export function parseContrastListingIds(
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

export function contrastCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const CONTRAST_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${CONTRAST_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(CONTRAST_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(CONTRAST_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${CONTRAST_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseContrastListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readContrastListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(CONTRAST_STORAGE_KEY);
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
            CONTRAST_STORAGE_KEY,
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

export function writeContrastListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = contrastCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(CONTRAST_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${CONTRAST_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(CONTRAST_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingContrastOverlay(
  listingId: string,
  listingIds: readonly string[] = readContrastListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLutListing(listing: Listing) {
  return listing.id === CONTRAST_LUT_ID;
}

function isPackListing(listing: Listing) {
  return listing.id === CONTRAST_PACK_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host Game Boy only. LUT, pack, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeContrast(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== CONTRAST_HOST_ID) {
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

export type ContrastWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lut"
  | "pack"
  | "owned";

function refuseContrast(
  listing: Listing | undefined,
): ContrastWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== CONTRAST_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingContrast(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseContrast(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingContrast(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseContrast(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeContrast(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === CONTRAST_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(CONTRAST_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONTRAST_CHANGED_EVENT, listener);
  };
}
