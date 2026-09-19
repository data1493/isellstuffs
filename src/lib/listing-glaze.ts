/**
 * I will not glaze it — the mug stays chipped. Still a mug. Still tote.
 *
 * Chip is the rim. Handle is swap-the-C. Gilt is kintsugi. Sand is
 * grind. Saucer is diner-plate. Walkers still want Sink Drawer to
 * glaze the mug, or “fire a coat so the chip doesn’t cut.” I will
 * not glaze it. Still a chip. Still a mug. Still for sale. Not gilt.
 * Not chip. Not handle.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:glaze-listing-ids` is the client glaze set.
 * Cookie `iss-glaze-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write chip, handle, gilt, sand, saucer, whose, knurl, peen,
 * gift, buy, digital eligibility, or tote keys.
 * Host is `kdr-chipped-mug` only. Lid, whisk, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const GLAZE_STORAGE_KEY = "iss:glaze-listing-ids";
export const GLAZE_COOKIE_NAME = "iss-glaze-listing-ids";
export const GLAZE_CHANGED_EVENT = "iss:glaze-changed";

export const GLAZE_HOST_ID = "kdr-chipped-mug";
export const GLAZE_LID_ID = "kdr-lid-no-pot";
export const GLAZE_WHISK_ID = "kdr-bent-whisk";
export const GLAZE_RECIPES_ID = "dl-drawer-recipes";
export const GLAZE_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const GLAZE_OWNED_IDS = [
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
] as const;

export const GLAZE_REFUSE_COPY = "That one does not take a glaze note.";
export const GLAZE_TABLE_LINE = "I will not glaze it.";
export const GLAZE_CHIP_LINE = "Still a chip.";
export const GLAZE_MUG_LINE = "Still a mug.";
export const GLAZE_NOTICE_TITLE =
  "I will not glaze it. Still a chip. Still a mug.";
export const GLAZE_WALK_LINE =
  "Walkers still want Sink Drawer to glaze the mug, or fire a coat so the chip doesn’t cut.";
export const GLAZE_STAYS_LINE =
  "This is the glaze note. I will not glaze it. Still a chip. Still a mug.";
export const GLAZE_STILL_LINE =
  "Still tote. Not gilt. Not chip. Not a shop. Not handle.";
export const GLAZE_TOTE_LINE = "Add to tote still works.";
export const GLAZE_EMPTY_LINE = "Nobody taped a glaze note yet.";
export const GLAZE_LEAVE_LINE = "Leave the chip";

const SERVER_STORE = Symbol.for("iss.glaze-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(GLAZE_OWNED_IDS);

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

export function parseGlazeListingIds(
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

export function glazeCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const GLAZE_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${GLAZE_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(GLAZE_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(GLAZE_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${GLAZE_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseGlazeListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readGlazeListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(GLAZE_STORAGE_KEY);
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
          window.localStorage.setItem(GLAZE_STORAGE_KEY, JSON.stringify(ids));
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

export function writeGlazeListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = glazeCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(GLAZE_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${GLAZE_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(GLAZE_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingGlazeOverlay(
  listingId: string,
  listingIds: readonly string[] = readGlazeListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isLidListing(listing: Listing) {
  return listing.id === GLAZE_LID_ID;
}

function isWhiskListing(listing: Listing) {
  return listing.id === GLAZE_WHISK_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === GLAZE_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host mug only. Lid, whisk, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeGlaze(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== GLAZE_HOST_ID) {
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

export type GlazeWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "lid"
  | "whisk"
  | "chair"
  | "owned";

function refuseGlaze(
  listing: Listing | undefined,
): GlazeWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== GLAZE_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingGlaze(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGlaze(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingGlaze(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseGlaze(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeGlaze(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === GLAZE_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(GLAZE_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(GLAZE_CHANGED_EVENT, listener);
  };
}
