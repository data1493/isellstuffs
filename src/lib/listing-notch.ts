/**
 * I will not notch it — the windbreaker stays pits and a car smell.
 * Still tote.
 *
 * Pink is zig-the-pits. Darn is close-the-pit. Serge is overlock.
 * Dart is take-in. Fell is the pit seam. Pleat is the front fold.
 * Walkers still want Closet to notch it, or “clip the pits so the
 * mint-green sits without a shop pink.” I will not notch it. Still
 * pits. Still a car smell. Still for sale. Not pink. Not darn. Not
 * a shop. Not serge. Not dart. Not fell. Not pleat. Not mend. Not
 * dye. Not tuck.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:notch-listing-ids` is the client notch set.
 * Cookie `iss-notch-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pink, darn, serge, dart, fell, pleat, mend, dye, tuck,
 * lining, size, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, lamp, chair, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const NOTCH_STORAGE_KEY = "iss:notch-listing-ids";
export const NOTCH_COOKIE_NAME = "iss-notch-listing-ids";
export const NOTCH_CHANGED_EVENT = "iss:notch-changed";

export const NOTCH_HOST_ID = "clo-windbreaker";
export const NOTCH_SNEAKER_ID = "clo-split-soles";
export const NOTCH_LAMP_ID = "ysk-wobbly-lamp";
export const NOTCH_CHAIR_ID = "ysk-folding-chair";
export const NOTCH_ZINE_ID = "dl-stain-zine";
export const NOTCH_FONT_ID = "dl-booth-font";
export const NOTCH_MUG_ID = "kdr-chipped-mug";
export const NOTCH_RECIPES_ID = "dl-drawer-recipes";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const NOTCH_OWNED_IDS = [
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-drawer-recipes",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "ysk-wobbly-lamp",
  "dl-camera-luts",
  "mdb-scratched-lp",
] as const;

export const NOTCH_REFUSE_COPY = "That one does not take a notch note.";
export const NOTCH_TABLE_LINE = "I will not notch it.";
export const NOTCH_PITS_LINE = "Still pits.";
export const NOTCH_SMELL_LINE = "Still a car smell.";
export const NOTCH_NOTICE_TITLE =
  "I will not notch it. Still pits. Still a car smell.";
export const NOTCH_WALK_LINE =
  "Walkers still want Closet to notch it, or clip the pits so the mint-green sits without a shop pink.";
export const NOTCH_STAYS_LINE =
  "This is the notch note. I will not notch it. Still pits. Still a car smell.";
export const NOTCH_STILL_LINE =
  "Still tote. Not pink. Not darn. Not a shop. Not serge.";
export const NOTCH_TOTE_LINE = "Add to tote still works.";
export const NOTCH_EMPTY_LINE = "Nobody taped a notch note yet.";
export const NOTCH_LEAVE_LINE = "Leave the pits";

const SERVER_STORE = Symbol.for("iss.notch-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(NOTCH_OWNED_IDS);

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

export function parseNotchListingIds(
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

export function notchCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const NOTCH_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${NOTCH_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(NOTCH_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(NOTCH_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${NOTCH_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseNotchListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readNotchListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(NOTCH_STORAGE_KEY);
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
          window.localStorage.setItem(NOTCH_STORAGE_KEY, JSON.stringify(ids));
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

export function writeNotchListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = notchCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(NOTCH_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${NOTCH_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(NOTCH_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingNotchOverlay(
  listingId: string,
  listingIds: readonly string[] = readNotchListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === NOTCH_SNEAKER_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === NOTCH_LAMP_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === NOTCH_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, lamp, chair, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeNotch(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== NOTCH_HOST_ID) {
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

export type NotchWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "lamp"
  | "chair"
  | "owned";

function refuseNotch(
  listing: Listing | undefined,
): NotchWriteReason | null {
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
  if (isSneakerListing(listing)) {
    return "sneakers";
  }
  if (isLampListing(listing)) {
    return "lamp";
  }
  if (isOwnedListing(listing) || listing.id !== NOTCH_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingNotch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseNotch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingNotch(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseNotch(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeNotch(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === NOTCH_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(NOTCH_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(NOTCH_CHANGED_EVENT, listener);
  };
}
