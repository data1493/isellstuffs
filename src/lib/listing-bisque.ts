/**
 * I will not bisque it — the mug stays chipped. Still a mug. Still tote.
 *
 * Chip is the rim. Glaze is fired-coat. Pickle is acid-the-haze.
 * Fettle is dress-the-rim. Sand is grind. Burn is a kiln rewrite.
 * Walkers still want Sink Drawer to bisque the mug, or “fire the
 * clay so the chip holds.” I will not bisque it. Still a mug.
 * Still a chip. Still for sale. Not glaze. Not pickle. Not fettle.
 * Not sand. Not burn.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:bisque-listing-ids` is the client bisque set.
 * Cookie `iss-bisque-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write glaze, pickle, fettle, sand, burn, chip, handle, gilt,
 * saucer, gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const BISQUE_STORAGE_KEY = "iss:bisque-listing-ids";
export const BISQUE_COOKIE_NAME = "iss-bisque-listing-ids";
export const BISQUE_CHANGED_EVENT = "iss:bisque-changed";

export const BISQUE_HOST_ID = "kdr-chipped-mug";
export const BISQUE_LID_ID = "kdr-lid-no-pot";
export const BISQUE_WHISK_ID = "kdr-bent-whisk";
export const BISQUE_RECIPES_ID = "dl-drawer-recipes";
export const BISQUE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const BISQUE_OWNED_IDS = [
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "dl-booth-font",
  "mdb-mixtape-93",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "dl-junk-pricing-pdf",
  "dl-sample-pack",
  "dl-camera-luts",
] as const;

export const BISQUE_REFUSE_COPY = "That one does not take a bisque note.";
export const BISQUE_TABLE_LINE = "I will not bisque it.";
export const BISQUE_MUG_LINE = "Still a mug.";
export const BISQUE_CHIP_LINE = "Still a chip.";
export const BISQUE_NOTICE_TITLE =
  "I will not bisque it. Still a mug. Still a chip.";
export const BISQUE_WALK_LINE =
  "Walkers still want Sink Drawer to bisque the mug, or fire the clay so the chip holds.";
export const BISQUE_STAYS_LINE =
  "This is the bisque note. I will not bisque it. Still a mug. Still a chip.";
export const BISQUE_STILL_LINE =
  "Still tote. Not glaze. Not pickle. Not a shop. Not fettle.";
export const BISQUE_TOTE_LINE = "Add to tote still works.";
export const BISQUE_EMPTY_LINE = "Nobody taped a bisque note yet.";
export const BISQUE_LEAVE_LINE = "Leave the kiln";

const SERVER_STORE = Symbol.for("iss.bisque-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(BISQUE_OWNED_IDS);

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

export function parseBisqueListingIds(
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

export function bisqueCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const BISQUE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${BISQUE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(BISQUE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(BISQUE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${BISQUE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseBisqueListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readBisqueListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(BISQUE_STORAGE_KEY);
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
          window.localStorage.setItem(BISQUE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeBisqueListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = bisqueCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(BISQUE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${BISQUE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(BISQUE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingBisqueOverlay(
  listingId: string,
  listingIds: readonly string[] = readBisqueListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === BISQUE_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === BISQUE_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === BISQUE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeBisque(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== BISQUE_HOST_ID) {
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

export type BisqueWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refuseBisque(
  listing: Listing | undefined,
): BisqueWriteReason | null {
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
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isWhiskListing(listing)) {
    return "whisk";
  }
  if (isOwnedListing(listing) || listing.id !== BISQUE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingBisque(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBisque(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingBisque(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseBisque(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeBisque(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === BISQUE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(BISQUE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BISQUE_CHANGED_EVENT, listener);
  };
}
