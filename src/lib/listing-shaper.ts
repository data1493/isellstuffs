/**
 * I will not shaper them — the LUT pack stays three looks, still fluorescent.
 * Still tote.
 *
 * Cube is fourth-.cube. Grain is 16mm. Convert is Rec.709. Grade is
 * the look. Log is Rec.709-ready. Warm stays warm. Scope stays queued.
 * Walkers still want Half-Working to shaper them, or “1D the
 * parking-lot so warm sits.” I will not shaper them. Still three
 * looks. Still fluorescent. Still for sale. Not cube. Not grain.
 * Not a shop. Not convert. Not an account.
 *
 * Shape: JSON array of `Listing.id` strings from `@/lib/commerce`.
 * localStorage key `iss:shaper-listing-ids` is the client shaper set.
 * Cookie `iss-shaper-listing-ids` is the same JSON so PDPs SSR the notice.
 *
 * Cookie and storage are always `string[]`. Never a write-result
 * object — that literal 500s the PDP when `.includes` runs.
 *
 * Still baggable. Never rewrite `price`, `status`, or `cartEligible`.
 * Never write cube, grain, convert, grade, log, scope, profile,
 * warm, 1d, tetra, look-op, gift, buy, digital eligibility, or tote keys.
 * Host is `dl-camera-luts` only. Pack, font, Game Boy, gift, zine,
 * physical, and listings already owned by another overlay stay off.
 * Fixture `sold` / `file-gone` rows stay as they are.
 * Shaper is a 1D LUT tape, not a login. No auth.
 */
import {
  isDigitalListing,
  isGiftListing,
  type Listing,
} from "@/lib/commerce";

export const SHAPER_STORAGE_KEY = "iss:shaper-listing-ids";
export const SHAPER_COOKIE_NAME = "iss-shaper-listing-ids";
export const SHAPER_CHANGED_EVENT = "iss:shaper-changed";

export const SHAPER_HOST_ID = "dl-camera-luts";
export const SHAPER_PACK_ID = "dl-sample-pack";
export const SHAPER_FONT_ID = "dl-booth-font";
export const SHAPER_BOY_ID = "gtk-game-boy";
export const SHAPER_PDF_ID = "dl-junk-pricing-pdf";
export const SHAPER_GIFT_ID = "dl-mall-gift-card";
export const SHAPER_ZINE_ID = "dl-stain-zine";
export const SHAPER_CHAIR_ID = "ysk-folding-chair";

/** Exclusive hosts of other listing overlays — stay off this cookie. */
export const SHAPER_OWNED_IDS = [
  SHAPER_PACK_ID,
  SHAPER_FONT_ID,
  SHAPER_BOY_ID,
  SHAPER_PDF_ID,
  "dl-drawer-recipes",
  "dl-crate-side-a",
  "mdb-jewel-stack",
  "mdb-mixtape-93",
  "mdb-scratched-lp",
  "ysk-burned-cdr",
  "ysk-wobbly-lamp",
  "clo-windbreaker",
  "clo-split-soles",
  "gtk-cable-drawer",
  "kdr-chipped-mug",
  "kdr-bent-whisk",
  "kdr-lid-no-pot",
] as const;

const ownedSet = new Set<string>(SHAPER_OWNED_IDS);

export const SHAPER_REFUSE_COPY = "That one does not take a shaper note.";
export const SHAPER_TABLE_LINE = "I will not shaper them.";
export const SHAPER_LOOKS_LINE = "Still three looks.";
export const SHAPER_FLUORO_LINE = "Still fluorescent.";
export const SHAPER_NOTICE_TITLE =
  "I will not shaper them. Still three looks. Still fluorescent.";
export const SHAPER_WALK_LINE =
  "Walkers still want Half-Working to shaper them, or 1D the parking-lot so warm sits.";
export const SHAPER_STAYS_LINE =
  "This is the shaper note. I will not shaper them. Still three looks. Still fluorescent.";
export const SHAPER_STILL_LINE =
  "Still tote. Not cube. Not grain. Not a shop. Not convert. Not an account.";
export const SHAPER_TOTE_LINE = "Add to tote still works.";
export const SHAPER_EMPTY_LINE = "Nobody taped a shaper note yet.";
export const SHAPER_LEAVE_LINE = "Leave the looks";

const SERVER_STORE = Symbol.for("iss.shaper-listing-ids");

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

