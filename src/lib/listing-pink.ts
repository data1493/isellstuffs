/**
 * I will not pink it — the windbreaker stays mint and a car.
 * Still tote.
 *
 * Serge is overlock. Dart is take-in. Cinch is the waist. Fell is
 * the pit seam. Sew is no hem. Gusset is a pit panel. Walkers still
 * want Closet to pink the windbreaker, or “zigzag the raw hem so it
 * doesn’t fray.” I will not pink it. Still mint. Still a car.
 * Still for sale. Not serge. Not dart. Not fell.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:pink-listing-ids` is the client pink set.
 * Cookie `iss-pink-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write serge, dart, cinch, fell, sew, gusset, lining,
 * size, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-windbreaker` only. Sneakers, lamp, chair, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const PINK_STORAGE_KEY = "iss:pink-listing-ids";
export const PINK_COOKIE_NAME = "iss-pink-listing-ids";
export const PINK_CHANGED_EVENT = "iss:pink-changed";

export const PINK_HOST_ID = "clo-windbreaker";
export const PINK_SNEAKER_ID = "clo-split-soles";
export const PINK_LAMP_ID = "ysk-wobbly-lamp";
export const PINK_CHAIR_ID = "ysk-folding-chair";
export const PINK_ZINE_ID = "dl-stain-zine";
export const PINK_FONT_ID = "dl-booth-font";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const PINK_OWNED_IDS = [
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

export const PINK_REFUSE_COPY = "That one does not take a pink note.";
export const PINK_TABLE_LINE = "I will not pink it.";
export const PINK_MINT_LINE = "Still mint.";
export const PINK_CAR_LINE = "Still a car.";
export const PINK_NOTICE_TITLE =
  "I will not pink it. Still mint. Still a car.";
export const PINK_WALK_LINE =
  "Walkers still want Closet to pink the windbreaker, or zigzag the raw hem so it doesn’t fray.";
export const PINK_STAYS_LINE =
  "This is the pink note. I will not pink it. Still mint. Still a car.";
export const PINK_STILL_LINE =
  "Still tote. Not serge. Not dart. Not a shop. Not fell.";
export const PINK_TOTE_LINE = "Add to tote still works.";
export const PINK_EMPTY_LINE = "Nobody taped a pink note yet.";
export const PINK_LEAVE_LINE = "Leave the zigzag";

const SERVER_STORE = Symbol.for("iss.pink-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(PINK_OWNED_IDS);

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

export function parsePinkListingIds(
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

export function pinkCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const PINK_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${PINK_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(PINK_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(PINK_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${PINK_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parsePinkListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readPinkListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(PINK_STORAGE_KEY);
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
          window.localStorage.setItem(PINK_STORAGE_KEY, JSON.stringify(ids));
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

export function writePinkListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = pinkCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(PINK_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${PINK_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(PINK_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingPinkOverlay(
  listingId: string,
  listingIds: readonly string[] = readPinkListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === PINK_SNEAKER_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === PINK_LAMP_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === PINK_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, lamp, chair, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapePink(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== PINK_HOST_ID) {
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

export type PinkWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "lamp"
  | "chair"
  | "owned";

function refusePink(
  listing: Listing | undefined,
): PinkWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== PINK_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingPink(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePink(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingPink(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refusePink(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribePink(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PINK_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PINK_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PINK_CHANGED_EVENT, listener);
  };
}
