/**
 * I will not darn it — the windbreaker stays a jacket with a hole.
 * Still tote.
 *
 * Serge is overlock. Dart is take-in. Pink is zigzag. Fell is the
 * pit seam. Sew is no hem. Walkers still want Closet to darn it,
 * or “close the pit so the mint-green still hangs.” I will not
 * darn it. Still a jacket. Still a hole. Still for sale. Not sew.
 * Not pink. Not serge. Not dart. Not fell.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:darn-listing-ids` is the client darn set.
 * Cookie `iss-darn-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write sew, pink, serge, dart, fell, mend, dye, lining,
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

export const DARN_STORAGE_KEY = "iss:darn-listing-ids";
export const DARN_COOKIE_NAME = "iss-darn-listing-ids";
export const DARN_CHANGED_EVENT = "iss:darn-changed";

export const DARN_HOST_ID = "clo-windbreaker";
export const DARN_SNEAKER_ID = "clo-split-soles";
export const DARN_LAMP_ID = "ysk-wobbly-lamp";
export const DARN_CHAIR_ID = "ysk-folding-chair";
export const DARN_ZINE_ID = "dl-stain-zine";
export const DARN_FONT_ID = "dl-booth-font";
export const DARN_MUG_ID = "kdr-chipped-mug";
export const DARN_RECIPES_ID = "dl-drawer-recipes";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const DARN_OWNED_IDS = [
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

export const DARN_REFUSE_COPY = "That one does not take a darn note.";
export const DARN_TABLE_LINE = "I will not darn it.";
export const DARN_JACKET_LINE = "Still a jacket.";
export const DARN_HOLE_LINE = "Still a hole.";
export const DARN_NOTICE_TITLE =
  "I will not darn it. Still a jacket. Still a hole.";
export const DARN_WALK_LINE =
  "Walkers still want Closet to darn it, or close the pit so the mint-green still hangs.";
export const DARN_STAYS_LINE =
  "This is the darn note. I will not darn it. Still a jacket. Still a hole.";
export const DARN_STILL_LINE =
  "Still tote. Not sew. Not pink. Not a shop. Not serge.";
export const DARN_TOTE_LINE = "Add to tote still works.";
export const DARN_EMPTY_LINE = "Nobody taped a darn note yet.";
export const DARN_LEAVE_LINE = "Leave the hole";

const SERVER_STORE = Symbol.for("iss.darn-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(DARN_OWNED_IDS);

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

export function parseDarnListingIds(
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

export function darnCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const DARN_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${DARN_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(DARN_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(DARN_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${DARN_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseDarnListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readDarnListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(DARN_STORAGE_KEY);
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
          window.localStorage.setItem(DARN_STORAGE_KEY, JSON.stringify(ids));
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

export function writeDarnListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = darnCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(DARN_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${DARN_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(DARN_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingDarnOverlay(
  listingId: string,
  listingIds: readonly string[] = readDarnListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isSneakerListing(listing: Listing) {
  return listing.id === DARN_SNEAKER_ID;
}

function isLampListing(listing: Listing) {
  return listing.id === DARN_LAMP_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === DARN_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host jacket only. Sneakers, lamp, chair, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeDarn(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== DARN_HOST_ID) {
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

export type DarnWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "sneakers"
  | "lamp"
  | "chair"
  | "owned";

function refuseDarn(
  listing: Listing | undefined,
): DarnWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== DARN_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingDarn(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDarn(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingDarn(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseDarn(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeDarn(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === DARN_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(DARN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(DARN_CHANGED_EVENT, listener);
  };
}