export function parseShaperListingIds(
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

export function shaperCookieValue(listingIds: readonly string[]): string {
  return JSON.stringify(uniqueListingIds(listingIds));
}

export const SHAPER_MIRROR_SCRIPT = `try{var m=document.cookie.match(/(?:^|; )${SHAPER_COOKIE_NAME}=([^;]*)/);if(m){var v=decodeURIComponent(m[1]);if(Array.isArray(JSON.parse(v))){localStorage.setItem(${JSON.stringify(SHAPER_STORAGE_KEY)},v);window.dispatchEvent(new Event(${JSON.stringify(SHAPER_CHANGED_EVENT)}));}}}catch(e){}`;

function readCookieRaw(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  const parts = document.cookie.split("; ");
  const prefix = `${SHAPER_COOKIE_NAME}=`;
  const hit = parts.find((part) => part.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

function snapshotFromRaw(raw: string | null) {
  if (raw === cachedRaw) {
    return cachedIds;
  }
  cachedRaw = raw;
  cachedIds = parseShaperListingIds(raw);
  return cachedIds;
}

function serverStore(): string[] {
  const g = globalThis as ServerGlobal;
  return g[SERVER_STORE] ?? emptyIds;
}

export function readShaperListingIds(): string[] {
  if (canUseStorage()) {
    const fromStorage = window.localStorage.getItem(SHAPER_STORAGE_KEY);
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
          window.localStorage.setItem(SHAPER_STORAGE_KEY, JSON.stringify(ids));
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

export function writeShaperListingIds(listingIds: string[]) {
  const next = uniqueListingIds(listingIds);
  const raw = shaperCookieValue(next);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(SHAPER_STORAGE_KEY, raw);
    } catch {
      // blocked storage
    }
    try {
      document.cookie = `${SHAPER_COOKIE_NAME}=${encodeURIComponent(raw)}; Path=/; Max-Age=2592000; SameSite=Lax`;
    } catch {
      // blocked cookies
    }
    cachedRaw = raw;
    cachedIds = next;
    window.dispatchEvent(new Event(SHAPER_CHANGED_EVENT));
    return;
  }

  const g = globalThis as ServerGlobal;
  g[SERVER_STORE] = next;
  cachedRaw = raw;
  cachedIds = next;
}

export function isListingShaperOverlay(
  listingId: string,
  listingIds: readonly string[] = readShaperListingIds(),
) {
  if (!Array.isArray(listingIds)) {
    return false;
  }
  return listingIds.includes(listingId);
}

function isPackListing(listing: Listing) {
  return listing.id === SHAPER_PACK_ID;
}

function isFontListing(listing: Listing) {
  return listing.id === SHAPER_FONT_ID;
}

function isPdfListing(listing: Listing) {
  return listing.id === SHAPER_PDF_ID;
}

function isOwnedListing(listing: Listing) {
  return ownedSet.has(listing.id);
}

/** Host LUT pack only. Overlay-owned rows, physical, gift, sold, and file-gone stay off. */
export function canTapeShaper(
  listing: Listing | undefined,
): listing is Listing {
  if (!listing) {
    return false;
  }
  if (listing.id !== SHAPER_HOST_ID) {
    return false;
  }
  if (!isDigitalListing(listing)) {
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

export type ShaperWriteReason =
  | "missing"
  | "physical"
  | "gift"
  | "sold"
  | "file-gone"
  | "pack"
  | "font"
  | "pdf"
  | "owned";

function refuseShaper(
  listing: Listing | undefined,
): ShaperWriteReason | null {
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
  if (!isDigitalListing(listing)) {
    return "physical";
  }
  if (isPackListing(listing)) {
    return "pack";
  }
  if (isFontListing(listing)) {
    return "font";
  }
  if (isPdfListing(listing)) {
    return "pdf";
  }
  if (isOwnedListing(listing) || listing.id !== SHAPER_HOST_ID) {
    return "owned";
  }
  return null;
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function markListingShaper(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseShaper(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (listingIds.includes(taped.id)) {
    return listingIds;
  }
  return [...listingIds, taped.id];
}

/** Returns the next string[] cookie, or null when the row is refused. */
export function clearListingShaper(
  listing: Listing | undefined,
  listingIds: string[],
): string[] | null {
  if (refuseShaper(listing)) {
    return null;
  }
  const taped = listing as Listing;
  if (!listingIds.includes(taped.id)) {
    return listingIds;
  }
  return listingIds.filter((id) => id !== taped.id);
}

export function subscribeShaper(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === SHAPER_STORAGE_KEY || event.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(SHAPER_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SHAPER_CHANGED_EVENT, listener);
  };
}
