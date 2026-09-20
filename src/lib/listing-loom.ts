/**
 * I will not loom them — the drawer stays a tangle. Still tote.
 *
 * Braid is plait-the-tangle. Coil is the pile. Ferrite is the bead.
 * Flux is rosin. Pile is the heap. Walkers still want Half-Working
 * to loom the tangle, or “sleeve the pile so you can find a USB.”
 * I will not loom them. Still a tangle. Still some ends honest.
 * Still for sale. Not braid. Not coil. Not ferrite. Not pile.
 * Not a shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:loom-listing-ids` is the client loom set.
 * Cookie `iss-loom-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write braid, coil, ferrite, flux, pile, shield, gift, buy,
 * digital eligibility, or tote keys.
 * Host is `gtk-cable-drawer` only. Game Boy, CD-R, LUT, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const LOOM_STORAGE_KEY = "iss:loom-listing-ids";
export const LOOM_COOKIE_NAME = "iss-loom-listing-ids";
export const LOOM_CHANGED_EVENT = "iss:loom-changed";

export const LOOM_HOST_ID = "gtk-cable-drawer";
export const LOOM_BOY_ID = "gtk-game-boy";
export const LOOM_CDR_ID = "ysk-burned-cdr";
export const LOOM_LUT_ID = "dl-camera-luts";
export const LOOM_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const LOOM_OWNED_IDS = [
  LOOM_BOY_ID,
  LOOM_CDR_ID,
  LOOM_LUT_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "dl-booth-font",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-drawer-recipes",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(LOOM_OWNED_IDS);

export const LOOM_REFUSE_COPY = "That one does not take a loom note.";
export const LOOM_TABLE_LINE = "I will not loom them.";
export const LOOM_TANGLE_LINE = "Still a tangle.";
export const LOOM_ENDS_LINE = "Still some ends honest.";
export const LOOM_NOTICE_TITLE =
  "I will not loom them. Still a tangle. Still some ends honest.";
export const LOOM_WALK_LINE =
  "Walkers still want Half-Working to loom the tangle, or sleeve the pile so you can find a USB.";
export const LOOM_STAYS_LINE =
  "This is the loom note. I will not loom them. Still a tangle. Still some ends honest.";
export const LOOM_STILL_LINE =
  "Still tote. Not braid. Not coil. Not ferrite.";
export const LOOM_TOTE_LINE = "Add to tote still works.";
export const LOOM_EMPTY_LINE = "Nobody taped a loom note yet.";
export const LOOM_LEAVE_LINE = "Leave the sleeve";

const SERVER_STORE = Symbol.for("iss.loom-listing-ids");

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

export function parseLoomListingIds(
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

export function loomCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const LOOM_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${LOOM_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(LOOM_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(LOOM_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${LOOM_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseLoomListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readLoomListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(LOOM_STORAGE_KEY);
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
          window.localStorage.setItem(LOOM_STORAGE_KEY, JSON.stringify(ids));
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

export function writeLoomListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = loomCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(LOOM_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${LOOM_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(LOOM_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingLoomOverlay(
  listingId: string,
  listingIds: readonly string[] = readLoomListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isBoyListing(listing: Listing) {
  return listing.id === LOOM_BOY_ID;
}

function isCdrListing(listing: Listing) {
  return listing.id === LOOM_CDR_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === LOOM_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host drawer only. Game Boy, CD-R, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeLoom(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== LOOM_HOST_ID) {
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

export type LoomWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "boy"
  | "cdr"
  | "chair"
  | "owned";

function refuseLoom(
  listing: Listing | undefined,
): LoomWriteReason | null {
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
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isBoyListing(listing)) {
    return "boy";
  }
  if (isCdrListing(listing)) {
    return "cdr";
  }
  if (isOwnedListing(listing) || listing.id !== LOOM_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingLoom(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLoom(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingLoom(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseLoom(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeLoom(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === LOOM_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(LOOM_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(LOOM_CHANGED_EVENT, listener);
  };
}
