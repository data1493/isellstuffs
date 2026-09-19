/**
 * I will not braid them — the drawer stays a pile. Still tote.
 *
 * Coil is the tangle. Pile is the heap. Ferrite is the bead. Tin
 * is solder. Walkers still want Half-Working to braid the drawer,
 * or “plait the tangle so you can find a USB.” I will not braid
 * them. Still a pile. Still untested. Still for sale. Not coil.
 * Not ferrite. Not tin. Not pile. Not a shop.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:braid-listing-ids` is the client braid set.
 * Cookie `iss-braid-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write coil, pile, ferrite, tin, dongle, beep, label, crimp,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `gtk-cable-drawer` only. Game Boy, LUT, mixtape, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BRAID_STORAGE_KEY = "iss:braid-listing-ids";
export const BRAID_COOKIE_NAME = "iss-braid-listing-ids";
export const BRAID_CHANGED_EVENT = "iss:braid-changed";

export const BRAID_HOST_ID = "gtk-cable-drawer";
export const BRAID_BOY_ID = "gtk-game-boy";
export const BRAID_LUT_ID = "dl-camera-luts";
export const BRAID_MIXTAPE_ID = "mdb-mixtape-93";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BRAID_OWNED_IDS = [
  BRAID_BOY_ID,
  BRAID_MIXTAPE_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "mdb-jewel-stack",
  "ysk-burned-cdr",
  "dl-booth-font",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
] as const;

const ownedSet = new Set<string>(BRAID_OWNED_IDS);

export const BRAID_REFUSE_COPY = "That one does not take a braid note.";
export const BRAID_TABLE_LINE = "I will not braid them.";
export const BRAID_PILE_LINE = "Still a pile.";
export const BRAID_UNTESTED_LINE = "Still untested.";
export const BRAID_NOTICE_TITLE =
  "I will not braid them. Still a pile. Still untested.";
export const BRAID_WALK_LINE =
  "Walkers still want Half-Working to braid the drawer, or plait the tangle so you can find a USB.";
export const BRAID_STAYS_LINE =
  "This is the braid note. I will not braid them. Still a pile. Still untested.";
export const BRAID_STILL_LINE = "Still tote. Not coil. Not pile. Not a shop.";
export const BRAID_TOTE_LINE = "Add to tote still works.";
export const BRAID_EMPTY_LINE = "Nobody taped a braid note yet.";
export const BRAID_LEAVE_LINE = "Leave the tangle";

const SERVER_STORE = Symbol.for("iss.braid-listing-ids");

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

export function parseBraidListingIds(
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

export function braidCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BRAID_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BRAID_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BRAID_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BRAID_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BRAID_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBraidListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBraidListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BRAID_STORAGE_KEY);
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
          window.localStorage.setItem(BRAID_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBraidListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = braidCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BRAID_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BRAID_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BRAID_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBraidOverlay(
  listingId: string,
  listingIds: readonly string[] = readBraidListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isBoyListing(listing: Listing) {
  return listing.id === BRAID_BOY_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host drawer only. Game Boy, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBraid(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BRAID_HOST_ID) {
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

export type BraidWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "boy"
  | "owned";

function refuseBraid(listing: Listing | undefined): BraidWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== BRAID_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBraid(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBraid(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBraid(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBraid(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBraid(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BRAID_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BRAID_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BRAID_CHANGED_EVENT, listener);
  };
}
