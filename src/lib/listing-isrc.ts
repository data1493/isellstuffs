/**
 * I will not isrc it — the CD-R stays Sharpie. Still a jewel case.
 *
 * Pregap is hide-the-lead-in (in-flight / on main, unowned). Atip is
 * write-the-absolute (queued / on main, unowned). Stamper is
 * press-the-father (queued / on main, unowned). Encode is
 * write-the-session (queued). Cue is write a sheet. Overburn is
 * civic-burn. Finalize is disc-close. Walkers still want Beats to
 * isrc it, or “stamp shop ISRCs so BEATS 07 catalogs as pressed
 * without a shop pregap.” I will not isrc it. Still Sharpie. Still a
 * jewel case. Still for sale. Not pregap. Not atip. Not a shop. Not
 * stamper.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:isrc-listing-ids` is the client isrc set.
 * Cookie `iss-isrc-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write pregap, atip, stamper, encode, cue, overburn, upc,
 * ean, catalog, gift, buy, digital eligibility, or tote keys.
 * Host is `ysk-burned-cdr` only. Pack, mixtape, font, gift, zine,
 * and listings already owned by another overlay stay off. Fixture
 * `sold` / `file-gone` rows stay as they are.
 */
import {
  isGiftListing,
  isPhysicalListing,
  type Listing,
} from "@/lib/commerce";

export const ISRC_STORAGE_KEY = "iss:isrc-listing-ids";
export const ISRC_COOKIE_NAME = "iss-isrc-listing-ids";
export const ISRC_CHANGED_EVENT = "iss:isrc-changed";

export const ISRC_HOST_ID = "ysk-burned-cdr";
export const ISRC_PACK_ID = "dl-sample-pack";
export const ISRC_MIXTAPE_ID = "mdb-mixtape-93";
export const ISRC_FONT_ID = "dl-booth-font";
export const ISRC_CHAIR_ID = "ysk-folding-chair";
export const ISRC_GIFT_ID = "dl-mall-gift-card";
export const ISRC_ZINE_ID = "dl-stain-zine";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const ISRC_OWNED_IDS = [
  ISRC_PACK_ID,
  ISRC_MIXTAPE_ID,
  ISRC_FONT_ID,
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "gtk-game-boy",
  "ysk-wobbly-lamp",
  "kdr-bent-whisk",
  "kdr-chipped-mug",
  "kdr-lid-no-pot",
  "mdb-jewel-stack",
  "mdb-scratched-lp",
  "dl-junk-pricing-pdf",
  "dl-drawer-recipes",
  "dl-camera-luts",
  "dl-crate-side-a",
] as const;

export const ISRC_REFUSE_COPY = "That one does not take an isrc note.";
export const ISRC_TABLE_LINE = "I will not isrc it.";
export const ISRC_SHARPIE_LINE = "Still Sharpie.";
export const ISRC_JEWEL_LINE = "Still a jewel case.";
export const ISRC_NOTICE_TITLE =
  "I will not isrc it. Still Sharpie. Still a jewel case.";
export const ISRC_WALK_LINE =
  "Walkers still want Beats to isrc it, or stamp shop ISRCs so BEATS 07 catalogs as pressed without a shop pregap.";
export const ISRC_STAYS_LINE =
  "This is the isrc note. I will not isrc it. Still Sharpie. Still a jewel case.";
export const ISRC_STILL_LINE =
  "Still tote. Not pregap. Not atip. Not a shop. Not stamper.";
export const ISRC_TOTE_LINE = "Add to tote still works.";
export const ISRC_EMPTY_LINE = "Nobody taped an isrc note yet.";
export const ISRC_LEAVE_LINE = "Leave the burn";

const SERVER_STORE = Symbol.for("iss.isrc-listing-ids");

type ServerGlobal = typeof globalThis & {
  [SERVER_STORE]?: string[];
};

const emptyIds: string[] = [];

const ownedSet = new Set<string>(ISRC_OWNED_IDS);

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

export function parseIsrcListingIds(
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

export function isrcCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const ISRC_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${ISRC_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(ISRC_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(ISRC_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${ISRC_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseIsrcListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readIsrcListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(ISRC_STORAGE_KEY);
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
          window.localStorage.setItem(ISRC_STORAGE_KEY, JSON.stringify(ids));
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

export function writeIsrcListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = isrcCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(ISRC_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${ISRC_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(ISRC_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingIsrcOverlay(
  listingId: string,
  listingIds: readonly string[] = readIsrcListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === ISRC_PACK_ID;
}

function isMixtapeListing(listing: Listing) {
  return listing.id === ISRC_MIXTAPE_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === ISRC_FONT_ID;
}

function isChairListing(listing: Listing) {
  return listing.id === ISRC_CHAIR_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host disc only. Pack, mixtape, font, overlay-owned rows, digital, gift, sold, and file-gone stay off. */
export function canTapeIsrc(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== ISRC_HOST_ID) {
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

export type IsrcWriteReason =
  | "missing"
  | "digital"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "mixtape"
  | "font"
  | "chair"
  | "owned";

function refuseIsrc(listing: Listing | undefined): IsrcWriteReason | null {
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
    if (isPackListing(listing)) {
      return "pack";
    }
    if (isFontListing(listing)) {
      return "font";
    }
    return "digital";
  }
  if (isChairListing(listing)) {
    return "chair";
  }
  if (isMixtapeListing(listing)) {
    return "mixtape";
  }
  if (isOwnedListing(listing) || listing.id !== ISRC_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingIsrc(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseIsrc(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingIsrc(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseIsrc(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeIsrc(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === ISRC_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(ISRC_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ISRC_CHANGED_EVENT, listener);
  };
}
