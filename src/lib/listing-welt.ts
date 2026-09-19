/**
 * I will not welt them — the pair stays peeling. Still tote.
 *
 * Toe is the peel stays. Sole is no new sole. Stitch is cobbler-seam.
 * Cement is no cobbler glue. Cream is polish. Sew is Closet booth
 * thread, not these sneakers. Walkers still want Closet to welt the
 * pair, or “sew a welt so the split holds.” I will not welt them.
 * Still peeling. Still a pair. Still for sale. Not stitch. Not sole.
 * Not a shop. Not cement.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:welt-listing-ids` is the client welt set.
 * Cookie `iss-welt-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write stitch, sole, toe, even, stretch, cement, cream,
 * bleach, pad, sew, gift, buy, digital eligibility, or tote keys.
 * Host is `clo-split-soles` only. Jacket, whisk, font, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const WELT_STORAGE_KEY = "iss:welt-listing-ids";
export const WELT_COOKIE_NAME = "iss-welt-listing-ids";
export const WELT_CHANGED_EVENT = "iss:welt-changed";

export const WELT_HOST_ID = "clo-split-soles";
export const WELT_JACKET_ID = "clo-windbreaker";
export const WELT_WHISK_ID = "kdr-bent-whisk";
export const WELT_FONT_ID = "dl-booth-font";
export const WELT_CHAIR_ID = "ysk-folding-chair";
export const WELT_GIFT_ID = "dl-mall-gift-card";
export const WELT_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const WELT_OWNED_IDS = [
  WELT_JACKET_ID,
  WELT_WHISK_ID,
  WELT_FONT_ID,
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "mdb-mixtape-93",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "ysk-burned-cdr",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "dl-sample-pack",
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-camera-luts",
] as const;

const ownedSet = new Set<string>(WELT_OWNED_IDS);

export const WELT_REFUSE_COPY = "That one does not take a welt note.";
export const WELT_TABLE_LINE = "I will not welt them.";
export const WELT_PEEL_LINE = "Still peeling.";
export const WELT_PAIR_LINE = "Still a pair.";
export const WELT_NOTICE_TITLE =
  "I will not welt them. Still peeling. Still a pair.";
export const WELT_WALK_LINE =
  "Walkers still want Closet to welt the pair, or sew a welt so the split holds.";
export const WELT_STAYS_LINE =
  "This is the welt note. I will not welt them. Still peeling. Still a pair.";
export const WELT_STILL_LINE =
  "Still tote. Not stitch. Not sole. Not a shop. Not cement.";
export const WELT_TOTE_LINE = "Add to tote still works.";
export const WELT_EMPTY_LINE = "Nobody taped a welt note yet.";
export const WELT_LEAVE_LINE = "Leave the split";

const SERVER_STORE = Symbol.for("iss.welt-listing-ids");

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

export function parseWeltListingIds(
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

export function weltCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const WELT_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${WELT_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(WELT_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(WELT_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${WELT_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseWeltListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readWeltListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(WELT_STORAGE_KEY);
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
          window.localStorage.setItem(WELT_STORAGE_KEY, JSON.stringify(ids));
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

export function writeWeltListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = weltCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(WELT_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${WELT_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(WELT_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingWeltOverlay(
  listingId: string,
  listingIds: readonly string[] = readWeltListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host split-soles only. Overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeWelt(listing: Listing | undefined): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== WELT_HOST_ID) {
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

export type WeltWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "owned";

function refuseWelt(listing: Listing | undefined): WeltWriteReason | null {
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
  if (isOwnedListing(listing) || listing.id !== WELT_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingWelt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseWelt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingWelt(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseWelt(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeWelt(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === WELT_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(WELT_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WELT_CHANGED_EVENT, listener);
  };
}
