/**
 * I will not tap it — the lid stays a lid. Still a lid. Still no pot.
 *
 * Chamfer is ease-the-neck. Ream is open-the-neck. Chase is
 * cut-new-threads. Stake is set-the-knob. Knurl is cut-new-grip.
 * Walkers still want Sink Drawer to tap it, or “cut threads so a
 * new knob screw sits in the glass.” I will not tap it. Still a
 * lid. Still no pot. Still for sale. Not chamfer. Not ream. Not a
 * shop. Not chase.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:tap-listing-ids` is the client tap set.
 * Cookie `iss-tap-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write chamfer, ream, chase, stake, knurl, scribe, saucepan,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-lid-no-pot` only. Mug, recipes, whisk, lamp, gift,
 * zine, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const TAP_STORAGE_KEY = "iss:tap-listing-ids";
export const TAP_COOKIE_NAME = "iss-tap-listing-ids";
export const TAP_CHANGED_EVENT = "iss:tap-changed";

export const TAP_HOST_ID = "kdr-lid-no-pot";
export const TAP_MUG_ID = "kdr-chipped-mug";
export const TAP_WHISK_ID = "kdr-bent-whisk";
export const TAP_RECIPES_ID = "dl-drawer-recipes";
export const TAP_LAMP_ID = "ysk-wobbly-lamp";
export const TAP_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const TAP_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
  "mdb-scratched-lp",
] as const;

const ownedSet = new Set<string>(TAP_OWNED_IDS);

export const TAP_REFUSE_COPY = "That one does not take a tap note.";
export const TAP_TABLE_LINE = "I will not tap it.";
export const TAP_LID_LINE = "Still a lid.";
export const TAP_POT_LINE = "Still no pot.";
export const TAP_NOTICE_TITLE =
  "I will not tap it. Still a lid. Still no pot.";
export const TAP_WALK_LINE =
  "Walkers still want Sink Drawer to tap it, or cut threads so a new knob screw sits in the glass.";
export const TAP_STAYS_LINE =
  "This is the tap note. I will not tap it. Still a lid. Still no pot.";
export const TAP_STILL_LINE =
  "Still tote. Not chamfer. Not ream. Not a shop. Not chase.";
export const TAP_TOTE_LINE = "Add to tote still works.";
export const TAP_EMPTY_LINE = "Nobody taped a tap note yet.";
export const TAP_LEAVE_LINE = "Leave the hole";

const SERVER_STORE = Symbol.for("iss.tap-listing-ids");

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

export function parseTapListingIds(
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

export function tapCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const TAP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${TAP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(TAP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(TAP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${TAP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseTapListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readTapListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(TAP_STORAGE_KEY);
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
          window.localStorage.setItem(TAP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeTapListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = tapCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(TAP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${TAP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(TAP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingTapOverlay(
  listingId: string,
  listingIds: readonly string[] = readTapListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isMugListing(listing: Listing) {
  return listing.id === TAP_MUG_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === TAP_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === TAP_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host lid only. Mug, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeTap(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== TAP_HOST_ID) {
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

export type TapWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "mug"
  | "whisk"
  | "chair"
  | "owned";

function refuseTap(listing: Listing | undefined): TapWriteReason | null {
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
  if (isMugListing(listing)) {
    return "mug";
  }
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isOwnedListing(listing) || listing.id !== TAP_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingTap(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTap(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingTap(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseTap(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeTap(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === TAP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(TAP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TAP_CHANGED_EVENT, listener);
  };
}
