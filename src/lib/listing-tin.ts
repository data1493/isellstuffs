/**
 * I will not tin them — the drawer stays untested. Still tote.
 *
 * Coil is the tangle. Pile is the heap. Dongle is no USB-C. Beep
 * is no continuity. Ferrite is the clip. Label is HDMI tape.
 * Walkers still want Half-Working to tin the mystery ends, or
 * “make them shoppable.” I will not tin them. Still a pile. Still
 * untested. Still for sale. Not coil. Not pile. Not a shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:tin-listing-ids` is the client tin set.
 * Cookie `iss-tin-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write coil, pile, dongle, beep, ferrite, label, crimp,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-cable-drawer` only. Game Boy, LUT, pack, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TIN_STORAGE_KEY = "iss:tin-listing-ids";
export const TIN_COOKIE_NAME = "iss-tin-listing-ids";
export const TIN_CHANGED_EVENT = "iss:tin-changed";

export const TIN_HOST_ID = "gtk-cable-drawer";
export const TIN_BOY_ID = "gtk-game-boy";
export const TIN_LUT_ID = "dl-camera-luts";
export const TIN_PACK_ID = "dl-sample-pack";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TIN_OWNED_IDS = [
  TIN_BOY_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "ysk-burned-cdr",
  "dl-booth-font",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "dl-junk-pricing-pdf",
] as const;

const ownedSet = new Set<string>(TIN_OWNED_IDS);

export const TIN_REFUSE_COPY = "That one does not take a tin note.";
export const TIN_TABLE_LINE = "I will not tin them.";
export const TIN_PILE_LINE = "Still a pile.";
export const TIN_UNTESTED_LINE = "Still untested.";
export const TIN_NOTICE_TITLE =
  "I will not tin them. Still a pile. Still untested.";
export const TIN_WALK_LINE =
  "Walkers still want Half-Working to tin the drawer, or make the ends shoppable.";
export const TIN_STAYS_LINE =
  "This is the tin note. I will not tin them. Still a pile. Still untested.";
export const TIN_STILL_LINE = "Still tote. Not coil. Not pile. Not a shop.";
export const TIN_TOTE_LINE = "Add to tote still works.";
export const TIN_EMPTY_LINE = "Nobody taped a tin note yet.";
export const TIN_LEAVE_LINE = "Leave the ends";

const SERVER_STORE = Symbol.for("iss.tin-listing-ids");

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

export function parseTinListingIds(
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

export function tinCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TIN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TIN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TIN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TIN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TIN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTinListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTinListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TIN_STORAGE_KEY);
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
          window.localStorage.setItem(TIN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTinListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = tinCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TIN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TIN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TIN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTinOverlay(
  listingId: string,
  listingIds: readonly string[] = readTinListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isBoyListing(listing: Listing) {
  return listing.id === TIN_BOY_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host drawer only. Game Boy, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTin(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TIN_HOST_ID) {
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

export type TinWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "boy"
  | "owned";

function refuseTin(listing: Listing | undefined): TinWriteReason | null {
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
  if (isBoyListing(listing)) {
    return "boy";
  }
  if (isOwnedListing(listing) || listing.id !== TIN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTin(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTin(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTin(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTin(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTin(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TIN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TIN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TIN_CHANGED_EVENT, listener);
  };
}
