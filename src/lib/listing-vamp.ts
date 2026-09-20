/**
 * I will not vamp them — the pair stays a flex. Still original laces.
 *
 * Shank is set-the-steel (on main). Gem is sew-the-rib (queued).
 * Channel is cut-the-welt (queued). Welt is cobbler-seam-strip.
 * Walkers still want Closet to vamp them, or set a shop vamp so
 * the split walks without a shop shank. I will not vamp them.
 * Still a flex. Still original laces. Still for sale. Not shank.
 * Not gem. Not a shop. Not channel.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:vamp-listing-ids` is the client vamp set.
 * Cookie `iss-vamp-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write shank, gem, channel, cream, edge, welt, last, quarter,
 * foxing, upper, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-split-soles` only. Jacket, lid, recipes, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const VAMP_STORAGE_KEY = "iss:vamp-listing-ids";
export const VAMP_COOKIE_NAME = "iss-vamp-listing-ids";
export const VAMP_CHANGED_EVENT = "iss:vamp-changed";

export const VAMP_HOST_ID = "clo-split-soles";
export const VAMP_JACKET_ID = "clo-windbreaker";
export const VAMP_LID_ID = "kdr-lid-no-pot";
export const VAMP_RECIPES_ID = "dl-drawer-recipes";
export const VAMP_CHAIR_ID = "ysk-folding-chair";
export const VAMP_GIFT_ID = "dl-mall-gift-card";
export const VAMP_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const VAMP_OWNED_IDS = [
  VAMP_JACKET_ID,
  VAMP_LID_ID,
  VAMP_RECIPES_ID,
  "dl-booth-font",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "dl-sample-pack",
  "dl-junk-pricing-pdf",
  "dl-camera-luts",
  "dl-crate-side-a",
] as const;

const ownedSet = new Set<string>(VAMP_OWNED_IDS);

export const VAMP_REFUSE_COPY = "That one does not take a vamp note.";
export const VAMP_TABLE_LINE = "I will not vamp them.";
export const VAMP_FLEX_LINE = "Still a flex.";
export const VAMP_LACES_LINE = "Still original laces.";
export const VAMP_NOTICE_TITLE =
  "I will not vamp them. Still a flex. Still original laces.";
export const VAMP_WALK_LINE =
  "Walkers still want Closet to vamp them, or set a shop vamp so the split walks without a shop shank.";
export const VAMP_STAYS_LINE =
  "This is the vamp note. I will not vamp them. Still a flex. Still original laces.";
export const VAMP_STILL_LINE =
  "Still tote. Not shank. Not gem. Not a shop. Not channel.";
export const VAMP_TOTE_LINE = "Add to tote still works.";
export const VAMP_EMPTY_LINE = "Nobody taped a vamp note yet.";
export const VAMP_LEAVE_LINE = "Leave the flex";

const SERVER_STORE = Symbol.for("iss.vamp-listing-ids");

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

export function parseVampListingIds(
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

export function vampCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const VAMP_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${VAMP_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(VAMP_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(VAMP_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${VAMP_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseVampListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readVampListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(VAMP_STORAGE_KEY);
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
          window.localStorage.setItem(VAMP_STORAGE_KEY, JSON.stringify(ids));
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

export function writeVampListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = vampCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(VAMP_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${VAMP_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(VAMP_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingVampOverlay(
  listingId: string,
  listingIds: readonly string[] = readVampListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isJacketListing(listing: Listing) {
  return listing.id === VAMP_JACKET_ID;
}

function isLidListing(listing: Listing) {
  return listing.id === VAMP_LID_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === VAMP_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host split-soles only. Overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeVamp(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== VAMP_HOST_ID) {
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

export type VampWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "jacket"
  | "lid"
  | "chair"
  | "owned";

function refuseVamp(listing: Listing | undefined): VampWriteReason | null {
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
  if (isJacketListing(listing)) {
    return "jacket";
  }
  if (isLidListing(listing)) {
    return "lid";
  }
  if (isOwnedListing(listing) || listing.id !== VAMP_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingVamp(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVamp(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingVamp(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseVamp(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeVamp(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === VAMP_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(VAMP_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VAMP_CHANGED_EVENT, listener);
  };
}
